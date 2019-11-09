/**
 * Created by cy on 2018-05-21.
 */

import { curDay, toNumber } from '@/fms/utils'
// import pattern from '@/public/utils/pattern'

export default function formBlock(vm, type) {
  const block = {
    gutter: 8,
    type: 'modify',
    rows: [
      {
        cols: [
          {
            label: '购方全称',
            key: 'deductionCompanyName',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '购方识别号',
            key: 'deductionTaxNumber',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '购方区域',
            key: 'deductionCompanyArea',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true },
            lookupCode: 'crm_deduction_company_area'
          },
          {
            label: '销方公司',
            key: 'identificationCompany',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true }
          }
        ]
      },
      {
        cols: [
          {
            label: '开户行账户',
            key: 'bankName',
            span: 12,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '地址,电话',
            key: 'companyAddress',
            span: 12,
            component: 'kye-input',
            componentProps: { disabled: true }
          }
        ]
      },
      {
        cols: [
          {
            label: '差额备注',
            key: 'balanceRemark',
            span: 12,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入差额备注' }
          },
          {
            label: '内部备注',
            key: 'insideRemark',
            span: 12,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入内部备注' }
          }
        ]
      },
      {
        cols: [
          {
            label: '发票备注',
            key: 'remark',
            span: 12,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入发票备注', maxlength: 240 }
          },
          {
            label: '发票寄件地',
            key: 'invoiceAddress-address',
            span: 12,
            component: 'kye-input',
            componentProps: { disabled: true }
          }
        ]
      },
      {
        cols: [
          {
            label: '付款方式',
            key: 'payMethod',
            span: 6,
            component: 'kye-field',
            lookupCode: 'crm_finance_pay_mode'
          },
          {
            label: '企业类型',
            key: 'companyType',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true },
            lookupCode: 'crm_invoice_company_type'
          },
          {
            label: '开票区域',
            key: 'invoiceArea',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true },
            lookupCode: 'crm_invoice_area_name'
          },
          {
            label: '发票类型',
            key: 'invoiceForm',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true },
            lookupCode: 'crm_invoice_type'
          }
        ]
      },
      {
        cols: [
          {
            label: '发票种类',
            key: 'invoiceType',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true },
            lookupCode: 'fms_invoice_type'
            // options: items => items.map(it => it.value.replace())
          },
          {
            label: '接收人',
            key: 'invoiceAddress-invoiceSendee',
            span: 6,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入接收人' }
          },
          {
            label: '接收电话',
            key: 'invoiceAddress-invoiceTel',
            span: 6,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入接收电话' },
            rules: [
              {
                required: false,
                validator: (rule, value, callback) => {
                  // 接收电话可以为空
                  // if (value.trim() && !pattern.telPhone.test(value)) {
                  //   vm.$message.warning('请输入正确的手机号码/座机号码(区号-直播号码)!')
                  //   return callback(new Error(' '))
                  // }
                  callback()
                },
                trigger: 'none'
              }
            ]
          },
          {
            label: '开票日期',
            key: 'invoiceDate',
            span: 6,
            component: 'kye-date-picker',
            defaultValue: curDay(),
            componentProps: {
              type: 'date',
              editable: false,
              clearable: false,
              placeholder: '开票日期'
            },
            filter: 'date'
          }
        ]
      },
      {
        cols: [
          {
            label: '销售经理',
            key: 'marketFullName',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '开票名称',
            key: 'invoiceProductName',
            span: 6,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '数量',
            key: 'quantity',
            span: 6,
            component: 'kye-number',
            componentProps: {
              min: 0,
              precision: 0,
              clearable: true,
              placeholder: '请输入数量'
            }
          },
          {
            label: '单位',
            key: 'unit',
            span: 6,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入单位' }
          }
        ]
      },
      {
        cols: [
          {
            label: '开票金额',
            key: 'invoiceAmount',
            span: 6,
            component: 'kye-field',
            filter: 'money'
          },
          {
            label: '税率',
            key: 'taxRate',
            span: 6,
            component: 'kye-number',
            componentProps: {
              min: 0,
              unit: '%',
              symbol: '',
              precision: 2,
              disabled: true,
              placeholder: '12312'
            },
            filter: val => toNumber(val, 0) * 100
          },
          {
            label: '税金',
            key: 'taxAmount',
            span: 6,
            component: 'kye-field',
            filter: 'money'
          },
          {
            label: '另补税金',
            key: 'repairTaxAmount',
            span: 6,
            component: 'kye-field',
            filter: 'money'
          }
        ]
      },
      {
        cols: [
          {
            label: '不含税金额',
            key: 'exclusiveTaxAmount',
            span: 6,
            component: 'kye-field',
            filter: 'money'
          },
          {
            label: '费用项目',
            key: 'costProject',
            span: 6,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入费用项目' }
          }
        ]
      }
    ]
  }
  return block
}
