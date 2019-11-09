<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-form-block :block="formBlock" :model="formModel" ref="form">
      <fms-form-items
        slot="shippingDate-inMonth"
        slot-scope="{ props }"
        :items="props.col.items"
        v-model="formModel['shippingDate-inMonth']"
      />
      <template slot-scope slot="formButton">
        <fms-form-button @search="onSearch"/>
      </template>
    </fms-form-block>
    <!-- 功能按钮 -->
    <fms-row>
      <kye-button type="text" @click="invoiceNumInsert" icon="iconfont icon-fms-zhihang">执行</kye-button>
      <kye-button type="text" @click="invoiceNumInsertAll" icon="iconfont icon-fms-zhihang">执行全部</kye-button>
      <fms-data-rows :data="dataRows" inline/>
    </fms-row>
    <fms-table
      :cols="tableCols"
      :rows="tableRows"
      :types="{ selection: true }"
      :selectable="selectable"
      @row-selection="tableRowSelection"
    />
    <fms-pagination slot="footer" :page="page" @change="pageChange"/>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import formBlock from './model/form-block'
  import tableCols from './model/table-cols'
  import queryJson from './model/generic_search'
  import { toNumber, initGenericAsync, initGenericArgs } from '@/fms/utils'
  import { trim, sumBy, round, toString, cloneDeep } from 'lodash'
  import APICommon from '@/fms/api/common'
  export default {
    mixins: comMixins,
    data () {
      const _formModel = {
        // 运单号
        'billPerson-waybillNumber': '',
        // 寄件时间/纳入月份
        'shippingDate-inMonth': {},
        // 公司名称
        paymentCustomerName: '',
        // 合计开票金额
        invoiceUnAmountTotal: '0'
      }
      return {
        loading: false,
        fmsDialogOptions: {
          title: '选择单号',
          width: 6
        },
        formBlock: formBlock(this),
        formModel: _formModel,
        tableCols: tableCols,
        tableRows: [],
        tableSelectedRows: [],
        dataRows: {
          model: _formModel,
          items: [{ label: '合计开票金额', key: 'invoiceUnAmountTotal', filter: 'money' }]
        },
        generic: {},
        genericArgs: {}
      }
    },
    methods: {
      async open (dialogParams) {
        this.fmsDialogOpen(dialogParams)
        // 开票类型 '0' 月结 '1' 散客
        const { invoiceType } = dialogParams.model

        const queryCode = `${
          invoiceType === '0' ? 'month' : 'person'
          }-merge-invoice-open-custom-search`

        this.generic = await initGenericAsync({ queryCode })

        console.log('this.generic', this.generic)
      },
      async loadTableRows (cache = true) {
        try {
          this.loading = true
          this.genericArgs.pageSize = 200
          const { rows = [], rowTotal = 0 } = await this.$http(
            APICommon['billBase-searchPerson'],
            this.genericArgs
          )
          this.tableRows = rows

          // TODO: 后端通过 not_equal 过滤
          // // 散客运单号
          // const { waybillNumber } = this.dialogParams.model
          // // 过滤掉主页面的散客运单号
          // if (waybillNumber) {
          //   this.tableRows = this.tableRows.filter(
          //     row => get(row, 'billPerson.waybillNumber') !== waybillNumber
          //   )
          // }

          this.tableRows = this.tableRows.map(row => {
            // 已开票金额
            row.invoiceAmount = toNumber(row.invoiceAmount, 0)
            // 未开票金额 = 总金额 - 已开票金额
            // TODO 前端计算(后端没有该字段,应该由后端返回)
            row.unIvoiceAmountComputed = round(toNumber(row.allAmount, 0) - row.invoiceAmount, 2)
            // 开票金额(待开票金额 默认等于未开票金额)
            row.invoiceUnAmount = row.unIvoiceAmountComputed
            // 设置前端是否可以选中
            // TODO: 禁止掉已经选过的单号
            row._selectable = true
            return row
          })
          this.$$setPageTotal(rowTotal)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      // 更新合计开票金额
      updateInvoiceUnAmountTotal () {
        this.formModel['invoiceUnAmountTotal'] = round(
          sumBy(this.tableSelectedRows, 'invoiceUnAmount'),
          2
        )
      },
      onSearch () {
        const formModel = this.$refs.form.getFormModel()
        if (formModel.groupName === 'a') {
          if (trim(this.formModel['billPerson-waybillNumber']) === '') {
            return this.$message.warning('请输入运单号')
          }
        }
        this.genericArgs = initGenericArgs(this.generic, formModel, {
          queryBack: queryJson
        })

        // 去掉已经选择的单号--
        const { waybillNumbers } = this.dialogParams.model
        if (waybillNumbers && waybillNumbers.length > 0) {
          const it = this.genericArgs.generic.vos.find(
            vo => vo.propertyName === 'billPerson.waybillNumber'
          )
          if (!it) {
            const len = this.genericArgs.generic.vos.length
            if (len > 0) {
              const it = this.genericArgs.generic.vos[len - 1]
              it.conditionOperation = 'and'
            }

        //     // const vos = waybillNumbers.map((n, i) => {
        //     //   return {
        //     //     propertyName: 'billPerson.waybillNumber',
        //     //     columnName: 'bperson.waybill_number',
        //     //     conditionOperation: i === waybillNumbers.length - 1 ? '' : 'and',
        //     //     frontBrackets: '(',
        //     //     operation: 'not_equal',
        //     //     postBrackets: ')',
        //     //     type: 'string',
        //     //     values: [n]
        //     //   }
        //     // })
        //     // Array.prototype.push.apply(this.genericArgs.generic.vos, vos)

        //     // 使用枚举排除运单号
            this.genericArgs.generic.vos.push({
              propertyName: 'billPerson.waybillNumber',
              columnName: 'bperson.waybill_number',
              conditionOperation: '',
              frontBrackets: '(',
              operation: 'not_contain',
              postBrackets: ')',
              type: 'enum',
              values: [...waybillNumbers]
            })
          } else {
            // 该运单号已被选中开票 不查询
            if (waybillNumbers.includes(it.values[0])) {
              // it.operation = 'not_equal'
              this.tableRows = []
              this.$$setPage(1)
              this.$$setPageTotal(0)
              return
            }
          }
        }
        this.$$setPage(1)
        this.loadTableRows()
      },
      pageChange (type, val, cache) {
        this.$$pageChange(type, val, this.genericArgs)
        this.loadTableRows()
      },
      tableRowSelection (rows) {
        this.tableSelectedRows = [...rows]
        this.updateInvoiceUnAmountTotal()
      },
      // 是否可以选择行
      selectable (row, index) {
        return row._selectable
      },
      // 插入选择单号
      invoiceNumInsert () {
        try {
        // fms_invoice_flag 有开票:'10' 无:'0' 部分开票:'20'
        const { invoiceFlag } = this.dialogParams.model
        if (toString(invoiceFlag) === '10') {
          return this.$message.warning('已开票,不可执行!')
        }
        if (this.tableSelectedRows.length === 0) {
          return this.$message.warning('请选择数据!')
        }
        this.dialogParams.onSubmit([...this.tableSelectedRows], this.page)
        // 注意dialogClose要放在最后执行,因为他会重置数据
        this.fmsDialogClose()
        } catch (e) {
         this.$message.warning('添加失败!')
       } finally {
       }
      },
      // 插入全部单号
     async invoiceNumInsertAll () {
       try {
        // this.genericArgs.pageSize = this.page.total
        const page = cloneDeep(this.page)
        const genericArgs = cloneDeep(this.genericArgs)
        page.pageTotal = Math.ceil(page.total / page.pageSize)
        console.log('page', page)
        // const pageTotal = page.pageTotal
        this.loading = true
        // let rowsAll = []
        // for (let i = 1; i <= pageTotal; i++) {
        //   genericArgs.page = i
        //   const { rows = [] } = await this.$http(
        //     APICommon['billBase-searchPerson'],
        //     genericArgs
        //   )
        //   rowsAll = [...rowsAll, ...rows]
        // }
        genericArgs.pageSize = page.total
            const { rows = [] } = await this.$http(
            APICommon['billBase-searchPerson'],
            genericArgs
          )
        this.dialogParams.onSubmit(rows, page)
        this.loading = false
        // 注意dialogClose要放在最后执行,因为他会重置数据
        this.fmsDialogClose()
       } catch (e) {
         this.$message.warning('添加失败!')
         this.loading = false
       } finally {
         this.loading = false
       }
      }
    }
  }
</script>
