<template>
  <div class="play">
    <!-- 模糊背景(靠样式设置), 固定定位 -->
    <div class="song-bg"
         :style="`background-image: url(${
        songInfo && songInfo.al && songInfo.al.picUrl
      }?imageView&thumbnail=360y360&quality=75&tostatic=0);`"></div>
    <!-- 播放页头部导航 -->
    <div class="header">
      <van-icon name="arrow-left"
                size="20"
                class="left-icon"
                @click="$router.back()" />
    </div>
    <div ref="content"
         class="content">
      <div class="panel">
        <div class="loading"
             v-show="loading">
          <van-loading color="#0094ff"
                       size="100px">
          </van-loading>
        </div>
        <!-- 留声机 - 容器 -->
        <div class="song-wrapper"
             v-show="!loading">
          <!-- 留声机本身(靠css动画做旋转) -->
          <div class="song-turn ani"
               :style="`animation-play-state:${playState ? 'running' : 'paused'}`">
            <div class="song-img">
              <!-- &&写法是为了防止报错, 有字段再继续往下访问属性 -->
              <img style="width: 100%"
                   :src="`${
              songInfo && songInfo.al && songInfo.al.picUrl
            }?imageView&thumbnail=360y360&quality=75&tostatic=0`"
                   alt />
            </div>
          </div>
          <!-- 播放按钮 -->
          <div class="start-box"
               @click="audioStart">
            <span class="song-start"
                  v-show="!playState"></span>
          </div>
          <!-- 播放歌词容器 -->
          <div class="song-msg">
            <!-- 歌曲名 -->
            <h2 class="m-song-h2">
              <span class="m-song-sname">
                {{ songInfo.name }}-{{
            songInfo && songInfo.ar && songInfo.ar[0].name
            }}
              </span>
            </h2>
            <!-- 歌词部分-随着时间切换展示一句歌词 -->
            <div class="lrcContent">
              <p class="lrc">{{ curLyric }}</p>
            </div>
          </div>
          <!-- 留声机 - 唱臂 -->
          <div class="needle"
               :style="`transform: rotate(${needleDeg});`"></div>
        </div>
      </div>
      <div ref="panel-lyrics"
           class="panel-lyrics">
        <div ref="container"
             class="container">
          <p ref="lyrics"
             v-for="(item,key,index) of lyric"
             :key="index">{{item}}</p>
        </div>
      </div>
    </div>
    <!-- 播放音频组件 -->
    <Audio ref="audio"
           :src="`https://music.163.com/song/media/outer/url?id=${songId}.mp3`"
           @currentTime="currentTimeFn"
           @pre="pre"
           @next="next"
           @changStatus="changStatus"
           @isEnd="isEnd"
           @showDig="showDigFn"
           @canplay="playFn"></Audio>
    <div v-if="songs"
         class="songs"
         ref="songs"
         :class="{show:showDig}">
      <SongItem v-for="(obj,index) in songs"
                :key="obj.id"
                :name="obj.name"
                :author="obj.ar[0].name"
                :id="obj.id"
                :listId="id"
                :isRecommendMusic="1"
                @click.native="changeSong(index)">
      </SongItem>
    </div>
  </div>
</template>

