<template>
  <section class="fms-section" :class="type ? 'fms-section-' + type : ''">
    <fms-page-loading :loading="loading" :loadingText="loadingText"/>
    <slot></slot>
  </section>
</template>

<script>
  import FmsPageLoading from '../fms-page-loading'
  export default {
    props: {
      type: String,
      loading: Boolean,
      loadingText: String
    },
    components: {
      FmsPageLoading
    }
  }
</script>

<style lang="scss">
  .fms-section {
    position: relative;
  }
  // 详情页面
  .fms-section-detail {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
      background-color: #fff;
    }
  }
  // 修改,新增页面
  .fms-section-add,
  .fms-section-modify {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
    }

    .kye-field-text,
    .kye-field-content {
      background-color: #ebebed;
    }
  }
</style>
