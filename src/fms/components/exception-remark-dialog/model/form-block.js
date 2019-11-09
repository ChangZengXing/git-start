/**
 * Created by cy on 2018-07-23.
 */
export default function formBlock (vm) {
  const block = {
    gutter: 8,
    labelWidth: '57px',
    rows: [
      {
        cols: [
          {
            label: '扣款编码',
            key: 'deductMoneyNumber',
            span: 12,
            slot: 'deductMoneyNumber'
          },
          {
            label: '扣款金额',
            key: 'deductMoneyAmount',
            span: 12,
            filter: 'money',
            component: 'kye-input',
            componentProps: { disabled: true }
          }
        ]
      },
      {
        cols: [
          {
            label: '扣款事由',
            key: 'deductMoneyReason',
            span: 12,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '扣款人',
            key: 'deductMoneyFullName',
            span: 12,
            component: 'kye-input',
            componentProps: { disabled: true }
          }
        ]
      },
      {
        cols: [
          {
            label: '异常备注',
            key: 'content',
            span: 24,
            component: 'kye-input',
            componentProps: {
              rows: 3,
              type: 'textarea',
              clearable: true,
              placeholder: '请输入异常备注',
              maxlength: 500
            },
            rules: [{ required: true, message: '必填,不能为空', trigger: 'blur' }]
          }
        ]
      }
    ]
  }
  return block
}
