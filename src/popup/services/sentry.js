import * as Sentry from '@sentry/vue'
import browser from 'webextension-polyfill'

/**
 * Конфигурация и инициализация Sentry для браузерного расширения
 */

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

// Инициализация Sentry
export function initSentry(Vue) {
    const config = isDevelopment ? SENTRY_CONFIG.development : SENTRY_CONFIG.production
    const extensionVersion = getExtensionVersion()

    Sentry.init({
        // DSN (Data Source Name) - уникальный для каждого проекта в Sentry
        // Development: f1f1f02a937d43fb8614817b41a39548 / 4509418553737296
        // Production:  60e8910dfee6a7acf440d149a9cf3292 / 4509418477518928
        dsn: config.dsn,

        // Для Vue 2 используем прямую передачу Vue экземпляра
        Vue: Vue,

        // Релиз - версия расширения
        release: `faceit-csgo-extension@${extensionVersion}`,

        // Настройки производительности
        tracesSampleRate: isDevelopment ? 1.0 : 0.1,

        // Фильтрация ошибок
        beforeSend(event, hint) {
            // В development отправляем все ошибки для отладки
            if (isDevelopment) {
                console.log('Sentry event (dev mode):', event)
                return event // Отправляем в dev проект
            }

            // В production фильтруем некритичные ошибки
            const error = hint.originalException

            // Игнорируем network ошибки от внешних сервисов
            if (error && error.message && error.message.includes('CORS')) {
                return null
            }

            // Игнорируем ошибки расширения Chrome
            if (error && error.message && error.message.includes('Extension context invalidated')) {
                return null
            }

            return event
        },

        // Настройки окружения
        environment: isDevelopment ? 'development' : 'production',

        // Дополнительные данные
        initialScope: {
            tags: {
                component: 'browser-extension',
                platform: 'faceit-csgo',
                environment: isDevelopment ? 'dev' : 'prod',
                extension_version: extensionVersion,
                manifest_version: '3'
            }
        },

        // Настройки для браузерного расширения
        tunnel: undefined, // Отключаем tunnel для расширений

        // Ограничения
        maxBreadcrumbs: isDevelopment ? 100 : 50, // Больше breadcrumbs в dev
        attachStacktrace: true,

        // Настройки сессий
        autoSessionTracking: false
    })

    // Логируем инициализацию с версией
    console.log(`🔧 Sentry initialized for extension v${extensionVersion} (${isDevelopment ? 'dev' : 'prod'})`)

    // Настройка пользователя (если есть сохраненный никнейм)
    try {
        browser.storage.local.get(['nickname']).then(result => {
            if (result.nickname) {
                Sentry.setUser({
                    username: result.nickname
                })
            }
        })
    } catch (error) {
        console.warn('Could not set Sentry user:', error)
    }
}

/**
 * Логирование ошибок API
 */
export function logApiError(error, context = {}) {
    Sentry.withScope((scope) => {
        scope.setTag('error_type', 'api_error')
        scope.setContext('api_context', context)
        scope.setLevel('error')

        Sentry.captureException(error)
    })
}

/**
 * Логирование пользовательских действий
 */
export function logUserAction(action, data = {}) {
    Sentry.addBreadcrumb({
        message: action,
        category: 'user_action',
        level: 'info',
        data
    })
}

/**
 * Логирование состояния приложения
 */
export function logAppState(state, data = {}) {
    Sentry.addBreadcrumb({
        message: `App state: ${state}`,
        category: 'app_state',
        level: 'info',
        data
    })
}

/**
 * Установка пользователя
 */
export function setSentryUser(nickname) {
    Sentry.setUser({
        username: nickname
    })
}

/**
 * Очистка пользователя
 */
export function clearSentryUser() {
    Sentry.setUser(null)
}

/**
 * Логирование критических ошибок
 */
export function logCriticalError(error, context = {}) {
    Sentry.withScope((scope) => {
        scope.setTag('error_type', 'critical')
        scope.setContext('critical_context', context)
        scope.setLevel('fatal')

        Sentry.captureException(error)
    })
}

/**
 * Логирование warning
 */
export function logWarning(message, data = {}) {
    Sentry.withScope((scope) => {
        scope.setTag('warning_type', 'app_warning')
        scope.setContext('warning_context', data)
        scope.setLevel('warning')

        Sentry.captureMessage(message)
    })
}

export default {
    initSentry,
    logApiError,
    logUserAction,
    logAppState,
    setSentryUser,
    clearSentryUser,
    logCriticalError,
    logWarning
}