/**
 * Created by cy on 2018-07-06.
 */

import { bankSearch, bankTypeSearch, customerSearch, collectionObjectSearch } from '@/fms/utils'

export const message = '必填'
export default function formBlock(vm, isCompany = false) {
  console.log('isCompany', isCompany)

  const block = {
    gutter: 8,
    rows: [
      {
        cols: [
          {
            label: '是否客户',
            key: 'isCompany',
            span: 8,
            defaultValue: isCompany ? '1' : '0',
            component: 'kye-select',
            componentProps: {},
            componentListeners: {
              clear() {},
              change(res) {
                // 更新收款信息
                vm.updateIsCompany(res)
              }
            },
            lookupCode: 'fms_yn'
          },
          {
            label: '收款对象',
            key: 'payeeName',
            span: 8,
            component: 'kye-search-tips',
            componentProps: isCompany ? customerSearch() : collectionObjectSearch(),
            componentListeners: {
              clear() {
                // 更新收款信息
                vm.updateCollectionObject(false)
              },
              select(res) {
                // 更新收款信息
                vm.updateCollectionObject(res)
              }
            },
            rules: [{ required: true, message, trigger: 'blur' }]
          },
          {
            label: '',
            key: 'btn',
            span: 6,
            slot: 'checkBtn'
          }
        ]
      },
      {
        cols: [
          {
            label: '收款账号名',
            key: 'payeeBankAccountName',
            span: 8,
            show: isCompany,
            component: 'kye-input',
            componentProps: {},
            rules: [
              {
                required: true,
                message: '必填, 不能为空',
                trigger: 'change'
              }
            ]
          },
          {
            label: '收款人账号',
            key: 'payeeBankAccountNo',
            span: 8,
            show: isCompany,
            component: 'kye-input',
            componentProps: {},
            rules: [
              {
                required: true,
                message: '必填, 不能为空',
                trigger: 'change'
              }
            ]
          },
          {
            label: '收款开户行',
            key: 'payeeBankName',
            span: 8,
            show: isCompany,
            component: 'kye-search-tips',
            componentProps: bankSearch(),
            componentListeners: {
              select(res) {
                vm.payeeBankUpdate(res)
              },
              clear() {
                vm.payeeBankUpdate()
              }
            },
            rules: [
              {
                required: true,
                message: '必填, 不能为空',
                trigger: 'blur'
              }
            ]
          }
        ]
      },
      {
        cols: [
          {
            label: '联行号',
            key: 'payeeBankNumber',
            span: 8,
            show: isCompany,
            component: 'kye-input',
            componentProps: {
              disabled: true
            },
            rules: [
              {
                required: true,
                message: '必填, 不能为空',
                trigger: 'change'
              }
            ]
          },
          {
            label: '银行类型',
            key: 'payeeBankType',
            span: 8,
            show: isCompany,
            component: 'kye-search-tips',
            componentProps: bankTypeSearch(),
            componentListeners: {
              select(val) {
                vm.bankTypeUpdate(val)
              },
              clear() {
                vm.bankTypeUpdate()
              }
            }
          },
          {
            label: '省份城市',
            key: 'locationVos',
            span: 8,
            defaultValue: [],
            show: isCompany,
            component: 'kye-area-remote',
            componentProps: {
              level: 2,
              auto: false
            }
          }
        ]
      }
    ]
  }
  return block
}
