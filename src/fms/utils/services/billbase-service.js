/*
 * @fileOverview: 散客应收service
 * @author: xuzengqiang
 * @date: 2018-06-22 14:41:33
 * @version 1.0.0
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class BillBaseService {
  /**
   * 构造函数
   * @param {Integer} id - 散客ID
   */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据ID获取散客信息
   * @since 1.0.0
   */
  async queryById () {
    let billBase = null

    const id = trim(this.id)
    if (!id) {
      return billBase
    }

    try {
      const response = await http('fms.personBill.personDetail', {
        vo: {
          id
        }
      })

      if (Array.isArray(response.rows) && response.rows.length) {
        billBase = response.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    return billBase
  }

  /**
   * 根据运单号获取散客信息
   * @param {String} waybillNumber - 运单号
   * @since 1.0.0
   */
  static async queryByWaybillNumber (waybillNumber) {
    let billBase = null

    waybillNumber = trim(waybillNumber)
    if (!waybillNumber) {
      return billBase
    }

    try {
      const response = await http('fms.personBill.personDetail', {
        vo: {
          billPerson: {
            waybillNumber
          }
        }
      })

      if (Array.isArray(response.rows) && response.rows.length) {
        billBase = response.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    return billBase
  }
}

export default BillBaseService
