<template>
  <section class="fms-table" :class="fmsTableComputed">
    <fms-block-title v-if="title" :title="title"></fms-block-title>
    <!-- kye-table slot append,empty 插槽有问题 这里先使用 el-table -->
    <!-- 禁止hover https://github.com/ElemeFE/element/issues/4321 -->
    <el-table
      :data="dataRows"
      :ref="'table'"
      :width="width"
      :border="border"
      :stripe="stripe"
      :height="getHeight"
      :max-height="getMaxHeight"
      :default-sort="defaultSort"
      :tooltip-effect="'dark fms-table-tooltip'"
      :highlight-current-row="!(types.selection === true || types.selection === 'checkbox')"
      :row-class-name="hover ? undefined : 'no-hover'"
      v-on="$listeners"
      v-bind="$attrs"
      v-loading="loading"
      @row-click="rowClick"
      @sort-change="sortChange"
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
        :selectable="selectable"
        :type="'selection'"
        :width="'40'"
        :fixed="'left'"
        :align="'center'"
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
            @click.native.stop="emptyFn"
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
        :width="'45'"
        :fixed="'left'"
        :align="'center'"
        :index="indexMethod"
      />
      <!-- 注意,这里的sortable需要设置prop -->
      <kye-table-column
        v-for="(col, i) in getCols"
        :key="col.id || col.key || i"
        :prop="col.key"
        :label="col.label"
        :width="col.width"
        :fixed="col.fixed || false"
        :align="col.align || align"
        :sortable="!!rows.length && (col.sortable !== undefined ? col.sortable : sortable || false)"
        :sort-orders="fmsTableSortOrders"
        :sort-method="col.sortMethod"
        :min-width="col.minWidth || col.width || '120px'"
        :render-header="col.renderHeader || undefined"
        :show-overflow-tooltip="col.tips === undefined ? true : col.tips"
        v-on="col.attrs"
      >
        <template slot-scope="scope">
          <!-- 监控字段 / 虚拟号码 -->
          <template v-if="isDecryptField(col, scope.row)">
            <kye-button
              type="link"
              @click="onDecryptField(col, scope.row)"
            >{{ getValue(col, scope.row) }}</kye-button>
          </template>
          <template v-else-if="col.slot">
            <slot :name="col.slot" :row="scope.row" :col="col" :index="scope.$index"></slot>
          </template>
          <!-- 链接 -->
          <template v-else-if="isLink(col, scope.row)">
            <kye-button
              type="link"
              @click="onLink(col, scope.row, scope.$index)"
            >{{ filter(col, scope.$index, scope.row, scope.col) }}</kye-button>
          </template>
          <template
            v-else-if="!col.component && !col.render"
          >{{ filter(col, scope.$index, scope.row, scope.col) }}</template>
          <template v-else>
            <span
              v-if="readonly || (!col.render && !col.editable)"
            >{{ filter(col, scope.$index, scope.row, scope.col) }}</span>
            <fms-components v-else :col="col" :model="scope.row" :index="scope.$index"/>
          </template>
        </template>
      </kye-table-column>
      <slot></slot>
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
          :auth="addBtnBottomAuth"
          :style="showAddBtnStyle"
        >{{addBtnText}}</kye-button>
      </el-row>
      <el-row slot="empty" v-if="showAddBtn && !readonly" type="flex" justify="center">
        <kye-button
          type="primary"
          @click="addRow"
          icon="iconfont icon-plus"
          :auth="addBtnBottomAuth"
          :style="showAddBtnStyle"
        >{{addBtnText}}</kye-button>
      </el-row>
      <span
        slot="empty"
        v-if="showAddRow && !readonly"
        class="fms-table-empty-row-add"
        @click="addRow"
      >
        <!-- <span>新增</span> -->
        <i class="iconfont icon-plus"></i>
      </span>
    </el-table>
    <el-row v-if="showAddBtnBottom && !readonly" type="flex" justify="end">
      <kye-button
        type="text"
        @click="addRow"
        :auth="addBtnBottomAuth"
        icon="iconfont icon-plus"
        class="fms-table-add-btn"
        :style="showAddBtnBottomStyle"
      >{{addBtnText}}</kye-button>
    </el-row>
    <!-- <fms-scrollbar v-show="false" ref="fmsScrollbar" @scroll="onBarScroll"/> -->
    <!-- 翻页 -->
    <fms-pagination v-if="paginationShow" :page="paginationConfig" @change="pageChange"/>
  </section>
