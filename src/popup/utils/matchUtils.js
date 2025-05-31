/**
 * @fileoverview Утилиты для работы с матчами FACEIT
 * Содержит функции для определения результатов матчей, поиска команд игроков и других операций
 */

/**
 * @typedef {Object} Team
 * @property {string} factionId - ID фракции/команды
 * @property {string} team_id - ID команды
 * @property {string} nickname - Название команды
 * @property {Array<Object>} players - Массив игроков в команде
 */

/**
 * @typedef {Object} MatchResult
 * @property {string} winner - ID победившей команды
 * @property {Object} score - Счет матча по командам
 */

/**
 * @typedef {Object} Match
 * @property {string} match_id - Уникальный ID матча
 * @property {Object} teams - Объект с командами (ключ - ID фракции, значение - данные команды)
 * @property {MatchResult} results - Результаты матча
 * @property {number} created_at - Время создания матча (Unix timestamp)
 * @property {number} updated_at - Время обновления матча (Unix timestamp)
 */

/**
 * Находит команду игрока в матче
 * Проходит по всем командам и ищет игрока с указанным ID
 *
 * @param {Match} match - Данные матча
 * @param {string} playerId - Уникальный ID игрока
 * @returns {Team|null} Команда с расширенным объектом (включает factionId) или null если не найдена
 *
 * @example
 * const match = { teams: { faction1: { players: [{ player_id: '123' }] } } }
 * const team = findPlayerTeam(match, '123')
 * console.log(team.factionId) // 'faction1'
 */
export function findPlayerTeam (match, playerId) {
  if (!match.teams) return null

  for (const [factionId, team] of Object.entries(match.teams)) {
    if (team.players && team.players.some(player => player.player_id === playerId)) {
      return { factionId: factionId, ...team }
    }
  }
  return null
}

/**
 * Определяет результат матча для конкретного игрока
 *
 * @param {Match} match - Данные матча
 * @param {string} playerId - Уникальный ID игрока
 * @returns {'win'|'loss'|'unknown'} Результат матча для игрока
 *
 * @example
 * const result = getMatchResult(match, 'player-123')
 * if (result === 'win') {
 *   console.log('Игрок выиграл!')
 * }
 */
export function getMatchResult (match, playerId) {
  const playerTeam = findPlayerTeam(match, playerId)
  if (playerTeam && match.results && match.results.winner) {
    return match.results.winner === playerTeam.factionId ? 'win' : 'loss'
  }
  return 'unknown'
}

/**
 * Получает текстовое описание результата матча с интернационализацией
 *
 * @param {Match} match - Данные матча
 * @param {string} playerId - Уникальный ID игрока
 * @param {Function} i18nFunc - Функция интернационализации для получения переводов
 * @returns {string} Локализованный текст результата ('Win', 'Loss', 'N/A')
 *
 * @example
 * const text = getMatchResultText(match, playerId, (key) => translations[key])
 * console.log(text) // 'Победа' или 'Поражение'
 */
export function getMatchResultText (match, playerId, i18nFunc) {
  const result = getMatchResult(match, playerId)
  if (result === 'win') return i18nFunc('win') || 'Win'
  if (result === 'loss') return i18nFunc('loss') || 'Loss'
  return 'N/A'
}

/**
 * Получает краткое обозначение результата матча (W/L)
 * Полезно для компактного отображения в UI
 *
 * @param {Match} match - Данные матча
 * @param {string} playerId - Уникальный ID игрока
 * @returns {'W'|'L'|'N/A'} Буквенное обозначение результата
 *
 * @example
 * const letter = getMatchResultLetter(match, playerId)
 * // Использование в UI: <span class={result}>{letter}</span>
 */
export function getMatchResultLetter (match, playerId) {
  const result = getMatchResult(match, playerId)
  if (result === 'win') return 'W'
  if (result === 'loss') return 'L'
  return 'N/A'
}

/**
 * Получает CSS класс для стилизации результата матча
 * Используется для применения соответствующих стилей (цвета, иконки)
 *
 * @param {Match} match - Данные матча
 * @param {string} playerId - Уникальный ID игрока
 * @returns {'win'|'loss'|'unknown'} CSS класс для результата
 *
 * @example
 * const cssClass = getMatchResultClass(match, playerId)
 * // <div className={`match-result ${cssClass}`}>
 */
export function getMatchResultClass (match, playerId) {
  return getMatchResult(match, playerId)
}

/**
 * Проверяет наличие данных о командах в матче
 * Используется для валидации данных перед обработкой
 *
 * @param {Match} match - Данные матча
 * @returns {boolean} true если данные о командах присутствуют и корректны
 *
 * @example
 * if (hasTeamData(match)) {
 *   const result = getMatchResult(match, playerId)
 * } else {
 *   console.log('Недостаточно данных о матче')
 * }
 */
export function hasTeamData (match) {
  return match && match.teams && Object.keys(match.teams).length > 0
}

/**
 * Извлекает общий счет матча
 * Парсит счет из результатов матча для отображения
 *
 * @param {Match} match - Данные матча
 * @returns {Object|null} Объект со счетом { team1Score, team2Score } или null
 *
 * @example
 * const score = getMatchScore(match)
 * if (score) {
 *   console.log(`Счет: ${score.team1Score} - ${score.team2Score}`)
 * }
 */
export function getMatchScore (match) {
  if (!match.results || !match.results.score) return null

  const scores = Object.values(match.results.score)
  return scores.length === 2 ? {
    team1Score: scores[0],
    team2Score: scores[1]
  } : null
}
