/**
 * Created by cy on 2018-07-20.
 */

import tableCols from './table-cols'

export default {
  // 财务审单-市场备注
  'financial-review-remark': {
    'market': (dialogParams) => ({
      key: '',
      tableCols: tableCols(),
      actions: {
        add: (financeApproveId, content) => ({
          title: '市场备注新增',
          args: [
            'fms.approve.remarkInfo.saveMarketRemark',
            { financeApproveId, content }
          ]
        }),
        modify: (id, financeApproveId, content) => ({
          title: '市场备注修改',
          args: [
            'fms.approve.remarkInfo.saveMarketRemark',
            { financeApproveId, content, id }
          ]
        })
      }
    })
  }
}
