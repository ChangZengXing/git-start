/*
 * @fileOverview: 过滤掉前后空格
 * @author: xuzengqiang
 * @date: 2018-06-16 17:35:43
 */
import isEmpty from './is-empty'
const trim = obj => {
  if (isEmpty(obj)) {
    return ''
  }
  return (obj + '').trim()
}
export default trim
