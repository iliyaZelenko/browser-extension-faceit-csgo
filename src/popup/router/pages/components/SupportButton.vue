<template>
  <div
    class="support-button"
    @click="openTelegram"
  >
    <i class="fas fa-headset" />
  </div>
</template>

<script>
export default {
  name: 'SupportButton',
  methods: {
    openTelegram () {
      this.$browser.tabs.create({
        url: 'https://t.me/+kywMwGjayds3Nzc6'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.support-button {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #0088cc, #00aaff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 136, 204, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 136, 204, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }

  i {
    color: white;
    font-size: 16px;
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
