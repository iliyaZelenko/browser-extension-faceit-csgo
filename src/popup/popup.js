import Vue from 'vue'
import App from './App'
import store from '../store'
import router from './router'
import VueAxios from 'vue-plugin-axios'
import axios from 'axios'
import VueSelect from 'vue-cool-select'

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

Vue.use(VueAxios, {
  axios
})

Vue.use(VueSelect, {
  theme: 'bootstrap' // or 'material-design'
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
