// CommonJS враппер упрощённых функций для unit-тестов без реального fetch

function buildEventPayload({ measurementId, clientId, sessionId, version, userAgent, language, screenInfo, eventName, parameters }) {
    const payload = {
        v: '1',
        tid: measurementId,
        cid: clientId,
        t: 'event',
        ec: 'faceit_extension',
        ea: eventName,
        el: parameters.label || '',
        ev: parameters.value || '',
        an: 'Faceit Extension',
        av: version,
        ua: userAgent,
        ul: language,
        sr: screenInfo,
        sd: '24-bits',
        sc: 'start',
        cd1: parameters.component || '',
        cd2: parameters.context || '',
        cd3: parameters.session_id || sessionId
    }
    let metricIndex = 1
    Object.keys(parameters || {}).forEach(key => {
        if (!['label', 'value', 'component', 'context', 'session_id'].includes(key)) {
            if (metricIndex <= 20) {
                payload[`cm${metricIndex}`] = String(parameters[key])
                metricIndex++
            }
        }
    })
    return payload
}

function buildPageviewPayload({ measurementId, clientId, sessionId, version, userAgent, language, screenInfo, pageName, runtimeId }) {
    return {
        v: '1',
        tid: measurementId,
        cid: clientId,
        t: 'pageview',
        dp: `/${pageName}`,
        dt: pageName,
        dl: `chrome-extension://${runtimeId}/${pageName}`,
        dh: 'extension',
        an: 'Faceit Extension',
        av: version,
        ua: userAgent,
        ul: language,
        sr: screenInfo,
        sd: '24-bits',
        vp: '340x420',
        cd3: sessionId
    }
}

module.exports = { buildEventPayload, buildPageviewPayload }

// Вспомогательная функция кодирования тела запроса (как в analytics.js)
function encodeBodyFromPayload(payload) {
    return Object.keys(payload)
        .filter(key => payload[key] !== '' && payload[key] !== null && payload[key] !== undefined)
        .map(key => `${key}=${encodeURIComponent(payload[key])}`)
        .join('&')
}

// Имитация отправки в GA, инжектируем fetch для тестов
async function postToGA(payload, fetchImpl) {
    const body = encodeBodyFromPayload(payload)
    const fetchFn = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
    if (!fetchFn) throw new Error('No fetch available')
    const res = await fetchFn('https://www.google-analytics.com/collect', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'UA' }
    })
    return res
}

module.exports.encodeBodyFromPayload = encodeBodyFromPayload
module.exports.postToGA = postToGA