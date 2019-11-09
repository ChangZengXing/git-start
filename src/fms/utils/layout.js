/**
 * Created by cy on 2018-05-08.
 */

import { set, maxBy } from 'lodash'

let ID = 1

export const component = (type, component, componentReplace) => {
  if (type === 'detail') {
    return componentReplace || 'kye-field'
  }
  return component
}

export const typeofAdd = (type, trueVal = true, falseVal = false) => {
  if (type === 'add') {
    return trueVal
  }
  return falseVal
}

export const typeofModify = (type, trueVal = true, falseVal = false) => {
  if (type === 'modify') {
    return trueVal
  }
  return falseVal
}

export const typeofDetail = (type, trueVal = true, falseVal = false) => {
  if (type === 'detail') {
    return trueVal
  }
  return falseVal
}

export const disabled = type => {
  return type === 'detail'
}

export const placeholder = (type, placeholder) => {
  if (disabled(type)) {
    return ''
  }
  return placeholder
}

export const required = type => {
  return type !== 'detail'
}

export const requiredRules = (type, message = '必填, 不能为空', trigger = 'blur') => {
  if (type === 'detail' || !type) {
    return []
  }
  return [{ required: true, message, trigger }]
}

export const linkInAdd = (type, fn) => {
  if (type === 'add') {
    return fn
  }
  return false
}

export const linkInModify = (type, fn) => {
  if (type === 'modify') {
    return fn
  }
  return false
}

export const linkInDetail = (type, fn) => {
  if (type === 'detail') {
    return fn
  }
  return false
}

export const linkNotDetai = (type, fn) => {
  if (type !== 'detail') {
    return fn
  }
  return false
}

// 兼容上面 linkNotDetai 单词拼写错误
export const linkNotDetail = linkNotDetai

export const linkNotAdd = (type, fn) => {
  if (type !== 'add') {
    return fn
  }
  return false
}

export const link = (type, fn, flag) => {
  if (flag === true) {
    // both run
    return fn
  } else if (flag === false) {
    if (type === 'detail') {
      return false
    }
    return fn
  } else if (flag === undefined) {
    // default detail
    if (type === 'detail') {
      return fn
    }
    return false
  }
}

export const getColInRowsByKey = (rows, key) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!Array.isArray(row.cols) || row.cols.length === 0) {
      return null
    }
    const col = row.cols.find(col => {
      return col.key === key
    })
    if (col) {
      return col
    }
    for (let j = 0; j < row.cols.length; j++) {
      const col = row.cols[j]
      if (col.rows && col.rows.length > 0) {
        return getColInRowsByKey(col.rows, key)
      }
    }
  }
  return null
}

export const getColInLayoutByKey = (layout, key) => {
  if (!Array.isArray(layout) || layout.length === 0) {
    return null
  }
  for (let i = 0; i < layout.length; i++) {
    const rows = layout[i].rows
    if (!Array.isArray(rows) || rows.length === 0) {
      return null
    }
    const col = getColInRowsByKey(rows, key)
    if (col) {
      return col
    }
  }
  return null
}

export const getColInBlockByKey = (block, key) => {
  return getColInRowsByKey(block.rows, key)
}

export const getKeysInRows = (rows, keys = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return keys
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!Array.isArray(row.cols) || row.cols.length === 0) {
      return keys
    }
    const cols = row.cols
    for (let j = 0; j < cols.length; j++) {
      const col = cols[j]
      if (col.rows && col.rows.length > 0) {
        return getKeysInRows(col.rows, keys)
      }
      if (col.key) {
        keys.push(col.key)
      }
    }
  }
  return keys
}

export const getColsInRows = (rows, hasKey = true) => {
  const cols = []
  if (!Array.isArray(rows) || rows.length === 0) {
    return cols
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!Array.isArray(row.cols) || row.cols.length === 0) {
      return cols
    }
    for (let j = 0; j < row.cols.length; j++) {
      const col = row.cols[j]
      if (col.rows && col.rows.length > 0) {
        return getColsInRows(col.rows, hasKey)
      }
      if (hasKey) {
        if (col && col.key !== undefined) {
          cols.push(col)
        }
      } else {
        if (col) {
          cols.push(col)
        }
      }
    }
  }
  return cols
}

// 获取块中所有的key值
export const getBlockKeys = block => {
  return getKeysInRows(block.rows)
}

// 获取块中所有的列值 hasKey 列是否包含key值 默认为是
export const getBlockCols = (block, hasKey = true) => {
  return getColsInRows(block.rows, hasKey)
}

export const formBlockForEach = (block, fn) => {
  getBlockCols(block).forEach(fn)
}

// 获取block中所有的label值,主要是用来计算高度
export const getBlockLabelWidth = block => {
  const cols = getBlockCols(block).map(col => {
    // TODO: 处理英文字符问题
    const labelLength = (col.label || '').length
    // 需要处理额外的 *
    if (col.rules && col.rules[0] && col.rules[0].required) {
      col._labelLength = labelLength + 1
    } else {
      col._labelLength = labelLength
    }
    return col
  })
  if (cols.length === 0) {
    return '64px'
  }
  const labelCol0 = maxBy(cols, col => col._labelLength) || {}
  const labelCol1 = maxBy(cols, col => (col.label || '').length) || {}
  const labelCol = maxBy([labelCol0, labelCol1], col => (col.label || '').length)
  if (!labelCol || !labelCol.label) {
    return '64px'
  }
  const label = labelCol.label
  const labelWidths = [0, 16, 28, 40, 52, 64]
  let width = labelWidths[label.length || 0] || 66
  if (labelCol.rules && labelCol.rules[0] && labelCol.rules[0].required) {
    width = Math.min(width + 2, 66)
  }
  return width + 'px'
}

