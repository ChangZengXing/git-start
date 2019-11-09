/**
 * Created by cy on 2018-07-11.
 */

export default [
  {
    label: '抵扣方公司全称',
    key: 'deductionCompanyName',
    minWidth: '135'
  },
  {
    label: '购方识别号',
    key: 'deductionTaxNumber',
    width: '145'
  },
  {
    label: '开户行,账号',
    key: 'bankName',
    minWidth: '135'
  },
  {
    label: '地址,电话',
    key: 'companyAddress',
    width: '150'
  },
  {
    label: '开票区域',
    key: 'invoiceArea',
    width: '100',
    lookupCode: 'crm_invoice_area_name'
  },
  {
    label: '发票类型',
    key: 'invoiceForm',
    width: '110',
    lookupCode: 'crm_invoice_type'
  },
  {
    label: '购方区域',
    key: 'deductionCompanyArea',
    width: '80',
    lookupCode: 'crm_deduction_company_area'
  },
  {
    label: '发票寄件地',
    key: 'invoiceAddress.address',
    width: '130'
  },
  {
    label: '接收人',
    key: 'invoiceAddress.invoiceSendee',
    width: '65'
  },
  {
    label: '接收电话',
    key: 'invoiceAddress.invoiceTel',
    width: '100'
  },
  {
    label: '销售经理',
    key: 'marketFullName',
    width: '70'
  },
  {
    label: '发票备注',
    key: 'remark',
    minWidth: '100'
  },
  {
    label: '销方公司',
    key: 'identificationCompany',
    width: '100'
  },
  {
    label: '内部备注',
    key: 'insideRemark',
    minWidth: '110'
  }
]
