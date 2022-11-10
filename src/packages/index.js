import audioPlayer from './audio-player.vue'

audioPlayer.install = (Vue) => {
  Vue.component(audioPlayer.name, audioPlayer)
}

export default audioPlayer
