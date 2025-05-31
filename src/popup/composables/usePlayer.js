import { ref, reactive } from 'vue'
import { faceitApi } from '../services/faceitApi.js'

/**
 * Composable для управления состоянием игрока
 * @returns {Object} - объект с состоянием и методами управления игроком
 */
export function usePlayer () {
  const player = ref(null)
  const fullStats = ref(null)
  const nickname = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
     * Загружает данные игрока по никнейму
     * @param {string} playerNickname - Никнейм игрока
     * @param {string} game - Игра (csgo/cs2)
     * @returns {Promise<Object>} - Данные игрока и статистика
     */
  async function loadPlayer (playerNickname, game = 'csgo') {
    if (!playerNickname || playerNickname.length < 3) {
      throw new Error('Nickname must be at least 3 characters')
    }

    isLoading.value = true
    error.value = null

    try {
      // Парсим URL если передан
      let parsedNickname = playerNickname
      if (playerNickname.includes('faceit.com')) {
        parsedNickname = playerNickname.match(/players\/(.*)/)[1]
        parsedNickname = parsedNickname.split('/')[0]
      }

      // Загружаем данные игрока
      const playerData = await faceitApi.getPlayer(parsedNickname, game)

      // Загружаем статистику игрока
      let statsData = null
      if (playerData) {
        try {
          statsData = await faceitApi.getPlayerStats(playerData.player_id, game)
        } catch (e) {
          // Статистика может отсутствовать для некоторых игроков
          console.warn('Player stats not found:', e)
        }
      }

      // Обновляем состояние
      player.value = playerData
      fullStats.value = statsData
      nickname.value = parsedNickname

      return { player: playerData, fullStats: statsData, nickname: parsedNickname }
    } catch (e) {
      error.value = e
      resetPlayer()
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
     * Сбрасывает состояние игрока
     */
  function resetPlayer () {
    player.value = null
    fullStats.value = null
    nickname.value = null
    error.value = null
  }

  /**
     * Устанавливает данные игрока напрямую
     * @param {Object} playerData - Данные игрока
     * @param {Object} statsData - Статистика игрока
     * @param {string} playerNickname - Никнейм игрока
     */
  function setPlayer (playerData, statsData, playerNickname) {
    player.value = playerData
    fullStats.value = statsData
    nickname.value = playerNickname
    error.value = null
  }

  /**
     * Получает аватар игрока или дефолтный
     * @returns {string} - URL аватара
     */
  function getPlayerAvatar () {
    const defaultAvatar = 'https://cdn-frontend.faceit.com/web/54-1542827848/static/media/avatar_default_user_300x300.8befe042.jpg'

    if (!player.value || !player.value.avatar || player.value.avatar === 'https://d50m6q67g4bn3.cloudfront.net/avatars/084a317c-6346-4dde-ab85-744f469fc217_1464715706995') {
      return defaultAvatar
    }

    return player.value.avatar
  }

  /**
     * Получает статистику игрока для определенной игры
     * @param {string} game - Игра (csgo/cs2)
     * @returns {Object|null} - Статистика игры
     */
  function getGameStats (game = 'csgo') {
    if (!player.value || !player.value.games) return null
    return player.value.games[game] || player.value.games.csgo
  }

  return {
    player,
    fullStats,
    nickname,
    isLoading,
    error,
    loadPlayer,
    resetPlayer,
    setPlayer,
    getPlayerAvatar,
    getGameStats
  }
}
