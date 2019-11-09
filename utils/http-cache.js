/**
 * Created by cy on 2018-12-05.
 */

import { http } from '@/public/utils/http'
import { dp, getMenu, setGenericEsFlagAsync } from '@/fms/utils'

// 设置缓存标识
export const cacheFlag = (req, cache = true) => {
  const menuId = getMenu().id
  req = dp(req)
  // 设置模块id
  if (!req.menuId && menuId) {
    req.menuId = menuId
  }
  // 设置响应后的缓存标识
  req.ERPSearchCacheFlag = true
  if (!cache) {
    // 设置请求前是否删除缓存,从而读取最新数据
    req.forceCache = true
  } else {
    // 读取缓存
    delete req.forceCache
  }
  return req
}

// 缓存请求
export const cacheHttp = async (method, req, cache = true) => {
  let opt, searchCode
  if (typeof cache === 'object') {
    opt = cache.opt
    searchCode = cache.searchCode
    cache = cache.cache
  }
  req = cacheFlag(req, cache)
  if (searchCode) {
    req = await setGenericEsFlagAsync(req, searchCode)
  }
  return http(method, req, opt)
}

// 缓存下一页请求(用于分页缓存)
export const cacheHttpNext = (method, req, cache = true, pageOffset = 0) => {
  let opt
  let _cache = cache
  if (typeof cache === 'object') {
    opt = cache.opt
    _cache = cache.cache
  }
  req = cacheFlag(req, _cache)
  const res = cacheHttp(method, req, cache)
  res.then(data => {
    let { page, pageTotal } = data
    // 兼容后端返回page从0开始 from @姚康松-融资管理
    page = page + pageOffset
    if (pageTotal > 1 && page < pageTotal && req.page === page) {
      // TODO 这里拷贝是否多余?
      req = dp(req)
      req.page = req.page + 1
      http(method, req, opt)
    }
  })
  return res
}
