<template>
  <kye-row type="flex" justify="end" style="margin: 0" v-if="cancelCall || submitCall">
    <!-- 兼容按钮处显示 统计栏 -->
    <fms-form-block
      v-if="showStatistics.show"
      class="fms-expense-invoice-dialog-footer"
      :block="showStatistics.formBlock"
      :model="showStatistics.formModel"
    ></fms-form-block>
    <kye-button
      type="primary"
      v-if="submitCall"
      :auth="auth"
      hotkey="ctrl+s"
      :disabled="submitDisabled"
      @click="submitCall"
    >{{submitText}}</kye-button>
    <kye-button v-if="cancelCall" @click="cancelCall" :disabled="cancelDisabled">{{cancelText}}</kye-button>
  </kye-row>
</template>

<script>
  import FmsFormBlock from '@/fms/components/fms-form-block'
  export default {
    components: { FmsFormBlock },
    props: {
      auth: String,
      cancelText: {
        type: String,
        default: '取消'
      },
      submitText: {
        type: String,
        default: '保存(S)'
      },
      submitCall: Function,
      cancelCall: Function,
      submitDisabled: Boolean,
      cancelDisabled: Boolean,
      showStatistics: {
        type: Object,
        default: () => {
          return {
            show: false,
            formBlock: {},
            formModel: {},
          }
        }
      }
    }
  }
</script>

<style lang="scss">
  .fms-expense-invoice-dialog-footer {
    flex: 1;
    .el-form-item {
      margin-bottom: 0px !important;
      .kye-field-content {
        text-align: left;
      }
    }
  }
</style>
