/**
 * @fileoverview: 判断是否是正确有效的金额
 * @author: xuzengqiang
 * @date: 2018-06-21 14:01:44
 */

/**
 * 不能超过2位小数
 * @see {@link http://www.cnblogs.com/xumanbu/p/5019474.html}
 */
const rmoney = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/

/**
 * 金额判断
 * @param {String|Number} money - 金额
 */
export default money => rmoney.test(money)
