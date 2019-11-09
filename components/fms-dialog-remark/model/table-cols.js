/**
 * Created by cy on 2018-07-20.
 */

export default function tableCols (editable) {
  const cols = [
    {
      label: '备注内容',
      key: 'content',
      minWidth: '200'
    },
    {
      label: '录入人员',
      key: 'createdBy',
      width: '180'
    },
    {
      label: '录入时间',
      key: 'creationDate',
      width: '140',
      filter: 'minute'
    },
    {
      label: '修改人员',
      key: 'updatedBy',
      width: '180'
    },
    {
      label: '修改时间',
      key: 'updationDate',
      width: '140',
      filter: 'minute'
    }
  ]
  if (editable) {
    cols.push({
      label: '操作',
      slot: 'tableBtn',
      width: '170',
      fixed: 'right'
    })
  }
  return cols
}
