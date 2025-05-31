<template>
  <div class="animated-tabs-container">
    <div
      ref="tabsWrapper"
      class="tabs-wrapper"
    >
      <!-- Анимированный индикатор активной табы -->
      <div
        ref="indicator"
        class="active-tab-indicator"
        :style="indicatorStyle"
      />

      <!-- Табы -->
      <router-link
        v-for="(tab, index) in tabs"
        :key="tab.name"
        :to="tab.to"
        class="tab-link"
        :class="{ 'active': isActiveTab(tab), 'first-tab': index === 0, 'second-tab': index === 1 }"
        exact
        @click="updateIndicator"
      >
        <i :class="tab.icon" />
      </router-link>
    </div>

    <!-- Отладочная информация (только в dev) -->
    <div
      v-if="showDebug"
      class="debug-info"
    >
      <p>Active route: {{ $route.name }}</p>
      <p>Active tab index: {{ activeTabIndex }}</p>
      <p>Tabs: {{ JSON.stringify(tabs) }}</p>
      <p>Indicator style: {{ JSON.stringify(indicatorStyle) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedTabs',
  props: {
    tabs: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      indicatorStyle: {
        width: '0px',
        left: '0px',
        opacity: 0
      },
      showDebug: false // Включите true для отладки
    }
  },

  computed: {
    activeTabIndex () {
      const index = this.tabs.findIndex(tab => this.isActiveTab(tab))
      console.log('Active tab index:', index, 'Route:', this.$route.name)
      return index
    }
  },

  mounted () {
    console.log('AnimatedTabs mounted, tabs:', this.tabs)
    this.$nextTick(() => {
      setTimeout(() => {
        this.updateIndicatorPosition()
      }, 200)
    })

    // Обновляем позицию при изменении маршрута
    this.$watch('$route', () => {
      console.log('Route changed to:', this.$route.name)
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateIndicatorPosition()
        }, 100)
      })
    })
  },

  methods: {
    isActiveTab (tab) {
      const isActive = this.$route.name === tab.name
      console.log(`Checking tab ${tab.name} vs route ${this.$route.name}: ${isActive}`)
      return isActive
    },

    updateIndicator () {
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateIndicatorPosition()
        }, 50)
      })
    },

    updateIndicatorPosition () {
      const activeIndex = this.activeTabIndex
      console.log('Updating indicator position for index:', activeIndex)

      if (activeIndex === -1) {
        console.log('No active tab found')
        return
      }

      const tabsWrapper = this.$refs.tabsWrapper
      if (!tabsWrapper) {
        console.log('No tabs wrapper found')
        return
      }

      const tabLinks = tabsWrapper.querySelectorAll('.tab-link')
      const activeTabElement = tabLinks[activeIndex]

      if (activeTabElement) {
        const wrapperRect = tabsWrapper.getBoundingClientRect()
        const tabRect = activeTabElement.getBoundingClientRect()

        // Вычисляем относительную позицию с учетом padding
        const left = tabRect.left - wrapperRect.left
        const width = tabRect.width

        this.indicatorStyle = {
          width: `${width}px`,
          left: `${left}px`,
          opacity: 1
        }

        console.log('Updated indicator:', this.indicatorStyle)
      } else {
        console.log('Could not find active tab element')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.animated-tabs-container {
  margin-top: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tabs-wrapper {
  position: relative;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(245, 85, 0, 0.3);
  padding: 5px;
  display: flex;
  gap: 5px;
  overflow: hidden;
}

.active-tab-indicator {
  position: absolute;
  top: 5px;
  bottom: 5px;
  background: linear-gradient(135deg, #f50, #ff6b35);
  border-radius: 6px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 8px rgba(245, 85, 0, 0.4),
    0 0 20px rgba(245, 85, 0, 0.2);
  z-index: 1;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #f50, #ff6b35);
    border-radius: 8px;
    opacity: 0.3;
    filter: blur(4px);
    z-index: -1;
  }
}

.tab-link {
  position: relative;
  color: rgba(255, 255, 255, 0.7) !important;
  text-decoration: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  z-index: 2;
  cursor: pointer;
  border: 2px solid transparent;
  min-width: 44px;

  &:hover {
    color: white !important;
    transform: translateY(-1px);
    border-color: rgba(245, 85, 0, 0.3);

    &:not(.active) {
      background: rgba(245, 85, 0, 0.15);
    }
  }

  // Очень заметный стиль для активной табы
  &.active {
    color: white !important;
    transform: translateY(-1px);
    background: rgba(245, 85, 0, 0.5) !important;
    border-color: #f50 !important;
    font-weight: 700;

    // Дополнительная индикация снизу
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 10%;
      right: 10%;
      height: 3px;
      background: #f50;
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(245, 85, 0, 0.8);
    }
  }

  // Специальные стили для первой и второй табы для отладки
  &.first-tab.active {
    background: rgba(245, 85, 0, 0.7) !important;
  }

  &.second-tab.active {
    background: rgba(255, 107, 53, 0.7) !important;
  }

  i {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }

  &:hover i {
    transform: scale(1.1);
  }

  &.active i {
    transform: scale(1.1);
    filter: drop-shadow(0 0 4px rgba(245, 85, 0, 0.8));
  }
}

.debug-info {
  margin-top: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #ccc;
  border: 1px solid rgba(245, 85, 0, 0.3);
  max-width: 300px;

  p {
    margin: 4px 0;
    word-break: break-all;
  }
}
</style>
