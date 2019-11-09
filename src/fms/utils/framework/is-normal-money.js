/**
 * @fileoverview: 判断是否是正确有效的金额(可以为负数)
 * @author: xuzengqiang
 * @date: 2018-08-06 15:11:36
 */

/**
 * 允许负数的金额
 * @since 1.0.1
 */
const rmoney = /(^[\\-]?[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[\\-]?[0-9]\.[0-9]([0-9])?$)/

/**
 * 金额判断
 * @param {String|Number} money - 金额
 */
export default money => rmoney.test(money)
