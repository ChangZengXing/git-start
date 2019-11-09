### 表单块渲染

```js
/**
 * Created by cy on 2018-07-04.
 */

import { curMonth, curDayRange } from '@/fms/utils'

export default function formBlock(vm) {
  const block = {
    gutter: 0,
    inline: true,
    groupName: 0,
    labelPosition: 'right',
    rows: [
      {
        cols: [
          {
            groupName: 0,
            groupRadio: true,
            label: '运单号',
            key: 'waybillNumber',
            span: 4,
            trim: true,
            component: 'kye-input',
            componentProps: {
              clearable: true,
              style: 'width: 120px'
            }
          },
          {
            groupName: 1,
            groupRadio: true,
            label: '寄件日期/纳入月份',
            key: 'pickupTime-inMonth',
            slot: 'pickupTime-inMonth',
            span: 4,
            defaultValue: {},
            items: [
              {
                label: '寄件日期',
                key: 'pickupTime',
                defaultValue: curDayRange(),
                component: 'kye-date-picker',
                componentProps: {
                  type: 'daterange',
                  clearable: false,
                  editable: false,
                  style: { width: '168px' }
                }
              },
              {
                label: '纳入月份',
                key: 'inMonth',
                defaultValue: curMonth(),
                component: 'kye-date-picker',
                componentProps: {
                  type: 'month',
                  clearable: false,
                  editable: false,
                  valueFormat: 'yyyy-MM',
                  style: 'width: 168px;'
                }
              }
            ]
          },
          {
            groupName: 1,
            label: '付款公司',
            key: 'paymentCustomerName',
            span: 4,
            component: 'kye-input',
            componentProps: {
              clearable: true,
              style: 'width: 120px'
            }
          },
          {
            groupName: 1,
            label: '收件公司',
            key: 'pickupCustomerName',
            span: 4,
            component: 'kye-input',
            componentProps: {
              clearable: true,
              style: 'width: 120px'
            }
          },
          {
            groupName: 1,
            label: '寄件公司',
            key: 'deliveryCustomerName',
            span: 4,
            component: 'kye-input',
            componentProps: {
              clearable: true,
              style: 'width: 120px'
            }
          },
          {
            slot: 'formBtn',
            span: 4
          }
        ]
      },
      {
        cols: [
          {
            label: '打印机',
            key: 'curPrinter',
            span: 4,
            labelWidth: '58px',
            component: 'kye-select',
            options: vm.printerList,
            componentProps: {
              clearable: true,
              placeholder: ' ',
              style: 'width: 120px;'
            }
          },
          {
            slot: 'actionBtns',
            span: 20
          }
        ]
      }
    ]
  }
  return block
}
```
