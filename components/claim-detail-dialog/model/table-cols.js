/**
 * Created yaokangsong cy on 2018-07-04.
 */

export default function tableCols (vm) {
  const cols = [
    {
      label: '收款编码',
      key: 'invoiceNo',
      slot: 'invoiceNo'
    },
    {
      label: '收款类型',
      key: 'receiveType',
      lookupCode: 'fms_receive_type'
    },
    {
      label: '收款日期',
      key: 'receiveDate',
      filter: 'date'
    },
    {
      label: '客户',
      key: 'payCompanyName'
    },
    {
      label: '收款金额',
      key: 'receiveAmount'
    },
    {
      label: '录单人员',
      key: 'createId',
      filter: (val) => {
        if (val === '-1' || val === -1) {
          return '系统'
        } else {
          return val
        }
      }
    },
    {
      label: '录单时间',
      key: 'createDate',
      filter: 'minute'
    }
  ]
  return cols
}
