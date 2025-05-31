<template>
  <div v-if="player">
    <!-- Recent Results Summary -->
    <div class="results-summary">
      <h3>{{ $browser.i18n.getMessage('recentResults') }}</h3>
      
      <!-- W/L кружки для последних матчей -->
      <div v-if="recentMatches.length > 0" class="recent-wl-circles">
        <div 
          v-for="(match, index) in recentMatches" 
          :key="match.match_id"
          :class="['wl-circle', getMatchResult(match)]"
          :title="getMatchResultText(match)"
          @click="goToSpecificMatch(index)"
        >
          {{ getMatchResultLetter(match) }}
        </div>
      </div>
    </div>

    <!-- Match History List -->
    <div class="match-history">
      <h3>{{ $browser.i18n.getMessage('detailedMatchHistory') }}</h3>
      
      <!-- Loading state -->
      <div v-if="loadingMatches" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $browser.i18n.getMessage('loadingMatches') }}</p>
      </div>

      <!-- Matches list -->
      <div v-else-if="matches.length > 0" class="matches-list">
        <MatchCard
          v-for="(match, index) in matches"
          :key="match.match_id"
          :match="match"
          :player-id="player.player_id"
          :highlighted="highlightedMatchIndex === index"
          @highlight-end="clearHighlight"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="empty-matches">
        <p>{{ $browser.i18n.getMessage('noMatchesFound') }}</p>
      </div>
    </div>

    <!-- Load more button -->
    <div v-if="matches.length > 0 && !loadingMatches" class="load-more-section">
      <button 
        @click="loadMoreMatches"
        :disabled="loadingMore"
        class="load-more-btn"
      >
        <span v-if="loadingMore">{{ $browser.i18n.getMessage('loading') }}...</span>
        <span v-else>{{ $browser.i18n.getMessage('loadMoreMatches') }}</span>
      </button>
    </div>
  </div>
  
  <!-- Empty State когда игрок не выбран -->
  <EmptyState v-else />
</template>

<script>
import RecentResults from './components/RecentResults.vue'
import MatchCard from './components/MatchCard.vue'
import EmptyState from './components/EmptyState.vue'
import { FACEIT_API, GAMES, API_LIMITS } from '../../utils/constants.js'

export default {
  components: {
    RecentResults,
    MatchCard,
    EmptyState
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
    }
  },
  data() {
    return {
      matches: [],
      loadingMatches: false,
      loadingMore: false,
      offset: 0,
      limit: API_LIMITS.MATCHES_PER_PAGE,
      highlightedMatchIndex: null
    }
  },
  computed: {
    recentResults() {
      return this.fullStats?.lifetime?.['Recent Results'] || []
    },
    recentMatches() {
      return this.matches.slice(0, 5)
    }
  },
  async mounted() {
    if (this.player?.player_id) {
      await this.loadMatches()
      
      // Проверяем есть ли параметр для подсветки матча
      if (this.$route.query.highlight !== undefined) {
        const highlightIndex = parseInt(this.$route.query.highlight)
        
        if (!isNaN(highlightIndex) && highlightIndex >= 0 && highlightIndex < this.matches.length) {
          this.highlightedMatchIndex = highlightIndex
          
          // Убираем подсветку через 3 секунды
          setTimeout(() => {
            this.highlightedMatchIndex = null
          }, 3000)
          
          // Прокручиваем к выделенному матчу
          this.$nextTick(() => {
            const matchCards = document.querySelectorAll('.match-card')
            if (matchCards[highlightIndex]) {
              matchCards[highlightIndex].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              })
            }
          })
        }
      }
    }
  },
  methods: {
    async loadMatches() {
      this.loadingMatches = true
      try {
        const response = await fetch(`${FACEIT_API.BASE_URL}/players/${this.player.player_id}/history?game=${GAMES.CSGO}&offset=${this.offset}&limit=${this.limit}`, {
          headers: FACEIT_API.HEADERS
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        this.matches = data.items || []
      } catch (error) {
        console.error('Error loading matches:', error)
        this.matches = []
      } finally {
        this.loadingMatches = false
      }
    },
    async loadMoreMatches() {
      this.loadingMore = true
      this.offset += this.limit
      try {
        const response = await fetch(`${FACEIT_API.BASE_URL}/players/${this.player.player_id}/history?game=${GAMES.CSGO}&offset=${this.offset}&limit=${this.limit}`, {
          headers: FACEIT_API.HEADERS
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        const moreMatches = data.items || []
        this.matches.push(...moreMatches)
      } catch (error) {
        console.error('Error loading more matches:', error)
        // Если ошибка загрузки, просто не добавляем новые матчи
      } finally {
        this.loadingMore = false
      }
    },
    clearHighlight() {
      this.highlightedMatchIndex = null
    },
    getMatchResult(match) {
      const playerTeam = this.findPlayerTeam(match)
      if (playerTeam && match.results && match.results.winner) {
        return match.results.winner === playerTeam.factionId ? 'win' : 'loss'
      }
      return 'unknown'
    },
    getMatchResultText(match) {
      const result = this.getMatchResult(match)
      if (result === 'win') return this.$browser.i18n.getMessage('win') || 'Win'
      if (result === 'loss') return this.$browser.i18n.getMessage('loss') || 'Loss'
      return 'N/A'
    },
    getMatchResultLetter(match) {
      const result = this.getMatchResult(match)
      if (result === 'win') return 'W'
      if (result === 'loss') return 'L'
      return 'N/A'
    },
    goToSpecificMatch(index) {
      this.highlightedMatchIndex = index
      
      // Убираем подсветку через 3 секунды
      setTimeout(() => {
        this.highlightedMatchIndex = null
      }, 3000)
      
      // Прокручиваем к выделенному матчу
      this.$nextTick(() => {
        const matchCards = document.querySelectorAll('.match-card')
        if (matchCards[index]) {
          matchCards[index].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }
      })
    },
    findPlayerTeam(match) {
      if (!match.teams) return null
      
      for (const [factionId, team] of Object.entries(match.teams)) {
        if (team.players && team.players.some(player => player.player_id === this.player.player_id)) {
          return { factionId: factionId, ...team }
        }
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.player-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #f50;
}

.player-details {
  h2 {
    margin: 0;
    color: #f50;
    font-size: 1.5rem;
  }
}

.country-flag {
  margin-left: 10px;
  vertical-align: middle;
}

.results-summary {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(245, 85, 0, 0.3);

  h3 {
    margin: 0 0 15px 0;
    color: #f50;
    font-size: 1.3rem;
  }
}

.recent-wl-circles {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

.wl-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;

  &.win {
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    border-color: #4caf50;
  }

  &.loss {
    background: linear-gradient(135deg, #f44336, #d32f2f);
    color: white;
    border-color: #f44336;
  }
  
  &.unknown {
    background: linear-gradient(135deg, #666, #555);
    color: white;
    border-color: #666;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.match-history {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(245, 85, 0, 0.3);

  h3 {
    margin: 0 0 20px 0;
    color: #f50;
    font-size: 1.3rem;
  }
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #ccc;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(245, 85, 0, 0.3);
    border-radius: 50%;
    border-top-color: #f50;
    animation: spin 1s ease-in-out infinite;
    margin: 0 auto 15px;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-matches {
  text-align: center;
  padding: 40px 20px;
  color: #ccc;
}

.load-more-section {
  text-align: center;
  margin-top: 20px;
}

.load-more-btn {
  background: linear-gradient(135deg, #f50 0%, #e64d00 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 85, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style> 
