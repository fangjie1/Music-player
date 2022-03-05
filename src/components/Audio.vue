<template>
  <div class="play-bar"
       v-if="src">
    <audio ref="audio"
           @timeupdate="handleAudioTimeUpdated"
           @loadedmetadata="onLoadedmetadata"
           :src="src"
           controls="controls"
           :loop="audio.loop"
           style="display:none"></audio>
    <div class="bar-area">
      <span class="time-start">{{audio.minTime | formatSecond}}</span>
      <span class="time-end">{{audio.maxTime | formatSecond}}</span>
      <div ref="bar"
           class="bar"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd">
        <div ref="progress"
             class="progress"></div>
      </div>
    </div>
    <div class="actions">
      <svg class="btn-order"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           aria-hidden="true"
           @click="isLoop">
        <use xlink:href="#icon-circle" />
      </svg>
      <svg class="btn-pre"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           aria-hidden="true"
           @click="pre">
        <use xlink:href="#icon-pre" />
      </svg>
      <svg ref="isPlay"
           class="btn-play-pause pause"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           aria-hidden="true"
           @click="playAudio">
        <use ref="use"
             :xlink:href="`#icon-${icon}`" />
      </svg>
      <svg class="btn-next"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           aria-hidden="true"
           @click="next">
        <use xlink:href="#icon-next" />
      </svg>
      <svg class="btn-music-list"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           aria-hidden="true"
           @click="showDig">
        <use xlink:href="#icon-list" />
      </svg>
    </div>

  </div>
</template>

