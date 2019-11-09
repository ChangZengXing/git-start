/*
 * @fileOverview: 委托单接口
 * @author: xuzengqiang
 * @date: 2018-06-23 15:29:33
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'
class InvoiceEntrustService {
  /**
   * 构造函数
   * @param {Integer} id - 客户ID
   */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据其它进账编码获取委托单状态为null的金额总和
   * @param {String} otherIncomeNumber - 其它进账编码
   * @date 2018-06-22 20:16:07
   */
  static async getEntrustAmountTotal (otherIncomeNumber) {
    let entrustAmountTotal = 0

    otherIncomeNumber = trim(otherIncomeNumber)
    if (!otherIncomeNumber) {
      return entrustAmountTotal
    }

    try {
      entrustAmountTotal = await http('fms.invoiceEntrust.getEntrustAmountTotal', {
        otherIncomeNumber: otherIncomeNumber
      })
    } catch (e) {
      console.error(e)
    }

    return entrustAmountTotal
  }
}

export default InvoiceEntrustService
