// Manifest V3 service worker
console.log('🔧 Background script loaded')

// Message listener for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Received message:', message)

  if (message.type === 'ping') {
    console.log('📡 Ping received, sending response')
    sendResponse({ status: 'alive' })
  }

  return true // Keep message channel open for async response
})

// TODO: Add your production background script logic here
// например:
// - обработка уведомлений
// - работа с API
// - управление состоянием расширения

console.log('✅ Background script ready')
