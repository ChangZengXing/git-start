<template>
  <!-- :label-width="'70px'" 无效对于kye-form??, 需要设置 :labelWidth="'70px'"
     kye-form:
      let labelWidth = self.props.labelWidth || '64px'
      self.data.attrs = { ...self.data.attrs, labelWidth }
  -->
  <el-form
    class="fms-form fms-form-block"
    :ref="'form'"
    :rules="rules"
    :inline="block.inline || inline"
    :class="fmsFormBlockClass"
    :model="block.model || model"
    :labelWidth="block.labelWidth || labelWidthComputed"
    :label-position="labelPositionComputed"
    :hide-required-asterisk="block.inline || inline"
    v-bind="$attrs"
  >
    <fms-block-title v-if="block.title || title">{{block.title || title}}</fms-block-title>
    <fms-form-rows
      v-if="block.rows && block.rows.length > 0"
      :refs="refs"
      :rows="block.rows"
      :block="block"
      :inline="block.inline || inline"
      :form="block.form !== undefined ? block.form : form"
      :model="block.model || model"
      :formItem="block.formItem || formItem"
      :labelWidth="block.labelWidth || labelWidth"
      :bizId="bizId || block.bizId"
      :moduleCode="moduleCode || block.moduleCode"
      :gutter="gutterComputed"
    >
      <!--
        v-bind="{ scopedSlots: $scopedSlots }
        see https://github.com/vuejs/vue/pull/7765
        当前vue版本2.5.x还没有发布
        已在 2.6版本中发布 https://github.com/vuejs/vue/projects/4#card-15491746
      -->
      <template
        v-for="scopedSlot in Object.keys($scopedSlots)"
        :slot="scopedSlot"
        slot-scope="props"
      >
        <slot :name="scopedSlot" :props="props.props"></slot>
      </template>
      <template v-for="slot in Object.keys($slots)" :slot="slot">
        <slot :name="slot" :props="{block, model}"></slot>
      </template>
    </fms-form-rows>
    <template v-else>
      <slot></slot>
    </template>
  </el-form>
</template>

<script>
  import { trim, isEmpty } from 'lodash'
  import FmsFormRows from '../fms-form-rows'
  import FmsBlockTitle from '../fms-block-title'
  import FmsFormMixins from '../../mixins/fms-form'
  import { getBlockLabelWidth, getColInBlockByKey } from '@/fms/utils'
  export default {
    props: {
      type: String,
      bizId: String,
      title: String,
      border: Boolean,
      formItem: Object,
      moduleCode: String,
      labelWidth: String,
      gutter: { type: Number, default: 8 },
      form: { type: Boolean, default: true },
      inline: { type: Boolean, default: false },
      inlineMargin: { type: Boolean, default: false },
      refs: { type: Object, default: () => ({}) },
      model: { type: Object, default: () => ({}) },
      rules: { type: Object, default: () => ({}) },
      block: { type: Object, default: () => ({}) },
      labelWrap: { type: Boolean, default: false },
      labelPosition: { type: String, default: 'right' }
    },
    name: 'fms-form-block',
    mixins: [FmsFormMixins],
    components: { FmsFormRows, FmsBlockTitle },
    data() {
      return {
        inTab: false
      }
    },
    computed: {
      fmsFormBlockClass() {
        const type = this.block.type || this.type
        return [
          type ? 'fms-form-block-' + type : '',
          this.block.border || this.border ? 'fms-form-block-border' : '',
          this.block.inline || this.inline ? 'fms-form-block-inline' : '',
          this.block.inlineMargin || this.inlineMargin ? 'fms-form-block-inline-margin' : '',
          { 'fms-form-block-intab': this.inTab },
          { 'fms-form-block-group': this.block.groupName !== undefined },
          { 'fms-form-block-label-wrap': this.labelWrap }
        ]
      },
      labelPositionComputed() {
        return this.block.labelPosition || this.labelPosition
      },
      // 根据字符个数动态计算宽度(满足UI需求)
      labelWidthComputed() {
        if (this.inline) {
          return this.labelWidth || 'auto'
        }
        return getBlockLabelWidth(this.block) || '64px'
      },
      gutterComputed() {
        if (this.block.inline || this.inline) {
          return 0
        }
        return this.block.gutter !== undefined ? this.block.gutter : this.gutter
      }
    },
    methods: {
      getFormModel(keepOriginModelKey = false) {
        const model = {}
        const groupModel = {}
        Object.keys(this.model).forEach(key => {
          const col = getColInBlockByKey(this.block, key)
          if (!col) {
            // 是否保留this.model中的原始的key对应的值同时不存在this.block中
            // 比如id之类的不在界面上显示的字段值
            if (keepOriginModelKey) {
              model[key] = this.model[key]
            }
            return
          }
          let val = this.model[key]
          if (trim(val)) {
            if (col.items) {
              const { value, key } = val
              model[key] = value
            } else {
              model[key] = val
            }
          }
          // 分组,并选中
          if (this.block.groupName !== undefined && col.groupName === this.block.groupName) {
            if (trim(val) || !isEmpty(val)) {
              if (col.items) {
                const { value, key } = val
                groupModel[key] = value
              } else {
                groupModel[key] = val
              }
            } else {
              if (col.items && col.items[0]) {
                const it = col.items[0]
                if (it.defaultValue) {
                  groupModel[it.key] = it.defaultValue
                }
              }
            }
          }
        })
        // 标记选择的分组
        if (this.block.groupName !== undefined) {
          Object.defineProperty(groupModel, 'groupName', {
            value: this.block.groupName,
            enumerable: false
          })
        }
        return this.block.groupName !== undefined ? groupModel : model
      },
      getFormValues() {
        return Object.values(this.getFormModel())
      }
    },
    created() {
      // 在tabpanel中
      if (this.$parent.$options._componentTag === 'el-tab-pane') {
        this.inTab = true
      }
    }
  }
