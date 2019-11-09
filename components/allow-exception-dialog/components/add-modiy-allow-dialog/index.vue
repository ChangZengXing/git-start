<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <!-- 表单组件 -->
    <fms-form-grid ref="form" :grid="formGrid" :model="formModel"></fms-form-grid>
    <!-- 弹窗组件 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed"/>
  </fms-dialog>
</template>

<script>
  import formGrid from './model/form-grid'
  import comMixins from '@/fms/mixins/common'
  import { createModelByGrid, to, toNumber, up } from '@/fms/utils'
  import API from '@/fms/api/personally-receivable'
  import { trim, toString, isEmpty, cloneDeep, get } from 'lodash'
  import PictureAllowDialog from '../picture-allow-dialog/index.vue'
  export default {
    mixins: comMixins,
    data() {
      return {
        formGrid: [],
        formModel: {},
        fmsDialogOptions: {
          width: 2,
          title: '',
          submitCall: this.dialogSubmit,
          cancelCall: this.fmsDialogClose
        }
      }
    },
    components: {
      PictureAllowDialog
    },
    beforeDestroy() {
      this.destroyFlexVarchar3()
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const { title, action, row } = dialogParams
        this.fmsDialogOptions.title = title
        // this.formGrid = _formGrid
        if (action === 'add') {
          const _formGrid = formGrid(this)
          this.formModel = createModelByGrid(_formGrid)
          this.formGrid = _formGrid
        } else if (action === 'modify') {
          if (['10', '20'].includes(toString(row.flexVarchar1))) {
            this.formModel.deductMoneyAmount = ''
            setTimeout(() => {
              this.getDeductMoneyNumber(true)
              // 可抵扣金额 等于 异常金额
              this.formModel.surplusDeductible = cloneDeep(row).deductMoneyAmount
            }, 200)
          } else if (['11'].includes(toString(row.flexVarchar1))) {
            this.formModel = cloneDeep(row)
            this.formGrid = formGrid(this)
            this.formModel._max = this.formModel.deductMoneyAmount
            return
          }
          this.formModel = cloneDeep(row)
          this.formGrid = formGrid(this)
        }
      },
      // 异常类型 选择触发方法
      flexVarcharChange(value) {
        up(this.formModel, {}, [
          // 异常金额
          ['deductMoneyAmount', ''],
          // 责任人
          ['deductMoneyFullName', ''],
          // 已抵扣金额
          ['deductible', ''],
          // 事由
          ['deductMoneyReason', ''],
          // 单据编码
          ['deductMoneyNumber', ''],
          // 可抵扣金额
          ['surplusDeductible', ''],
          // 备注
          ['content', '']
        ])
        this.formGrid = formGrid(this)
      },
      // 外请扣款 和 员工扣款 时 关联单据 失去焦点的方法
      async getDeductMoneyNumber(modifyConditon) {
        if (!trim(this.formModel.flexVarchar1)) {
          return this.$message.warning('异常类型为空,请输入')
        }
        if (!trim(this.formModel.deductMoneyNumber)) {
          return this.$message.warning('关联单据为空,请输入')
        }
        try {
          this.loading = true
          const args = {
            billId: this.dialogParams.billId,
            // 关联单据
            deductMoneyNumber: this.formModel.deductMoneyNumber,
            // 异常类型
            flexVarchar1: this.formModel.flexVarchar1
          }
          const res = await this.$http(API.auth['remarkBillExceptionInfo-getDeductMoneyNumber'], args)
          if (!res || isEmpty(res)) {
            this.formModel = {}
            return this.$message.warning('未查询到满足条件的数据,请检查')
          }
          if (!modifyConditon) {
            up(this.formModel, res || {}, [
              ['deductMoneyAmount', 'advanceAmount', ''],
              ['deductMoneyFullName', ''],
              ['deductible', ''],
              ['deductMoneyReason', ''],
              ['flexBigint1', ''],
              ['surplusDeductible', '']
            ])
          }
          up(this.formModel, res || {}, [
            ['deductMoneyAmount', 'advanceAmount', ''],
            ['deductMoneyFullName', ''],
            ['deductible', ''],
            ['deductMoneyReason', ''],
            ['flexBigint1', '']
            // ['surplusDeductible', '']
          ])
          this.formModel._max = res.surplusDeductible || 0
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      // 代收货款时 关联单据失去焦点的方法
      async deliveryGoodsNumber(modifyConditon) {
        if (!trim(this.formModel.flexVarchar1)) {
          return this.$message.warning('异常类型为空,请输入')
        }
        if (!trim(this.formModel.deductMoneyNumber)) {
          return this.$message.warning('关联单据为空,请输入')
        }
        try {
          this.loading = true
          const { pageType } = this.dialogParams
          let { paymentCustomerName, payCustomerName } = this.dialogParams.model
          paymentCustomerName = pageType === 'otherIncome' ? payCustomerName : paymentCustomerName
          // 代收货款的付款公司与当前付款公司一致; 收款状态为已收款; 退款状态为未退款
          /**
           * 代收货款时 通过在“关联单据”中输入运单号回车调用代收货款查询接口，
           * 查询代收货款的付款公司与当前付款公司一致 且收款状态为“已收款”且退款状态为“未退款”的数据，
           * 若查询不到数据弹出提示框“未查询到满足条件数据，请检查！”
           *  */
          const args = {
            elasticsearchFlag: 'N',
            generic: {
              vos: [
                {
                  columnName: 'dgai.status',
                  conditionOperation: 'and',
                  frontBrackets: '(',
                  operation: 'equal',
                  postBrackets: ')',
                  propertyName: 'status',
                  type: 'enum',
                  values: ['2']
                },
                {
                  columnName: 'dri.status',
                  conditionOperation: 'and',
                  frontBrackets: '(',
                  operation: 'equal',
                  postBrackets: ')',
                  propertyName: 'deliveryRefundInfo.status',
                  type: 'enum',
                  values: ['10']
                },
                {
                  columnName: 'dgai.payment_customer_name',
                  conditionOperation: 'and',
                  frontBrackets: '(',
                  operation: 'equal',
                  postBrackets: ')',
                  propertyName: 'paymentCustomerName',
                  type: 'string',
                  values: [paymentCustomerName]
                },
                {
                  columnName: 'dgai.waybill_number',
                  conditionOperation: '',
                  frontBrackets: '(',
                  operation: 'equal',
                  postBrackets: ')',
                  propertyName: 'waybillNumber',
                  type: 'string',
                  values: [this.formModel.deductMoneyNumber]
                }
              ]
            }
          }
          const { rows } = await this.$http(API.auth['deliveryGoodsAmountInfo-search'], args)
          if (isEmpty(rows[0])) {
            this.formModel.deductMoneyAmount = ''
            this.formModel.deductMoneyNumber = ''
            this.formModel.deductMoneyReason = ''
            return this.$message.warning('未查询到满足条件数据，请检查！')
          }
          if (!modifyConditon) {
            this.formModel.deductMoneyReason = '代收货款抵扣运费'
          }

          // 异常金额 等于 代收货款金额 - 退款金额 - 抵扣金额
          this.formModel.deductMoneyAmount =
            toNumber(rows[0].collectAmount) -
            toNumber(get(rows[0], 'deliveryRefundInfo.amount')) -
            toNumber(get(rows[0], 'deliveryRefundInfo.deductAmount'))
          this.formModel.deductMoneyNumber = rows[0].waybillNumber
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      async dialogSubmit() {
        const [cancel] = await to(this.$refs.form.validate())
        if (cancel) {
          return console.error(cancel)
        }
        this.dialogParams.onSubmit({
          formModel: this.formModel,
          dialog: { close: this.fmsDialogClose }
        })
      },
      // 可抵扣金额 输入框 失去焦点事件
      // surplusBlur() {
      //   const { surplusDeductible, _max } = this.formModel
      //   if (toNumber(surplusDeductible) > toNumber(_max)) {
      //     this.formModel.surplusDeductible = _max
      //   }
      // },
      // 可抵扣金额 效验
      deductibleValidator(rule, value, callback) {
        const { _max } = this.formModel
        if (toNumber(value) > 0 && toNumber(value) <= toNumber(_max)) {
          callback()
        } else if (toNumber(value) > toNumber(_max)) {
          return callback(new Error(`已抵扣金额必须小于等于 ${toNumber(_max)}`))
        } else if (toNumber(value) <= 0) {
          return callback(new Error('已抵扣金额必须大于 0'))
        }
      },
      // 异常金额为代理扣框-已对账的时候,异常金额效验
      practicalMoneyValidator(rule, value, callback) {
        const { _max } = this.formModel
        if (toNumber(value) >= 0 && toNumber(value) <= toNumber(_max)) {
          callback()
        } else if (toNumber(value) > toNumber(_max)) {
          return callback(new Error(`异常金额必须小于等于 ${toNumber(_max)}`))
        } else if (toNumber(value) < 0) {
          return callback(new Error('异常金额不能小于0'))
        }
      },
      async PracticalMoneyNumber() {
        try {
          this.loading = true
          const args = {
            elasticsearchFlag: 'N',
            generic: {
              vos: [
                {
                  columnName: 'payable_bill_number',
                  conditionOperation: 'and',
                  frontBrackets: '(',
                  operation: 'equal',
                  postBrackets: ')',
                  propertyName: 'payableBillNumber',
                  type: 'string',
                  values: [this.formModel.deductMoneyNumber]
                },
                {
                  columnName: 'business_state',
                  conditionOperation: '',
                  frontBrackets: '(',
                  operation: 'contain',
                  postBrackets: ')',
                  propertyName: 'businessState',
                  type: 'enum',
                  values: ['10']
                }
              ]
            }
          }
          // 应付账单查询 应付状态为待审核的数据
          const { rows } = await this.$http('fmsaps.payableBill.search', args)

          if (!rows || !rows[0] || isEmpty(rows[0])) {
            up(this.formModel, {}, [
              // 责任人：为空 事由：为空
              // 异常金额 等于 实际应付金额
              // 异常金额最大值
              ['_max', 0],
              ['deductMoneyNumber', ''],
              // 异常金额 等于 实际应付金额
              ['deductMoneyAmount', 'practicalMoney', ''],
              ['deductMoneyAmountMask', 'practicalMoneyMask', '']
            ])
            this.$message.warning('该单据编码不存在')
          } else {
            up(this.formModel, rows[0], [
              // 责任人：为空 事由：为空
              // 异常金额 等于 实际应付金额
              ['deductMoneyAmount', 'practicalMoney', 0],
              // 异常金额最大值
              ['_max', 'practicalMoney', ''],
              ['deductMoneyAmountMask', 'practicalMoneyMask', '']
            ])
          }
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      async destroyFlexVarchar3() {
        const argsData = cloneDeep(this.dialogParams.row)
        if (!this.formModel.images.length) {
          argsData.flexVarchar3 = ''
        }
        this.dialogParams.onSubmit({
          formModel: argsData,
          dialog: { close: this.fmsDialogClose },
          cancel: true
        })
      }
    }
  }
</script>
