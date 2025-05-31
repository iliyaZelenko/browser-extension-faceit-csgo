<template>
  <div class="player-search">
    <cool-select
      v-model="nickname"
      :items="players"
      :loading="loading"
      item-text="nickname"
      item-value="nickname"
      :placeholder="$browser.i18n.getMessage('playerSearchPlaceholder')"
      class="search-select"
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
        <div class="search-item">
          <img
            :src="avatarOrDefault(playerSearch.avatar)"
            alt="avatar"
            class="search-avatar"
          >

          <span class="search-name">
            {{ playerSearch.nickname }}
            <img
              v-if="playerSearch.verified"
              :src="$browser.runtime.getURL(`assets/verified.png`)"
              alt="verified"
              class="verified-icon"
            >
          </span>

          <img
            :src="$browser.runtime.getURL(`assets/skill_level_${getPlayerSearchLvl(playerSearch)}_svg.svg`)"
            alt="lvl icon"
            class="level-icon"
          >
        </div>
      </template>
    </cool-select>
  </div>
</template>

<script>
import { CoolSelect } from 'vue-cool-select'
import { faceitApi } from '../../../services/faceitApi.js'
import { logWarning, logUserAction, logCriticalError } from '../../../services/sentry.js'

export default {
  name: 'PlayerSearch',
  components: {
    CoolSelect
  },
  props: {
    selectedGame: {
      type: String,
      default: 'csgo'
    },
    initialNickname: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      nickname: this.initialNickname,
      players: [],
      loading: false,
      searchTimeoutId: null,
      searchLettersLimit: 2,
      noData: false,
      defaultAvatar: 'https://cdn-frontend.faceit.com/web/54-1542827848/static/media/avatar_default_user_300x300.8befe042.jpg'
    }
  },
  watch: {
    selectedGame () {
      // При смене игры очищаем результаты поиска
      this.players = []
      this.noData = false
    },
    initialNickname (newNickname) {
      this.nickname = newNickname
    }
  },
  methods: {
    async findPlayer ({ nickname = this.nickname } = {}) {
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
        
        logUserAction('parse_faceit_url', { 
          originalInput: nickname,
          parsedNickname: this.nickname 
        })
      }

      this.loading = true

      try {
        const player = await faceitApi.getPlayer(this.nickname, this.selectedGame)

        // Получаем статистику игрока
        let fullStats = null
        if (player) {
          try {
            fullStats = await faceitApi.getPlayerStats(player.player_id, this.selectedGame)
          } catch (e) {
            if (e.message.includes('404')) {
              logWarning('Player stats not found', {
                player_id: player.player_id,
                nickname: this.nickname,
                selectedGame: this.selectedGame
              })
              
              this.$browser.notifications.create({
                'type': 'basic',
                'iconUrl': this.$browser.runtime.getURL('icons/icon_48.png'),
                'title': 'Error from server.',
                'message': 'Player stats not found'
              })
            } else {
              // Неожиданная ошибка при загрузке статистики
              logCriticalError(e, {
                context: 'player_stats_loading',
                player_id: player.player_id,
                nickname: this.nickname,
                selectedGame: this.selectedGame
              })
            }
          }
        }

        logUserAction('player_found_successfully', {
          nickname: this.nickname,
          player_id: player?.player_id,
          hasStats: !!fullStats
        })

        this.$emit('player-found', { player, fullStats, nickname: this.nickname })
      } catch (e) {
        if (e.message.includes('404')) {
          logWarning('Player not found', {
            nickname: this.nickname,
            selectedGame: this.selectedGame
          })
          
          this.$browser.notifications.create({
            'type': 'basic',
            'iconUrl': this.$browser.runtime.getURL('icons/icon_48.png'),
            'title': 'Player not found.',
            'message': `Nickname ${this.nickname} not found.`
          })
        } else {
          // Неожиданная ошибка при поиске игрока
          logCriticalError(e, {
            context: 'player_search',
            nickname: this.nickname,
            selectedGame: this.selectedGame
          })
        }

        this.$emit('player-error')
        console.error(e)
      }

      this.loading = false
    },

    async onSearch (search) {
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
          const { items } = await faceitApi.searchPlayers(search, this.selectedGame, 5)
          this.players = items || []

          if (!this.players.length) {
            this.noData = true
          }
          
          logUserAction('autocomplete_search_completed', {
            search,
            resultCount: this.players.length,
            selectedGame: this.selectedGame
          })
        } catch (e) {
          this.players = []
          this.noData = true
          
          logWarning('Autocomplete search failed', {
            search,
            selectedGame: this.selectedGame,
            error: e.message
          })
        }

        this.loading = false
      }, 500)
    },

    getPlayerSearchLvl (playerSearch) {
      return playerSearch.games.find(i => i.name === this.selectedGame)?.skill_level || 1
    },

    avatarOrDefault (avatar) {
      if (!avatar || avatar === 'https://d50m6q67g4bn3.cloudfront.net/avatars/084a317c-6346-4dde-ab85-744f469fc217_1464715706995') {
        return this.defaultAvatar
      }
      return avatar
    }
  }
}
</script>

<style lang="scss" scoped>
.player-search {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.search-select {
  width: 100%;
}

.search-item {
  display: flex;
  align-items: center;
}

.search-avatar {
  width: 48px;
}

.search-name {
  margin-left: 10px;
}

.verified-icon {
  width: 16px;
}

.level-icon {
  width: 32px;
  margin-left: auto;
}
</style>
