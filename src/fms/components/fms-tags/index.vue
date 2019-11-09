<template>
  <div class="fms-tags" :class="{'fms-tags-add-inline': addInline, 'fms-tags-disabled': disabled}">
    <div class="fms-tag-list el-input__inner" :class="{'fms-tag-list__empty': value.length === 0}">
      <el-tag
        v-for="tag in value"
        :key="getKey(tag)"
        :size="size"
        :closable="!disabled && closable"
        @close="onClose(tag)"
        v-on="$listeners"
        v-bind="$attrs"
      >{{getTagName(tag)}}</el-tag>
      <template v-if="add && addInline && !disabled">
        <slot>
          <kye-button type="primary" icon="iconfont icon-plus" @click="onAdd"></kye-button>
        </slot>
      </template>
    </div>
    <template v-if="add && !addInline && !disabled">
      <slot>
        <kye-button type="primary" icon="iconfont icon-plus" @click="onAdd"></kye-button>
      </slot>
    </template>
  </div>
</template>

<script>
  import { get } from 'lodash'
  export default {
    props: {
      add: { type: [Function, Boolean] },
      addInline: { type: Boolean, default: true },
      value: { type: Array, default: () => [] },
      tags: { type: Array, default: () => [] },
      valueKey: { type: String },
      size: { type: String, default: 'small' },
      labelKey: { type: String, default: 'label' },
      disabled: { type: Boolean, default: false },
      closable: { type: Boolean, default: true }
    },
    data() {
      return {
        curTags: this.tags || []
      }
    },
    watch: {
      value(val) {
        console.log('fms-tags', val)
        this.curTags = val
      }
    },
    methods: {
      getKey(tag) {
        if (typeof tag === 'string') return tag
        return tag[this.labelKey]
      },
      getTagName(tag) {
        if (typeof tag === 'string') return tag
        return get(tag, this.valueKey || this.labelKey)
      },
      onAdd() {
        if (typeof this.add === 'function') {
          this.add()
        }
        this.$emit('add')
      },
      onClose(tag) {
        const tags = this.value.filter(t => t !== tag)
        this.$emit('input', tags)
      }
    }
  }
</script>

<style lang="scss">
  .fms-tags {
    display: flex;
    align-items: center;
    .fms-tag-list.el-input__inner {
      height: auto;
      min-height: 28px;
      padding: 0px 4px;
      padding-top: 1px;
      line-height: 10px;
      flex: 1;
      margin-right: 4px;
      .el-tag {
        margin-right: 4px;
        margin-bottom: 1px;
      }
      span:last-of-type {
        margin-right: 0;
      }
      &.fms-tag-list__empty {
        .el-button.el-button.el-button {
          margin-bottom: 1px;
        }
      }
    }
    .el-button.el-button.el-button {
      min-width: 32px;
      margin-bottom: 1px;
    }
  }
  .fms-tags.fms-tags-add-inline {
    .fms-tag-list.el-input__inner {
      margin-right: 0;
    }
    .el-button.el-button.el-button {
      height: 24px;
      padding: 0 8px;
      line-height: 22px;
      display: inline-block;
      margin-bottom: 1px;
      vertical-align: bottom;
      // &:only-child {
      // }
    }
    // .el-tag + .el-button {
    //   margin-left: -4px;
    // }
  }

  .fms-tags-disabled {
    .fms-tag-list.el-input__inner {
      background-color: #ebebed;
      border-color: #d2d2d6;
    }
  }
</style>
