<template>
  <kye-table :data="data"
             @row-click="rowClickedHandle"
             @row-dblclick="rowDblclickHandle"
             highlight-current-row
             border>
    <kye-table-column width="50px"
                      type="index"
                      v-if="showIndex">
    </kye-table-column>
    <kye-table-column v-for="(field, index) in columns"
                      :key="`column-${index}`"
                      :label="field.label"
                      :width="field.width || '150px'"
                      :min-width="field.minWidth || '120px'"
                      :show-overflow-tooltip="field.tips || false">
      <label slot-scope="scope">
        {{getFieldValue(scope.row, field)}}
      </label>
    </kye-table-column>
  </kye-table>
</template>
<script>
  import trim from '@/fms/utils/framework/trim'
  import { get } from 'lodash'

  export default {
    data () {
      return {
      }
    },
    /**
     * 属性列表
     * @property {Array} columns - 表格数据列表
     * @property {Array} data - 表格数据
     * @property {Boolean} showIndex - 是否显示索引信息
     */
    props: {
      columns: {
        type: Array,
        required: true
      },
      data: {
        type: Array,
        default: () => []
      },
      showIndex: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      /**
       * 双击后的处理
       */
      rowDblclickHandle (...params) {
        this.$emit('row-dblclick', ...params)
      },
      /**
       * 行点击事件处理
       * @since 1.0.0
       */
      async rowClickedHandle (...params) {
        this.$emit('row-click', ...params)
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
