/*
 * @fileOverview: 判断是否为非null|undefined对象
 * @author: xuzengqiang
 * @date: 2018-06-16 17:20:46
 */
import isEmpty from './is-empty'

const isNotEmpty = obj => !isEmpty(obj)
export default isNotEmpty