</template>

<script>
  import { Table, TableColumn } from 'element-ui'
  import { MODULECODE } from '@/fms/config'
  import { decrypt, getModalPageName } from 'public/utils/common'
  import { last, get, set, hasIn, chunk } from 'lodash'
  import currentUser from '@/fms/mixins/current-user'
  // import FmsScrollbar from '@/fms/components/fms-scrollbar'
  import FmsComponents from '@/fms/components/fms-components'
  import FmsPagination from '@/fms/components/fms-pagination'
  import FmsBlockTitle from '@/fms/components/fms-block-title'
  import { filter, localStore, toNumber, hasAuth, uuid, vh, getModuleCode } from '@/fms/utils'
  import { getCell, getColumnByCell } from 'element-ui/packages/table/src/util'
  import { getStyle, hasClass } from 'element-ui/src/utils/dom'

  const FMS_TABLE_DEBUG = localStorage.getItem('FMS_TABLE_DEBUG')

  // Temporary fixed https://github.com/ElemeFE/element/issues/13916
  // TODO: 临时修复此bug,待 element-ui #13916修复后,去掉此代码
  Object.assign(Table.components.TableBody.methods, {
    handleCellMouseLeave() {
      const tooltip = this.$refs.tooltip
      if (tooltip && tooltip.expectedState) {
        tooltip.setExpectedState(false)
        clearTimeout(tooltip._timeoutLeave)
        tooltip._timeoutLeave = setTimeout(() => {
          if (!tooltip.expectedState) {
            tooltip.handleClosePopper()
          }
        }, 150)
      }
      const cell = getCell(event)
      if (!cell) return

      const oldHoverState = this.table.hoverState || {}
      this.table.$emit(
        'cell-mouse-leave',
        oldHoverState.row,
        oldHoverState.column,
        oldHoverState.cell,
        event
      )
    },
    handleCellMouseEnter(event, row) {
      // console.log('handleCellMouseEnter', this.$refs.tooltip)
      const table = this.table
      const cell = getCell(event)
      const tooltip = this.$refs.tooltip

      if (cell) {
        const column = getColumnByCell(table, cell)
        const hoverState = (table.hoverState = { cell, column, row })
        table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event)
      }

      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.cell')
      if (!(hasClass(cellChild, 'el-tooltip') && cellChild.childNodes.length)) {
        setTimeout(() => {
          tooltip.setExpectedState(false)
          tooltip.handleClosePopper()
        }, 600)
        return
      }
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange()
      range.setStart(cellChild, 0)
      range.setEnd(cellChild, cellChild.childNodes.length)
      const rangeWidth = range.getBoundingClientRect().width
      const padding =
        (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0)
      if (
        (rangeWidth + padding > cellChild.offsetWidth ||
          cellChild.scrollWidth > cellChild.offsetWidth) &&
        this.$refs.tooltip
      ) {
        // TODO 会引起整个 Table 的重新渲染，需要优化
        const showTooltip = () => {
          this.tooltipContent = cell.innerText || cell.textContent
          tooltip.referenceElm = cell
          tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
          tooltip.doDestroy()
          tooltip.setExpectedState(true)
          this.activateTooltip(tooltip)
        }
        clearTimeout(tooltip._timeoutEnter)
        tooltip._timeoutEnter = setTimeout(() => {
          !tooltip.expectedState && showTooltip()
        }, 500)
      }
    }
  })

  // Object.assign(Table.components.TableHeader.methods, {
  //   handleMouseMove(event, column) {
  //     if (column.children && column.children.length > 0) return
  //     let target = event.target
  //     while (target && target.tagName !== 'TH') {
  //       target = target.parentNode
  //     }

  //     if (!column || !column.resizable) return

  //     if (!this.dragging && this.border) {
  //       let rect = target.getBoundingClientRect()

  //       const bodyStyle = document.body.style
  //       if (rect.width > 12 && rect.right - event.pageX < 8) {
  //         bodyStyle.cursor = 'col-resize'
  //         if (hasClass(target, 'is-sortable')) {
  //           target.style.cursor = 'col-resize'
  //         }

  //         if (!hasClass(target, 'col-resize')) {
  //           target.classList.add('col-resize')
  //         }

  //         this.draggingColumn = column
  //       } else if (!this.dragging) {
  //         bodyStyle.cursor = ''

  //         if (hasClass(target, 'col-resize')) {
  //           target.classList.remove('col-resize')
  //         }

  //         if (hasClass(target, 'is-sortable')) {
  //           target.style.cursor = 'pointer'
  //         }
  //         this.draggingColumn = null
  //       }
  //     }
  //   },

  //   handleMouseOut(event) {
  //     if (this.$isServer) return
  //     let target = event.target
  //     document.body.style.cursor = ''

  //     if (hasClass(target, 'col-resize')) {
  //       target.classList.remove('col-resize')
  //     }
  //   }
  // })

  const ElTable = { extends: Table }
  const ElTableColumn = { extends: TableColumn }

  export default {
    props: {
      id: String,
      bizId: String,
      title: String,
      width: String,
      dbAuth: String,
      index: Function,
      dialog: Boolean,
      inline: Boolean,
      loading: Boolean,
      defaultSort: Object,
      selectable: Function,
      addBtnBottomAuth: String,
      height: [String, Number],
      maxHeight: [String, Number],
      cols: { type: Array, default: () => [] },
      rows: { type: Array, default: () => [] },
      types: { type: Object, default: () => ({}) },
      align: { type: String, default: 'left' },
      hover: { type: Boolean, default: true },
      border: { type: Boolean, default: true },
      stripe: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      addBtnText: { type: String, default: '新增' },
      showAddBtn: { type: Boolean, default: false },
      showAddRow: { type: Boolean, default: false },
      moduleCode: { type: String, default: MODULECODE },
      sortable: { type: [Boolean, String], default: false },
      showAddBtnStyle: { type: Object, default: () => ({}) },
      showAddBtnBottom: { type: Boolean, default: false },
      showAddBtnBottomStyle: { type: Object, default: () => ({}) },
      pageSizes: { type: Array, default: () => [50] },
      pageShow: { type: Boolean, default: false },
      pageAlwaysShow: { type: Boolean, default: false }
    },
    name: 'fms-table',
    mixins: [currentUser],
    components: {
      ElTable,
      ElTableColumn,
      FmsComponents,
      FmsBlockTitle,
      FmsPagination
      // FmsScrollbar
    },
    data() {
      return {
        radio: null,
        dataRows: [],
        inDialog: false,
        emptyFn: () => {},
        maxHeightInner: undefined,
        paginationConfig: {
          total: 0,
          pageSize: this.pageSizes[0],
          pageSizes: this.pageSizes,
          layout: 'sizes, total, prev, pager, next',
          currentPage: 1
        },
        fmsTableSortOrders: ['ascending', 'descending'],
        lookup(val, key) {
          return filter.lookup(val, key)
        }
      }
    },
    computed: {
      table() {
        return this.$refs.table
      },
      getCols() {
        if (this.cols.length === 0) {
          return [{ label: '', minWidth: 1, key: '-' }]
        } else {
          return this.cols.filter(col => this.show(col))
        }
      },
      // getRows() {
      // const { pageSize } = this.paginationConfig
      //   if (this.pageShow && this.rows.length > pageSize) {
      //     return this.dataRows
      //   }
      //   return this.rows
      // },
      getHeight() {
        return toNumber(this.height, undefined)
      },
      getMaxHeight() {
        let maxH = toNumber(this.maxHeight, undefined) || toNumber(this.maxHeightInner, undefined)
        if (maxH && this.paginationShow) {
          maxH = maxH - 38
        }
        if (maxH) {
          return Math.max(maxH, 70)
        }
        return maxH
      },
      fmsTableComputed() {
        return {
          'fms-table-win': (navigator.platform || '').toLowerCase().includes('win'),
          'fms-table-empty': this.rows.length === 0,
          'fms-table-inline': this.inline,
          'fms-table-dialog': this.dialog || this.inDialog,
          'fms-table-empty-add-row': this.showAddRow === true,
          'fms-table-selection-all-disabled': this.types.selectionAll === false,
          'fms-table-selection': this.types.selection === true || this.types.selection === 'checkbox'
        }
      },
      paginationShow() {
        const { pageSize } = this.paginationConfig
        return this.pageAlwaysShow || (this.pageShow && this.rows.length > pageSize)
      },
      moduleCodeComputed() {
        return getModuleCode(this) || this.moduleCode
      }
    },
    watch: {
      // TODO: 考虑cols改变时,是否保存col宽度到local
      // cols (newCols) { },
      radio(curRow, oldRow) {
        this.rowCurrentChange(curRow, oldRow, true)
      },
      rows(val) {
        this.updateDataRows()
      }
    },
    methods: {
      isLink(col, row) {
        if (col.isLink === undefined) {
          return col.link
        }
        return col.link && (typeof col.isLink === 'function' ? col.isLink(col, row) : col.isLink)
      },

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

        FMS_TABLE_DEBUG && console.log('fms-table filter', value)

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
        return !!key && !!maskValue
      },
      // 是否是虚拟号码
      isVirtualNumber(col, tableRow) {
        const { key } = col
        const virtualValue = get(tableRow, key + 'Virtual')
        return !!key && !!virtualValue
      },
      // 是否是加密字段(监控字段, 虚拟号码)
      isDecryptField(col, tableRow) {
        return this.isMonitoredField(col, tableRow) || this.isVirtualNumber(col, tableRow)
      },
      // 是否是敏感字段(前端不要隐藏, 返回6个*)
      isSensitiveField(col, tableRow) {
        const { key } = col
        const hasMaskSecKey = hasIn(tableRow, key + 'MaskSec')
        return !!key && hasMaskSecKey
      },
      // 获取监控字段/虚拟号码
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
      onLink(col, tableRow, index) {
        if (typeof col.link === 'function') {
          const value = this.getValue(col, tableRow)
          col.link(value, col, tableRow, index)
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
        // 这里和原组件事件相同,既然有用 $listeners,所以这里就不需要再次$emit相同的事件
        // this.$emit('row-click', row, event, column)
      },
      rowDbClick(row, event) {
        // 没有权限
        if (!hasAuth(this.dbAuth)) {
          return this.$message.warning('无权限访问!')
        }
        this.$emit('row-dbclick', row, event)
      },
      sortChange(sort) {
        console.log('fms-table sortChange', sort, this.getCols)
        if (this.rows.length > 0) {
          const { sortKeys = {} } = this.getCols.find(col => col.key === sort.prop) || {}
          sortKeys.order = sort.order
          if (!sortKeys.prop) {
            sortKeys.prop = sort.prop
          }
          // 注意这里的事件名称不要和原组件el-table的事件名称相同,$listeners会合并事件,触发多次
          // 所以这里改为 sort-update 同时原来的sort-change依然是有效的 这里使用不同的事件名称来进行事件的扩展
          this.$emit('sort-update', { ...sort, sortKeys })
        }
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
        if (!this.local) {
          return
        }
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
        return 'fms-table-cols-' + this.$$user.id + '-' + this.id
      },
      // 只保存变化的(触发拖动事件的)列宽度
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
      },
      // 监听列表滚动事件
      onTableScroll() {
        console.log('onTableScroll', this.bodyWrapper.scrollLeft)
        // this.$refs.fmsScrollbar.upScroll(this.bodyWrapper.scrollLeft)
      },
      onBarScroll(left, top) {
        console.log('onBarScroll', left, top)
        this.bodyWrapper.scrollTo(left, top)
      },
      indexMethod(index) {
        if (this.paginationShow) {
          const { currentPage, pageSize } = this.paginationConfig
          const curPageIndex = pageSize * currentPage
          // console.log('indexMethod', index, currentPage, curPageIndex)
          return curPageIndex - (pageSize - index) + 1
        }
        if (typeof this.index === 'function') {
          return this.index(index)
        }
        return index + 1
      },
      pageChange(type, val) {
        this.paginationConfig[type] = val
        console.log('table pageChange', type, val)
        if (type === 'pageSize') {
          this.updateDataRows(1, true, true)
        } else {
          this.updateDataRows(val, true, false)
        }
      },
      updateDataRows(page = 1, updateScroll = true, updateChunks = true) {
        console.log('updateDataRows', this.rows)

        const { pageSize } = this.paginationConfig

        if (!this.dataChunks) this.dataChunks = []

        if (this.paginationShow) {
          if (updateChunks) {
            this.paginationConfig.currentPage = page
            this.paginationConfig.total = this.rows.length
            this.dataChunks = chunk(this.rows, pageSize)
            console.log('updateDataChunks')
          }
          this.dataRows = this.dataChunks[page - 1] || []
          console.log('updateDataRowsPageShow', pageSize, this.dataChunks)
        } else {
          this.dataRows = this.rows
        }
        updateScroll && this.updateTableScroll()
      },
      updateTableScroll() {
        // 修复翻页滚动条bug
        if (this.dataRows && this.dataRows.length > 0) {
          if (this.tableBodyWrapper) {
            setTimeout(() => {
              this.tableBodyWrapper.scrollTo(0, 0)
            }, 0)
          } else {
            setTimeout(() => {
              this.tableBodyWrapper = this.$el.querySelector('.el-table__body-wrapper')
              if (this.tableBodyWrapper) {
                this.tableBodyWrapper.scrollTo(0, 0)
              }
            }, 300)
          }
        }
      }
    },
    created() {
      this.updateDataRows(1, false)
      this.getTableColsWidth()
    },
    mounted() {
      this.$nextTick(() => {
        this.tableBodyWrapper = this.$el.querySelector('.el-table__body-wrapper')
      })
      // 设置table在弹框中最大高度
      console.log('this.table.parent', this.$parent.$options._componentTag)
      if (this.$parent.$options._componentTag === 'el-dialog') {
        this.inDialog = true
        this.maxHeightInner = Math.ceil(vh(70) - 52 - 10 - 32 - 5)
        setTimeout(() => {
          if (this.$parent.$el) {
            const dialogBody = this.$parent.$el.querySelector('.el-dialog__body')
            if (dialogBody) {
              this.inDialog = true
              // this.maxHeightInner = Math.ceil(vh(70) - 52 - 32 + 12)
              let otherElementHeight = [...dialogBody.children].reduce((ac, el) => {
                if (
                  el.classList.contains('fms-table') ||
                  el.classList.contains('fms-form-table') ||
                  el.classList.contains('fms-dialog-loading')
                ) {
                  return ac
                }
                ac += el.offsetHeight
                return ac
              }, 0)
              this.maxHeightInner = Math.ceil(vh(70) - 52 - otherElementHeight - 32 - 5)
              // fms-table 包含 fms-block-title
              if (this.title) {
                this.maxHeightInner = this.maxHeightInner - 32
              }
              // 减去翻页组件高度
              if (this.paginationShow) {
                this.maxHeightInner = this.maxHeightInner - 38
              }
              console.log('maxHeightInner', this.maxHeightInner, otherElementHeight)
            }
          }
        }, 0)
      }

      // 监听table滚动事件
      // setTimeout(() => {
      // this.bodyWrapper = this.$el.querySelector('.el-table__body-wrapper')
      // if (this.bodyWrapper) {
      //   const { scrollWidth } = this.bodyWrapper
      //   console.log('scrollWidth', scrollWidth)
      //   this.$refs.fmsScrollbar.setScrollWidth(scrollWidth)
      //   this.bodyWrapper.addEventListener('scroll', this.onTableScroll)
      // }
      // }, 100)
    },
    beforeDestroy() {
      if (this.bodyWrapper) {
        this.bodyWrapper.removeEventListener('scroll', this.onTableScroll)
        this.bodyWrapper = null
        console.log('beforeDestroy and removeEventListener')
      }
    }
  }
