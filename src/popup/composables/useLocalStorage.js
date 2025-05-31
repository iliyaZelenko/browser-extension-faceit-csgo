import { ref, watch } from 'vue'

/**
 * Composable для работы с localStorage
 * @param {string} key - Ключ в localStorage
 * @param {*} defaultValue - Значение по умолчанию
 * @returns {Object} - { value, setValue, removeValue }
 */
export function useLocalStorage (key, defaultValue = null) {
  const storedValue = localStorage.getItem(key)

  // Проверяем что значение не равно строке 'null' или null
  const validValue = storedValue && storedValue !== 'null' ? storedValue : defaultValue

  const value = ref(validValue)

  /**
     * Устанавливает значение в localStorage
     * @param {*} newValue - Новое значение
     */
  function setValue (newValue) {
    value.value = newValue

    if (newValue === null || newValue === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, newValue)
    }
  }

  /**
     * Удаляет значение из localStorage
     */
  function removeValue () {
    value.value = null
    localStorage.removeItem(key)
  }

  /**
     * Получает значение
     */
  function getValue () {
    return value.value
  }

  // Следим за изменениями и синхронизируем с localStorage
  watch(value, (newValue) => {
    if (newValue === null || newValue === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, newValue)
    }
  })

  return {
    value,
    setValue,
    removeValue,
    getValue
  }
}

/**
 * Composable для работы с никнеймом в localStorage
 */
export function useStoredNickname () {
  return useLocalStorage('nickname', null)
}

/**
 * Composable для работы с выбранной игрой в localStorage
 */
export function useSelectedGame () {
  return useLocalStorage('selectedGame', 'csgo')
}

/**
 * Composable для работы с избранными игроками
 */
export function useFavoriteUsers () {
  const { value, setValue } = useLocalStorage('favoriteUsers', '[]')

  function getFavorites () {
    try {
      return JSON.parse(value.value || '[]')
    } catch (e) {
      console.error('Error parsing favorite users:', e)
      return []
    }
  }

  function setFavorites (favorites) {
    setValue(JSON.stringify(favorites))
  }

  function addToFavorites (user) {
    const favorites = getFavorites()
    const isExists = favorites.some(fav => fav.player_id === user.player_id)

    if (!isExists) {
      favorites.push(user)
      setFavorites(favorites)
    }
  }

  function removeFromFavorites (playerId) {
    const favorites = getFavorites()
    const filtered = favorites.filter(fav => fav.player_id !== playerId)
    setFavorites(filtered)
  }

  function isInFavorites (playerId) {
    const favorites = getFavorites()
    return favorites.some(fav => fav.player_id === playerId)
  }

  return {
    getFavorites,
    setFavorites,
    addToFavorites,
    removeFromFavorites,
    isInFavorites
  }
}
