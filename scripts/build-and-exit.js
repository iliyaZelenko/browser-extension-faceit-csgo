#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting production build...');

const BUNDLE_DIR = path.join(__dirname, '../dist');
const bundles = [
    'background.js',
    'popup/popup.js',
    'options/options.js',
];

const evalRegexForProduction = /;([a-z])=function\(\){return this}\(\);try{\1=\1\|\|Function\("return this"\)\(\)\|\|\(0,eval\)\("this"\)}catch\(t\){"object"==typeof window&&\(\1=window\)}/g;

const removeEvals = async(file) => {
    console.info(`Removing eval() from ${file}`);

    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const regex = evalRegexForProduction;

            if (!regex.test(data)) {
                console.info(`No CSP specific code found in ${file}.`);
                resolve();
                return;
            }

            data = data.replace(regex, '=window;');

            fs.writeFile(file, data, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    });
};

const runPostBuildScripts = async() => {
    try {
        await Promise.all(
            bundles.map(async(bundle) => {
                const file = path.join(BUNDLE_DIR, bundle);
                try {
                    await removeEvals(file);
                    console.info(`Bundle ${bundle}: OK`);
                } catch (error) {
                    console.error(`Bundle ${bundle}: ${error}`);
                }
            })
        );
        console.info('All bundles processed successfully');
        return true;
    } catch (error) {
        console.error('Error processing bundles:', error);
        return false;
    }
};

const webpackPath = path.resolve(__dirname, '../node_modules/.bin/webpack');
const env = Object.assign({}, process.env, {
    NODE_ENV: 'production',
    NODE_OPTIONS: '--openssl-legacy-provider'
});

const webpackProcess = spawn('node', [webpackPath, '--hide-modules', '--no-watch'], {
    cwd: path.resolve(__dirname, '..'),
    env: env,
    stdio: 'inherit'
});

let hasExited = false;

webpackProcess.on('close', async(code) => {
    if (hasExited) return;
    hasExited = true;

    console.log(`\n✅ Webpack build finished with code ${code}`);

    if (code === 0) {
        console.log('🎉 Build completed successfully!');

        // Запускаем post-build скрипт
        console.log('🔧 Running post-build scripts...');

        const success = await runPostBuildScripts();

        console.log('👋 Build process completed. Exiting...');

        // Принудительное завершение через очень короткое время
        setImmediate(() => {
            process.exit(success ? 0 : 1);
        });
    } else {
        console.error('❌ Build failed!');
        setImmediate(() => {
            process.exit(code);
        });
    }
});

webpackProcess.on('error', (err) => {
    if (hasExited) return;
    hasExited = true;

    console.error('❌ Failed to start webpack:', err);
    process.exit(1);
});

// Обработка сигналов завершения
process.on('SIGINT', () => {
    if (hasExited) return;
    hasExited = true;

    console.log('\n🛑 Build interrupted');
    webpackProcess.kill('SIGINT');
    process.exit(130);
});

process.on('SIGTERM', () => {
    if (hasExited) return;
    hasExited = true;

    console.log('\n🛑 Build terminated');
    webpackProcess.kill('SIGTERM');
    process.exit(143);
});

// Fallback timeout - принудительное завершение через 60 секунд
setTimeout(() => {
    if (hasExited) return;
    hasExited = true;

    console.log('\n⏰ Build timeout - forcing exit');
    webpackProcess.kill('SIGKILL');
    process.exit(124);
}, 60000);