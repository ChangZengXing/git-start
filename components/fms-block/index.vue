<template>
  <section class="fms-block" :class="type ? 'fms-block-' + type : ''">
    <fms-block-title v-if="block.title || title" :titleClass="titleClass">{{block.title || title}}</fms-block-title>
    <fms-form-rows
      v-if="block.rows && block.rows.length > 0"
      :refs="refs"
      :rows="block.rows"
      :form="block.form !== undefined ? block.form : form"
      :model="block.model || model"
      :gutter="block.gutter || gutter"
    >
      <!--
        v-bind="{ scopedSlots: $scopedSlots }
        see https://github.com/vuejs/vue/pull/7765
        当前vue版本2.5.16还没有发布
      -->
      <template
        v-for="scopedSlot in Object.keys($scopedSlots)"
        :slot="scopedSlot"
        slot-scope="props"
      >
        <slot :name="scopedSlot" :props="props.props"></slot>
      </template>
      <template v-for="slot in Object.keys($slots)" :slot="slot">
        <slot :name="slot"></slot>
      </template>
    </fms-form-rows>
    <template v-else>
      <div class="fms-block-content">
        <slot></slot>
      </div>
    </template>
  </section>
</template>

<script>
  import FmsFormRows from '../fms-form-rows'
  import FmsBlockTitle from '../fms-block-title'
  export default {
    name: 'fms-block',
    props: {
      type: String,
      title: String,
      titleClass: String,
      gutter: { type: Number, default: 8 },
      form: { type: Boolean, default: true },
      refs: { type: Object, default: () => ({}) },
      model: { type: Object, default: () => ({}) },
      block: { type: Object, default: () => ({}) }
    },
    components: { FmsFormRows, FmsBlockTitle }
  }
</script>

<style lang="scss">
  .fms-block {
    .fms-components {
      textarea[rows="2"] {
        height: 74px;
      }
    }
    .fms-block-content {
      padding: 0 16px 16px 16px;
    }
  }
  // fix: 20270
  .el-form.el-form--inline,
  .el-form.el-form--label-left,
  .el-form.el-form--label-right {
    .fms-block {
      .el-form-item.is-required {
        position: relative;
        .el-form-item__label {
          display: inline-block;
          height: auto;
          position: absolute;
          top: 6px;
          transform: translateY(0%);
          // 保证5个汉字不换行
          white-space: nowrap;
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
  }
  .el-form.el-form--label-top {
    .fms-block {
      .el-form-item.is-required {
        .el-form-item__label {
          &::before {
            margin-right: 0;
            right: 0;
          }
        }
      }
    }
  }
</style>
