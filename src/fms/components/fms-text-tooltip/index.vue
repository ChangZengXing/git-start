<template>
  <div class="fms-text-tooltip" @mouseover="onMouseover">
    <el-tooltip :content="content" :disabled="disabled" v-bind="$attrs" v-on="$listeners">
      <span class="fms-tooltip-content">{{content}}</span>
    </el-tooltip>
  </div>
</template>

<script>
  export default {
    props: ['content'],
    data () {
      return {
        disabled: true
      }
    },
    methods: {
      isEllipsisActive (el) {
        var tolerance = 1 // In px. Depends on the font you are using
        // console.log('el.offsetWidth', el.offsetWidth, el.scrollWidth)
        return el.offsetWidth + tolerance < el.scrollWidth
      },
      updateToolTip () {
        this.disabled = !this.isEllipsisActive(this.$el)
      },
      onMouseover () {
        // console.log('onMouseover')
        this.updateToolTip()
      }
    },
    mounted () {
      setTimeout(() => {
        this.updateToolTip()
      }, 320)
    }
  }

</script>

<style lang="scss">
  .fms-text-tooltip {
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
  }
</style>
