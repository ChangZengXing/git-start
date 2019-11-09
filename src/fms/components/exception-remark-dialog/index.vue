<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-row>
      <kye-button type="text" :auth="addAPICode" @click="add" icon="iconfont icon-plus">新增</kye-button>
    </fms-row>
    <fms-table :cols="tableCols" :rows="tableRows">
      <template slot-scope="{row}" slot="tableBtns">
        <kye-button type="text" :auth="modAPICode" @click="modify(row)">修改</kye-button>
        <kye-button type="text" :auth="delAPICode" @click="remove(row)">删除</kye-button>
      </template>
    </fms-table>
    <!-- 弹框组件 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed"/>
  </fms-dialog>
</template>
<script>
  import { to } from '@/fms/utils'
  import comMixins from '@/fms/mixins/common'
  import tableCols from './model/table-cols'
  import AddModifyDialog from './add-modify-dialog'
  import APIPerson from '@/fms/api/personally-receivable'
  import APIMonthly from '@/fms/api/monthly-receivable'
  const APICODE = {
    monthly: [
      APIMonthly['remarkBillExceptionInfo-listMonthlyRemark'],
      APIMonthly['remarkBillExceptionInfo-saveMonthlyRemark'],
      APIMonthly['remarkBillExceptionInfo-updateMonthlyRemark'],
      APIMonthly['remarkBillExceptionInfo-disabledMonthlyRemark']
    ],
    personally: [
      APIPerson['remarkBillExceptionInfo-listPersonRemark'],
      APIPerson['remarkBillExceptionInfo-savePersonRemark'],
      APIPerson['remarkBillExceptionInfo-updatePersonRemark'],
      APIPerson['remarkBillExceptionInfo-disabledPersonRemark']
    ]
  }
  export default {
    mixins: comMixins,
    components: { AddModifyDialog },
    data() {
      return {
        APIPerson,
        APIMonthly,
        loading: false,
        fmsDialogOptions: {
          title: '异常备注'
        },
        addAPICode: undefined,
        delAPICode: undefined,
        modAPICode: undefined,
        tableRows: [],
        tableCols: [],
        selectedRow: {},
        dialogParams: {}
      }
    },
    methods: {
      async open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const { type, pageType } = dialogParams
        this.dialogParams = dialogParams
        this.tableCols = tableCols(this, type, pageType)
        this.lisAPICode = APICODE[pageType][0]
        this.addAPICode = APICODE[pageType][1]
        this.modAPICode = APICODE[pageType][2]
        this.delAPICode = APICODE[pageType][3]
        this.loadTableRows()
        this.dialogOpen()
      },
      add() {
        this.$$dialogOpen('AddModifyDialog', {
          title: '新增异常备注',
          action: 'add',
          model: {
            billId: this.dialogParams.model.id // 散客id
          },
          addAPICode: this.addAPICode,
          pageType: this.dialogParams.pageType,
          onSubmit: res => this.updateRemark(res)
        })
      },
      modify(row) {
        this.$$dialogOpen('AddModifyDialog', {
          title: '修改异常备注',
          action: 'modify',
          model: { ...row },
          modAPICode: this.modAPICode,
          pageType: this.dialogParams.pageType,
          onSubmit: res => this.updateRemark(res)
        })
      },
      rowChange(row) {
        this.selectedRow = { ...row }
      },
      async remove(row) {
        const [cancel] = await to(this.$confirm('此操作将永久删除该数据, 是否继续?', '提示'))
        if (cancel) {
          return
        }
        try {
          this.loading = true
          const { id } = row
          const res = await this.$http(this.delAPICode, { id })
          this.updateRemark(res)
          this.$message.success('删除成功!')
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      async loadTableRows() {
        try {
          this.loading = true
          this.tableRows = await this.$http(this.lisAPICode, {
            billId: this.dialogParams.model.id
          })
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      // 更新备注
      updateRemark(res) {
        this.loadTableRows()
        this.dialogParams.model['billReceivables-exceptionRemark'] = res
      }
    }
  }
</script>
