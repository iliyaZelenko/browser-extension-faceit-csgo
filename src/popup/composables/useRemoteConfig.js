import { ref, computed, onMounted, reactive } from '@vue/composition-api'
import remoteConfig from '../services/remoteConfig.js'

// Реактивное состояние для всего приложения
const isInitialized = ref(false)
const isLoading = ref(false)
const error = ref(null)
const lastFetchTime = ref(0)

// Кеш для реактивных значений
const configCache = reactive({})

export function useRemoteConfig() {
    /**
     * Инициализирует Remote Config
     */
    const initialize = async() => {
        if (isInitialized.value) return true

        isLoading.value = true
        error.value = null

        try {
            await remoteConfig.initialize()
            await remoteConfig.fetchConfig()
            isInitialized.value = true
            lastFetchTime.value = Date.now()
            return true
        } catch (err) {
            error.value = err.message
            console.error('Failed to initialize Remote Config:', err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Обновляет конфигурацию с сервера
     */
    const refresh = async() => {
        if (!isInitialized.value) {
            return await initialize()
        }

        isLoading.value = true
        error.value = null

        try {
            await remoteConfig.fetchConfig()
            lastFetchTime.value = Date.now()
                // Очищаем кеш чтобы значения обновились
            Object.keys(configCache).forEach(key => {
                delete configCache[key]
            })
            return true
        } catch (err) {
            error.value = err.message
            console.error('Failed to refresh Remote Config:', err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Получает строковое значение
     */
    const getString = (key, defaultValue = '') => {
        if (configCache[key] === undefined) {
            configCache[key] = remoteConfig.getString(key, defaultValue)
        }
        return computed(() => configCache[key] || remoteConfig.getString(key, defaultValue))
    }

    /**
     * Получает булево значение
     */
    const getBoolean = (key, defaultValue = false) => {
        const cacheKey = `bool_${key}`
        if (configCache[cacheKey] === undefined) {
            configCache[cacheKey] = remoteConfig.getBoolean(key, defaultValue)
        }
        return computed(() => {
            const cachedValue = configCache[cacheKey]
            return cachedValue !== undefined ? cachedValue : remoteConfig.getBoolean(key, defaultValue)
        })
    }

    /**
     * Получает числовое значение
     */
    const getNumber = (key, defaultValue = 0) => {
        const cacheKey = `num_${key}`
        if (configCache[cacheKey] === undefined) {
            configCache[cacheKey] = remoteConfig.getNumber(key, defaultValue)
        }
        return computed(() => {
            const cachedValue = configCache[cacheKey]
            return cachedValue !== undefined ? cachedValue : remoteConfig.getNumber(key, defaultValue)
        })
    }

    /**
     * Получает JSON объект
     */
    const getJSON = (key, defaultValue = {}) => {
        const cacheKey = `json_${key}`
        if (configCache[cacheKey] === undefined) {
            configCache[cacheKey] = remoteConfig.getJSON(key, defaultValue)
        }
        return computed(() => configCache[cacheKey] || remoteConfig.getJSON(key, defaultValue))
    }

    /**
     * Проверяет включена ли функция
     */
    const isFeatureEnabled = (featureName) => {
        return getBoolean(`enable_${featureName}`, false)
    }

    /**
     * Получает UI конфигурацию
     */
    const uiConfig = computed(() => remoteConfig.getUIConfig())

    /**
     * Получает API конфигурацию
     */
    const apiConfig = computed(() => remoteConfig.getAPIConfig())

    /**
     * Получает информацию о версии
     */
    const versionInfo = computed(() => remoteConfig.getVersionInfo())

    /**
     * Проверяет нужно ли принудительное обновление
     */
    const shouldForceUpdate = (currentVersion) => {
        return remoteConfig.shouldForceUpdate(currentVersion)
    }

    /**
     * Получает все значения для отладки
     */
    const getAllValues = () => {
        return remoteConfig.getAllValues()
    }

    /**
     * Статус состояния
     */
    const status = computed(() => ({
        isInitialized: isInitialized.value,
        isLoading: isLoading.value,
        error: error.value,
        lastFetchTime: lastFetchTime.value
    }))

    return {
        // Методы
        initialize,
        refresh,
        getString,
        getBoolean,
        getNumber,
        getJSON,
        isFeatureEnabled,
        shouldForceUpdate,
        getAllValues,

        // Вычисляемые свойства
        uiConfig,
        apiConfig,
        versionInfo,
        status,

        // Состояние
        isInitialized,
        isLoading,
        error
    }
}

// Дополнительный композабл для конкретных функций
// export function useFeatureFlags() {
//     const { isFeatureEnabled } = useRemoteConfig()

//     return {
//         // Основные функции
//         newStatsView: isFeatureEnabled('new_stats_view'),
//         matchPredictions: isFeatureEnabled('match_predictions'),
//         premiumFeatures: isFeatureEnabled('premium_features'),
//         analytics: isFeatureEnabled('analytics'),
//         sentryLogging: isFeatureEnabled('sentry_logging'),

//         // Эксперименты
//         matchInsights: isFeatureEnabled('experiment_match_insights'),
//         playerComparison: isFeatureEnabled('experiment_player_comparison')
//     }
// }

// Композабл для рекламных баннеров
// export function useAdvertisement() {
//     const { uiConfig, getString } = useRemoteConfig()

//     return {
//         adImageSrc: computed(() => getString('ad_img_src', '').value),
//         adImageHeight: computed(() => getString('ad_img_height', 60).value),
//         adImageWidth: computed(() => getString('ad_img_width', 300).value),
//         adImageHref: computed(() => getString('ad_img_href', '').value),
//         hasAdvertisement: computed(() => getBoolean('ad_enabled', false).value),
//         // Полная конфигурация рекламы
//         config: uiConfig
//     }
// }

// Композабл для сообщений и уведомлений
// export function useAppMessages() {
//     const { getString } = useRemoteConfig()

//     return {
//         welcomeMessage: getString('welcome_message', 'Добро пожаловать в Faceit Stats!'),
//         announcementText: getString('announcement_text', ''),
//         maintenanceMessage: getString('maintenance_message', ''),

//         // Проверяет есть ли активное объявление
//         hasAnnouncement: computed(() => {
//             const text = getString('announcement_text', '').value
//             return text && text.trim().length > 0
//         }),

//         // Проверяет режим обслуживания
//         isMaintenanceMode: computed(() => {
//             const message = getString('maintenance_message', '').value
//             return message && message.trim().length > 0
//         })
//     }
// }