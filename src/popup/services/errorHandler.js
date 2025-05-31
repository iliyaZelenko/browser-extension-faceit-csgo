/**
 * Единый сервис для обработки ошибок
 */
class ErrorHandler {
  constructor () {
    this.notificationDefaults = {
      type: 'basic',
      iconUrl: (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('icons/icon_48.png')
        : '/icons/icon_48.png'
    }
  }

  /**
     * Обрабатывает ошибки API
     * @param {Error} error - Объект ошибки
     * @param {Object} context - Контекст ошибки
     */
  handleApiError (error, context = {}) {
    console.error('API Error:', error, context)

    if (error.message.includes('404')) {
      this.showNotification({
        title: context.notFoundTitle || 'Not Found',
        message: context.notFoundMessage || 'The requested resource was not found.'
      })
    } else if (error.message.includes('403')) {
      this.showNotification({
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.'
      })
    } else if (error.message.includes('500')) {
      this.showNotification({
        title: 'Server Error',
        message: 'Internal server error. Please try again later.'
      })
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      this.showNotification({
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.'
      })
    } else {
      this.showNotification({
        title: context.genericTitle || 'Error',
        message: context.genericMessage || 'An unexpected error occurred.'
      })
    }
  }

  /**
     * Обрабатывает ошибки валидации
     * @param {string} field - Поле с ошибкой
     * @param {string} message - Сообщение об ошибке
     */
  handleValidationError (field, message) {
    console.warn('Validation Error:', field, message)

    this.showNotification({
      title: 'Validation Error',
      message: message
    })
  }

  /**
     * Обрабатывает ошибки игрока
     * @param {Error} error - Объект ошибки
     * @param {string} nickname - Никнейм игрока
     */
  handlePlayerError (error, nickname = '') {
    if (error.message.includes('404')) {
      this.showNotification({
        title: 'Player not found',
        message: nickname ? `Player "${nickname}" not found.` : 'Player not found.'
      })
    } else if (error.message.includes('Nickname must be at least')) {
      this.showNotification({
        title: 'Invalid nickname',
        message: 'Nickname must be at least 3 characters.'
      })
    } else {
      this.handleApiError(error, {
        notFoundTitle: 'Player Error',
        notFoundMessage: 'Unable to load player data.'
      })
    }
  }

  /**
     * Обрабатывает ошибки статистики
     * @param {Error} error - Объект ошибки
     */
  handleStatsError (error) {
    if (error.message.includes('404')) {
      this.showNotification({
        title: 'Stats not found',
        message: 'Player statistics not found for this game.'
      })
    } else {
      this.handleApiError(error, {
        genericTitle: 'Stats Error',
        genericMessage: 'Unable to load player statistics.'
      })
    }
  }

  /**
     * Обрабатывает ошибки матчей
     * @param {Error} error - Объект ошибки
     */
  handleMatchesError (error) {
    console.error('Matches Error:', error)

    this.showNotification({
      title: 'Matches Error',
      message: 'Unable to load match history.'
    })
  }

  /**
     * Показывает уведомление
     * @param {Object} options - Опции уведомления
     */
  showNotification (options) {
    const notification = {
      ...this.notificationDefaults,
      ...options
    }

    // Для browser extension
    if (typeof browser !== 'undefined' && browser.notifications) {
      browser.notifications.create(notification)
    }
    // Для Chrome extension
    else if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create(notification)
    }
    // Fallback для web
    else if ('Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.iconUrl
      })
    }
    // Консоль как последний fallback
    else {
      console.error(`${notification.title}: ${notification.message}`)
    }
  }

  /**
     * Логирует ошибку для дебага
     * @param {Error} error - Объект ошибки
     * @param {Object} context - Контекст ошибки
     */
  logError (error, context = {}) {
    console.group('🔥 Error Details')
    console.error('Error:', error)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Context:', context)
    console.groupEnd()
  }
}

// Создаем единственный экземпляр
export const errorHandler = new ErrorHandler()

export default errorHandler
