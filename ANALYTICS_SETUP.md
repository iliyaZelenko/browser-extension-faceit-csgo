# Google Analytics Setup

Этот документ описывает, как настроена и используется Google Analytics в браузерном расширении.

## Настройка

### 1. Зависимости

Не требуются дополнительные зависимости - используется прямое API Google Analytics.

### 2. Разрешения в manifest.json

В `src/manifest.json` добавлены необходимые разрешения:

```json
{
  "host_permissions": [
    "https://www.googletagmanager.com/",
    "https://www.google-analytics.com/"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self' https://www.googletagmanager.com; object-src 'self'"
  }
}
```

### 3. Measurement ID

Используется ID: `G-YFV8YK7FVQ`

## Архитектура

### Сервис аналитики (`src/popup/services/analytics.js`)

Основной сервис для работы с Google Analytics, который:

- Динамически загружает Google Analytics скрипт
- Управляет инициализацией gtag
- Предоставляет методы для отслеживания различных событий
- Включает fallback метод для отправки через Measurement Protocol API

**Основные методы:**

- `trackEvent(eventName, parameters)` - отслеживание событий
- `trackPageView(pageName)` - отслеживание просмотров страниц
- `trackMetric(metricName, value)` - отслеживание метрик
- `trackError(description, fatal)` - отслеживание ошибок
- `trackTiming(name, value)` - отслеживание времени выполнения
- `sendEventViaAPI(eventName, parameters)` - альтернативный метод отправки

### Миксин (`src/popup/utils/analytics-mixin.js`)

Удобные методы для использования в Vue компонентах:

- `trackButtonClick(buttonName, extraData)` - клики по кнопкам
- `trackUserAction(action, extraData)` - действия пользователя
- `trackDataLoad(dataType, loadTime, success)` - загрузка данных
- `trackComponentError(errorType, errorMessage, fatal)` - ошибки компонентов
- `trackComponentTime(startTime)` - время работы с компонентом
- `trackUserSetting(settingName, settingValue)` - настройки пользователя
- `trackSearch(searchQuery, resultsCount)` - поиск

## Использование

### В Vue компонентах

#### Базовое использование

```javascript
export default {
  mounted() {
    // Отслеживание просмотра страницы
    this.$analytics.trackPageView('settings_page')
    
    // Отслеживание события
    this.$analytics.trackEvent('component_mounted', {
      component: 'Settings'
    })
  },
  methods: {
    onClick() {
      // Отслеживание клика
      this.$analytics.trackEvent('button_click', {
        button: 'save_settings'
      })
    }
  }
}
```

#### Использование миксина

```javascript
import analyticsMixin from '../utils/analytics-mixin'

export default {
  mixins: [analyticsMixin],
  
  methods: {
    onSaveClick() {
      // Удобный метод из миксина
      this.trackButtonClick('save_settings', {
        settings_count: this.settingsCount
      })
    },
    
    onSearch(query) {
      const results = this.performSearch(query)
      this.trackSearch(query, results.length)
    }
  }
}
```

### Автоматическое отслеживание

#### Навигация по роутам

Автоматически отслеживается в `popup.js`:

```javascript
router.afterEach((to, from) => {
  analyticsService.trackPageView(to.name || to.path)
  analyticsService.trackEvent('route_change', {
    from: from.name || from.path,
    to: to.name || to.path
  })
})
```

#### Ошибки

Автоматически отслеживаются все:

- Vue ошибки компонентов
- Unhandled Promise rejections
- JavaScript ошибки
- Sentry ошибки

## Примеры событий

### Стандартные события

- `extension_started` - запуск расширения
- `app_launch` - запуск приложения
- `route_change` - смена роута
- `button_click` - клик по кнопке
- `user_action` - действие пользователя
- `data_load` - загрузка данных
- `component_error` - ошибка компонента
- `search` - поиск

### Метрики времени

- `{component}_usage_time` - время работы с компонентом
- `{dataType}_load_time` - время загрузки данных

### Ошибки

Все ошибки отслеживаются как события типа `exception` с описанием и флагом критичности.

## Демо компонент

Создан компонент `AnalyticsExample.vue` для демонстрации всех возможностей:

```vue
<template>
  <analytics-example />
</template>

<script>
import AnalyticsExample from './components/AnalyticsExample.vue'

export default {
  components: {
    AnalyticsExample
  }
}
</script>
```

## Технические детали

### Динамическая загрузка

Скрипт Google Analytics загружается динамически при инициализации сервиса:

```javascript
async loadGoogleAnalytics() {
  return new Promise((resolve, reject) => {
    if (!window.dataLayer) {
      window.dataLayer = []
    }

    if (!window.gtag) {
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
    }

    window.gtag('js', new Date())

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}
```

### Fallback API

В случае проблем с основным методом, доступен альтернативный через Measurement Protocol:

```javascript
async sendEventViaAPI(eventName, parameters = {}) {
  const payload = {
    v: '1',
    tid: this.measurementId,
    cid: this.clientId,
    t: 'event',
    ec: 'faceit_extension',
    ea: eventName,
    ...parameters
  }

  const body = Object.keys(payload)
    .map(key => `${key}=${encodeURIComponent(payload[key])}`)
    .join('&')

  await fetch('https://www.google-analytics.com/collect', {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}
```

## Настройки для браузерных расширений

Для корректной работы в браузерных расширениях используются следующие настройки:

```javascript
this.gtag('config', this.measurementId, {
  send_page_view: false,  // Отключаем автоматическую отправку просмотров
  anonymize_ip: true,     // Анонимизируем IP
  custom_map: {}          // Пустая карта для кастомных событий
})
```

## Отладка

В консоли браузера можно увидеть сообщения о отправке событий:

```
Analytics event tracked: button_click {button_name: "save", component: "Settings"}
Analytics page view tracked: settings
Analytics timing tracked: data_load_time = 1250ms
```

## Конфиденциальность

- IP адреса анонимизируются (`anonymize_ip: true`)
- Не отслеживается автоматическая информация о страницах
- Отслеживаются только явно заданные события и метрики
- Не собираются персональные данные пользователей
- Генерируется уникальный Client ID для каждого пользователя
- Session ID генерируется для каждой сессии 