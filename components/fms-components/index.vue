<template>
  <div class="fms-components" :class="fmsComponentClass">
    <template v-if="col.component === 'kye-select'">
      <!-- 目前kye-select组件 self.data.props.value = String(self.props.value (undefined)报错 -->
      <el-select v-on="listeners" v-bind="bindProps()" :value="filter()" @input="formatter">
        <el-option
          v-for="{ label, value, title, disabled } in options()"
          :key="label"
          :label="label"
          :value="value"
          :title="title"
          :disabled="disabled"
        ></el-option>
      </el-select>
    </template>
    <template v-else-if="col.component === 'el-select'">
      <el-select v-on="listeners" v-bind="bindProps()" :value="filter()" @input="formatter">
        <el-option
          v-for="{ label, value, title, disabled } in options()"
          :key="label"
          :label="label"
          :value="value"
          :title="title"
          :disabled="disabled"
        ></el-option>
      </el-select>
    </template>
    <template v-else-if="col.component === 'kye-button' || col.component === 'el-button'">
      <kye-button
        v-on="listeners"
        v-bind="bindProps()"
        :ref="col.componentRef || col.key"
      >{{ col.label }}</kye-button>
    </template>
    <template v-else-if="col.slot">
      <slot :name="col.slot" :col="col" :model="model" :index="index"></slot>
    </template>
    <template v-else-if="col.render">
      <fms-render :render="col.render" :model="model" :col="col" :index="index"></fms-render>
    </template>
    <template v-else>
      <component
        :is="col.component"
        :ref="col.componentRef || col.key"
        :value="filter()"
        v-on="listeners"
        v-bind="bindProps()"
        @input="formatter"
      />
    </template>
  </div>
</template>

<script>
  import FmsComponents from './'
  import FmsRender from '../fms-render'
  import { dp, filter, toNumber } from '@/fms/utils'
  import { get, set, trim, hasIn, round, toString } from 'lodash'
  // 季度选择
  import FmsSelectQuarter from '../fms-select-quarter'
  // 扩展公共搜索组件
  import FmsKyeSearchTips from '../fms-kye-search-tips'
  // 远程搜索选择
  import FmsSelectRemote from '../fms-select-remote'
  // 输入框tags组件
  import FmsTags from '../fms-tags'
  // 文件上传
  import FmsUploadFiles from '../fms-upload-files'
  // 表单输入框tags组件(FmsTags组件升级版)
  import FmsFormTags from '../fms-form-tags'

  import FmsSearch from '../fms-search'

  export default {
    name: 'fms-components',
    props: {
      index: Number,
      col: { type: Object, default: () => ({}) },
      model: { type: Object, default: () => ({}) }
    },
    // 本地注册 FmsSelectQuarter 便于配置使用
    components: {
      FmsTags,
      FmsRender,
      FmsFormTags,
      FmsSearch,
      FmsComponents,
      FmsUploadFiles,
      FmsSelectRemote,
      FmsSelectQuarter,
      FmsKyeSearchTips
    },
    computed: {
      lookUpOptions() {
        return this.$store.getters.lookUpOptions
      },
      listeners() {
        if (!this.col.component || this.col.component === 'kye-field') {
          return {}
        } else {
          const _listeners = this.col.componentListeners || this.col.listeners || {}
          return this.bindListeners(_listeners)
        }
      },
      fmsComponentClass() {
        const classNames = {}
        if (this.col.scroll) {
          classNames['fms-components-scroll'] = true
        }
        if (this.col.disabled) {
          classNames['fms-components-disabled'] = true
        }
        return classNames
      }
    },
    data() {
      return {
        lookup(val, key) {
          return filter.lookup(val, key)
        }
      }
    },
    methods: {
      // 是否是敏感字段(前端不要隐藏, 返回6个*)
      isSensitiveField() {
        const { key } = this.col
        const hasMaskSecKey = hasIn(this.model, key + 'MaskSec')
        return !!key && hasMaskSecKey
      },
      // 是否是监控字段
      isMonitoredField() {
        const { key } = this.col
        const maskValue = get(this.mode, key + 'Mask')
        return !!key && !!maskValue
      },
      // 是否是虚拟号码
      isVirtualNumber() {
        const { key } = this.col
        const virtualValue = get(this.model, key + 'Virtual')
        return !!key && !!virtualValue
      },
      getValue() {
        if (this.col.hasOwnProperty('computed')) {
          return typeof this.col.computed === 'function' ? this.col.computed(this) : this.col.computed
        }
        let value = get(this.model, this.col.key)
        if (typeof value === 'number' && this.col.component === 'kye-number') {
          const { precision = 2 } = this.col.componentProps || {}
          value = round(value, precision).toFixed(precision)
        }
        return value
      },
      filter() {
        // 敏感字段显示为6个*
        if (this.isSensitiveField()) {
          return get(this.model, this.col.key) || window.__ERPGLOABLECONFIG__.maskSec || '✽✽✽'
        }

        // 监控字段,虚拟号码
        if (this.isMonitoredField() || this.isVirtualNumber()) {
          return get(this.model, this.col.key)
        }

        let value = this.getValue()

        // 注意 kye-select组件 change事件
        // 不要使用filter, 要不change事件,即使选择同一个选项,也会触发change事件
        // 原因是选择同一个选项后vue不会渲染组件,即filter函数不会执行,这样上一次的值会是lookup执行后的label值
        if (this.col.component === 'kye-select' || this.col.component === 'el-select') {
          // 也执行一次filter,用于值更新
          if (typeof this.col.filter === 'function') {
            this.col.filter(value, this)
          }
          // 这里将后端字典为数字的进行字符串转换(注意是否会导致: 即使选择同一个选项,也会触发change事件?)
          return typeof value === 'number' ? toString(value) : value
        }

        // 金额特殊格式
        if (
          ['.', ',', '¥', '%', '0.0', '0.0%', 'money', 'money4', 'thousands'].includes(
            this.col.filter
          )
        ) {
          if (!this.col.component || this.col.component === 'kye-field') {
            return filter[this.col.filter](toString(value))
          }
          if (this.col.component === 'kye-input' || this.col.component === 'el-input') {
            if (this.bindProps().disabled) {
              return filter[this.col.filter](toString(value))
            }
          }
          return value
        } else {
          if (typeof this.col.filter === 'string') {
            return filter[this.col.filter](value)
          }
          value = this.col.filter
            ? this.col.filter(value, this)
            : this.col.lookupCode
            ? filter.lookup(value, this.col.lookupCode)
            : value
          return value
        }
      },
      formatter(value) {
        if (this.col.trim && typeof value !== 'object') {
          value = trim(value)
        }
        if (this.col.number) {
          value = toNumber(value)
        }
        const _value = this.col.formatter ? this.col.formatter(value, this) : value
        set(this.model, this.col.key, _value)
        this.$emit('input', _value)
      },
      options() {
        if (Array.isArray(this.col.options)) {
          // [{value: 'Option1', label: 'Option1'}]
          return this.col.options
        }
        if (typeof this.col.options === 'function') {
          // lookUpOptions中值为freeze 或者字典不同步(不存在)
          return this.col.lookupCode
            ? this.col.options(dp(this.lookUpOptions[this.col.lookupCode]) || {})
            : this.col.options([])
        }
        if (this.col.lookupCode) {
          // lookUpOptions中值为freeze
          return (dp(this.lookUpOptions[this.col.lookupCode]) || []).map(li => {
            if (this.col.lookupCodeDisabled && this.col.lookupCodeDisabled.indexOf(li.value) > -1) {
              li.disabled = true
            } else {
              li.disabled = false
            }
            return li
          })
        }
        return []
      },
      bindListeners(listeners) {
        const _listeners = {}
        Object.keys(listeners).forEach(key => {
          _listeners[key] = listeners[key].bind(this)
        })
        return _listeners
      },
      bindProps() {
        const props = {}
        if (!this.col.component || this.col.component === 'kye-field') {
          return props
        }

        // 输入框字段 统一设置一个最大输入长度3000
        if (this.col.component === 'kye-input' || this.col.component === 'el-input') {
          props.maxlength = 3000
        }

        // 查询按钮,统一加上查询icon
        if (this.col.label === '查询' && this.col.component === 'kye-button') {
          props.icon = 'iconfont icon-search'
        }

        // kye-select / el-select 默认设置可清除
        if (this.col.component === 'kye-select' || this.col.component === 'el-select') {
          props.clearable = true
        }

        if (typeof this.col.componentProps === 'function') {
          return { ...props, ...this.col.componentProps(this) }
        }
        return { ...props, ...(this.col.componentProps || this.col.props) }
      },
      // form-item for kye-search-tips validate
      clearValidate() {
        this.$parent.clearValidate && this.$parent.clearValidate()
      },
      onFieldBlur() {
        this.$parent.onFieldBlur && this.$parent.onFieldBlur()
      }
    }
  }
</script>

<style>
  .fms-components {
    position: relative;
  }
  .fms-components.fms-components-scroll {
    position: absolte;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
  }
  .fms-components.fms-components-disabled .kye-field-text {
    background-color: #f1f1f5;
  }
</style>
