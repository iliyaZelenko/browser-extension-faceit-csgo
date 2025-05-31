<template>
  <div class="support-button" @click="openTelegram">
    <i class="fas fa-headset"></i>
  </div>
</template>

<script>
export default {
  name: 'SupportButton',
  methods: {
    openTelegram() {
      this.$browser.tabs.create({
        url: 'https://t.me/+kywMwGjayds3Nzc6'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.support-button {
  position: fixed;
  bottom: 15px;
  right: 15px;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #0088cc, #00aaff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 136, 204, 0.6);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  i {
    color: white;
    font-size: 20px;
  }
}

// Анимация появления
.support-button {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 