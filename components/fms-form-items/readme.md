> 查询字段选择

#### 配置信息

```js
formItems: [
  {
    key: 'billReceivables_payDate',
    label: '收款日期',
    defaultValue: [],
    component: 'kye-date-picker',
    componentProps: {
      type: 'daterange',
      editable: true,
      clearable: true,
      rangeSeparator: '~',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期'
    }
  },
  {
    key: 'billReceivables_handInDate',
    label: '上交日期',
    defaultValue: [],
    component: 'kye-date-picker',
    componentProps: {
      type: 'daterange',
      editable: true,
      clearable: true,
      rangeSeparator: '~',
      startPlaceholder: '请选择开始日期',
      endPlaceholder: '请选择结束日期'
    }
  }
],
```
