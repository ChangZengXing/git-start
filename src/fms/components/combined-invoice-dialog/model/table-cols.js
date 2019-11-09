// import { debounce } from 'lodash'

/**
 * Created by cy on 2018-06-05.
 */

let ID = 1

// cols用于两个tab页面中的表格 [0]表示月结tab [1]表示散客tab
const cols = vm => [
  [
    {
      label: '操作',
      slot: 'operation',
      align: 'center',
      tips: false,
      width: '90'
    },
    {
      label: '应收编码',
      key: 'billNumber',
      width: '140'
    },
    {
      key: 'paymentCustomerName',
      label: '公司名称',
      minWidth: '170'
    },
    {
      label: '纳入月份',
      key: 'inMonth',
      width: '100'
    },
    {
      label: '总金额',
      key: 'allAmount',
      filter: 'money',
      width: '130'
    },
    {
      label: '已开票金额',
      key: 'invoiceAmount',
      filter: 'money',
      width: '130'
    },
    {
      label: '未开票金额',
      key: 'unIvoiceAmountComputed',
      filter: 'money',
      width: '130'
    },
    {
      label: '开票金额',
      slot: 'invoiceUnAmount',
      tips: false,
      key: 'invoiceUnAmount',
      width: '170'
    }
  ],
  [
    {
      label: '操作',
      slot: 'operation',
      align: 'center',
      tips: false,
      width: '54'
    },
    {
      label: '运单号',
      key: 'waybillNumber',
      width: '130'
    },
    {
      label: '公司名称',
      key: 'paymentCustomerName',
      minWidth: '170'
    },
    {
      label: '纳入月份',
      key: 'inMonth',
      width: '100'
    },
    {
      label: '总金额',
      key: 'allAmount',
      filter: 'money',
      width: '130'
    },
    {
      label: '已开票金额',
      key: 'invoiceAmount',
      filter: 'money',
      width: '130'
    },
    {
      label: '未开票金额',
      key: 'unIvoiceAmountComputed',
      filter: 'money',
      width: '130'
    },
    {
      label: '开票金额',
      slot: 'invoiceUnAmount',
      key: 'invoiceUnAmount',
      sortable: 'custom',
      // sortMethod: () => {},
      // sortMethod: (() => {
      //   var timeId = null
      //   return function () {
      //   if (timeId) {
      //     clearTimeout(timeId)
      //   }
      //   timeId = setTimeout(() => {
      //     vm.tableRows[1].sort((a, b) => {
      //           return a.invoiceUnAmount - b.invoiceUnAmount
      //         })
      //         debugger
      //     vm.getPersonRows()
      //   }, 1000)
      // }
      // })(),
      tips: false,
      width: '170'
    }
  ]
]

export const createRowModel = type => {
  return cols()[type].reduce((acc, cur) => {
    if (cur.key) {
      // 注意: 这里使用默认的undefined 会促使 el-table重用之前的dom实例
      // acc[cur.key] = undefined
      acc[cur.key] = cur.defaultValue || ''
      acc['_id'] = ID++
    }
    return acc
  }, {})
}

export default cols
