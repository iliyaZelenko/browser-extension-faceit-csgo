// Hot reload script for popup development
console.log('🔄 POPUP LOADED - Dev mode script starting...')

let reloadInterval
let lastPingTime = Date.now()
let port = null

function startAutoReload() {
    console.log('🔄 Auto-reload function started')

    // Test chrome.runtime availability
    if (typeof chrome === 'undefined') {
        console.error('❌ Chrome API not available!')
        return
    }

    if (!chrome.runtime) {
        console.error('❌ chrome.runtime not available!')
        return
    }

    console.log('✅ Chrome API available, setting up connection...')

    // Подключаемся к background для получения hot reload сообщений
    try {
        port = chrome.runtime.connect({ name: 'popup-hot-reload' })

        port.onMessage.addListener((message) => {
            if (message.type === 'reload') {
                console.log('🔄 Received reload signal from background, refreshing popup...')
                window.location.reload()
            }
        })

        port.onDisconnect.addListener(() => {
            // Access lastError to suppress "Unchecked runtime.lastError" noise when background isn't connected
            if (chrome && chrome.runtime && chrome.runtime.lastError) {
                void chrome.runtime.lastError
            }
            console.log('🔌 Port disconnected')
            port = null
        })

        console.log('🔌 Connected to background for hot reload')
    } catch (error) {
        console.error('❌ Failed to connect to background:', error)
    }

    // Простой ping каждые 3 секунды для проверки что extension жив
    reloadInterval = setInterval(() => {
            try {
                chrome.runtime.sendMessage({ type: 'ping' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('🔄 Extension reloaded! Refreshing popup...')
                        window.location.reload()
                    } else {
                        // console.log('✅ Ping OK:', response);
                        lastPingTime = Date.now()
                    }
                })
            } catch (error) {
                console.log('🔄 Ping error, reloading...', error)
                window.location.reload()
            }
        }, 3000) // Увеличиваем интервал до 3 секунд
}

// Start immediately
startAutoReload()

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (reloadInterval) {
        clearInterval(reloadInterval)
        console.log('🔄 Auto-reload stopped')
    }
    if (port) {
        port.disconnect()
        console.log('🔌 Port disconnected on unload')
    }
})