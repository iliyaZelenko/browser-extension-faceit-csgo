<template>
  <div class="loading-error">
    <div class="error-content">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle" />
      </div>
      
      <h3 class="error-title">{{ title }}</h3>
      <p class="error-description">{{ description }}</p>
      
      <div class="error-actions">
        <button 
          class="retry-btn"
          @click="$emit('retry')"
        >
          <i class="fas fa-redo" />
          {{ retryText }}
        </button>
        
        <button 
          class="reset-btn"
          @click="$emit('reset')"
        >
          <i class="fas fa-search" />
          {{ resetText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingError',
  props: {
    title: {
      type: String,
      default: 'Не удалось загрузить профиль'
    },
    description: {
      type: String,
      default: 'Проверьте подключение к интернету или попробуйте позже'
    },
    retryText: {
      type: String,
      default: 'Повторить'
    },
    resetText: {
      type: String,
      default: 'Поиск игрока'
    }
  },
  emits: ['retry', 'reset']
}
</script>

<style lang="scss" scoped>
.loading-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(245, 85, 0, 0.3);
  color: white;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
  max-width: 280px;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border-radius: 50%;
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);

  i {
    font-size: 32px;
    color: white;
  }
}

.error-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #f44336;
  margin: 0 0 12px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.error-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin: 0 0 30px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.retry-btn, .reset-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.retry-btn {
  background: linear-gradient(135deg, #f50, #ff6b35);
  color: white;

  &:hover {
    background: linear-gradient(135deg, #ff6b35, #f50);
  }
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
  }
}

// Анимация появления
.loading-error {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 