<script>
import Audio from "../../components/Audio";
import Swiper from '../../vender/swiper'
import SongItem from "@/components/SongItem";
import { getSongByIdAPI, getLyricByIdAPI, recommendGetPlaylistAPI } from "@/api";
export default {
  name: 'Play',
  data () {
    return {
      playState: false, // 音乐播放状态
      loading: false,
      id: this.$route.query.id, // 上一页传过来的音乐或歌单id
      songInfo: {}, // 歌曲信息
      contentArr: [],
      lyric: {}, // 歌词枚举对象
      lyricTimeArr: [],
      lyricIndex: 0, // 当前歌词索引
      curLyric: "", // 当前显示哪句歌词
      currentTime: "",//记录当前播放时间
      isRecommendMusic: this.$route.query.isRecommendMusic || 0,
      songId: '',// 歌曲id
      songs: null,// 歌单
      songIndex: 0,
      showDig: false,
      nodeList: null
    };
  },
  computed: {
    needleDeg () {
      // 留声机-唱臂的位置属性
      return this.playState ? "-7deg" : "-38deg";
    }
  },
  components: {
    Audio, SongItem
  },
  watch: {
    currentTime () {
      this.lyricTimeArr.forEach((time, index) => {
        if (time < this.currentTime) {
          // 进度条跳转后重置当前歌词索引
          this.lyricIndex = index
        }
      })
      this.locateLyric()
    },
    showDig () {
      if (this.showDig) {
        window.addEventListener('touchstart', this.clickLocation)
      } else {
        window.removeEventListener("touchstart", this.clickLocation);
      }
    },
  },
  methods: {
    // 初始化请求歌单数据或歌曲
    start () {
      if (this.isRecommendMusic == 1) {
        recommendGetPlaylistAPI({ id: this.id, limit: 10, offset: 0 }).then(data => {
          this.songs = data.data.songs
          this.getSong(this.songs[this.songIndex].id);
        })
      } else {
        this.getSong(this.id);
      }
      this.$nextTick(() => {
        this.swiper()
      })
    },
    // 滑动切换
    swiper () {
      let swiper = new Swiper(this.$refs.content)
      swiper.on('swiperLeft', function () {
        this.classList.add('panel1')
      })
      swiper.on('swiperRight', function () {
        this.classList.remove('panel1')
      })
    },
    // 切换歌曲单个歌曲
    changeSong (index) {
      this.songIndex = index
      this.getSong(this.songs[this.songIndex].id)
      this.showDig = false
    },
    // 获取歌曲
    async getSong (id) {
      this.loading = true
      // 获取歌曲id
      this.songId = id
      // 获取歌曲详情, 和歌词方法
      const res = await getSongByIdAPI(id);
      this.songInfo = res.data.songs[0];
      // 获取-并调用_formatLyr方法, 处理歌词
      const lyrContent = await getLyricByIdAPI(id);
      const lyricStr = lyrContent.data.lrc.lyric;
      this.lyric = this._formatLyr(lyricStr);
      // 初始化完毕先显示零秒歌词
      this.curLyric = this.lyric[0];
      this.loading = false
    },
    // 生成歌词对象
    _formatLyr (lyricStr) {
      let reg = /\[.+?\]/g; //
      let timeArr = lyricStr.match(reg); // 匹配所有[]字符串以及里面的一切内容, 返回数组
      let contentArr = lyricStr.split(/\[.+?\]/).slice(1); // 按照[]拆分歌词字符串, 返回一个数组(下标为0位置元素不要,后面的留下所以截取)
      this.contentArr = contentArr
      let lyricObj = {}; // 保存歌词的对象, key是秒, value是显示的歌词
      if (timeArr) {
        timeArr.forEach((item, index) => {
          // 拆分[00:00.000]这个格式字符串, 把分钟数字取出, 转换成秒
          let ms = item.split(":")[0].split("")[2] * 60;
          // 拆分[00:00.000]这个格式字符串, 把十位的秒拿出来, 如果是0, 去拿下一位数字, 否则直接用2位的值
          let ss = item
            .split(":")[1]
            .split(".")[0]
            .split("")[0] === "0"
            ? item
              .split(":")[1]
              .split(".")[0]
              .split("")[1]
            : item.split(":")[1].split(".")[0];
          // 秒数作为key, 对应歌词作为value
          lyricObj[ms + Number(ss)] = contentArr[index]
        })
      }
      // 返回得到的歌词对象
      this.lyricTimeArr = Object.keys(lyricObj)
      return lyricObj;
    },
    // 播放按钮 - 点击事件
    audioStart () {
      this.$refs.audio.playAudio()
    },
    // 改变播放图标状态
    changStatus (bol) {
      this.playState = bol
    },
    // 监听播放audio进度, 切换歌词显示
    currentTimeFn (currentTime) {
      this.currentTime = currentTime
    },
    playFn () {
      this.$refs.audio.play()
    },
    // 获取当前播放歌词标签
    locateLyric () {
      //  currentLineTime当前歌词时间
      let currentLineTime = this.lyricTimeArr[this.lyricIndex]
      if (this.currentTime >= currentLineTime && this.lyricIndex < this.lyricTimeArr.length) {
        let node = this.$refs.lyrics[this.lyricIndex]
        if (node) {
          this.setLyricToCenter(node)
          this.lyricIndex++
        }
      }
    },

    //设置歌词滚动
    setLyricToCenter (node) {
      let translateY = node.offsetTop - this.$refs['panel-lyrics'].offsetHeight / 2
      translateY = translateY > 0 ? translateY : 0
      this.$refs.container.style.transform = `translateY(-${translateY}px)`
      this.$refs.lyrics.forEach(node => node.classList.remove('current'))
      node.classList.add('current')
      this.curLyric = node.innerText
    },
    // 上一首
    pre () {
      if (this.isRecommendMusic == '0') return
      if (this.songIndex > 0) {
        this.songIndex--
        this.getSong(this.songs[this.songIndex].id);
      } else {
        this.songIndex = this.songs.length - 1
        this.getSong(this.songs[this.songIndex].id);
      }
    },
    // 下一首
    next () {
      if (this.isRecommendMusic == '0') return
      if (this.songIndex < this.songs.length - 1) {
        this.songIndex++
        this.getSong(this.songs[this.songIndex].id);
      } else {
        this.songIndex = 0
        this.getSong(this.songs[0].id);
      }
    },
    // 播放完毕初始化
    isEnd () {
      this.$refs.lyrics.forEach(node => node.classList.remove('current'))
      this.$refs.container.style.transform = `translateY(0px)`
      this.lyricIndex = 0
      this.$refs.audio.$refs.progress.style.width = '0px'
    },
    // 展示歌单列表
    showDigFn () {
      if (!this.songs) {
        this.$toast('当前无其他歌曲')
        return
      }
      this.showDig = !this.showDig
    },
    // 点击弹层之外的区域关闭弹层
    clickLocation (e) {
      const songs = e.path.find(target => target == this.$refs.songs)
      if (!songs) {
        this.showDig = false
      }
    },
  },
  mounted () {
    this.start()

  },
  beforeDestroy () {
    this.$refs.audio.$refs.audio.removeEventListener("timeupdate", this.lyricTimeFn);
  }
};
</script>

