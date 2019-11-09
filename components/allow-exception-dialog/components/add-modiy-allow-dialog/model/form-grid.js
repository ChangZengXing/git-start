/**
 * Created by cy on 2018-10-11.
 */

import { toString, trim } from 'lodash'
import rules from '@/public/utils/rules.js'
import { deductCodeSearchB, advanceCodeSearch, up } from '@/fms/utils'
export default function formGrid(vm) {
  const labelChange = () => {
    // 异常类型 为 员工扣款时 异常金额 改为 扣款金额
    if (toString(vm.formModel.flexVarchar1) === '20') {
      return '扣款金额'
      // 异常类型 为 外请扣款时 异常金额 改为 预支金额
    } else if (toString(vm.formModel.flexVarchar1) === '10') {
      return '预支金额'
    } else {
      return '异常金额'
    }
  }
  const a = {
    // 外请扣款 时,从备用金预支获取
    ...advanceCodeSearch({ keys: ['code', 'totalAmount', 'reason', 'employeeName'] }),
    formatResult: val => {
      console.log('val', val)
      return val.rows.map(item => {
        return {
          code: item.advanceNumber,
          totalAmount: item.advanceAmount,
          reason: item.advanceReason,
          employeeName: item.advancePersonName
        }
      })
    }
  }
  const b = {
    // 员工扣款 时 从hr那面获取
    ...deductCodeSearchB(),
    formatResult: val => {
      return val.filter(item => {
        return item.approve === '10'
      })
    }
  }

  const grid = {
    cols: [
      {
        label: '异常类型',
        key: 'flexVarchar1',
        span: 12,
        component: 'kye-select',
        componentProps: {
          // 公司赔款 员工扣款 代理扣款 手续分 核销差异 资产抵扣 系统异常 代收货款 积分抵扣
          disabled: vm.dialogParams.action === 'modify'
        },
        lookupCode: 'fms_remark_exception_type',
        options: value => {
          // 不展示 核销差异
          return value.filter(item => {
            return toString(item.value) !== '30'
          })
        },
        componentListeners: {
          change: value => {
            vm.flexVarcharChange(value)
          }
        },
        rules: rules.str('必填', true, 'change')
      },
      {
        label: labelChange(),
        key: 'deductMoneyAmount',
        span: 12,
        component: 'kye-number',
        componentProps: {
          symbol: '￥',
          precision: 2,
          // 异常类型为 员工扣款 代理扣款时 不可编辑
          disabled: ['10', '20'].includes(toString(vm.formModel.flexVarchar1))
        },
        rules: !['10', '11', '20'].includes(toString(vm.formModel.flexVarchar1))
          ? rules.str('必填', true, 'blur')
          : ['11'].includes(toString(vm.formModel.flexVarchar1))
          ? [
              {
                required: false,
                trigger: 'blur',
                validator: vm.practicalMoneyValidator
              }
            ]
          : []
      },
      {
        label: '关联单据',
        key: 'deductMoneyNumber',
        span: 12,
        component: ['10', '20'].includes(toString(vm.formModel.flexVarchar1))
          ? 'kye-search-tips'
          : 'kye-input',
        componentProps: {
          // 外请扣款 时,从备用金预支获取
          '10': a,
          // 员工扣款 时 从hr那面获取
          '20': b
        }[toString(vm.formModel.flexVarchar1)],
        componentListeners: {
          async select(info) {
            if (['10', '20'].includes(toString(vm.formModel.flexVarchar1))) {
              if (info) {
                vm.formModel.deductMoneyNumber = info.code
                await vm.getDeductMoneyNumber(false)
              } else {
                up(vm.formModel, {}, [
                  ['deductMoneyAmount', ''],
                  ['deductMoneyFullName', ''],
                  ['deductible', ''],
                  ['deductMoneyReason', ''],
                  ['flexBigint1', ''],
                  ['deductMoneyNumber', ''],
                  ['surplusDeductible', '']
                ])
                vm.formModel._max = 0
              }
            }
          },
          clear() {
            if (['10', '20'].includes(toString(vm.formModel.flexVarchar1))) {
              up(vm.formModel, {}, [
                ['deductMoneyAmount', ''],
                ['deductMoneyFullName', ''],
                ['deductible', ''],
                ['deductMoneyReason', ''],
                ['flexBigint1', ''],
                ['deductMoneyNumber', ''],
                ['surplusDeductible', '']
              ])
              vm.formModel._max = 0
            }
          },
          blur() {
            if (['40'].includes(toString(vm.formModel.flexVarchar1))) {
              // 代收货款 时
              vm.deliveryGoodsNumber(false)
            }
            // 代理扣款-已对账
            if (['11'].includes(toString(vm.formModel.flexVarchar1))) {
              vm.PracticalMoneyNumber()
            }
          }
        },
        rules: ['10', '11', '20', '40'].includes(toString(vm.formModel.flexVarchar1))
          ? rules.str('必填', true, 'change')
          : []
      },
      {
        label: '责任人',
        key: 'deductMoneyFullName',
        span: 12,
        component: 'kye-input',
        componentProps: {
          // 异常类型为 员工扣款20 代理扣款-未对账10 代收货款40 代理扣款-已对账11
          disabled: ['10', '20', '40', '11'].includes(toString(vm.formModel.flexVarchar1))
        }
      },
      {
        label: '已抵扣金额',
        key: 'deductible',
        span: 12,
        component: 'kye-input',
        show: ['20', '10'].includes(toString(vm.formModel.flexVarchar1)),
        componentProps: {
          // 异常类型 为 员工扣款 或 外请扣款时 显示
          disabled: true
        },
        filter: 'money'
      },
      {
        label: '可抵扣金额',
        key: 'surplusDeductible',
        span: 12,
        component: 'kye-number',
        show: ['20', '10'].includes(toString(vm.formModel.flexVarchar1)),
        componentProps: {
          // 异常类型 为 员工扣款 或 外请扣款时 显示
          symbol: '￥',
          precision: 2
        },
        componentListeners: {
          // blur() {
          //   vm.surplusBlur()
          // }
        },
        rules: ['10', '20'].includes(toString(vm.formModel.flexVarchar1))
          ? [
              {
                required: true,
                trigger: 'blur',
                message: '必填'
              },
              {
                required: false,
                trigger: 'blur',
                validator: vm.deductibleValidator
              }
            ]
          : []
      },
      {
        label: '事由',
        key: 'deductMoneyReason',
        span: 24,
        component: 'kye-input',
        componentProps: {
          // 异常类型为 员工扣款 20 代理扣款-未对账 10 代收货款 40  代理扣款-已对账 11时 不可编辑
          disabled: ['10', '20', '40', '11'].includes(toString(vm.formModel.flexVarchar1))
        }
      },
      {
        label: '备注',
        key: 'content',
        span: 24,
        component: 'kye-input',
        componentProps: {
          type: 'textarea',
          rows: 2,
          maxlength: 500
        },
        rules: rules.str('必填', true, 'blur')
      },
      {
        label: '图片',
        key: 'flexVarchar3',
        span: 24,
        component: 'kye-input',
        componentProps: {
          disabled: true
        },
        filter: value => {
          if (trim(toString(value))) {
            return '有'
          } else {
            return '无'
          }
        },
        link: () => {
          const { flexVarchar3 } = vm.formModel
          vm.dialogOpen('PictureAllowDialog', {
            bizId: flexVarchar3,
            onSubmit: ({ args }) => {
              const { bizId, images } = args
              vm.formModel.flexVarchar3 = bizId
              vm.formModel.images = images
            }
          })
        }
      }
    ]
  }
  return grid
}
