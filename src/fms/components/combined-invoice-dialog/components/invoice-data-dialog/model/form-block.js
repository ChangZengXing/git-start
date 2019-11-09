/**
 * Created by cy on 2018-07-11.
 */

export default function formBlock(vm) {
  const block = {
    gutter: 8,
    rows: [
      {
        cols: [
          {
            label: '合计开票金额',
            key: '',
            span: 4,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '纳入月份',
            key: '',
            span: 4,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '已开票金额',
            key: '',
            span: 4,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '未开票金额',
            key: '',
            span: 4,
            component: 'kye-input',
            componentProps: { disabled: true }
          },
          {
            label: '总金额',
            key: '',
            span: 4,
            component: 'kye-input',
            componentProps: { disabled: true }
          }
        ]
      }
    ]
  }
  return block
}
