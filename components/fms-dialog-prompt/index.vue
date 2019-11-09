<template>
  <fms-dialog
    class="fms-dialog-prompt"
    :loading="loading"
    :loadingText="loadingText"
    v-bind="fmsDialogOptions"
    v-on="$listeners"
  >
    <fms-form-block :block="formBlock" :model="formModel" ref="form"/>
  </fms-dialog>
</template>

<script>
  import formBlock from './model/form-block'
  import FmsDialog from '@/fms/components/fms-dialog'
  import FmsFormBlock from '@/fms/components/fms-form-block'
  import fmsDialogMixins from '@/fms/mixins/fms-dialog'
  export default {
    mixins: [fmsDialogMixins],
    components: { FmsDialog, FmsFormBlock },
    data() {
      return {
        fmsDialogOptions: {
          width: '360px',
          submitText: '保存',
          submitCall: this.dialogSubmit,
          cancelCall: this.fmsDialogClose
        },
        formBlock: formBlock(),
        formModel: { content: '' }
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const {
          top,
          width,
          model,
          block,
          position,
          submitText,
          componentType,
          componentOptions
        } = dialogParams
        submitText && (this.fmsDialogOptions.submitText = submitText)
        this.formModel = { ...this.formModel, ...model }
        this.formBlock = block || formBlock(componentType, componentOptions)

        // 使用默认top设置
        if (position === 'center') {
          this.fmsDialogOptions.top = '35vh'
        }
        if (top) {
          this.fmsDialogOptions.top = top
        }
        if (width) {
          this.fmsDialogOptions.width = width
        }

        // TODO: 由于组件会自动挂载 这里返回promise,会有点麻烦
        // return new Promise((resolve, reject) => {  })
      },
      dialogLoading(loading = true) {
        this.loading = !!loading
        if (typeof loading !== 'string') {
          this.loadingText = ''
        } else {
          this.loadingText = loading
        }
      },
      dialogSubmit() {
        // 验证
        this.$refs.form
          .validate()
          .then(() => {
            if (this.dialogParams.onSubmit) {
              this.dialogParams.onSubmit({
                form: this.$refs.form,
                model: this.formModel,
                dialog: {
                  close: this.fmsDialogClose.bind(this),
                  loading: this.dialogLoading.bind(this)
                }
              })
            }
          })
          .catch(e => console.warn(e))
      }
    }
  }
</script>

<style lang="scss">
  // .fms-dialog-prompt {
  //   .el-dialog__body {
  //     padding-bottom: 0;
  //   }
  // }
</style>
