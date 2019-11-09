/*
 * @fileOverview: 应付管理Service
 * @author: xuzengqiang
 * @date: 2018-07-02 16:52:27
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class PayableService {
  constructor(id) {
    this.id = id
  }

  /**
   * 根据应付编码查询应付信息
   * @param {String} payableNumber - 应付编码
   */
  static async queryByPayableNumber (payableNumber) {
    let payable = null

    payableNumber = trim(payableNumber)
    if (!payableNumber) {
      return payable
    }

    try {
      const response = await http('fms.base.payable.detail', {
        vo: {
          payableNumber
        }
      })

      if (response && Array.isArray(response.rows) && response.rows.length) {
        payable = response.rows[0]
      }
    } catch (e) {
      console.error(e)
    }

    return payable
  }
}

export default PayableService
