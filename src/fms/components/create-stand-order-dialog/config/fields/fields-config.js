/*
 * @fileOverview: 字段配置
 * @author: xuzengqiang
 * @date: 2018-05-24 20:21:09
 */
export default vm => {
  return [
    {
      label: '委托单编号',
      disabled: true,
      key: 'entrustNumber'
    },
    {
      label: '委托方',
      disabled: true,
      key: 'entrustName'
    },
    {
      label: '受托方',
      disabled: true,
      key: 'reverseEntrustName'
    },
    {
      label: '委托日期',
      disabled: true,
      filter: 'date',
      key: 'entrustDate'
    },
    {
      label: '收款单编码',
      key: 'otherIncomeNumber',
      listeners: {
        blur: vm.otherIncomeBlurHandle
      }
    },
    {
      label: '银行流水号',
      disabled: true,
      key: 'bankFlowNumber'
    },
    {
      label: '委托金额',
      key: 'entrustAmount',
      type: 'money'
    },
    {
      label: '发票号码',
      disabled: true,
      key: 'invoiceNumber'
    },
    {
      label: '开票日期',
      disabled: true,
      type: 'datePicker',
      dateType: 'date',
      valueFormat: 'yyyy-MM-dd',
      filter: 'date',
      key: 'invoiceDate'
    },
    {
      label: '受托方户名',
      disabled: true,
      key: 'entrustBankAccountName'
    },
    {
      label: '受托方账号',
      disabled: true,
      key: 'entrustBankName'
    },
    {
      label: '发票金额',
      key: 'invoiceAmount',
      type: 'money'
    },
    {
      label: '录单人员',
      disabled: true,
      key: 'createdBy'
    },
    {
      label: '录单时间',
      disabled: true,
      type: 'datePicker',
      dateType: 'datetime',
      valueFormat: 'yyyy-MM-dd HH:mm',
      filter: 'minute',
      key: 'creationDate'
    },
    {
      label: '数据来源',
      disabled: true,
      key: 'dataSource'
    },
    {
      label: '备注',
      column: 4,
      rows: 2,
      type: 'textarea',
      key: 'remark'
    }
  ]
}
