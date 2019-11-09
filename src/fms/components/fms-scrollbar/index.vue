<template>
  <div class="fms-scrollbar" @scroll="onScroll">
    <div class="fms-scrollbar-content" :style="{ width: scrollWidth }"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showBar: false,
      scrollTop: 0,
      scrollLeft: 0,
      scrollWidth: 0
    }
  },
  methods: {
    setScrollWidth(width) {
      this.scrollWidth = width + 'px'
    },
    upScroll(left = 0, top = 0) {
      this.$el.scrollTo(left, top)
    },
    onScroll() {
      this.$emit('scroll', this.$el.scrollLeft, this.$el.scrollTop)
    }
  },
  mounted() {
    this.showBar = this.$el.offsetWidth < this.scrollWidth
  }
}
</script>

<style lang="scss">
  .fms-scrollbar {
    width: 100%;
    position: relative;
    overflow: auto hidden;
    .fms-scrollbar-content {
      height: 1px;
    }
    &::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    &::-webkit-scrollbar-button {
      width: 0px;
      height: 0px;
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      cursor: pointer;
      border-radius: 6px;
      background: #aa90e8;
    }
  }
</style>
