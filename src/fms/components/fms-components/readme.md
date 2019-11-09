#### 主要用于表单组件动态渲染,便于使用配置文件布局

使用场景:
> 组件必须要可以以v-model的方式进行传值
> 页面需要渲染字段数过多
> 通过配置文件动态渲染组件

配置
```js
{
  key: 'billPerson-waybillNumber', // 字段值(对于嵌套对象,使用object-flatten)
  label: '运单号', // 字段标签
  defaultValue: '', // 默认值
  filter: (val) => {}, // 组件读入数据过滤(不会修改原数据)
  formatter: (val) => {}, // 组件写入数据格式化(修改原数据)
  component: '', // 全局注册的组件名称 比如 `kye-input`
  componentProps: {}, // component属性指定的组件对应属性
  componentListeners: {}, // component组件事件监听对象
  ...
}
```

配置文件使用示例:

```js
function component (component, type) {
  if (type === 'detail') {
    return 'kye-field'
  }
  return component
}
[
  {
    label: '运单号', key: 'billPerson-waybillNumber', span: 4, component: component('kye-input', type),
    componentProps: { disabled: true, clearable: true },
    componentListeners: {}
  },
  {
    label: '付款公司', key: 'paymentCustomerName', span: 4, component: component('kye-input', type),
    componentProps: { disabled: true, clearable: true },
    componentListeners: {}
  },
  {
    label: '纳入月份', key: 'inMonth', span: 4, component: component('kye-date-picker', type),
    componentProps: {
      disabled: disabled(type),
      clearable: true,
      default: '',
      type: 'month',
      valueFormat: 'yyyy-MM',
      placeholder: '请选择纳入月份'
    },
    filter: val => filter.date(val, 'YYYY-MM')
  },
  {
    label: '寄件公司', key: 'shippingCompany', span: 4, component: component('kye-input', type),
    componentProps: { disabled: true, clearable: true },
    componentListeners: {}
  },
  {
    label: '寄件时间', key: 'shippingDate', span: 4, component: component('kye-date-picker', type),
    componentProps: { disabled: true, clearable: true },
    filter: val => filter.minute(val)
  },
  {
    label: '运单付款方式', key: '', span: 4, component: component('kye-select', type),
    componentProps: { disabled: true, clearable: true },
    lookupCode: 'oms_pay_mode'
  }
]
```
