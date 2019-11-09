/**
 * Created by cy on 2018-11-09.
 */

import numeral from './numeral'
import * as filter from '@/public/utils/filter'

const secStr = window.__ERPGLOABLECONFIG__.maskSec || '✽✽✽'

// extend public filter
export default {
  ...filter,
  money4: val => {
    // 处理监控/敏改字段
    const str = String(val)

    if (str.replace(/\*/g, '').length === 0) return val

    if (val === '' || val === secStr) return secStr

    return '￥' + numeral(val).format('0,0.0000')
  },
  thousandth: val => {
    // 处理监控/敏改字段
    const str = String(val)

    if (str.replace(/\*/g, '').length === 0) return val

    if (val === '' || val === secStr) return secStr

    return numeral(val).format('0,0.00')
  },
  thousandth2: val => { // 保留2位小数
    // 处理监控/敏改字段
    const str = String(val)

    if (str.replace(/\*/g, '').length === 0) return val

    if (val === '' || val === secStr) return secStr

    return numeral(val).format('0,0.0000')
  }
}
