const test = require('node:test')
const assert = require('node:assert/strict')

// Тестируем чистую логику получения значений из remoteConfig.get* API
function computeAdState(rc) {
    const hasAdvertisement = rc.getBoolean('ad_enabled', false)
    const adImageSrc = rc.getString('ad_img_src', '')
    const adImageHeight = rc.getString('ad_img_height', '60px')
    const adImageWidth = rc.getString('ad_img_width', '300px')
    const adImageHref = rc.getString('ad_img_href', '')
    return { hasAdvertisement, adImageSrc, adImageHeight, adImageWidth, adImageHref }
}

test('ads: disabled when ad_enabled=false', () => {
    const rc = {
        getBoolean: () => false,
        getString: (k, def) => def
    }
    const st = computeAdState(rc)
    assert.equal(st.hasAdvertisement, false)
    assert.equal(st.adImageSrc, '')
})

test('ads: enabled and values propagated', () => {
    const rc = {
        getBoolean: () => true,
        getString: (k, def) => ({ ad_img_src: 'https://img', ad_img_height: '100px', ad_img_width: '200px', ad_img_href: 'https://href' }[k] || def)
    }
    const st = computeAdState(rc)
    assert.equal(st.hasAdvertisement, true)
    assert.equal(st.adImageSrc, 'https://img')
    assert.equal(st.adImageHeight, '100px')
    assert.equal(st.adImageWidth, '200px')
    assert.equal(st.adImageHref, 'https://href')
})