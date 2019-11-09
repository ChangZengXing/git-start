/**
 * Created by cy on 2018-11-29.
 */

import { get, hasIn } from 'lodash'

// 获取监控字段信息
export const getMaskField = (model, key) => {
  let maskKey = key + 'Mask'
  maskKey = hasIn(model, maskKey) ? maskKey : ''
  const value = get(model, key)
  const maskValue = get(model, maskKey)
  const is = !!maskKey && !!maskValue
  return {
    is,
    key,
    value,
    maskKey,
    maskValue
  }
}

// 获取敏感字段信息
export const getSensitiveField = (model, key) => {
  let sensitiveKey = key + 'MaskSec'
  sensitiveKey = hasIn(model, sensitiveKey) ? sensitiveKey : ''
  const value = get(model, key)
  const sensitiveValue = get(model, sensitiveKey)
  const is = !!sensitiveKey && !!sensitiveValue
  return {
    is,
    key,
    value,
    sensitiveKey,
    sensitiveValue
  }
}

// 判断是否是敏感字段
export const isSensitiveField = (model, key) => hasIn(model, key + 'MaskSec')

// 获取虚拟号码字段信息
export const getVirtualNumber = (model, key) => {
  let virtualKey = key + 'Virtual'
  virtualKey = hasIn(model, virtualKey) ? virtualKey : ''
  const value = get(model, key)
  const virtualValue = get(model, virtualKey)
  const is = !!virtualKey && !!virtualValue
  return {
    is,
    key,
    value,
    virtualKey,
    virtualValue
  }
}

// 判断是否是监控字段和虚拟字段
export const isAsteriskField = (model, key) => {
  const maskFiled = getMaskField(model, key)
  const virtualField = getVirtualNumber(model, key)
  if (
    maskFiled.is &&
    maskFiled.value &&
    typeof maskFiled.value === 'string' &&
    maskFiled.value.includes('*')
  ) {
    return true
  }
  if (
    virtualField.is &&
    virtualField.value &&
    typeof maskFiled.value === 'string' &&
    virtualField.value.includes('*')
  ) {
    return true
  }
  return false
}

// 判断是否是监控字段和虚拟字段和敏感字段
export const isSpecifiedField = (model, key) => {
  if (isSensitiveField(model, key)) {
    return true
  }
  return isAsteriskField(model, key)
}
