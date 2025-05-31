<template>
  <div class="app-header">
    <!-- Селектор игры -->
    <GameSelector @game-selected="$emit('game-selected', $event)" />

    <!-- Кнопки справа -->
    <div class="right-buttons">
      <!-- Кнопка избранных игроков -->
      <FavoritesListButton />

      <!-- Кнопка поддержки -->
      <SupportButton />
    </div>
  </div>
</template>

<script>
import GameSelector from './GameSelector.vue'
import FavoritesListButton from './FavoritesListButton.vue'
import SupportButton from './SupportButton.vue'

export default {
  name: 'AppHeader',
  components: {
    GameSelector,
    FavoritesListButton,
    SupportButton
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(245, 85, 0, 0.3);
  margin-bottom: 10px;
}

.right-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
