/**
 * Created by cy on 2018-09-10.
 */

import { curDay } from '@/fms/utils'

export default function formBlock (vm) {
  const block = {
    gutter: 8,
    rows: [
      {
        cols: [
          {
            label: '发票号码',
            key: 'invoiceNumber',
            span: 12,
            trim: true,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入发票号码' },
            rules: [{ required: true, message: '必填', trigger: 'blur' }]
          },
          {
            label: '快递单号',
            key: 'inWaybillNumber',
            span: 12,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入快递单号' }
          }
        ]
      },
      {
        cols: [
          {
            label: '客户签收人',
            key: 'inSinger',
            span: 12,
            trim: true,
            component: 'kye-input',
            componentProps: { clearable: true, placeholder: '请输入客户签收人' }
          },
          {
            label: '客户签收日',
            key: 'inSingedDate',
            span: 12,
            defaultValue: curDay(),
            component: 'kye-date-picker',
            componentProps: {
              type: 'date',
              clearable: true,
              editable: false,
              placeholder: '请选择'
            }
          }
        ]
      }
    ]
  }
  return block
}
