/**
 * Created by cy on 2018-06-26.
 */

export default function tableCols(vm, type, pageType) {
  const waybillNumberLabel = {
    monthly: '应收编码',
    personally: '运单号'
  }
  let cols = [
    {
      label: waybillNumberLabel[pageType],
      key: 'waybillNumber',
      width: pageType === 'monthly' ? '140' : '100'
    },
    {
      label: '扣款编码',
      key: 'deductMoneyNumber',
      width: '135'
    },
    {
      label: '异常备注',
      key: 'content',
      minWidth: '120'
    },
    {
      label: '扣款金额',
      key: 'deductMoneyAmount',
      width: '100'
    },
    {
      label: '扣款事由',
      key: 'deductMoneyReason',
      width: '110'
    },
    {
      label: '扣款人',
      key: 'deductMoneyFullName',
      width: '70'
    },
    {
      label: '录单人员',
      key: 'createdBy',
      width: '70'
    },
    {
      label: '录单时间',
      key: 'creationDate',
      filter: 'minute',
      width: '115'
    },
    {
      label: '修改人员',
      key: 'updatedBy',
      width: '70'
    },
    {
      label: '修改时间',
      key: 'updationDate',
      filter: 'minute',
      width: '115'
    },
    {
      label: '操作',
      width: '90px',
      align: 'center',
      fixed: 'left',
      sortable: false,
      slot: 'tableBtns'
    }
  ]
  return cols
}
