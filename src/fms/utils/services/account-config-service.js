/*
 * @fileOverview: 账户设置service
 * @author: xuzengqiang
 * @date: 2018-06-22 15:05:08
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class AccountConfigService {
  /**
   * 构造函数
   * @param {Integer} id - 散客ID
   */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据开户名称获取账户信息
   * @param {String} accountName - 开户名称
   */
  static async queryByAccountName (accountName) {
    let account = null

    accountName = trim(accountName)
    if (!accountName) {
      return account
    }

    try {
      // 调用账户设置接口
      const accounts = await http('fms.base.accountConfig.search', {
        page: 1,
        pageSize: 1,
        elasticsearchFlag: 'N',
        generic: {
          vos: [{
            columnName: 'account_name',
            propertyName: 'accountName',
            frontBrackets: '(',
            postBrackets: ')',
            conditionOperation: '',
            operation: 'equal',
            type: 'string',
            values: [accountName]
          }]
        }
      })

      if (accounts.rows.length) {
        account = accounts.rows[0]
      }
    } catch (e) {
      console.error(e)
    }
    return account
  }

  /**
   * 根据开户名称模糊匹配账户设置
   * @param {String} accountName - 开户名称
   */
  static async fuzzyQueryByAccountName (accountName) {
    let accounts = []

    accountName = trim(accountName)
    if (!accountName) {
      return accounts
    }

    try {
      // 调用账户设置接口
      const response = await http('fms.base.accountConfig.search', {
        page: 1,
        pageSize: 100,
        elasticsearchFlag: 'N',
        generic: {
          vos: [
            {
              columnName: 'account_name',
              propertyName: 'accountName',
              frontBrackets: '(',
              postBrackets: ')',
              conditionOperation: '',
              operation: 'contain',
              type: 'string',
              values: [accountName]
            },
            {
              'propertyName': 'useFlg',
              'columnName': 'use_flg',
              'frontBrackets': '(',
              'postBrackets': ')',
              'conditionOperation': '',
              'operation': 'equal',
              'type': 'enum',
              'values': ['Yes']
            }
          ]
        }
      })

      accounts = response.rows
    } catch (e) {
      console.error(e)
    }
    return accounts
  }
}

export default AccountConfigService
