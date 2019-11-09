/**
 * Created by cy on 2018-07-04.
 */

import { trim, toString } from 'lodash'
export default function tableCols(vm) {
  const cols = [
    {
      label: '操作',
      fixed: 'left',
      width: 80,
      show: vm.isButtonShow,
      slot: 'operation'
    },
    {
      label: '异常类型',
      key: 'flexVarchar1',
      width: 80,
      lookupCode: 'fms_remark_exception_type'
    },
    {
      label: '异常金额',
      key: 'deductMoneyAmount',
      width: 110,
      filter: 'money'
    },
    {
      label: '责任人',
      key: 'deductMoneyFullName',
      width: 80
    },
    {
      label: '事由',
      key: 'deductMoneyReason',
      width: 180
    },
    {
      label: '关联单据',
      key: 'deductMoneyNumber',
      width: 130
    },
    {
      label: '备注',
      key: 'content',
      width: 130
    },
    {
      label: '图片',
      key: 'flexVarchar3',
      width: 70,
      filter: value => {
        if (trim(toString(value))) {
          return '有'
        } else {
          return '无'
        }
      },
      isLink: (col, row) => {
        if (trim(toString(row['flexVarchar3']))) {
          return true
        } else {
          return false
        }
      },
      link: (col, index, row) => {
        if (trim(toString(row.flexVarchar3))) {
          vm.dialogOpen('FmsDialogImage', {
            bizId: row.flexVarchar3,
            buttonList: ['download'],
            title: '图片查看'
          })
        }
      }
    },
    {
      label: '录单人',
      key: 'createdBy',
      width: 80
    },
    {
      label: '录单时间',
      key: 'creationDate',
      width: 110,
      filter: 'minute'
    },
    {
      label: '修改人',
      key: 'updatedBy',
      width: 80
    },
    {
      label: '修改时间',
      key: 'updationDate',
      width: 110,
      filter: 'minute'
    }
  ]
  return cols
}
