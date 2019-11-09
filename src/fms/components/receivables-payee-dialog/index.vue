<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-form-block :block="formBlock" :model="formModel"/>
    <fms-row justify="start" style="margin-bottom: 0">
      <kye-checkbox :true-label="DEFAULTPAYEE" :false-label="''" @change="onChange">默认收款人</kye-checkbox>
    </fms-row>
    <!-- 弹框 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed"/>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import formBlock from './model/form-block'
  import { up, employeeGet } from '@/fms/utils'
  import { trim } from 'lodash'
  // 默认收款人
  const DEFAULTPAYEE = '跨越速运集团有限公司'

  export default {
    mixins: comMixins,
    data() {
      return {
        fmsDialogOptions: {
          title: '收款人输入',
          width: 1,
          cancelCall: this.fmsDialogClose,
          submitCall: this.dialogSubmit
        },
        DEFAULTPAYEE,
        defaultPayee: '',
        formBlock: formBlock(this),
        formModel: { 'billReceivables-payee': '' },
        payeeInfo: {
          // 收款人
          'billReceivables-payee': '',
          // 收款人点部
          'billReceivables-payeeAddres': '',
          // 收款区域 fms_area
          'billReceivables-payArea': ''
        }
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const { model } = dialogParams
        up(this.formModel, model, ['billReceivables-payee'])
      },
      onChange(val) {
        const col = this.formBlock.rows[0].cols[0]
        col.componentProps.disabled = !!val
        this.formModel['billReceivables-payee'] = val
      },
      async updateEmployee(res) {
        console.log('updateEmployee', res)
        res = res || {}
        const { id, dataSource } = res
        if (id) {
          try {
            this.loading = true
            res = await employeeGet(id, dataSource)
          } catch (e) {
            return console.error(e)
          } finally {
            this.loading = false
          }
        }
        up(this.payeeInfo, res, [
          // 收款人点部
          ['billReceivables-payeeAddres', '_networkName', ''],
          // 收款区域 fms_area
          ['billReceivables-payArea', '_region', '']
        ])
      },
      clearEmployee() {
        console.log('clearEmployee')
        this.formModel['billReceivables-payee'] = ''
        up(this.payeeInfo, {}, [
          // 收款人
          ['billReceivables-payee', '', ''],
          // 收款人点部
          ['billReceivables-payeeAddres', '', ''],
          // 收款区域 fms_area
          ['billReceivables-payArea', '', '']
        ])
      },
      async dialogSubmit() {
        const chineseName = this.formModel['billReceivables-payee']
        this.payeeInfo['billReceivables-payee'] = chineseName

        if (chineseName === DEFAULTPAYEE) {
          // 收款人点部 设置为 宝安操作部
          this.payeeInfo['billReceivables-payeeAddres'] = '宝安操作部'
          // 收款区域 设置为华南 fms_area
          this.payeeInfo['billReceivables-payArea'] = '10'
        }
        if (trim(chineseName) === '') {
          this.clearEmployee()
        }

        // 更新 收款人点部 收款区域
        const { model } = this.dialogParams
        Object.assign(model, this.payeeInfo)

        this.fmsDialogClose()
      }
    }
  }
</script>
