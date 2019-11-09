<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-form-block ref="form" :block="formBlock" :model="formModel"></fms-form-block>
  </fms-dialog>
</template>

<script>
  import formBlock from './model/form-block'
  import APICommon from '@/fms/api/common'
  import comMixins from '@/fms/mixins/common'
  export default {
    mixins: comMixins,
    data() {
      return {
        formBlock: formBlock(),
        formModel: { replyDate: '', replyRemark: '' },
        fmsDialogOptions: {
          width: 1,
          title: '回复备注-修改',
          submitCall: this.formSubmit,
          cancelCall: this.fmsDialogClose
        }
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const { model } = dialogParams
        this.formModel = model
        console.log('model', model)
      },
      async formSubmit() {
        try {
          await this.$refs.form.validate()
          this.loading = true
          await this.$http(APICommon['billBase-updateReplyRemark'], this.formModel)
          this.$message.success('操作成功!')
          const { onSubmit } = this.dialogParams
          onSubmit && onSubmit({ model: this.formModel })
          this.fmsDialogClose()
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      }
    }
  }
</script>
