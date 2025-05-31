<template>
  <div class="analytics-example">
    <h3>Analytics Demo</h3>
    
    <div class="button-group">
      <button @click="trackButtonExample" class="demo-button">
        Track Button Click
      </button>
      
      <button @click="trackUserActionExample" class="demo-button">
        Track User Action
      </button>
      
      <button @click="trackDataLoadExample" class="demo-button">
        Track Data Load
      </button>
      
      <button @click="trackSearchExample" class="demo-button">
        Track Search
      </button>
      
      <button @click="trackErrorExample" class="demo-button error">
        Track Error
      </button>
    </div>
    
    <div class="analytics-info">
      <p>Все события отправляются в Google Analytics и видны в консоли браузера.</p>
      <p>Measurement ID: <code>G-YFV8YK7FVQ</code></p>
    </div>
  </div>
</template>

<script>
import analyticsMixin from '../../../utils/analytics-mixin'

export default {
  name: 'AnalyticsExample',
  mixins: [analyticsMixin],
  
  data() {
    return {
      componentStartTime: Date.now()
    }
  },
  
  mounted() {
    // Отслеживаем открытие демо компонента
    this.$analytics.trackPageView('analytics_demo')
    this.$analytics.trackEvent('demo_component_opened', {
      timestamp: new Date().toISOString()
    })
  },
  
  beforeDestroy() {
    // Отслеживаем время работы с компонентом
    this.trackComponentTime(this.componentStartTime)
  },
  
  methods: {
    trackButtonExample() {
      // Используем метод из миксина
      this.trackButtonClick('demo_button', {
        demo_type: 'button_click_example'
      })
    },
    
    trackUserActionExample() {
      // Отслеживаем пользовательское действие
      this.trackUserAction('demo_user_action', {
        action_context: 'analytics_demo',
        user_interaction: 'button_press'
      })
    },
    
    trackDataLoadExample() {
      // Симулируем загрузку данных
      const startTime = Date.now()
      
      setTimeout(() => {
        const loadTime = Date.now() - startTime
        this.trackDataLoad('demo_data', loadTime, true)
      }, Math.random() * 1000 + 500) // Случайное время от 500ms до 1.5s
    },
    
    trackSearchExample() {
      const searchQuery = 'faceit player stats'
      const resultsCount = Math.floor(Math.random() * 50) + 1
      
      this.trackSearch(searchQuery, resultsCount)
    },
    
    trackErrorExample() {
      // Отслеживаем демо ошибку
      this.trackComponentError('demo_error', 'This is a demonstration error', false)
      
      // Также используем прямой метод сервиса
      this.$analytics.trackError('Demo error from direct service call', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.analytics-example {
  padding: 20px;
  margin: 10px;
  border: 1px solid #ff6600;
  border-radius: 8px;
  background: rgba(255, 102, 0, 0.1);
  
  h3 {
    color: #ff6600;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
    
    .demo-button {
      padding: 8px 16px;
      border: 1px solid #ff6600;
      border-radius: 4px;
      background: #ff6600;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: #e55a00;
        border-color: #e55a00;
      }
      
      &.error {
        background: #d32f2f;
        border-color: #d32f2f;
        
        &:hover {
          background: #b71c1c;
          border-color: #b71c1c;
        }
      }
    }
  }
  
  .analytics-info {
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 12px;
    
    p {
      margin: 5px 0;
      color: #ccc;
    }
    
    code {
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 4px;
      border-radius: 2px;
      color: #ffcc00;
    }
  }
}
</style> 