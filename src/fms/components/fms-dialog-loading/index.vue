<template>
  <div
    class="fms-dialog-loading"
    :class="{'fms-dialog-loading-text': loadingText}"
    v-show="loading"
    v-loading="loading"
    :element-loading-text="loadingText"
  >
    <!-- TODO: 错误信息提示 -->
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      loading: Boolean,
      loadingText: String
    }
  }
</script>

<style lang="scss">
  .fms-dialog-loading {
    position: absolute;
    top: 52px;
    left: 0;
    right: 0;
    bottom: 0;
    .el-loading-mask.el-loading-mask {
      margin: 0;
    }
  }
  .fms-dialog-loading-text {
    .el-loading-spinner {
      margin-top: -45px;
    }
  }
</style>
