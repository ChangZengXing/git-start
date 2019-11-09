/**
 * Created by cy on 2018-07-20.
 */

import { curMonth, curDayRange } from '@/fms/utils'

export default function searchBlock(vm, type) {
  console.error('-----type', type)
  const waybill = {
    personally: {
      label: '运单号',
      key: 'billPerson-waybillNumber',
      span: 4,
      component: 'kye-input',
      componentProps: {
        clearable: true,
        style: 'width: 120px'
      }
    },
    monthly: {
      label: '应收编码',
      key: 'billMonthly-billNumber',
      span: 4,
      component: 'kye-input',
      componentProps: {
        clearable: true,
        style: 'width: 120px'
      }
    }
  }
  const block = {
    gutter: 0,
    inline: true,
    labelPosition: 'left',
    rows: [
      {
        cols: [
          {
            slot: 'inMonth-payDate-handInDate',
            label: '纳入月份/收款日期/上交日期',
            key: 'inMonth-payDate-handInDate',
            span: 4,
            defaultValue: {},
            items: [
              {
                label: '纳入月份',
                key: 'inMonth',
                component: 'kye-date-picker',
                defaultValue: curMonth(),
                componentProps: {
                  type: 'month',
                  clearable: false,
                  editable: false,
                  format: 'yyyy-MM',
                  valueFormat: 'yyyy-MM'
                }
              },
              {
                key: 'billReceivables-payDate',
                label: '收款日期',
                defaultValue: curDayRange(),
                component: 'kye-date-picker',
                componentProps: {
                  type: 'daterange',
                  editable: false,
                  clearable: false
                }
              },
              {
                key: 'billReceivables-handInDate',
                label: '上交日期',
                defaultValue: curDayRange(),
                component: 'kye-date-picker',
                componentProps: {
                  type: 'datetimerange',
                  editable: false,
                  clearable: false
                }
              }
            ]
          },
          waybill[type],
          {
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
            label: '销售经理',
            key: 'marketName',
            span: 4,
            component: 'kye-input',
            componentProps: {
              clearable: true,
              style: 'width: 90px'
            }
          },
          {
            label: '异常有无审核',
            key: 'exceptionStatus',
            span: 4,
            defaultValue: 'Yes',
            lookupCode: 'fms_exception_status',
            component: 'kye-select',
            componentProps: {
              clearable: true,
              placeholder: '',
              style: 'width: 70px'
            }
          },
          {
            slot: 'searchBtn',
            label: '查询',
            span: 4
          }
        ]
      }
    ]
  }
  return block
}
