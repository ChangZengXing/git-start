/*
 * @fileOverview: 格式化金额数据,保留两位小数
 * @author: xuzengqiang
 * @date: 2018-06-23 10:40:17
 */
import isNumber from './is-number'
import { round } from 'lodash'

/**
 * 转换为有效金额,保留两位小数
 * @param {mixed} number - 需要格式化的数据
 */
const moneyFormatter = number => isNumber(number) ? round(number, 2) : 0
export default moneyFormatter
