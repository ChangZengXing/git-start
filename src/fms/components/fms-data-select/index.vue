<template>
  <kye-dialog v-bind="option" @closed="closedHandle">
    <div v-loading="loading">
      <kye-table :data="dataList" @row-dblclick="rowDblclickHandle" border>
        <kye-table-column
          v-for="(field, index) in columns"
          :key="`column-${index}`"
          :label="field.label"
          :width="field.width || '150px'"
        >
          <label slot-scope="scope">{{getFieldValue(scope.row, field)}}</label>
        </kye-table-column>
      </kye-table>
    </div>
  </kye-dialog>
</template>
<script>
  import trim from '@/fms/utils/framework/trim'
  import { get } from 'lodash'
  import extend from '@/fms/utils/framework/extend'

  export default {
    data () {
      return {
        option: {
          title: '数据选择',
          width: '1200px',
          visible: false,
          appendToBody: true,
          modalAppendToBody: true,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          beforeClose: this.close
        },
        selected: () => { },
        method: () => { },
        locked: false,
        loading: false,
        dataList: []
      }
    },
    /**
     * 属性列表
     * @property {Array} columns - 表格数据列表
     * @property {Array} dataList - 表格数据
     * @property {Object} params - 附加参数,查询成功之后会回调回去
     */
    props: {
      columns: {
        type: Array,
        required: true
      }
      // dataList: {
      //   type: Array,
      //   default: () => []
      // }
    },
    methods: {
      /**
       * 打开窗口
       * @date 2018-07-06 12:10:24
       * @param {Object} option - 窗口信息
       * @description 附加callback参数,当选择数据之后会回调
       * @description
       * 1、新增打开窗口api
       */
      async open (params = {}) {
        extend(true, this.option, params)

        if (this.locked) {
          return
        }
        this.locked = true

        if (typeof params.loadData !== 'function') {
          throw Error('loadData必须为一个方法')
        }
        this.method = params.loadData
        this.loadTableData()

        this.option.visible = true
        if (typeof params.selected === 'function') {
          this.selected = params.selected
        }
      },
      /**
       * 加载列表数据信息
       * @since 1.0.1
       */
      async loadTableData () {
        try {
          this.loading = true
          const response = await this.method()
          if (Array.isArray(response)) {
            this.dataList = response
          } else {
            this.dataList = []
            console.warn('loadData返回类型错误,期望得到一个数组')
          }
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      /**
       * 关闭窗口
       * @date 2018-07-06 12:11:03
       */
      async close () {
        this.option.visible = false
        this.$emit('close')
      },
      /**
       * 窗口已经完全关闭的处理
       * @date 2018-08-01 17:28:33
       * @author xuzengqiang
       * @description 确保每次只会弹出一个弹窗.
       */
      async closedHandle () {
        this.locked = false
      },
      /**
       * 双击后的处理
       * @param {Object} row - 行信息
       */
      async rowDblclickHandle (row) {
        // 通过selected回调选中的数据信息
        if (typeof this.selected === 'function') {
          this.selected(row)
        }

        this.close()
      },
      /**
       * 获取指定字段的值
       * @param {Object} row - 当前行的数据信息
       * @param {Object} field - 字段信息
       */
      getFieldValue (row, field) {
        if (!row || !field) {
          return ''
        }

        if (field.hasOwnProperty('value')) {
          return typeof field.value === 'function' ? field.value(row) : field.value
        }

        const key = trim(field.key)
        if (key) {
          const value = get(row, key) || field.default
          return this.filterField(value, field.filter)
        }
        return ''
      },
      /**
       * 数据过滤
       * @param {mixed} val - 值
       * @param {String} filter - 过滤器
       */
      filterField (val, filter) {
        if (filter) {
          if (filter.type && filter.args) {
            let func = this.$filter[filter.type]
            if (func) {
              return func(val, ...filter.args)
            }
            return val
          } else {
            let func = this.$filter[filter]
            if (func) {
              return func(val)
            }
            return val
          }
        }
        return val
      }
    }
  }
</script>
