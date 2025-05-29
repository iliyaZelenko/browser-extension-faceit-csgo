import Vue from 'vue'
import App from './App'
import browser from 'webextension-polyfill'

/* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App)
})