<template>
  <div class="empty-state">
    <div class="empty-content">
      <div class="empty-icon">
        <i class="fas fa-search" />
      </div>

      <h3 class="empty-title">
        {{ $browser.i18n.getMessage('noPlayerSelected') }}
      </h3>

      <p class="empty-description">
        {{ $browser.i18n.getMessage('searchPlayerHint') }}
      </p>

      <div class="empty-hint">
        <i class="fas fa-info-circle" />
        {{ $browser.i18n.getMessage('startSearching') }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState'
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
  text-align: center;
}

.empty-content {
  max-width: 280px;
  margin: 0 auto;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff5500, #ff7733);
  border-radius: 50%;
  box-shadow: 0 8px 25px rgba(255, 85, 0, 0.3);

  i {
    font-size: 32px;
    color: white;
  }
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #777;
  margin: 0 0 12px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.empty-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #888;
  background: rgba(255, 85, 0, 0.05);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 85, 0, 0.1);

  i {
    color: #ff5500;
    font-size: 14px;
  }
}

// Анимация появления
.empty-state {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Адаптивность
@media (max-width: 320px) {
  .empty-state {
    padding: 20px 10px;
    min-height: 250px;
  }

  .empty-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;

    i {
      font-size: 24px;
    }
  }

  .empty-title {
    font-size: 1.3rem;
  }

  .empty-description {
    font-size: 0.9rem;
  }
}
</style>
