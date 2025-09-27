const test = require('node:test')
const assert = require('node:assert/strict')
const https = require('https')

// Keep in sync with src/popup/utils/constants.js
const BASE_URL = 'https://open.faceit.com/data/v4'
const HEADERS = {
    accept: 'application/json',
    Authorization: 'Bearer 8c142d35-ba07-4de6-a14a-9f1e3e6109e8'
}

function requestJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'GET', headers: HEADERS }, res => {
            let data = ''
            res.on('data', chunk => { data += chunk })
            res.on('end', () => {
                const status = res.statusCode || 0
                if (status >= 200 && status < 300) {
                    try {
                        resolve({ status, json: JSON.parse(data) })
                    } catch (e) {
                        reject(new Error(`Invalid JSON: ${e.message}`))
                    }
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

function computeUiEffectiveGame(player, selectedGame) {
    const games = (player && player.games) || {}
    if (games[selectedGame]) return selectedGame
    if (games.csgo) return 'csgo'
    if (games.cs2) return 'cs2'
    return null
}

test('players lookup: unke666 exists and has only cs2', async() => {
    const url = `${BASE_URL}/players?nickname=${encodeURIComponent('unke666')}&game=${encodeURIComponent('csgo')}`
    const { json: player } = await requestJson(url)
    assert.ok(player && player.player_id, 'player_id must exist')
    assert.ok(player.games && player.games.cs2, 'player must have cs2 game')
    assert.equal(player.games.csgo, undefined, 'player should not have csgo game')
})

test('stats: csgo returns 404 for unke666, cs2 returns lifetime', async() => {
    const playerUrl = `${BASE_URL}/players?nickname=${encodeURIComponent('unke666')}&game=${encodeURIComponent('csgo')}`
    const { json: player } = await requestJson(playerUrl)

    // csgo stats should be 404
    const csgoStatsUrl = `${BASE_URL}/players/${player.player_id}/stats/${encodeURIComponent('csgo')}`
    await assert.rejects(() => requestJson(csgoStatsUrl), (e) => e && e.status === 404)

    // cs2 stats should be 200
    const cs2StatsUrl = `${BASE_URL}/players/${player.player_id}/stats/${encodeURIComponent('cs2')}`
    const { json: stats } = await requestJson(cs2StatsUrl)
    assert.ok(stats && stats.lifetime, 'stats.lifetime must exist for cs2')
})

test('ui fallback: if selected csgo but only cs2 present, effective game is cs2', async() => {
    const playerUrl = `${BASE_URL}/players?nickname=${encodeURIComponent('unke666')}&game=${encodeURIComponent('csgo')}`
    const { json: player } = await requestJson(playerUrl)
    const effective = computeUiEffectiveGame(player, 'csgo')
    assert.equal(effective, 'cs2')
})

test('players lookup: nonexistent nickname gives 404', async() => {
    const nickname = `__definitely_not_exist_${Date.now()}__`
    const url = `${BASE_URL}/players?nickname=${encodeURIComponent(nickname)}&game=${encodeURIComponent('csgo')}`
    await assert.rejects(() => requestJson(url), (e) => e && e.status === 404)
})

test('autocomplete: search players returns 200 and items array (<=3)', async() => {
    const search = 's1m'
    const url = `${BASE_URL}/search/players?nickname=${encodeURIComponent(search)}&game=${encodeURIComponent('csgo')}&offset=0&limit=3`
    const { json } = await requestJson(url)
    assert.ok(Array.isArray(json.items), 'items must be an array')
    assert.ok(json.items.length <= 3, 'items length respects limit=3')
})

test('history: recent matches for unke666 cs2 returns items[] or empty with 200', async() => {
    const playerUrl = `${BASE_URL}/players?nickname=${encodeURIComponent('unke666')}&game=${encodeURIComponent('csgo')}`
    const { json: player } = await requestJson(playerUrl)
    const historyUrl = `${BASE_URL}/players/${player.player_id}/history?game=${encodeURIComponent('cs2')}&offset=0&limit=5`
    const { json } = await requestJson(historyUrl)
    assert.ok(json && Array.isArray(json.items), 'history.items must be array')
})