/**
 * @fileoverview 打印公共方法
 * @author xuzengqiang
 * @date 2018-09-06 11:44:36
 */

import getLodop from '@/public/utils/lodop-funcs'

/**
 * 获取打印机列表
 * @author xuzengqiang
 * @date 2018-09-06 11:47:06
 * @since 1.0.0
 */

export const getPrinterList = () => {
  const printerList = []
  try {
    const LODOP = getLodop()
    if (LODOP && typeof LODOP.GET_PRINTER_COUNT === 'function') {
      const printerCount = LODOP.GET_PRINTER_COUNT()
      for (var i = 0; i < printerCount; i++) {
        printerList.push({
          value: LODOP.GET_PRINTER_NAME(i),
          label: LODOP.GET_PRINTER_NAME(i)
        })
      }
    }
    return printerList
  } catch (e) {
    console.error(e)
    return printerList
  }
}
