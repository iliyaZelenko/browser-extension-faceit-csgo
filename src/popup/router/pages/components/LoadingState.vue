<template>
  <div class="loading-state">
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner" />
      </div>
      
      <h3 class="loading-title">{{ title }}</h3>
      <p class="loading-description">{{ description }}</p>
      
      <div v-if="showProgress" class="loading-progress">
        <div class="progress-dots">
          <span v-for="i in 3" :key="i" class="dot" :class="{ active: (animationStep % 3) === (i - 1) }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    title: {
      type: String,
      default: 'Загрузка профиля...'
    },
    description: {
      type: String,
      default: 'Получаем данные игрока с серверов Faceit'
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      animationStep: 0,
      intervalId: null
    }
  },
  mounted() {
    if (this.showProgress) {
      this.intervalId = setInterval(() => {
        this.animationStep++
      }, 500)
    }
  },
  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-state {
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

.loading-content {
  text-align: center;
  max-width: 280px;
}

.loading-spinner {
  margin-bottom: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(245, 85, 0, 0.3);
  border-radius: 50%;
  border-top-color: #f50;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { 
    transform: rotate(360deg); 
  }
}

.loading-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #f50;
  margin: 0 0 12px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.loading-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin: 0 0 24px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.loading-progress {
  margin-top: 20px;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(245, 85, 0, 0.3);
  transition: all 0.3s ease;
  
  &.active {
    background-color: #f50;
    transform: scale(1.2);
  }
}

// Анимация появления
.loading-state {
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