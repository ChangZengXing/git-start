/**
 * Created by cy on 2018-10-15.
 */

export const setItem = (name, content) => {
  if (!name) return
  try {
    if (typeof content === 'object') {
      content = JSON.stringify(content)
    }
    window.localStorage.setItem(name, content)
  } catch (e) {
    console.error(e)
  }
}

/**
 * 获取localStorage
 * @param  {String} name
 * @param  {String} type 返回数据类型
 * @param  {Any} defaultValue  默认值
 * @return {*}
 */
export const getItem = (name, type, defaultValue) => {
  let item = window.localStorage.getItem(name)

  if (type === 'Boolean' || type === Boolean) {
    if (item === 'false') {
      return false
    }

    if (item === 'true') {
      return true
    }

    return !!item
  }

  if (type === 'Number' || type === Number) {
    let _item = parseFloat(item)
    return isNaN(_item) ? defaultValue || item : _item
  }

  if (type === 'Array' || type === Array) {
    if (!name || !item) {
      item = []
    } else {
      try {
        item = JSON.parse(item) || []
      } catch (e) {
        item = defaultValue || []
        console.error(e)
      }
    }
  }

  if (type === 'Object' || type === Object) {
    if (!name || !item) {
      item = {}
    } else {
      try {
        item = JSON.parse(item) || {}
      } catch (e) {
        item = defaultValue || {}
        console.error(e)
      }
    }
  }

  return item
}

/**
 * 删除localStorage
 */
export const removeItem = name => {
  if (!name) return
  window.localStorage.removeItem(name)
}

export const clearStore = () => {
  window.localStorage.clear()
}

export default {
  set: setItem,
  get: getItem,
  del: removeItem,
  clear: clearStore
}
