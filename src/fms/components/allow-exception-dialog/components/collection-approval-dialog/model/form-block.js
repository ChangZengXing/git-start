/**
 * Created by cy on 2018-07-04.
 */

import { getMonthRange } from '@/fms/utils'
export default function formBlock(vm) {
  const block = {
    inline: true,
    gutter: 0,
    rows: [
      {
        cols: [
          {
            slot: 'pickupTime-shippingDate',
            label: '寄件时间/签收时间/',
            key: 'pickupTime-shippingDate',
            span: 4,
            defaultValue: {},
            items: [
              {
                label: '寄件时间',
                key: 'pickupTime',
                span: 4,
                component: 'kye-date-picker',
                defaultValue: getMonthRange(1),
                componentProps: {
                  type: 'daterange',
                  clearable: false,
                  editable: false
                }
              },
              {
                label: '签收时间',
                key: 'shippingDate',
                span: 4,
                component: 'kye-date-picker',
                componentProps: {
                  type: 'daterange',
                  clearable: false,
                  editable: false
                }
              }
            ]
          },
          {
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
            slot: 'searchBtn',
            span: 4
          }
        ]
      }
    ]
  }
  return block
}