</script>

<style lang="scss">
  // fix: 20270
  .fms-form-block.el-form--inline,
  .fms-form-block.el-form--label-left,
  .fms-form-block.el-form--label-right {
    .el-form-item.is-required {
      position: relative;
      .el-form-item__label {
        display: flex;
        height: 28px;
        align-items: center;
        position: relative;
        top: 0;
        transform: translateY(0%);
        // 保证5个汉字不换行
        white-space: nowrap;
        &::before {
          margin-right: 0;
          position: relative;
          top: 0px;
          right: 0;
          font-size: 12px;
        }
      }
    }
  }
  // label超过宽度后,自动换行
  .el-form.el-form.el-form.fms-form-block-label-wrap {
    .el-form-item.is-required {
      position: relative;
      .el-form-item__label {
        display: inline-block;
        height: auto;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        white-space: normal;
        &::before {
          margin-right: -4px;
          position: relative;
          top: 0px;
          right: 4px;
          font-size: 12px;
        }
      }
    }
  }
  .fms-form-block.el-form--label-top {
    .el-form-item.is-required {
      .el-form-item__label {
        &::before {
          margin-right: 0;
          right: 0;
        }
      }
    }
  }
  .fms-form-block {
    .fms-components {
      textarea[rows='2'] {
        height: 68px;
      }
    }
    .el-input.is-disabled .el-input__inner {
      color: #333;
    }
    table tr {
      .el-form-item {
        margin-bottom: 0px;
      }
      .kye-field-text {
        display: inline;
      }
    }
    .el-form-item__content .el-input-group {
      vertical-align: initial;
    }
  }
  .fms-form-block {
    .kye-field-text,
    .kye-field-content {
      display: block;
      height: 28px;
      line-height: 14px;
      padding: 6px 8px;
      border-radius: 2px;
      border: 1px solid #d2d2d6;
    }
    .el-form-item__label {
      text-align: right;
    }
    .el-form-item__content {
      min-height: 28px;
    }
    .kye-block-title {
      margin-bottom: 12px;
    }
  }
  .fms-form-block-border {
    margin-bottom: 12px;
    border-bottom: 1px solid #dcdae2;
  }
  .fms-form-block.fms-form-block-inline {
    &.fms-form-block-border {
      margin-bottom: 0px;
    }
    .el-form-item {
      margin-bottom: 4px;
    }
  }

  // 修改页,新增页面
  .fms-form-block-add,
  .fms-form-block-modify {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
    }
    .kye-field-text,
    .kye-field-content {
      background-color: #ebebed;
    }
  }

  .fms-form-block-inline {
    .el-row--flex {
      flex-wrap: wrap;
    }
    .fms-form-item__kye-button .el-form-item__label {
      padding-right: 0;
    }
    .el-form-item.is-required {
      .el-form-item__label {
        position: relative;
        top: auto;
        height: 28px;
        transform: none;
        line-height: 28px;
      }
    }
    .el-form-item__error {
      display: none;
    }
  }

  .fms-form-block.fms-form-block-intab {
    margin-top: 11px;
  }
  .fms-form-block-group {
    .el-radio {
      line-height: 28px;
      .el-radio__label {
        display: none;
      }
    }
    .fms-form-col-disabled > .el-form-item {
      position: relative;
      &:before {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .kye-label-click {
        color: inherit;
      }
    }
  }
  .el-form.fms-form-block.fms-form-block-inline-margin.fms-form-block-inline {
    .fms-form-rows-inline.fms-form-rows-inline .el-form-item {
      margin-bottom: 4px;
    }
  }
</style>
