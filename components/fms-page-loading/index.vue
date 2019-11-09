<template>
  <div class="fms-page-loading" v-show="loading">
    <div class="fms-page-loading-inner" v-loading="loading" :element-loading-text="loadingText">
      <slot></slot>
    </div>
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

<style>
  .fms-page-loading {
    position: fixed;
    top: 50px;
    left: 160px;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }
  .fms-page-loading-inner {
    width: 100%;
    height: 100%;
  }
  .fms-page-loading-inner .el-loading-spinner {
    top: 47%;
  }
</style>
