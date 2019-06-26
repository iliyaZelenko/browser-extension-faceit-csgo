import StatsBase from './pages/StatsBase'
import EloStats from './pages/EloStats'
import FullStatsPage from './pages/FullStats'

export default [
  {
    path: '/',
    component: StatsBase,
    children: [
      {
        path: '',
        name: 'index',
        component: EloStats
      },
      {
        path: '/full-stats',
        name: 'full-stats',
        component: FullStatsPage
      }
    ]
  }
]
