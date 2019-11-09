/*
 * @fileOverview: 提取layout布局文件中的model
 * @author: xuzengqiang
 * @date: 2018-06-16 18:47:24
 */
import { set } from 'lodash'
import trim from './trim'

const isNotEmptyArray = array => Array.isArray(array) && array.length !== 0

/**
 * 提取出tabs下所有的字段数组
 * @param {Array} tabs - 选项卡
 * @description tab下面再有tab
 */
const fetchTabsFields = tabs => {
  let fieldsArray = []
  if (Array.isArray(tabs) && tabs.length) {
    tabs.forEach(tab => {
      if (isNotEmptyArray(tab.fields)) {
        fieldsArray.push(tab.fields)
      }

      // 如果有子节点
      if (Array.isArray(tab.childrens)) {
        tab.childrens.forEach(children => {
          if (isNotEmptyArray(children.fields)) {
            fieldsArray.push(children.fields)
          }
        })
      }
    })
  }
  return fieldsArray
}

/**
 * 根据布局文件提取出fields数组
 * @param {Array} layout - 布局信息
 */
const fetchLayoutFields = layout => {
  let fieldsArray = []
  if (isNotEmptyArray(layout)) {
    layout.forEach(column => {
      if (isNotEmptyArray(column.cols)) {
        column.cols.forEach(col => {
          // 如果直接有fields
          if (isNotEmptyArray(col.fields)) {
            fieldsArray.push(col.fields)
          }
          // 如果是tabs
          if (isNotEmptyArray(col.tabs)) {
            fieldsArray.push(...fetchTabsFields(col.tabs))
          }

          // 如果还有子节点(只考虑到二级)
          if (isNotEmptyArray(col.childrens)) {
            col.childrens.forEach(children => {
              if (isNotEmptyArray(children.fields)) {
                fieldsArray.push(children.fields)
              }
              if (isNotEmptyArray(children.tabs)) {
                fieldsArray.push(...fetchLayoutFields(children.tabs))
              }
            })
          }
        })
      }
    })
  }
  return fieldsArray
}

/**
 * 提取布局文件中的model对象
 * @param {Object} layout - 布局配置
 */
const fetchLayoutModel = layout => {
  let model = {}
  const fieldsArray = fetchLayoutFields(layout)
  if (isNotEmptyArray(fieldsArray)) {
    let key
    fieldsArray.forEach(fields => {
      fields.forEach(field => {
        if (field.hasOwnProperty('key') && !/@TODO/i.test(field.key)) {
          key = trim(field.key)
          key && set(model, field.key, '')
        }
      })
    })
  }
  return model
}

export default fetchLayoutModel
