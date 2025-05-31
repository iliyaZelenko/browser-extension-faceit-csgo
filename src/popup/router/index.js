import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import analyticsService from '../services/analytics'

Vue.use(VueRouter)

const router = new VueRouter({
    routes
})

// Отслеживание навигации
router.beforeEach((to, from, next) => {
    // Отслеживаем переходы между страницами
    const eventMap = {
        'index': 'page_view_elo_stats',
        'full-stats': 'page_view_full_stats',
        'map-stats': 'page_view_map_stats',
        'match-history': 'page_view_match_history',
        'favorites': 'page_view_favorites'
    }

    const eventName = eventMap[to.name]
    if (eventName) {
        analyticsService.trackPageView(to.path)
        analyticsService.trackEvent(eventName, {
            page: to.name,
            from_page: from.name || 'direct',
            params: JSON.stringify(to.params)
        })
    }

    next()
})

export default router