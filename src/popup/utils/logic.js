/**
 * Выбрать эффективную игру на основе объекта games и выбранной игры.
 * Приоритет: выбранная -> csgo -> cs2 -> null
 */
export function selectEffectiveGame(games, selectedGame) {
    const g = games || {}
    if (g[selectedGame]) return selectedGame
    if (g.csgo) return 'csgo'
    if (g.cs2) return 'cs2'
    return null
}

/**
 * Вернуть безопасные stats по игре, используя фолбеки.
 */
export function getSafeGameStats(player, selectedGame) {
    const games = (player && player.games) || {}
    return games[selectedGame] || games.csgo || games.cs2 || null
}

/**
 * Рассчитать "текущий уровень" с терпимой логикой: несоответствие elo/level не ошибка.
 * Возвращает объект {label, range:[min,max]} либо дефолтный первый уровень.
 */
export function computeCurrentLevel(lvls, faceitElo, skillLevel) {
    const levels = Array.isArray(lvls) ? lvls : []
    const elo = Math.max(Number(faceitElo || 0), 1)
    const skillLabel = skillLevel != null ? String(skillLevel) : undefined
    const byElo = levels.find(l => l.range[0] <= elo && elo <= l.range[1])
    const byLabel = levels.find(l => l.label === skillLabel)
    return byLabel || byElo || levels[0] || { label: '1', range: [1, 800] }
}

/**
 * Парсинг ввода пользователя: ник или faceit URL → ник.
 */
export function parseNicknameInput(input) {
    if (!input || typeof input !== 'string') return ''
    if (!input.includes('faceit.com')) return input
    const match = input.match(/players\/([^\/?#]+)/i)
    return match ? match[1] : input
}

/**
 * Подстановка языка в ссылку профиля faceit.
 */
export function resolveProfileUrl(faceitUrl, lang = 'en') {
    if (!faceitUrl || typeof faceitUrl !== 'string') return ''
    return faceitUrl.replace(/{lang}/, lang)
}