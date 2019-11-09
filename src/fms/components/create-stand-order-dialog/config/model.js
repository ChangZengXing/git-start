/*
 * @fileOverview: 委托单model
 * @author: xuzengqiang
 * @date: 2018-05-24 20:40:56
 *
 * @update xuzengqiang
 * @date 2018-06-23 14:49:15
 * @version 1.0.1
 * @description
 * 1、优化代码,通过fetchLayoutModel自动提取model
 */

/**
 * 1、删除协议日期，协议时间和本地仓三个字段
 * 2、发票管理，公司名称、客户编码、付款方式、纳入月份、销售经理、运单号、开票区域、抵扣公司修改为不可编辑
 */
import fetchLayoutModel from '@/fms/utils/framework/fetch-layout-model'
import layout from './layout'

export default vm => {
  return {
    // 开票金额
    invoiceAmount: '',
    ...fetchLayoutModel(layout(vm))
  }
}