// 获取块中的验证规则
export const getBlockRules = (block, hasKey = true) => {
  return getBlockCols(block, hasKey).reduce((rules, col) => {
    if (col.rules) {
      rules[col.key] = col.rules
    }
    return rules
  }, {})
}

// 获取layout中所有的key值
export const getLayoutKeys = layout => {
  return layout.reduce((keys, block) => {
    return keys.concat(getKeysInRows(block.rows))
  }, [])
}

// 获取layout中所有的列值 hasKey 列是否包含key值 默认为是
export const getLayoutCols = (layout, hasKey = true) => {
  return layout.reduce((keys, block) => {
    return keys.concat(getColsInRows(block.rows, hasKey))
  }, [])
}

// 获取layout中验证规则
export const getLayoutRules = (layout, hasKey = true) => {
  return layout.reduce((rules, block) => {
    Object.assign(rules, getBlockRules(block, hasKey))
    return rules
  }, {})
}

export const createModelByBlock = (block, keys = []) => {
  const cols = getBlockCols(block)
  const model = cols.reduce((model, col) => {
    if (col.key === '') {
      col.key = col.label
    }
    if (col.hasOwnProperty('defaultValue')) {
      model[col.key] = col.defaultValue
    } else {
      model[col.key] = ''
    }
    return model
  }, {})
  keys.forEach(key => (model[key] = ''))
  return model
}

export const createModelByBlocks = (blocks, keys = []) => {
  const cols = getLayoutCols(blocks)
  const model = cols.reduce((model, col) => {
    if (col.key === '') {
      col.key = col.label
    }
    if (col.hasOwnProperty('defaultValue')) {
      model[col.key] = col.defaultValue
    } else {
      model[col.key] = ''
    }
    return model
  }, {})
  keys.forEach(key => (model[key] = ''))
  return model
}

export const createModelByLayout = createModelByBlocks

export const fixedModelByLayout = (model, layout) => {
  const keys = getLayoutKeys(layout)
  keys.forEach(key => {
    if (!model.hasOwnProperty(key)) {
      model[key] = ''
    }
  })
  return model
}

/* grids */

// 获取单个网格中所有的key值
export const getGridKeys = grid => {
  const cols = grid.cols || []
  return cols.reduce((arr, col) => {
    if (col.key) {
      arr.push(col.key)
    }
    return arr
  }, [])
}

// 获取单个网格中所有的col
export const getGridCols = (grid = {}) => {
  return grid.cols || []
}

// 获取多个网格数组中所有的col
export const getGridsCols = (grids = []) => {
  if (grids && !Array.isArray(grids)) {
    grids = [grids]
  }
  return grids.reduce((arr, grid) => {
    if (grid.cols) {
      arr.push.apply(arr, grid.cols)
    }
    return arr
  }, [])
}

// 获取多个网格数组中所有的key
export const getGridsKeys = (grids = []) => {
  grids = { cols: getGridsCols(grids) }
  return getGridKeys(grids)
}

// 获取多个网格数组中的最大的label宽度
export const getGridsLabelWidth = (grids = []) => {
  const cols = getGridsCols(grids).map(col => {
    // TODO: 处理英文字符问题
    const labelLength = (col.label || '').length
    // 需要处理额外的 *
    if (col.rules && col.rules[0] && col.rules[0].required) {
      col._labelLength = labelLength + 1
    } else {
      col._labelLength = labelLength
    }
    return col
  })
  if (cols.length === 0) {
    return '64px'
  }
  const labelCol0 = maxBy(cols, col => col._labelLength) || {}
  const labelCol1 = maxBy(cols, col => (col.label || '').length) || {}
  const labelCol = maxBy([labelCol0, labelCol1], col => (col.label || '').length)
  if (!labelCol || !labelCol.label) {
    return '64px'
  }
  const label = labelCol.label
  const labelWidths = [0, 16, 28, 40, 52, 64]
  let width = labelWidths[label.length || 0] || 66
  if (labelCol.rules && labelCol.rules[0] && labelCol.rules[0].required) {
    width = Math.min(width + 2, 66)
  }
  return width + 'px'
}

// 获取单个网格数组中的最大的label宽度
export const getGridLabelWidth = grid => getGridsLabelWidth([grid])

// 通过单个grid创建model
export const createModelByGrid = (grid, keys = []) => {
  const cols = grid.cols || []
  const model = cols.reduce((model, col) => {
    if (col.key === '') {
      col.key = col.label
    }
    if (col.hasOwnProperty('defaultValue')) {
      model[col.key] = col.defaultValue
    } else {
      model[col.key] = ''
    }
    return model
  }, {})
  keys.forEach(key => (model[key] = ''))
  return model
}

// 通过多个grid创建model
export const createModelByGrids = (grids = [], keys = []) => {
  grids = { cols: getGridsCols(grids) }
  return createModelByGrid(grids, keys)
}

// 通过table-cols创建model
export const createModelByTableCols = (cols = [], usingId = false) => {
  return cols.reduce((model, col) => {
    if (col.key === '') {
      col.key = col.label
    }
    if (col.defaultValue) {
      set(model, col.key, col.defaultValue)
    } else {
      set(model, col.key, '')
    }
    if (usingId) {
      model._id = ID++
    }
    return model
  }, {})
}

// 修复缺失的字段
export const fixedModelByGrids = (model, grids) => {
  const keys = getGridsKeys(grids)
  keys.forEach(key => {
    if (!model.hasOwnProperty(key)) {
      model[key] = ''
    }
  })
  return model
}
