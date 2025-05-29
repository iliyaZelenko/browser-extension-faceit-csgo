<template>
  <div v-if="fullStats" class="full-stats-wrapper">
    <!-- Background with player avatar -->
    <div
      id="background"
      :style="{
        'background-image': backgroundImage
      }"
    />

    <div class="overall-stats">
      <h2>{{ $browser.i18n.getMessage('overallStatistics') || 'Общая статистика' }}</h2>
      <div class="stats-table">
        <div class="stat-row">
          <span class="stat-with-icon">
            <i class="fas fa-bullseye"></i>
            {{ $browser.i18n.getMessage('averageHeadshots') }}
          </span>
          <span class="value">{{ lifetime['Average Headshots %'] }}%</span>
        </div>

        <div class="stat-row">
          <span class="stat-with-icon">
            <i class="fas fa-crosshairs"></i>
            {{ $browser.i18n.getMessage('averageKDRatio') }}
          </span>
          <span class="value">{{ lifetime['Average K/D Ratio'] }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-with-icon">
            <i class="fas fa-fire"></i>
            {{ $browser.i18n.getMessage('currentWinStreak') }}
          </span>
          <span class="value">{{ lifetime['Current Win Streak'] }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-with-icon">
            <i class="fas fa-calendar-alt"></i>
            {{ $browser.i18n.getMessage('matches') }}
          </span>
          <span class="value">{{ lifetime['Matches'] }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-with-icon">
            <i class="fas fa-trophy"></i>
            {{ $browser.i18n.getMessage('wins') }}
          </span>
          <span class="value">{{ lifetime['Wins'] }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-with-icon">
            <i class="fas fa-percentage"></i>
            {{ $browser.i18n.getMessage('winRate') }}
          </span>
          <span class="value">{{ lifetime['Win Rate %'] }}%</span>
        </div>

        <div class="stat-row">
          <span class="stat-with-icon">
            <i class="fas fa-crown"></i>
            {{ $browser.i18n.getMessage('longestWinStreak') }}
          </span>
          <span class="value">{{ lifetime['Longest Win Streak'] }}</span>
        </div>
      </div>
    </div>

    <MapSelector
      :maps="maps"
      :full-stats="fullStats"
    />
  </div>
</template>

<script>
import MapSelector from './components/MapSelector.vue'

export default {
  components: {
    MapSelector
  },
  props: {
    player: {
      type: Object,
      default: () => ({})
    },
    fullStats: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      defaultAvatar: 'https://cdn-frontend.faceit.com/web/54-1542827848/static/media/avatar_default_user_300x300.8befe042.jpg'
    }
  },
  computed: {
    backgroundImage() {
      const avatar =
        (
          this.player &&
          this.player.avatar
        )
          ? this.avatarOrDefault(this.player.avatar)
          : this.defaultAvatar

      return `url(${avatar})`
    },
    lifetime () {
      return this.fullStats.lifetime
    },
    maps () {
      return this.fullStats.segments.filter(i => i.type === 'Map' && i.mode === '5v5')
    }
  },
  methods: {
    avatarOrDefault(avatar) {
      if (!avatar || avatar === 'https://d50m6q67g4bn3.cloudfront.net/avatars/084a317c-6346-4dde-ab85-744f469fc217_1464715706995') {
        return this.defaultAvatar
      }

      return avatar
    }
  }
}
</script>

<style lang="scss" scoped>
.full-stats-wrapper {
  position: relative;
  min-height: 100vh;
  padding: 20px;
}

#background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  -webkit-filter: grayscale(100%) blur(2px);
  filter: grayscale(100%) blur(2px);
  background: no-repeat center;
  background-size: cover;
  z-index: -1;
}

.overall-stats {
  margin-bottom: 30px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(245, 85, 0, 0.3);
  
  h2 {
    text-align: center;
    margin: 0 0 20px 0;
    color: #f50;
    font-size: 1.8rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
  }
}

.stats-table {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  
  &:last-child {
    border-bottom: none;
  }
}

.stat-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  
  i {
    color: #f50;
    font-size: 1rem;
    min-width: 18px;
    text-align: center;
  }
}

.value {
  color: #f50;
  font-weight: bold;
  font-size: 1.1rem;
}

// Отступ для MapSelector
:deep(.map-selector) {
  margin-top: 30px;
}
</style>

<!--
{
  "player_id": "aeb518be-075e-4a8e-9ab4-070c270c4e30",
  "game_id": "csgo",
  "lifetime": {
    "Average Headshots %": "40",
    "Average K/D Ratio": "1.41",
    "Current Win Streak": "0",
    "K/D Ratio": "586.38",
    "Longest Win Streak": "9",
    "Matches": "417",
    "Recent Results": [
      "0",
      "0",
      "1",
      "0",
      "0"
    ],
    "Total Headshots %": "16,544",
    "Win Rate %": "54",
    "Wins": "225"
  },
  "segments": [
    {
      "img_regular": "https://cdn.faceit.com/static/stats_assets/csgo/maps/200x125/csgo-votable-maps-de_nuke-200x125.jpg",
      "img_small": "https://cdn.faceit.com/static/stats_assets/csgo/maps/110x55/csgo-votable-maps-de_nuke-110x55.jpg",
      "label": "de_nuke",
      "mode": "5v5",
      "stats": {
        "Assists": "32",
        "Average Assists": "2.91",
        "Average Deaths": "19.36",
        "Average Headshots %": "42",
        "Average K/D Ratio": "1.52",
        "Average K/R Ratio": "0.88",
        "Average Kills": "24.27",
        "Average MVPs": "3.36",
        "Average Penta Kills": "0",
        "Average Quadro Kills": "0.36",
        "Average Triple Kills": "1.09",
        "Deaths": "213",
        "Headshots": "112",
        "Headshots per Match": "10.18",
        "K/D Ratio": "16.68",
        "K/R Ratio": "9.69",
        "Kills": "267",
        "MVPs": "37",
        "Matches": "11",
        "Penta Kills": "0",
        "Quadro Kills": "4",
        "Rounds": "306",
        "Total Headshots %": "461",
        "Triple Kills": "12",
        "Win Rate %": "36",
        "Wins": "4"
      },
      "type": "Map"
    },
    // and more 7 maps...
    ]
}-->
