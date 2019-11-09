/**
 * @fileoverview 预录运单服务层
 * @author xuzengqiang
 * @date 2018-09-01 15:44:39
 */
import { http } from '@/public/utils/http'

class PrewaybillService {
  /**
   * 获取运单号
   * @since 1.0.0
   */
  static async getNumber () {
    let number = ''
    try {
      number = await http('oms.prewaybill.genWaybillNumber')
    } catch (e) {
      console.error(e)
    }
    return number
  }
}

export default PrewaybillService
