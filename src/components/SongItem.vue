<template>
  <van-cell center
            :title="name"
            :label="author+' - '+name"
            @click="playFn">
    <template #right-icon>
      <van-icon name="play-circle-o"
                size="0.6rem"
                @click="playFn" />
    </template>
  </van-cell>
</template>

<script>
export default {
  props: {
    name: String,
    author: String,
    listId: String,
    id: Number,
    isRecommendMusic: {
      type: Number,
      default: 0
    }
  },
  methods: {
    playFn () {
      if (this.isRecommendMusic == 1) {
        this.$router.push({
          path: "/play",
          query: {
            id: this.listId,
            isRecommendMusic: this.isRecommendMusic
          }
        });
      } else {
        this.$router.push({
          path: "/play",
          query: {
            id: this.id,
            isRecommendMusic: this.isRecommendMusic
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.main {
  padding-top: 46px;
  padding-bottom: 50px;
}
</style>