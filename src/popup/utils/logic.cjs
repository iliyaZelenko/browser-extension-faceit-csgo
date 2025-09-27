function selectEffectiveGame(games, selectedGame) {
    const g = games || {}
    if (g[selectedGame]) return selectedGame
    if (g.csgo) return 'csgo'
    if (g.cs2) return 'cs2'
    return null
}

function getSafeGameStats(player, selectedGame) {
    const games = (player && player.games) || {}
    return games[selectedGame] || games.csgo || games.cs2 || null
}

function computeCurrentLevel(lvls, faceitElo, skillLevel) {
    const levels = Array.isArray(lvls) ? lvls : []
    const elo = Math.max(Number(faceitElo || 0), 1)
    const skillLabel = skillLevel != null ? String(skillLevel) : undefined
    const byElo = levels.find(l => l.range[0] <= elo && elo <= l.range[1])
    const byLabel = levels.find(l => l.label === skillLabel)
    return byLabel || byElo || levels[0] || { label: '1', range: [1, 800] }
}

function parseNicknameInput(input) {
  if (!input || typeof input !== 'string') return ''
  if (!input.includes('faceit.com')) return input
  const match = input.match(/players\/([^\/?#]+)/i)
  return match ? match[1] : input
}

function resolveProfileUrl(faceitUrl, lang = 'en') {
  if (!faceitUrl || typeof faceitUrl !== 'string') return ''
  return faceitUrl.replace(/{lang}/, lang)
}

module.exports = {
    selectEffectiveGame,
    getSafeGameStats,
  computeCurrentLevel,
  parseNicknameInput,
  resolveProfileUrl
}