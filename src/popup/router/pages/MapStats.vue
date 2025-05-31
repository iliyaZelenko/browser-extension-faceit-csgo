<template>
  <div class="map-stats-wrapper">
    <!-- Map background -->
    <div
      v-if="mapData"
      class="map-background"
      :style="{
        'background-image': `url(${mapData.img_regular})`
      }"
    />

    <div v-if="mapData">
      <div class="map-header">
        <div class="map-info">
          <h2>{{ mapData.label }}</h2>
          <div class="map-stats-grid">
            <div class="stat-item">
              <span class="stat-label">{{ $browser.i18n.getMessage('winRate') }}</span>
              <span class="stat-value">{{ mapData.stats['Win Rate %'] }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ $browser.i18n.getMessage('matches') }}</span>
              <span class="stat-value">{{ mapData.stats['Matches'] }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ $browser.i18n.getMessage('wins') }}</span>
              <span class="stat-value">{{ mapData.stats['Wins'] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detailed-stats">
        <h3>{{ $browser.i18n.getMessage('mapDetailedStats') }}</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-crosshairs" />
            </div>
            <div class="stat-title">{{ $browser.i18n.getMessage('kdRatio') }}</div>
            <div class="stat-value-big">{{ mapData.stats['Average K/D Ratio'] }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-bullseye" />
            </div>
            <div class="stat-title">{{ $browser.i18n.getMessage('headshotsPercentage') }}</div>
            <div class="stat-value-big">{{ mapData.stats['Average Headshots %'] }}%</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-fire" />
            </div>
            <div class="stat-title">{{ $browser.i18n.getMessage('averageKills') }}</div>
            <div class="stat-value-big">{{ mapData.stats['Average Kills'] }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-skull" />
            </div>
            <div class="stat-title">{{ $browser.i18n.getMessage('averageDeaths') }}</div>
            <div class="stat-value-big">{{ mapData.stats['Average Deaths'] }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-handshake" />
            </div>
            <div class="stat-title">{{ $browser.i18n.getMessage('averageAssists') }}</div>
            <div class="stat-value-big">{{ mapData.stats['Average Assists'] }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-crown" />
            </div>
            <div class="stat-title">{{ $browser.i18n.getMessage('averageMvps') }}</div>
            <div class="stat-value-big">{{ mapData.stats['Average MVPs'] }}</div>
          </div>
        </div>

        <div class="additional-stats">
          <h4>{{ $browser.i18n.getMessage('mapAdditionalStats') }}</h4>
          <div class="additional-stats-grid">
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-crosshairs" />
                {{ $browser.i18n.getMessage('totalKills') }}
              </span>
              <span class="value">{{ mapData.stats['Kills'] }}</span>
            </div>
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-skull-crossbones" />
                {{ $browser.i18n.getMessage('totalDeaths') }}
              </span>
              <span class="value">{{ mapData.stats['Deaths'] }}</span>
            </div>
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-hands-helping" />
                {{ $browser.i18n.getMessage('totalAssists') }}
              </span>
              <span class="value">{{ mapData.stats['Assists'] }}</span>
            </div>
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-dot-circle" />
                {{ $browser.i18n.getMessage('headshotsPerMatch') }}
              </span>
              <span class="value">{{ mapData.stats['Headshots per Match'] }}</span>
            </div>
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-medal" />
                {{ $browser.i18n.getMessage('tripleKills') }}
              </span>
              <span class="value">{{ mapData.stats['Triple Kills'] }}</span>
            </div>
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-trophy" />
                {{ $browser.i18n.getMessage('quadroKills') }}
              </span>
              <span class="value">{{ mapData.stats['Quadro Kills'] }}</span>
            </div>
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-star" />
                {{ $browser.i18n.getMessage('pentaKills') }}
              </span>
              <span class="value">{{ mapData.stats['Penta Kills'] }}</span>
            </div>
            <div class="additional-stat">
              <span class="stat-with-icon">
                <i class="fas fa-clock" />
                {{ $browser.i18n.getMessage('totalRounds') }}
              </span>
              <span class="value">{{ mapData.stats['Rounds'] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="navigation">
        <button
          class="back-button"
          @click="goBack"
        >
          ← {{ $browser.i18n.getMessage('backToMapsList') }}
        </button>
      </div>
    </div>

    <div
      v-else
      class="loading"
    >
      <div v-if="!fullStats || !fullStats.segments">
        <p>{{ $browser.i18n.getMessage('statsNotLoaded') }}</p>
        <button
          class="back-button"
          @click="goBack"
        >
          ← {{ $browser.i18n.getMessage('back') }}
        </button>
      </div>
      <div v-else-if="$route.params.mapLabel && !mapData">
        <p>{{ $browser.i18n.getMessage('map') }} "{{ $route.params.mapLabel }}" {{ $browser.i18n.getMessage('mapNotFound') }}</p>
        <button
          class="back-button"
          @click="goBack"
        >
          ← {{ $browser.i18n.getMessage('backToMapsList') }}
        </button>
      </div>
      <div v-else>
        {{ $browser.i18n.getMessage('loadingMapStats') }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fullStats: {
      type: Object,
      default: () => ({})
    }
  },

  data () {
    return {
      mapData: null
    }
  },

  watch: {
    '$route' () {
      this.loadMapData()
    },
    fullStats () {
      this.loadMapData()
    }
  },

  created () {
    this.loadMapData()
  },

  methods: {
    loadMapData () {
      const mapLabel = this.$route.params.mapLabel

      if (this.fullStats && this.fullStats.segments && mapLabel) {
        this.mapData = this.fullStats.segments.find(
          segment => segment.type === 'Map' &&
                    segment.mode === '5v5' &&
                    segment.label === mapLabel
        )
      }
    },

    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.map-stats-wrapper {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
}

.map-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: no-repeat center;
  background-size: cover;
  opacity: 1.0;
  z-index: -1;
  -webkit-filter: blur(1px);
  filter: blur(1px);
}

.map-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(245, 85, 0, 0.3);

  .map-info {
    flex: 1;

    h2 {
      margin: 0 0 15px 0;
      color: #f50;
      font-size: 2rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
      text-align: center;
    }
  }
}

.map-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;

  .stat-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    .stat-label {
      font-size: 0.8rem;
      color: #ccc;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .stat-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #f50;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
  }
}

.detailed-stats {
  margin-bottom: 20px;

  h3 {
    text-align: center;
    margin-bottom: 15px;
    color: #f50;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(245, 85, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    border-color: #f50;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(245, 85, 0, 0.3);
  }

  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 8px;
    color: #f50;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .stat-title {
    font-size: 0.85rem;
    color: #ccc;
    margin-bottom: 8px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .stat-value-big {
    font-size: 1.4rem;
    font-weight: bold;
    color: #f50;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
}

.additional-stats {
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(245, 85, 0, 0.3);

  h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #f50;
    text-align: center;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }
}

.additional-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.additional-stat {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);

  &:last-child {
    border-bottom: none;
  }

  .stat-with-icon {
    display: flex;
    align-items: center;
    gap: 5px;

    i {
      color: #f50;
      font-size: 0.9rem;
      min-width: 15px;
      text-align: center;
    }
  }

  .value {
    color: #f50;
    font-weight: bold;
  }
}

.navigation {
  text-align: center;
  margin-top: 20px;
}

.back-button {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #f50;
  color: #f50;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);

  &:hover {
    background: #f50;
    color: white;
    box-shadow: 0 3px 10px rgba(245, 85, 0, 0.4);
  }
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #ccc;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(245, 85, 0, 0.3);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);

  p {
    margin-bottom: 20px;
  }
}
</style>
