<template>
  <!-- @TODO: 合并 fms-table 组件 -->
  <kye-form
    class="fms-form fms-form-table"
    :class="fmsFormTableComputed"
    :ref="'form'"
    :rules="rules"
    :model="model"
    :label-position="labelPosition || 'right'"
  >
    <fms-block-title v-if="title" :title="title"></fms-block-title>
    <!-- kye-table slot append,empty 插槽有问题 这里先使用 el-table -->
    <!-- 禁止hover https://github.com/ElemeFE/element/issues/4321 -->
    <el-table
      :data="rows"
      :ref="'table'"
      :border="border"
      :height="getHeight"
      :max-height="getMaxHeight"
      :default-sort="defaultSort"
      :highlight-current-row="true"
      :row-class-name="hover ? undefined : 'no-hover'"
      v-on="$listeners"
      v-bind="$attrs"
      v-loading="loading"
      @row-click="rowClick"
      @row-dblclick="rowDbClick"
      @header-dragend="headerDragend"
      @current-change="rowCurrentChange"
      @selection-change="rowSelectionChange"
    >
      <el-table-column
        v-if="
        types.selection === true ||
        types.selection === 'checkbox' ||
        types.selection === 'radio-checkbox' ||
        types.selection === 'checkbox-radio'"
        :type="'selection'"
        :width="'40'"
        :align="'center'"
        :fixed="'left'"
      />
      <el-table-column
        v-if="types.selection === 'radio'"
        :width="'50'"
        :fixed="'left'"
        :align="'center'"
        :label="'选择'"
      >
        <template slot-scope="scope">
          <el-radio
            v-model="radio"
            :label="scope.row"
            size="mini"
            @click.native.stop="() => {}"
            class="fms-table-radio"
          >
            <span></span>
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column
        v-if="types.index"
        label="序号"
        :type="'index'"
        :width="'40'"
        :fixed="'left'"
        :align="'center'"
      />
      <!-- 注意,这里的sortable需要设置prop -->
      <el-table-column
        v-for="(col, i) in getCols"
        :key="col.id || i"
        :prop="col.key"
        :label="col.label"
        :width="col.width"
        :fixed="col.fixed || false"
        :align="col.align || align"
        :sortable="col.sortable !== undefined ? col.sortable : sortable || false"
        :sort-orders="['ascending', 'descending']"
        :min-width="col.minWidth || col.width || '120px'"
        :render-header="col.renderHeader || (() => col.label)"
        :show-overflow-tooltip="tooltip ? (col.tips === undefined && !cols.editable) ? true : col.tips : false"
        v-on="col.attrs"
      >
        <template slot-scope="scope">
          <!-- 监控字段 / 虚拟号码 -->
          <template v-if="isDecryptField(col, scope.row)">
            <kye-button
              type="link"
              @click="onDecryptField(col, scope.row)"
            >{{getValue(col, scope.row)}}</kye-button>
          </template>
          <template v-else-if="col.slot">
            <slot :name="col.slot" :row="scope.row" :col="col" :index="scope.$index"></slot>
          </template>
          <!-- 链接 -->
          <template v-else-if="col.link">
            <kye-button
              type="text"
              @click="onLink(col, scope.row)"
            >{{ filter(col, scope.$index, scope.row, scope.col ) }}</kye-button>
          </template>
          <template
            v-else-if="!col.component && !col.render"
          >{{ filter(col, scope.$index, scope.row, scope.col ) }}</template>
          <template v-else>
            <span
              v-if="readonly || (!col.render && !col.editable)"
            >{{ filter(col, scope.$index, scope.row, scope.col ) }}</span>
            <kye-form-item
              v-else-if="col.render || col.editable"
              :ref="col.ref ? (col.ref + '-' + col.key) : col.key"
              :size="'mini'"
              :label-width="'0'"
              :data-index="scope.$index"
              :prop="scope.$index + '.' + col.key"
              :rules="col.rules || undefined"
              :required="col.required"
              style="margin-bottom: 0"
            >
              <fms-components :col="col" :model="scope.row" :index="scope.$index" />
            </kye-form-item>
          </template>
        </template>
      </el-table-column>
      <el-row
        slot="append"
        v-if="showAddBtn && !readonly && rows.length > 0"
        style="margin: 10px 0"
        type="flex"
        justify="center"
      >
        <kye-button
          type="primary"
          @click="addRow"
          icon="iconfont icon-plus"
          :style="showAddBtnStyle"
        >{{addBtnText}}</kye-button>
      </el-row>
      <el-row slot="empty" v-if="showAddBtn && !readonly" type="flex" justify="center">
        <kye-button
          type="primary"
          @click="addRow"
          icon="iconfont icon-plus"
          :style="showAddBtnStyle"
        >{{addBtnText}}</kye-button>
      </el-row>
    </el-table>
    <el-row v-if="showAddBtnBottom && !readonly" type="flex" justify="end">
      <kye-button
        type="text"
        @click="addRow"
        icon="iconfont icon-plus"
        class="fms-form-table-add-btn"
        :style="showAddBtnBottomStyle"
      >{{addBtnText}}</kye-button>
    </el-row>
  </kye-form>
