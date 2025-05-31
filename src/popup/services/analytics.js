class AnalyticsService {
    constructor() {
        this.initialized = false
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
            // Используем только Measurement Protocol API (совместимо с Manifest V3)
            this.initialized = true
            console.log('Google Analytics initialized with Measurement Protocol API')

            // Отправляем событие о старте расширения
            await this.trackEvent('extension_started', {
                version: chrome.runtime.getManifest().version,
                session_id: this.sessionId
            })
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
            await this.sendEventViaAPI(eventName, parameters)
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
            await this.sendPageViewViaAPI(pageName)
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
    async sendEventViaAPI(eventName, parameters = {}) {
        try {
            const payload = {
                v: '1', // Version
                tid: this.measurementId, // Tracking ID
                cid: this.clientId, // Client ID
                t: 'event', // Hit Type
                ec: 'faceit_extension', // Event Category
                ea: eventName, // Event Action
                el: parameters.label || '', // Event Label
                ev: parameters.value || '', // Event Value
                // Дополнительные параметры
                an: 'Faceit Extension', // App Name
                av: chrome.runtime.getManifest().version, // App Version
                ua: navigator.userAgent, // User Agent
                ul: navigator.language, // User Language
                sr: `${screen.width}x${screen.height}`, // Screen Resolution
                sd: `${screen.colorDepth}-bits`, // Screen Colors
                // Session info
                sc: 'start', // Session Control (для первого события в сессии)
                // Custom dimensions
                cd1: parameters.component || '', // Custom dimension 1
                cd2: parameters.context || '', // Custom dimension 2
                cd3: parameters.session_id || this.sessionId, // Custom dimension 3
            }

            // Добавляем дополнительные параметры как custom metrics
            let metricIndex = 1
            Object.keys(parameters).forEach(key => {
                if (!['label', 'value', 'component', 'context', 'session_id'].includes(key)) {
                    if (metricIndex <= 20) { // Google Analytics поддерживает до 20 custom metrics
                        payload[`cm${metricIndex}`] = String(parameters[key])
                        metricIndex++
                    }
                }
            })

            const body = Object.keys(payload)
                .filter(key => payload[key] !== '' && payload[key] !== null && payload[key] !== undefined)
                .map(key => `${key}=${encodeURIComponent(payload[key])}`)
                .join('&')

            const response = await fetch('https://www.google-analytics.com/collect', {
                method: 'POST',
                body: body,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': navigator.userAgent
                }
            })

            if (response.ok) {
                console.log(`Analytics event sent: ${eventName}`, parameters)
            } else {
                console.error('Failed to send analytics event:', response.status)
            }
        } catch (error) {
            console.error('Failed to send event via API:', error)
        }
    }

    /**
     * Отправка просмотра страницы через Measurement Protocol API
     * @param {string} pageName - название страницы
     */
    async sendPageViewViaAPI(pageName) {
        try {
            const payload = {
                v: '1', // Version
                tid: this.measurementId, // Tracking ID
                cid: this.clientId, // Client ID
                t: 'pageview', // Hit Type
                dp: `/${pageName}`, // Document Path
                dt: pageName, // Document Title
                dl: `chrome-extension://${chrome.runtime.id}/${pageName}`, // Document Location
                dh: 'extension', // Document Hostname
                // App info
                an: 'Faceit Extension', // App Name
                av: chrome.runtime.getManifest().version, // App Version
                ua: navigator.userAgent, // User Agent
                ul: navigator.language, // User Language
                sr: `${screen.width}x${screen.height}`, // Screen Resolution
                sd: `${screen.colorDepth}-bits`, // Screen Colors
                vp: `${window.innerWidth}x${window.innerHeight}`, // Viewport Size
                // Session info
                cd3: this.sessionId, // Custom dimension 3 - session ID
            }

            const body = Object.keys(payload)
                .filter(key => payload[key] !== '' && payload[key] !== null && payload[key] !== undefined)
                .map(key => `${key}=${encodeURIComponent(payload[key])}`)
                .join('&')

            const response = await fetch('https://www.google-analytics.com/collect', {
                method: 'POST',
                body: body,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': navigator.userAgent
                }
            })

            if (response.ok) {
                console.log(`Analytics page view sent: ${pageName}`)
            } else {
                console.error('Failed to send analytics page view:', response.status)
            }
        } catch (error) {
            console.error('Failed to send page view via API:', error)
        }
    }
}

// Создаем singleton instance
const analyticsService = new AnalyticsService()

export default analyticsService