<template>
  <div>
    <div class="kye-dialog-body_form">
      <div class="FMS-stand-order-detail" v-loading="loading">
        <kye-form ref="form" :model="model" :rules="rules" label-position="right">
          <fms-form-fields :model="model" :layout="layout"></fms-form-fields>
        </kye-form>
      </div>
    </div>
    <div class="el-dialog__footer">
      <fms-form-footer @save="formSubmit" @cancel="close" in-dialog :auth="method"></fms-form-footer>
    </div>
  </div>
</template>
<script>
  import ModelConfig from './config/model'
  import FmsFormFields from '@/fms/components/fms-form-fields'
  import FmsFormFooter from '@/fms/components/fms-form-footer'
  import InvoiceEntrustService from '@/fms/utils/services/invoice-entrust-service'
  import OtherIncomeService from '@/fms/utils/services/other-income-service'
  import rules from './config/rules'
  import layout from './config/layout'
  import moneyFormatter from '@/fms/utils/framework/money-formatter'

  export default {
    data () {
      return {
        rules: rules(this),
        loading: false,
        layout: layout(this),
        model: ModelConfig(this)
      }
    },
    components: {
      FmsFormFooter,
      FmsFormFields
    },
    /**
     * 属性列表
     * @property {Object} dialogData - 弹出层数据
     * @property {String|Number} dataSource - 数据来源,1为电子发票,0:为普通发票
     * @property {String} method - 保存方法
     */
    props: {
      dialogData: {
        type: Object,
        required: true
      },
      dataSource: {
        type: [String, Number],
        default: '0'
      },
      method: {
        type: String,
        required: true
      }
    },
    mounted () {
      this.setModel()
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    methods: {
      close () {
        this.$emit('close')
      },
      /**
       * 设置model
       */
      async setModel () {
        this.model = Object.assign({}, ModelConfig(this), this.dialogData)
        this.model.dataSource = this.dataSource
      },
      /**
       * 收款单失去焦点处理
       * @date 2018-06-23 15:27:30
       * @since 1.0.1
       */
      async otherIncomeBlurHandle () {
        const otherIncomeNumber = this.model.otherIncomeNumber
        const otherIncome = await OtherIncomeService.queryByNumber(otherIncomeNumber)
        if (!otherIncome) {
          this.model.otherIncomeNumber = ''
          return
        }

        const entrustAmountTotal = await InvoiceEntrustService.getEntrustAmountTotal(otherIncomeNumber)
        const receiveAmount = moneyFormatter(otherIncome.receiveAmount)
        const entrustAmount = moneyFormatter(receiveAmount - moneyFormatter(entrustAmountTotal))

        Object.assign(this.model, {
          // 受托方  ->  公司名称
          reverseEntrustName: otherIncome.receiveCompanyName,
          // 委托收款日期 -> 收款日期
          entrustDate: otherIncome.receiveDate,
          // 银行流水收款账户 -> 来源编码
          bankFlowNumber: otherIncome.transNo,
          // 委托金额 收款金额-委托单中状态=null的金额
          entrustAmount: entrustAmount,
          // 受托方收款账户名 -> 收款户名
          entrustBankAccountName: otherIncome.receiveName,
          // 受托方收款银行账号 -> 收款账号
          entrustBankName: otherIncome.receiveAccountNo
        })
      },
      /**
       * 表单提交
       */
      formSubmit () {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            if (moneyFormatter(this.model.entrustAmount) > moneyFormatter(this.model.invoiceAmount)) {
              this.$message.warning('委托单金额不能大于发票金额!')
              return
            }

            await this.$http(this.method, this.model)
            this.$message.success('新增成功!')
            this.$emit('close')
          } else {
            this.$rule.error(this, this.$refs.form)
          }
        })
      }
    }
  }
</script>
