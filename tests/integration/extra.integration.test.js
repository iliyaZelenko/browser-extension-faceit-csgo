const test = require('node:test')
const assert = require('node:assert/strict')
const https = require('https')

const BASE_URL = 'https://open.faceit.com/data/v4'
const HEADERS = { accept: 'application/json', Authorization: 'Bearer 8c142d35-ba07-4de6-a14a-9f1e3e6109e8' }

function requestJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'GET', headers: HEADERS }, res => {
            let data = ''
            res.on('data', c => { data += c })
            res.on('end', () => {
                const status = res.statusCode || 0
                if (status >= 200 && status < 300) {
                    resolve({ status, json: JSON.parse(data || '{}') })
                } else {
                    const err = new Error(`HTTP ${status}`)
                        // @ts-ignore
                    err.status = status
                        // @ts-ignore
                    err.body = data
                    reject(err)
                }
            })
        })
        req.on('error', reject)
        req.end()
    })
}

test('autocomplete: limit=1 respected', async() => {
    const url = `${BASE_URL}/search/players?nickname=${encodeURIComponent('s1')}&game=${encodeURIComponent('csgo')}&offset=0&limit=1`
    const { json } = await requestJson(url)
    assert.ok(Array.isArray(json.items))
    assert.ok(json.items.length <= 1)
})

test('history pagination: subsequent page continues after offset', async() => {
    // Берём игрока с большими матчами — используем того же unke666 (может быть мало матчей, но проверим контракт)
    const playerUrl = `${BASE_URL}/players?nickname=${encodeURIComponent('unke666')}&game=${encodeURIComponent('csgo')}`
    const { json: player } = await requestJson(playerUrl)

    const firstUrl = `${BASE_URL}/players/${player.player_id}/history?game=cs2&offset=0&limit=3`
    const secondUrl = `${BASE_URL}/players/${player.player_id}/history?game=cs2&offset=3&limit=3`
    const { json: first } = await requestJson(firstUrl)
    const { json: second } = await requestJson(secondUrl)

    assert.ok(Array.isArray(first.items))
    assert.ok(Array.isArray(second.items))
    if (first.items.length && second.items.length) {
        // если матчей достаточно, ожидаем, что элементы страниц не совпадают по match_id
        const firstId = first.items[0] && first.items[0].match_id
        const secondId = second.items[0] && second.items[0].match_id
        assert.notEqual(firstId, secondId)
    }
})

test('stats for a real player from search: lifetime present OR both 404 tolerated', async() => {
    // Берём первого найденного игрока по запросу "s1m" в csgo
    const searchUrl = `${BASE_URL}/search/players?nickname=${encodeURIComponent('s1m')}&game=${encodeURIComponent('csgo')}&offset=0&limit=1`
    const { json: search } = await requestJson(searchUrl)
    if (!Array.isArray(search.items) || search.items.length === 0) {
        // Нечего проверять — пропускаем как пройденный (ничего не нарушили)
        assert.ok(true)
        return
    }

    const nickname = search.items[0].nickname
    const playerUrl = `${BASE_URL}/players?nickname=${encodeURIComponent(nickname)}&game=${encodeURIComponent('csgo')}`
    const { json: player } = await requestJson(playerUrl)

    let ok = false
    let cs2404 = false
    let csgo404 = false

    try {
        const cs2 = `${BASE_URL}/players/${player.player_id}/stats/cs2`
        const { json } = await requestJson(cs2)
        ok = !!json.lifetime
    } catch (e) {
        cs2404 = e && e.status === 404
    }

    if (!ok) {
        try {
            const csgo = `${BASE_URL}/players/${player.player_id}/stats/csgo`
            const { json } = await requestJson(csgo)
            ok = !!json.lifetime
        } catch (e) {
            csgo404 = e && e.status === 404
        }
    }

    assert.ok(ok || (cs2404 && csgo404))
})