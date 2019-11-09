<template>
  <fms-dialog class="fms-dialog-confirm" v-bind="fmsDialogOptions" v-on="$listeners">
    <template v-if="dialogParams.render">
      <render-com :render="dialogParams.render"></render-com>
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </fms-dialog>
</template>

<script>
  import Vue from 'vue'
  import FmsDialog from '../fms-dialog'
  import fmsDialogMixins from '@/fms/mixins/fms-dialog'
  import RenderCom from './render-com'
  const FmsDialogConfirm = Vue.extend({
    mixins: [fmsDialogMixins],
    components: { FmsDialog, RenderCom },
    data () {
      return {
        fmsDialogOptions: {
          top: '40vh',
          title: '提示',
          width: '494px',
          submitText: '确定',
          submitCall: this.dialogSubmit,
          cancelCall: this.dialogCancel,
          beforeClose: this.dialogCancel
        },
        dialogParams: {}
      }
    },
    methods: {
      open (dialogParams) {
        this.fmsDialogOpen()
        this.dialogParams = dialogParams
        const { title, width } = dialogParams
        title && (this.fmsDialogOptions.title = title)
        width && (this.fmsDialogOptions.width = width)
        // TODO: 由于组件会自动挂载 这里返回promise,会有点麻烦
        // return new Promise((resolve, reject) => {  })
      },
      dialogSubmit () {
        this.fmsDialogClose()
        this.dialogParams.onSubmit && this.dialogParams.onSubmit()
      },
      dialogCancel () {
        this.fmsDialogClose()
        this.dialogParams.onCancel && this.dialogParams.onCancel()
      }
    }
  })

  // FmsDialogConfirm.mixin(fmsDialogMixins)

  FmsDialogConfirm.__mixins = {
    props: { args: Object },
    components: { FmsDialogConfirm },
    methods: {
      open (dialogParams) { return this.$children[0].open(dialogParams) }
    },
    mounted () {
      this.args && this.open(this.args)
    }
  }
  export default FmsDialogConfirm
</script>
