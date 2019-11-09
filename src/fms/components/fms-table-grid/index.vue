<template>
  <div class="fms-table-grid" :class="getTableGridClass">
    <fms-block-title v-if="title" :title="title"></fms-block-title>
    <div class="fms-table-grid_container" :style="gridContainerStyle">
      <!-- table parent head cols -->
      <template v-for="(col, i) in headParentCols">
        <div
          class="f-col f-h f-h-p"
          :key="col.key || col.label || i"
          :class="getColClass(null, col, -1, i)"
          :style="getColStyle(null, col, -1, i)"
        >
          <div class="f-cell">
            <span>{{ getLabel(null, col, -1, i) }}</span>
          </div>
        </div>
      </template>

      <!-- table left head cols (index, radio, select) -->
      <template v-for="(col, i) in dataLeftCols">
        <div
          class="f-col f-h f-h-d f-h-l"
          :key="col.key || col.label || i"
          :class="getColClass(null, col, -1, i)"
          :style="getColStyle(null, col, -1, i)"
        >
          <div class="f-cell" @click="onCellClick(null, col, -1, i)">
            <!-- index -->
            <span v-if="col.colType === 'index'">{{ getLabel(null, col, -1, i) }}</span>
            <!-- radio -->
            <span v-else-if="col.colType === 'radio'"></span>
            <!-- select -->
            <span v-else></span>
          </div>
        </div>
      </template>

      <!-- table data head cols -->
      <template v-for="(col, i) in dataCenterCols">
        <div
          class="f-col f-h f-h-d f-h-c"
          :key="col.key || col.label || i"
          :class="getColClass(null, col, -1, i)"
          :style="getColStyle(null, col, -1, i)"
        >
          <div class="f-cell" @click="onCellClick(null, col, -1, i)">
            <span>{{ getLabel(null, col, -1, i) }}</span>
            <!-- <i class="f-sort-icon iconfont"></i> -->
              <i class="fms fms-sort-down-normal f-sort-icon" v-if="col.sort !== 'asc'"></i>
              <i class="fms fms-sort-up-normal f-sort-icon" v-if="col.sort === 'asc'"></i>
          </div>
        </div>
      </template>

      <!-- table right head cols (index, radio, select) -->
      <template v-for="(col, i) in dataRightCols">
        <div
          class="f-col f-h f-h-d f-h-r"
          :key="col.key || col.label || i"
          :class="getColClass(null, col, -1, i)"
          :style="getColStyle(null, col, -1, i)"
        >
          <div class="f-cell" @click="onCellClick(null, col, -1, i)">
            <!-- index -->
            <span v-if="col.colType === 'index'">{{ getLabel(null, col, -1, i) }}</span>
            <!-- radio -->
            <span v-else-if="col.colType === 'radio'"></span>
            <!-- select -->
            <span v-else></span>
          </div>
        </div>
      </template>

      <!-- table data rows -->
      <template v-for="(row, i) in dataRows">
        <!-- tale data left cols(index, radio, select) -->
        <template v-for="(col, j) in dataLeftCols">
          <div
            class="f-col f-d f-d-l"
            :class="getColClass(row, col, i, j)"
            :style="getColStyle(row, col, i, j)"
            :key="`l-${row[rowKey || i]}-${col.key || j}`"
          >
            <div class="f-cell">
              <!-- index -->
              <span v-if="col.colType === 'index'">{{ getIndex(row, col, i, j) }}</span>
              <!-- radio -->
              <span v-else-if="col.colType === 'radio'"></span>
              <!-- select -->
              <span v-else></span>
            </div>
          </div>
        </template>
        <!-- table data cols -->
        <template v-for="(col, j) in dataCenterCols">
          <div
            class="f-col f-d f-d-c"
            :class="getColClass(row, col, i, j)"
            :style="getColStyle(row, col, i, j)"
            :key="`c-${row[rowKey || i]}-${col.key || j}`"
          >
            <div class="f-cell" @click="onCellClick(row, col, i, j)">
              <template v-if="isDecryptField(row, col)">
                <kye-button type="link" @click="onDecryptField(row, col)">{{ getValue(row, col) }}</kye-button>
              </template>
              <template v-else-if="col.slot">
                <slot :name="col.slot" :row="row" :col="col" :index="i"></slot>
              </template>
              <template v-else-if="col.btnLink">
                <kye-button
                  type="link"
                  @click="onBtnLink(row, col, i, j)"
                >{{ getValueFilter(row, col, i, j) }}</kye-button>
              </template>
              <template v-else-if="!col.component && !col.render">
                <span>{{ getValueFilter(row, col, i, j) }}</span>
              </template>
              <template v-else>
                <span
                  v-if="readonly || (!col.render && !col.editable)"
                >{{ getValueFilter(row, col, i, j) }}</span>
                <fms-components v-else :col="col" :model="row" :index="i" />
              </template>
            </div>
          </div>
        </template>
        <!-- tale data right cols(index, radio, select) -->
        <template v-for="(col, j) in dataRightCols">
          <div
            v-if="col.colType === 'index'"
            class="f-col f-d f-d-r"
            :class="getColClass(row, col, i, j)"
            :style="getColStyle(row, col, i, j)"
            :key="`r-${row[rowKey] || i}-${col.key || j}`"
          >
            <div class="f-cell">
              <!-- index -->
              <span v-if="col.colType === 'index'">{{ getIndex(row, col, i, j) }}</span>
              <!-- radio -->
              <span v-else-if="col.colType === 'radio'"></span>
              <!-- select -->
              <span v-else></span>
            </div>
          </div>
        </template>
      </template>

      <!-- table empty row -->
      <div v-if="dataRows.length === 0" class="f-col f-d f-empty">
        <span>暂无数据</span>
      </div>
    </div>

    <!-- 翻页 -->
    <fms-pagination v-if="paginationShow" :page="paginationConfig" @change="pageChange" />
  </div>
