<template>
  <button 
    class="favorites-list-btn"
    @click="goToFavorites"
    :title="$browser.i18n.getMessage('favoriteButton')"
  >
    <i class="fas fa-star"></i>
  </button>
</template>

<script>
export default {
  name: 'FavoritesListButton',
  methods: {
    goToFavorites() {
      this.$router.push({ name: 'favorites' })
    }
  }
}
</script>

<style lang="scss" scoped>
.favorites-list-btn {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(245, 85, 0, 0.3);
  border-radius: 6px;
  color: rgba(245, 85, 0, 0.8);
  padding: 8px 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  
  &:hover {
    background: rgba(245, 85, 0, 0.1);
    border-color: #f50;
    color: #f50;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 85, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  i {
    font-size: 1.1rem;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style> 