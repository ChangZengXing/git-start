/*
 * @fileOverview: 深拷贝
 * @author: xuzengqiang
 * @date: 2018-06-22 21:13:42
 * @version 1.0.0
 * @see {jQuery.extend}
 */
import { isPlainObject } from 'lodash'

const extend = function () {
  let options
  let name
  let src
  let copy
  let copyIsArray
  let clone
  let target = arguments[0] || {}
  let i = 1
  let length = arguments.length
  let deep = false

  // 如果第一个参数为boolean类型,且为true,则为深拷贝
  if (typeof target === 'boolean') {
    deep = target
    target = arguments[i] || {}
    i++
  }

  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {}
  }

  if (i === length) {
    target = this
    i--
  }

  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        src = target[name]
        copy = options[name]

        if (target === copy) {
          continue
        }

        // 如果是深拷贝,copy必须为一个纯粹的对象或者数组
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
          // 如果是数组
          if (copyIsArray) {
            copyIsArray = false
            clone = src && Array.isArray(src) ? src : []
          } else {
            clone = src && isPlainObject(src) ? src : {}
          }

          // 递归
          target[name] = extend(deep, clone, copy)
        } else if (copy !== undefined) {
          target[name] = copy
        }
      }
    }
  }
  return target
}
export default extend
