<template>
  <fms-row class="fms-block-title kye-block-title" justify="space-between">
    <div :class="['kye-block-title__text', titleClass]">
      <slot>{{title}}</slot>
    </div>
    <div class="kye-block-title__button">
      <slot name="right"></slot>
    </div>
  </fms-row>
</template>

<script>
  import FmsRow from '../fms-row'
  export default {
    props: {
      title: String,
      titleClass: String
    },
    components: { FmsRow }
  }
</script>

<style lang="scss">
  .kye-block-title.fms-row.fms-row {
    margin-bottom: 12px;
  }
  .fms-block-title.kye-block-title {
    margin-bottom: 12px;
    &::before {
      content: '';
      position: absolute;
      top: 7px;
      left: 0;
      width: 3px;
      height: 14px;
      background: #7653d6;
      display: block !important;
    }
  }
  .fms-block-title .kye-block-title__button {
    .el-button {
      max-height: 28px;
    }
  }
</style>
