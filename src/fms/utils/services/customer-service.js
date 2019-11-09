/*
 * @fileOverview: 客户信息公用接口
 * @author: xuzengqiang
 * @date: 2018-06-22 14:34:16
 * @version 1.0.0
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'
class CustomerService {
  /**
   * 构造函数
   * @param {Integer} id - 客户ID
   */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据ID获取客户信息
   * @since 1.0.0
   * @description crm.customer.get接口获取客户信息.crm.customer.sync.get这个接口响应的数据不完善
   */
  async queryById () {
    let customer = null
    const id = trim(this.id)

    if (!id) {
      return customer
    }

    try {
      customer = await http('crm.customer.get', { id })
    } catch (e) {
      console.error(e)
    }
    return customer
  }

  /**
   * 根据客户ID获取客户开票信息
   * @date 2018-06-22 20:16:07
   */
  async queryCompanyInvoiceById () {
    let company = null

    const id = trim(this.id)
    if (!id) {
      return company
    }

    try {
      company = await http('fms.invoice.getCustomerInfo', {
        companyId: id
      })
    } catch (e) {
      console.error(e)
    }

    return company
  }

  /**
   * 根据公司简称精确获取客户信息
   * @param {String} customerShortName - 公司简称
   */
  static async getByCustomerShortName (customerShortName) {
    let customer = null

    customerShortName = trim(customerShortName)
    if (!customerShortName) {
      return customer
    }

    try {
      const customers = await http('crm.customer.search', {
        page: 1,
        pageSize: 1,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'customer_short_name',
            propertyName: 'customerShortName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'equal',
            type: 'string',
            values: [customerShortName]
          }]
        }
      })

      if (customers.rows.length) {
        customer = customers.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    return customer
  }
}

export default CustomerService
