/*
 Simple integration test that replicates PlayerSearch flow against FACEIT API.
 It uses the same endpoints as src/popup/services/faceitApi.js and reports
 a concise PASS/FAIL summary for a given nickname.
 Usage: node scripts/integration-test.js unke666 csgo
 */

const https = require('https')

const [, , nicknameArg, gameArg] = process.argv
const nickname = nicknameArg || 'unke666'
const game = gameArg || 'csgo'

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
                const status = res.statusCode
                if (status && status >= 200 && status < 300) {
                    try {
                        resolve({ status, json: JSON.parse(data) })
                    } catch (e) {
                        reject(new Error(`Invalid JSON: ${e.message}`))
                    }
                } else {
                    const error = new Error(`HTTP ${status}`)
                    error.status = status
                    error.body = data
                    reject(error)
                }
            })
        })
        req.on('error', reject)
        req.end()
    })
}

function computeUiProfileErrorIfAny(player, game) {
    // Эмуляция актуальной логики UI:
    // 1) Если выбранной игры нет, UI автоматически берёт любую доступную (csgo или cs2)
    // 2) Несоответствие ELO и уровня НЕ является ошибкой UI (только warning)
    const games = (player && player.games) || {}
    const effectiveGame = games[game] ? game : (games.csgo ? 'csgo' : (games.cs2 ? 'cs2' : null))

    if (!effectiveGame) {
        return { emit: true, reason: 'Нет данных по играм у игрока', details: { availableGames: Object.keys(games) } }
    }

    const gameStats = games[effectiveGame]
    const elo = Math.max(Number(gameStats.faceit_elo || 0), 1)
    const skillLevel = String(gameStats.skill_level || '')
    return { emit: false, reason: null, details: { elo, skill_level: skillLevel, effectiveGame } }
}

async function run() {
    const summary = { nickname, game, steps: [] }
    const logStep = (name, ok, extra = {}) => summary.steps.push({ name, ok, ...extra })

    const playerUrl = `${BASE_URL}/players?nickname=${encodeURIComponent(nickname)}&game=${encodeURIComponent(game)}`
    try {
        const { json: player } = await requestJson(playerUrl)
        logStep('players_lookup', true, { player_id: player.player_id })

        // UI может отправить запрос за статистикой по выбранной игре,
        // но при её отсутствии переключится на доступную игру (csgo/cs2).
        const uiCheckBeforeStats = computeUiProfileErrorIfAny(player, game)
        const effectiveGame = (uiCheckBeforeStats && uiCheckBeforeStats.details && uiCheckBeforeStats.details.effectiveGame) || game
        const statsUrl = `${BASE_URL}/players/${player.player_id}/stats/${encodeURIComponent(effectiveGame)}`
        try {
            const { json: stats } = await requestJson(statsUrl)
            logStep('player_stats', true, { has_lifetime: !!(stats && stats.lifetime) })
        } catch (e) {
            // Тест фиксирует исходную причину: для некоторых профилей stats отсутствует (404).
            // Это больше не считается фатальной ошибкой: UI должен продолжать работать без fullStats.
            if (e.status === 404) {
                logStep('player_stats', true, { tolerated_404: true })
            } else {
                logStep('player_stats', false, { error: String(e.message), status: e.status })
                console.log('FAIL: Stats request failed', JSON.stringify(summary, null, 2))
                process.exit(2)
            }
        }

        // Эмулируем логику UI — несоответствие ELO/уровня не должно ломать профиль
        const uiCheck = computeUiProfileErrorIfAny(player, game)
        if (uiCheck.emit) {
            logStep('ui_profile_error', false, { reason: uiCheck.reason, details: uiCheck.details, games: player.games })
            console.log('FAIL: UI would show profile error', JSON.stringify(summary, null, 2))
            process.exit(3)
        }

        console.log('PASS: Player loaded (stats optional)', JSON.stringify(summary, null, 2))
        process.exit(0)
    } catch (e) {
        // Common cases: 404 (not found) or 403 (Cloudflare/forbidden)
        const hint = e.status === 403 ? 'Blocked by Cloudflare or invalid token' : 'Player not found or other error'
        logStep('players_lookup', false, { error: String(e.message), status: e.status, hint })
        console.log('FAIL: Player lookup failed', JSON.stringify(summary, null, 2))
        process.exit(1)
    }
}

run().catch(e => {
    console.error('Unexpected error:', e)
    process.exit(99)
})