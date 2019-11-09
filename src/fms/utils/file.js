/**
 * Created by cy on 2018-07-20.
 */

import { BIZCODE } from '@/fms/config'
import { http } from '@/public/utils/http'

// 根据文件ID获取文件信息
export function getFileById(id, showErrMsg) {
  return http('file.get', { id }, showErrMsg)
}

// 根据多个文件ID删除文件
export function delFilesByIds(id, showErrMsg) {
  const ids = Array.isArray(id) ? id : [id]
  return http('file.deleteByIds', { ids }, showErrMsg)
}

// 根据业务编码和单个业务ID获取文件列表 业务编码使用默认值
export function getFilesByBizId(bizId, bizCode = BIZCODE, showErrMsg) {
  return http('file.getByBizCodeAndBizId', { bizId, bizCode }, showErrMsg)
}

// 根据业务编码和多个业务ID获取文件列表
export function getFilesByBizIds(bizIds, bizCode = BIZCODE, showErrMsg) {
  return http('file.getByBizCodeAndBizIds', { bizIds, bizCode }, showErrMsg)
}

// 根据业务编码和业务ID删除文件 业务编码使用默认值
export function delFilesByBizId(bizId, bizCode = BIZCODE, showErrMsg) {
  return http('file.deleteByBizCodeAndBizId', { bizId, bizCode }, showErrMsg)
}

// bizId: '150744188491200768_0', '150744188491200768_1'
// 0: 表示该bizid无关联文件, 1: 表示该bizid有关联文件
export function parseBizId(bizId) {
  if (!bizId) return [bizId, '0']

  const arr = bizId.split('_')

  if (arr.length === 2 && (arr[1] === '0' || arr[1] === '1')) {
    return arr
  }

  // 默认为有关联图片
  return [bizId, '1']
}

export function setBizId(bizId, code) {
  const [_bizId] = parseBizId(bizId)
  return code === undefined ? _bizId : _bizId + '_' + code
}

// 页面得到uuid
export function getId() {
  return http('system.idcenter.get')
}
export const file = {
  get: getFileById,
  del: delFilesByIds
}

export default {
  get: getFileById,
  del: delFilesByIds
}
