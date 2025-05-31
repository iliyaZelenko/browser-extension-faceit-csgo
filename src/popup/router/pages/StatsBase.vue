<template>
  <div class="stats-base">
    <div
      id="background"
      :style="{
        'background-image': backgroundImage
      }"
    />

    <div class="red-stripe" />

    <div class="content">
      <!-- Хедер с элементами управления -->
      <AppHeader @game-selected="onGameSelected" />

      <!-- Поле ввода игрока (скрывается на странице "Избранные игроки") -->
      <PlayerSearch
        v-if="$route.name !== 'favorites'"
        ref="playerSearch"
        :selected-game="selectedGame"
        :initial-nickname="nickname"
        @player-found="onPlayerFound"
        @player-error="onProfileError"
      />

      <!-- Табы (скрываются на странице "Избранные игроки") -->
      <AnimatedTabs
        v-if="player && $route.name !== 'favorites'"
        :tabs="tabs"
      />

      <!-- VIEW -->
      <router-view
        :player="player"
        :nickname="nickname"
        :full-stats="fullStats"
        :local-storage-nickname="localStorageNickname"
        :selected-game="selectedGame"
        @profile-error="onProfileError"
        @set-local-storage-nickname="setLocalStorageNickname"
      />

    </div>
  </div>
</template>

<script>
import AnimatedTabs from './components/AnimatedTabs.vue'
import AppHeader from './components/AppHeader.vue'
import PlayerSearch from './components/PlayerSearch.vue'
import { GAMES } from '../../utils/constants.js'

export default {
  components: {
    AnimatedTabs,
    AppHeader,
    PlayerSearch
  },
  data () {
    const storageNickname = localStorage.getItem('nickname')
    // Проверяем что значение не равно строке 'null' или null
    const validNickname = storageNickname && storageNickname !== 'null' ? storageNickname : null

    return {
      nickname: validNickname,
      player: null,
      fullStats: null,
      defaultAvatar: 'https://cdn-frontend.faceit.com/web/54-1542827848/static/media/avatar_default_user_300x300.8befe042.jpg',
      localStorageNicknameData: validNickname,
      selectedGame: localStorage.getItem('selectedGame') || GAMES.CSGO
    }
  },
  computed: {
    localStorageNickname: {
      get () {
        return this.localStorageNicknameData
      },
      set (nickname) {
        this.localStorageNicknameData = nickname

        if (nickname === null) {
          localStorage.removeItem('nickname')
        } else {
          localStorage.setItem('nickname', nickname)
        }
      }
    },
    backgroundImage () {
      const avatar =
        (
          this.player &&
          this.player.avatar
        )
          ? this.avatarOrDefault(this.player.avatar)
          : this.defaultAvatar

      return `url(${avatar})`
    },
    tabs () {
      return [
        {
          name: 'index',
          to: { name: 'index' },
          icon: 'fas fa-chart-line'
        },
        {
          name: 'full-stats',
          to: { name: 'full-stats' },
          icon: 'fas fa-chart-bar'
        },
        {
          name: 'match-history',
          to: { name: 'match-history' },
          icon: 'fas fa-history'
        }
      ]
    }
  },
  async created () {
    // if nickname was saved
    if (this.nickname) {
      // Эмулируем поиск для сохраненного никнейма
      this.$nextTick(() => {
        this.$refs.playerSearch?.findPlayer({ nickname: this.nickname })
      })
    }

    // Слушаем событие поиска игрока из списка избранных
    this.$root.$on('search-player', this.searchPlayerFromFavorites)
  },
  beforeDestroy () {
    // Убираем слушатель при уничтожении компонента
    this.$root.$off('search-player', this.searchPlayerFromFavorites)
  },
  methods: {
    setLocalStorageNickname (val) {
      this.localStorageNickname = val
    },
    onGameSelected (game) {
      const previousGame = this.selectedGame
      this.selectedGame = game

      // Если игра изменилась и есть выбранный игрок, перезагружаем данные
      if (previousGame !== game && this.player) {
        this.$refs.playerSearch?.findPlayer()
      }
    },
    onPlayerFound ({ player, fullStats, nickname }) {
      this.player = player
      this.fullStats = fullStats
      this.nickname = nickname
    },
    onProfileError () {
      this.player = null
      this.fullStats = null
    },
    avatarOrDefault (avatar) {
      if (!avatar || avatar === 'https://d50m6q67g4bn3.cloudfront.net/avatars/084a317c-6346-4dde-ab85-744f469fc217_1464715706995') {
        return this.defaultAvatar
      }
      return avatar
    },
    async searchPlayerFromFavorites (nickname) {
      // Устанавливаем никнейм и выполняем поиск через компонент PlayerSearch
      this.nickname = nickname
      this.$refs.playerSearch?.findPlayer({ nickname })
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-base {
  width: 340px;
  min-height: 360px;
}

#background {
  position: absolute;
  width: 100%;
  height: 100vh;
  -webkit-filter: grayscale(100%) blur(2px);
  filter: grayscale(100%) blur(2px);
  background: no-repeat center;
  background-size: cover;
  z-index: -1;
}

.red-stripe {
  width: 100%;
  height: 60px;
  background: red;
}

.content {
  padding: 8px;
}
</style>

<!--
{
  "items": [
    {
      "player_id": "bce53ecc-77bd-49fe-86c4-928a60955818",
      "nickname": "kickeR",
      "status": "BUSY",
      "games": [
        {
          "name": "csgo",
          "skill_level": "9"
        },
        {
          "name": "pubg",
          "skill_level": "4"
        }
      ],
      "country": "CV",
      "verified": false,
      "avatar": "https://cdn.faceit.com/avatars/bce53ecc-77bd-49fe-86c4-928a60955818_1538342420871.jpg"
    },
    ...
}-->