</template>

<script>
  import { MODULECODE } from '@/fms/config'
  import { get, set, trim, hasIn, chunk } from 'lodash'
  import { decrypt, getModalPageName } from 'public/utils/common'
  import currentUser from '@/fms/mixins/current-user'
  import FmsComponents from '@/fms/components/fms-components'
  import FmsPagination from '@/fms/components/fms-pagination'
  import FmsBlockTitle from '@/fms/components/fms-block-title'
  import { filter, toNumber, hasAuth, uuid, vh, getModuleCode } from '@/fms/utils'
  const FMS_TABLE_GRID_DEBUG = localStorage.getItem('FMS_TABLE_GRID_DEBUG')
  export default {
    name: 'fms-grid-table',
    props: {
      title: String,
      inline: Boolean,
      loading: Boolean,
      maxHeight: [String, Number],
      rowKey: { type: String, default: 'id' },
      cols: { type: Array, default: () => [] },
      rows: { type: Array, default: () => [] },
      readonly: { type: Boolean, default: false },
      pageShow: { type: Boolean, default: false },
      pageSizes: { type: Array, default: () => [50] },
      moduleCode: { type: String, default: MODULECODE },
      pageAlwaysShow: { type: Boolean, default: false }
    },
    mixins: [currentUser],
    components: {
      FmsComponents,
      FmsBlockTitle,
      FmsPagination
    },
    watch: {
      rows() {
        this.updateDataRows()
      },
      cols() {
        this.updateDataCols()
      }
    },
    data() {
      return {
        dataCols: [],
        dataRows: [],
        dataLeftCols: [],
        dataRightCols: [],
        dataCenterCols: [],
        headParentCols: [],
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
        hoverStyle: ''
      }
    },
    computed: {
      paginationShow() {
        const { pageSize } = this.paginationConfig
        return this.pageAlwaysShow || (this.pageShow && this.rows.length > pageSize)
      },
      moduleCodeComputed() {
        return getModuleCode(this) || this.moduleCode
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
      gridContainerStyle() {
        return {
          maxHeight: this.getMaxHeight + 'px',
          gridTemplateColumns: this.getTableGridTemplateColumns()
        }
      },
      getTableGridClass() {
        return {
          'fms-table-grid_hasParentCol': this.headParentCols.length > 0
        }
      }
    },
    methods: {
      getLabel(row, col, rowIndex, colIndex) {
        if (typeof col.label === 'function') {
          return col.label(row, col, rowIndex, colIndex)
        }
        return col.label
      },
      getIndex(row, col, rowIndex, colIndex) {
        if (typeof col.index === 'function') {
          col.index(rowIndex, row, col, colIndex)
        }
        return rowIndex + 1
      },
      getColStyle(row, col, rowIndex, colIndex) {
        const colStyle = {}
        if (col.colSpan) {
          colStyle.gridColumn = `span ${col.colSpan}`
        }
        if (col.rowSpan) {
          colStyle.gridRow = `span ${col.rowSpan}`
        }
        // head cols
        if (!row && rowIndex === -1) {
          // 默认设置 sticky
          if (col.sticky !== false) {
            colStyle.position = 'sticky'
            // 默认固定head
            colStyle.top = 0
            if (col.stickyTop) {
              colStyle.top = toNumber(col.stickyTop, 0) + 'px'
            }
            if (col.stickyRight) {
              colStyle.right = toNumber(col.stickyRight, 0) + 'px'
            }
            if (col.stickyBottom) {
              colStyle.bottom = toNumber(col.stickyBottom, 0) + 'px'
            }
            if (col.stickyLeft) {
              colStyle.left = toNumber(col.stickyLeft, 0) + 'px'
            }
          }
        }

        if (col.textAlign) {
          colStyle.textAlign = col.textAlign
        }
        return colStyle
      },
      getColClass(row, col, rowIndex, colIndex) {
        const colClass = []

        if (col.key) {
          colClass.push(`f-col-${col.key}`)
        }

        // col head
        if (!row) {
          if (col.sort !== undefined) {
            colClass.push(`f-col-sort`)
            if (col.sort === '' || col.sort === true) {
            } else {
              colClass.push(`f-col-sort-${col.sort}`)
            }
          }
          // 设置边界标识
          if (col._type.includes('headParent')) {
            colClass.push(`f-col-${col._index}`)
            if (col._index + 1 === this.headParentCols.length) {
              colClass.push(`f-col-end`)
            }
          }
          if (col._type.includes('data')) {
            colIndex = col._index
            colClass.push(`f-col-${colIndex}`)
            if (this.dataCols.length > 0 && colIndex + 1 === this.dataCols.length) {
              colClass.push(`f-col-end`)
            }
          }
        } else {
          // col data
          if (col._type.includes('data')) {
            // 注意这里的colIndex
            colIndex = col._index

            if (typeof col.link === 'function' && col.link(row, col, rowIndex, colIndex)) {
              colClass.push('f-link')
            } else if (typeof col.link !== 'function' && col.link) {
              colClass.push('f-link')
            } else if (col.btnLink) {
              colClass.push('f-btn-link')
            }

            colClass.push(`f-col-${colIndex}`)
            colClass.push(`f-row-${rowIndex}`)

            if (this.dataRows.length > 0 && rowIndex + 1 === this.dataRows.length) {
              colClass.push(`f-row-end`)
            }
            if (this.dataCols.length > 0 && colIndex + 1 === this.dataCols.length) {
              colClass.push(`f-col-end`)
            }
          }
        }

        if (typeof col.colClass === 'function') {
          const resClass = col.colClass(row, col, rowIndex, colIndex)
          if (Array.isArray(resClass)) {
            resClass.forEach(c => colClass.push(c))
          }
        }

        return colClass
      },
      resetCols(col) {
        this.cols.forEach(c => {
          // 重置排序
          if (c.sort !== undefined && c !== col) {
            c.sort = true
          }
        })
      },
      getTableGridTemplateColumns() {
        const tplColumns = this.dataCols.map(col => {
          if (col.width) {
            return `minmax(max-content, ${toNumber(col.width)}px)`
          }
          if (col.minWidth) {
            return `minmax(${toNumber(col.minWidth)}px, auto)`
          }
          return 'minmax(max-content, auto)'
        })
        // console.log('tplColumns', tplColumns, this.dataCols)
        return tplColumns.join(' ')
      },
      showCol(col) {
        if (col.show === false) {
          return false
        }
        return true
      },
      getValue(row, col) {
        return get(row, col.key)
      },
      getValueFilter(row, col, rowIndex, colIndex) {
        const value = this.getValue(row, col)

        // 敏感字段显示为6个*
        if (this.isSensitiveField(row, col)) {
          return value || window.__ERPGLOABLECONFIG__.maskSec || '✽✽✽'
        }

        FMS_TABLE_GRID_DEBUG && console.log('fms-table-grid filter', value)

        if (typeof col.filter === 'string') {
          return filter[col.filter](value)
        }
        return col.filter
          ? col.filter(value, row, col, rowIndex, colIndex)
          : col.lookupCode
          ? filter.lookup(value, col.lookupCode)
          : value
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

        const rowKeys = {}
        this.rows.some((row, index) => {
          const rowKey = trim(row[this.rowKey])
          if (rowKeys[rowKey]) {
            this.$message.warning(`重复${this.rowKey}: ${row[this.rowKey]}`)
            return true
          }
          rowKeys[rowKey] = true
        })

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
        // updateScroll && this.updateTableScroll()
      },
      updateDataCols() {
        const cols = this.cols.filter(col => this.showCol(col))
        const dataLeftCols = []
        const dataCenterCols = []
        const dataRightCols = []
        const headParentCols = []
        cols.forEach((col, i) => {
          // col._colClass = [...(col.colClass || [])]
          if (col.colParent) {
            col._type = 'headParent'
            headParentCols.push(col)
          } else if (col.colType && col.colRight) {
            col._type = 'data,right'
            dataRightCols.push(col)
          } else if (col.colType) {
            col._type = 'data,left'
            dataLeftCols.push(col)
          } else if (col.key || col.slot) {
            col._type = 'data,center'
            dataCenterCols.push(col)
          }
        })

        const dataCols = [...dataLeftCols, ...dataCenterCols, ...dataRightCols]

        dataCols.forEach((col, i) => (col._index = i))

        // TODO: 后期考虑支持 headParentCols 多行(需要手动计算下一行索引), 目前暂时只支持单行
        headParentCols.forEach((col, i) => (col._index = i))

        this.dataCols = dataCols
        this.dataLeftCols = dataLeftCols
        this.dataRightCols = dataRightCols
        this.dataCenterCols = dataCenterCols
        this.headParentCols = headParentCols
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
              this.tableBodyWrapper = this.$el.querySelector('.fms-table-grid_container')
              if (this.tableBodyWrapper) {
                this.tableBodyWrapper.scrollTo(0, 0)
              }
            }, 300)
          }
        }
      },
      onBtnLink(row, col, rowIndex, colIndex) {
        if (typeof col.link === 'function') {
          const cellValue = this.getValue(row, col)
          col.link(cellValue, row, col, rowIndex, colIndex)
        }
      },
      onCellClick(row, col, rowIndex, colIndex) {
        // head cols
        if (!row && rowIndex === -1 && this.dataRows.length > 0) {
          if (col.sort !== undefined) {
            if (col.sort === 'asc') {
              col.sort = 'desc'
            } else if (col.sort === 'desc') {
              col.sort = 'asc'
            } else {
              col.sort = 'asc'
            }
            this.resetCols(col)
            this.$emit('sortChange', col)
          }
          return
        }
        this.$emit('cellClick', row, col, rowIndex, colIndex)
      },
      onRowClick(row, col, rowIndex, colIndex) {
        this.$emit('row-click', row, col, rowIndex, colIndex)
      },
      onRowDbClick(row, col, rowIndex, colIndex) {
        // 没有权限
        if (!hasAuth(this.dbAuth)) {
          return this.$message.warning('无权限访问!')
        }
        this.$emit('row-dbclick', row, col, rowIndex, colIndex)
      },
      // 是否是监控字段
      isMonitoredField(row, col) {
        const { key } = col
        const maskValue = get(row, key + 'Mask')
        return !!key && !!maskValue
      },
      // 是否是虚拟号码
      isVirtualNumber(row, col) {
        const { key } = col
        const virtualValue = get(row, key + 'Virtual')
        return !!key && !!virtualValue
      },
      // 是否是加密字段(监控字段, 虚拟号码)
      isDecryptField(row, col) {
        return this.isMonitoredField(row, col) || this.isVirtualNumber(row, col)
      },
      // 是否是敏感字段(前端不要隐藏, 返回6个*)
      isSensitiveField(row, col) {
        const { key } = col
        const hasMaskSecKey = hasIn(row, key + 'MaskSec')
        return !!key && hasMaskSecKey
      },
      // 获取监控字段/虚拟号码
      onDecryptField(row, col) {
        let type = ''
        let maskValue = ''
        const { key, link, label } = col
        // 监控字段
        if (this.isMonitoredField(row, col)) {
          type = 'mask'
          maskValue = get(row, key + 'Mask')
        } else if (this.isVirtualNumber(row, col)) {
          // 虚拟号码
          type = 'virtual'
          maskValue = get(row, key + 'Virtual')
        }
        if (key && maskValue) {
          return decrypt(
            {
              // ? 目前解密监控字段,对于没有dataId,暂时传一个随机id(这种方案是否可取??)
              dataId: col.dataId || row[this.rowKey] || uuid(13, true),
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
              set(row, key, val)
              // 已经解密
              set(row, key + type.replace(/^./, type[0].toUpperCase()), undefined)
              if (typeof link === 'function') {
                return link()
              }
            })
            .catch(e => console.warn(e))
        } else if (typeof link === 'function') {
          return link()
        }
      }
    },
    created() {
      this.updateDataCols()
      this.updateDataRows(1, false)
    },
    mounted() {
      this.$nextTick(() => {
        this.tableBodyWrapper = this.$el.querySelector('.fms-table-grid_container')
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
                  el.classList.contains('fms-table-grid') ||
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
    }
  }
</script>

<style lang="scss">
  .fms-table-grid_container {
    color: #000000;
    border: 1px solid #d6d6d6;
    // margin: 0 -1px -1px 0;
    background-color: transparent;
    position: relative;

    display: grid;
    grid-gap: 0px;
    grid-auto-rows: minmax(28px, max-content);
    grid-auto-flow: row;

    overflow: auto;

    .f-col {
      border-right: 1px solid #d6d6d6;
      border-bottom: 1px solid #d6d6d6;
      &-end {
        border-right-color: transparent;
      }
    }
    .f-row-end {
      border-bottom-color: transparent;
    }
    .f-h,
    .f-d {
      font-size: 12px;
      .f-cell {
        padding: 0 6px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        span {
          display: inline-block;
        }
      }
    }
    .f-h {
      color: #1a1a1a;
      height: 32px;
      line-height: 31px;
      background-color: #ebecf0;
    }
    .f-sort-icon {
      display: none;
    }
    .f-col-sort {
      cursor: pointer;
      .f-sort-icon {
        color: #b1b1b1;
        display: inline-block;
        font-size: 12px;
        // &:after {
        //   // content: '\EA92';
        //   content: '\ec93';
        // }
      }
    }

    // .f-col-sort-asc .f-sort-icon:after {
    //   color: #7653d6;
    //   // content: '\EA90';
    //   content: '\ec94';
    // }
    .f-col-sort-asc .f-sort-icon {
      color: #7653d6;
      // content: '\EA90';
      // content: '\ec94';
    }
    // .f-col-sort-desc .f-sort-icon:after {
    //   color: #7653d6;
    //   // content: '\EA92';
    //   content: '\ec93';
    // }
    .f-col-sort-desc .f-sort-icon {
      color: #7653d6;
      // content: '\EA92';
      // content: '\ec93';
    }
    .f-d {
      height: 29px;
      line-height: 28px;
      background-color: #fff;
    }
    .f-link {
      .f-cell {
        cursor: pointer;
      }
    }
    .f-empty {
      grid-column: 1 / -1;
      text-align: center;
      border: none;
    }
  }
  // .fms-table-grid_hasParentCol {
  // .f-h-p {
  //   border-bottom: 0px solid #d6d6d6;
  // }
  // .f-h-d {
  //   line-height: 30px;
  //   border-top: 1px solid #d6d6d6;
  // }
  // }
</style>
