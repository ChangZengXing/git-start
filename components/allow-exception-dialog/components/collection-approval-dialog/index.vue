<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <!-- 查询表单 -->
    <fms-form-block :block="formBlock" :model="formModel">
      <fms-form-items
        slot="pickupTime-shippingDate"
        slot-scope="{ props }"
        :items="props.col.items"
        @change="formItemChange"
        v-model="formModel['pickupTime-shippingDate']"
      ></fms-form-items>
      <fms-form-button @search="onSearch" slot-scope="{ }" slot="searchBtn"/>
    </fms-form-block>
    <fms-row>
      <kye-button type="text" @click="implement">执行</kye-button>
      <FmsDataRows :data="dataRows" inline/>
    </fms-row>
    <!-- 数据表格 -->
    <fms-table
      :cols="tableCols"
      :rows="tableRows"
      :types="{ selection: true }"
      @row-selection="rowSelectionChange"
    >
      <template slot="deductMoneyAmount" slot-scope="{row}">
        <kye-number
          v-model="row.deductMoneyAmount"
          symbol="￥"
          :precision="2"
          :min="0"
          :max="row._max"
        ></kye-number>
      </template>
    </fms-table>
    <!-- 翻页 -->
    <fms-pagination slot="footer" :page="page" @change="pageChange"/>
    <!-- 弹窗组件 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed"/>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import tableCols from './model/table-cols'
  import formBlock from './model/form-block'
  import {
    createModelByBlock,
    createGenericArgs,
    inMonthRange,
    toNumber,
    getMonthRange
  } from '@/fms/utils'
  import API from '@/fms/api/personally-receivable'
  import genericSearch from './model/generic-search.json'
  import { trim, get } from 'lodash'
  export default {
    mixins: comMixins,
    data() {
      const _tableCols = tableCols(this)
      const _formBlock = formBlock(this)
      const _formModel = createModelByBlock(_formBlock)
      return {
        tableRows: [],
        tableCols: _tableCols,
        formBlock: _formBlock,
        formModel: _formModel,
        selectRows: [],
        fmsDialogOptions: {
          title: '代收货款',
          width: '800px',
          submitCall: this.dialogSubmit,
          cancelCall: this.fmsDialogClose
        },
        dataRows: {
          model: { collectAmountSum: '0' },
          items: [{ label: '合计', key: 'collectAmountSum', filter: 'money' }]
        }
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
      },
      async loadTableRows() {
        // 运单号为空的时候 按照寄件时间或签收时间查询
        if (this.formModel['pickupTime-shippingDate'] && !trim(this.formModel.waybillNumber)) {
          const { key, value } = this.formModel['pickupTime-shippingDate']
          if (key === 'pickupTime') {
            this.formModel.pickupTime = value
            this.formModel.shippingDate = ''
          } else if (key === 'shippingDate') {
            this.formModel.shippingDate = value
            this.formModel.pickupTime = ''
          }
        } else {
          // 运单号不为空的时候 按照运单号查询
          this.formModel.shippingDate = ''
          this.formModel.pickupTime = ''
        }
        Object.assign(this.formModel, this.ArgsComputed)
        console.log('this.formModel', this.formModel)
        if (
          !inMonthRange(this.formModel, [['pickupTime', '寄件时间'], ['shippingDate', '签收时间']], 1)
        ) {
          return
        }
        try {
          this.loading = true
          const { pageType } = this.dialogParams
          let { paymentCustomerName, payCustomerName } = this.dialogParams.model
          paymentCustomerName = pageType === 'otherIncome' ? payCustomerName : paymentCustomerName

          const genericArgsComputed = createGenericArgs(
            genericSearch,
            {
              ...this.formModel,
              status: '2',
              'deliveryRefundInfo.status': '10',
              paymentCustomerName
            },
            { page: this.page.currentPage }
          )
          genericArgsComputed.generic.vos.unshift({
            columnName: 'dri.status',
            conditionOperation: 'and',
            frontBrackets: '(',
            operation: 'equal',
            postBrackets: ')',
            propertyName: 'deliveryRefundInfo.status',
            type: 'enum',
            values: ['10']
          })
          const { rows = [], rowTotal } = await this.$http(
            API.auth['deliveryGoodsAmountInfo-search'],
            genericArgsComputed
          )
          this.tableRows = rows.map(item => {
            // 默认等于代收货款金额-抵扣金额，可编辑，不可大于原代收货款金额-抵扣金额
            item.deductMoneyAmount =
              toNumber(item.collectAmount) - toNumber(get(item, 'deliveryRefundInfo.amount')) - toNumber(get(item, 'deliveryRefundInfo.deductAmount'))
            item._max = toNumber(item.collectAmount) - toNumber(get(item, 'deliveryRefundInfo.amount')) - toNumber(get(item, 'deliveryRefundInfo.deductAmount'))
            return item
          })
          this.page.total = rowTotal
          this.dataRows.model = await this.$http(
            API.auth['deliveryGoodsAmountInfo-searchSum'],
            genericArgsComputed
          )
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      onSearch() {
        this.loadTableRows()
        this.page.currentPage = 1
      },
      rowSelectionChange(rows) {
        this.selectRows = rows || []
      },
      dialogSubmit() {},
      implement() {
        if (this.selectRows.length === 0) {
          return this.$message.warning('请至少选择一条数据')
        }
        if (this.selectRows.some(item => item.deductMoneyAmount <= 0)) {
          return this.$message.warning('代收货款必须大于0')
        }
        const tableRows = this.selectRows.map(item => {
          return {
            deductMoneyAmount: item.deductMoneyAmount,
            // 责任人 - 为空
            deductMoneyFullName: '',
            // 事由 - 默认为代收货款抵扣运费
            deductMoneyReason: '代收货款抵扣运费',
            // 关联单据 - 运单号
            deductMoneyNumber: item.waybillNumber,
            // 备注 - 为空
            content: '',
            // 异常类型 为代收货款
            flexVarchar1: '40'
          }
        })
        this.dialogParams.onSubmit({ tableRows, dialog: { close: this.fmsDialogClose } })
      },
      pageChange(type, val) {
        this.page[type] = val
        this.loadTableRows()
      },
      formItemChange(res) {
        console.log('res', res)
        const { key, value } = res
        if (key === 'pickupTime' && !value) {
          this.formModel['pickupTime-shippingDate'] = {
            key: 'pickupTime',
            value: getMonthRange(1)
          }
        }
        if (key === 'shippingDate' && !value) {
          this.formModel['pickupTime-shippingDate'] = {
            key: 'shippingDate',
            value: getMonthRange(1)
          }
        }
      }
    }
  }
</script>
