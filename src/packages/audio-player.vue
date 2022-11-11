<template>
  <div class="audio_player" ref="audio_player">
    <!-- 滑块 -->
    <div class="progress">
      <div class="time">{{ formatTime(currentTime) }}</div>

      <div
        class="progress_bar"
        ref="progress_bar"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @mousemove="mouseMove"
      >
        <div class="buffer_bar" ref="buffer_bar"></div>
        <div class="progress_bar_inner" ref="progress_bar_inner"></div>
        <div
          class="progress_bar_dot"
          ref="progress_bar_dot"
          :style="{
            left: `${this.distance}px`,
          }"
        ></div>
      </div>

      <div class="time">{{ formatTime(duration) }}</div>
    </div>

    <!-- 播放按钮 -->
    <div class="player">
      <div class="music_info">
        <img :src="musicPlaying.img" alt="" />
        <div class="music_info_detail">
          <div class="music_info_name">{{ musicPlaying.name }}</div>
          <div class="music_info_singer">{{ musicPlaying.singer }}</div>
        </div>
      </div>

      <div class="operation">
        <img
          class="prev"
          src="https://jhao413.oss-cn-beijing.aliyuncs.com/blog/prev.svg"
          alt=""
          @click="prev"
        />
        <div :class="isPlay ? 'suspend' : 'play'" @click="play"></div>
        <img
          class="next"
          src="https://jhao413.oss-cn-beijing.aliyuncs.com/blog/next.svg"
          alt=""
          @click="next"
        />
      </div>

      <div class="control">
        <div class="volume">
          <img src="https://jhao413.oss-cn-beijing.aliyuncs.com/blog/volume.svg" alt="" />
          <div
            class="volume_bar"
            ref="volume_bar"
            @mousedown="volumeDown"
            @mouseup="volumeUp"
            @mousemove="volumeMove"
            @mouseleave="volumeLeave"
          >
            <div class="volume_bar_inner" ref="volume_bar_inner"></div>
            <div
              class="volume_bar_dot"
              ref="volume_bar_dot"
              :style="{
                left: `${this.volume * 100}%`,
              }"
            ></div>
          </div>
        </div>

        <div class="list">
          <img
            @click="showList"
            src="https://jhao413.oss-cn-beijing.aliyuncs.com/blog/list.svg"
            alt=""
          />
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <div class="music_list" ref="music_list">
      <transition-group name="fade">
        <div
          v-show="listVisible"
          :class="item.id == musicPlaying.id ? 'item_active' : 'item'"
          v-for="item in musicList"
          :key="item.id"
          @click="switchMusic(item)"
        >
          <span>{{ item.name }}</span>
          <span>{{ item.singer }}</span>
        </div>
      </transition-group>
    </div>

    <audio ref="music" id="music">
      <source :src="musicPlaying.url" type="audio/mpeg" />
    </audio>
  </div>
</template>

