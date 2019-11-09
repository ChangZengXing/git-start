/*
 * @fileOverview: 判断是否为非空字符串
 * @author: xuzengqiang
 * @date: 2018-06-16 17:24:11
 */
import isBlank from './is-blank'
const isNotBlank = obj => !isBlank(obj)
export default isNotBlank
