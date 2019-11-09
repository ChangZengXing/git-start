<template>
  <fms-dialog-image ref="fmsDialogImage" @closed="dialogClosed"></fms-dialog-image>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import API from '@/fms/api/invoice-record'

  export default {
    mixins: comMixins,
    data() {
      return {
        dialogOptions: {
          title: '上传图片'
        },
        API
      }
    },
    methods: {
      async open(dialogParams) {
        try {
          this.dialogParams = dialogParams

          const { dialogOptions } = this

          const { bizId, bizCode } = dialogParams

          this.bizId = bizId
          this.bizCode = bizCode

          this.$refs.fmsDialogImage.open({
            bizId,
            accept: ['image', 'pdf'],
            dialogOptions,
            opreation: true,
            onUpdate: (bizId, images, { bizCode }) => {
              this.bizId = bizId
              this.bizCode = bizCode
              this.dialogParams.onSubmit({
                args: { bizId, bizCode, images }
              })
            }
          })
          this.$refs.fmsDialogImage.dialogLoading()
        } catch (e) {
          console.error(e)
        } finally {
          this.$refs.fmsDialogImage.dialogLoading(false)
        }
      },
      dialogClose() {
        this.$refs.fmsDialogImage.dialogClose()
      },
      dialogClosed() {
        this.$emit('closed')
        const { onClose } = this.dialogParams
        onClose && onClose()
      }
    }
  }
</script>
