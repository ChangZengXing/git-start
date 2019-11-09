<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <kye-row>
      <kye-button type="text" @click="addRow" v-show="isButtonShow" icon="iconfont icon-plus">新增</kye-button>
      <kye-button
        type="text"
        @click="collectionApproval"
        v-show="isButtonShow"
        icon="iconfont icon-daishoupixuan"
      >代收批选</kye-button>
    </kye-row>
    <!-- 数据表格 -->
    <fms-table :cols="tableCols" :rows="tableRows" :types="{ selection: false }">
      <template slot="operation" slot-scope="{row, index}">
        <kye-button
          type="text"
          :disabled="row.flexVarchar1 === '30'"
          @click="modifyRow(row,index)"
        >修改</kye-button>
        <kye-button
          type="text"
          :disabled="row.flexVarchar1 === '30'"
          @click="deleteRow(row,index)"
        >删除</kye-button>
      </template>
    </fms-table>
    <!-- 弹窗组件 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed"/>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import tableCols from './model/table-cols'
  // 允许异常 新增 修改 弹框
  import AddModiyAllowDialog from './components/add-modiy-allow-dialog'
  // 代收货款 弹框
  import CollectionApprovalDialog from './components/collection-approval-dialog'
  import { toString, trim } from 'lodash'
  import personallyAPI from '@/fms/api/personally-receivable'
  import monthlyAPI from '@/fms/api/monthly-receivable'
  import otherIncomeAPI from '@/fms/api/other-income'

  export default {
    mixins: comMixins,
    data() {
      const _tableCols = tableCols(this)
      return {
        tableRows: [],
        oldTableRows: [],
        tableCols: _tableCols,
        currentRow: {},
        tableSelectedRows: [],
        fmsDialogOptions: {
          title: '允许异常'
          // submitCall: this.dialogSubmit,
          // cancelCall: this.fmsDialogClose
        },
        dialogParams: {}
      }
    },
    components: {
      AddModiyAllowDialog,
      CollectionApprovalDialog
    },
    computed: {
      isButtonShow() {
        return this.dialogParams.type && this.dialogParams.type === 'modify'
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        this.dialogParams = dialogParams
        this.loadTableRows()
        this.tableCols = tableCols(this)
        const { type } = dialogParams
        if (type === 'detail') {
          this.fmsDialogOptions.submitCall = null
          this.fmsDialogOptions.cancelCall = null
        }
      },
      async loadTableRows() {
        const { model, pageType } = this.dialogParams
        const url = {
          personally: personallyAPI.auth['remarkBillExceptionInfo-listPersonRemark'],
          monthly: monthlyAPI.auth['remarkBillExceptionInfo-listMonthlyRemark'],
          otherIncome: otherIncomeAPI.auth['remarkBillExceptionInfo-listOtherIncomeRemark']
        }
        const params = {
          billId: model.id
        }
        if (pageType === 'otherIncome') {
          params.type = '20'
        }
        this.tableRows = await this.$http(url[pageType], params)
        // 更新主表 里面的 允许异常 异常备注
        this.dialogSubmit()
      },
      onSearch() {
        this.loadTableRows()
        this.page.currentPage = 1
      },
      // 修改
      modifyRow(row, index) {
        this.$$dialogOpen('AddModiyAllowDialog', {
          title: '修改异常',
          action: 'modify',
          row,
          pageType: this.dialogParams.pageType,
          model: this.dialogParams.model,
          billId: this.dialogParams.model.id,
          onSubmit: async ({ formModel, dialog, cancel = false }) => {
            // 由除了修改这条数据 以外的 的关联编码 数组
            const deductMoneyNumberList = []

            // 除了修改这条数据 以外的 数据 构成 数组
            let externalList = [...this.tableRows]
            externalList.splice(index, 1)
            externalList.forEach(item => {
              trim(item.deductMoneyNumber) && deductMoneyNumberList.push(item.deductMoneyNumber)
            })
            const _formModel = { ...formModel }
            // 只有在 异常类型为 代收货款 40 的时候 限制重复编码
            if (
              trim(_formModel.flexVarchar1) === '40' &&
              _formModel.deductMoneyNumber &&
              deductMoneyNumberList.includes(_formModel.deductMoneyNumber)
            ) {
              return this.$message.warning(
                `该数据的异常类型为 ${this.$filter.lookup(
                  _formModel.flexVarchar1,
                  'fms_remark_exception_type'
                )} 关联编码: ${_formModel.deductMoneyNumber} 在允许异常表格中存在`
              )
            } else {
              const { flexVarchar1 } = formModel
              // 异常类型 为 外请扣款 或 员工扣款 时,将 可抵扣金额 写入 异常金额
              if (['10', '20'].includes(toString(flexVarchar1))) {
                _formModel.deductMoneyAmount = _formModel.surplusDeductible
              }

              // this.tableRows.splice(index, 1, _formModel)
              // this.$message.success('操作成功')
              // dialog.close()
              await this.saveData([{ ..._formModel, enabledFlag: 1 }], dialog, cancel)
            }
          }
        })
      },
      // 删除
      async deleteRow(row, index) {
        await this.$confirm(`确认删除该数据!`, '提示')
        // this.tableRows.splice(index, 1)
        // enabledFlag 是否删除标识 删除：0，否则传：1
        await this.saveData([{ ...row, enabledFlag: 0 }])
      },
      // 新增
      addRow() {
        this.$$dialogOpen('AddModiyAllowDialog', {
          title: '新增异常',
          action: 'add',
          pageType: this.dialogParams.pageType,
          model: this.dialogParams.model,
          billId: this.dialogParams.model.id,
          onSubmit: async ({ formModel, dialog }) => {
            const { flexVarchar1 } = formModel
            // 异常类型 为 外请扣款 或 员工扣款 时,将 可抵扣金额 写入 异常金额
            const _formModel = { ...formModel }
            if (['10', '20'].includes(toString(flexVarchar1))) {
              _formModel.deductMoneyAmount = _formModel.surplusDeductible
            }
            // 由允许异常构成的关联编码 数组
            const deductMoneyNumberList = []
            this.tableRows.forEach(item => {
              trim(item.deductMoneyNumber) && deductMoneyNumberList.push(item.deductMoneyNumber)
            })
            // 只有在 异常类型为 代收货款 40  代理扣款-未对账10 代理扣款-已对账11 员工扣款20 的时候 限制重复编码
            if (
              ['40', '10', '11', '20'].includes(trim(_formModel.flexVarchar1)) &&
              _formModel.deductMoneyNumber &&
              deductMoneyNumberList.includes(_formModel.deductMoneyNumber)
            ) {
              return this.$message.warning(
                `该数据的异常类型为 ${this.$filter.lookup(
                  _formModel.flexVarchar1,
                  'fms_remark_exception_type'
                )} 关联编码: ${_formModel.deductMoneyNumber} 在允许异常表格中存在`
              )
            } else {
              // this.tableRows.push(_formModel)
              // this.$message.success('操作成功')
              // dialog.close()
              await this.saveData([{ ..._formModel, enabledFlag: 1 }], dialog)
            }
          }
        })
      },
      // 代收批选
      collectionApproval() {
        this.$$dialogOpen('CollectionApprovalDialog', {
          pageType: this.dialogParams.pageType,
          model: this.dialogParams.model,
          onSubmit: async ({ tableRows, dialog }) => {
            // 由允许异常构成的关联编码 数组
            const deductMoneyNumberList = this.tableRows.map(item => item.deductMoneyNumber)

            const argsList = tableRows.filter(item => {
              if (!deductMoneyNumberList.includes(trim(item.deductMoneyNumber))) {
                item.enabledFlag = 1
                return item
              }
            })
            if (argsList.length === 0) {
              return this.$message.warning('执行数据已存在异常列表中')
            }
            await this.saveData(argsList, dialog)
          }
        })
      },
      dialogSubmit() {
        const { pageType } = this.dialogParams
        this.dialogParams.onSubmit({
          exceptionInfos: this.tableRows.map(item => {
            item.type = pageType === 'personally' ? '10' : '0'
            item.billId = this.dialogParams.model.id
            return item
          })
        })
      },
      async saveData(argData, dialog, cancel) {
        try {
          this.loading = true
          const { pageType } = this.dialogParams
          const type = pageType === 'personally' ? '10' : pageType === 'otherIncome' ? '20' : '0'
          const billId = this.dialogParams.model.id
          argData.forEach(item => {
            item.type = type
            item.billId = billId
          })
          await this.$http('fms.remarkBillExceptionInfo.updatePersonRemark', argData)
          this.loadTableRows()
          !cancel && this.$message.success('操作成功')
          dialog && dialog.close()
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      }
    }
  }
</script>
