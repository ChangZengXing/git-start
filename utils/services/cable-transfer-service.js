/*
 * @fileOverview: 电汇交易service
 * @author: xuzengqiang
 * @date: 2018-06-22 15:15:23
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class CableTransferService {
  /**
    * 构造函数
    * @param {Integer} id - 散客ID
    */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据银行流水号查询电汇交易信息
   * @param {String} bankFlow - 银行流水号
   */
  static async queryByBankFlow (bankFlow) {
    let cableTransfer = null

    bankFlow = trim(bankFlow)
    if (!bankFlow) {
      return cableTransfer
    }

    try {
      const response = await http('fms.cableTransfer.search', {
        page: 1,
        pageSize: 20,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'bank_flow',
            propertyName: 'bankFlow',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'equal',
            type: 'string',
            values: [bankFlow]
          }]
        }
      })

      if (response.rows.length) {
        cableTransfer = response.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    console.error(cableTransfer)
    return cableTransfer
  }
}

export default CableTransferService
