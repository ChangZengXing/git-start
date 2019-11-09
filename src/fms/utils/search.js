/**
 * Created by cy on 2018-10-25.
 */

import API from '@/fms/api/public'
import { get } from 'lodash'
import { Message } from 'element-ui'
// 快捷查询 人员需输入2字及以上，才可进行搜索，输入小于2个字符的时，提示：人员名称至少输入2个字符
export const searchNameLimit = (args, fields) => {
  if (!Array.isArray(fields)) {
    fields = [[fields]]
  }
  const { vos } = args.generic
  const keyList = []
  fields.forEach(field => {
    !Array.isArray(field) && (field = [field])
    let [key, label = '人员名称', message] = field
    const objName = vos.find(item => {
      return item.propertyName === key
    })
    !message && (message = `${label}至少输入2个字符`)
    if (objName && get(objName, 'values.0').length <= 1) {
      Message.warning(message)
      keyList.push(key)
      return true
    }
  })
  if (keyList.length) {
    return true
  } else {
    return false
  }
}

// 客户(付款公司)模糊搜索
export const customerSearch = ({
  placeholder = ' ',
  // 客户状态(crm_customer_status):10-正常，20-拉黑，30-作废
  customerStatus = '10',
  // 搜索为空 提示信息
  message,
  // 是否禁用
  disabled,
  // 是否只读
  readonly,
  // 是否可以清空
  clearable = true,
  // 至少输入字符数
  inputLength = 2
} = {}) => ({
  message,
  readonly,
  disabled,
  clearable,
  inputLength,
  placeholder,
  url: API['customer-serach'],
  // 显示在下拉框中的字段
  keys: ['customerShortName'],
  // 显示在输入框中的字段
  valueKey: 'customerShortName',
  formatData: val => ({ customerShortName: val, customerStatus })
})

// 新员工模糊搜索（部门信息从departmentInfo中取, 原字段 department, departmentId不准确）
export const employeeSearchNew = ({
  placeholder = '请输入',
  inputLength = 2,
  // 搜索为空 提示信息
  message,
  // 是否禁用
  disabled,
  // 是否只读
  readonly,
  // 是否可以清空
  clearable = true,
  formatData = {}
} = {}) => ({
  message,
  disabled,
  readonly,
  clearable,
  placeholder,
  inputLength,
  url: 'hr.remoteEmployee.list',
  // 显示在输入框中的字段
  valueKey: 'name',
  // 显示在下拉框中的字段
  keys: ['name', 'employeeNumber', 'departmentName'],
  formatResult: val => {
    val.map(item => {
      item.departmentName = item.departmentInfo.departmentName
      item.departmentNameId = item.departmentInfo.departmentId
    })
    return val
  },
  formatData: val => ({
    name: val,
    ...formatData
  })
})

// 员工模糊搜索(请使用上面的新员工接口搜索)
export const employeeSearch = ({
  placeholder = '请输入',
  inputLength = 2,
  // 10 表示只获取员工信息
  dataSource = '10',
  // 10 表示在职
  status = '10',
  // 搜索为空 提示信息
  message,
  // 是否禁用
  disabled,
  // 是否只读
  readonly,
  // 是否可以清空
  clearable = true
} = {}) => ({
  message,
  disabled,
  readonly,
  clearable,
  placeholder,
  inputLength,
  url: API['employee-listByName'],
  // 显示在输入框中的字段
  valueKey: 'chineseName',
  // 显示在下拉框中的字段
  keys: ['chineseName', 'employeeNumber', 'departmentName'],
  formatData: val => ({ chineseName: val, status, dataSource })
})

// 公司账户(付款账户,收款账户)搜索
export const accountConfigSearch = () => ({
  url: API['accountConfig-search'],
  inputLength: 1,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'accountName',
  // keys 显示在下拉框中的字段
  keys: ['accountName', 'account'],
  // 根据输入的值设置请求参数
  formatData: queryString => ({
    page: 1,
    pageSize: 1000,
    elasticsearchFlag: 'N',
    generic: {
      vos: [
        {
          columnName: 'account_name',
          propertyName: 'accountName',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: 'and',
          operation: 'contain',
          type: 'string',
          values: [queryString]
        },
        {
          columnName: 'use_flg',
          propertyName: 'useFlg',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: '',
          operation: 'contain',
          type: 'enum',
          values: ['Yes']
        }
      ]
    }
  })
})

// 供应商模糊搜索
export const supplierSearch = () => ({
  url: 'ims.supplier.sync.search',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'supplierName',
  // keys 显示在下拉框中的字段
  keys: ['supplierName'],
  // 根据输入的值设置请求参数
  formatData: queryString => ({
    page: 1,
    pageSize: 200,
    elasticsearchFlag: 'N',
    generic: {
      vos: [
        {
          columnName: 'supplier_name',
          propertyName: 'supplierName',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: '',
          operation: 'contain',
          type: 'string',
          values: [queryString]
        }
      ]
    }
  })
})

