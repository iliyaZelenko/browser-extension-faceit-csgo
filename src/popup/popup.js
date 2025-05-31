import Vue from 'vue'
import App from './App'
import store from '../store'
import router from './router'
import VueAxios from 'vue-plugin-axios'
import axios from 'axios'
import VueSelect from 'vue-cool-select'
import browser from 'webextension-polyfill'
import { initSentry, logCriticalError } from './services/sentry.js'
import analyticsService from './services/analytics.js'

Vue.prototype.$browser = browser
Vue.prototype.$analytics = analyticsService

// Инициализация Sentry для отслеживания ошибок
initSentry(Vue)

// Глобальный обработчик ошибок Vue
Vue.config.errorHandler = function(err, vm, info) {
    logCriticalError(err, {
        context: 'vue_global_error',
        component: vm && vm.$options && vm.$options.name || 'Unknown',
        errorInfo: info,
        route: vm && vm.$route && vm.$route.name || 'unknown'
    })

    // Отправляем ошибку в Google Analytics
    analyticsService.trackError(`Vue Error: ${err.message}`, true)

    console.error('Vue global error:', err, info)
}

// Обработчик для unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
    logCriticalError(new Error(event.reason), {
        context: 'unhandled_promise_rejection',
        reason: event.reason,
        promise: event.promise
    })

    // Отправляем ошибку в Google Analytics
    analyticsService.trackError(`Promise Rejection: ${event.reason}`, false)

    console.error('Unhandled promise rejection:', event.reason)
})

// Обработчик для необработанных ошибок JavaScript
window.addEventListener('error', event => {
    logCriticalError(event.error || new Error(event.message), {
        context: 'unhandled_js_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    })

    // Отправляем ошибку в Google Analytics
    analyticsService.trackError(`JS Error: ${event.message}`, false)

    console.error('Unhandled JavaScript error:', event.error || event.message)
})

Vue.use(VueAxios, {
    axios
})

Vue.use(VueSelect, {
    theme: 'bootstrap' // or 'material-design'
})

// Отслеживаем навигацию по роутам
router.afterEach((to, from) => {
    analyticsService.trackPageView(to.name || to.path)
    analyticsService.trackEvent('route_change', {
        from: from.name || from.path,
        to: to.name || to.path
    })
})

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
})