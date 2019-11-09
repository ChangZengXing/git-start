/**
 * Created by cy on 2018-12-10.
 */

import moment from 'moment'
import { get } from 'lodash'
import { Message } from 'element-ui'

const fmtMap = {
  day: ['YYYY-MM-DD', '', ''],
  month: ['YYYY-MM', '', ''],
  minute: ['YYYY-MM-DD', ' 00:00', ' 23:59'],
  second: ['YYYY-MM-DD', ' 00:00:00', ' 23:59:59']
}

export const curDay = () => moment().format('YYYY-MM-DD HH:mm:ss')

export const curDayMinute = () => moment().format('YYYY-MM-DD HH:mm')

export const curDayDate = () => moment().format('YYYY-MM-DD')

export const curMonth = () => moment().format('YYYY-MM')

export const lastMonth = (n = 1, d, f = 'YYYY-MM') =>
  moment(d)
    .subtract(n, 'months')
    .format(f)

export const lastYear = (n = 1, d, f = 'YYYY-MM') =>
  moment(d)
    .subtract(n, 'years')
    .format(f)

export const curDayRange = () => [
  moment().format('YYYY-MM-DD') + ' 00:00:00',
  moment().format('YYYY-MM-DD') + ' 23:59:59'
]

export const curDayRangeMinute = () => [
  moment().format('YYYY-MM-DD') + ' 00:00',
  moment().format('YYYY-MM-DD') + ' 23:59'
]

export const curDayRangeDate = () => [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]

export const getMonthEdge = (date, f = 'day') => {
  const startOfMonth =
    moment(date)
      .startOf('month')
      .format(fmtMap[f][0]) + fmtMap[f][1]
  const endOfMonth =
    moment(date)
      .endOf('month')
      .format(fmtMap[f][0]) + fmtMap[f][2]

  return [startOfMonth, endOfMonth]
}

export const getMonthRange = (range = 3, fmt = 'second') => {
  console.log('fmtMap', fmt)
  const startMonth =
    moment()
      // .subtract(range, 'month') 比如 5月31 减去1个月 就是 4月31号 而四月是没有31号的 所以就是 4月30号
      // 这会导致月份天数判断错误, 故这里统一使用天数进行判断
      .subtract(range * 30, 'days')
      .format(fmtMap[fmt][0]) + fmtMap[fmt][1]
  const endMonth = moment().format(fmtMap[fmt][0]) + fmtMap[fmt][2]
  return [startMonth, endMonth]
}

export const getDaysRange = (range = 1, fmt = 'day') => {
  console.log('fmtMap', fmt)
  const startDay =
    moment()
      // .subtract(range, 'month') 比如 5月31 减去1个月 就是 4月31号 而四月是没有31号的 所以就是 4月30号
      // 这会导致月份天数判断错误, 故这里统一使用天数进行判断
      .subtract(range - 1, 'days')
      .format(fmtMap[fmt][0]) + fmtMap[fmt][1]
  const endDay = moment().format(fmtMap[fmt][0]) + fmtMap[fmt][2]
  return [startDay, endDay]
}

export const inDaysRange = (range = 1, dateRange) => {
  const s = moment(dateRange[0])
  const e = moment(dateRange[1])
  const diff = Math.abs(moment(e).diff(s, 'days'))
  console.log('inDaysRange diff', diff)
  return diff <= range - 1
}

// 月份范围的判断
// inMonthRange(model, 'devDate')
// inMonthRange(model, ['shippingDate', 'billReceivables.payDate'])
// inMonthRange(model, [['shippingDate', '寄件日期'], ['billReceivables.payDate', '收款日期]])
export const inMonthRange = (model, fields, range = 1, required = false) => {
  if (!Array.isArray(fields)) {
    fields = [[fields]]
  }
  if (Array.isArray(model) && model[0] && model[0].generic) {
    const vos = model[0].generic.vos || []
    model = model[1]
    fields = fields.filter(fi => {
      const [key] = !Array.isArray(fi) ? [fi] : fi
      return !!vos.find(vo => vo.propertyName === key)
    })
  }
  let empty = 0
  let pass = true
  fields.forEach(field => {
    !Array.isArray(field) && (field = [field])
    const [key, label = '日期范围'] = field
    const value = get(model, key)
    if (!value || value.length < 2) {
      // 选择的值都为空
      empty++
    } else {
      const [a, b] = value
      if (moment(b).isBefore(a)) {
        pass = false
        Message.warning(`结束时间 不可早于 起始时间！`)
      } else if (required !== 0 && moment(b).isAfter(moment(), 'day')) {
        pass = false
        Message.warning(`结束时间 不可晚于 当前时间！`)
      } else {
        // .diff只是按照月份来减,不考虑天数
        // if (Math.abs(moment(b).diff(a, 'months')) > range) {
        // 2018-12-09如果减去三个月,得到的日期2018-09-09
        // 如果你选择的起始日期是 2018-09-08 此时 2018-09-09 是在 2018-09-08 后面不满足条件
        // 如果你选择的起始日期是 2018-09-10 此时 2018-09-09 是在 2018-09-10 前面满足条件
        // queryTable中的时间组件 b默认是YYYY-MM-DD 23:59:59  而cy的block组件中的时间组件b默认是YYYY-MM-DD 00:00:00,所以只能判断days
        // console.log('moment-a', moment(a).format('YYYY-MM-DD HH:mm:ss'))
        // console.log('moment-b', moment(b).format('YYYY-MM-DD HH:mm:ss'))
        if (
        //  moment(b)
        //   .subtract(range * 30, 'days')
        //   .isAfter(a, 'days')
         moment(b)
          .subtract(range, 'months')
          .isAfter(a, 'days')
        ) {
          Message.warning(`${label}查询 不可超过 ${range} 个月！`)
          pass = false
        }
      }
    }
  })
  if (required && empty === fields.length) {
    pass = false
    Message.warning(`时间范围不能为空!`)
  }
  return pass
}
// 获取类似与2019-10这种月份的最后一天
export const getMonthLastDay = (yearMonth) => {
  const time = new Date(yearMonth)
  const year = '' + time.getFullYear()
  let month = time.getMonth() + 1
  month = month > 9 ? '' + month : '0' + month
  return new Date(year, month, 0)
}
// 判断时间间隔在几个月之内
export const contrastMonth = (a, b, num) => {
  return moment(b).subtract(num * 30, 'days').isAfter(a, 'days')
}

