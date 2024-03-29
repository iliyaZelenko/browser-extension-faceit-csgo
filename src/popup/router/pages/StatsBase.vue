<template>
  <div style="width: 340px; min-height: 360px;">
    <div
      id="background"
      :style="{
        'background-image': backgroundImage
      }"
    />

    <div style="padding: 8px;">
      <div style="display: flex; justify-content: center;">
        <!--
        <input
          v-model="nickname"
          type="text"
          style="padding-left: 5px;"
          @keyup.enter="findPlayer"
        >-->

        <!--@keyup.enter="findPlayer"-->

        <cool-select
          v-model="nickname"
          :items="players"
          :loading="loading"
          item-text="nickname"
          item-value="nickname"
          placeholder="Enter player nickname"
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
        <!--
        &lt;!&ndash; gap &ndash;&gt;
        <div style="width: 10px;" />

        <button @click="findPlayer">
          <span v-if="loading">
            Loading...
          </span>
          <span v-else>
            {{ $browser.i18n.getMessage('getStats') }}
          </span>
        </button>
        -->
      </div>

      <div
        v-if="player"
        style="text-align: center; margin-top: 10px; margin-bottom: 20px;"
      >
        <router-link
          :to="{ name: 'index' }"
          class="page-link"
          exact
        >
          {{ $browser.i18n.getMessage('showEloStats') }}
        </router-link>

        <!-- gap -->
        <div style="width: 30px; display: inline-block;" />

        <router-link
          :to="{ name: 'full-stats' }"
          class="page-link"
        >
          {{ $browser.i18n.getMessage('showFullStats') }}
        </router-link>
      </div>

      <!-- VIEW -->
      <router-view
        :player="player"
        :nickname="nickname"
        :full-stats="fullStats"
        :local-storage-nickname="localStorageNickname"
        @profile-error="onProfileError"
        @set-local-storage-nickname="setLocalStorageNickname"
      />

    </div>
  </div>
</template>

<script>
import { CoolSelect } from 'vue-cool-select'

export default {
  components: { CoolSelect },
  data () {
    const TOKEN = 'Bearer 8c142d35-ba07-4de6-a14a-9f1e3e6109e8'
    const API_HEADERS = {
      accept: 'application/json',
      Authorization: TOKEN
    }
    const storageNickname = localStorage.getItem('nickname')

    return {
      nickname: storageNickname,
      players: [],
      player: null,
      fullStats: null,
      loading: false,
      searchTimeoutId: null,
      searchLettersLimit: 2,
      noData: false,
      API_HEADERS: API_HEADERS,
      defaultAvatar: 'https://cdn-frontend.faceit.com/web/54-1542827848/static/media/avatar_default_user_300x300.8befe042.jpg',
      localStorageNicknameData: storageNickname
    }
  },
  computed: {
    localStorageNickname: {
      get () {
        return this.localStorageNicknameData
      },
      set (nickname) {
        this.localStorageNicknameData = nickname

        localStorage.setItem('nickname', nickname)
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
    }
  },
  async created () {
    // if nickname was saved
    if (this.nickname) {
      await this.onSearch(this.nickname)
      await this.findPlayer()
    }
  },
  methods: {
    setLocalStorageNickname (val) {
      this.localStorageNickname = val
    },
    async findPlayer ({ nickname = this.nickname } = {}) {
      this.player = this.fullStats = null

      this.nickname = nickname

      if (this.nickname.length < 3) {
        browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('icons/page-48.png'),
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
        this.player = await this.$get(`https://open.faceit.com/data/v4/players?nickname=${this.nickname}&game=csgo`, {
          headers: this.API_HEADERS
        })
      } catch (e) {
        if (e.response.status === 404) {
          browser.notifications.create({
            'type': 'basic',
            'iconUrl': browser.runtime.getURL('icons/icon_48.png'),
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
          this.fullStats = await this.$get(`https://open.faceit.com/data/v4/players/${this.player.player_id}/stats/csgo`, {
            headers: this.API_HEADERS
          })
        } catch (e) {
          if (e.response.status === 404) {
            browser.notifications.create({
              'type': 'basic',
              'iconUrl': browser.runtime.getURL('icons/icon_48.png'),
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
          const { items } = await this.$get(`https://open.faceit.com/data/v4/search/players?nickname=${search}&game=csgo&offset=0&limit=` + playersLimit, {
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
      return playerSearch.games.find(i => i.name === 'csgo').skill_level
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
  .page-link {
    /*color: #FFC107 !important;*/
    color: white !important;
    font-size: 1.25rem;

  &.router-link-active {
    color: #f50 !important;
     /*color: #ffeb3b !important;*/
   }
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
