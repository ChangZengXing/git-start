/**
 * Created by cy on 2018-11-01.
 */

import { curDay } from '@/fms/utils'

export default {
  watch: {
    formModel(val) {
      // 开票日期需默认为当前日期
      if (!this.formModel['invoiceDate']) {
        this.formModel['invoiceDate'] = curDay()
      }
    }
  }
}
