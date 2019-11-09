<template>
  <fms-dialog class="fms-dialog-alert" v-bind="fmsDialogOptions" v-on="$listeners">
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
  import RenderCom from '../fms-dialog-confirm/render-com'
  const FmsDialogAlert = Vue.extend({
    mixins: [fmsDialogMixins],
    components: { FmsDialog, RenderCom },
    data() {
      return {
        fmsDialogOptions: {
          title: '提示',
          width: 1,
          submitText: '确定',
          submitCall: this.fmsDialogClose
        },
        dialogParams: {}
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen()
        this.dialogParams = dialogParams
        const { title, width, submitText } = dialogParams
        title && (this.fmsDialogOptions.title = title)
        width && (this.fmsDialogOptions.width = width)
        submitText && (this.fmsDialogOptions.submitText = submitText)
      }
    }
  })

  // FmsDialogAlert.mixin(fmsDialogMixins)

  FmsDialogAlert.__mixins = {
    props: { args: Object },
    components: { FmsDialogAlert },
    methods: {
      open(dialogParams) {
        return this.$children[0].open(dialogParams)
      }
    },
    mounted() {
      this.args && this.open(this.args)
    }
  }
  export default FmsDialogAlert
</script>