<style lang="scss">
.play {
  $backgroundColor: #060a3d;
  $color: #fff;
  $color1: #868aaf;
  $color2: #db3baa;
  $color2-dark: darken($color2, 10%);
  $color2-darker: darken($color2, 30%);
  $color3: #0025f1;
  position: fixed;
  width: 100%;
  height: 100%;
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 50px;
    .left-icon {
      position: absolute;
      top: 15px;
      left: 15px;
      font-size: 24px;
      z-index: 10001;
      color: #fff;
    }
  }
  .song-bg {
    background-color: #161824;
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: auto 100%;
    transform: scale(1.5);
    transform-origin: center;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    /* z-index: 1; */
    opacity: 1;
    filter: blur(25px);
    /*模糊背景 */
    &::before {
      /*纯白色的图片做背景, 歌词白色看不到了, 在背景前加入一个黑色半透明蒙层解决 */
      content: " ";
      background: rgba(0, 0, 0, 0.5);
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
    }
  }
  .content {
    margin-top: 50px;
    display: flex;
    height: 62vh;
    width: 200%;
    transition: transform 0.3s;
    &.panel1 {
      transform: translateX(-100vw);
    }
    .panel {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      position: relative;
      .loading {
        position: absolute;
        left: 50%;
        top: 35%;
        transform: translate(-50%, -50%);
      }
      .song-wrapper {
        width: 247px;
        height: 247px;
        position: absolute;
        top: 60px;
        .song-turn {
          width: 100%;
          height: 100%;
          background: url("./img/bg.png") no-repeat;
          background-size: 100%;
          .song-img {
            width: 154px;
            height: 154px;
            position: absolute;
            left: 50%;
            top: 50%;
            overflow: hidden;
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
        }
        .ani {
          animation: turn 5s linear infinite;
        }
        .start-box {
          position: absolute;
          width: 156px;
          height: 156px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          justify-content: center;
          align-items: center;
          .song-start {
            width: 56px;
            height: 56px;
            background: url("./img/start.png");
            background-size: 100%;
          }
        }
        .m-song-h2 {
          margin-top: 20px;
          text-align: center;
          font-size: 18px;
          color: #fefefe;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .lrcContent {
          margin-top: 45px;
          .lrc {
            font-size: 14px;
            color: #fff;
            text-align: center;
          }
        }
        .needle {
          position: absolute;
          transform-origin: left top;
          background: url("./img/needle-ab.png") no-repeat;
          background-size: contain;
          width: 73px;
          height: 118px;
          top: -40px;
          left: 112px;
          transition: all 0.6s;
        }
      }
    }
    .panel-lyrics {
      width: 100%;
      height: 100%;
      text-align: center;
      overflow: hidden;
      min-height: auto;
      .container {
        transition: all 0.4s;
        p {
          color: $color1;
          line-height: 2;
          font-size: 14px;

          &.current {
            color: $color;
          }
        }
      }
    }
  }
  .songs {
    position: fixed;
    bottom: -160px;
    left: 0;
    height: 160px;
    width: 100vw;
    overflow: scroll;
    transition: all 0.3s;
    transform: translateY(0);
    &.show {
      transform: translateY(-100%);
    }
  }

  @keyframes turn {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
}
</style>