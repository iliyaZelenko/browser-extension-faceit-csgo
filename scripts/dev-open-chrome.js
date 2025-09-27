#!/usr/bin/env node

const path = require('path')
const { execSync, spawn } = require('child_process')

function detectChrome() {
    const platform = process.platform
    const candidates = []
    if (platform === 'darwin') {
        candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        candidates.push('/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta')
        candidates.push('/Applications/Chromium.app/Contents/MacOS/Chromium')
    } else if (platform === 'win32') {
        candidates.push(process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\chrome.exe')
        candidates.push(process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe')
        candidates.push(process.env['LOCALAPPDATA'] + '\\Google\\Chrome\\Application\\chrome.exe')
    } else {
        candidates.push('/usr/bin/google-chrome')
        candidates.push('/usr/bin/chromium')
        candidates.push('/usr/bin/chromium-browser')
    }
    for (const p of candidates) {
        try {
            if (!p) continue
            execSync(`test -x "${p}" || exit 1`, { stdio: 'ignore', shell: '/bin/bash' })
            return p
        } catch (_) {}
    }
    throw new Error('Не найден исполняемый файл Chrome/Chromium. Установите браузер или укажите путь в CHROME_BIN.')
}

async function main() {
    const root = path.resolve(__dirname, '..')
    const dist = path.join(root, 'dist')

    // 1) Dev сборка (с HMR, если нужно) — здесь делаем обычную dev build без watch
    console.log('🔧 Building development bundle...')
        // Используем уже настроенный npm-скрипт, чтобы не зависеть от глобальных cross-env
    execSync('npm run build:dev', { stdio: 'inherit', cwd: root, shell: '/bin/bash' })

    // 2) Открываем Chrome с загруженным unpacked-расширением из dist
    const chromeBin = process.env.CHROME_BIN || detectChrome()
    console.log(`🚀 Launching Chrome: ${chromeBin}`)

    const userDataDir = path.join(root, '.chrome-dev-profile')
    const args = [
        `--disable-extensions-except=${dist}`,
        `--load-extension=${dist}`,
        '--no-first-run',
        '--disable-default-apps',
        '--disable-sync',
        '--allow-insecure-localhost',
        `--user-data-dir=${userDataDir}`,
    ]

    const child = spawn(chromeBin, args, { stdio: 'inherit' })
    child.on('exit', (code) => {
        console.log(`Chrome exited with code ${code}`)
        process.exit(code || 0)
    })
}

main().catch((e) => {
    console.error('Failed to open Chrome with extension:', e)
    process.exit(1)
})