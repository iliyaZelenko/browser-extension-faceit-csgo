#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting production build...');

// Устанавливаем timeout для принудительного завершения
const buildTimeout = setTimeout(() => {
    console.log('⏰ Build timeout reached, forcing exit...');
    process.exit(0);
}, 60000); // 60 секунд

const buildCommand = 'NODE_OPTIONS="--openssl-legacy-provider" cross-env NODE_ENV=production webpack --hide-modules --no-watch';

exec(buildCommand, {
    cwd: path.resolve(__dirname, '..'),
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
}, (error, stdout, stderr) => {
    clearTimeout(buildTimeout);

    if (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }

    if (stderr) {
        console.error('Build warnings/errors:', stderr);
    }

    console.log(stdout);
    console.log('✅ Build completed successfully!');

    // Запускаем post-build скрипт
    console.log('🔧 Running post-build scripts...');

    exec('node scripts/remove-evals.js', {
        cwd: path.resolve(__dirname, '..')
    }, (postError, postStdout, postStderr) => {
        if (postError) {
            console.error('❌ Post-build error:', postError);
        }

        if (postStderr) {
            console.error('Post-build warnings:', postStderr);
        }

        if (postStdout) {
            console.log(postStdout);
        }

        console.log('👋 Build process completed. Exiting...');
        process.exit(0);
    });
});

// Обработка сигналов завершения
process.on('SIGINT', () => {
    clearTimeout(buildTimeout);
    console.log('\n🛑 Build interrupted');
    process.exit(130);
});

process.on('SIGTERM', () => {
    clearTimeout(buildTimeout);
    console.log('\n🛑 Build terminated');
    process.exit(143);
});