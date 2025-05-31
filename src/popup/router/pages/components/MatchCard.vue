<template>
  <div :class="['match-card', resultClass, { 'highlighted': highlighted }]">
    <div class="match-header">
      <div class="match-result">
        <div :class="['result-indicator', resultClass]">
          {{ resultText }}
        </div>
      </div>
      
      <div class="match-info">
        <div class="map-name">
          <i class="fas fa-map"></i>
          {{ formatMapName((match.voting && match.voting.map && match.voting.map.pick) || match.map || 'Unknown') }}
        </div>
        <div class="match-date">
          <i class="fas fa-calendar"></i>
          {{ formatDate(match.finished_at) }}
        </div>
      </div>
      
      <div class="match-score">
        <span class="score">{{ getScoreDisplay() }}</span>
      </div>
    </div>
    
    <div class="match-details">
      <!-- Убираем блок статистики игрока, так как это фейковые данные -->
    </div>
    
    <!-- Additional details toggle -->
    <div class="match-footer">
      <button 
        @click="toggleDetails"
        class="toggle-details"
        :class="{ active: showExtraDetails }"
      >
        <i :class="['fas', showExtraDetails ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
        {{ showExtraDetails ? $browser.i18n.getMessage('hideDetails') : $browser.i18n.getMessage('showDetails') }}
      </button>
    </div>
    
    <!-- Extended details -->
    <div v-if="showExtraDetails" class="extended-details">
      <div class="detail-row">
        <span class="detail-label">{{ $browser.i18n.getMessage('matchId') }}:</span>
        <span class="detail-value">{{ match.match_id }}</span>
      </div>
      <div v-if="faceitUrl" class="detail-row">
        <span class="detail-label">{{ $browser.i18n.getMessage('faceitUrl') || 'FACEIT URL' }}:</span>
        <span class="detail-value">
          <a :href="faceitUrl" target="_blank" style="color: #f50;">
            {{ $browser.i18n.getMessage('openInFaceit') || 'Open in FACEIT' }}
          </a>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    match: {
      type: Object,
      required: true
    },
    playerId: {
      type: String,
      required: true
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showExtraDetails: false
    }
  },
  computed: {
    resultClass() {
      // Для FACEIT API History определяем результат через команды
      const playerTeam = this.findPlayerTeam()
      if (playerTeam && this.match.results && this.match.results.winner) {
        return this.match.results.winner === playerTeam.factionId ? 'win' : 'loss'
      }
      
      // Fallback на mock данные
      return +this.match.result ? 'win' : 'loss'
    },
    resultText() {
      return this.resultClass === 'win' ? 'WIN' : 'LOSS'
    },
    faceitUrl() {
      // Обрабатываем FACEIT URL, заменяя {lang} на 'en'
      if (this.match.faceit_url) {
        return this.match.faceit_url.replace('{lang}', 'en')
      }
      return null
    }
  },
  methods: {
    findPlayerTeam() {
      if (!this.match.teams) return null
      
      for (const [factionId, team] of Object.entries(this.match.teams)) {
        // В реальном API структура: teams.faction1.players (не roster)
        if (team.players && team.players.some(player => player.player_id === this.playerId)) {
          return { factionId: factionId, ...team }
        }
      }
      return null
    },
    formatMapName(mapName) {
      // Remove 'de_' prefix and capitalize
      return mapName.replace('de_', '').charAt(0).toUpperCase() + mapName.replace('de_', '').slice(1)
    },
    formatDate(dateString) {
      // FACEIT API использует finished_at timestamp в секундах (Unix timestamp)
      const timestamp = this.match.finished_at || dateString
      const date = new Date(timestamp * 1000) // Конвертируем секунды в миллисекунды
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffInHours < 1) {
        return this.$browser.i18n.getMessage('justNow')
      } else if (diffInHours < 24) {
        return this.$browser.i18n.getMessage('hoursAgo', [diffInHours])
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays === 1) {
          return this.$browser.i18n.getMessage('yesterday')
        } else if (diffInDays < 7) {
          return this.$browser.i18n.getMessage('daysAgo', [diffInDays])
        } else {
          return date.toLocaleDateString()
        }
      }
    },
    toggleDetails() {
      this.showExtraDetails = !this.showExtraDetails
    },
    getScoreDisplay() {
      if (this.match.results && this.match.results.score) {
        const scores = Object.values(this.match.results.score)
        return scores.join(' : ')
      }
      return this.match.score ? `${this.match.score.faction1} : ${this.match.score.faction2}` : 'N/A'
    }
  },
  
  watch: {
    highlighted(newVal) {
      if (newVal) {
        // Автоматически убираем подсветку через 3 секунды
        setTimeout(() => {
          this.$emit('highlight-end')
        }, 3000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.match-card {
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
  
  &.win {
    border-left-color: #4CAF50;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(0, 0, 0, 0.9) 50%);
  }
  
  &.loss {
    border-left-color: #f44336;
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(0, 0, 0, 0.9) 50%);
  }

  &.highlighted {
    background: linear-gradient(45deg, rgba(245, 85, 0, 0.3), rgba(245, 85, 0, 0.1)) !important;
    border: 2px solid #f50 !important;
    border-left: 4px solid #f50 !important;
    animation: highlight-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 20px rgba(245, 85, 0, 0.6) !important;
    transform: scale(1.02);
  }

  @keyframes highlight-pulse {
    0% {
      box-shadow: 0 0 15px rgba(245, 85, 0, 0.8);
      transform: scale(1.02);
    }
    50% {
      box-shadow: 0 0 35px rgba(245, 85, 0, 0.9);
      transform: scale(1.03);
    }
    100% {
      box-shadow: 0 0 15px rgba(245, 85, 0, 0.8);
      transform: scale(1.02);
    }
  }
}

.match-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 15px;
  align-items: center;
  margin-bottom: 12px;
}

.match-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.result-indicator {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.8rem;
  text-align: center;
  
  &.win {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
  }
  
  &.loss {
    background: linear-gradient(135deg, #f44336, #d32f2f);
    color: white;
  }
}

.match-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #ccc;
  
  .map-name, .match-date {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    
    i {
      color: #f50;
      width: 12px;
    }
  }
  
  .map-name {
    font-weight: bold;
    color: white;
  }
}

.match-score {
  .score {
    font-size: 1.2rem;
    font-weight: bold;
    color: #f50;
  }
}

.match-details {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}

.match-footer {
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  text-align: center;
}

.toggle-details {
  background: none;
  border: none;
  color: #ccc;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #f50;
    background: rgba(245, 85, 0, 0.1);
  }
  
  i {
    margin-right: 4px;
  }
}

.extended-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  
  .detail-label {
    color: #999;
    font-size: 0.8rem;
  }
  
  .detail-value {
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
  }
}

// Responsive design
@media (max-width: 500px) {
  .match-header {
    grid-template-columns: 1fr;
    gap: 10px;
    text-align: center;
  }
}
</style> 