<template>
  <fms-dialog
    class="fms-expense-detail-dialog"
    :loading="loading"
    :loadingText="loadingText"
    v-bind="fmsDialogOptions"
    v-on="$listeners"
  >
    <!-- 录入表单 报销明细需要手动录入 -->
    <fms-form-grid
      ref="form"
      v-if="manualFlag"
      :grid="formGrid"
      :model="formModel"
      :labelWrap="true"
    />
    <!-- 搜索表单 -->
    <fms-form-block v-else :block="formBlock" :model="formModel" ref="form">
      <template slot-scope="{}" slot="searchBtn">
        <kye-button type="primary" icon="iconfont icon-search" @click="onSearch">查询</kye-button>
      </template>
    </fms-form-block>
    <!-- 数据统计 -->
    <fms-data-rows v-if="dataRows.items" :data="dataRows"/>
    <!-- 数据表格 -->
    <fms-table
      v-show="!manualFlag && tableCols.length > 0"
      :cols="tableCols"
      :rows="tableRows"
      :types="{ selection: true, index: true }"
      :pageShow="true"
      @row-selection="tableRowSelection"
    />
    <!-- 翻页 -->
    <fms-pagination
      v-if="dialogParams.onPageChange || page.change"
      slot="footer"
      :page="page"
      @change="pageChange"
    />
    <!-- 弹窗组件 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed"/>
    <!-- 组织部门选择 -->
    <fms-dept-dialog ref="fmsDeptDialog"></fms-dept-dialog>
  </fms-dialog>
</template>