<script>
export default {
  name: 'audio-player',
  data() {
    return {
      isPlay: false,
      currentTime: 0, //当前播放时间
      duration: 0, //音乐总长度
      volume: 100, //音量
      buffer: 0, //缓冲条
      isDown: false, //是否按下音乐进度滑块
      distance: 0, //滑块偏移量
      musicPlaying: {}, //当前播放的音乐信息
      listVisible: false, //音乐列表是否显示
      volume: 0, //音量
      isVolumeDown: false,
      timer: '',
    }
  },
  props: {
    musicList: {
      type: Array,
      required: true,
    },
  },
  watch: {
    musicPlaying(newMusic, oldMusic) {
      if (Object.keys(oldMusic).length == 0) {
        return
      }
      //音乐信息改变后重新加载audio
      this.$refs.music.load()
      this.buffer = 0
      this.distance = 0
      this.$refs.buffer_bar.style.width = 0
      this.play()
    },
    currentTime() {
      if (!this.isDown) {
        // 播放进度条
        this.$refs.progress_bar_inner.style.width = `${(this.currentTime / this.duration) * 100}%`
        // 缓冲进度条
        if (this.$refs.music.buffered.length != 0) {
          this.buffer =
            (this.$refs.music.buffered.end(this.$refs.music.buffered.length - 1) /
              this.$refs.music.duration) *
            100

          this.$refs.buffer_bar.style.width = `${this.buffer}%`
        }

        // 滑块
        this.distance = (this.currentTime / this.duration) * this.$refs.progress_bar.clientWidth
      }
    },
    volume() {
      this.$refs.music.volume = this.volume
    },
  },
  created() {
    if (this.musicList.length == 0) {
      throw new Error('The musicList of vue-audio-player is a required attribute')
    }
    this.keyDown()
    this.musicList.forEach((item, index) => {
      item.id = index
    })
    this.musicPlaying = this.musicList[0]
  },
  mounted() {
    this.volume = this.$refs.music.volume
    this.$refs.volume_bar_inner.style.width = `${this.volume * 100}%`
    this.timer = setInterval(this.listenMusic, 100)
    window.addEventListener('mousemove', this.mouseMove)
    window.addEventListener('mouseup', this.mouseUp)
  },
  destroyed() {
    // 清除定时器和监听事件
    clearInterval(this.timer)
    this.timer = null
    window.removeEventListener('mousemove', this.mouseMove)
    window.removeEventListener('mouseup', this.mouseUp)
  },
  methods: {
    // 切换音乐
    prev() {
      this.musicPlaying.id <= 0
        ? console.log(this.musicPlaying.id)
        : (this.musicPlaying = this.musicList[this.musicPlaying.id - 1])
    },
    next() {
      this.musicPlaying.id >= this.musicList.length - 1
        ? console.log(this.musicPlaying.id)
        : (this.musicPlaying = this.musicList[this.musicPlaying.id + 1])
    },
    // 音乐播放
    listenMusic() {
      if (!this.$refs.music) {
        return
      }

      if (this.$refs.music.readyState == 4) {
        //获取音乐总长度
        this.duration = this.$refs.music.duration
      }

      this.currentTime = this.$refs.music.currentTime
    },

    play() {
      this.$refs.music.paused ? this.$refs.music.play() : this.$refs.music.pause()

      //获取音乐总长度
      if (!this.duration) {
        this.duration = this.$refs.music.duration
      }

      //控制音乐播放状态
      this.isPlay = !this.$refs.music.paused
    },
    changeTime() {
      if (this.$refs.progress_bar) {
        this.$refs.music.currentTime =
          this.distance * (this.duration / this.$refs.progress_bar.offsetWidth)
      }
    },
    mouseDown(e) {
      this.isDown = true
      this.progressChange(e)
    },
    mouseUp() {
      if (this.isDown == false) {
        return
      }
      this.isDown = false

      this.changeTime()
    },
    mouseMove(e) {
      if (this.isDown) {
        this.progressChange(e)
      }
    },
    progressChange(e) {
      // 获取进度条和滑块的偏移量
      this.distance =
        e.clientX - this.$refs.progress_bar.offsetLeft - this.$refs.audio_player.offsetLeft

      if (this.distance > this.$refs.progress_bar.clientWidth) {
        this.distance = this.$refs.progress_bar.clientWidth
      }

      this.$refs.progress_bar_dot.style.left = this.distance + 'px'
      this.$refs.progress_bar_inner.style.width = this.distance + 'px'
    },
    formatTime(time) {
      let it = parseInt(time)
      let m = parseInt(it / 60)
      let s = parseInt(it % 60)
      return (m < 10 ? '0' : '') + parseInt(it / 60) + ':' + (s < 10 ? '0' : '') + parseInt(it % 60)
    },
    keyDown() {
      //监听键盘按钮
      document.onkeydown = (event) => {
        var e = event || window.event
        var keyCode = e.keyCode || e.which
        switch (keyCode) {
          case 32:
            this.play()
            break

          case 37:
            this.distance = this.distance - 10
            this.changeTime()
            break

          case 39:
            this.distance = this.distance + 10
            this.changeTime()
            break

          default:
            break
        }
      }
    },
    showList() {
      this.listVisible
        ? (this.$refs.music_list.style.height = '0px')
        : (this.$refs.music_list.style.height = '160px')

      this.listVisible = !this.listVisible
    },
    // 列表item切换歌曲
    switchMusic(music) {
      if (this.musicPlaying.id == music.id) {
        return
      }
      this.musicPlaying = music
    },
    volumeDown(e) {
      this.isVolumeDown = true
      this.volumeChange(e)
    },
    volumeUp() {
      this.isVolumeDown = false
    },
    volumeMove(e) {
      if (this.isVolumeDown) {
        this.volumeChange(e)
      }
    },
    volumeLeave() {
      this.isVolumeDown = false
    },
    volumeChange(e) {
      this.volume =
        (e.clientX - this.$refs.volume_bar.offsetLeft - this.$refs.audio_player.offsetLeft) / 70
      this.$refs.volume_bar_inner.style.width = `${this.volume * 100}%`

      if (this.volume >= 1) {
        this.volume = 1
      }

      if (this.volume <= 0) {
        this.volume = 0
      }
    },
  },
}
</script>

