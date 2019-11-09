<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-form-block :block="formBlock" :model="formModel" ref="form">
      <kye-form-item :label="'扣款编码'" prop="deductMoneyNumber" slot="deductMoneyNumber">
        <fms-search-tips
          v-model="formModel.deductMoneyNumber"
          v-bind="NumberProps"
          @select="select"
          @clear="clear"
        ></fms-search-tips>
      </kye-form-item>
    </fms-form-block>
  </fms-dialog>
</template>

<script>
  import formBlock from './model/form-block'
  import comMixins from '@/fms/mixins/common'
  import { to, up, createModelByBlock } from '@/fms/utils'
  import APIPerson from '@/fms/api/personally-receivable'
  import APIMonthly from '@/fms/api/monthly-receivable'
  import fmsSearchTips from '@/fms/components/fms-search-tips'
  export default {
    mixins: comMixins,
    components: {
      fmsSearchTips
    },
    data () {
      const _formBlock = formBlock(this)
      const _formModel = createModelByBlock(_formBlock)
      return {
        fmsDialogOptions: {
          title: '异常备注新增',
          width: 2,
          submitCall: this.dialogSubmit,
          cancelCall: this.fmsDialogClose
        },
        NumberProps: {
          url: 'hr.deductManage.list',
          inputLength: 1,
          clearable: true,
          // 显示在输入框中的字段
          valueKey: 'code',
          // keys 显示在下拉框中的字段
          keys: ['code', 'totalAmount', 'reason', 'employeeName'],
          // 根据输入的值设置请求参数
          formatData: val => {
            this.inputVal = val
            return {
              code: val
            }
          },
          formatResult: async (val) => {
            console.log('val----', val)
            // 如果返回数据为空,则调取备用金预支接口,获取数据
            if (!val.length) {
              let params = {
                vo: {
                  advanceNumber: this.inputVal
                }
              }
              let res = await this.$http('fms.base.reserveAdvance.searchNoEncryption', params)
              res.rows.map(item => {
                item.code = item.advanceNumber
                item.totalAmount = item.advanceAmount
                item.reason = item.advanceReason
                item.employeeName = item.advancePersonName
              })
              if (!res.rows.length) {
                this.$message.warning('搜索数据为空!')
              }
              return res.rows
            } else {
              let newArr = []
              val.forEach(item => {
                if (item.approve === '10') {
                  newArr.push(item)
                }
              })
              if (!newArr.length) {
                this.$message.warning('该数据未审核,不能引用!')
              }
              return newArr
            }
          }
        },
        inputVal: '',
        formBlock: _formBlock,
        formModel: _formModel
      }
    },
    methods: {
      select (res) {
        if (res) {
          this.formModel.deductMoneyNumber = res.code
          this.formModel.deductMoneyAmount = res.totalAmount
          this.formModel.deductMoneyReason = res.reason
          this.formModel.deductMoneyFullName = res.employeeName
        } else {
          this.formModel.deductMoneyNumber = ''
          this.formModel.deductMoneyAmount = ''
          this.formModel.deductMoneyReason = ''
          this.formModel.deductMoneyFullName = ''
        }
      },
      clear () {
        this.formModel.deductMoneyNumber = ''
        this.formModel.deductMoneyAmount = ''
        this.formModel.deductMoneyReason = ''
        this.formModel.deductMoneyFullName = ''
      },
      async open (dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const { action, model } = dialogParams
        if (action === 'add') {
          this.formModel = createModelByBlock(this.formBlock)
        } else {
          this.formModel = up(this.formModel, model, [
            ['deductMoneyNumber'], // 扣款编码
            ['deductMoneyAmount'], // 扣款金额
            ['deductMoneyReason'], // 扣款事由
            ['deductMoneyFullName'], // 扣款人
            ['content'] // 异常备注
          ])
        }
        console.log('this.formModel', this.formModel)
      },
      async dialogSubmit () {
        const [invalid] = await to(this.$refs.form.validate())
        if (invalid) {
          // 验证没有通过
          return console.warn(invalid)
        }
        try {
          this.loading = true
          let method = ''
          const methods = {
            monthly: [
              APIMonthly['remarkBillExceptionInfo-updateMonthlyRemark'],
              APIMonthly['remarkBillExceptionInfo-saveMonthlyRemark']
            ],
            personally: [
              APIPerson['remarkBillExceptionInfo-updatePersonRemark'],
              APIPerson['remarkBillExceptionInfo-savePersonRemark']
            ]
          }
          const args = up({}, this.formModel, [['content'], ['deductMoneyNumber']])
          if (this.dialogParams.action === 'modify') {
            method = methods[this.dialogParams.pageType][0]
            args.id = this.dialogParams.model.id // 备注id
          } else {
            method = methods[this.dialogParams.pageType][1]
            args.billId = this.dialogParams.model.billId // 散客/月结id
          }
          const res = await this.$http(method, args)
          this.fmsDialogClose()
          this.dialogParams.onSubmit(res)
          this.$message.success('操作成功')
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      }
    }
  }
</script>
