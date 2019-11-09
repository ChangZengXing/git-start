/**
 * Created by cy on 2018-12-17.
 */

export default function formBlock(vm) {
  const block = {
    labelWidth: '57px',
    rows: [
      {
        cols: [
          {
            label: '回复日期',
            key: 'replyDate',
            span: 24,
            component: 'kye-date-picker',
            componentProps: {
              type: 'date',
              clearable: true,
              editable: false,
              placeholder: '请选择'
            }
          }
        ]
      },
      {
        cols: [
          {
            label: '回复备注',
            key: 'replyRemark',
            span: 24,
            component: 'kye-input',
            componentProps: {
              type: 'textarea',
              placeholder: '请输入回复备注',
              rows: 2,
              maxlength: 3000
            }
          }
        ]
      }
    ]
  }
  return block
}