// 开户行模糊搜索
export const bankSearch = () => ({
  url: 'ims.bankName.search',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'name',
  // keys 显示在下拉框中的字段
  keys: ['name', 'lineNumber'],
  // 根据输入的值设置请求参数
  formatData: queryString => ({
    page: 1,
    pageSize: 200,
    elasticsearchFlag: 'N',
    name: queryString
  })
})

// 银行类型模糊搜索
export const bankTypeSearch = () => ({
  url: 'ims.bankType.sync.listByFuzzyName',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'bankTypeName',
  // keys 显示在下拉框中的字段
  keys: ['bankTypeName'],
  // 根据输入的值设置请求参数
  formatData: queryString => ({
    bankTypeName: queryString
  })
})

// 城市名称/code模糊搜索
export const cityNameSearch = (props = {}) => ({
  url: API['getCityCodeByCodeOrName'],
  inputLength: props.inputLength,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'cityName',
  // keys 显示在下拉框中的字段
  keys: ['addressName'],
  // 根据输入的值设置请求参数
  formatData: val => ({ cityName: val })
})

// 支付公司模糊搜索
export const companyNameSearch = () => ({
  url: 'fms.base.accountConfig.search',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'companyName',
  // keys 显示在下拉框中的字段
  keys: ['companyName', 'accountName', 'account'],
  // 根据输入的值设置请求参数
  formatData: val => ({
    page: 1,
    pageSize: 500,
    elasticsearchFlag: 'N',
    generic: {
      vos: [
        {
          propertyName: 'companyName',
          columnName: 'company_name',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: 'and',
          operation: 'contain',
          type: 'string',
          values: [val.trim()]
        },
        {
          propertyName: 'useFlg',
          columnName: 'use_flg',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: '',
          operation: 'equal',
          type: 'string',
          values: ['Yes']
        }
      ]
    }
  })
})

// 支付账户号模糊搜索
export const accountSearch = () => ({
  url: 'fms.base.accountConfig.search',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'account',
  // keys 显示在下拉框中的字段
  keys: ['accountName', 'account', 'companyName'],
  // 根据输入的值设置请求参数
  formatData: val => ({
    page: 1,
    pageSize: 500,
    elasticsearchFlag: 'N',
    generic: {
      vos: [
        {
          propertyName: 'account',
          columnName: 'account',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: 'and',
          operation: 'contain',
          type: 'string',
          values: [val.trim()]
        },
        {
          propertyName: 'useFlg',
          columnName: 'use_flg',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: '',
          operation: 'equal',
          type: 'string',
          values: ['Yes']
        }
      ]
    }
  })
})

// 支付账户名模糊搜索
export const accountNameSearch = () => ({
  url: 'fms.base.accountConfig.search',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'accountName',
  // keys 显示在下拉框中的字段
  keys: ['accountName', 'account', 'companyName'],
  // 根据输入的值设置请求参数
  formatData: val => ({
    page: 1,
    pageSize: 500,
    elasticsearchFlag: 'N',
    generic: {
      vos: [
        {
          propertyName: 'accountName',
          columnName: 'account_name',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: 'and',
          operation: 'contain',
          type: 'string',
          values: [val.trim()]
        },
        {
          propertyName: 'useFlg',
          columnName: 'use_flg',
          frontBrackets: '(',
          postBrackets: ')',
          conditionOperation: '',
          operation: 'equal',
          type: 'string',
          values: ['Yes']
        }
      ]
    }
  })
})

// 付款主体模糊搜索
export const paymentSubjectSearch = () => ({
  url: 'fms.incomePart.incomePartSelectCompany',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'companyName',
  // keys 显示在下拉框中的字段
  keys: ['companyName', 'account'],
  // 根据输入的值设置请求参数
  formatData: val => ({ companyName: val })
})

// 扣款编码模糊搜索
export const deductCodeSearch = () => ({
  url: 'hr.remoteFillBuckleManageDetail.list',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'deductCode',
  // keys 显示在下拉框中的字段
  keys: ['deductCode', 'amount'],
  // 根据输入的值设置请求参数
  formatData: val => ({ deductCode: val })
})

