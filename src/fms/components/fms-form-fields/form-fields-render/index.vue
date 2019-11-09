<template>
  <div class="fms-form-fields-render">
    <kye-row>
      <el-col
        v-for="(field, column) in fields"
        :key="'field-' + column"
        :span="computeSpan(field.column)"
      >
        <el-form-item
          :label="field.label"
          :prop="field.key"
          :fieldName="field.key"
          v-if="showField(field)"
        >
          <span
            slot="label"
            class="kye-label-click"
            v-if="field.func"
            @click="field.func"
          >{{field.label}}</span>
          <!-- 如果需要自己处理,则提供命名插槽出去 -->
          <slot :name="field.slot" v-if="field.slot"></slot>
          <!-- 自动生成 -->
          <template v-else>
            <!--
            other
            参考陈勇fms-components
            @author xuzengqiang
            @date 2018-06-21 10:06:33
            -->
            <component
              v-if="field.component"
              :is="field.component"
              :value="getFieldValue(field)"
              @input="value => setFieldValue(field, value)"
              v-on="field.listeners || {}"
              v-bind="field.props || {}"
            ></component>

            <!-- 这里就不能通过v-model实现双向数据绑定,而是监听input -->
            <kye-input
              v-else-if="!field.type || (field.type === 'text' || field.type === 'textarea')"
              :clearable="disabled(field) ? false: field.clearable"
              :type="field.type"
              :style="field.style"
              :disabled="disabled(field)"
              :value="getFieldValue(field)"
              :rows="field.rows || 1"
              :resize="field.resize || 'none'"
              :maxlength="field.maxlength"
              v-on="field.listeners || {}"
              @input="value => setFieldValue(field, value)"
            ></kye-input>
            <!--
            如果是money
            @author xuzengqiang
            @date 2018-06-30 14:46:53
            @since 1.0.1
            -->
            <kye-number
              v-else-if="field.type === 'money'"
              :clearable="field.clearable === undefined ? true: !!field.clearable"
              symbol="￥"
              type="number"
              :style="field.style"
              :disabled="disabled(field)"
              :value="getFieldValue(field)"
              v-on="field.listeners || {}"
              :precision="2"
              @input="value => setFieldValue(field, value)"
            ></kye-number>
            <!--如果是number-->
            <kye-number
              v-else-if="field.type === 'number'"
              :clearable="field.clearable === undefined ? true: !!field.clearable"
              :symbol="field.symbol || ''"
              :unit="field.unit || ''"
              :type="field.type"
              :style="field.style"
              :disabled="disabled(field)"
              :value="getFieldValue(field)"
              v-on="field.listeners || {}"
              :precision="/^(0|[1-9]\d*)$/.test(field.precision) ? field.precision: 2"
              @input="value => setFieldValue(field, value)"
            ></kye-number>
            <!--
            下拉框配置
            @author xuzengqiang
            @date 2018-06-20 21:57:44
            @description 如果被禁用,则不显示placeholder
            -->
            <kye-select
              v-else-if="field.type === 'select'"
              v-bind="field.attr"
              :clearable="field.clearable === undefined ? true: !!field.clearable"
              :placeholder="field.disabled ? '' : field.placeholder"
              :filterable="!(field.attr && field.attr.multiple)"
              :style="field.style"
              :disabled="disabled(field)"
              :value="getFieldValue(field)"
              v-on="field.listeners || {}"
              @input="value => setFieldValue(field, value)"
            >
              <kye-option
                v-for="option in getOptions(field)"
                :key="option.value"
                :label="option.label"
                :value="option.value"
                :disabled="option.disabled"
              ></kye-option>
            </kye-select>

            <!-- 日期配置 -->
            <kye-date-picker
              v-else-if="field.type === 'datePicker'"
              :clearable="field.clearable === undefined ? true: !!field.clearable"
              v-bind="field.attr"
              :disabled="disabled(field)"
              :type="field.dateType"
              :style="field.style"
              v-on="field.listeners || {}"
              :format="field.format || field.valueFormat || 'yyyy-MM-dd HH:mm'"
              :value-format="field.valueFormat || 'yyyy-MM-dd HH:mm:ss'"
              :value="getFieldValue(field)"
              @input="value => setFieldValue(field, value)"
            ></kye-date-picker>
            <!-- 所属区域配置 -->
          </template>
        </el-form-item>
      </el-col>
    </kye-row>
  </div>
