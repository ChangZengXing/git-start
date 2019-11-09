<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <!-- 数据表格 -->
    <fms-table :cols="tableCols" :rows="tableRows" @row-dbclick="dbClick"/>
    <!-- 翻页 -->
    <fms-pagination slot="footer" :page="page" @change="pageChange"/>
  </fms-dialog>
</template>

<script>
  import { toString } from 'lodash'
  import APIComon from '@/fms/api/common'
  import comMixins from '@/fms/mixins/common'
  import tableCols from './model/table-cols'

  export default {
    mixins: comMixins,
    data() {
      return {
        tableCols: [],
        tableRows: [],
        fmsDialogOptions: {
          title: '开票明细',
          width: 4
        }
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const { type } = dialogParams
        this.tableCols = tableCols(type)
        this.loadTableRows()
      },
      async loadTableRows() {
        try {
          this.loading = true
          // 月结账单id
          const { id: billBaseId } = this.dialogParams.model
          const { rows = [], rowTotal = 0 } = await this.$http(
            APIComon['invoice-receivableBillInvoice'],
            {
              ...this.$$getPage(),
              vo: { billBaseId }
            }
          )
          this.tableRows = rows
          this.$$setPageTotal(rowTotal)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      pageChange(type, val) {
        this.$$pageChange(type, val)
        this.loadTableRows()
      },
      onSearch() {
        this.$$setPage(1)
        this.loadTableRows()
      },
      dbClick(row) {
        // 是否是电子发票，0-否，1-是
        const { electronicInvoiceFlag, id } = row
        // 电子发票
        if (toString(electronicInvoiceFlag) === '1') {
          this.$router.push(`/fms/electron-receipt/detail/${id}`)
        } else {
          // 普通发票
          this.$router.push(`/fms/receipt-manager/detail/${id}`)
        }
        this.fmsDialogClose()
      }
    }
  }
</script>
