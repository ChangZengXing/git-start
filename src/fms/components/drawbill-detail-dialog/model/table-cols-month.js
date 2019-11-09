/**
 * Created by cy on 2018-12-17.
 */

export default function tableCols() {
  const cols = [
    {
      label: '发票号码',
      key: 'invoiceNumber',
      width: '130'
    },
    {
      label: '开票日期',
      key: 'invoiceDate',
      filter: 'date',
      width: '80'
    },
    {
      label: '发票类型',
      key: 'invoiceForm',
      lookupCode: 'crm_invoice_type',
      width: '110'
    },
    {
      label: '开票金额',
      key: 'invoiceAmount',
      filter: 'money',
      width: '120'
    },
    {
      label: '客户名称',
      key: 'companyName',
      minWidth: '150'
    },
    {
      label: '标识公司',
      key: 'identificationCompany',
      minWidth: '150'
    }
  ]
  return cols
}
