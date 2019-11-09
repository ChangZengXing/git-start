/**
 * Created by cy on 2018-11-08.
 */

export default () => {
  const cols = [
    {
      label: '运单号',
      key: 'waybillNumber',
      span: 24,
      component: 'kye-input',
      componentProps: { placeholder: '请输入运单号', clearable: true },
      rules: [{ required: true, message: '必填', trigger: 'blur' }]
    }
  ]
  return { cols }
}
