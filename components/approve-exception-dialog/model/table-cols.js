/**
 * Created by cy on 2018-07-20.
 */

export default function tableCols(vm, type) {
  const types = {
    monthly: {
      label: '应收编码',
      key: 'billMonthly.billNumber',
      width: '140',
      sortable: true
    },
    personally: {
      label: '运单号',
      key: 'billPerson.waybillNumber',
      width: '100',
      sortable: true
    }
  }
  const cols = [
    types[type],
    {
      label: '付款公司',
      key: 'paymentCustomerName',
      minWidth: '85'
    },
    {
      label: '纳入月份',
      key: 'inMonth',
      width: '65'
    },
    {
      label: '公司应收',
      key: 'billReceivables.netReceiptsAmount',
      filter: 'money',
      width: '80'
    },
    {
      label: '已收运费',
      key: 'billReceivables.feeAmount',
      filter: 'money',
      width: '80'
    },
    {
      label: '另补税点',
      key: 'billReceivables.repairTaxRate',
      width: '63'
    },
    {
      label: '允许异常',
      key: 'billReceivables.exceptionAmount',
      filter: 'money',
      width: '85',
      sortable: true,
      sortMethod: (a, b) => {
        return a['billReceivables']['exceptionAmount'] - b['billReceivables']['exceptionAmount']
      }
    },
    {
      label: '异常备注',
      key: 'billReceivables.exceptionRemark',
      width: '85',
      sortable: true
    },
    {
      label: '上交时间',
      key: 'billReceivables.handInDate',
      filter: 'minute',
      width: '115',
      sortable: true
    },
    {
      label: '上交人员',
      key: 'billReceivables.handInPerson',
      width: '65'
    },
    {
      label: '异常有无审核',
      key: 'exceptionStatus',
      lookupCode: 'fms_exception_status',
      width: '85'
    },
    {
      label: '销售经理',
      key: 'marketName',
      width: '65'
    },
    {
      label: '销售助理',
      key: 'assistantName',
      width: '65'
    },
    {
      label: '收款日期',
      key: 'billReceivables.payDate',
      filter: 'date',
      width: '80'
    }
  ]
  return cols
}
