/**
 * Created by cy on 2018-07-11.
 */

import { curMonth, curDayRange } from '@/fms/utils'

export default function formBlock(vm) {
  const block = {
    gutter: 0,
    inline: true,
    groupName: 'b',
    labelPosition: 'left',
    rows: [
      {
        cols: [
          {
            groupName: 'b',
            groupRadio: true,
            label: '寄件时间/纳入月份',
            key: 'shippingDate-inMonth',
            slot: 'shippingDate-inMonth',
            defaultValue: {},
            span: 4,
            items: [
              {
                label: '寄件时间',
                key: 'shippingDate',
                span: 4,
                defaultValue: curDayRange(),
                component: 'kye-date-picker',
                componentProps: {
                  type: 'daterange',
                  clearable: false,
                  editable: false
                }
              },
              {
                label: '纳入月份',
                key: 'inMonth',
                span: 4,
                defaultValue: curMonth(),
                component: 'kye-date-picker',
                componentProps: {
                  type: 'month',
                  clearable: false,
                  editable: false,
                  valueFormat: 'yyyy-MM'
                }
              }
            ]
          },
          {
            groupName: 'b',
            label: '公司名称',
            key: 'paymentCustomerName',
            span: 4,
            component: 'kye-input',
            componentProps: {
              clearable: true
            }
          },
          {
            groupName: 'a',
            groupRadio: true,
            label: '运单号',
            key: 'billPerson-waybillNumber',
            span: 4,
            component: 'kye-input',
            componentProps: {
              clearable: true,
              style: 'width: 130px'
            }
          },
          {
            slot: 'formButton',
            span: 4
          }
        ]
      }
    ]
  }
  return block
}
