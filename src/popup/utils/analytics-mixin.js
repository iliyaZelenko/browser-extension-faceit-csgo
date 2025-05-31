/**
 * Миксин для упрощения работы с Google Analytics
 * Добавляет удобные методы для отслеживания событий
 */
export default {
    methods: {
        /**
         * Отслеживание клика по кнопке
         * @param {string} buttonName - название кнопки
         * @param {object} extraData - дополнительные данные
         */
        trackButtonClick(buttonName, extraData = {}) {
            this.$analytics.trackEvent('button_click', {
                button_name: buttonName,
                component: this.$options.name || 'unknown',
                ...extraData
            })
        },

        /**
         * Отслеживание пользовательского взаимодействия
         * @param {string} action - действие пользователя
         * @param {object} extraData - дополнительные данные
         */
        trackUserAction(action, extraData = {}) {
            this.$analytics.trackEvent('user_action', {
                action: action,
                component: this.$options.name || 'unknown',
                ...extraData
            })
        },

        /**
         * Отслеживание загрузки данных
         * @param {string} dataType - тип загружаемых данных
         * @param {number} loadTime - время загрузки в мс
         * @param {boolean} success - успешность загрузки
         */
        trackDataLoad(dataType, loadTime, success = true) {
            this.$analytics.trackEvent('data_load', {
                data_type: dataType,
                load_time: loadTime,
                success: success,
                component: this.$options.name || 'unknown'
            })

            if (loadTime) {
                this.$analytics.trackTiming(`${dataType}_load_time`, loadTime)
            }
        },

        /**
         * Отслеживание ошибок компонента
         * @param {string} errorType - тип ошибки
         * @param {string} errorMessage - сообщение об ошибке
         * @param {boolean} fatal - критическая ошибка или нет
         */
        trackComponentError(errorType, errorMessage, fatal = false) {
            this.$analytics.trackError(`${errorType}: ${errorMessage}`, fatal)

            this.$analytics.trackEvent('component_error', {
                error_type: errorType,
                error_message: errorMessage,
                component: this.$options.name || 'unknown',
                fatal: fatal
            })
        },

        /**
         * Отслеживание времени работы с компонентом
         * @param {number} startTime - время начала работы
         */
        trackComponentTime(startTime) {
            const timeSpent = Date.now() - startTime
            this.$analytics.trackTiming(`${this.$options.name || 'unknown'}_usage_time`, timeSpent)

            this.$analytics.trackEvent('component_usage_time', {
                component: this.$options.name || 'unknown',
                time_spent: timeSpent
            })
        },

        /**
         * Отслеживание настроек пользователя
         * @param {string} settingName - название настройки
         * @param {any} settingValue - значение настройки
         */
        trackUserSetting(settingName, settingValue) {
            this.$analytics.trackEvent('user_setting', {
                setting_name: settingName,
                setting_value: String(settingValue),
                component: this.$options.name || 'unknown'
            })
        },

        /**
         * Отслеживание поиска
         * @param {string} searchQuery - поисковый запрос
         * @param {number} resultsCount - количество результатов
         */
        trackSearch(searchQuery, resultsCount = 0) {
            this.$analytics.trackEvent('search', {
                search_query: searchQuery.toLowerCase(),
                results_count: resultsCount,
                component: this.$options.name || 'unknown'
            })
        }
    }
}