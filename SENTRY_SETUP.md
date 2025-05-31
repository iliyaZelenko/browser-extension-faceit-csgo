# Sentry Error Tracking Setup

## Обзор

В проект интегрирована система отслеживания ошибок **Sentry** для мониторинга проблем в production окружении.

## Конфигурация

- **DSN**: `https://60e8910dfee6a7acf440d149a9cf3292@o4509418472013824.ingest.de.sentry.io/4509418477518928`
- **Environment**: автоматически определяется на основе `NODE_ENV`
- **Components**: popup, background script, Vue components

## Что отслеживается

### 1. API Ошибки
- Ошибки HTTP запросов к FACEIT API
- Сетевые ошибки
- Таймауты и недоступность сервисов

### 2. JavaScript Ошибки
- Необработанные исключения
- Unhandled Promise rejections
- Vue component ошибки

### 3. Пользовательские действия (Breadcrumbs)
- Поиск игроков
- Загрузка статистики
- Навигация между страницами
- Сохранение настроек

### 4. Критичные ошибки приложения
- Некорректные данные профиля (mismatch elo/level)
- Ошибки парсинга данных
- Проблемы инициализации компонентов

## Структура логирования

### Popup Script (`src/popup/services/sentry.js`)
```javascript
import { logApiError, logUserAction, logCriticalError } from './services/sentry.js'

// API ошибки
logApiError(error, { url, status, context })

// Действия пользователя
logUserAction('search_player', { nickname, game })

// Критичные ошибки
logCriticalError(error, { context, additionalData })
```

### Background Script (`src/background.js`)
- Автоматическое логирование lifecycle событий
- Обработка сообщений от popup
- Глобальная обработка ошибок

### Vue Components
```javascript
// Автоматическое логирование ошибок компонентов
errorCaptured(err, vm, info) {
  logCriticalError(err, { component, route, errorInfo })
}
```

## Фильтрация ошибок

### Development режим
- Ошибки **НЕ отправляются** в Sentry
- Логируются только в консоль
- Полное отображение для отладки

### Production режим
- Автоматическая отправка в Sentry
- Фильтрация спама (CORS, Extension context invalidated)
- Группировка похожих ошибок

## Типы событий

### Error Levels
- `fatal` - критичные ошибки приложения
- `error` - API и сетевые ошибки
- `warning` - предупреждения и восстановимые ошибки
- `info` - информационные события

### Tags
- `error_type`: api_error, critical, background_error
- `component`: browser-extension, background-script
- `platform`: faceit-csgo

### Context
```javascript
{
  api_context: { url, status, headers },
  vue_component_context: { component, route, errorInfo },
  background_context: { message, action },
  critical_context: { player_id, game, additionalData }
}
```

## Мониторинг пользователей

### User Identification
- Автоматическая установка пользователя при сохранении никнейма
- Очистка при удалении из избранного
- Связывание ошибок с конкретными пользователями

### Session Tracking
- Отключено для браузерных расширений
- Ручное отслеживание через breadcrumbs

## Производительность

### Sampling Rate
- Development: 100% событий
- Production: 10% событий для производительности

### Ограничения
- Максимум 50 breadcrumbs на сессию
- Автоматическое прикрепление stack traces
- Лимит на количество событий в минуту

## Основные компоненты

### 1. `src/popup/services/sentry.js`
Основной сервис с функциями логирования:
- `initSentry()` - инициализация
- `logApiError()` - API ошибки
- `logUserAction()` - действия пользователя
- `logCriticalError()` - критичные проблемы

### 2. `src/popup/services/faceitApi.js`
Интеграция с API сервисом:
- Автоматическое логирование HTTP ошибок
- Контекст запросов для отладки
- Разделение network и API ошибок

### 3. `src/popup/popup.js`
Глобальные обработчики:
- Vue.config.errorHandler
- window.addEventListener('error')
- window.addEventListener('unhandledrejection')

### 4. `src/background.js`
Background script мониторинг:
- Lifecycle события расширения
- Обработка сообщений от popup
- Автономное логирование ошибок

## Дополнительные возможности

### Manual Error Reporting
```javascript
import { logCriticalError } from './services/sentry.js'

try {
  // risky operation
} catch (error) {
  logCriticalError(error, {
    context: 'custom_operation',
    user_action: 'button_click',
    additional_data: { ... }
  })
}
```

### Custom Breadcrumbs
```javascript
import { logUserAction } from './services/sentry.js'

logUserAction('custom_action', {
  element: 'button',
  page: 'stats',
  value: 'some_value'
})
```

## Troubleshooting

### Проблемы отправки
1. Проверить network в DevTools
2. Убедиться что `NODE_ENV=production`
3. Проверить CSP в manifest.json

### Отладка в Development
- События логируются в консоль
- Используйте `console.log('Sentry event (dev mode):', event)`
- Проверяйте структуру данных перед production

### Performance Issues
- Настроить `tracesSampleRate` под нагрузку
- Ограничить количество breadcrumbs
- Фильтровать неважные ошибки в `beforeSend`

## Безопасность

- DSN настроен для конкретного проекта
- Фильтрация чувствительных данных
- Автоматическое скрытие паролей и токенов
- Ограничение отправки в development режиме 