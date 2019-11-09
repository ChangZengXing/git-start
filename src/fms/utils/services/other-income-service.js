/**
 * @since 更改为从收款单带数据
 */

import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class OtherIncomeService {
  /**
   * 构造函数
   * @param {Integer} id - 其它进账ID
   */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据其它进账编码获取其它进账信息
   * @param {String} incomeNumber - 其它进账编码
   * @since 1.0.0
   */
  static async queryByNumber(incomeNumber) {
    let otherIncome = null

    incomeNumber = trim(incomeNumber)
    if (!incomeNumber) {
      return otherIncome
    }

    try {
      let params = {
        page: 1,
        pageSize: 20,
        elasticsearchFlag: 'N',
        generic: {
          vos: [
            {
              propertyName: 'receviceCode',
              columnName: 'recevice_code',
              frontBrackets: '(',
              postBrackets: ')',
              conditionOperation: '',
              operation: 'equal',
              type: 'string',
              values: [incomeNumber]
            }
          ]
        },
        vo: {}
      }
      let rows = await http('fms.receviceBillInfo.search', params)
      rows = rows.rows || rows
      if (rows.length) {
        let id = rows[0].id
        otherIncome = await http('fms.receviceBillInfo.get', { id })
      }
    } catch (e) {
      console.error(e)
    }
    return otherIncome
  }
}

export default OtherIncomeService
