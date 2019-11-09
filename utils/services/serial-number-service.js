/*
 * @fileOverview: 财务流程单据编号业务service
 * @author: xuzengqiang
 * @date: 2018-06-25 14:21:47
 * @version 1.0.0
 */
import trim from '../framework/trim'
import { http } from '@/public/utils/http'

class SerialNumberService {
  /**
   * 构造函数
   * @param {String} code - 编号编码
   */
  constructor(code) {
    this.code = code
  }

  /**
   * 获取单据编号
   * @date 2018-06-25 14:25:06
   * @since 1.0.0
   */
  async get () {
    let number = ''

    const code = trim(this.code)
    if (!code) {
      return number
    }

    try {
      const response = await http('fms.serialNumber.get', { code })
      number = response.number
    } catch (e) {
      console.error(e)
    }
    return number
  }
}

export default SerialNumberService
