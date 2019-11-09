/**
 * Created by cy on 2018-07-04.
 */

export default function tableCols(vm) {
  const cols = [
    {
      key: 'waybillNumber',
      label: '运单号',
      width: 150,
      show: true
    },
    {
      key: 'paymentCustomerName',
      label: '付款公司',
      width: 130,
      show: true,
      sortKeys: ['paymentCustomerName', 'payment_customer_name']
    },
    {
      key: 'pickupTime',
      label: '寄件时间',
      minWidth: 150,
      show: true,
      filter: 'minute',
      sortKeys: ['pickupTime', 'pickup_time']
    },
    {
      key: 'signDate',
      label: '签收时间',
      minWidth: 130,
      show: true,
      filter: 'minute',
      sortKeys: ['signDate', 'sign_date']
    },
    {
      key: 'deductMoneyAmount',
      label: '代收货款',
      width: 130,
      slot: 'deductMoneyAmount'
    }
  ]
  return cols
}
