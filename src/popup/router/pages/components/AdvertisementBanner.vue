<template>
  <div
    v-if="hasAdvertisement"
    class="advertisement-banner"
    @click="openAdvertisementLink"
  >
    <img
      :src="adImageSrc"
      :alt="'Advertisement'"
      :style="{
        width: adImageWidth,
        height: adImageHeight,
        objectFit: 'contain'
      }"
    >
  </div>
</template>

<script>
import remoteConfig from '../../../services/remoteConfig.js'

export default {
  name: 'AdvertisementBanner',
  data() {
    return {
      adImageSrc: '',
      adImageHeight: 60,
      adImageWidth: 300,
      adImageHref: '',
      hasAdvertisement: false
    }
  },
  async created() {
    // Инициализируем Remote Config и загружаем значения рекламы
    try {
      await remoteConfig.initialize()
      await remoteConfig.fetchConfig()
      this.loadAdvertisementData()
    } catch (error) {
      console.error('Failed to initialize Remote Config in AdvertisementBanner:', error)
      // Используем дефолтные значения при ошибке
      this.hasAdvertisement = false
    }
  },
  methods: {
    loadAdvertisementData() {
      // Загружаем данные рекламы из Remote Config
      this.hasAdvertisement = remoteConfig.getBoolean('ad_enabled', false)
      this.adImageSrc = remoteConfig.getString('ad_img_src', '')
      this.adImageHeight = remoteConfig.getString('ad_img_height', '60px')
      this.adImageWidth = remoteConfig.getString('ad_img_width', '300px')
      this.adImageHref = remoteConfig.getString('ad_img_href', '')
      
      if (this.hasAdvertisement) {
        console.log('🖼️ Advertisement banner loaded:', {
          src: this.adImageSrc,
          width: this.adImageWidth,
          height: this.adImageHeight,
          href: this.adImageHref
        })
      }
    },
    async refreshAdvertisement() {
      // Метод для обновления рекламных данных
      try {
        await remoteConfig.fetchConfig()
        this.loadAdvertisementData()
      } catch (error) {
        console.error('Failed to refresh advertisement data:', error)
      }
    },
    openAdvertisementLink() {
      // Открываем рекламную ссылку в новой вкладке
      if (this.adImageHref && this.adImageHref.trim()) {
        // Отслеживаем клик по рекламе
        if (this.$analytics) {
          this.$analytics.trackEvent('advertisement_clicked', {
            ad_url: this.adImageHref,
            ad_src: this.adImageSrc,
            timestamp: new Date().toISOString()
          })
        }
        
        // Открываем ссылку в новой вкладке
        window.open(this.adImageHref, '_blank')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.advertisement-banner {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(245, 85, 0, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  img {
    max-width: 100%;
  }
}
</style> 