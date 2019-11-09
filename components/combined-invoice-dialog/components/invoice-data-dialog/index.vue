<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <!-- <fms-form-block :block="formBlock" :model="formModel"></fms-form-block> -->
    <!-- 功能按钮 -->
    <fms-row>
      <kye-button type="text" @click="invoiceInsert" icon="iconfont icon-fms-zhihang">执行</kye-button>
    </fms-row>
    <fms-table :cols="tableCols" :rows="tableRows" @row-change="tableRowChange"/>
  </fms-dialog>
</template>

<script>
  import { flatten } from '@/fms/utils'
  import APICommon from '@/fms/api/common'
  import { isEmpty, toString } from 'lodash'
  import formBlock from './model/form-block'
  import tableCols from './model/table-cols'
  import comMixins from '@/fms/mixins/common'
  export default {
    mixins: comMixins,
    data() {
      return {
        fmsDialogOptions: {
          title: '开票资料'
        },
        formModel: {},
        formBlock: formBlock(this),
        tableRows: [],
        tableCols: tableCols,
        tableSelectedRow: {}
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        this.loadtableRows()
      },
      async loadtableRows() {
        try {
          this.loading = true
          const companyId = this.dialogParams.model.companyId
          const rows = await this.$http(APICommon['invoice-getCustomerList'], { companyId })
          this.tableRows = rows || []
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      tableRowChange(row) {
        this.tableSelectedRow = row
      },
      // 插入选择的开票资料
      invoiceInsert() {
        // fms_invoice_flag 有开票:'10' 无:'0' 部分开票:'20'
        const { invoiceFlag } = this.dialogParams.model
        if (toString(invoiceFlag) === '10') {
          return this.$message.warning('已开票,不可执行!')
        }
        if (isEmpty(this.tableSelectedRow)) {
          return this.$message.warning('请选择数据')
        }
        this.dialogParams.onSubmit(flatten(this.tableSelectedRow))
        this.fmsDialogClose()
      }
    }
  }
</script>
