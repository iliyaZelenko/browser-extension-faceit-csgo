const test = require('node:test')
const assert = require('node:assert/strict')

const { selectEffectiveGame, getSafeGameStats, computeCurrentLevel, parseNicknameInput, resolveProfileUrl } = require('../../src/popup/utils/logic.cjs')

test('selectEffectiveGame: prefers selected, then csgo, then cs2', () => {
    assert.equal(selectEffectiveGame({ cs2: {} }, 'csgo'), 'cs2')
    assert.equal(selectEffectiveGame({ csgo: {} }, 'csgo'), 'csgo')
    assert.equal(selectEffectiveGame({ csgo: {}, cs2: {} }, 'cs2'), 'cs2')
    assert.equal(selectEffectiveGame({}, 'csgo'), null)
})

test('getSafeGameStats: returns any available stats', () => {
    const player = { games: { cs2: { faceit_elo: 900 } } }
    assert.deepEqual(getSafeGameStats(player, 'csgo'), { faceit_elo: 900 })
    assert.equal(getSafeGameStats({ games: {} }, 'csgo'), null)
})

test('computeCurrentLevel: tolerates mismatches and falls back', () => {
    const lvls = [
        { range: [1, 800], label: '1' },
        { range: [801, 950], label: '2' },
        { range: [951, 1100], label: '3' }
    ]

    // by label
    assert.equal(computeCurrentLevel(lvls, 500, 3).label, '3')
        // by elo when no label
    assert.equal(computeCurrentLevel(lvls, 820, undefined).label, '2')
        // default first level if nothing matches
    assert.equal(computeCurrentLevel([], 0, null).label, '1')
})

test('parseNicknameInput: parses faceit URL and raw nickname', () => {
  assert.equal(parseNicknameInput('unke666'), 'unke666')
  assert.equal(parseNicknameInput('https://www.faceit.com/en/players/unke666'), 'unke666')
  assert.equal(parseNicknameInput('https://www.faceit.com/ru/players/unke666/stats'), 'unke666')
})

test('resolveProfileUrl: replaces {lang} with provided code', () => {
  assert.equal(resolveProfileUrl('https://www.faceit.com/{lang}/players/foo', 'en'), 'https://www.faceit.com/en/players/foo')
  assert.equal(resolveProfileUrl('https://www.faceit.com/{lang}/players/foo', 'ru'), 'https://www.faceit.com/ru/players/foo')
  assert.equal(resolveProfileUrl('', 'en'), '')
})