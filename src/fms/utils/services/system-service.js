/**
 * @fileoverview:获取id信息
 * @author: xuzengqiang
 * @date: 2018-06-25 14:21:47
 * @version 1.0.0
 */
import { http } from '@/public/utils/http'

class SystemService {
  /**
   * 获取id
   * @date 2018-08-20 10:23:40
   * @since 1.0.0
   */
  static async getId () {
    let id = ''
    try {
      id = await http('system.idcenter.get')
    } catch (e) {
      console.error(e)
    }
    return id
  }
}

export default SystemService