<style lang="less" scoped>
@font-size: 12px;
.audio_player {
  width: 35%;
  min-width: 400px;
  height: 80px;
  display: flex;
  bottom: 50px;
  left: 0;
  right: 0;
  position: fixed;
  flex-direction: column;
  align-items: center;
  margin: 20px auto;
  border-radius: 10px;
  box-shadow: 0 0 3px #ccc;
  justify-content: space-around;
  user-select: none;

  .progress {
    display: flex;
    width: 100%;
    color: #aaa;
    justify-content: center;

    .time {
      font-size: @font-size;
      padding: 0 5px;
    }
    .progress_bar {
      width: 85%;
      height: 5px;
      margin-top: 5px;
      background: #eee;
      border-radius: 10px;
      position: relative;
      cursor: pointer;

      .progress_bar_inner {
        height: 5px;
        position: absolute;
        border-radius: 10px;
        background-color: #409eff;
        left: 0%;
      }

      .buffer_bar {
        height: 5px;
        border-radius: 10px;
        position: absolute;
        background-color: #bbb;
        left: 0%;
        display: block;
      }

      .progress_bar_dot {
        width: 8px;
        height: 8px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 100);
        border: 2px solid #409eff;
        position: absolute;
        left: 0;
        top: -4px;
        margin-left: -6px;
        display: none;
      }

      &:hover > .progress_bar_dot {
        display: block;
      }
    }
  }

  .player {
    width: 95%;
    display: flex;
    justify-content: space-between;

    .music_info {
      display: flex;
      width: 150px;

      img {
        width: 40px;
        height: 40px;
        border-radius: 5px;
        box-shadow: 0 0 10px #bbb;
      }

      .music_info_detail {
        font-size: @font-size;
        margin-left: 10px;
        text-align: left;
      }
    }

    .operation {
      display: flex;
      .play {
        width: 0;
        height: 0;
        cursor: pointer;
        border-style: solid;
        transition: all 0.2s;
        border-width: 10px 0 10px 15px;
        border-color: transparent #000 transparent;
      }

      .suspend {
        width: 5px;
        height: 20px;
        cursor: pointer;
        transition: all 0.2s;
        border-style: solid;
        border-width: 0 5px 0;
        border-color: transparent #000 transparent;
      }

      img {
        width: 22px;
        height: 22px;
        cursor: pointer;
        padding: 0 10px;
      }
    }

    .control {
      width: 125px;
      display: flex;
      justify-content: space-between;
      .volume {
        display: flex;
        img {
          width: 20px;
          height: 20px;
        }

        .volume_bar {
          width: 70px;
          height: 5px;
          margin-top: 6px;
          margin-left: 5px;
          background: #eee;
          border-radius: 10px;
          position: relative;
          cursor: pointer;

          .volume_bar_inner {
            height: 5px;
            position: absolute;
            border-radius: 10px;
            background-color: #409eff;
            left: 0%;
          }

          .volume_bar_dot {
            width: 8px;
            height: 8px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 100);
            border: 2px solid #409eff;
            position: absolute;
            left: 0;
            top: -4px;
            margin-left: -6px;
            display: none;
          }

          &:hover > .volume_bar_dot {
            display: block;
          }
        }
      }

      .list {
        img {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      }
    }
  }

  .music_list {
    position: absolute;
    bottom: 80px;
    width: 100%;
    height: 0;
    border-radius: 10px 10px 0 0;
    transition: height 0.6s;
    box-shadow: 0 0 3px #ccc;
    .item {
      height: 30px;
      line-height: 30px;
      display: flex;
      padding: 0 20px;
      position: relative;
      cursor: pointer;
      justify-content: space-between;
      font-size: @font-size;
      &:hover {
        background: #f5f5f5;
      }
    }

    .item_active {
      height: 30px;
      line-height: 30px;
      display: flex;
      padding: 0 20px;
      position: relative;
      cursor: pointer;
      justify-content: space-between;
      font-size: @font-size;
      color: #409eff;
      &:hover {
        background: #f5f5f5;
      }
      &::before {
        content: ' ';
        position: absolute;
        left: 5px;
        top: 10px;
        width: 0;
        height: 0;
        border-style: solid;
        transition: all 0.2s;
        border-width: 5px 0 5px 8px;
        border-color: transparent #409eff transparent;
      }
    }

    // 列表显示动画
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.4s;
    }
    .fade-enter,
    .fade-leave-to {
      opacity: 0;
    }
  }
}
</style>
