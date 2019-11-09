/*
 * @fileOverview: 模板对账后台
 * @author: xuzengqiang
 * @date: 2018-06-23 11:33:01
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class BalanceAccountModuleService {
  constructor(id) {
    this.id = id
  }

  /**
   * 根据标识公司获取模板对象信息
   * @param {String} identificationCompany - 标识公司
   */
  static async queryByIdentificationCompany (identificationCompany) {
    let balanceAccountModule = null

    identificationCompany = trim(identificationCompany)
    if (!identificationCompany) {
      return balanceAccountModule
    }

    try {
      const response = await http('fms.balanceAccountModule.search', {
        page: 1,
        pageSize: 20,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'identification_company',
            propertyName: 'identificationCompany',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'equal',
            type: 'string',
            values: [identificationCompany]
          }]
        }
      })

      if (Array.isArray(response.rows) && response.rows.length) {
        balanceAccountModule = response.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    return balanceAccountModule
  }
}
export default BalanceAccountModuleService
