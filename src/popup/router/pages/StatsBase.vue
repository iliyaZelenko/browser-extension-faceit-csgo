<template>
  <div style="width: 340px; min-height: 360px;">
    <div
      id="background"
      :style="{
        'background-image': backgroundImage
      }"
    />

    <div style="width: 100%; height: 60px; background: red;"></div>

    <div style="padding: 8px;">
      <!-- Хедер с элементами управления -->
      <div class="header-controls">
        <!-- Селектор игры -->
        <GameSelector @game-selected="onGameSelected" />
        
        <!-- Кнопки справа -->
        <div class="right-buttons">
          <!-- Кнопка избранных игроков -->
          <FavoritesListButton />
          
          <!-- Кнопка поддержки -->
          <SupportButton />
        </div>
      </div>

      <!-- Поле ввода игрока (скрывается на странице "Избранные игроки") -->
      <div 
        v-if="$route.name !== 'favorites'"
        style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 10px;"
      >
        <cool-select
          v-model="nickname"
          :items="players"
          :loading="loading"
          item-text="nickname"
          item-value="nickname"
          :placeholder="$browser.i18n.getMessage('playerSearchPlaceholder')"
          style="width: 100%;"
          disable-filtering-by-search
          @search="onSearch"
          @select="findPlayer"
          @click="nickname = null"
        >
          <template slot="no-data">
            {{
              noData
                ? $browser.i18n.getMessage('searchPlayerNoPlayeyFoundByRequest')
                : $browser.i18n.getMessage('searchPlayerMinimalLettersInfo', searchLettersLimit + '')
            }}
          </template>
          <template
            slot="item"
            slot-scope="{ item: playerSearch }"
          >
            <div style="display: flex; align-items: center;">
              <img
                :src="avatarOrDefault(playerSearch.avatar)"
                alt="avatar"
                style="width: 48px;"
              >

              <span style="margin-left: 10px;">
                {{ playerSearch.nickname }}
                <img
                  v-if="playerSearch.verified"
                  :src="$browser.runtime.getURL(`assets/verified.png`)"
                  alt="verified"
                  style="width: 16px;"
                >
              </span>

              <img
                :src="$browser.runtime.getURL(`assets/skill_level_${getPlayerSearchLvl(playerSearch)}_svg.svg`)"
                alt="lvl icon"
                style="width: 32px; margin-left: auto;"
              >
            </div>
          </template>
        </cool-select>
      </div>

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
import { CoolSelect } from 'vue-cool-select'
import AnimatedTabs from './components/AnimatedTabs.vue'
import FavoritesListButton from './components/FavoritesListButton.vue'
import GameSelector from './components/GameSelector.vue'
import SupportButton from './components/SupportButton.vue'
import { FACEIT_API, GAMES } from '../../utils/constants.js'

export default {
  components: { 
    CoolSelect, 
    AnimatedTabs,
    FavoritesListButton,
    GameSelector,
    SupportButton
  },
  data () {
    const storageNickname = localStorage.getItem('nickname')
    // Проверяем что значение не равно строке 'null' или null
    const validNickname = storageNickname && storageNickname !== 'null' ? storageNickname : null

    return {
      nickname: validNickname,
      players: [],
      player: null,
      fullStats: null,
      loading: false,
      searchTimeoutId: null,
      searchLettersLimit: 2,
      noData: false,
      API_HEADERS: FACEIT_API.HEADERS,
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
    tabs() {
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
      await this.onSearch(this.nickname)
      await this.findPlayer()
    }
    
    // Слушаем событие поиска игрока из списка избранных
    this.$root.$on('search-player', this.searchPlayerFromFavorites)
  },
  beforeDestroy() {
    // Убираем слушатель при уничтожении компонента
    this.$root.$off('search-player', this.searchPlayerFromFavorites)
  },
  methods: {
    setLocalStorageNickname (val) {
      this.localStorageNickname = val
    },
    onGameSelected(game) {
      const previousGame = this.selectedGame
      this.selectedGame = game
      
      // Если игра изменилась и есть выбранный игрок, перезагружаем данные
      if (previousGame !== game && this.player) {
        this.findPlayer()
      }
    },
    async findPlayer ({ nickname = this.nickname } = {}) {
      this.player = this.fullStats = null

      this.nickname = nickname

      if (this.nickname.length < 3) {
        this.$browser.notifications.create({
          type: 'basic',
          iconUrl: this.$browser.runtime.getURL('icons/page-48.png'),
          title: 'Nickname must be at least 2 characters.',
          message: ''
        })

        return
      }

      // parse url
      if (this.nickname.includes('faceit.com')) {
        this.nickname = this.nickname.match(/players\/(.*)/)[1]
        // remove all after nickname
        this.nickname = this.nickname.split('/')[0]
      }

      this.loading = true

      try {
        this.player = await this.$get(`${FACEIT_API.BASE_URL}/players?nickname=${this.nickname}&game=${this.selectedGame}`, {
          headers: this.API_HEADERS
        })
      } catch (e) {
        if (e.response.status === 404) {
          this.$browser.notifications.create({
            'type': 'basic',
            'iconUrl': this.$browser.runtime.getURL('icons/icon_48.png'),
            'title': 'Player not found.',
            'message': `Nickname ${this.nickname} not found.`
          })
        }

        console.log(e)

        this.player = null
      }

      if (this.player) {
        await this.$nextTick()
      }

      // gets all statistics
      if (this.player) {
        try {
          this.fullStats = await this.$get(`${FACEIT_API.BASE_URL}/players/${this.player.player_id}/stats/${this.selectedGame}`, {
            headers: this.API_HEADERS
          })
        } catch (e) {
          if (e.response.status === 404) {
            this.$browser.notifications.create({
              'type': 'basic',
              'iconUrl': this.$browser.runtime.getURL('icons/icon_48.png'),
              'title': 'Error from server.',
              'message': e.response.data.errors[0].message
            })
          }
        }
      }

      // end loading
      this.loading = false
    },
    onSearch (search) {
      const playersLimit = 5

      this.player = null
      this.noData = false

      if (search.length < this.searchLettersLimit) {
        this.players = []
        this.loading = false

        return
      }
      this.loading = true

      clearTimeout(this.searchTimeoutId)
      this.searchTimeoutId = setTimeout(async () => {
        try {
          const { items } = await this.$get(`${FACEIT_API.BASE_URL}/search/players?nickname=${search}&game=${this.selectedGame}&offset=0&limit=` + playersLimit, {
            headers: this.API_HEADERS
          })

          this.players = items

          if (!this.players.length) this.noData = true
        } catch (e) {
          this.players = []
          this.noData = true
        }

        this.loading = false
      }, 500)
    },
    onProfileError () {
      this.player = null
      // this.players = []
    },
    getPlayerSearchLvl (playerSearch) {
      return playerSearch.games.find(i => i.name === this.selectedGame).skill_level
    },
    avatarOrDefault (avatar) {
      if (!avatar || avatar === 'https://d50m6q67g4bn3.cloudfront.net/avatars/084a317c-6346-4dde-ab85-744f469fc217_1464715706995') {
        return this.defaultAvatar
      }

      return avatar
    },
    async searchPlayerFromFavorites(nickname) {
      // Устанавливаем никнейм
      this.nickname = nickname
      
      // Выполняем поиск
      await this.onSearch(nickname)
      await this.findPlayer()
    },
  }
}
</script>

<style lang="scss" scoped>
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

  .header-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    border: 1px solid rgba(245, 85, 0, 0.3);
    margin-bottom: 10px;
  }

  .right-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
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
