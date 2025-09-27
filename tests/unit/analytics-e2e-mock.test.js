const test = require('node:test')
const assert = require('node:assert/strict')
const { buildEventPayload, encodeBodyFromPayload, postToGA } = require('../../src/popup/services/analytics.cjs')

test('analytics e2e (mocked fetch): sends encoded body to GA endpoint', async() => {
    const payload = buildEventPayload({
        measurementId: 'G-TEST',
        clientId: 'cid',
        sessionId: 'sess',
        version: '2.0.0',
        userAgent: 'UA',
        language: 'ru',
        screenInfo: '1920x1080',
        eventName: 'test_event',
        parameters: { label: 'L', value: 1, foo: 'bar' }
    })
    const encoded = encodeBodyFromPayload(payload)
    assert.ok(encoded.includes('tid=G-TEST'))
    assert.ok(encoded.includes('ea=test_event'))

    let called = false
    const mockFetch = async(url, opts) => {
        called = true
        assert.equal(url, 'https://www.google-analytics.com/collect')
        assert.equal(opts.method, 'POST')
        assert.equal(opts.headers['Content-Type'], 'application/x-www-form-urlencoded')
        assert.equal(typeof opts.body, 'string')
        return { ok: true, status: 200 }
    }

    const res = await postToGA(payload, mockFetch)
    assert.equal(called, true)
    assert.equal(res.ok, true)
})