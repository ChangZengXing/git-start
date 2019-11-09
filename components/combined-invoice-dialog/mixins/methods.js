/**
 * Created by cy on 2018-07-11.
 */

import APICommon from '@/fms/api/common'
import { get, trim, round, some, toString, differenceBy, chunk } from 'lodash'
import { to, up, curMonth, toNumber, flatten, unflatten } from '@/fms/utils'
import { createRowModel } from '../model/table-cols'
import monthFormGrid from '../model/month-form-grid'
import personFormGrid from '../model/person-form-grid'
import moment from 'moment'

export default {
  methods: {
    async open (dialogParams) {
      // 开票类型 '0' 月结 '1' 散客
      const { model, invoiceType } = dialogParams
      this.model = { ...model }
      this.tabType = invoiceType
      this.invoiceType = invoiceType
      this.dialogParams = dialogParams
      const { title } = this.fmsDialogOptions
      this.fmsDialogOptions.title = title + (invoiceType === '0' ? '-月结' : '-散客')
      await this.openLoad(invoiceType)
      // 更新开票金额
      this.updateInvoiceAmount()
    },
    // 散客排序-多页排序
    sortUpdate ({ order, prop }) {
      console.log('===', order, prop)
      if (prop === 'invoiceUnAmount') {
        if (order === 'ascending') {
          setTimeout(() => {
            this.tableRows[1].sort(function (a, b) {
              console.log('a==', toNumber(a.invoiceUnAmount), b.invoiceUnAmount)
              return toNumber(a.invoiceUnAmount) - toNumber(b.invoiceUnAmount)
            })
            this.getPersonRows()
          }, 0)
        } else {
          setTimeout(() => {
            this.tableRows[1].sort((a, b) => {
              return toNumber(b.invoiceUnAmount) - toNumber(a.invoiceUnAmount)
            })
            this.getPersonRows()
          }, 0)
        }
      }
    },
    // type 1 散客 0 月结
    async openLoad (invoiceType = '1') {
      // 散客
      if (invoiceType === '1') {
        try {
          this.loading = true
          this.dialogParams.loading()
          const res = await Promise.all([this.loadBlockModel(), this.loadRowModelOnPerson()])
          this.fmsDialogOpen()
          this.formModel = res[0]
          // 把敏感字段保存起来用来判断敏感字段(购方全称,发票寄件地,接受人,接受电话)是否修改
          up(this.maskField, res[0], [
            // 购方全称
            ['deductionCompanyName'],
            // 发票寄件地
            ['invoiceAddress-address'],
            // 接受人
            ['invoiceAddress-invoiceSendee'],
            // 接受电话
            ['invoiceAddress-invoiceTel']
          ])
          if (res[1]) {
            const row = createRowModel(invoiceType)
            // 开票状态 fms_invoice_flag(10: 有, 20: 部分开票, 0: 无)为有时 ,开票金额不允许修改
            const { invoiceFlag } = this.model
            if (toString(invoiceFlag) === '10') {
              row._disabled = true
            }
            this.updateRowModelOnpersonally(row, res[1])
            // 带出的数据不可删除
            row['__notCancel'] = true
            this.tableRows[invoiceType] = [row]
            this.getPersonRows()
          }
          // 默认勾选代垫款开票 爬楼费
          // 更新总金额
          this.flagUpdate(true, true)
        } catch (e) {
          this.fmsDialogClose()
          console.error(e)
          if (e && e.message) {
            this.$message.error(e.message)
          }
        } finally {
          this.loading = false
          this.dialogParams.loading(false)
        }
      } else {
        // 月结
        try {
          this.loading = true
          this.dialogParams.loading()
          const res = await Promise.all([this.loadBlockModel(), this.loadRowModelOnMonthly()])
          this.fmsDialogOpen()
          this.formModel = res[0]
          // 把敏感字段保存起来用来判断敏感字段(购方全称,发票寄件地,接受人,接受电话)是否修改
          up(this.maskField, res[0], [
            // 购方全称
            ['deductionCompanyName'],
            // 发票寄件地
            ['invoiceAddress-address'],
            // 接受人
            ['invoiceAddress-invoiceSendee'],
            // 接受电话
            ['invoiceAddress-invoiceTel']
          ])
          if (res[1]) {
            const row = createRowModel(invoiceType)
            // 开票状态 fms_invoice_flag(10: 有, 20: 部分开票, 0: 无)为有时 ,开票金额不允许修改
            const { invoiceFlag } = this.model
            if (toString(invoiceFlag) === '10') {
              row._disabled = true
            }
            this.updateRowModelOnMonthly(row, res[1])
            // 带出的数据不可删除
            row['__notCancel'] = true
            this.tableRows[invoiceType] = [row]
          }
          // 默认不勾选代垫款开票 更新总金额
          this.flagUpdate(true, true)
        } catch (e) {
          this.fmsDialogClose()
          console.error(e)
          if (e && e.message) {
            this.$message.error(e.message)
          }
        } finally {
          this.loading = false
          this.dialogParams.loading(false)
        }
      }
    },
    // 合并开票开票资料明细
    async loadBlockModel () {
      const companyId = this.model.paymentCustomerId
      let formModel = await this.$http(APICommon['invoice-getCustomerInfo'], { companyId })
      // 显示 另补税金
      formModel.repairTaxAmount = this.model['billReceivables-repairTaxAmount']
      return flatten(formModel)
    },
    // 散客: 由运单号获取数据并更新散客行
    async loadRowModelOnPerson (waybillNumber) {
      // 运单号
      waybillNumber = waybillNumber || this.model['billPerson-waybillNumber']
      const args = {
        page: 1,
        pageSize: 1,
        vo: { billPerson: { waybillNumber } }
      }
      const { rows = [] } = await this.$http(APICommon['invoice-searchPerson'], args)
      if (rows.length === 0) {
        // 现在已经开票了 也还可以再次合并开票
        // throw new Error(`查不到该运单号 ${waybillNumber} 数据`)
      }
      return rows[0]
    },
    // 月结: 由纳入月份和付款公司获取数据并更新月结行
    async loadRowModelOnMonthly (inMonth, paymentCustomerId, paymentCustomerName) {
      // 纳入月份
      inMonth = inMonth || this.model['inMonth']
      // 付款公司
      paymentCustomerId = paymentCustomerId || this.model['paymentCustomerId']
      paymentCustomerName = paymentCustomerName || this.model['paymentCustomerName']
      const row = await this.$http(APICommon['invoice-getBillByNameMonth'], {
        inMonth,
        paymentCustomerId,
        paymentCustomerName
      })
      if (!row.id) {
        throw new Error('获取月结数据失败!')
      }
      return row
    },
    // TODO: 优化更新行散客月结数据(合并成一个函数)
    // 更新行散客
    updateRowModelOnpersonally (row, resRow) {
      // 获取增值明细列表 fms_approve_other_amount_type
      const increamInfoList = get(
        resRow,
        'billPerson.financeApproveEx.financeApprove.increamInfoList',
        []
      )

      // 获取爬楼费
      const climbingItem = increamInfoList.find(li => toString(li.feeCode) === '120')
      row._climbingFee = climbingItem ? climbingItem.feeAmount : '0.00'

      // 传给服务端
      row.climbingFee = climbingItem ? climbingItem.feeAmount : '0.00'

      // 注意保存代垫款项(后面需要参与运算)
      row.cushionAmount = resRow.billReceivables.cushionAmount
      // 运单号
      row.waybillNumber = resRow.billPerson.waybillNumber
      // 公司名称
      row.paymentCustomerName = resRow.paymentCustomerName
      row.paymentCustomerNameMask = resRow.paymentCustomerNameMask
      // 公司id
      row.paymentCustomerId = resRow.paymentCustomerId
      // 纳入月份
      row.inMonth = resRow.inMonth
      // 总金额
      row.allAmount = resRow.allAmount
      row.allAmountMask = resRow.allAmountMask
      // 保存原始值,便于后面计算
      row._allAmount = toNumber(
        resRow._allAmount === undefined ? resRow.allAmount : resRow._allAmount
      )
      // 已开票金额
      row.invoiceAmount = resRow.invoiceAmount
      row.invoiceAmountMask = resRow.invoiceAmountMask
      // 未开票金额 = 总金额 - 已开票金额
      const unIvoiceAmountComputed = round(
        toNumber(resRow.allAmount) - toNumber(resRow.invoiceAmount),
        2
      )
      // 未开票金额
      row._max = unIvoiceAmountComputed
      row.unIvoiceAmountComputed = unIvoiceAmountComputed.toFixed(2)
      // 开票金额 默认等于未开票金额
      row.invoiceUnAmount = row.unIvoiceAmountComputed
      // 注意保存额外的baseid
      row.id = resRow.id
      // 公司实收
      row.totalAmount = resRow.totalAmount
      row.totalAmountMask = resRow.totalAmountMask
      return row
    },
    // 更新行月结
    updateRowModelOnMonthly (row, resRow) {
      // 获取增值明细列表 fms_approve_other_amount_type
      const increamInfoList = get(
        resRow,
        'billMonthly.financeApproveEx.financeApprove.increamInfoList',
        []
      )
      // 获取爬楼费
      const climbingItem = increamInfoList.find(li => toString(li.feeCode) === '120')
      row._climbingFee = climbingItem ? climbingItem.feeAmount : '0.00'

      // 传给服务端
      row.climbingFee = climbingItem ? climbingItem.feeAmount : '0.00'

      // 注意保存代垫款项(后面需要参与运算)
      row.cushionAmount = resRow.billReceivables.cushionAmount
      // 应收编码
      row.billNumber = resRow.billMonthly.billNumber
      // 公司名称
      row.paymentCustomerName = resRow.paymentCustomerName
      row.paymentCustomerNameMask = resRow.paymentCustomerNameMask
      // 公司ID
      row.paymentCustomerId = resRow.paymentCustomerId
      // 纳入月份
      row.inMonth = resRow.inMonth
      // 总金额
      row.allAmount = resRow.allAmount
      row.allAmountMask = resRow.allAmountMask
      // 保存原始值,便于后面计算
      row._allAmount = toNumber(
        resRow._allAmount === undefined ? resRow.allAmount : resRow._allAmount
      )
      // 已开票金额
      row.invoiceAmount = resRow.invoiceAmount
      row.invoiceAmountMask = resRow.invoiceAmountMask
      // 未开票金额 = 总金额 - 已开票金额
      const unIvoiceAmountComputed = round(
        toNumber(resRow.allAmount) - toNumber(resRow.invoiceAmount),
        2
      )
      // 未开票金额
      row._max = unIvoiceAmountComputed
      row.unIvoiceAmountComputed = unIvoiceAmountComputed.toFixed(2)
      // 开票金额 默认等于未开票金额
      row.invoiceUnAmount = row.unIvoiceAmountComputed
      // 注意保存额外的baseid
      row.id = resRow.id
      // 公司实收
      row.totalAmount = resRow.totalAmount
      row.totalAmountMask = resRow.totalAmountMask
      return row
    },
    // 表格新增行
    addRow (type, row) {
      // 已开票,提示不允许开票 fms_invoice_flag 有开票:'10' 无:'0' 部分开票:'20'
      const { invoiceFlag } = this.model
      if (toString(invoiceFlag) === '10') {
        return this.$message.warning('已开票,不允许新增!')
      }
      this.$$dialogOpen('FmsDialogForm', {
        width: 1,
        title: '月结开票-新增',
        formModel: { inMonth: curMonth(), paymentCustomerName: '' },
        formGrid: monthFormGrid('add'),
        onSubmit: async ({ model, dialog }) => {
          // “公司名称”和“纳入月份”不可重复
          const { paymentCustomerName, paymentCustomerId, inMonth } = model
          if (some(this.tableRows[0], { paymentCustomerName, inMonth })) {
            return this.$message.warning('公司名称和纳入月份已存在列表中!')
          }

          try {
            dialog.loading()
            // 月结
            const res = await this.loadRowModelOnMonthly(
              inMonth,
              paymentCustomerId,
              paymentCustomerName
            )
            // 新增月结行
            const newRow = this.updateRowModelOnMonthly(createRowModel(0), res)
            this.tableRows[0].push(newRow)
            // 根据 代垫款是否开票, 爬楼费是否开票, 重新计算总金额
            this.flagUpdate(this.cushionFlag, this.climbingFlag)
            dialog.close()
          } catch (e) {
            console.error(e)
          } finally {
            dialog.loading(false)
          }
        }
      })
    },
    // 修改表格行
    modifyRow (type, row) {
      this.$$dialogOpen('FmsDialogForm', {
        width: 1,
        title: `${type === 0 ? '月结' : '散客'}开票-修改`,
        formModel: row,
        formGrid: type === 0 ? monthFormGrid('modify') : personFormGrid('modify'),
        onSubmit: async ({ model, dialog }) => {
          console.log('onSubmit', model)
          const { paymentCustomerName, paymentCustomerId, inMonth, waybillNumber } = model
          if (type === 0) {
            // 月结 “公司名称”和“纳入月份”不可重复
            if (some(this.tableRows[0], { paymentCustomerName, inMonth })) {
              return this.$message.warning('公司名称和纳入月份已存在列表中!')
            }
          } else {
            // 散客 运单号不可重复
            if (some(this.tableRows[1], { waybillNumber })) {
              return this.$message.warning('运单号已存在列表中')
            }
          }

          try {
            dialog.loading()
            if (type === 0) {
              // 月结
              const res = await this.loadRowModelOnMonthly(
                inMonth,
                paymentCustomerId,
                paymentCustomerName
              )
              // 修改当前月结行
              this.updateRowModelOnMonthly(row, res)
            } else {
              // 散客
              const res = await this.loadRowModelOnPerson(waybillNumber)
              // 修改当前散客行
              this.updateRowModelOnpersonally(row, res)
            }
            // 根据代垫款是否开票重新计算总金额
            this.flagUpdate(this.cushionFlag, this.climbingFlag)
            dialog.close()
          } catch (e) {
            console.error(e)
          } finally {
            dialog.loading(false)
          }
        }
      })
    },
    // 删除表格行
    removeRow (index, row) {
      const rows = this.tableRows[index]
      this.tableRows[index] = rows.filter(it => {
        return it._id !== row._id
      })
      // 更新开票金额
      this.getPersonRows()
      this.updateInvoiceAmount()
    },
    // 开票资料
    openInvoiceDataDialog () {
      // 客户id, 开票状态
      const { paymentCustomerId: companyId, invoiceFlag } = this.model
      this.$$dialogOpen('InvoiceDataDialog', {
        model: { companyId, invoiceFlag },
        onSubmit: data => {
          // 插入选择的开票资料(税率有更新)
          this.insertInvoiceData(data)
          // 更新税金
          this.updateTaxAmount()
          // 更新不含税金
          this.updateExclusiveTaxAmount()
          // 把敏感字段保存起来用来判断敏感字段(购方全称,发票寄件地,接受人,接受电话)是否修改
          up(this.maskField, data, [
            // 购方全称
            ['deductionCompanyName'],
            // 发票寄件地
            ['invoiceAddress-address'],
            // 接受人
            ['invoiceAddress-invoiceSendee'],
            // 接受电话
            ['invoiceAddress-invoiceTel']
          ])
        }
      })
    },
    // 选择单号
    openInvoiceNumDialog () {
      // 开票状态
      const { invoiceFlag } = this.model
      // 开票类型 '0' 月结 '1' 散客
      const invoiceType = this.invoiceType
      // 运单号
      const waybillNumber = this.model['billPerson-waybillNumber']
      console.log('wayb--', waybillNumber)
      const waybillNumbers = this.tableRows[1].map(row => row.waybillNumber)
      this.$$dialogOpen('InvoiceNumDialog', {
        model: { invoiceFlag, invoiceType, waybillNumber, waybillNumbers },
        onSubmit: (rows, page) => {
          this.insertInvoiceList(rows)
        }
      })
    },
    pageChange (type, val, cache) {
      console.log('--page', type, val, cache)
      console.log('---jj', this.page)
      if (type === 'currentPage') {
        this.page.currentPage = val
      }
      this.getPersonRows()
    },
    // 展示当前页
    getPersonRows () {
      console.log('---all', this.tableRows[1])
      this.page.total = this.tableRows[1].length
      this.personRows = chunk(this.tableRows[1], 200)[this.page.currentPage - 1]
    },
    /**
     * @version 2.0
     * @description 前端获取所有数据进行分页
     */
    insertInvoiceList (list) {
      // 更新散客行数据接口
      list = list.map(li => {
        const row = createRowModel(1)
        this.updateRowModelOnpersonally(row, li)
        return row
      })
      // list = list.filter(it => it.waybillNumber)
      // 获取新增的list list有的而this.tableRows[1]没有
      list = differenceBy(list, this.tableRows[1], 'waybillNumber')
      this.tableRows[1] = this.tableRows[1].concat(list)
      this.tabType = '1'
      // this.personRows = list
      // 根据 代垫款是否开票, 爬楼费是否开票, 重新计算总金额
      this.flagUpdate(this.cushionFlag, this.climbingFlag)
      this.getPersonRows()
      this.$message.success(`添加${list.length}条数据成功!`)
    },
    // 更新选择的发票数据
    insertInvoiceData (data) {
      console.log('data', data)
      // this.formModel = {}
      up(this.formModel, data, [
        // 购方全称
        'deductionCompanyName',
        // 购方简称
        'deductionShortName',
        // 购方Number
        'deductionNumber',
        // 购方区域
        'deductionCompanyArea',
        // 购方识别号
        'deductionTaxNumber',
        // 销方公司
        'identificationCompany',
        // 销方识别号
        'carrierTaxNumber',
        // 开户行账户
        'bankName',
        // 地址,电话
        'companyAddress',
        // 内部备注
        'insideRemark',
        // 发票备注
        'remark',
        // 发票寄件地
        'invoiceAddress-address',
        // 企业类型
        'companyType',
        // 开票区域
        'invoiceArea',
        // 发票类型
        'invoiceForm',
        // 发票种类
        'invoiceType',
        // 发票信息ID
        'invoiceAddress-invoiceId',
        // 内部件单号
        'invoiceAddress-inWaybillNumber',
        // 收件地址编码
        'invoiceAddress-addressNumber',
        // 收件地址点部
        'invoiceAddress-addressPoint',
        // 接收人
        'invoiceAddress-invoiceSendee',
        // 接收电话
        'invoiceAddress-invoiceTel',
        // 地址省id
        'invoiceAddress-provinceId',
        // 省名称
        'invoiceAddress-provinceName',
        // 市id
        'invoiceAddress-cityId',
        // 市名称
        'invoiceAddress-cityName',
        // 区id
        'invoiceAddress-areaId',
        // 区名称
        'invoiceAddress-areaName',
        // 发票地址的其他信息(由于接口 fms.invoice.getCustomerList 里面没有备注)
        'invoiceAddress-creationDate',
        'invoiceAddress-enabledFlag',
        'invoiceAddress-inSingedDate',
        'invoiceAddress-inSinger',
        'invoiceAddress-id',
        'invoiceAddress-updationDate',
        // 开票名称
        'invoiceProductName',
        // 更新税率
        'taxRate',
        'customerInvoiceId',
        // 公司ID(付款公司ID)
        'companyId'
      ])
    },
    // 代垫款是否开票
    cushionFlagUpdate (val) {
      this.flagUpdate(val, this.climbingFlag)
    },
    // 爬楼费是否开票
    climbingFlagUpdate (val) {
      this.flagUpdate(this.cushionFlag, val)
    },
    // 返回开票总金额是包含了(爬楼费,代垫款项等各类增值明细费用的)
    // 根据 代垫款是否开票, 爬楼费是否开票, 重新计算总金额
    flagUpdate (cushionFlag, climbingFlag) {
      // 1.当不勾选代垫款项时总金额等于 返回总金额 - 代垫款项
      // 2.当不勾选爬楼费时,总金额等于 返回总金额 - 爬楼费
      // 勾选爬楼费,总金额就包括爬楼费,不勾选,就不包含爬楼费
      // 更新月结
      this.tableRows[0].forEach(li => {
        this.updateRowModelOnMonthly(li, {
          ...li,
          // 总金额
          allAmount: round(
            li._allAmount -
            (cushionFlag ? 0 : toNumber(li.cushionAmount)) -
            (climbingFlag ? 0 : toNumber(li['_climbingFee'])),
            2
          ),
          // 代垫款项, 爬楼费
          billReceivables: { cushionAmount: li.cushionAmount, climbingFee: li._climbingFee },
          // 月结应收编码
          billMonthly: { billNumber: li.billNumber }
        })
      })
      // 更新散客
      this.tableRows[1].forEach(li => {
        this.updateRowModelOnpersonally(li, {
          ...li,
          // 总金额
          allAmount: round(
            li._allAmount -
            (cushionFlag ? 0 : toNumber(li.cushionAmount)) -
            (climbingFlag ? 0 : toNumber(li['_climbingFee'])),
            2
          ),
          // 代垫款项 爬楼费
          billReceivables: { cushionAmount: li.cushionAmount, climbingFee: li._climbingFee },
          // 散客运单号
          billPerson: { waybillNumber: li.waybillNumber }
        })
      })
      // 更新开票金额
      this.updateInvoiceAmount()
    },
    // 保存-执行合并开票
    async dialogSubmit () {
      // TODO: 验证后期处理
      const [invalid] = await to(this.$refs.form.validate())
      if (invalid) {
        return console.warn(invalid)
      }

      // 已开票,提示不允许开票 fms_invoice_flag 有开票:'10' 无:'0' 部分开票:'20'
      const { invoiceFlag } = this.model
      if (toString(invoiceFlag) === '10') {
        return this.$message.warning('已开票,不允许再次开票!')
      }

      // 开票日期早于录单时间不能开票
      // 录单时间
      const { creationDate } = this.model
      // 开票日期
      const { invoiceDate } = this.formModel

      if (moment(invoiceDate).isBefore(creationDate, 'day')) {
        return this.$message.warning('开票日期早于录单时间不能开票!')
      }

      // TODO: 运单号不可重复

      // TODO: “开票类型”不等于空(只是提示不限制保存)

      // TODO: “公司名称”和“纳入月份”不可重复

      // 月结应收编码必须存在
      if (this.tableRows[0].find(li => !li.billNumber)) {
        return this.$message.warning('月结中信息不完整, 请输入公司名称和纳入月份获取!')
      }

      // 散客纳入月份预付款公司必须存在
      if (this.tableRows[1].find(li => !li.inMonth)) {
        return this.$message.warning('散客中信息不完整,请输入运单号获取!')
      }

      // 月结开票金额大于0小于未开票金额
      if (
        this.tableRows[0].find(li => {
          const invoiceUnAmount = toNumber(li.invoiceUnAmount, 0)
          return invoiceUnAmount <= 0 || invoiceUnAmount > toNumber(li.unIvoiceAmountComputed, 0)
        })
      ) {
        return this.$message.warning(
          '月结中"开票金额"必需小于等于"未开票金额"并且不能为空或为0或负数'
        )
      }

      // 散客开票金额大于0小于未开票金额
      if (
        this.tableRows[1].find(li => {
          const invoiceUnAmount = round(toNumber(li.invoiceUnAmount, 0), 2)
          return (
            invoiceUnAmount <= 0 ||
            invoiceUnAmount > round(toNumber(li.unIvoiceAmountComputed, 0), 2)
          )
        })
      ) {
        return this.$message.warning(
          '散客中"开票金额"必需小于等于"未开票金额"并且不能为空或为0或负数'
        )
      }

      // 需要保存主页面的 应收编码/运单号，月结/散客运单号 '0':月结 '1': 散客
      const billNumber =
        this.invoiceType === '0'
          ? this.model['billMonthly-billNumber']
          : this.model['billPerson-waybillNumber']

      // 发票信息
      const formModel = unflatten(this.formModel)

      // 应收编码，月结/散客运单号
      formModel.billNumber = billNumber
      // baseId
      formModel.billBaseId = this.model.id

      // 月结列表
      const monthlyList = this.tableRows[0]
        .filter(li => li.id)
        .map(it => {
          it.billMonthly = { billNumber: it.billNumber }
          return it
        })
      // 散客列表
      const personList = this.tableRows[1]
        .filter(li => li.id)
        .map(it => {
          it.billPerson = { waybillNumber: it.waybillNumber }
          return it
        })
      // 差额备注
      const balanceRemark = trim(this.formModel.balanceRemark)
      // 合并开票数据大于10条时且没有填写差额备注,提示
      if (monthlyList.length + personList.length > 10 && !balanceRemark) {
        return this.$message.warning('合并数据大于10条时, 请手动录入差额备注!')
      }

      const argsData = {
        // 开票信息
        ...formModel,
        // 月结列表
        monthlyList,
        // 散客列表
        personList,
        // 代垫款开票标识 1 开票 0 不开票
        cushionFlag: this.cushionFlag ? '1' : '0',
        // 爬楼费开票标识 1 开票 0 不开票
        climbingFlag: this.climbingFlag ? '1' : '0',
        // 开票类型(月结0 散客1)
        invoiceFlag: this.invoiceType,
        // 付款方式
        payMethod: this.model.payMethod
      }
      const args = this.$diff(argsData)
      /**
       *  判断敏感字段是否修改
       */
      console.log('this.maskField', this.maskField, this.formModel)
      Object.keys(this.maskField).forEach(item => {
        if (this.formModel[item] !== this.maskField[item]) {
          if (trim(this.formModel[item]) === '') {
            this.maskField[item] = null
          } else {
            this.maskField[item] = this.formModel[item]
          }
        } else {
          delete this.maskField[item]
        }
      })
      // 购方全称
      if (this.maskField.deductionCompanyName || this.maskField.deductionCompanyName === null) {
        args.deductionCompanyName = this.maskField.deductionCompanyName
      }
      if (!args.invoiceAddress) {
        args.invoiceAddress = {}
      }
      if (args.invoiceAddress) {
        // 发票寄件地
        if (
          this.maskField['invoiceAddress-address'] ||
          this.maskField['invoiceAddress-address'] === null
        ) {
          args.invoiceAddress.address = this.maskField['invoiceAddress-address']
        }

        // 接受人
        if (
          this.maskField['invoiceAddress-invoiceSendee'] ||
          this.maskField['invoiceAddress-invoiceSendee'] === null
        ) {
          args.invoiceAddress.invoiceSendee = this.maskField['invoiceAddress-invoiceSendee']
        }
        if (!args.invoiceAddress.invoiceSendee && args.invoiceAddress.invoiceSendee !== null) {
          args.invoiceAddress.invoiceSendee = ''
        }

        // 接受电话
        if (
          this.maskField['invoiceAddress-invoiceTel'] ||
          this.maskField['invoiceAddress-invoiceTel'] === null
        ) {
          args.invoiceAddress.invoiceTel = this.maskField['invoiceAddress-invoiceTel']
        }
        if (!args.invoiceAddress.invoiceTel && args.invoiceAddress.invoiceTel !== null) {
          args.invoiceAddress.invoiceTel = ''
        }
      }
      console.log('args', args.invoiceAddress.invoiceTel)

      try {
        this.loading = true
        const { isAwait, status, msg, obj, taskId } = await this.$http(
          APICommon['invoice-merge'],
          args
        )
        this.loading = false
        if (isAwait) {
          if (status === 'finish') {
            this.dialogParams.onSubmit && this.dialogParams.onSubmit()
            // 敏感字段缓存置空
            this.maskField = {
              deductionCompanyName: '',
              'invoiceAddress-address': '',
              'invoiceAddress-invoiceSendee': '',
              'invoiceAddress-invoiceTel': ''
            }
            this.fmsDialogClose()
            this.$message.success(typeof obj === 'object' ? JSON.stringify(obj) : obj)
          } else {
            this.$message.warning(typeof msg === 'object' ? JSON.stringify(msg) : msg)
          }
        } else {
          // 异步处理
          this.$$dialogOpen('FmsAsyncTask', {
            title: '处理中',
            taskId: taskId,
            isProgress: true,
            success: () => {
              this.$message.success('操作成功')
              this.dialogParams.onSubmit && this.dialogParams.onSubmit()
              this.fmsDialogClose()
              // 敏感字段缓存置空
              this.maskField = {
                deductionCompanyName: '',
                'invoiceAddress-address': '',
                'invoiceAddress-invoiceSendee': '',
                'invoiceAddress-invoiceTel': ''
              }
            }
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    // 更新开票金额
    updateInvoiceAmount (val) {
      let sum = 0
      this.tableRows[0].forEach(li => (sum += toNumber(li.invoiceUnAmount)))
      this.tableRows[1].forEach(li => (sum += toNumber(li.invoiceUnAmount)))
      // ! 这里需要注意后端的监控字段(为****号时,不可参与计算)
      // 更新开票金额
      this.formModel['invoiceAmount'] = round(sum, 2).toFixed(2)
      // 更新税金
      this.updateTaxAmount()
      // 更新不含税金额
      this.updateExclusiveTaxAmount()
      // 更新另补税金
      this.updateRepairTaxAmount()
    },
    // 更新税金: 开票金额 /（1 + 税率）* 税率
    updateTaxAmount () {
      const i = toNumber(this.formModel['invoiceAmount'])
      const t = toNumber(this.formModel['taxRate'])
      // 更新税金
      this.formModel['taxAmount'] = round((i / (1 + t)) * t, 2).toFixed(2)
    },
    // 更新不含税金额: 开票金额 /（1 + 税率）
    updateExclusiveTaxAmount () {
      const i = toNumber(this.formModel['invoiceAmount'])
      const t = toNumber(this.formModel['taxRate'])
      // 不含税金额
      this.formModel['exclusiveTaxAmount'] = round(i / (1 + t), 2).toFixed(2)
    },
    // 更新另补税金 开票金额 * 另补税点
    // TODO: 产品暂不更新
    updateRepairTaxAmount () {
      // const invoiceAmount = toNumber(this.formModel['invoiceAmount'])
      // const repairTaxRate = toNumber(this.model['repairTaxRate'])
      // this.formModel['repairTaxAmount'] = round(invoiceAmount * repairTaxRate, 2).toFixed(2)
    }
  }
}
