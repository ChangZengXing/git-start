/**
 * Created by cy on 2018-11-01.
 */

import formBlock from '../model/form-block'
import tableCols from '../model/table-cols'
import { createModelByBlock } from '@/fms/utils'
import APICommon from '@/fms/api/common'

export default {
  data() {
    const _tableCols = tableCols(this)
    const _formBlock = formBlock(this)
    const _formModel = createModelByBlock(_formBlock)
    return {
      model: {},
      page: {
        total: 0,
        pageSize: 200,
        currentPage: 1
      },
      APICommon,
      loading: false,
      dialogParams: {},
      fmsDialogOptions: {
        title: '合并开票',
        submitCall: this.dialogSubmit,
        cancelCall: this.fmsDialogClose
      },
      formBlock: _formBlock,
      formModel: _formModel,
      tableCols: _tableCols,
      types: {
        index: true
      },
      tableRows: {
        '0': [],
        '1': []
      },
      personRows: [],
      // 代垫款是否已包含在返回的开票总金额中 默认是包含在后端返回的开票总金额中的
      cushionFlag: true,
      // 爬楼费是否已包含在返回的开票总金额中 默认是包含在后端返回的开票总金额中的
      climbingFlag: true,
      // '0' 月结 '1' 散客
      tabType: '0',
      // 开票类型  '0' 月结 '1' 散客
      invoiceType: '0',
      refs: {},
      maskField: {
        deductionCompanyName: '',
        'invoiceAddress-address': '',
        'invoiceAddress-invoiceSendee': '',
        'invoiceAddress-invoiceTel': ''
      }
    }
  }
}
