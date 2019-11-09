<template>
  <!-- 这里使用kye-input, slot不起作用 -->
  <el-input
    class="fms-search"
    v-bind="$attrs"
    v-on="$listeners"
    v-model="inputValue"
    :clearable="$attrs.clearable || true"
    :style="{ width }"
    :disabled="!hasAuth($attrs.auth)"
  >
    <kye-button
      slot="append"
      icon="iconfont icon-search"
      type="primary"
      :auth="$attrs.auth"
      @click="$emit('search', inputValue)"
    >查询</kye-button>
  </el-input>
</template>

<script>
  import { hasAuth } from '@/fms/utils'
  export default {
    inheritAttrs: false,
    props: {
      width: {
        type: String,
        default: '220px'
      }
    },
    data() {
      return {
        hasAuth,
        inputValue: ''
      }
    }
  }
</script>

<style lang="scss">
  .fms-search.fms-search {
    width: 200px;
    .el-button.is-disabled,
    .el-button.is-disabled:hover,
    .el-button.is-disabled:focus {
      color: #cccccc;
      background-color: transparent;
      border-color: transparent;
    }
    .el-input-group__append {
      border: 0;
      border-top: 1px solid #7352bf;
      border-bottom: 1px solid #7352bf;
    }
    .el-input-group__append button.el-button {
      color: #ffffff !important;
      background-color: #7352bf !important;
      border-color: #7352bf !important;
      font-weight: bold !important;
      padding-left: 10px;
    }
  }
  .fms-search.fms-search.el-input--suffix .el-input__inner {
    border-right: 0;
  }
</style>
