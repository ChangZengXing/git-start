/*
 * @fileOverview: 供应商信息
 * @author: xuzengqiang
 * @date: 2018-06-26 12:28:08
 */
import trim from '../framework/trim'
import { http } from '@/public/utils/http'

/**
 * 财务审核通过之后的处理
 * @type {String}
 */
const FINANCE_AUDITED = '20'

/**
 * 付款方式为月结
 */
const MONTH_RECEIVE = '10'

class SupplierService {
  constructor(id) {
    this.id = id
  }

  /**
   * 根据供应商简称获取已经审核的供应商信息
   * @author xuzengqiang
   * @date 2018-06-26 12:30:22
   * @since 1.0.0
   */
  static async getAuditSupplierByShortName (supplierName) {
    let suppliers = []
    supplierName = trim(supplierName)
    if (!supplierName) {
      return suppliers
    }

    try {
      const response = await http('ims.supplier.sync.search', {
        page: 1,
        pageSize: 1000,
        elasticsearchFlag: 'N',
        name: '',
        generic: {
          vos: [{
            columnName: 'supplier_name',
            propertyName: 'supplierName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: 'and',
            operation: 'contain',
            type: 'string',
            values: [supplierName]
          }, {
            columnName: 'finance_audit_flag',
            propertyName: 'financeAuditFlag',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'enum',
            values: [FINANCE_AUDITED]
          }]
        }
      })

      suppliers = response.rows
    } catch (e) {
      console.error(e)
    }

    return suppliers
  }

  /**
   * 根据供应商全称获取已经审核的供应商信息
   * @author xuzengqiang
   * @date 2018-06-26 12:30:22
   * @since 1.0.0
   */
  static async getAuditSupplierByFullName (supplierFullName) {
    let suppliers = []
    supplierFullName = trim(supplierFullName)
    if (!supplierFullName) {
      return suppliers
    }

    try {
      const response = await http('ims.supplier.sync.search', {
        page: 1,
        pageSize: 1000,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'supplier_full_name',
            propertyName: 'supplierFullName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: 'and',
            operation: 'contain',
            type: 'string',
            values: [supplierFullName]
          }, {
            columnName: 'finance_audit_flag',
            propertyName: 'financeAuditFlag',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'enum',
            values: [FINANCE_AUDITED]
          }]
        }
      })

      suppliers = response.rows
    } catch (e) {
      console.error(e)
    }

    return suppliers
  }

  /**
   * 根据供应商全称精确获取已经审核的供应商信息
   * @author xuzengqiang
   * @date 2018-06-26 12:30:22
   * @since 1.0.0
   */
  static async getAuditSupplierByCompleteFullName (supplierFullName) {
    let supplier = null
    supplierFullName = trim(supplierFullName)
    if (!supplierFullName) {
      return supplier
    }

    try {
      const response = await http('ims.supplier.sync.search', {
        page: 1,
        pageSize: 1000,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'supplier_full_name',
            propertyName: 'supplierFullName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: 'and',
            operation: 'equal',
            type: 'string',
            values: [supplierFullName]
          }, {
            columnName: 'finance_audit_flag',
            propertyName: 'financeAuditFlag',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'enum',
            values: [FINANCE_AUDITED]
          }]
        }
      })

      if (Array.isArray(response.rows) && response.rows.length) {
        supplier = response.rows[0]
      }
    } catch (e) {
      console.error(e)
    }

    return supplier
  }

  /**
   * 根据供应商简称获取付款类型为月结的供应商信息
   * @author xuzengqiang
   * @date 2018-06-26 12:30:22
   * @since 1.0.0
   */
  static async getMonthReceiveSupplierByShortName (supplierName) {
    let suppliers = []
    supplierName = trim(supplierName)
    if (!supplierName) {
      return suppliers
    }

    try {
      const response = await http('ims.supplier.sync.search', {
        page: 1,
        pageSize: 1000,
        elasticsearchFlag: 'N',
        name: '',
        generic: {
          vos: [{
            columnName: 'supplier_name',
            propertyName: 'supplierName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: 'and',
            operation: 'contain',
            type: 'string',
            values: [supplierName]
          }, {
            columnName: 'pay_amount_type',
            propertyName: 'payAmountType',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'enum',
            values: [MONTH_RECEIVE]
          }]
        }
      })

      suppliers = response.rows
    } catch (e) {
      console.error(e)
    }

    return suppliers
  }

  /**
   * 根据供应商全称获取付款类型为月结的供应商信息
   * @author xuzengqiang
   * @date 2018-06-26 12:30:22
   * @since 1.0.0
   */
  static async getMonthReceiveSupplierByFullName (supplierFullName) {
    let suppliers = []
    supplierFullName = trim(supplierFullName)
    if (!supplierFullName) {
      return suppliers
    }

    try {
      const response = await http('ims.supplier.sync.search', {
        page: 1,
        pageSize: 1000,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'supplier_full_name',
            propertyName: 'supplierFullName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: 'and',
            operation: 'contain',
            type: 'string',
            values: [supplierFullName]
          }, {
            columnName: 'pay_amount_type',
            propertyName: 'payAmountType',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'enum',
            values: [MONTH_RECEIVE]
          }]
        }
      })

      suppliers = response.rows
    } catch (e) {
      console.error(e)
    }

    return suppliers
  }
}

export default SupplierService
