/*
 * @fileOverview: 判断是否为空字符串
 * @author: xuzengqiang
 * @date: 2018-06-16 17:24:11
 */
import isEmpty from './is-empty'
const isBlank = obj => {
  // 如果是empty,返回true
  if (isEmpty(obj)) {
    return true
  }

  return (obj + '').trim().length === 0
}

export default isBlank
