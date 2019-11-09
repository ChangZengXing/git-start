/**
 * Created by cy on 2018-05-11.
 * !deprecated(已废弃,请使用 @/public/utils/common  decrypt函数)
 */

import { MessageBox } from 'element-ui'
import { http } from '@/public/utils/http'
import { MODULECODE } from '@/fms/config'

// 查看监控字段 (电话,姓名)
export default async function getMonitoredFiled(
  { moduleCode = MODULECODE, fieldName, dataId, fieldContent } = {},
  callback
) {
  try {
    await MessageBox.confirm(window.__ERPGLOABLECONFIG__.maskTips, '提示', {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
      beforeClose: async (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '执行中...'
          try {
            // http:// 172.20.9.104/open-api/interface/974589000741359616
            // 注意: moduleCode 需要数据字典配置
            let res = await http('syslog.sensitiveFieldViewLog.save', {
              dataId,
              fieldName,
              fieldContent,
              moduleCode
            })
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '继续'
            done()
            callback(res)
          } catch (e) {
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '继续'
            console.warn(e)
          } finally {
            done()
          }
        } else {
          done()
        }
      }
    })
  } catch (err) {
    console.warn(err)
  }
}
