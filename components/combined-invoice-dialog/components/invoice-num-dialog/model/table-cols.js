/**
 * Created by cy on 2018-07-11.
 */

export default [
  {
    label: '运单号',
    key: 'billPerson.waybillNumber',
    width: '120'
  },
  {
    label: '付款公司',
    key: 'paymentCustomerName',
    minWidth: '150'
  },
  {
    label: '纳入月份',
    key: 'inMonth',
    width: '75'
  },
  {
    label: '总金额',
    key: 'allAmount',
    filter: 'money',
    width: '110'
  },
  {
    label: '已开票金额',
    key: 'invoiceAmount',
    filter: 'money',
    width: '110'
  },
  {
    label: '未开票金额',
    key: 'unIvoiceAmountComputed',
    filter: 'money',
    width: '110'
  },
  {
    label: '开票金额',
    key: 'invoiceUnAmount',
    filter: 'money',
    width: '110'
  },
  {
    label: '寄件时间',
    key: 'shippingDate',
    filter: 'minute',
    minWidth: '115'
  }
]
