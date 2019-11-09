/**
 * Created by cy on 2018-12-04.
 */

import store from '@/public/store'

const permissionApiCodes = store.getters.permission.menus

// 判断api code 是否有配置权限
export const hasAuth = apiCode => {
  // 默认没有配置APICode,那么默认处理为有权限
  if (!apiCode) {
    return true
  }
  // ? TODO 这里是需要替换掉$$ 比如'crm$$'.replace('$$', '')
  apiCode = apiCode.replace('$$', '')
  // 如果配置了APICode
  if (!permissionApiCodes.includes(apiCode)) {
    return false
  }
  return true
}
