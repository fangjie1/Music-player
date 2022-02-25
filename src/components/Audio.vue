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
      <div class="bar">
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
           aria-hidden="true">
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
      },
      icon: 'play'
    };
  },
  props: {
    src: String,
    changSong: {
      type: Boolean,
      default: false
    },

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
      this.audio.minTime = 0
    }
  },
  methods: {
    // 控制音频的播放与暂停
    playAudio () {
      if (this.icon == 'play') {
        this.icon = 'pause'
        this.audio.playing = true
        this.play()
      } else {
        this.icon = 'play'
        this.audio.playing = false
        this.pause()
      }
      this.$emit('changStatus', this.audio.playing)
    },
    // 播放音频
    play () {
      console.log("播放音频");
      this.$refs.audio.play();
    },
    // 暂停音频
    pause () {
      console.log("暂停音频");
      this.$refs.audio.pause();
    },
    // 当指定的音频/视频的元数据已加载时，会发生 loadedmetadata 事件。
    onLoadedmetadata (e) {
      console.log("loadedmetadata数据已加载时");
      // 切换自动播放
      if (this.changSong) {
        this.play()
      }
      this.audio.maxTime = parseInt(e.target.duration);
    },
    // 当音频当前时间改变后，进度条也要改变
    handleAudioTimeUpdated (e) {
      this.audio.currentTime = e.target.currentTime;
      this.sliderTime = parseInt(
        (this.audio.currentTime / this.audio.maxTime) * 100
      );
      this.audio.minTime = parseInt(this.audio.currentTime);
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
    }
  },
  filters: {
    // 将整数转化成时分秒
    formatSecond (second = 0) {
      return realFormatSecond(second);
    }
  }
}
</script>
<style lang='scss' scoped>
.play-bar {
  .bar-area {
    color: #868aaf;
    font-size: 16px;
    display: flex;
    padding: 0 20px;
    margin-top: 20px;
    align-items: center;
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