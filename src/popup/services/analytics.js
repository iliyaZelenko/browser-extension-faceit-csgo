const isDevelopment = process.env.NODE_ENV === 'development'

class AnalyticsService {
    constructor() {
        this.initialized = false
            // GA4 configuration (Measurement Protocol v2)
        this.ga4MeasurementId = null
        this.ga4ApiSecret = null
            // Backward compat: legacy field name we previously used (will be replaced)
        this.measurementId = 'G-YFV8YK7FVQ'

        this.sessionId = this.generateSessionId()
        this.clientId = this.getOrCreateClientId()
        this.init()
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }

    getOrCreateClientId() {
        // Получаем или создаем уникальный ID клиента
        let clientId = localStorage.getItem('ga_client_id')
        if (!clientId) {
            clientId = Math.random().toString(36).substring(2, 15) + '.' + Math.random().toString(36).substring(2, 15)
            localStorage.setItem('ga_client_id', clientId)
        }
        return clientId
    }

    async init() {
        try {
            // Load GA4 config from storage (preferred)
            try {
                if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                    const { ga4_measurement_id, ga4_api_secret } = await browser.storage.local.get(['ga4_measurement_id', 'ga4_api_secret'])
                    if (ga4_measurement_id) this.ga4MeasurementId = ga4_measurement_id
                    if (ga4_api_secret) this.ga4ApiSecret = ga4_api_secret
                }
            } catch (_) {}

            // Enforce desired GA4 measurement id
            const desiredMeasurementId = 'G-YFV8YK7FVQ'
            if (!this.ga4MeasurementId || this.ga4MeasurementId !== desiredMeasurementId) {
                this.ga4MeasurementId = desiredMeasurementId
            }
            if (!this.ga4ApiSecret) {
                // Установим предоставленный секрет по умолчанию, если его нет в storage
                this.ga4ApiSecret = 'G-0PQ4BGM7CT'
            }

            // Persist config back to storage for future sessions
            try {
                if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                    await browser.storage.local.set({
                        ga4_measurement_id: this.ga4MeasurementId,
                        ga4_api_secret: this.ga4ApiSecret
                    })
                }
            } catch (_) {}

            // Initialize
            this.initialized = true
            console.log('Google Analytics (GA4) initialized with Measurement Protocol v2', {
                measurementId: this.ga4MeasurementId,
                hasApiSecret: Boolean(this.ga4ApiSecret)
            })

