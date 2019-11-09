/*
 * @fileOverview: 判断是否为数字
 * @author: xuzengqiang
 * @date: 2018-06-23 10:41:02
 */
const toString = Object.prototype.toString

/**
 * 判断是否为number
 * @param {mixed} number - 需要验证的数据
 * @example
 * isNumber(1)
 * isNumber(121212.12313)
 * isNumber('121212.0F')
 * isNumber(null)
 * isNumber(undefined)
 * isNumber('-12.12313')
 * isNumber('-1231.123AA')
 * isNumber('12.00000')
 * isNumber(-12.00000)
 */
const isNumber = number => (toString.call(number) === '[object Number]' || toString.call(number) === '[object String]') && !isNaN(number - parseFloat(number))

export default isNumber
