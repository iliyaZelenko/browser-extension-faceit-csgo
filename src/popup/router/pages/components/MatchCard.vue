<template>
  <div :class="['match-card', resultClass, { 'highlighted': highlighted }]">
    <div class="match-header">
      <div class="match-result">
        <div :class="['result-indicator', resultClass]">
          {{ resultText }}
        </div>
      </div>

      <div class="match-info">
        <div class="match-date">
          <i class="fas fa-calendar" />
          {{ formatDate(match.finished_at) }}
        </div>
        <div
          v-if="match.started_at"
          class="match-start-time"
        >
          <i class="fas fa-clock" />
          {{ formatStartTime(match.started_at) }}
        </div>
        <div
          v-if="matchDuration"
          class="match-duration"
        >
          <i class="fas fa-stopwatch" />
          {{ matchDuration }}
        </div>
        <div
          v-if="match.competition_name"
          class="competition"
        >
          <i class="fas fa-trophy" />
          {{ match.competition_name }}
        </div>
        <div
          v-if="match.region"
          class="region"
        >
          <i class="fas fa-globe" />
          {{ match.region }}
        </div>
        <div
          v-if="match.game_mode"
          class="game-mode"
        >
          <i class="fas fa-gamepad" />
          {{ match.game_mode }}
        </div>
        <div class="match-id">
          <i class="fas fa-hashtag" />
          {{ match.match_id }}
        </div>
        <div
          v-if="faceitUrl"
          class="faceit-link"
        >
          <i class="fas fa-external-link-alt" />
          <a
            :href="faceitUrl"
            target="_blank"
          >
            {{ $browser.i18n.getMessage('openInFaceit') || 'Open in FACEIT' }}
          </a>
        </div>
      </div>
    </div>

    <div class="match-details">
      <!-- Убираем блок статистики игрока, так как это фейковые данные -->
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
  computed: {
    resultClass () {
      // Определяем результат через winner и команды
      const playerTeam = this.findPlayerTeam()
      if (playerTeam && this.match.results && this.match.results.winner) {
        return this.match.results.winner === playerTeam.factionId ? 'win' : 'loss'
      }
      return 'unknown'
    },
    resultText () {
      if (this.resultClass === 'win') return this.$browser.i18n.getMessage('win') || 'WIN'
      if (this.resultClass === 'loss') return this.$browser.i18n.getMessage('loss') || 'LOSS'
      return 'N/A'
    },
    faceitUrl () {
      // Обрабатываем FACEIT URL, заменяя {lang} на 'en'
      if (this.match.faceit_url) {
        return this.match.faceit_url.replace('{lang}', 'en')
      }
      return null
    },
    matchDuration () {
      if (this.match.finished_at && this.match.started_at) {
        const durationInSeconds = this.match.finished_at - this.match.started_at
        const hours = Math.floor(durationInSeconds / 3600)
        const minutes = Math.floor((durationInSeconds % 3600) / 60)

        if (hours > 0) {
          return `${hours}h ${minutes}m`
        } else {
          return `${minutes}m`
        }
      }
      return null
    }
  },

  watch: {
    highlighted (newVal) {
      if (newVal) {
        // Автоматически убираем подсветку через 3 секунды
        setTimeout(() => {
          this.$emit('highlight-end')
        }, 3000)
      }
    }
  },
  methods: {
    findPlayerTeam () {
      if (!this.match.teams) return null

      for (const [factionId, team] of Object.entries(this.match.teams)) {
        // В реальном API структура: teams.faction1.players (не roster)
        if (team.players && team.players.some(player => player.player_id === this.playerId)) {
          return { factionId: factionId, ...team }
        }
      }
      return null
    },
    formatDate (dateString) {
      // FACEIT API использует finished_at timestamp в секундах (Unix timestamp)
      const timestamp = this.match.finished_at || dateString
      const date = new Date(timestamp * 1000) // Конвертируем секунды в миллисекунды
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

      if (diffInMinutes < 1) {
        return this.$browser.i18n.getMessage('justNow')
      } else if (diffInMinutes < 60) {
        return this.$browser.i18n.getMessage('minutesAgo', [diffInMinutes])
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
    formatStartTime (timestamp) {
      // FACEIT API использует started_at timestamp в секундах (Unix timestamp)
      const date = new Date(timestamp * 1000) // Конвертируем секунды в миллисекунды
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  grid-template-columns: auto 1fr;
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

  .match-date {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;

    i {
      color: #f50;
      width: 14px;
    }
  }

  .match-start-time {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;

    i {
      color: #f50;
      width: 14px;
    }
  }

  .match-duration {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;

    i {
      color: #f50;
      width: 14px;
    }
  }

  .competition, .region, .game-mode, .match-id, .faceit-link {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;

    i {
      color: #f50;
      width: 14px;
    }
  }

  .faceit-link {
    a {
      color: #f50;
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: #ff6b35;
        text-decoration: underline;
      }
    }
  }

  .match-id {
    color: #999;
    font-size: 0.8rem;
  }
}

.match-details {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
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
