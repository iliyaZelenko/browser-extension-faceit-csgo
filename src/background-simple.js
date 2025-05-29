// Простой background script для development
console.log('🔧 Background script (simple) loaded');

let lastChangeTime = 0;
let popupPorts = new Set();

// Hot reload support for development
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Received message:', message);

    if (message.type === 'ping') {
        console.log('📡 Ping received, sending response');
        sendResponse({ status: 'alive', lastChange: lastChangeTime });
    }

    return true;
});

// Обработка подключений от popup
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'popup-hot-reload') {
        console.log('🔌 Popup connected for hot reload');
        popupPorts.add(port);

        port.onDisconnect.addListener(() => {
            console.log('🔌 Popup disconnected');
            popupPorts.delete(port);
        });
    }
});

// WebSocket для hot reload
try {
    const ws = new WebSocket('ws://localhost:9090');

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'SIGN_CHANGE') {
            console.log('🔄 Files changed, notifying popups...');
            lastChangeTime = Date.now();

            // Отправляем сообщение всем открытым popup
            popupPorts.forEach(port => {
                try {
                    port.postMessage({ type: 'reload' });
                } catch (e) {
                    console.log('Failed to send reload message to popup');
                }
            });

            // Перезагружаем только если нет открытых popup
            setTimeout(() => {
                if (popupPorts.size === 0) {
                    console.log('🔄 No popups open, reloading extension...');
                    chrome.runtime.reload();
                }
            }, 100);
        }
    };

    ws.onerror = () => {
        // Ignore WebSocket errors in production
    };
} catch (e) {
    // Ignore WebSocket errors if server not available
}

console.log('✅ Background script (simple) ready');