</script>

<style lang="scss">
  .fms-table.fms-table.fms-table {
    margin-top: 4px;
    .el-table--border th.el-table-column--selection:first-child .cell,
    .el-table--border td.el-table-column--selection:first-child .cell {
      padding-left: 6px;
      text-align: center;
    }
    .el-table--enable-row-hover .el-table__body tr:hover > td {
      background-color: #fefadc;
    }

    // 排序
    th.is-sortable {
      .caret-wrapper {
        height: 14px;
        width: 11px;
        line-height: initial;
        flex-direction: row;
      }
      i.sort-caret {
        width: auto;
        height: auto;
        border: 0;
        color: #999999;
        bottom: 0;
        left: 0;
        top: 0;
        font-family: 'iconfont';
        font-style: normal;
        font-size: 12px;
        font-weight: bold;
      }
      i.sort-caret {
        transform: none;
        &::before {
          display: block;
          // content: '\ea90';
          content: '\ec94';
        }
      }
    }
    // 默认不显示
    th i.descending {
      display: none;
    }
    th.descending i.descending {
      display: block;
    }
    th.descending i.ascending {
      display: none;
    }
    th.ascending i.descending {
      display: none;
    }
    th.descending i.sort-caret.descending {
      color: #9571e9;
      // transform: rotate(180deg);
      // &::before {
      //   content: '\ea90';
      // }
      &::before {
        // content: '\ea92';
        content: '\ec93';
      }
    }
    th.ascending i.sort-caret.ascending {
      color: #9571e9;
      &::before {
        // content: '\ea90';
        content: '\ec94';
      }
    }

    // 翻页
    .fms-pagination {
      margin-top: 8px;
      .btn-next {
        margin-right: 0;
      }
    }
    &.fms-table-dialog {
      .fms-pagination {
        margin-bottom: -8px;
      }
    }
  }
  .fms-table.fms-table.fms-table .el-table th {
    background-color: #ededed;
    padding: 0 0;
    .cell {
      height: 31px;
      line-height: 31px;
      color: #45434a;
      position: relative;
      &::before {
        content: ' ';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
      }
    }
  }
  .fms-table.fms-table.fms-table .el-table td {
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
  .fms-table-add-btn {
    margin-top: 12px;
  }
  .fms-table.fms-table.fms-table.fms-table.fms-table-empty-add-row {
    .el-table__empty-block .el-table__empty-text {
      display: flex;
      color: #45434a;
      left: auto;
      width: 100%;
      transform: none;
      top: auto;
      height: 28px;
      width: 100%;
      .fms-table-empty-row-add {
        cursor: pointer;
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #7653d6;
        margin-right: 2px;
        .iconfont {
          font-size: 15px;
        }
        &:hover {
          background-color: #fefadc;
        }
      }
    }
  }

  // 高亮选中行
  .fms-table.fms-table .el-table__body tr.hover-row > td,
  .fms-table.fms-table .el-table__body tr.current-row > td {
    background-color: #fefadc;
  }

  // 空数据
  .fms-table.fms-table.fms-table .el-table__empty-block {
    min-height: 28px;
    .el-table__empty-text {
      color: #45434a;
    }
  }

  .fms-table.fms-table-empty {
    .el-table__fixed {
      box-shadow: none;
      border-right-color: transparent;
      &::before {
        background-color: transparent;
      }
    }
  }

  .fms-table.fms-table .el-table--scrollable-x .el-table__fixed::before {
    background-color: transparent;
  }

  .fms-table.fms-table-inline {
    display: inline-block;
  }
  .fms-table.fms-table-dialog {
    .fms-block-title.kye-block-title {
      margin-bottom: 4px;
    }
  }

  // Scrollbar styles
  .fms-table.fms-table.fms-table .el-table__body-wrapper {
    // 注意mac chrome的滚动条默认宽度为 15px 而 windows chrome滚动条宽度为 17px
    // https://codepen.io/sambible/post/browser-scrollbar-widths
    &::-webkit-scrollbar {
      width: 15px;
      height: 15px;
    }

    &::-webkit-scrollbar-thumb {
      cursor: pointer;
      border-radius: 8px;
      background-color: #aa90e8;
      border: 2px solid white;
      border-bottom-width: 3px;
    }

    &::-webkit-scrollbar-track {
      border: 0px solid transparent;
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
  .fms-table.fms-table.fms-table.fms-table-win .el-table__body-wrapper {
    &::-webkit-scrollbar {
      width: 17px;
      height: 17px;
    }
  }

  .fms-table-tooltip {
    transform: translateY(20px);
    .popper__arrow {
      display: none;
    }
  }

  // 禁止全选按钮
  .fms-table-selection-all-disabled {
    th.el-table-column--selection .cell {
      &::before {
        display: none;
      }
      &::after {
        content: ' ';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 2;
      }
      label.el-checkbox {
        .el-checkbox__inner {
          background-color: #edf2fc;
          border-color: #dcdae2;
          cursor: not-allowed;
        }
        .is-checked .el-checkbox__inner,
        .is-indeterminate .el-checkbox__inner {
          background-color: #aa9bcc;
          border-color: #9376d8;
        }
      }
    }
  }

  // .fms-table.fms-table.fms-table {
  //   .el-table--border th {
  //     border-right-color: #d6d6d6;
  //   }
  //   .el-table--border th.col-resize:not(.noclick) {
  //     border-right: 2px solid #f10;
  //   }
  //   .el-table__column-resize-proxy {
  //     border-left-color: #f10;
  //   }
  // }
</style>
