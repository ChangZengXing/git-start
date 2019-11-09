/**
 * Created by cy on 2018-08-03.
 */

export default function formBlock (type = 'textarea', col) {
  const defComponent = {
    label: '备注内容',
    key: 'content',
    span: 24,
    trim: true,
    component: 'kye-input',
    componentProps: {
      maxLength: 200,
      clearable: true,
      placeholder: '请输入备注'
    },
    rules: [
      { required: true, message: '必填,不能为空!', trigger: 'blur' }
    ]
  }
  if (type === 'textarea' && !col) {
    defComponent.componentProps.rows = 3
    defComponent.componentProps.type = type
  }
  return {
    rows: [{ cols: [{ ...defComponent, ...col }] }]
  }
}