            // Send startup event
            let version = 'unknown'
            try {
                if (typeof browser !== 'undefined' && browser.runtime && typeof browser.runtime.getManifest === 'function') {
                    version = browser.runtime.getManifest().version || version
                } else if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getManifest === 'function') {
                    version = chrome.runtime.getManifest().version || version
                }
            } catch (_) {}

            await this.trackEvent('extension_started', { version, session_id: this.sessionId })
        } catch (error) {
            console.error('Failed to initialize Google Analytics:', error)
        }
    }

    /**
     * Отслеживание событий
     * @param {string} eventName - название события
     * @param {object} parameters - параметры события
     */
    async trackEvent(eventName, parameters = {}) {
        if (!this.initialized) {
            console.warn('Analytics not initialized yet')
            return
        }

        try {
            await this.sendEventViaGA4(eventName, parameters)
        } catch (error) {
            console.error('Failed to track event:', error)
        }
    }

    /**
     * Отслеживание просмотров "страниц" (экранов расширения)
     * @param {string} pageName - название страницы/экрана
     */
    async trackPageView(pageName) {
        if (!this.initialized) {
            console.warn('Analytics not initialized yet')
            return
        }

        try {
            await this.sendPageViewViaGA4(pageName)
        } catch (error) {
            console.error('Failed to track page view:', error)
        }
    }

    /**
     * Отслеживание пользовательских метрик
     * @param {string} metricName - название метрики
     * @param {number} value - значение метрики
     */
    async trackMetric(metricName, value) {
        if (!this.initialized) {
            console.warn('Analytics not initialized yet')
            return
        }

        try {
            await this.trackEvent('custom_metric', {
                metric_name: metricName,
                metric_value: value
            })
        } catch (error) {
            console.error('Failed to track metric:', error)
        }
    }

    /**
     * Отслеживание ошибок
     * @param {string} description - описание ошибки
     * @param {boolean} fatal - критическая ошибка или нет
     */
    async trackError(description, fatal = false) {
        if (!this.initialized) {
            console.warn('Analytics not initialized yet')
            return
        }

        try {
            await this.trackEvent('exception', {
                description: description,
                fatal: fatal
            })
        } catch (error) {
            console.error('Failed to track error:', error)
        }
    }

    /**
     * Отслеживание времени выполнения операций
     * @param {string} name - название операции
     * @param {number} value - время в миллисекундах
     */
    async trackTiming(name, value) {
        if (!this.initialized) {
            console.warn('Analytics not initialized yet')
            return
        }

        try {
            await this.trackEvent('timing_complete', {
                name: name,
                value: value
            })
        } catch (error) {
            console.error('Failed to track timing:', error)
        }
    }

    /**
     * Отправка событий через Measurement Protocol API
     * @param {string} eventName - название события
     * @param {object} parameters - параметры события
     */
    async sendEventViaGA4(eventName, parameters = {}) {
        try {
            if (!this.ga4MeasurementId || !this.ga4ApiSecret) {
                console.warn('GA4 is not fully configured: missing measurementId or apiSecret')
                return
            }

            let appVersion = 'unknown'
            try {
                if (typeof browser !== 'undefined' && browser.runtime && typeof browser.runtime.getManifest === 'function') {
                    appVersion = browser.runtime.getManifest().version || appVersion
                } else if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getManifest === 'function') {
                    appVersion = chrome.runtime.getManifest().version || appVersion
                }
            } catch (_) {}

            const endpointBase = isDevelopment ? 'https://www.google-analytics.com/debug/mp/collect' : 'https://www.google-analytics.com/mp/collect'
            const url = `${endpointBase}?measurement_id=${encodeURIComponent(this.ga4MeasurementId)}&api_secret=${encodeURIComponent(this.ga4ApiSecret)}`

            const body = {
                client_id: this.clientId,
                events: [{
                    name: eventName,
                    params: {
                        app_name: 'Faceit Extension',
                        app_version: appVersion,
                        language: navigator.language,
                        screen_resolution: `${screen.width}x${screen.height}`,
                        ...parameters
                    }
                }]
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                if (isDevelopment) {
                    const debugResult = await response.json()
                    console.log(`GA4 debug result for event ${eventName}:`, debugResult)
                } else {
                    console.log(`Analytics event sent (GA4): ${eventName}`, parameters)
                }
            } else {
                console.error('Failed to send GA4 event:', response.status)
            }
        } catch (error) {
            console.error('Failed to send GA4 event:', error)
        }
    }

    /**
     * Отправка просмотра страницы через Measurement Protocol API
     * @param {string} pageName - название страницы
     */
    async sendPageViewViaGA4(pageName) {
        try {
            if (!this.ga4MeasurementId || !this.ga4ApiSecret) {
                console.warn('GA4 is not fully configured: missing measurementId or apiSecret')
                return
            }

            let appVersion2 = 'unknown'
            try {
                if (typeof browser !== 'undefined' && browser.runtime && typeof browser.runtime.getManifest === 'function') {
                    appVersion2 = browser.runtime.getManifest().version || appVersion2
                } else if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getManifest === 'function') {
                    appVersion2 = chrome.runtime.getManifest().version || appVersion2
                }
            } catch (_) {}

            const endpointBase = isDevelopment ? 'https://www.google-analytics.com/debug/mp/collect' : 'https://www.google-analytics.com/mp/collect'
            const url = `${endpointBase}?measurement_id=${encodeURIComponent(this.ga4MeasurementId)}&api_secret=${encodeURIComponent(this.ga4ApiSecret)}`

            const body = {
                client_id: this.clientId,
                events: [{
                    name: 'page_view',
                    params: {
                        page_title: pageName,
                        page_location: `chrome-extension://${(typeof browser !== 'undefined' && browser.runtime ? browser.runtime.id : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.id : 'unknown'))}/${pageName}`,
                        page_path: `/${pageName}`,
                        app_name: 'Faceit Extension',
                        app_version: appVersion2,
                        viewport: `${window.innerWidth}x${window.innerHeight}`
                    }
                }]
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                if (isDevelopment) {
                    const debugResult = await response.json()
                    console.log('GA4 debug result for page_view:', debugResult)
                } else {
                    console.log(`Analytics page view sent (GA4): ${pageName}`)
                }
            } else {
                console.error('Failed to send GA4 page view:', response.status)
            }
        } catch (error) {
            console.error('Failed to send GA4 page view:', error)
        }
    }
}

// Создаем singleton instance
const analyticsService = new AnalyticsService()

export default analyticsService