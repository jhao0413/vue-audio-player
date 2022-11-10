import Vue from 'vue'
import App from './App.vue'
import audioPlayer from './packages/index'

Vue.use(audioPlayer)
new Vue({
  el: '#app',
  render: (h) => h(App),
})