</template>
<script>
  import mixins from 'public/mixins'
  import { set, get } from 'lodash'
  import trim from '@/fms/utils/framework/trim'
  const isInt = number => /^[1-9]\d*$/.test(number)

  /**
   * 最大列数
   */
  const DEFAULT_MAX_SPAN = 24

  /**
   * 默认列数
   */
  const DEFAULT_COLUMN = 4

  export default {
    mixins: [mixins],
    /**
     * 属性列表
     * @property {Array} fields - 当前栏目下的字段信息
     * @property {Object} model - model
     * @property {Number} column - 列数,默认为4列
     */
    props: {
      fields: {
        type: Array,
        default: () => []
      },
      model: {
        type: Object,
        required: true
      },
      column: {
        type: Number,
        default: DEFAULT_COLUMN,
        validator (value) {
          return isInt(value) && (parseInt(value) === 1 || parseInt(value) % 2 === 0)
        }
      }
    },
    computed: {
      /**
       * 获取每一行的fields
       * @return {Array}
       */
      rowFields () {
        let rows = []
        let sum = 0
        let arr = []
        let totalspan = DEFAULT_MAX_SPAN
        let column = parseInt(this.column)
        // 默认一列所占的span数
        let span = totalspan / column

        this.fields.forEach(field => {
          field.span = Math.min(totalspan, (isInt(field.column) ? parseInt(field.column) : 1) * span)
          if (sum + field.span < totalspan) {
            arr.push(field)
            sum += field.span
          } else if (sum + field.span === totalspan) {
            arr.push(field)
            rows.push(arr)
            sum = 0
            arr = []
          } else {
            rows.push(arr)
            arr = []
            arr.push(field)
            sum = field.span
          }
        })

        if (arr.length) {
          rows.push(arr)
        }

        return rows
      }
    },
    methods: {
      /**
       * 表单是否被禁用
       * @date 2018-08-14 21:20:19
       * @since 1.0.1
       * @description 这里不做强转,抛异常
       */
      disabled (field) {
        if (typeof field.disabled === 'function') {
          return field.disabled()
        }
        return field.disabled
      },
      // 计算span
      computeSpan (column) {
        let span = DEFAULT_MAX_SPAN / this.column
        if (column) {
          return span * column
        }
        return span
      },
      /**
       * 是否需要显示当前字段
       * @date 2018-08-30 15:20:27
       * @since 1.0.1
       * @description 默认为show
       */
      showField (field) {
        if (typeof field.show === 'function') {
          return !!(field.show())
        }
        return field.hasOwnProperty('show') ? !!(field.show) : true
      },
      /**
       * 获取指定字段的值
       * @param {Object} field - 字段信息
       *
       * @update xuzengqiang
       * @date 2018-07-06 11:33:54
       * @since 1.0.1
       * @description 如果有trim属性,则自动去除前后空格
       */
      getFieldValue (field) {
        if (!field) {
          return null
        }
        const trimValue = value => field.trim ? trim(value) : value
        // if (field.value) {
        //   return field.value
        // }
        const key = field.key ? (field.key + '').trim() : ''
        if (key) {
          const modelValue = get(this.model, key)
          const value = modelValue === undefined ? field.default : modelValue
          try {
            return trimValue(this.filterField(value, field.filter))
          } catch (e) {
            console.error(e)
            return trimValue(value)
          }
        }
        return trimValue(null)
      },
      /**
       * 设置字段值
       * @param {Object} field - 字段信息
       * @param {mixed} value - 字段值
       *
       * @udpate xuzengqiang
       * @date 2018-07-06 11:40:24
       * @description 如果设置了trim,那么去掉前后空格
       */
      setFieldValue (field, value) {
        if (!field || !field.key) {
          return
        }
        const key = field.key ? (field.key + '').trim() : ''
        if (key) {
          const formatter = field.formatter

          let fieldValue = typeof formatter === 'function' ? formatter(value) : value
          fieldValue = field.trim ? trim(fieldValue) : fieldValue
          set(this.model, key, fieldValue)
        }
      },
      /**
       * 获取字段对应的options
       * @return {Array}
       */
      getOptions (field) {
        if (!field) {
          return []
        }
        if (Array.isArray(field.options)) {
          return field.options
        }

        const lookupCode = field.lookupCode ? (field.lookupCode + '').trim() : ''
        if (lookupCode) {
          let options = this.lookUpOptions[lookupCode]

          /**
           * 如果是lookupCode,那么禁用的选项通过disableds属性控制
           * @author xuzengqiang
           * @date 2018-06-12 16:38:07
           * @since 1.0.1
           */
          if (Array.isArray(field.disableds) && field.disableds.length) {
            options.forEach(option => {
              if (field.disableds.indexOf(option.value) !== -1) {
                option.disabled = true
              }
            })
          }
        }

        return lookupCode ? this.lookUpOptions[lookupCode] : []
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
