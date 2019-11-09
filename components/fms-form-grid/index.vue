<template>
  <el-form
    class="fms-form fms-form-grid"
    ref="form"
    :rules="rules"
    :inline="grid.inline || inline"
    :class="fmsFormGridClass"
    :model="grid.model || model"
    :labelWidth="labelWidthComputed"
    :label-position="labelPositionComputed"
    :hide-required-asterisk="hideRequiredAsterisk"
    v-bind="$attrs"
  >
    <fms-grid
      :form="true"
      :grid="grid"
      :bizId="bizId"
      :model="model"
      :title="title"
      :gutter="gutter"
      :columns="columns"
      :inline="grid.inline || inline"
      :moduleCode="moduleCode"
      :formItem="grid.formItem || formItem"
    >
      <template
        v-for="scopedSlot in Object.keys($scopedSlots)"
        :slot="scopedSlot"
        slot-scope="props"
      >
        <slot :name="scopedSlot" :col="props.col" :model="props.model" :index="props.index" />
      </template>
      <template v-for="slot in Object.keys($slots)" :slot="slot">
        <slot :name="slot"></slot>
      </template>
    </fms-grid>
  </el-form>
</template>

<script>
  import FmsGrid from '../fms-grid'
  import fmsFormMixins from '../../mixins/fms-form'
  import { getGridLabelWidth } from '@/fms/utils'
  export default {
    props: {
      type: String,
      bizId: String,
      title: String,
      border: Boolean,
      columns: Number,
      formItem: Object,
      labelWidth: String,
      moduleCode: String,
      gutter: { type: [Number, String], default: 8 },
      grid: { type: Object, default: () => ({}) },
      model: { type: Object, default: () => ({}) },
      rules: { type: Object, default: () => ({}) },
      inline: { type: Boolean, default: false },
      labelWrap: { type: Boolean, default: false },
      labelPosition: { type: String, default: 'right' },
      hideRequiredAsterisk: { type: Boolean, default: false }
    },
    name: 'fms-form-grid',
    mixins: [fmsFormMixins],
    components: { FmsGrid },
    computed: {
      form() {
        return this.$refs.form
      },
      fmsFormGridClass() {
        const type = this.grid.type || this.type
        return [
          type ? 'fms-form-grid-' + type : '',
          this.grid.border || this.border ? 'fms-form-grid-border' : '',
          this.grid.inline || this.inline ? 'fms-form-grid-inline' : '',
          { 'fms-form-grid-label-wrap': this.grid.labelWrap || this.labelWrap }
        ]
      },
      labelPositionComputed() {
        return this.grid.labelPosition || this.labelPosition
      },
      // 根据字符个数动态计算宽度(满足UI需求)
      labelWidthComputed() {
        return this.grid.labelWidth || this.labelWidth || getGridLabelWidth(this.grid) || '64px'
      }
    },
    methods: {
      getValidate () {
        this.$refs.form.validate(async valid => {})
      }
    }
  }
</script>

<style lang="scss">
  .fms-form-grid {
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

  // 修改,新增页面
  .fms-form-grid-add,
  .fms-form-grid-modify {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
    }

    .kye-field-text,
    .kye-field-content {
      background-color: #ebebed;
    }
  }
  // 底部border
  .fms-form-grid-border {
    margin-bottom: 12px;
    border-bottom: 1px solid #dcdae2;
  }
  .fms-form-grid.fms-form-grid-inline {
    &.fms-form-grid-border {
      margin-bottom: 4px;
    }
    .el-form-item {
      margin-bottom: 4px;
    }
  }
  // label超过宽度后,自动换行
  .fms-form-grid.fms-form-grid-label-wrap.el-form .fms-grid.fms-grid {
    .el-form-item.is-required {
      position: relative;
      .el-form-item__label {
        display: inline-block;
        height: auto;
        position: absolute;
        // top: 50%;
        top: 13px;
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
</style>
