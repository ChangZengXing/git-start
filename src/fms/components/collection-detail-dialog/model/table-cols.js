/**
 * Created by cy on 2018-07-04.
 */

export default function tableCols(vm) {
  const cols = [
    {
      label: '来源单号',
      key: 'receviceCode',
      width: '145'
    },
    {
      label: '收款日期',
      key: 'receiveDate',
      filter: 'date',
      width: '80'
    },
    {
      label: '收款方式',
      key: 'method',
      lookupCode: 'fms_receive_method',
      width: '80'
    },
    {
      label: '收款金额',
      filter: 'money',
      key: 'receiveAmount',
      width: '110'
    },
    {
      label: '数据来源',
      key: 'source',
      // ? 产品确认只有收款单和垫付款
      // 1: 资金流水 2:移动收款 3:手动新增 4: 收款单
      lookupCode: 'fms_receive_data_source',
      width: '80'
    },
    {
      label: '交易流水号',
      key: 'transNo',
      width: '180'
    },
    {
      label: '客户名称',
      key: 'payCompanyName',
      minWidth: '170'
    }
  ]
  return cols
}
