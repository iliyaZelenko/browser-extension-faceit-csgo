<template>
  <div class="game-selector">
    <div
      class="selected-game"
      @click="toggleDropdown"
    >
      <img
        :src="selectedGameData.image"
        :alt="selectedGameData.name"
        class="game-icon"
      >
      <span class="game-name">{{ selectedGameData.name }}</span>
      <i
        class="fas fa-chevron-down"
        :class="{ 'rotated': isOpen }"
      />
    </div>

    <div
      v-if="isOpen"
      class="dropdown"
    >
      <div
        v-for="game in games"
        :key="game.value"
        class="dropdown-item"
        :class="{ 'active': selectedGame === game.value }"
        @click="selectGame(game.value)"
      >
        <img
          :src="game.image"
          :alt="game.name"
          class="game-icon"
        >
        <span class="game-name">{{ game.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { GAMES } from '../../../utils/constants.js'

export default {
  name: 'GameSelector',
  data () {
    return {
      selectedGame: localStorage.getItem('selectedGame') || GAMES.CSGO,
      isOpen: false,
      games: [
        {
          value: 'csgo',
          name: 'CS:GO',
          image: 'https://assets.faceit-cdn.net/third_party/games/4f899245-2fa8-4e52-ad9a-4a363613c19e/assets/details/csgo_flag_s_1589795160776.jpg'
        },
        {
          value: 'cs2',
          name: 'CS2',
          image: 'https://distribution.faceit-cdn.net/images/ea5c4171-712f-4afd-a8ae-3fb5e1e2afb8.jpeg?width=24&height=24'
        }
      ]
    }
  },
  computed: {
    selectedGameData () {
      return this.games.find(game => game.value === this.selectedGame) || this.games[0]
    }
  },
  mounted () {
    // Эмитируем начальное значение игры
    this.$emit('game-selected', this.selectedGame)

    // Закрываем dropdown при клике вне компонента
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    toggleDropdown () {
      this.isOpen = !this.isOpen
    },
    selectGame (gameValue) {
      this.selectedGame = gameValue
      this.isOpen = false

      // Сохраняем выбор локально
      localStorage.setItem('selectedGame', gameValue)

      // Эмитируем событие изменения игры
      this.$emit('game-selected', gameValue)
    },
    handleOutsideClick (event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.game-selector {
  position: relative;
  min-width: 80px;
}

.selected-game {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: #2c2c2c;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #f50;
    background-color: #333;
  }

  .game-icon {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    object-fit: cover;
  }

  .game-name {
    color: white;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .fa-chevron-down {
    color: #ccc;
    font-size: 10px;
    transition: transform 0.3s ease;
    margin-left: auto;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #2c2c2c;
  border: 1px solid #444;
  border-radius: 6px;
  margin-top: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #3a3a3a;
  }

  &.active {
    background-color: rgba(245, 80, 0, 0.2);

    .game-name {
      color: #f50;
    }
  }

  .game-icon {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    object-fit: cover;
  }

  .game-name {
    color: white;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
}
</style>
