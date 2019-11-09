/**
 * Created by cy on 2018-12-12.
 */

import { http } from '@/public/utils/http'
import { dp, up, getMenu } from '@/fms/utils'
import { trim, isEmpty, toString } from 'lodash'
import { PAGINATION } from '@/public/config/index'

// 1:降序 0: 升顺
const ORDER_MAP = { ascending: 0, descending: 1 }

// 缓存generic
let genericCache = null

// 获取通用查询配置
export const getGenericBySearchCodeAsync = async searchCode => {
  const menuId = getMenu().id
  if (!menuId) {
    return {}
  }
  const res = await http('system.genericSearch.listByMenuId', { menuId })
  if (!res || res.length === 0) {
    return {}
  }
  return res.find(it => it.searchCode === searchCode) || {}
}

export const loadGenericAsync = async ({ searchCode, queryCode, columnCode }) => {
  const menuId = getMenu().id
  const generic = {
    query: {},
    search: {},
    column: {}
  }
  if (!menuId) {
    return generic
  }
  if (!searchCode && !queryCode && !columnCode) {
    return generic
  }
  const res = await http('system.genericSearch.listByMenuId', { menuId })
  if (!res || res.length === 0) {
    return generic
  }
  generic.query = res.find(it => it.searchCode === queryCode) || {}
  generic.search = res.find(it => it.searchCode === searchCode) || {}
  generic.column = res.find(it => it.searchCode === columnCode) || {}
  console.log('[fms:loadGenericAsync]', menuId, generic)
  return generic
}

export const getFmsTableCols = fieldContent => {
  let cols = []
  if (!fieldContent) {
    return cols
  }
  try {
    cols = JSON.parse(fieldContent).map(it => {
      const col = up({}, it, ['key', 'label', 'width', 'show'])
      if (typeof it.filter === 'string') {
        col.filter = it.filter
      }
      if (typeof it.filter === 'object') {
        if (it.filter.typeof === 'lookup') {
          it.lookupCode = it.filter.args[0]
        }
      }
      if (it.lookupCode) {
        col.lookupCode = it.lookupCode
      }
      return col
    })
  } catch (e) {
    console.error(e)
  }
  return cols
}

// 获取配置的自定义查询
export const getGenericQuery = fieldContent => {
  let query = []
  if (!fieldContent) {
    return query
  }
  try {
    query = JSON.parse(fieldContent)
      .reduce((arr, cur) => {
        if (cur.type === 'menu' && cur.options) {
          cur.options.forEach(it => arr.push(it))
        } else {
          arr.push(cur)
        }
        return arr
      }, [])
      .map(it => {
        return up({}, it, ['propertyName', 'columnName', 'columnType', 'operation', 'label'])
      })
  } catch (e) {
    console.error(e)
  }
  return query
}

export const getGenericAsync = async ({ searchCode, queryCode, columnCode }) => {
  const res = await loadGenericAsync({ searchCode, queryCode, columnCode })
  // 获取表格配置列(自定义列)
  const cols = getFmsTableCols(res.column.fieldContent)
  // 获取查询条件(自定义查询)
  const query = getGenericQuery(res.query.fieldContent)

  let esFlag = 'N'
  // 优先以通用查询配置的esFlag为准
  if (res.search.esFlag !== undefined) {
    esFlag = res.search.esFlag === '10' ? 'Y' : 'N'
  } else if (res.query.esFlag !== undefined) {
    // 其次以自定义查询配置的esFlag为准
    esFlag = res.query.esFlag === '10' ? 'Y' : 'N'
  } else if (res.column.esFlag !== undefined) {
    // 最后以自定义列配置的esFlag为准
    esFlag = res.column.esFlag === '10' ? 'Y' : 'N'
  }

  return {
    cols,
    query,
    esFlag,
    // 数据字典：(system_genericsearch_es_flag)（10:支持，20:不支持）
    elasticsearchFlag: esFlag
  }
}

export const getGenericEsFlagAsync = async searchCode => {
  let esflag = 'N'
  try {
    // 这里这么操作是基于全局已有的缓存策略,
    // 该请求不需要再进行缓存标识设置
    const genericSearch = (await getGenericBySearchCodeAsync(searchCode)) || {}
    console.log('[fms:getGenericEsFlagAsync genericSearch]', genericSearch)
    if (genericSearch.esFlag) {
      // esFlag 是否支持ES查询(10支持，20不支持) 数据字典：(system_genericsearch_es_flag)（10:支持，20:不支持）
      esflag = toString(genericSearch.esFlag) === '10' ? 'Y' : 'N'
    }
  } catch (e) {
    console.error('[fms:getGenericEsFlagAsync genericSearch]', e)
  }
  return esflag
}

export const setGenericEsFlagAsync = async (req, searchCode) => {
  if (searchCode) {
    req = dp(req)
    req.elasticsearchFlag = 'N'
    req.genericSearchCode = searchCode
    try {
      // 这里这么操作是基于全局已有的缓存策略,
      // 该请求不需要再进行缓存标识设置
      const genericSearch = (await getGenericBySearchCodeAsync(searchCode)) || {}
      console.log('[fms:setGenericEsFlagAsync genericSearch]', genericSearch)
      if (genericSearch.esFlag) {
        // esFlag 是否支持ES查询(10支持，20不支持) 数据字典：(system_genericsearch_es_flag)（10:支持，20:不支持）
        req.elasticsearchFlag = toString(genericSearch.esFlag) === '10' ? 'Y' : 'N'
      }
      // 带上menuId 后端需要menuId处理数据权限以及索引相关
      if (!req.menuId && genericSearch.menuId) {
        req.menuId = genericSearch.menuId
      }
    } catch (e) {
      console.error('[fms:setGenericEsFlagAsync genericSearch]', e)
      // 查询出错,默认直接走数据库查询
      req.elasticsearchFlag = 'N'
    }
  }
  return req
}

