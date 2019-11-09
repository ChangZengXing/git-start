<template>
  <kye-form
    class="fms-form fms-form-type"
    :class="classComputed"
    :ref="'form'"
    :model="model"
    :rules="rules"
    :label-width="labelWidthComputed"
    :label-position="labelPositionComputed"
    :hide-required-asterisk="hideRequiredAsterisk"
  >
    <fms-page-loading :loading="loading" :loadingText="loadingText" />
    <slot></slot>
  </kye-form>
</template>

<script>
  import FmsFormMixins from '../../mixins/fms-form'
  import FmsPageLoading from '../fms-page-loading'
  import { getGridsLabelWidth } from '@/fms/utils'
  export default {
    props: {
      type: { type: String, default: 'detail' },
      grids: { type: Array, default: () => [] },
      model: { type: Object, default: () => ({}) },
      rules: { type: Object, default: () => ({}) },
      loading: Boolean,
      loadingText: String,
      labelWidth: { type: String, default: '64px' },
      labelPosition: { type: String, default: '' },
      hideRequiredAsterisk: { type: Boolean, default: false }
    },
    name: 'fms-form-type',
    mixins: [FmsFormMixins],
    components: { FmsPageLoading },
    computed: {
      labelPositionComputed() {
        return this.labelPosition
      },
      classComputed() {
        return ['fms-form-' + this.type, { 'fms-form-grids': this.grids.length > 0 }]
      },
      // 根据字符个数动态计算宽度(满足UI需求)
      labelWidthComputed() {
        let labelWidth = this.labelWidth
        if (this.grids.length > 0) {
          labelWidth = getGridsLabelWidth(this.grids) || labelWidth
          console.log('labelWidthInGrids', labelWidth)
        }
        return labelWidth
      }
    }
  }
</script>

<style lang="scss">
  .fms-form {
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

  // 详情页面
  .fms-form-detail {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
      cursor: default;
      background-color: #fff;
    }
  }

  // 修改,新增页面
  .fms-form-add,
  .fms-form-modify {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
    }
    .kye-field-text,
    .kye-field-content {
      background-color: #ebebed;
    }
  }
</style>
