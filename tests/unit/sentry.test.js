const test = require('node:test')
const assert = require('node:assert/strict')

// Тестируем поведение beforeSend: какие ошибки отбрасываются в проде
function beforeSendFactory(isDevelopment) {
    return function beforeSend(event, hint) {
        if (isDevelopment) {
            return event
        }
        const error = hint.originalException
        if (error && error.message && error.message.includes('CORS')) return null
        if (error && error.message && error.message.includes('Extension context invalidated')) return null
        return event
    }
}

test('sentry beforeSend (prod): filters CORS and Extension errors', () => {
    const beforeSend = beforeSendFactory(false)
    const baseEvent = { id: 1 }
    assert.equal(beforeSend(baseEvent, { originalException: new Error('CORS something') }), null)
    assert.equal(beforeSend(baseEvent, { originalException: new Error('Extension context invalidated: ...') }), null)
    const kept = beforeSend(baseEvent, { originalException: new Error('Other error') })
    assert.deepEqual(kept, baseEvent)
})

test('sentry beforeSend (dev): returns event as-is', () => {
    const beforeSend = beforeSendFactory(true)
    const ev = { id: 2 }
    const out = beforeSend(ev, { originalException: new Error('anything') })
    assert.deepEqual(out, ev)
})