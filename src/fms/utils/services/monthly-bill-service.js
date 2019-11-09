/*
 * @fileOverview: 月结应收service
 * @author: xuzengqiang
 * @date: 2018-07-02 12:02:27
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class MonthlyBillService {
  /**
   * 根据付款公司和纳入月份查询月结应收数据
   * @param {String} customer - 客户信息
   * @param {String} inMonth - 纳入月份
   */
  static async queryByPaymentCustomerWithInMonth (paymentCustomerName, inMonth) {
    let monthlyBill = null

    paymentCustomerName = trim(paymentCustomerName)
    inMonth = trim(inMonth)
    if (!inMonth || !paymentCustomerName) {
      return monthlyBill
    }

    try {
      const response = await http('fms.monthlyBill.search', {
        page: 1,
        pageSize: 20,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            propertyName: 'paymentCustomerName',
            columnName: 'bb.payment_customer_name',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: 'and',
            operation: 'equal',
            type: 'string',
            values: [paymentCustomerName]
          }, {
            propertyName: 'inMonth',
            columnName: 'bb.in_month',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'equal',
            type: 'string',
            values: [inMonth]
          }]
        },
        vo: {}
      })

      if (Array.isArray(response.rows) && response.rows.length) {
        monthlyBill = response.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    return monthlyBill
  }
}

export default MonthlyBillService
