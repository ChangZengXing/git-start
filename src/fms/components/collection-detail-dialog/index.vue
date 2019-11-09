<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <!-- 数据表格 -->
    <fms-table :cols="tableCols" :rows="tableRows" @row-dbclick="dbClick"/>
  </fms-dialog>
</template>

<script>
  import { toString } from 'lodash'
  import tableCols from './model/table-cols'
  import comMixins from '@/fms/mixins/common'
  import APIMonth from '@/fms/api/monthly-receivable'
  import APIPerson from '@/fms/api/personally-receivable'
  import APICushion from '@/fms/api/cushion-pay'
  import APIReceiveBill from '@/fms/api/receive-bill'
  import { routes as routesCushion } from '@/fms/router/receiving/cushion-pay'
  import { routes as routesReceiveBill } from '@/fms/router/receiving/receive-bill'
  import { createGenericArgs } from '@/fms/utils'
  export default {
    mixins: comMixins,
    data() {
      const _tableCols = tableCols(this)
      return {
        tableRows: [],
        tableCols: _tableCols,
        fmsDialogOptions: {
          title: '收款明细',
          width: 4
        }
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        this.loadTableRows()
      },
      async loadTableRows() {
        const { type } = this.dialogParams
        const methods = {
          month: APIMonth['monthlyBill-searchReceiptDetail'],
          person: APIPerson['personBill-searchReceiptDetail']
        }
        const sourceId =
          type === 'month'
            ? this.dialogParams.model['billMonthly-billNumber'] // 月结应收编码
            : this.dialogParams.model['billPerson-waybillNumber'] // 散客应收-运单号
            try {
              this.loading = true
              const rows = await this.$http(methods[type], { sourceId })
              this.tableRows = rows || []
            } catch (e) {
              console.error(e)
            } finally {
              this.loading = false
            }
      },
      // 双击跳转
      async dbClick(row) {
        let res = []
        let routes = null
        // 来源id, 数据来源 (fms_receive_data_source: 1: 资金流水 2:移动收款 3:手动新增 4: 收款单 5:垫付款管理 6:客户预存)
        // ? 目前确认只有 收款单 和 垫付款
        const source = toString(row.source)
        // 来源单号
        const { receviceCode } = row
        // 除收款单 和 垫付款以外的 不用跳转
        if (!['4', '5'].includes(source)) {
          return
        }
        try {
          this.loading = true
          if (!source) {
            return this.$message.warning('来源类型不存在,无法跳转!')
          }
          if (source === '4') {
            // 收款单
            routes = routesReceiveBill
            res = await this.$http(
              APIReceiveBill['receviceBillInfo-search'],
              createGenericArgs(
                {
                  propertyName: 'receviceCode',
                  columnName: 'recevice_code',
                  operation: 'equal'
                },
                { receviceCode }
              )
            )
          } else if (source === '5') {
            // 垫付款
            routes = routesCushion
            res = await this.$http(
              APICushion['cushionPay-search'],
              createGenericArgs(
                {
                  columnName: 'ra.cushion_pay_number',
                  propertyName: 'cushionPayNumber',
                  peration: 'equal'
                },
                { cushionPayNumber: receviceCode }
              )
            )
          }

          if (res.rows.length === 0) {
            this.$message.warning(`单据单号${receviceCode}数据查询为空`)
          }

          // 获取跳转id
          const id = res.rows[0].id
          this.$router.push(routes.detail.to(id))
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
