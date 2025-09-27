const test = require('node:test')
const assert = require('node:assert/strict')
const { buildEventPayload, buildPageviewPayload } = require('../../src/popup/services/analytics.cjs')

test('analytics: buildEventPayload adds custom metrics and session id', () => {
    const payload = buildEventPayload({
        measurementId: 'G-XXXX',
        clientId: 'cid.123',
        sessionId: 'sess-1',
        version: '2.0.0',
        userAgent: 'UA',
        language: 'ru',
        screenInfo: '1920x1080',
        eventName: 'player_search_started',
        parameters: { component: 'search', context: 'popup', session_id: 'custom', value: 1, label: 'lbl', foo: 'bar', q: 's1m' }
    })
    assert.equal(payload.tid, 'G-XXXX')
    assert.equal(payload.ea, 'player_search_started')
    assert.equal(payload.cd1, 'search')
    assert.equal(payload.cd2, 'popup')
    assert.equal(payload.cd3, 'custom')
    assert.equal(payload.cm1, 'bar')
    assert.equal(payload.cm2, 's1m')
})

test('analytics: buildPageviewPayload constructs pageview with runtime id', () => {
    const p = buildPageviewPayload({
        measurementId: 'G-XXXX',
        clientId: 'cid',
        sessionId: 'sess',
        version: '2.0.0',
        userAgent: 'UA',
        language: 'ru',
        screenInfo: '1920x1080',
        pageName: 'index',
        runtimeId: 'abc123'
    })
    assert.equal(p.dp, '/index')
    assert.equal(p.dl, 'chrome-extension://abc123/index')
    assert.equal(p.cd3, 'sess')
})