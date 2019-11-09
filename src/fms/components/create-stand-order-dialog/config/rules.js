/*
 * @fileOverview: 验证规则
 * @author: xuzengqiang
 * @date: 2018-05-25 21:57:13
 *
 * @update xuzengqiang
 * @date 2018-06-23 15:05:23
 * @version 1.0.1
 * @description
 * 1、修改其它进账编码不能为空
 * 2、委托金额和发票金额值限定
 */
import moneyValidator from '@/fms/utils/framework/money-validator'
import { toNumber } from 'lodash'
export default vm => {
  return {
    otherIncomeNumber: [
      {
        required: true,
        message: '收款单编码不能为空',
        trigger: 'blur'
      }
    ],
    /**
     * 委托金额必须大于0
     */
    entrustAmount: moneyValidator({
      label: '委托金额',
      required: true,
      greaterThanZero: true
    }),
    /**
     * 发票金额
     */
    invoiceAmount: moneyValidator({
      label: '发票金额',
      required: true,
      greaterThanZero: true,
      validator: (rule, value, callback) => {
        if (toNumber(value) > toNumber(vm.dialogData.invoiceAmount)) {
          callback(new Error('发票金额不能大于开票金额'))
          return
        }
        callback()
      }
    })
  }
}
