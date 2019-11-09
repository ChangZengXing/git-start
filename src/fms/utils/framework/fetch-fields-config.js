/*
 * @fileOverview: 获取所有的字段配置文件
 * @author: xuzengqiang
 * @date: 2018-06-19 16:00:05
 */
import hump from './hump'

/**
 * 根据指定文件名称生成fieldName
 * @param {String} fileName - 文件名称
 * @description
 * open-invoice => openInvoiceConfig
 */
const fieldName = fileName => `${hump(fileName)}Config`

/**
 * 获取配置的fields
 * @param {Object} context - require.context返回的context对象
 * @param {Object} vm - vue组件实例对象
 */
const getFields = (context, vm) => {
  let fields = {}
  let fieldConfig
  let fieldConfigKey
  context.keys().forEach(key => {
    // 获取默认返回值
    fieldConfig = context(key).default

    fieldConfigKey = key.substring(key.lastIndexOf('/') + 1)
    fieldConfigKey = fieldName(fieldConfigKey.substring(0, fieldConfigKey.lastIndexOf('.')))
    fields[fieldConfigKey] = fieldConfig
  })
  return fields
}

export default getFields
