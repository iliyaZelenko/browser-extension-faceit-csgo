const test = require('node:test')
const assert = require('node:assert/strict')
const https = require('https')

const BASE_URL = 'https://open.faceit.com/data/v4'
const VALID_HEADERS = {
    accept: 'application/json',
    Authorization: 'Bearer 8c142d35-ba07-4de6-a14a-9f1e3e6109e8'
}

function request(url, headers = VALID_HEADERS) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'GET', headers }, res => {
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

test('invalid token → 400/401/403 (authorization failure)', async() => {
    const headers = { accept: 'application/json', Authorization: 'Bearer INVALID' }
    const url = `${BASE_URL}/players?nickname=s1mple&game=csgo`
    await assert.rejects(() => request(url, headers), (e) => e && (e.status === 400 || e.status === 401 || e.status === 403))
})

test('missing token → 401/403 (unauthorized)', async() => {
    const headers = { accept: 'application/json' }
    const url = `${BASE_URL}/players?nickname=s1mple&game=csgo`
    await assert.rejects(() => request(url, headers), (e) => e && (e.status === 401 || e.status === 403))
})

test('network error handling (ENOTFOUND on wrong host)', async() => {
    // Запрос на несуществующий хост для симуляции сетевой ошибки
    await assert.rejects(() => new Promise((resolve, reject) => {
        const req = https.request('https://nonexistent.faceit.invalid/data/v4/players?nickname=a&game=csgo', { method: 'GET' }, () => {})
        req.on('error', reject)
        req.end()
    }), (e) => e && (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN'))
})