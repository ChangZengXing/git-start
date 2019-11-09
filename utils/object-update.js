/**
 * Created by cy on 2018-07-13.
 */

import { get, set, merge } from 'lodash'

// 此方法会修改target,如果需要返回一个新的对象,可将target设置为空对象{}
// const model = up({}, res, ['age', 'name'])
export default function objectUpdate(target, source, fields, opts) {
  if (!fields) {
    return merge(target, source)
  }
  if (!Array.isArray(fields)) {
    fields = [fields]
  }
  return fields.reduce((t, f) => {
    if (!Array.isArray(f)) {
      f = [f]
    }

    let value

    if (f.length === 1) {
      const defaultValue = opts
      value = get(source, f[0], defaultValue)
    } else if (f.length === 2) {
      if (typeof f[1] === 'function') {
        value = f[1](get(source, f[0]))
      } else {
        const defaultValue = opts
        value = get(source, f[1] || f[0], defaultValue)
      }
    } else if (f.length === 3) {
      if (typeof f[2] === 'function') {
        value = f[2](get(source, f[1] || f[0]))
      } else {
        value = get(source, f[1] || f[0], f[2])
      }
    }
    // 回调函数
    if (typeof opts === 'function') {
      if (opts(value, t)) {
        return t
      }
    }
    // ignore some value
    if (Array.isArray(opts)) {
      if (opts.indexOf(value) > -1) {
        return t
      }
    }
    if (typeof f[3] === 'function') {
      value = f[3](value)
    }
    set(t, f[0] || f[1], value)
    return t
  }, target)
}
