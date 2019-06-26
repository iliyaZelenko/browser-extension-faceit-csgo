<template>
  <div v-if="fullStats">
    <div id="stats-wrap">
      <div>
        {{ $browser.i18n.getMessage('averageHeadshots') }}
        <b class="value">{{ lifetime['Average Headshots %'] }} %</b>.
      </div>
      <div>
        {{ $browser.i18n.getMessage('averageKDRatio') }}
        <b class="value">{{ lifetime['Average K/D Ratio'] }}</b>.
      </div>
      <div>
        {{ $browser.i18n.getMessage('currentWinStreak') }}
        <b class="value">{{ lifetime['Current Win Streak'] }}</b>.
      </div>
      <div>
        {{ $browser.i18n.getMessage('matches') }}
        <b class="value">{{ lifetime['Matches'] }}</b>.
      </div>
      <div>
        {{ $browser.i18n.getMessage('wins') }}
        <b class="value">{{ lifetime['Wins'] }}</b>.
      </div>
      <div>
        {{ $browser.i18n.getMessage('winRate') }}
        <b class="value">{{ lifetime['Win Rate %'] }} %</b>.
      </div>
      <div>
        {{ $browser.i18n.getMessage('longestWinStreak') }}
        <b class="value">{{ lifetime['Longest Win Streak'] }}</b>.
      </div>
    </div>

    <h3 style="margin: 10px; text-align: center;">
      {{ $browser.i18n.getMessage('statsByMap') }}
    </h3>

    <div id="maps-wrap">
      <div
        v-for="map of maps"
        :key="map.label"
      >
        <small>
          {{ map.label }}
        </small>
        <span
          class="value"
          style="font-size: 0.5rem;"
        >
          {{ map.stats['Win Rate %'] }} %
        </span>

        <img
          :src="map.img_small"
          :alt="map.label"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
    return {}
  },
  computed: {
    lifetime () {
      return this.fullStats.lifetime
    },
    maps () {
      return this.fullStats.segments.filter(i => i.type === 'Map' && i.mode === '5v5')
    }
  },
  methods: {
    //
  }
}
</script>

<style lang="scss" scoped>
  #stats-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    padding-left: 10px;

    & div {
      width: 100%;
    }
  }

  #maps-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    & div {
      width: 32%;
      text-align: center;
      transition: outline 0.2s;

      &:hover {
        outline: 1px solid #4e9af1;
      }

      & img {
        width: 90%;
        border-radius: 5px;
        border: 1px solid white;
      }
    }
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
