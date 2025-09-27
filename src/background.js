// Sentry configuration for background script
import * as Sentry from '@sentry/browser'

const isDevelopment = process.env.NODE_ENV === 'development'

// DSN для разных окружений
const SENTRY_CONFIG = {
    development: {
        dsn: 'https://f1f1f02a937d43fb8614817b41a39548@o4509418472013824.ingest.de.sentry.io/4509418553737296'
    },
    production: {
        dsn: 'https://60e8910dfee6a7acf440d149a9cf3292@o4509418472013824.ingest.de.sentry.io/4509418477518928'
    }
}

// Получаем версию расширения из manifest
const getExtensionVersion = () => {
    try {
        return chrome.runtime.getManifest().version
    } catch (error) {
        console.warn('Could not get extension version:', error)
        return 'unknown'
    }
}

// Initialize Sentry for background script
const config = isDevelopment ? SENTRY_CONFIG.development : SENTRY_CONFIG.production
const extensionVersion = getExtensionVersion()

Sentry.init({
    dsn: config.dsn,
    environment: isDevelopment ? 'development' : 'production',

    // Релиз - версия расширения
    release: `faceit-csgo-extension@${extensionVersion}`,

    beforeSend(event, hint) {
        // В development отправляем все ошибки для отладки
        if (isDevelopment) {
            console.log('Sentry event (dev mode - background):', event)
            return event // Отправляем в dev проект
        }
        return event
    },
    initialScope: {
        tags: {
            component: 'background-script',
            platform: 'faceit-csgo',
            environment: isDevelopment ? 'dev' : 'prod',
            extension_version: extensionVersion,
            manifest_version: '3'
        }
    },
    maxBreadcrumbs: isDevelopment ? 50 : 30, // Больше breadcrumbs в dev
    attachStacktrace: true,
    autoSessionTracking: false
})

console.log(`🔧 Background Sentry initialized for extension v${extensionVersion} (${isDevelopment ? 'dev' : 'prod'})`)

// Error handling for background script
function logBackgroundError(error, context = {}) {
    Sentry.withScope((scope) => {
        scope.setTag('error_type', 'background_error')
        scope.setContext('background_context', context)
        scope.setLevel('error')
        Sentry.captureException(error)
    })
}

// Global error handler for background script
self.addEventListener('error', event => {
    logBackgroundError(event.error || new Error(event.message), {
        context: 'background_global_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    })
    console.error('Background script error:', event.error || event.message)
})

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', event => {
    logBackgroundError(new Error(event.reason), {
        context: 'background_promise_rejection',
        reason: event.reason
    })
    console.error('Background script unhandled promise rejection:', event.reason)
})

// Manifest V3 service worker
console.log('🔧 Background script loaded')

// Message listener for popup communication (только основная функциональность)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Received message:', message)

    try {
        if (message.type === 'ping') {
            console.log('📡 Ping received, sending response')
            sendResponse({ status: 'alive' })
        }

        // Здесь можно добавить другую логику для сообщений
        // Но логирование в Sentry popup делает сам

    } catch (error) {
        logBackgroundError(error, {
            context: 'message_handler_error',
            message: message
        })
        console.error('Error handling message:', error)
    }

    return true // Keep message channel open for async response
})

// Handle persistent connections from extension pages (e.g., popup hot-reload)
chrome.runtime.onConnect.addListener((port) => {
    try {
        if (port && port.name === 'popup-hot-reload') {
            console.log('🔌 Popup connected for hot reload')

            port.onDisconnect.addListener(() => {
                console.log('🔌 Popup disconnected')
            })
        }
    } catch (error) {
        logBackgroundError(error, {
            context: 'onConnect_handler',
            portName: port && port.name
        })
    }
})

// Extension lifecycle events
chrome.runtime.onInstalled.addListener((details) => {
    try {
        console.log('🚀 Extension installed/updated:', details.reason)

        Sentry.addBreadcrumb({
            message: `Extension ${details.reason}`,
            category: 'lifecycle',
            level: 'info',
            data: { reason: details.reason, version: chrome.runtime.getManifest().version }
        })
    } catch (error) {
        logBackgroundError(error, {
            context: 'installation_handler',
            details
        })
    }
})

chrome.runtime.onStartup.addListener(() => {
    try {
        console.log('🔄 Extension startup')

        Sentry.addBreadcrumb({
            message: 'Extension startup',
            category: 'lifecycle',
            level: 'info'
        })
    } catch (error) {
        logBackgroundError(error, {
            context: 'startup_handler'
        })
    }
})

console.log('✅ Background script ready')