<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <!-- 查询表单 -->
    <fms-form-block :block="formBlock" :model="formModel" ref="form">
      <!-- <kye-form-item slot-scope="row" slot="checkBtn" :label="''">
        <kye-checkbox v-model="row.btn">{{"是否客户"}}</kye-checkbox>
      </kye-form-item>-->
    </fms-form-block>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import formBlock from './model/form-block'
  import API from '@/fms/api/receive-bill'
  import { up, to, createModelByBlock } from '@/fms/utils'

  export default {
    mixins: comMixins,
    data() {
      const _formBlock = formBlock(this)
      const _formModel = createModelByBlock(_formBlock)
      return {
        formBlock: _formBlock,
        formModel: _formModel,
        fmsDialogOptions: {
          title: '',
          width: 3,
          submitText: '保存',
          submitCall: this.dialogSubmit,
          cancelCall: this.dialogCancel
        }
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        this.loadUser()
      },
      updateIsCompany(val) {
        this.formBlock = formBlock(this, val === '1')
        this.formModel = createModelByBlock(this.formBlock)
      },
      async loadUser() {
        // 如果垫付市场不为空时,收款对象为垫付市场员,根据垫付市场id去员工信息查看垫付市场员的姓名 id 工号
        if (this.dialogParams.marketId) {
          const { name, id, employeeNumber } = await this.$http('hr.remoteEmployee.getByName', {
            name: this.dialogParams.marketId
          })
          this.formModel.payeeName = name
          this.formModel.payeeId = id
          this.formModel.payeeNumber = employeeNumber
        } else {
          // 如果垫付市场为空时,收款对象默认为当前登录人
          const { name, id, employeeNumber } = this.$store.getters.user
          this.formModel.payeeName = name
          this.formModel.payeeId = id
          this.formModel.payeeNumber = employeeNumber
        }
      },
      async dialogSubmit() {
        try {
          this.loading = true
          const [err] = await to(this.$refs.form.validate())
          if (err) {
            return
          }
          // 是否客户为否的话,要去员工信息验证收款对象为在职员工
          if (this.formModel.isCompany === '0') {
            const res = await this.$http('data.employee.get', { id: this.formModel.payeeId })
            if (res.status === '20') {
              return this.$message.warning('该收款对象已离职')
            } else if (res.status !== '10') {
              return this.$message.warning('该收款对象不在员工信息中')
            }
          }
          // 处理 省份 城市
          const { locationVos = [] } = this.formModel

          if (locationVos.length === 2) {
            // 收款省份
            this.formModel.payeeProvince = locationVos[0].addressName || ''
            // 收款省份ID
            this.formModel.payeeProvinceId = locationVos[0].id || ''
            // 收款城市
            this.formModel.payeeCity = locationVos[1].addressName || ''
            // 收款城市ID
            this.formModel.payeeCityId = locationVos[1].id || ''
          } else {
            this.formModel.payeeCity = ''
            this.formModel.payeeCityId = ''
            this.formModel.payeeProvinceId = ''
            this.formModel.payeeProvince = ''
          }
          this.formModel.id = this.dialogParams.id
          await this.$http(API['receviceBillInfo-refund'], { ...this.formModel })
          this.$message.success('操作成功!')
          this.dialogParams.submit()
          this.dialogCancel()
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      dialogCancel() {
        this.fmsDialogClose()
      },
      // 更新银行类型
      bankTypeUpdate(res) {
        console.log(res, this.formModel)
        up(this.formModel, res || {}, [
          ['payeeBankCode', 'bankTypeCode', ''],
          ['payeeBankType', 'bankTypeName', '']
        ])
      },
      // 更新开户行信息
      payeeBankUpdate(res) {
        up(this.formModel, res || {}, [
          ['payeeBankName', 'name', ''],
          ['payeeBankNumber', 'lineNumber', '']
        ])
      },
      // 收款对象
      updateCollectionObject(res) {
        console.log('collectionObjectUpdate', res)
        if (res) {
          // 如果是否客户为是的
          if (this.formModel.isCompany === '1') {
            const {
              customerShortName,
              customerCode,
              id
              // provinceId,
              // province,
              // cityId,
              // city
            } = res
            this.formModel.payeeId = id
            this.formModel.payeeName = customerShortName
            this.formModel.payeeNumber = customerCode
            // this.formModel.locationVos = [
            //   { addressName: province, id: provinceId },
            //   { addressName: city, id: cityId }
            // ]
            this.companyInfo(id)
          } else {
            // 收款对象id
            this.formModel.payeeId = res.payeeId
            // 收款对象名称
            this.formModel.payeeName = res.payeeName
            // 收款对象类型 1: 内部员工，2:供应商，3：其他
            // this.formModel.payeeType = res.payeeType
            // 收款对象编码
            this.formModel.payeeNumber = res.payeeNumber
            // this.getCollectionInfo(res)
          }
          // 当存在收款对象时, 设置收款信息不可以修改,同时都是必填
          // this.layout = layout(this, 'add', { payeeType: res.payeeType })
        } else {
          // 收款对象id
          this.formModel.payeeId = ''
          // 表示用户主动清除 此时清空 收款对象名称
          if (res === false) {
            this.formModel.payeeName = ''
          }
          // 收款对象类型
          this.formModel.payeeType = '3'
          // 收款账户名
          this.formModel.payeeBankAccountName = ''
          // 收款人账号
          this.formModel.payeeBankAccountNo = ''
          // 收款开户行
          this.formModel.payeeBankName = ''
          // 银行类型
          this.formModel.payeeBankType = ''
          // 联行号
          this.formModel.payeeBankNumber = ''
          // 银行编码
          this.formModel.payeeBankCode = ''
          // 清空省份,城市
          this.formModel.locationVos = []
          // 其它收款对象
          // this.layout = layout(this, 'add', { payeeType: 3 })
        }
      },
      // 获取客户收款信息
      async companyInfo(customerId) {
        try {
          this.loading = true
          const companyInfo = await this.$http('crm.customer.sync.get', {
            customerId
          })
          const { payAccount, payAccountName, payAccountBank } = companyInfo
          // 收款账户名
          this.formModel.payeeBankAccountName = payAccountName || ''
          // 收款人账号
          this.formModel.payeeBankAccountNo = payAccount || ''
          // 收款开户行
          this.formModel.payeeBankName = payAccountBank || ''
          // 根据收款开户行带出联行号
          if (!payAccountBank) {
            return this.$message.warning('收款开户行为空,不能带出联行号')
          }
          const { lineNumber } = await this.$http('ims.bankName.sync.getByName', {
            name: payAccountBank
          })
          this.formModel.payeeBankNumber = lineNumber
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      }
      // 查询收款信息
      // async getCollectionInfo({ payeeId, payeeType }) {
      //   try {
      //     this.loading = true
      //     const res = await this.$http('ers.newExpense.getPayeeInfo', { payeeId, payeeType })
      //     const {
      //       payeeBankAccountName,
      //       payeeBankAccountNo,
      //       payeeBankName,
      //       payeeBankType,
      //       payeeBankCode,
      //       payeeBankNumber,
      //       payeeProvince,
      //       payeeProvinceId,
      //       payeeCity,
      //       payeeCityId
      //     } = res
      //     // 收款账户名
      //     this.formModel.payeeBankAccountName = payeeBankAccountName || ''
      //     // 收款人账号
      //     this.formModel.payeeBankAccountNo = payeeBankAccountNo || ''
      //     // 收款开户行
      //     this.formModel.payeeBankName = payeeBankName || ''
      //     // 银行类型
      //     this.formModel.payeeBankType = payeeBankType || ''
      //     // 联行号
      //     this.formModel.payeeBankNumber = payeeBankNumber || ''
      //     this.formModel.payeeBankCode = payeeBankCode || ''
      //     // 收款人银行所在省份城市
      //     const locationVos = [
      //       { id: payeeCityId, addressName: payeeCity },
      //       { id: payeeProvinceId, addressName: payeeProvince }
      //     ]
      //     this.formModel.locationVos = locationVos
      //   } catch (e) {
      //     console.error(e)
      //   } finally {
      //     this.loading = false
      //   }
      // },
    }
  }
</script>
