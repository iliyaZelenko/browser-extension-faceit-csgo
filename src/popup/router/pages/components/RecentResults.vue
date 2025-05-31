<template>
  <div class="recent-results">
    <div class="results-container">
      <div class="results-grid">
        <div
          v-for="(result, i) in results"
          :key="'result-' + i"
          :class="['result-item', resultClass(result)]"
          :title="resultTooltip(result, i)"
          @click="goToMatch(i)"
        >
          {{ resultText(result) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    results: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    resultClass(result) {
      return +result ? 'win-result' : 'lose-result'
    },
    resultText(result) {
      return +result ? 'W' : 'L'
    },
    resultTooltip(result, index) {
      const outcome = +result ? this.$browser.i18n.getMessage('win') : this.$browser.i18n.getMessage('loss')
      const gamesAgo = index === 0 
        ? this.$browser.i18n.getMessage('lastGame')
        : this.$browser.i18n.getMessage('gamesAgo', [index + 1])
      return `${outcome} - ${gamesAgo}`
    },
    goToMatch(index) {
      this.$emit('go-to-match', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.recent-results {
  width: 100%;
}

.results-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.results-grid {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.result-item {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
  
  &.win-result {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.5);
    }
  }
  
  &.lose-result {
    background: linear-gradient(135deg, #f44336, #d32f2f);
    color: white;
    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5);
    }
  }
}

// Responsive design
@media (max-width: 400px) {
  .results-grid {
    justify-content: center;
    width: 100%;
  }
}
</style> 