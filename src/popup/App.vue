<template>
  <div>
    <router-view />
  </div>
</template>

<script>
import { logCriticalError, logAppState } from './services/sentry.js'
import remoteConfig from './services/remoteConfig.js'

export default {
  data () {
    return {}
  },
  async created () {
    // Инициализируем Remote Config
    try {
      await remoteConfig.initialize()
      await remoteConfig.fetchConfig()
      console.log('🔧 Remote Config initialized in App')
    } catch (error) {
      console.error('❌ Failed to initialize Remote Config in App:', error)
    }

    // Логируем запуск приложения
    logAppState('app_started', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })

    // Отслеживаем запуск приложения в Google Analytics
    this.$analytics.trackPageView('popup_opened')
    this.$analytics.trackEvent('extension_opened', {
      timestamp: new Date().toISOString(),
      browser: this.getBrowserInfo(),
      version: chrome.runtime.getManifest().version
    })

    // Проверяем, первый ли раз пользователь открывает расширение
    this.checkFirstTimeUser()
  },
  mounted() {
    // Отслеживаем время рендеринга страницы
    this.$nextTick(() => {
      const renderTime = performance.now()
      this.$analytics.trackTiming('page_render_time', Math.round(renderTime))
    })
  },
  beforeUnmount() {
    // Отслеживаем закрытие расширения
    this.$analytics.trackEvent('extension_closed', {
      timestamp: new Date().toISOString(),
      session_duration: this.getSessionDuration()
    })
  },
  methods: {
    getBrowserInfo() {
      const userAgent = navigator.userAgent
      if (userAgent.includes('Chrome')) return 'chrome'
      if (userAgent.includes('Firefox')) return 'firefox'
      if (userAgent.includes('Safari')) return 'safari'
      if (userAgent.includes('Edge')) return 'edge'
      return 'unknown'
    },
    
    checkFirstTimeUser() {
      const hasVisited = localStorage.getItem('faceit_extension_visited')
      if (!hasVisited) {
        localStorage.setItem('faceit_extension_visited', 'true')
        this.$analytics.trackEvent('first_time_user', {
          timestamp: new Date().toISOString(),
          version: chrome.runtime.getManifest().version
        })
      }
    },
    
    getSessionDuration() {
      const startTime = localStorage.getItem('session_start_time')
      if (startTime) {
        return Date.now() - parseInt(startTime)
      }
      return 0
    }
  },
  errorCaptured (err, vm, info) {
    // Глобальный обработчик ошибок Vue компонентов
    logCriticalError(err, {
      context: 'vue_component_error',
      component: vm.$options.name || 'Unknown',
      errorInfo: info,
      route: this.$route?.name || 'unknown'
    })

    // Отправляем ошибку в Google Analytics
    this.$analytics.trackError(`Component Error: ${err.message}`, false)

    // Продолжаем всплытие ошибки
    return false
  }
}
</script>

<style lang="scss">
  body {
    margin: 0 !important;
    padding: 0 !important;
  }

  body {
    font-size: 16px;
    color: white;
    text-shadow: #474747 0 0 3px;
  }

  .IZ-select * {
    font-size: initial;
    color: initial;
    text-shadow: initial;
  }

  a {
    color: papayawhip !important;
  }

/*  button {
    display:inline-block;
    padding:0.3em 1.2em;
    margin:0 0.1em 0.1em 0;
    border:0.16em solid rgba(255,255,255,0);
    border-radius:2em;
    box-sizing: border-box;
    text-decoration:none;
    font-family:'Roboto',sans-serif;
    font-weight:300;
    color:#FFFFFF;
    text-shadow: 0 0.04em 0.04em rgba(0,0,0,0.35);
    text-align: center;
    transition: all 0.2s;
    background-color: #4e9af1;

    &:hover {
      border-color: rgba(255,255,255,1);
    }

    &:focus {
      outline: none;
    }
  }*/

  button {
    color: #fff;
    background-color: #f50;
    border: 1px solid #e64d00;
    border-radius: 2px !important;
    /*text-transform: uppercase;*/
    transition: all .18s ease-out;

    display: inline-block;
    margin-bottom: 0;
    font-weight: 700;
    text-align: center;
    vertical-align: middle;
    touch-action: manipulation;
    cursor: pointer;
    background-image: none;
    /*border: 1px solid transparent;*/
    white-space: nowrap;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857;
    /*border-radius: 4px;*/
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .value {
    color: yellow;
    /*font-weight: bold;*/
  }
</style>
