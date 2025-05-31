<template>
  <div class="map-selector">
    <h3 class="maps-title">
      {{ $browser.i18n.getMessage('statsByMap') }}
    </h3>

    <div id="maps-wrap">
      <div
        v-for="map of maps"
        :key="map.label"
        class="map-item"
        @click="selectMap(map)"
      >
        <small class="map-label">
          {{ map.label }}
        </small>
        <span
          class="value map-winrate"
        >
          {{ map.stats['Win Rate %'] }} %
        </span>

        <img
          :src="map.img_small"
          :alt="map.label"
          class="map-image"
        >

        <div class="map-overlay">
          <div class="overlay-content">
            <span class="click-hint">{{ $browser.i18n.getMessage('clickForDetailedStats') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    maps: {
      type: Array,
      required: true
    },
    fullStats: {
      type: Object,
      required: true
    }
  },

  methods: {
    selectMap (map) {
      // Переход на страницу детальной статистики карты
      this.$router.push({
        name: 'map-stats',
        params: {
          mapLabel: map.label
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.map-selector {
  margin-top: 20px;
}

.maps-title {
  margin: 10px;
  text-align: center;
  color: #f50;
  font-size: 1.2rem;
}

#maps-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 10px;
}

.map-item {
  width: 32%;
  min-width: 100px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(245, 85, 0, 0.3);

    .map-overlay {
      opacity: 1;
    }

    .map-image {
      transform: scale(1.1);
    }
  }
}

.map-label {
  display: block;
  padding: 8px 4px 4px;
  font-size: 0.85rem;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.7);
}

.map-winrate {
  display: block;
  font-size: 0.7rem;
  color: #f50;
  font-weight: bold;
  padding: 0 4px 8px;
  background: rgba(0, 0, 0, 0.7);
}

.map-image {
  width: 100%;
  height: auto;
  border: none;
  transition: transform 0.3s ease;
  display: block;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 85, 0, 0.8);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-content {
  text-align: center;
  color: white;
  font-weight: bold;
  padding: 10px;
}

.click-hint {
  font-size: 0.8rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

// Адаптивность для мобильных устройств
@media (max-width: 480px) {
  .map-item {
    width: 48%;
  }
}

@media (max-width: 320px) {
  .map-item {
    width: 100%;
  }
}
</style>
