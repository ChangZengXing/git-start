/*
 * @fileOverview: 提取可编辑表格中配置文件中的model
 * @author: xuzengqiang
 * @date: 2018-06-16 18:17:18
 */
import trim from './trim'
import { set } from 'lodash'

/**
 * 提取model对象
 * @param {Object} config - 配置信息
 */
const fetchEditTableModel = (config, columnName) => {
  if (Array.isArray(config) && config.length) {
    let model = {}
    let key
    config.forEach((column, index) => {
      if (column.hasOwnProperty('key')) {
        key = trim(column.key)
        key && set(model, column.key, '')
      }
    })

    return model
  } else if (config[columnName].length) {
    let model = {}
    let key
    config[columnName].forEach((item, index) => {
      if (item.hasOwnProperty('key')) {
        key = trim(item.key)
        key && set(model, item.key, '')
      }
    })
    return model
  } else {
    return {}
  }
}

export default fetchEditTableModel