</template>

<script>
  import { MODULECODE } from '@/fms/config'
  import { decrypt, getModalPageName } from 'public/utils/common'
  import { last, get, set, hasIn } from 'lodash'
  import { Table, TableColumn } from 'element-ui'
  import FmsFormMixins from '@/fms/mixins/fms-form'
  import currentUserMixin from '@/fms/mixins/current-user'
  import FmsComponents from '@/fms/components/fms-components'
  import FmsBlockTitle from '@/fms/components/fms-block-title'
  import { filter, localStore, toNumber, uuid, getModuleCode } from '@/fms/utils'
  const ElTable = { extends: Table }
  const ElTableColumn = { extends: TableColumn }
  export default {
    props: {
      id: String,
      bizId: String,
      title: String,
      inline: Boolean,
      loading: Boolean,
      defaultSort: Object,
      labelPosition: String,
      height: [String, Number],
      maxHeight: [String, Number],
      sortable: [Boolean, String],
      cols: { type: Array, default: () => [] },
      rows: { type: Array, default: () => [] },
      rules: { type: Object, default: () => ({}) },
      types: { type: Object, default: () => ({}) },
      align: { type: String, default: 'left' },
      hover: { type: Boolean, default: false },
      border: { type: Boolean, default: true },
      readonly: { type: Boolean, default: false },
      addBtnText: { type: String, default: '新增' },
      showAddBtn: { type: Boolean, default: false },
      tooltip: { type: Boolean, default: true },
      rowHeightAuto: { type: Boolean, default: false },
      moduleCode: { type: String, default: MODULECODE },
      showAddBtnStyle: { type: Object, default: () => ({}) },
      showAddBtnBottom: { type: Boolean, default: false },
      showAddBtnBottomStyle: { type: Object, default: () => ({}) }
    },
    name: 'fms-form-table',
    mixins: [FmsFormMixins, currentUserMixin],
    components: { ElTable, ElTableColumn, FmsComponents, FmsBlockTitle },
    computed: {
      model() {
        const model = this.rows.reduce((a, r, i) => {
          a[i] = r
          return a
        }, {})
        return model
      },
      form() {
        return this.$refs.form
      },
      table() {
        return this.$refs.table
      },
      getCols() {
        return this.cols.filter(col => this.show(col))
      },
      getHeight() {
        return toNumber(this.height, undefined)
      },
      getMaxHeight() {
        return toNumber(this.maxHeight, undefined) || toNumber(this.maxHeightInner, undefined)
      },
      fmsFormTableComputed() {
        return {
          'fms-form-table-win': (navigator.platform || '').toLowerCase().includes('win'),
          'fms-form-table-empty': this.rows.length === 0,
          'fms-form-table-inline': this.inline,
          'fms-table-row-height-auto': this.rowHeightAuto
        }
      },
      moduleCodeComputed() {
        return getModuleCode(this) || this.moduleCode
      }
    },
    data() {
      return {
        radio: null,
        maxHeightInner: undefined,
        lookup(val, key) {
          return filter.lookup(val, key)
        }
      }
    },
    watch: {
      // TODO: 考虑cols改变时,是否保存col宽度到local
      // cols (newCols) { },
      radio(curRow, oldRow) {
        this.rowCurrentChange(curRow, oldRow, true)
      }
    },
    methods: {
      show(col) {
        if (col.show === false) {
          return false
        }
        return true
      },
      getValue(col, tableRow) {
        return get(tableRow, col.key)
      },
      filter(col, index, tableRow, tableCol) {
        const value = this.getValue(col, tableRow)

        // 敏感字段显示为6个*
        if (this.isSensitiveField(col, tableRow)) {
          return value || window.__ERPGLOABLECONFIG__.maskSec || '✽✽✽'
        }

        if (typeof col.filter === 'string') {
          return filter[col.filter](value)
        }
        return col.filter
          ? col.filter(value, tableRow, index, col, tableCol)
          : col.lookupCode
          ? filter.lookup(value, col.lookupCode)
          : value
      },
      // 是否是监控字段
      isMonitoredField(col, tableRow) {
        const { key } = col
        const maskValue = get(tableRow, key + 'Mask')
        return key && maskValue !== undefined
      },
      // 是否是敏感字段(前端不要隐藏, 返回6个*)
      isSensitiveField(col, tableRow) {
        const { key } = col
        const hasMaskSecKey = hasIn(tableRow, key + 'MaskSec')
        return key && hasMaskSecKey
      },
      // 是否是虚拟号码
      isVirtualNumber(col, tableRow) {
        const { key } = col
        const virtualValue = get(tableRow, key + 'Virtual')
        return key && virtualValue !== undefined
      },
      // 是否是加密字段(监控字段, 虚拟号码)
      isDecryptField(col, tableRow) {
        return this.isMonitoredField(col, tableRow) || this.isVirtualNumber(col, tableRow)
      },
      // 获取监控字段
      onDecryptField(col, tableRow) {
        let type = ''
        let maskValue = ''
        const { key, link, label } = col
        // 监控字段
        if (this.isMonitoredField(col, tableRow)) {
          type = 'mask'
          maskValue = get(tableRow, key + 'Mask')
        } else if (this.isVirtualNumber(col, tableRow)) {
          // 虚拟号码
          type = 'virtual'
          maskValue = get(tableRow, key + 'Virtual')
        }
        if (key && maskValue) {
          return decrypt(
            {
              // ? 目前解密监控字段,对于没有dataId,暂时传一个随机id(这种方案是否可取??)
              dataId: col.dataId || tableRow.id || uuid(13, true),
              fieldName: col.fieldName || key.replace(/-/g, '.'),
              moduleCode: col.moduleCode || this.moduleCodeComputed,
              fieldContent: col.fieldContent || maskValue,
              fieldNameStr: label,
              buttonName: getModalPageName(this)
            },
            type
          )
            .then(val => {
              // 取消返回null
              if (val === null) return
              set(tableRow, key, val)
              // 已经解密
              set(tableRow, key + type.replace(/^./, type[0].toUpperCase()), undefined)
              if (typeof link === 'function') {
                return link()
              }
            })
            .catch(e => console.warn(e))
        } else if (typeof link === 'function') {
          return link()
        }
      },
      onLink(col, tableRow) {
        if (typeof col.link === 'function') {
          const value = this.getValue(col, tableRow)
          col.link(value, col, tableRow)
        }
      },
      rowClick(row, event, column) {
        // console.log('rowClick', row)
        // const { selection } = this.types
        // if (selection === true || selection === 'checkbox') {
        //   this.$refs.table.toggleRowSelection(row)
        // } else if (selection === 'radio') {
        //   // radio 不需要 toggleRowSelection
        // } else if (selection === 'checkbox-radio' || selection === 'radio-checkbox') {
        //   this.$refs.table.clearSelection()
        //   this.$refs.table.toggleRowSelection(row)
        // }
        this.$emit('row-click', row, event, column)
      },
      rowDbClick(row, event) {
        this.$emit('row-dbclick', row, event)
      },
      rowCurrentChange(curRow, oldRow, fromRadio) {
        // console.log('rowCurrentChange', curRow, oldRow, fromRadio)
        if (this.types.selection === 'radio') {
          this.radio = curRow || null
          if (curRow) {
            this.$refs.table.setCurrentRow(curRow)
          } else {
            this.$refs.table.setCurrentRow()
          }
          // 当selection===radio时 注意避免发送两次重复事件
          // 这里取this.radio变化的事件
          if (fromRadio) {
            // console.log('should emit row-change once')
            this.$emit('row-change', curRow, oldRow)
          }
        } else {
          this.$emit('row-change', curRow, oldRow)
        }
      },
      rowSelectionChange(rows) {
        // console.log('rowSelectionChange', rows)
        this.$emit('row-selection', rows)
      },
      addRow(event) {
        this.$emit('addRow', event)
        this.$nextTick(() => {
          this.$refs.table.setCurrentRow(last(this.rows))
        })
      },
      headerDragend(newWidth, oldWidth, column) {
        // 默认没有设置table id 或者 table 只有一列 不保存列宽度到本地
        if (!this.id || this.cols.length < 2) {
          return
        }
        setTimeout(() => this.setTableColsWidth(newWidth, column), 0)
      },
      getTableId() {
        if (!this.id) {
          return
        }
        return this.$$user.id + '-fms-table-cols-' + this.id
      },
      // 只保存变化的(触发拖动事件的)列宽度
      // TODO: 考虑使用UTF8字节码压缩
      setTableColsWidth(newWidth, column) {
        const { property: key } = column
        const cols = this.cols
          // 默认 过滤掉有slot的列,无key值的列,有固定位置的列?
          .filter(col => col.key && (!col.slot || !col.fixed))
          // 只保留 key, width(转为数字,减少字节)
          .map(col => ({ key: col.key, width: toNumber(col.width) || 120 }))

        const col = cols.find(col => col.key === key)

        // 读取本地保存cols
        const localCols = localStore.get(this.getTableId(), Array)
        const localCol = localCols.find(col => col.key === key)

        // 如果存在 localCols 直接更新这个列
        if (col && localCol) {
          localCol.width = Math.max(newWidth, 100)
        } else if (col) {
          // 设置最小宽度为 100
          col.width = Math.max(newWidth, 100)
          // 如果不存在 localCols 中, 保存此列到 localCols 中
          localCols.push(col)
        } else {
          return
        }
        localStore.set(this.getTableId(), localCols)
      },
      getTableColsWidth() {
        // 只有一列 不保存列宽
        if (this.cols.length < 2) {
          return
        }
        const localCols = localStore.get(this.getTableId(), Array)
        // 更新col宽度
        this.cols.forEach(col => {
          const localCol = localCols.find(it => it.key === col.key)
          if (localCol && localCol.width) {
            col.width = localCol.width
          }
        })
      }
    },
    mounted() {
      // 设置table在弹框中最大高度
      setTimeout(() => {
        if (this.$parent.$el) {
          const dialogBody = this.$parent.$el.querySelector('.el-dialog__body')
          if (dialogBody) {
            this.maxHeightInner = Math.ceil(window.innerHeight * 0.7 - 52 - 32 + 12)
            console.log('maxHeightInner', this.maxHeightInner)
          }
        }
      }, 1000)
    }
  }