export function createGenericArgsVos(queryConfig, formModel, { queryBack, delimiter = '-' } = {}) {
  if (isEmpty(queryConfig) || isEmpty(formModel)) {
    return []
  }
  if (isEmpty(queryConfig) && !isEmpty(formModel) && !isEmpty(queryBack)) {
    if (!Array.isArray(queryBack)) {
      queryBack = [queryBack]
    }
    queryConfig = queryBack
  }

  if (!Array.isArray(queryConfig)) {
    queryConfig = [queryConfig]
  }

  let vos = queryConfig.map(
    ({
      propertyName,
      columnName,
      columnType: type = 'string',
      operation = 'equal',
      conditionOperation = 'and'
    }) => {
      const value = formModel[propertyName.replace(/\./g, delimiter)]
      const vo = {
        type,
        operation,
        columnName,
        propertyName,
        frontBrackets: '(',
        postBrackets: ')',
        conditionOperation,
        values: trim(value) ? [].concat(value) : []
      }
      return vo
    }
  )

  // 过掉空值的查询条件
  vos = vos.filter(vo => vo.values.length > 0)

  // 最后一个需要conditionOperation为空
  if (vos.length > 0) {
    vos[vos.length - 1].conditionOperation = ''
  }

  return vos
}

export function udpateGenericArgsVos(genericArgs, formModel) {
  if (!genericCache) {
    return genericArgs
  }
  const { query } = genericCache
  if (genericArgs.generic) {
    genericArgs.generic.vos = createGenericArgsVos(query, formModel)
  }
  return genericArgs
}

export function updateGenericArgsPage(genericArgs, page, pageSize) {
  pageSize = pageSize || PAGINATION.pageSize || PAGINATION.pageSizes[0] || 20
  // 处理分页
  if (typeof page === 'object') {
    genericArgs.page = page.page || page.currentPage
    genericArgs.pageSize = page.pageSize || pageSize
  }
  if (typeof page === 'number') {
    // 如page传入的不是对象,就用传入的值
    genericArgs.page = page
    genericArgs.pageSize = pageSize
  }
  return genericArgs
}

// 创建通用查询参数
export function createGenericArgs(
  queryConfig,
  formModel,
  {
    esFlag,
    vo = {},
    page = 1,
    defaultSort,
    queryBack = [],
    delimiter = '-',
    genericSearchCode,
    elasticsearchFlag = 'N',
    pageSize = PAGINATION.pageSize || PAGINATION.pageSizes[0] || 20
  } = {}
) {
  const _esFlag = esFlag || elasticsearchFlag
  const args = {
    elasticsearchFlag: _esFlag,
    genericSearchCode,
    generic: { vos: [] },
    vo
  }

  // 处理排序 注意处理数据库排序字段和es排序字段问题
  if (defaultSort) {
    const { prop, order, columnName } = defaultSort
    const field = _esFlag === 'Y' ? prop : columnName
    args.orderByClauses = [{ field, orderByMode: ORDER_MAP[order] }]
  }

  // false表示不需要分页
  if (queryConfig === false) {
    return args
  }

  if ((isEmpty(queryConfig) && isEmpty(queryBack)) || isEmpty(formModel)) {
    args.page = 1
    args.pageSize = pageSize
    return args
  }

  // 处理分页
  updateGenericArgsPage(args, page, pageSize)

  // 处理vos
  args.generic.vos = createGenericArgsVos(queryConfig, formModel, { queryBack, delimiter })

  return args
}

export const initGenericAsync = async ({
  page,
  esFlag,
  formModel,
  queryBack,
  queryCode,
  searchCode,
  columnCode,
  defaultSort
}) => {
  genericCache = null
  const { cols, query, elasticsearchFlag } = await getGenericAsync({
    queryCode,
    searchCode,
    columnCode
  })
  genericCache = {
    cols,
    query,
    esFlag: esFlag || elasticsearchFlag,
    elasticsearchFlag: esFlag || elasticsearchFlag,
    genericSearchCode: searchCode,
    args: createGenericArgs(query, formModel, {
      page,
      queryBack,
      defaultSort,
      elasticsearchFlag: esFlag || elasticsearchFlag,
      genericSearchCode: searchCode
    })
  }
  return genericCache
}

export const initGenericArgs = (generic, formModel, opts = {}) => {
  const { query, esFlag, elasticsearchFlag, genericSearchCode } = generic
  if (esFlag || elasticsearchFlag) {
    opts.elasticsearchFlag = esFlag || elasticsearchFlag
  }
  if (genericSearchCode) {
    opts.genericSearchCode = genericSearchCode
  }
  return createGenericArgs(query, formModel, opts)
}

export const updateGenericArgs = (genericArgs, formModel, { page, pageSize }) => {
  if (!genericCache) {
    return genericArgs
  }
  udpateGenericArgsVos(genericArgs, formModel)
  updateGenericArgsPage(genericArgs, page, pageSize)
  return genericArgs
}

export const updateGenericArgsSort = (genericArgs, sort) => {
  const field = genericArgs.elasticsearchFlag === 'Y' ? sort.prop : sort.columnName
  genericArgs.orderByClauses = [{ field, orderByMode: ORDER_MAP[sort.order] }]
}

// 更新通用查询排序
updateGenericArgs.sort = updateGenericArgsSort

export function createFormModel(queryConfig) {
  return queryConfig.reduce((model, it) => {
    model[it.propertyName] = it.defaultValue || ''
    return model
  }, {})
}
