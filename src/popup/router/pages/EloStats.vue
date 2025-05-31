<template>
  <div v-if="player" class="elo-stats-wrapper">
    <div style="text-align: center; margin-bottom: 10px;">
      <a
        href="#"
        @click="openProfile"
      >
        {{ $browser.i18n.getMessage('goToProfile') }}

        <b>{{ nickname }}</b>
      </a>
      <img
        :src="`https://flagsapi.com/${player.country.toUpperCase()}/flat/16.png`"
        alt="flag"
        style="vertical-align: middle;"
      >
    </div>
    <!--
    <img
      v-if="player.avatar"
      :src="player.avatar"
      alt="Avatar"
      style="width: 100%;"
    >-->
    <!--
    <div style="display: flex; justify-content: center;">
      <div
        v-for="(result, i) in fullStats.lifetime['Recent Results']"
        :key="'last-result-' + i"
      >
        <span :class="(+result ? 'win-result' : 'lose-result') + '  result'">
          {{ +result ? 'W' : 'L' }}
        </span>
      </div>
    </div>-->

    <div
      v-if="csgoStats && csgoStats.skill_level && fullStats"
      style="padding: 0 5px;"
    >
      <p style="display: flex; align-items: center;">
        {{ $browser.i18n.getMessage('level') }}
        <!--<b class="value">{{ csgoStats.skill_level }}</b>.-->
        <img
          :src="$browser.runtime.getURL(`assets/skill_level_${csgoStats.skill_level}_svg.svg`)"
          alt="lvl icon"
          style="width: 32px; margin-left: 6px;"
        >
      </p>
      <p>
        {{ $browser.i18n.getMessage('elo') }}
        <b class="value">{{ csgoStats.faceit_elo }}</b>.
      </p>

      <p>
        {{ $browser.i18n.getMessage('eloRangeFor', csgoStats.skill_level) }}
        <b class="value">{{ currentLvl.range[0] }} - {{ currentLvl.range[1] === maxElo ? '∞' : currentLvl.range[1] }}</b>.
      </p>

      <!-- Progress -->
      <template v-if="csgoStats.skill_level < 10">
        <div
          :data-label="progressLabel"
          class="progress"
        >
          <span
            class="value"
            :style="`width: ${Math.floor(csgoStats.faceit_elo / currentLvlNextLvlStart * 100)}%;`"
          />
        </div>
      </template>

      <p>
        <span v-if="csgoStats.skill_level < 10">
          {{ $browser.i18n.getMessage('playerCanRaiseLvlIfHeGets') }}
          <b class="value">{{ lvls[currentLvlIndex + 1].range[0] - csgoStats.faceit_elo }}</b> elo.
        </span>
        <span v-else>
          {{ $browser.i18n.getMessage('playerHas') }}
          <b class="value">{{ $browser.i18n.getMessage('maximalLvl') }}</b>.
        </span>
      </p>

      <p>
        <span v-if="csgoStats.skill_level > 1">
          {{ $browser.i18n.getMessage('playerMayLoseLvlIfHeLoses') }}
          <b class="value">{{ csgoStats.faceit_elo - lvls[currentLvlIndex - 1].range[1] }}</b> elo.
        </span>
        <span v-else>
          {{ $browser.i18n.getMessage('playerHas') }}
          <b class="value">{{ $browser.i18n.getMessage('minimalLvl') }}</b>.
        </span>
      </p>

      <div>
        <RecentResults
          :results="fullStats.lifetime['Recent Results']"
          @go-to-match="goToSpecificMatch"
        />
      </div>
    </div>

    <div style="text-align: center; margin-top: 10px;">
      <label class="save-profile-checkbox">
        <input 
          type="checkbox" 
          :checked="localStorageNickname === nickname"
          @change="toggleSaveProfile"
        >
        <span class="checkmark"></span>
        <span class="checkbox-label">
          {{ $browser.i18n.getMessage('showThisProfileAfterOpening') }}
        </span>
      </label>
    </div>
  </div>
  
  <!-- Empty State когда игрок не выбран -->
  <EmptyState v-else />
</template>

<script>
import EmptyState from './components/EmptyState.vue'
import RecentResults from './components/RecentResults.vue'