<script>
// 将整数转换成 时：分：秒的格式
function realFormatSecond (second) {
  var secondType = typeof second;
  if (secondType === "number" || secondType === "string") {
    var hours = Math.floor(second / 3600);
    second = second - hours * 3600;
    var minutes = Math.floor(second / 60);
    second = second - minutes * 60;
    return (
      ("0" + minutes).slice(-2) + ":" + ("0" + second).slice(-2)
    );
  } else {
    return "00:00";
  }
}
export default {
  name: "Audio",
  data () {
    return {
      audio: {
        playing: false, // 该字段是音频是否处于播放状态的属性
        currentTime: 0, // 音频当前播放时长
        maxTime: 0, // 音频最大播放时长
        minTime: 0,
        loop: false,
        refresh: false
      },
      icon: 'play',
      touchInfo: {
        initiated: false
      },
      percent: 0
    };
  },
  props: {
    src: {
      type: String,
      require: true
    }
  },
  mounted () {
    this.$refs.audio.onerror = () => {
      if (this.$refs.audio.error.message) {
        this.$toast.fail('当前音乐暂时无法播放')
      }
    }
    this.$refs.audio.onended = () => {
      this.icon = 'play'
      this.$emit('changStatus', !this.audio.playing)
      this.$emit('isEnd')
      this.audio.playing = false
      this.audio.minTime = 0
      this.percent = this.audio.minTime / this.audio.maxTime * 100
    }
    window.addEventListener('DOMContentLoaded', () => {
      this.refresh = true
    })
  },
  methods: {
    // 控制音频的播放与暂停
    playAudio () {
      if (this.icon == 'play') {
        this.play()
      } else if (this.icon == 'pause') {
        this.pause()
      }
    },
    // 播放音频
    play () {
      console.log("播放音频");
      this.icon = 'pause'
      this.audio.playing = true
      this.$refs.audio.play();
      this.$emit('changStatus', this.audio.playing)
    },
    // 暂停音频
    pause () {
      console.log("暂停音频");
      this.icon = 'play'
      this.audio.playing = false
      this.$refs.audio.pause();
      this.$emit('changStatus', this.audio.playing)
    },
    // 当指定的音频/视频的元数据已加载时，触发loadedmetadata 事件。
    onLoadedmetadata (e) {
      console.log("loadedmetadata数据已加载时");
      // 切换自动播放，如果刷新了则停止播放，解决自动播放报错的问题
      if (!this.refresh) {
        this.$emit('canplay')
      } else {
        this.refresh = false
      }
      this.audio.maxTime = parseInt(e.target.duration);
    },
    // 当音频当前时间改变后，改变进度条
    handleAudioTimeUpdated (e) {
      this.audio.currentTime = e.target.currentTime
      this.$emit('currentTime', this.audio.currentTime)
      this.audio.minTime = parseInt(this.audio.currentTime);
      this.percent = this.audio.minTime / this.audio.maxTime * 100
      this.$refs.progress.style.width = this.percent + '%'
    },
    // 是否循环播放
    isLoop () {
      this.audio.loop = !this.audio.loop
      if (this.audio.loop) {
        this.$toast.success('已开启循环播放')
      } else {
        this.$toast.success('已关闭循环播放')
      }
    },
    pre () {
      this.$emit('pre')
    },
    next () {
      this.$emit('next')
    },
    progressTouchStart (e) {
      // 记录touch事件已经初始化 
      this.$refs.audio.muted = true
      this.touchInfo.initiated = true
      this.touchInfo.startX = e.touches[0].pageX
      this.touchInfo.left = this.$refs.bar.offsetLeft
      const barWidth = this.touchInfo.startX - this.touchInfo.left
      if (barWidth >= 0 && barWidth <= this.$refs.bar.clientWidth) {
        this.percent = barWidth / this.$refs.bar.clientWidth * 100
        this.$refs.progress.style.width = this.percent + '%'
        this.$refs.audio.currentTime = this.percent * this.$refs.audio.duration / 100
      }
    },
    progressTouchMove (e) {
      if (!this.touchInfo.initiated) {
        this.$refs.audio.muted = false
        return
      }
      // 移动距离 
      const moveX = e.touches[0].pageX - this.touchInfo.startX
      const barWidth = this.touchInfo.startX - this.touchInfo.left + moveX
      if (barWidth >= 0 && barWidth <= this.$refs.bar.clientWidth) {
        this.percent = barWidth / this.$refs.bar.clientWidth * 100
        this.$refs.progress.style.width = this.percent + '%'
        this.$refs.audio.currentTime = this.percent * this.$refs.audio.duration / 100
      }
    },
    progressTouchEnd () {
      console.log('进度条跳转后播放');
      // 通知父组件更新歌词索引
      this.$emit('move')
      this.$refs.audio.muted = false
      this.touchInfo.initiated = false
      this.audio.playing = false
      this.icon = 'play'
      this.playAudio()
    },
    showDig () {
      this.$emit('showDig')
    }
  },
  filters: {
    // 将整数转化成时分秒
    formatSecond (second = 0) {
      return realFormatSecond(second);
    }
  },
  beforeDestroy () {
    this.$refs.audio.removeEventListener("touchstart", this.progressTouchStart);
    this.$refs.audio.removeEventListener("touchmove", this.progressTouchMove);
    this.$refs.audio.removeEventListener("touchend", this.progressTouchEnd);
    this.$refs.audio.removeEventListener("timeupdate", this.handleAudioTimeUpdated);
    this.$refs.audio.removeEventListener("loadedmetadata", this.onLoadedmetadata);
  }
}
</script>
<style lang='scss' scoped>
.play-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 160px;
  width: 100vw;
  .bar-area {
    color: #868aaf;
    font-size: 16px;
    display: flex;
    padding: 0 20px;
    margin-top: 20px;
    align-items: center;
    touch-action: none;
    .time-start {
      order: 1;
      width: 40px;
    }
    .time-end {
      order: 3;
      width: 40px;
    }
    .bar {
      order: 2;
      flex: 1;
      height: 4px;
      background: #0025f1;
      border-radius: 2px;
      margin: 0 12px;
      padding: 10px 0;
      background-clip: content-box;
      .progress {
        width: 0%;
        transition: all 0.2s;
        height: 100%;
        border-radius: 2px;
        background: #db3baa;
        position: relative;
        &::after {
          content: "";
          position: absolute;
          right: -8px;
          top: -7px;
          display: block;
          width: 16px;
          height: 16px;
          background: url("../assets/svg/progress.svg") 0 0 no-repeat;
          background-size: contain;
        }
      }
    }
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    padding: 0 20px;
    font-size: 60px;
    svg {
      width: 28px;
      height: 28px;

      &.btn-play-pause {
        width: 50px;
        height: 50px;
      }
    }
  }
}
</style>