</script>

<style lang="scss">
  .fms-form-table {
    margin-top: 4px;
    .el-table--border th.el-table-column--selection:first-child .cell,
    .el-table--border td.el-table-column--selection:first-child .cell {
      padding-left: 6px;
      text-align: center;
    }
    .el-table--enable-row-hover .el-table__body tr:hover > td {
      background-color: #fefadc;
    }
  }
  .fms-form-table .el-table th {
    background-color: #ededed;
    padding: 0 0;
    .cell {
      height: 32px;
      line-height: 31px;
      color: #45434a;
    }
  }
  .fms-form-table .el-table td {
    padding: 1px 0;
    .cell {
      line-height: 24px;
      min-height: 24px;
    }
  }

  .fms-form-table.el-form {
    width: 100%;
    .el-form-item--mini.el-form-item.is-error {
      margin-bottom: 0px !important;
    }
    .el-form-item {
      margin-bottom: 0px !important;
      .el-form-item__label {
        padding-right: 0;
      }
      .el-form-item__content {
        min-height: 18px;
        line-height: 19px;
      }
    }
  }
  .fms-form-table.fms-form-table.fms-form-table .el-table td {
    padding: 1px 0;
    height: 28px !important;
    max-height: none;
    line-height: initial;
    .cell {
      line-height: 24px;
      min-height: 25px;
    }
    .cell.el-tooltip {
      > .el-button--link:only-child,
      > .el-button--text:only-child {
        padding: 0;
        overflow: hidden;
        text-align: left;
        line-height: 18px;
        text-overflow: ellipsis;
        max-width: calc(100% - 1px);
      }
    }
  }
  .fms-table-radio .el-radio__label {
    padding: 0;
  }
  .fms-form-table-add-btn {
    margin-top: 12px;
  }

  // 隐藏表单出错提示
  .fms-form-table {
    .el-form-item {
      &.is-required {
        .el-form-item__label::before {
          display: none;
        }
      }
      &.is-error {
        .el-form-item__error {
          display: none;
        }
      }
    }
  }

  // 自动行高
  .fms-table-row-height-auto.fms-form-table.fms-form-table.fms-form-table .el-table td {
    padding: 1px 0;
    height: auto !important;
    max-height: none;
    line-height: initial;
    .cell {
      line-height: 24px;
      min-height: 25px;
    }
  }

  /* Scrollbar styles */
  .fms-form-table .el-table__body-wrapper {
    &::-webkit-scrollbar {
      width: 15px;
      height: 15px;
    }

    &::-webkit-scrollbar-thumb {
      cursor: pointer;
      border-radius: 7px;
      background-color: #aa90e8;
      border: 2px solid white;
    }

    &::-webkit-scrollbar-track {
      border: 1px solid transparent;
      background-color: #fff;
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }
    &::-webkit-scrollbar-button {
      width: 0;
      height: 0;
      display: none;
    }
  }
  // for windows
  .fms-form-table.fms-form-table.fms-form-table-win .el-table__body-wrapper {
    &::-webkit-scrollbar {
      width: 17px;
      height: 17px;
    }
  }

  .fms-form-table.fms-form-table-inline {
    display: inline-block;
  }

  // 空数据
  .fms-form-table.fms-form-table.fms-form-table .el-table__empty-block {
    min-height: 28px;
    .el-table__empty-text {
      color: #45434a;
    }
  }

  .fms-form-table.fms-form-table-empty {
    .el-table__fixed {
      box-shadow: none;
      border-right-color: transparent;
      &::before {
        background-color: transparent;
      }
    }
  }
</style>
