<template>
  <button 
    :class="['favorite-btn', { 'active': isInFavorites }]"
    @click="toggleFavorite"
    :title="isInFavorites ? $browser.i18n.getMessage('removeFromFavorites') : $browser.i18n.getMessage('addToFavorites')"
  >
    <i :class="['fas', isInFavorites ? 'fa-star' : 'fa-star']" :style="{ color: isInFavorites ? '#f50' : 'rgba(255, 255, 255, 0.5)' }"></i>
    <span class="favorite-text">
      {{ isInFavorites ? $browser.i18n.getMessage('removeFromFavorites') : $browser.i18n.getMessage('addToFavorites') }}
    </span>
  </button>
</template>

<script>
export default {
  name: 'FavoriteButton',
  props: {
    player: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      favoritesList: []
    }
  },
  computed: {
    isInFavorites() {
      return this.favoritesList.some(fav => fav.player_id === this.player.player_id)
    }
  },
  mounted() {
    this.loadFavorites()
  },
  watch: {
    player: {
      handler() {
        this.loadFavorites()
      },
      deep: true
    }
  },
  methods: {
    loadFavorites() {
      const stored = localStorage.getItem('favoritePlayers')
      this.favoritesList = stored ? JSON.parse(stored) : []
    },
    saveFavorites() {
      localStorage.setItem('favoritePlayers', JSON.stringify(this.favoritesList))
    },
    toggleFavorite() {
      if (this.isInFavorites) {
        this.removeFromFavorites()
      } else {
        this.addToFavorites()
      }
    },
    addToFavorites() {
      const favoritePlayer = {
        player_id: this.player.player_id,
        nickname: this.player.nickname,
        avatar: this.player.avatar,
        country: this.player.country,
        skill_level: this.player.games?.csgo?.skill_level,
        faceit_elo: this.player.games?.csgo?.faceit_elo,
        faceit_url: this.player.faceit_url,
        added_at: Date.now()
      }
      
      this.favoritesList.push(favoritePlayer)
      this.saveFavorites()
      
      this.$browser.notifications.create({
        type: 'basic',
        iconUrl: this.$browser.runtime.getURL('icons/icon_48.png'),
        title: this.$browser.i18n.getMessage('favoritesSaved'),
        message: `${this.player.nickname} ${this.$browser.i18n.getMessage('favoritesSaved')}`
      })
    },
    removeFromFavorites() {
      this.favoritesList = this.favoritesList.filter(fav => fav.player_id !== this.player.player_id)
      this.saveFavorites()
      
      this.$browser.notifications.create({
        type: 'basic',
        iconUrl: this.$browser.runtime.getURL('icons/icon_48.png'),
        title: this.$browser.i18n.getMessage('favoritesRemoved'),
        message: `${this.player.nickname} ${this.$browser.i18n.getMessage('favoritesRemoved')}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.favorite-btn {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  width: 100%;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    color: white;
    transform: translateY(-1px);
  }
  
  &.active {
    background: linear-gradient(135deg, #f50, #ff6b35);
    border-color: #f50;
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #ff6b35, #f50);
      border-color: #ff6b35;
    }
  }
  
  i {
    font-size: 1.1rem;
    width: 16px;
    text-align: center;
  }
  
  .favorite-text {
    font-weight: 500;
  }
}

// Анимация для иконки звезды
.favorite-btn.active i {
  animation: starGlow 0.6s ease-out;
}

@keyframes starGlow {
  0% {
    transform: scale(1);
    text-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    transform: scale(1.2);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
}
</style> 