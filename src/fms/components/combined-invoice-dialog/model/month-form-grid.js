/**
 * Created by cy on 2018-11-08.
 */

import { customerSearch } from '@/fms/utils'

export default () => {
  const cols = [
    {
      label: '付款公司',
      key: 'paymentCustomerName',
      span: 24,
      component: 'kye-search-tips',
      componentProps: customerSearch(),
      componentListeners: {
        select(res) {
          if (!res) {
            return this.col.componentListeners.clear()
          }
          this.model['paymentCustomerName'] = res.customerShortName
          this.model['paymentCustomerId'] = res.id
        },
        clear() {
          this.model['paymentCustomerName'] = ''
          this.model['paymentCustomerId'] = ''
        }
      },
      rules: [{ required: true, message: '必填', trigger: 'blur' }]
    },
    {
      label: '纳入月份',
      key: 'inMonth',
      span: 24,
      component: 'kye-date-picker',
      componentProps: {
        type: 'month',
        clearable: false,
        editable: false,
        valueFormat: 'yyyy-MM',
        placeholder: '请选择纳入月份'
      },
      componentListeners: {}
    }
  ]
  return { cols }
}
