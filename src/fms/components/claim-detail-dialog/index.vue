<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <!-- 数据表格 -->
    <fms-table :cols="tableCols" :rows="tableRows" :types="{ selection: false }">
      <kye-button
        slot="invoiceNo"
        auth="fms.receviceBillInfo.get"
        @click="invoiceNoClick(row)"
        type="text"
        slot-scope="{ row }"
      >{{row.invoiceNo}}</kye-button>
    </fms-table>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import tableCols from './model/table-cols'
  // import { cacheHttp } from '@/fms/utils'
  export default {
    mixins: comMixins,
    computed: {
      paramsCompute() {
        return {
          sourceId: this.$route.params.id
        }
      }
    },
    created() {
      this.loadTableRows()
    },
    data() {
      const _tableCols = tableCols(this)
      return {
        tableRows: [],
        tableCols: _tableCols,
        tableSelectedRow: {},
        tableSelectedRows: [],
        fmsDialogOptions: {
          title: '认领明细'
        },
        dataRows: {}
      }
    },
    methods: {
      async invoiceNoClick(row) {
        console.log('row', row)
        let invoiceNo = row.invoiceNo
        let params = {
          elasticsearchFlag: 'N',
          page: 1,
          pageSize: 20,
          menuId: this.$$menu.id,
          genericSearchCode: 'receive_bill_index_search',
          generic: {
            vos: [
              {
                propertyName: 'receviceCode',
                columnName: 'recevice_code',
                frontBrackets: '(',
                postBrackets: ')',
                conditionOperation: '',
                operation: 'equal',
                type: 'string',
                values: [invoiceNo]
              }
            ]
          }
        }
        let data = await this.$http('fms.receviceBillInfo.search', params)
        this.$router.push(`/fms/receive-bill/detail/${data.rows[0].id}`)
        this.fmsDialogOptions.visible = false
      },
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
      },
      async loadTableRows(cache = true) {
        /**
         * @description 不同模块调用不同api
         */
        let method = ''
        if (this.$route.meta.tagTitle === '资金流水管理') {
          method = 'fms.cableTransfer.claimDetail'
        } else if (this.$route.meta.tagTitle === '移动收款') {
          method = 'fms.mobileTransfer.claimDetail'
        }
        try {
          this.loading = true
          const rows = await this.$http(method, this.paramsCompute)
          this.tableRows = rows
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      pageChange(type, val) {
        this.page[type] = val
        this.loadTableRows()
      },
      onSearch() {
        this.loadTableRows()
        this.page.currentPage = 1
      }
    }
  }
</script>