export default {
  components: {
    EmptyState,
    RecentResults
  },
  props: {
    player: {
      type: Object,
      default: () => ({})
    },
    fullStats: {
      type: Object,
      default: () => ({})
    },
    nickname: {
      type: String,
      default: null
    },
    localStorageNickname: {
      type: String,
      default: null
    }
  },
  data () {
    const maxElo = 9999

    return {
      maxElo,
      lvls: [
        { range: [1, 800], label: '1' },
        { range: [801, 950], label: '2' },
        { range: [951, 1100], label: '3' },
        { range: [1101, 1250], label: '4' },
        { range: [1251, 1400], label: '5' },
        { range: [1401, 1550], label: '6' },
        { range: [1551, 1700], label: '7' },
        { range: [1701, 1850], label: '8' },
        { range: [1851, 2000], label: '9' },
        { range: [2001, maxElo], label: '10' }
      ]
    }
  },
  computed: {
    progressLabel () {
      return `${this.csgoStats.faceit_elo} / ${this.currentLvlNextLvlStart} (${Math.floor(this.csgoStats.faceit_elo / this.currentLvlNextLvlStart * 100)} %)`
    },
    profileUrl () {
      return this.player.faceit_url.replace(/{lang}/, 'en')
    },
    csgoStats () {
      return this.player.games.csgo
    },
    currentLvl () {
      // faceit может иметь 0 эло
      const elo = Math.max(this.csgoStats.faceit_elo, 1)
      const range = this.lvls.find(i => i.range[0] <= elo && elo <= i.range[1] && i.label === this.csgoStats.skill_level.toString())

      if (!range) {
        this.$browser.notifications.create({
          'type': 'basic',
          'iconUrl': this.$browser.runtime.getURL('icons/icon_48.png'),
          'title': 'Invalid profile.',
          'message': `This player has a mismatch of elo points (${elo} elo) to his lvl (${this.csgoStats.skill_level} lvl).`
        })

        this.$emit('profile-error')
      }

      return range
    },
    currentLvlIndex () {
      return this.lvls.indexOf(this.currentLvl)
    },
    currentLvlNextLvlStart () {
      return this.lvls[this.currentLvlIndex + 1].range[0]
    }
  },
  methods: {
    openProfile () {
      // var creating =
      this.$browser.tabs.create({
        url: this.profileUrl
      })
      // creating.then(onCreated, onError)
      //
      // function onCreated (tab) {
      //   console.log(`Created new tab: ${tab.id}`)
      // }
      //
      // function onError (error) {
      //   console.log(`Error: ${error}`)
      // }
    },
    toggleSaveProfile () {
      this.$emit('set-local-storage-nickname', this.localStorageNickname === this.nickname ? null : this.nickname)
    },
    goToSpecificMatch(matchIndex) {
      this.$router.push({ 
        name: 'match-history', 
        query: { highlight: matchIndex } 
      })
    }
  }
}
</script>

<style scoped>
  .elo-stats-wrapper {
    background: rgba(0, 0, 0, 0.8);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(245, 85, 0, 0.3);
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .value {
    color: #f50;
    font-weight: bold;
  }

  .win-result {
    color: #5dbb29 !important;
  }

  .lose-result {
    color: #d64242 !important;
  }

  .result {
    font-size: 18px;
    font-weight: 700;
    margin: 2px;
  }

  /* Progress-bar */
  .progress {
    height: 2.8em;
    width: 100%;
    background-color: #c9c9c9;
    position: relative;
  }
  .progress:before {
    content: attr(data-label);
    font-size: 1.5em;
    position: absolute;
    text-align: center;
    top: 5px;
    left: 0;
    right: 0;
  }
  .progress .value {
    background-color: #7cc4ff;
    display: inline-block;
    height: 100%;
  }

  .save-profile-checkbox {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .save-profile-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    height: 20px;
    width: 20px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .save-profile-checkbox:hover input ~ .checkmark {
    background-color: rgba(245, 85, 0, 0.2);
    border-color: rgba(245, 85, 0, 0.6);
  }

  .save-profile-checkbox input:checked ~ .checkmark {
    background-color: #f50;
    border-color: #f50;
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .save-profile-checkbox input:checked ~ .checkmark:after {
    display: block;
  }

  .save-profile-checkbox .checkmark:after {
    left: 6px;
    top: 3px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  .checkbox-label {
    margin-left: 10px;
    color: white;
    line-height: 1.2;
  }
</style>

<!--
{
  "player_id": "aeb518be-075e-4a8e-9ab4-070c270c4e30",
  "nickname": "Kicker_IZ",
  "avatar": "https://d50m6q67g4bn3.cloudfront.net/avatars/aeb518be-075e-4a8e-9ab4-070c270c4e30_1478454446779",
  "country": "ua",
  "cover_image": "",
  "cover_featured_image": "",
  "infractions": {
    "last_infraction_date": "Thu Jan 25 02:07:29 UTC 2018",
    "afk": 0,
    "leaver": 0,
    "qm_not_checkedin": 1,
    "qm_not_voted": 0
  },
  "platforms": {
    "steam": "STEAM_1:0:132106954"
  },
  "games": {
    "csgo": {
      "game_profile_id": "5c6b863f-3b7a-4925-9f2e-d3d4971a320d",
      "region": "EU",
      "regions": {
        "EU": {
          "selected_ladder_id": "24e6d014-7613-428a-8600-fedfee6dc718"
        }
      },
      "skill_level": "10",
      "game_player_id": "76561198224479636",
      "skill_level": 10,
      "faceit_elo": 2130,
      "game_player_name": "koala"
    }
  },
  "settings": {
    "language": "ru"
  },
  "friends_ids": [
    "b0366396-e719-4e44-8124-d73a3f255add"
  ],
  "bans": [],
  "new_steam_id": "[U:1:264213908]",
  "steam_id_64": "76561198224479636",
  "steam_nickname": "Kicker",
  "membership_type": "free",
  "memberships": [
    "free"
  ],
  "faceit_url": "https://www.faceit.com/{lang}/players/Kicker_IZ"
}-->