// 扣款编码搜索-代收货款/异常备注
export const deductCodeSearchB = () => ({
  url: 'hr.deductManage.list',
  inputLength: 6,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'code',
  // keys 显示在下拉框中的字段
  keys: ['code', 'totalAmount', 'reason', 'employeeName'],
  // 根据输入的值设置请求参数
  formatData: val => {
    return {
      code: val
    }
  }
})
// 预支编码模糊搜索
export const advanceCodeSearch = (
  { keys = ['advanceNumber', 'advanceReceivePersonName', 'advanceAmount', 'advanceReason'] } = {
    keys: ['advanceNumber', 'advanceReceivePersonName', 'advanceAmount', 'advanceReason']
  }
) => ({
  url: 'fms.base.reserveAdvance.searchNoEncryption',
  inputLength: 6,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'advanceNumber',
  // keys 显示在下拉框中的字段
  keys,
  // 根据输入的值设置请求参数
  formatData: val => {
    return {
      vo: {
        advanceNumber: val
      }
    }
  }
})

// 扣款编码-红冲-模糊搜索
export const redDashSearch = () => ({
  url: 'fms.receviceBillInfo.list',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'receviceCode',
  // keys 显示在下拉框中的字段
  keys: ['receviceCode'],
  // 根据输入的值设置请求参数
  formatData: val => ({ receviceCode: val })
})

// 收款编码-模糊搜索
export const receviceBillCodeSearch = redDashSearch

// 收款对象-模糊查询
export const collectionObjectSearch = ({ expenseTypeName } = {}) => ({
  url: 'ers.newExpense.searchPayee',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'payeeName',
  // keys 显示在下拉框中的字段
  keys: ['payeeName', 'payeeNumber', 'employeeDepartmentName', 'payeeTypeName'],
  // 根据输入的值设置请求参数
  formatData: val => ({ payeeName: val, expenseTypeName })
})

// 指定审批人
export const auditorSearch = () => ({
  url: 'oams.wfRuleNew.vipAuditerList',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'employeeName',
  // keys 显示在下拉框中的字段
  keys: ['employeeName', 'employeeCode'],
  // 根据输入的值设置请求参数
  formatData: val => ({ employeeName: val })
})

// 业务拓展费-客户名称
export const expenseCustomerName = () => ({
  url: 'ers.expense.getCustomForExpense',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'customNumber',
  // keys 显示在下拉框中的字段
  keys: ['customName', 'customNumber'],
  // 根据输入的值设置请求参数
  formatData: val => ({ customName: val })
})

// 收款账户名模糊搜索
export const payeeBankAccountNameSearch = () => ({
  url: 'fms.base.makeCollections.search',
  clearable: true,
  formatData(val) {
    let obj = {
      page: 1,
      pageSize: 500,
      elasticsearchFlag: 'N',
      generic: {
        vos: [
          {
            columnName: 'bank_account_name',
            propertyName: 'bankAccountName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'string',
            values: [val]
          }
        ]
      }
    }
    return obj
  },
  valueKey: 'bankAccountName',
  keys: ['bankAccountName', 'bankAccount']
})

// 收款人账号模糊搜索
export const payeeBankAccountNoSearch = () => ({
  url: 'fms.base.makeCollections.search',
  clearable: true,
  formatData(val) {
    let obj = {
      page: 1,
      pageSize: 500,
      elasticsearchFlag: 'N',
      generic: {
        vos: [
          {
            columnName: 'bank_account',
            propertyName: 'bankAccount',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'contain',
            type: 'string',
            values: [val]
          }
        ]
      }
    }
    return obj
  },
  valueKey: 'bankAccount',
  keys: ['bankAccountName', 'bankAccount']
})

// 车牌号搜索
export const carNumberSearch = () => ({
  url: 'vms.vehicle.listByPlateNumber',
  inputLength: 2,
  clearable: true,
  // 显示在输入框中的字段
  valueKey: 'plateNumber',
  // keys 显示在下拉框中的字段
  keys: ['plateNumber'],
  // 根据输入的值设置请求参数
  formatData: val => ({ plateNumber: val })
})

// 还贷信息-账户名称模糊查询
export const listByBankName = ({ dataSourceType }) => ({
  url: 'fms.base.repayLoan.listByBankName',
  clearable: true,
  formatData(val) {
    let obj = {
      bankName: val,
      dataSourceType
    }
    return obj
  },
  valueKey: 'bankName',
  // bankName 还贷账号名 bankAccount 还贷账号号 bankType 还贷开户行
  keys: ['bankName', 'bankAccount', 'bankType']
})

// 报销-项目编码-查询
export const crmMarketProjectSearch = () => ({
  url: 'crm.fresh.crmMarketProject.queryByProjectNameOrCode',
  clearable: true,
  inputLength: 14,
  // 显示在输入框中的字段
  valueKey: 'projectCode',
  // keys 显示在下拉框中的字段
  keys: ['projectCode', 'projectName'],
  // 根据输入的值设置请求参数
  formatData: val => ({ projectCode: val })
})
