/**
 * Created by cy on 2018-08-15.
 */

import APIPublic from '@/fms/api/public'

export default function formBlock (vm) {
  const block = {
    gutter: 8,
    rows: [
      {
        cols: [
          {
            label: '收款人',
            key: 'billReceivables-payee',
            span: 24,
            trim: true,
            component: 'kye-search-tips',
            componentProps: {
              disabled: false,
              clearable: true,
              url: APIPublic['employee-listByName'],
              keys: ['chineseName', 'departmentName'],
              valueKey: 'chineseName',
              formatData: val => ({ chineseName: val, dataSource: '0' })
            },
            componentListeners: {
              select (res) { vm.updateEmployee(res) },
              clear () { vm.clearEmployee() }
            }
          }
        ]
      }
    ]
  }
  return block
}