<script>
  import FmsDialog from '@/fms/components/fms-dialog'
  import FmsDialogAlert from '@/fms/components/fms-dialog-alert'
  import FmsDialogConfirm from '@/fms/components/fms-dialog-confirm'
  import FmsPagination from '@/fms/components/fms-pagination'
  import FmsFormGrid from '@/fms/components/fms-form-grid'
  import FmsFormBlock from '@/fms/components/fms-form-block'
  import FmsRow from '@/fms/components/fms-row'
  import FmsDataRows from '@/fms/components/fms-data-rows'
  import FmsTable from '@/fms/components/fms-table'
  import FmsRender from '@/fms/components/fms-render'
  import dialogMixins from '@/fms/mixins/dialog'
  import fmsDialogMixins from '@/fms/mixins/fms-dialog'
  import paginationMixins from '@/fms/mixins/pagination'
  import { get, set, orderBy, trim, trimEnd, uniqBy, toString } from 'lodash'
  import {
    toNumber,
    toValues,
    carNumberSearch,
    employeeSearchNew,
    createGenericArgs
  } from '@/fms/utils'
  import { time, date } from '@/public/utils/filter'
  import FmsDeptDialog from '@/fms/components/fms-dept-dialog'
  import moment from 'moment'
  export default {
    mixins: [fmsDialogMixins, paginationMixins, dialogMixins],
    components: {
      FmsRow,
      FmsTable,
      FmsDialog,
      FmsRender,
      FmsDataRows,
      FmsFormGrid,
      FmsFormBlock,
      FmsDeptDialog,
      FmsPagination,
      FmsDialogAlert,
      FmsDialogConfirm
    },
    data() {
      return {
        fmsDialogOptions: {
          width: '1200px',
          submitCall: this.dialogSubmit,
          cancelCall: this.dialogCancel,
          beforeClose: this.dialogCancel
        },
        page: {},
        dataRows: {},
        formGrid: {},
        formBlock: {},
        formModel: {},
        tableCols: [],
        tableRows: [],
        // manualFlag 为true 时表示报销明细需要手动录入
        manualFlag: false,
        // 报销分类 费用明细类型
        feeTypeList: [],
        // 报销分类code
        expenseTypeCode: '',
        tableSelectedRows: [],
        formatters: {
          'array[string]': val => {
            try {
              val = JSON.parse(trim(val))
              if (Array.isArray(val)) {
                val = val.map(v => toString(v))
              }
            } catch (e) {
              console.error(e)
            }
            return val
          },
          'array[number]': val => {
            try {
              val = JSON.parse(trim(val))
              if (Array.isArray(val)) {
                val = val.map(v => toNumber(v))
              }
            } catch (e) {
              console.error(e)
            }
            return val
          },
          'date[dd]': val => {
            if (Array.isArray(val) && val.length === 2) {
              const [s, e] = val
              return [date(s), date(e)]
            } else {
              return date(val)
            }
          },
          'date[number]': val => {
            if (Array.isArray(val) && val.length === 2) {
              const [s, e] = val
              return [new Date(s).getTime(), new Date(e).getTime()]
            } else {
              return new Date(val).getTime()
            }
          },
          'date[string]': (val, key) => {
            // date类型 需要区分开始日期,结束日期, 约定根据 入参条件关系判断开始日期(大于)还是结束日期(小于)
            const it = this.apiRequestList.find(({ _key }) => _key === key)
            if (typeof val !== 'string' || !it) return val
            const { _operation } = it
            // 结束日期 2019-03-21 23:59:59
            if (_operation === 'lessthan') {
              return date(val) + ' 23:59:59'
            }
            // 开始日期 2019-03-21 00:00:00
            if (_operation === 'greaterthan') {
              return date(val) + ' 00:00:00'
            }
            return val
          }
        },
        formattersKeyMap: {},
        // 保存配置的时间查询的开始日期,结束日期的key
        dateRangeKeys: [],
        // 保存配置的最大的查询天数,0不限制
        searchRangeDays: 0,
        // 保存配置的时间查询为范围于的key
        dateRangeBetweenKey: ''
      }
    },
    methods: {
      async open(dialogParams) {
        console.log('ExpenseDetailDialog dialogParams: ', dialogParams)
        this.fmsDialogOpen(dialogParams)
        const {
          // 报销分类id
          expenseTypeId,
          // 报销分类名称
          expenseTypeName,
          // 报销分类Code
          oldExpenseTypeCode,
          // 报销分类对应配置
          expenseTypeConfig,
          // 报销其它数据 参考字典 expense_api_data_type 根据字典固定传值
          expenseData
        } = dialogParams.model

        this.expenseData = expenseData
        this.expenseTypeId = expenseTypeId
        this.expenseTypeCode = oldExpenseTypeCode
        this.fmsDialogOptions.title = expenseTypeName + '-明细'
        try {
          this.loading = true
          const res =
            expenseTypeConfig ||
            (await this.$http('ers.apiManage.getByExpenseTypeId', { expenseTypeId }))
          if (!res) {
            this.fmsDialogOptions.title = '获取报销分类配置数据为空'
            return this.$message.warning('获取报销分类配置数据为空!')
          }
          if (!expenseTypeConfig) {
            dialogParams.model.expenseTypeConfig = res
          }
          // 查询按钮请求方法
          this.apiCode = res.apiCode
          // 报销分类费用明细
          this.feeTypeList = res.feeTypeList || []
          // 是否是手动输入
          // manualFlag 为true 时表示报销明细需要手动录入
          this.manualFlag = !!res.manualFlag
          // 查询范围天数
          this.searchRangeDays = Math.floor(toNumber(trim(res.limitDay)))
          // 入参下拉选择列表
          this.dataCommonRequestList = res.dataCommonRequestList || []
          // 入参列表
          const apiRequestList = (res.apiRequestList || []).map((li, index, list) => {
            // 统一列表报销字段显示映射
            // 这里替换点为-主要是处理通用查询的字段会有表别名 d.start_date 而 el-form组件开启验证时不能有点
            // d.start_date => d-start_date
            li._key = trim(li.columnNameEn).replace(/\./g, '-')
            li._label = trim(li.columnNameZh)
            li._show = toString(li.showFlag) === '1'
            li._lookupCode = trim(li.columnAttributeValue)
            // 默认值
            li._defaultValue = li.columnDefaultValue
            // 数据类型: expense_column_type (string, number, date, month, enum, array[string], array[number])
            // 渲染组件
            li._component = li.columnAttribute
            // 组件值格式
            li._valueFormat = li.columnAttribute
            // 与和或: expense_and_or (and, or)
            li._conditionOperation = li.andOr
            // 条件关系: expense_genericQuery_relation (equal, contain, between, greaterthan, ...)
            li._operation = li.queryAttribute

            if (li.columnAttribute === 'array[string]' || li.columnAttribute === 'array[number]') {
              li._component = 'string'
            }
            if (
              li.columnAttribute === 'date[string]' ||
              li.columnAttribute === 'date[number]' ||
              li.columnAttribute === 'date[dd]' ||
              li.columnAttribute === 'month'
            ) {
              li._component = 'date'
              // 获取开始结束日期
              if (li._operation === 'between') {
                this.dateRangeBetweenKey = li._key
              }
              // 开始日期
              if (li._operation === 'greaterthan') {
                this.dateRangeKeys[0] = li._key
              }
              if (li._operation === 'lessthan') {
                this.dateRangeKeys[1] = li._key
              }
            }
            // 季度选择器
            if (li.columnAttribute === 'date[year]') {
              // 季度选择组件
              li._component = 'fmsSelectQuarter'
              // 设置默认值为 []
              li._defaultValue = []
              // 设置特殊key 仅在具体组件(like feeTypeSelector组件)中使用,用于展示值
              li._key_ = '_' + li._key + '_'
              // 获取赋值季度key
              const o = list.find(({ columnAttribute }) => columnAttribute === 'date[quarter]') || {}
              const k = trim(o.expenseColumnEn || o.columnNameEn)
              if (k) {
                li._quarter_key = k
              }
            }
            // 下拉选择器
            if (li.columnAttribute === 'select') {
              li._component = 'enum'
              li._options = this.dataCommonRequestList.map(({ id, name }) => ({
                value: id,
                label: name
              }))
            }
            li._width = li.width ? toString(toNumber(li.width)) + 'px' : undefined
            // 设置取值类型
            this.setComponentValueType(li, list)
            return li
          })
          // 出参列表 manualFlag 为true 时表示手动录入报销明细
          const apiResponeList = (res.apiResponeList || []).map((li, index, list) => {
            // 统一列表报销字段显示映射, 这里使用expenseColumnEn主要是为了后面提交保存时不需要转换
            // 赋值key
            li._key = trim(li.expenseColumnEn || li.columnNameEn)
            // 取值key
            li.__key = trim(li.columnNameEn)
            li._label = trim(li.columnNameZh)
            li._show = toString(li.showFlag) === '1'
            li._dataNode = trimEnd(trim(li.dataNode), '.')
            li._dataNodeKey = trim(li._dataNode + '.' + li.__key, '.')
            li._lookupCode = trim(li.columnAttributeValue)
            li._amountFlag = toString(li.amountFlag) === '1'
            // 去重标识 1: 是
            li._uniqueFlag = toString(li.uniqueFlag) === '1'
            // 默认值
            li._defaultValue = li.columnDefaultValue
            // 数据类型: system_genericsearch_column_type (string, number, date, enum, component)
            li._component = li.columnAttribute
            // 组件值格式
            li._valueFormat = li.columnAttribute

            if (li.columnAttribute === 'array[string]' || li.columnAttribute === 'array[number]') {
              li._component = 'string'
            }
            // 这些类型都使用date组件来渲染
            if (
              li.columnAttribute === 'date[string]' ||
              li.columnAttribute === 'date[number]' ||
              li.columnAttribute === 'date[dd]' ||
              li.columnAttribute === 'month'
            ) {
              li._component = 'date'
            }
            if (this.manualFlag) {
              li._width = Math.max(Math.min(toNumber(li.width), 24), 12) || 12
              // 设置取值类型
              this.setComponentValueType(li, list)

              // 路桥费, 停车费 ers_business_activity_type 需要过滤数据字典
              // 停车费 ：1（4 点部停车  5 行政停车  6 月结停车）；  路桥费：2  （7 其它）
              // 更新停车费 不再需要点部停车 2019年5月24日更改
              if (li._lookupCode === 'ers_business_activity_type') {
                if (toString(oldExpenseTypeCode) === '1') {
                  li._options = options =>
                    options.filter(it => ['5', '6'].includes(toString(it.value)))
                } else if (toString(oldExpenseTypeCode) === '2') {
                  li._options = options => options.filter(it => ['7'].includes(toString(it.value)))
                }
              }
            } else {
              li._width = trim(li.width) ? toString(toNumber(li.width)) + 'px' : undefined
            }
            return li
          })
          if (this.manualFlag) {
            // 手动录入输入报销明细, 设置弹窗宽度
            const showCols = apiResponeList.filter(li => li._show)
            if (showCols.length < 8) {
              this.fmsDialogOptions.width = 1
              apiResponeList.forEach(li => (li._width = 24))
              console.log('apiResponeList', apiResponeList)
            } else {
              this.fmsDialogOptions.width = 2
              apiResponeList.forEach(li => (li._width = 12))
            }
            this.formGrid = this.createFormGrid(apiResponeList)
          } else {
            this.formBlock = this.createFormBlock(apiRequestList)
          }
          this.apiRequestList = apiRequestList
          this.apiResponeList = apiResponeList
          this.formModel = this.createFormModel(this.manualFlag ? apiResponeList : apiRequestList)
          this.tableCols = this.createTableCols(apiResponeList)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      // 处理特殊组件(配置: 取值类型)
      setComponentValueType(li, list) {
        const {
          // 报销部门
          employeeDepartmentId,
          employeeDepartmentName
        } = this.dialogParams.model

        console.log('setComponentValueType', employeeDepartmentName, employeeDepartmentId)

        const valueType = trim(li.valueType)
        if (!valueType) return
        // 费用明细 字典: expense_value_type [费用类型ID:1, 费用类型名称: 2, 承担部门ID: 3, 承担部门名称: 4, 员工ID: 5, 员工姓名: 6]
        if (valueType === '2') {
          if (this.feeTypeList.length === 0) {
            li._show = false
          } else {
            li._component = 'feeTypeSelector'
            li._options = this.feeTypeList.map(it => ({
              label: it.name,
              value: { name: it.name, id: it.id }
            }))
            // 设置特殊key 仅在具体组件(like feeTypeSelector组件)中使用,用于展示值
            li._key_ = '_' + li._key + '_'
            // 设置费用明细 id key
            const o = list.find(({ valueType }) => toString(valueType) === '1') || {}
            const k = trim(o.expenseColumnEn || o.columnNameEn)
            // 注意这里的list,此时o._key还是undefined
            console.log('li._id_key', o._key)
            if (k) {
              li._id_key = k
            }
          }
          // 承担部门
        } else if (valueType === '4') {
          li._component = 'departmentSelector'
          // 设置承担部门默认值
          if (employeeDepartmentName) {
            li.columnDefaultValue = employeeDepartmentName
            li._defaultValue = employeeDepartmentName
          }
          // 设置承担部门ID key
          const o = list.find(({ valueType }) => toString(valueType) === '3') || {}
          // 设置承担部门ID 默认值
          if (employeeDepartmentId) {
            o.columnDefaultValue = employeeDepartmentId
            o._defaultValue = employeeDepartmentId
          }
          const k = trim(o.expenseColumnEn || o.columnNameEn)
          // 注意这里的list,此时o._key还是undefined
          console.log('li._id_key', o._key)
          if (k) {
            li._id_key = k
          }
        } else if (valueType === '6' || valueType === '7') {
          // 员工搜索组件 （valueType：6 正常在职员工 valueType：7 要查出在职和离职员工）
          li._component = 'employeeSearch'
          // 设置特殊key 仅在具体组件(like feeTypeSelector组件)中使用,用于展示值
          li._key_ = '_' + li._key + '_'
          // 设置费用明细 id key
          const o = list.find(({ valueType }) => toString(valueType) === '5') || {}
          const k = trim(o.expenseColumnEn || o.columnNameEn)
          // 注意这里的list,此时o._key还是undefined
          console.log('li._id_key', o._key, k)
          if (k) {
            li._id_key = k
          }
        } else {
          // 费用明细id,承担部门id
          li._show = false
        }
      },
      // 创建入参model
      createFormModel(list) {
        const formModel = {}
        list = orderBy(list, ['sort'], ['asc'])
        list.forEach(li => {
          formModel[li._key] = li._defaultValue || ''
          if (li._key_) {
            formModel[li._key_] = li._defaultValue || ''
          }
          this.formattersKeyMap[li._key] = li.columnAttribute
          // 取值前端 OA页面固定传入前端页面值
          if (li.dataFromFrontend && this.expenseData) {
            formModel[li._key] = this.expenseData[li.dataFromFrontend]
          }
        })
        // 有配置查询天数限制 设置查询默认时间 结束时间默认为当前日期
        if (this.searchRangeDays) {
          const endDay = moment().format('YYYY-MM-DD')
          const startDay = moment()
            .subtract(this.searchRangeDays, 'days')
            .format('YYYY-MM-DD')
          // 有配置范围于查询
          if (this.dateRangeBetweenKey) {
            formModel[this.dateRangeBetweenKey] = [startDay, endDay]
          }
          // 有配置开始结束日期
          if (this.dateRangeKeys.length === 2) {
            const [startKey, endKey] = this.dateRangeKeys
            if (startKey && endKey) {
              formModel[endKey] = endDay
              formModel[startKey] = startDay
            }
          }
        }
        return formModel
      },
      createBlockCols(list, manualFlag = false) {
        // list是否显示 交由组件内部处理, 因为这边传给OA页面需要某些不显示的字段,比如id
        // list = list.filter(li => li._show)
        list = orderBy(list, ['sort'], ['asc'])

        const emptyAllLabel = []
        const emptyAllKey = list.reduce((acc, li) => {
          if (toString(li.queryEmptyFlag) === '2') {
            acc.push(li._key)
            emptyAllLabel.push(li._label)
          }
          return acc
        }, [])

        const errEmptyMsg = `${emptyAllLabel.join(' , ')} 不能同时为空`

        const isEmptyAll = () => {
          let isEmpty = true
          emptyAllKey.forEach(k => {
            if (typeof this.formModel[k] === 'string') {
              isEmpty &= trim(this.formModel[k]) === ''
            }
            if (Array.isArray(this.formModel[k])) {
              isEmpty &= this.formModel[k].length < 2
            }
          })
          return isEmpty && !manualFlag
        }

        const componentMap = {
          string: li => ({
            key: li._key,
            label: li._label,
            span: manualFlag ? li._width : undefined,
            width: manualFlag ? undefined : li._width,
            trim: true,
            show: li._show,
            component: 'kye-input',
            componentProps: {
              placeholder: '',
              clearable: true,
              style: manualFlag ? undefined : { width: li._width || '120px' }
            },
            rules: [
              {
                required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                trigger: manualFlag ? 'blur' : 'none',
                validator: (rule, value, callback) => {
                  // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                  const queryEmptyFlag = toString(li.queryEmptyFlag)
                  if (queryEmptyFlag === '0' && !value) {
                    !manualFlag && this.$message.warning(`${li._label}不能为空`)
                    return callback(manualFlag ? new Error('必填') : new Error())
                  } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                    // 其它值都为空时,才验证
                    this.$message.warning(errEmptyMsg)
                    return callback(new Error())
                  }
                  callback()
                }
              }
            ]
          }),
          number: li => ({
            key: li._key,
            label: li._label,
            show: li._show,
            span: manualFlag ? li._width : undefined,
            width: manualFlag ? undefined : li._width,
            component: 'kye-number',
            componentProps: {
              placeholder: '',
              clearable: true,
              precision: 2,
              style: manualFlag ? undefined : { width: li._width || '120px' }
            },
            rules: [
              {
                required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                trigger: manualFlag ? 'blur' : 'none',
                validator: (rule, value, callback) => {
                  // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                  const queryEmptyFlag = toString(li.queryEmptyFlag)
                  if (queryEmptyFlag === '0' && !value) {
                    !manualFlag && this.$message.warning(`${li._label}不能为空`)
                    return callback(manualFlag ? new Error('必填,只可以为数字') : new Error())
                  } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                    // 其它值都为空时,才验证
                    this.$message.warning(errEmptyMsg)
                    return callback(new Error())
                  }
                  callback()
                }
              }
            ]
          }),
          enum: li => {
            const col = {
              key: li._key,
              label: li._label,
              span: manualFlag ? li._width : undefined,
              show: li._show,
              width: manualFlag ? undefined : li._width,
              component: 'kye-select',
              lookupCode: li._lookupCode,
              componentProps: {
                style: manualFlag ? undefined : { width: li._width || '120px' }
              },
              rules: [
                {
                  required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                  trigger: manualFlag ? 'blur' : 'none',
                  validator: (rule, value, callback) => {
                    // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                    const queryEmptyFlag = toString(li.queryEmptyFlag)
                    if (queryEmptyFlag === '0' && !value) {
                      !manualFlag && this.$message.warning(`${li._label}不能为空`)
                      return callback(manualFlag ? new Error('必填') : new Error())
                    } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                      // 其它值都为空时,才验证
                      this.$message.warning(errEmptyMsg)
                      return callback(new Error())
                    }
                    callback()
                  }
                }
              ]
            }
            if (li._options) {
              col.options = li._options
            }
            return col
          },
          date: li => {
            // expense_genericQuery_relation 条件关系 between
            const between = li._operation === 'between'
            const type = {
              // TODO: 月份支持范围于, 目前暂不支持
              month: 'month',
              'date[dd]': between ? 'daterange' : 'date',
              'date[number]': between ? 'daterange' : 'date',
              'date[string]': between ? 'daterange' : manualFlag ? 'datetime' : 'date'
            }[li._valueFormat]

            return {
              key: li._key,
              label: li._label,
              show: li._show,
              span: manualFlag ? li._width : undefined,
              width: manualFlag ? undefined : li._width,
              component: 'kye-date-picker',
              componentProps: {
                type: type,
                clearable: true,
                editable: false,
                style: manualFlag
                  ? undefined
                  : {
                      width: type === 'date' ? '110px' : type === 'daterange' ? '168px' : undefined
                    }
              },
              rules: [
                {
                  required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                  trigger: manualFlag ? 'blur' : 'none',
                  validator: (rule, value, callback) => {
                    // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                    const queryEmptyFlag = toString(li.queryEmptyFlag)
                    if (queryEmptyFlag === '0' && !value) {
                      !manualFlag && this.$message.warning(`${li._label}不能为空`)
                      return callback(manualFlag ? new Error('必填') : new Error())
                    } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                      // 其它值都为空时,才验证
                      this.$message.warning(errEmptyMsg)
                      return callback(new Error())
                    }
                    callback()
                  }
                }
              ]
            }
          },
          // 报销分类-费用明细类型-选择
          feeTypeSelector: li => {
            return {
              key: li._key_ || li._key,
              label: li._label,
              show: li._show,
              span: manualFlag ? li._width : undefined,
              width: manualFlag ? undefined : li._width,
              component: 'kye-select',
              componentProps: {
                valueKey: 'name',
                style: manualFlag ? undefined : { width: li._width || '120px' }
              },
              componentListeners: {
                change: val => {
                  if (val) {
                    // 更新选择的值
                    this.formModel[li._key] = val.name
                    this.formModel[li._id_key] = val.id
                    console.log('this.formModel', this.formModel)
                  } else {
                    this.formModel[li._key] = ''
                    this.formModel[li._key_] = ''
                    this.formModel[li._id_key] = ''
                  }
                }
              },
              options: li._options,
              rules: [
                {
                  required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                  trigger: manualFlag ? 'blur' : 'none',
                  validator: (rule, value, callback) => {
                    // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                    const queryEmptyFlag = toString(li.queryEmptyFlag)
                    if (queryEmptyFlag === '0' && !value) {
                      !manualFlag && this.$message.warning(`${li._label}不能为空`)
                      return callback(manualFlag ? new Error('必填') : new Error())
                    } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                      // 其它值都为空时,才验证
                      this.$message.warning(errEmptyMsg)
                      return callback(new Error())
                    }
                    callback()
                  }
                }
              ]
            }
          },
          // 报销分类-费用承担部门-选择
          departmentSelector: li => {
            return {
              key: li._key,
              label: li._label,
              show: li._show,
              span: manualFlag ? li._width : undefined,
              width: manualFlag ? undefined : li._width,
              trim: true,
              component: 'kye-input',
              componentProps: {
                clearable: true,
                readonly: true,
                placeholder: '',
                style: manualFlag ? undefined : { width: li._width || '130px' }
              },
              componentListeners: {
                focus: () => {
                  console.log('departmentSelector focus')
                  this.$refs.fmsDeptDialog.open({
                    onSubmit: ({ id, name }) => {
                      console.log('departmentSelector', id, name)
                      // 更新组织部门
                      this.formModel[li._key] = name
                      if (li._id_key) {
                        this.formModel[li._id_key] = id
                      }
                    }
                  })
                }
              },
              rules: [
                {
                  required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                  trigger: manualFlag ? 'change' : 'none',
                  validator: (rule, value, callback) => {
                    // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                    const queryEmptyFlag = toString(li.queryEmptyFlag)
                    if (queryEmptyFlag === '0' && !value) {
                      !manualFlag && this.$message.warning(`${li._label}不能为空`)
                      return callback(manualFlag ? new Error('必填') : new Error())
                    } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                      // 其它值都为空时,才验证
                      this.$message.warning(errEmptyMsg)
                      return callback(new Error())
                    }
                    callback()
                  }
                }
              ]
            }
          },
          // 季度选择
          fmsSelectQuarter: li => {
            return {
              key: li._key_ || li._key,
              label: '季度',
              span: manualFlag ? li._width : undefined,
              width: manualFlag ? undefined : li._width,
              show: li._show,
              component: 'FmsSelectQuarter',
              componentProps: {
                placeholder: '',
                clearable: true,
                style: manualFlag ? undefined : { width: li._width || '130px' }
              },
              componentListeners: {
                change: val => {
                  if (val && val.length === 2) {
                    this.formModel[li._key] = val[0]
                    this.formModel[li._quarter_key] = val[1]
                  } else {
                    this.formModel[li._key] = ''
                    this.formModel[li._quarter_key] = ''
                  }
                  console.log('fmsSelectQuarter val', val)
                }
              },
              rules: [
                {
                  required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                  trigger: manualFlag ? 'change' : 'none',
                  validator: (rule, value, callback) => {
                    // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                    const queryEmptyFlag = toString(li.queryEmptyFlag)
                    if (queryEmptyFlag === '0' && (!value || value.length < 2)) {
                      !manualFlag && this.$message.warning(`季度不能为空`)
                      return callback(manualFlag ? new Error('必填') : new Error())
                    } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                      // 其它值都为空时,才验证
                      this.$message.warning(errEmptyMsg)
                      return callback(new Error())
                    }
                    callback()
                  }
                }
              ]
            }
          },
          // 员工搜索
          employeeSearch: li => {
            // 兼容需要特殊配置的查询条件
            console.log(li, 9999)
            let params = {}
            if (li.valueType === 7) { // valueType：7 入参-取值类型为 7 时需查询出离职员工
              params = {
                formatData: {
                  isLeaved: 'Y'
                }
              }
            }
            return {
              key: li._key_ || li._key,
              label: li._label,
              span: manualFlag ? li._width : undefined,
              width: manualFlag ? undefined : li._width,
              show: li._show,
              component: 'kye-search-tips',
              componentProps: {
                ...employeeSearchNew(params),
                placeholder: '',
                style: manualFlag ? undefined : { width: li._width || '110px' }
              },
              componentListeners: {
                // 注意使用箭头函数
                select: res => {
                  if (res) {
                    // 员工id, 员工name
                    const { id, name } = res
                    // 更新员工姓名
                    this.formModel[li._key] = name
                    if (li._id_key) {
                      this.formModel[li._id_key] = id
                    }
                  } else {
                    // TODO: 配置是否支持外部人员(查询不到,保留姓名,不清空输入框)
                    this.formModel[li._key] = ''
                    this.formModel[li._key_] = ''
                    if (li._id_key) {
                      this.formModel[li._id_key] = ''
                    }
                  }
                },
                clear: () => {
                  console.log('employeeSearch clear', this.formModel)
                  this.formModel[li._key] = ''
                  this.formModel[li._key_] = ''
                  if (li._id_key) {
                    this.formModel[li._id_key] = ''
                  }
                }
              },
              rules: [
                {
                  required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                  trigger: manualFlag ? 'blur' : 'none',
                  validator: (rule, value, callback) => {
                    // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                    const queryEmptyFlag = toString(li.queryEmptyFlag)
                    if (queryEmptyFlag === '0' && !value) {
                      !manualFlag && this.$message.warning(`${li._label}不能为空`)
                      return callback(manualFlag ? new Error('必填') : new Error())
                    } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                      // 其它值都为空时,才验证
                      this.$message.warning(errEmptyMsg)
                      return callback(new Error())
                    }
                    callback()
                  }
                }
              ]
            }
          },
          // 车牌搜索
          carNumberSearch: li => {
            return {
              key: li._key_ || li._key,
              label: li._label,
              span: manualFlag ? li._width : undefined,
              width: manualFlag ? undefined : li._width,
              show: li._show,
              component: 'kye-search-tips',
              componentProps: {
                ...carNumberSearch(),
                placeholder: '',
                style: manualFlag ? undefined : { width: li._width || '110px' }
              },
              componentListeners: {
                // 注意使用箭头函数
                select: res => {
                  if (res) {
                    // 更新车牌号码
                    const { plateNumber } = res
                    this.formModel[li._key] = plateNumber
                  } else {
                    this.formModel[li._key] = ''
                  }
                },
                clear: () => {
                  console.log('carNumberSearch clear', this.formModel)
                  this.formModel[li._key] = ''
                }
              },
              rules: [
                {
                  required: manualFlag ? toString(li.queryEmptyFlag) === '0' : false,
                  trigger: manualFlag ? 'blur' : 'none',
                  validator: (rule, value, callback) => {
                    // li.queryEmptyFlag fms_expense_config_yn 是否允许为空 1: 是 0: 否 2: 关联其它值
                    const queryEmptyFlag = toString(li.queryEmptyFlag)
                    if (queryEmptyFlag === '0' && !value) {
                      !manualFlag && this.$message.warning(`${li._label}不能为空`)
                      return callback(manualFlag ? new Error('必填') : new Error())
                    } else if (queryEmptyFlag === '2' && !value && isEmptyAll()) {
                      // 其它值都为空时,才验证
                      this.$message.warning(errEmptyMsg)
                      return callback(new Error())
                    }
                    callback()
                  }
                }
              ]
            }
          }
        }
        return list.map(li => (componentMap[li._component] || componentMap['string'])(li))
      },
      createFormGrid(list) {
        const cols = this.createBlockCols(list, true)
        return { cols }
      },
      // 创建入参block
      createFormBlock(list) {
        const cols = this.createBlockCols(list, false)
        return {
          gutter: 0,
          inline: true,
          // labelWidth: '64px',
          inlineMargin: true,
          labelPosition: 'right',
          rows: [{ cols: [...cols, { slot: 'searchBtn', span: 4 }] }]
        }
      },
      // 创建出参列表
      createTableCols(list) {
        // list是否显示 交由组件内部处理, 因为这边传给OA页面需要某些不显示的字段,比如id
        // list = list.filter(li => li._show)
        list = orderBy(list, ['sort'], ['asc'])
        return list.map(li => {
          const col = {
            key: li._key,
            label: li._label,
            show: li._show,
            amountFlag: li._amountFlag,
            minWidth: this.manualFlag ? '145px' : li._width,
            _key: li._key,
            __key: li.__key,
            _component: li._component,
            _uniqueFlag: li._uniqueFlag
          }
          if (['date[dd]', 'date[number]'].includes(li._valueFormat)) {
            col.filter = 'date'
          } else if (li._valueFormat === 'date[string]') {
            col.filter = 'minute'
          } else if (li._valueFormat === 'enum') {
            col.options = li._options
            col.lookupCode = li._lookupCode
          } else if (li._amountFlag) {
            col.filter = 'money'
          }
          return col
        })
      },
      // 创建列表行model
      createTableRowModel(list, cols) {
        console.log('createTableRowModel', list, cols)
        return list.map(li =>
          cols.reduce(
            (o, { _key, __key, _valueFormat, _uniqueFlag, _component }) => {
              o[_key] = get(li, __key, '')
              // 统一处理日期时间格式问题
              if (_component === 'date') {
                // 处理后端返回的时间戳
                o[_key] = isNaN(Number(o[_key])) ? o[_key] : time(Number(o[_key]))
              }
              if (_uniqueFlag) {
                // 设置去重标识值
                o['_uniqueValue'] += (o['_uniqueValue'] ? '-' : '') + JSON.stringify(o[_key] || '')
              }
              return o
            },
            { _uniqueValue: '' }
          )
        )
      },
      // 创建列表渲染数据
      createTableRows(res) {
        console.log('createTableRows', res)
        let rows = []
        if (!res) {
          return rows
        }
        // 如果返回的是列表,那么
        if (Array.isArray(res)) {
          rows = this.createTableRowModel(res, this.apiResponeList)
          return rows
        }
        // 不是列表 那么返回的就是对象
        const primitiveValues = {}
        const hasDataNode = this.apiResponeList.some(li => !!li._dataNode)
        const list = hasDataNode ? uniqBy(this.apiResponeList, '_dataNode') : this.apiResponeList
        // 是否配置的是只有一个node节点 且都是同一个 这样去重后 list长度将为1
        const allDataNodeSame = hasDataNode && list.length === 1
        console.log('createTableRows list', list)
        list.forEach(li => {
          console.log('apiResponeList _dataNode', li._dataNode)
          const val = get(res, li._dataNode)
          // 目前只支持一个list
          if (Array.isArray(val) && val.length > 0) {
            rows = this.createTableRowModel(val, this.apiResponeList)
          } else if (!allDataNodeSame) {
            primitiveValues[li._key] = get(res, li._dataNodeKey)
          }
        })
        if (rows.length === 0 && !allDataNodeSame) {
          rows.push(primitiveValues)
        } else if (rows.length > 0 && !allDataNodeSame) {
          Object.keys(primitiveValues).forEach(key => {
            rows.forEach(row => (row[key] = primitiveValues[key]))
          })
        }
        console.log('createTableRows rows', rows)
        return rows
      },
      // 创建通用查询入参
      createGenericReqModel(apiRequestList, formModel, elasticsearchFlag) {
        const genericJson = apiRequestList.map(li => {
          const key = li._key.replace(/-/g, '.')
          let columnTypeMap = {
            date: 'date',
            enum: 'enum',
            string: 'string'
          }
          return {
            propertyName: key,
            columnName: key,
            columnType: columnTypeMap[li._component] || 'string',
            operation: li._operation,
            conditionOperation: li._conditionOperation
          }
        })
        return createGenericArgs(genericJson, formModel, { elasticsearchFlag })
      },
      // 处理formModel
      handleFormModel(model) {
        return Object.keys(model).reduce((o, key) => {
          const k = key.replace(/-/g, '.')
          // o[k] = model[key]
          set(o, k, model[key])
          return o
        }, {})
      },
      // formatModel
      formatSearchModel(model) {
        return Object.keys(model).reduce((o, k) => {
          const v = model[k]
          console.log('formatSearchModel', k, this.formattersKeyMap)
          const f = this.formattersKeyMap[k]
          if (this.formatters[f]) {
            o[k] = this.formatters[f](v, k)
          } else {
            o[k] = v
          }
          return o
        }, {})
      },
      async onSearch() {
        await this.$refs.form.validate()
        let reqModel = this.$refs.form.getFormModel(true)
        console.log('reqModel', reqModel, this.searchRangeDays)
        // 有配置查询天数限制
        if (this.searchRangeDays) {
          console.log(
            'searchRangeDays',
            this.searchRangeDays,
            this.dateRangeKeys,
            this.dateRangeBetweenKey
          )
          // 有配置范围于查询
          if (this.dateRangeBetweenKey) {
            const dateRange = reqModel[this.dateRangeBetweenKey]
            if (Array.isArray(dateRange) && dateRange.length === 2) {
              const [start, end] = dateRange
              const diffDays = Math.abs(moment(end).diff(moment(start), 'days'))
              if (diffDays > this.searchRangeDays) {
                return this.$message.warning(`查询天数最多为${this.searchRangeDays}天`)
              }
            }
          }
          // 有配置开始结束日期
          if (this.dateRangeKeys.length === 2) {
            const start = reqModel[this.dateRangeKeys[0]]
            const end = reqModel[this.dateRangeKeys[1]]
            if (start && end) {
              const diffDays = Math.abs(moment(end).diff(moment(start), 'days'))
              if (diffDays > this.searchRangeDays) {
                return this.$message.warning(`查询天数最多为${this.searchRangeDays}天`)
              }
            }
          }
        }
        reqModel = this.formatSearchModel(reqModel)
        // 是否是通用查询, 通用查询是否是 es 查询
        const expenseTypeConfig = this.dialogParams.model.expenseTypeConfig || this.dialogParams.model
        const { genericFlag, esFlag } = expenseTypeConfig
        if (toString(genericFlag) === '1') {
          console.log('onSearch - genericFlag', reqModel)
          const elasticsearchFlag = toString(esFlag) === '1' ? 'Y' : 'N'
          reqModel = this.createGenericReqModel(this.apiRequestList, reqModel, elasticsearchFlag)
        } else {
          reqModel = this.handleFormModel(reqModel)
        }
        try {
          this.loading = true
          let res = await this.$http(this.apiCode, reqModel)
          this.tableRows = this.createTableRows(res)
          console.log('this.tableCols', this.tableCols)
          console.log('this.tableRows', this.tableRows)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      tableRowSelection(rows) {
        this.tableSelectedRows = rows || []
        console.log('tableRowSelection', rows)
      },
      dialogLoading(loading = true) {
        this.loading = !!loading
        if (typeof loading !== 'string') {
          this.loadingText = ''
        } else {
          this.loadingText = loading
        }
      },
      dialogCancel() {
        const { onCancel } = this.dialogParams
        onCancel && onCancel()
        this.fmsDialogClose()
      },
      async dialogSubmit() {
        try {
          // TODO: 手动输入报销明细 验证model值不能都为空
          if (this.manualFlag) {
            await this.$refs.form.validate()
            if (toValues(this.formModel).length === 0) {
              return this.$message.warning('数据不可都为空!')
            }

            // 当报销分类为 租房补贴(108) 需要验证车牌号存在
            // 车牌号已经使用了模糊匹配 就不再需要保存时再去验证了
            // if (toString(this.expenseTypeCode) === '108') {
            //   const { carNumber } = this.formModel
            //   this.dialogLoading()
            //   const res = await this.$http('vms.vehicle.getVehicleInfo', { plateNumber: carNumber })
            //   this.dialogLoading(false)
            //   if (!res || !res.vo || !res.vo.plateNumber) {
            //     return this.$message.warning('车牌号不存在!')
            //   }
            // }
          }
          // 列表选择报销明细
          if (!this.manualFlag && this.tableSelectedRows.length === 0) {
            return this.$message.warning('请选择数据!')
          }
          // 验证
          const { onSubmit } = this.dialogParams
          const tableCols = this.tableCols
          const amountKey = (this.tableCols.find(col => col.amountFlag) || {}).key
          const tableRows = this.manualFlag ? [this.formModel] : this.tableRows
          const tableSelectedRows = this.manualFlag ? [this.formModel] : this.tableSelectedRows
          const submitModel = {
            amountKey,
            tableCols,
            tableRows,
            tableSelectedRows
          }
          console.log('submitModel', submitModel)
          onSubmit && onSubmit(submitModel)
          this.fmsDialogClose()
        } catch (e) {
          this.dialogLoading(false)
          console.error(e)
        }
      },
      pageChange(type, val) {
        this.page[type] = val
        if (this.dialogParams.onPageChange) {
          this.dialogParams.onPageChange()
        }
        if (this.page.change) {
          this.page.change()
        }
      }
    }
  }
</script>

<style lang="scss">
  .fms-expense-detail-dialog {
    .el-dialog__body {
      padding-bottom: 0;
    }
    .fms-table {
      margin-bottom: 16px;
    }
  }
</style>
