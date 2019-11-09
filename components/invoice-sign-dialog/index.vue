<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-form-block :block="formBlock" :model="formModel" ref="form"/>
  </fms-dialog>
</template>

<script>
  import { trim } from 'lodash'
  import APICommon from '@/fms/api/common'
  import comMixins from '@/fms/mixins/common'
  import formBlock from './model/form-block'
  import { to, createModelByBlock } from '@/fms/utils'
  export default {
    mixins: comMixins,
    data() {
      const _formBlock = formBlock(this)
      const _formModel = createModelByBlock(_formBlock)
      return {
        tableRows: [],
        formBlock: _formBlock,
        formModel: _formModel,
        fmsDialogOptions: {
          width: 2,
          title: '发票签收更新',
          submitText: '执行',
          submitCall: this.dialogSubmit,
          cancelCall: this.fmsDialogClose
        },
        type: ''
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        this.type = dialogParams.type
        this.formBlock.rows = dialogParams.type === 'monthly-receivable' ? this.formBlock.rows.slice(1) : this.formBlock.rows
      },
      async dialogSubmit() {
        const [invalid] = await to(this.$refs.form.validate())
        if (invalid) {
          return console.warn(invalid)
        }

        const {
          // 发票号码
          invoiceNumber,
          // 发票签收人
          inSinger,
          // 发票签收时间
          inSingedDate,
          // 快递单号
          inWaybillNumber
        } = this.formModel
        // 在散客应收的情况限制
        if (this.type !== 'monthly-receivable' && trim(invoiceNumber).length < 8) {
          return this.$message.warning('发票号码至少为8位')
        }

        if (trim(inSinger) || trim(inSingedDate)) {
          if (trim(inSinger) === '') {
            return this.$message.warning('请输入发票签收人')
          }
          if (trim(inSingedDate) === '') {
            return this.$message.warning('请输入发票签收日期')
          }
        }
        try {
          this.loading = true
          await this.$http(APICommon['invoiceAddress-updateInvoiceSign'], {
            billBaseId: this.type === 'monthly-receivable' ? this.dialogParams.id : '',
            invoiceNumber,
            vo: { inSinger, inSingedDate, inWaybillNumber }
          })
          // 需要更新列表页
          this.type === 'monthly-receivable' ? this.dialogParams.onSubmit && this.dialogParams.onSubmit(1) : this.$refreshMainQueryTable()
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
