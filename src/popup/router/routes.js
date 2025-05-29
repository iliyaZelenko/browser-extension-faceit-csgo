import StatsBase from './pages/StatsBase'
import EloStats from './pages/EloStats'
import FullStatsPage from './pages/FullStats'
import MapStats from './pages/MapStats'

export default [{
    path: '/',
    component: StatsBase,
    children: [{
            path: '',
            name: 'index',
            component: EloStats
        },
        {
            path: '/full-stats',
            name: 'full-stats',
            component: FullStatsPage
        },
        {
            path: '/map-stats/:mapLabel',
            name: 'map-stats',
            component: MapStats
        }
    ]
}]