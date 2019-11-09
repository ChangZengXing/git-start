/*
 * @fileOverview: 公司信息service
 * @author: xuzengqiang
 * @date: 2018-06-22 14:56:05
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class CompanyService {
  /**
   * 构造函数
   * @param {Integer} id - 散客ID
   */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据公司名称精确匹配公司信息
   * @param {String} companyName - 公司名称
   */
  static async queryByCompanyName (companyName) {
    let company = null

    companyName = trim(companyName)
    if (!companyName) {
      return company
    }

    try {
      const companys = await http('fms.company.search', {
        page: 1,
        pageSize: 1,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'cc.company_name',
            propertyName: 'companyName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'equal',
            type: 'string',
            values: [companyName]
          }]
        }
      })

      if (companys.rows.length) {
        company = companys.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    return company
  }

  /**
   * 根据公司名称模糊匹配公司信息
   * @param {String} companyName - 公司名称
   */
  static async fuzzyQueryByCompanyName (companyName) {
    let companys = []

    companyName = trim(companyName)
    if (!companyName) {
      return companys
    }

    try {
      const response = await http('fms.company.search', {
        page: 1,
        pageSize: 1,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'cc.company_name',
            propertyName: 'companyName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'string',
            values: [companyName]
          }]
        }
      })

      companys = response.rows
    } catch (e) {
      console.error(e)
    }
    return companys
  }
}

export default CompanyService
