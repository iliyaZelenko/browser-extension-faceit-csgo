const test = require('node:test')
const assert = require('node:assert/strict')

// Простая логика клика по баннеру: если есть href, должен отправиться event
function onBannerClick(state, analytics) {
    if (state.adImageHref && state.adImageHref.trim()) {
        analytics.trackEvent('advertisement_clicked', {
            ad_url: state.adImageHref,
            ad_src: state.adImageSrc,
            timestamp: '2020-01-01T00:00:00.000Z'
        })
        return true
    }
    return false
}

test('banner click: sends analytics event when href present', () => {
    const calls = []
    const analytics = { trackEvent: (name, params) => calls.push({ name, params }) }
    const state = { adImageHref: 'https://ad', adImageSrc: 'https://img' }
    const opened = onBannerClick(state, analytics)
    assert.equal(opened, true)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].name, 'advertisement_clicked')
    assert.equal(calls[0].params.ad_url, 'https://ad')
})

test('banner click: no event when href empty', () => {
    const calls = []
    const analytics = { trackEvent: (name, params) => calls.push({ name, params }) }
    const state = { adImageHref: '', adImageSrc: 'https://img' }
    const opened = onBannerClick(state, analytics)
    assert.equal(opened, false)
    assert.equal(calls.length, 0)
})