<template>
  <div class="fms-search-tags el-input__inner" :class="getClass">
    <el-tag
      v-for="(tag, i) in tags"
      size="small"
      :key="getIdKey(tag, i)"
      @close="onClose(tag, i)"
      @click.native="onClick(tag, i)"
      :class="getTagClass(tag)"
      :title="getTagName(tag, i)"
      :closable="!disabled && closable"
      :disable-transitions="!tagTransitions"
    >{{getTagName(tag, i)}}</el-tag>
    <!--
      fms-kye-search-tips 组件中有setTimeout, 当使用v-if时,会导致在setTimeout中
      实例$refs读取会报错, 故这里使用v-show
    -->
    <fms-kye-search-tips
      ref="search"
      class="fms-search-tags_input-inner"
      v-bind="$attrs"
      v-show="showSearch"
      v-model="searchText"
      @clear="onSearchClear"
      @select="onSearchSelect"
    ></fms-kye-search-tips>
    <!--
      data-next="ignore" 取消按住回车键进入下一个input输入框,
      这是全局的directive设置 public/directives/next.js
    -->
    <el-input
      ref="input"
      v-show="showInput"
      v-bind="$attrs"
      v-model="searchText"
      class="fms-search-tags_input-inner"
      data-next="ignore"
      @keyup.enter.native="handleInputConfirm"
    ></el-input>
    <kye-button v-show="showAdd" type="primary" icon="iconfont icon-plus" @click="onAdd"></kye-button>
  </div>
</template>

<script>
  import { set, get, trim, isEqual } from 'lodash'
  import FmsKyeSearchTips from '../fms-kye-search-tips'
  import { decrypt, getModalPageName } from 'public/utils/common'
  import {
    uuid,
    getMaskField,
    getModuleCode,
    isAsteriskField,
    isSensitiveField,
    getVirtualNumber
  } from '@/fms/utils'
  export default {
    props: {
      value: { type: [Array, String], default: () => [] },
      valueType: { type: String },
      closable: { type: Boolean, default: true },
      disabled: { type: Boolean, default: false },
      idKey: { type: String, default: 'id' },
      labelKey: { type: String, default: 'label' },
      tagAdd: { type: Function },
      tagFormatter: { type: Function },
      tagTransitions: { type: Boolean, default: false },
      // 配置特殊字段(监控字段,敏改字段)
      tagSpecifiedFileds: { type: Array, default: () => [] },
      // add, input, search, addInput, addSearch
      tagActionType: { type: String, default: 'add' },
      repeatedMsg: { type: String, default: '选项已存在!' },
      reserveSearchText: { type: Boolean, default: false }
    },
    components: { FmsKyeSearchTips },
    data() {
      return {
        tags: [],
        showType: 1,
        searchText: ''
      }
    },
    watch: {
      value(val) {
        console.log('fms-search-tags:watch', val)
        this.setValue()
      }
    },
    computed: {
      showSearch() {
        if (this.tagActionType === 'search') {
          return true
        }
        if (this.tagActionType === 'addSearch' && this.showType === 5) {
          return true
        }
        return false
      },
      showInput() {
        if (this.tagActionType === 'input') {
          return true
        }
        if (this.tagActionType === 'addInput' && this.showType === 4) {
          return true
        }
        return false
      },
      showAdd() {
        if (this.tagActionType === 'add') {
          return true
        }
        if (this.tagActionType === 'addSearch' && this.showType === -5) {
          return true
        }
        if (this.tagActionType === 'addInput' && this.showType === -4) {
          return true
        }
        return false
      },
      getClass() {
        return {
          'fms-search-tags_add': this.showAdd,
          'fms-search-tags_input': this.showInput,
          'fms-search-tags_search': this.showSearch,
          'fms-search-tags_disabled': this.disabled
        }
      },
      moduleCodeComputed() {
        return getModuleCode(this) || this.moduleCode
      }
    },
    methods: {
      setValue() {
        const val = this.value
        if (typeof val === 'string' && val) {
          try {
            this.tags = JSON.parse(val)
          } catch (e) {
            console.error(e)
            this.tags = []
          }
        } else {
          this.tags = val || []
        }
        if (this.tagActionType === 'addSearch') {
          this.showType = -5
        } else if (this.tagActionType === 'addInput') {
          this.showType = -4
        } else {
          this.showType = 1
        }
      },
      getIdKey(tag, i) {
        if (typeof tag === 'string') return tag
        return tag[this.idKey] || tag[this.labelKey] || i
      },
      getTagName(tag, i) {
        if (this.tagSpecifiedFileds.length > 0) {
          const [tagSpecifiedFiled] = this.tagSpecifiedFileds
          const { key: fieldName } = tagSpecifiedFiled
          // 敏改字段显示为6个*
          if (isSensitiveField(tag, fieldName)) {
            return tag[fieldName] || window.__ERPGLOABLECONFIG__.maskSec || '✽✽✽'
          }
        }
        if (this.tagFormatter) {
          return this.tagFormatter(tag, i)
        }
        if (typeof tag === 'string') {
          return tag
        }
        return get(tag, this.labelKey)
      },
      getTagClass(tag) {
        if (this.tagSpecifiedFileds.length > 0) {
          const [tagSpecifiedFiled] = this.tagSpecifiedFileds
          const { key: fieldName } = tagSpecifiedFiled
          // 监控字段
          if (isAsteriskField(tag, fieldName)) {
            return 'fms-search-tags_asterisk'
          }
          // 敏改字段
          if (isSensitiveField(tag, fieldName)) {
            return 'fms-search-tags_sensitive'
          }
        }
        return ''
      },
      onClose(tag) {
        const tags = this.tags.filter(t => t !== tag)
        if (this.valueType === 'jsonString') {
          this.$emit('input', JSON.stringify(tags))
        } else {
          this.$emit('input', tags)
        }
        this.$emit('change', tags, tag, this.tagActionType)
        this.$nextTick(_ => {
          this.$refs.input && this.$refs.input.$refs.input.focus()
          this.$refs.search && this.$refs.search.$refs.searchTips.focus()
        })
      },
      onClick(tag) {
        console.log('onClick tag', tag)
        if (this.tagSpecifiedFileds.length > 0) {
          const [tagSpecifiedFiled] = this.tagSpecifiedFileds
          const { key: fieldName, label: fieldNameStr, dataId, moduleCode } = tagSpecifiedFiled
          let type = ''
          let fieldContent = ''
          // 监控字段
          const maskField = getMaskField(tag, fieldName)
          // 虚拟号码
          const virtualField = getVirtualNumber(tag, fieldName)
          if (maskField.is) {
            type = 'mask'
            fieldContent = maskField.maskValue
          } else if (virtualField.is) {
            type = 'virtual'
            fieldContent = virtualField.maskValue
          }
          return decrypt(
            {
              fieldName,
              fieldNameStr,
              fieldContent,
              dataId: dataId || tag.id || uuid(13, true),
              moduleCode: moduleCode || this.moduleCodeComputed,
              buttonName: getModalPageName(this)
            },
            type
          )
            .then(val => {
              // 取消返回null
              if (val === null) return
              set(tag, fieldName, val)
              // 已经解密
              set(tag, fieldName + type.replace(/^./, type[0].toUpperCase()), undefined)
            })
            .catch(e => console.warn(e))
        }
      },
      onSearchSelect(tag) {
        console.log('onSearchSelect', tag)
        this.$nextTick(_ => {
          this.$refs.input && this.$refs.input.$refs.input.focus()
          this.$refs.search && this.$refs.search.$refs.searchTips.focus()
        })
        // 去重
        const isRepeated = this.repeatedMsg && this.tags.some(t => isEqual(t, tag))
        if (isRepeated) {
          return this.$message.warning(this.repeatedMsg)
        }
        if (tag) {
          this.tags.push(tag)
          if (this.valueType === 'jsonString') {
            this.$emit('input', JSON.stringify(this.tags))
          } else {
            this.$emit('input', this.tags)
          }
          this.$emit('change', this.tags, tag, this.tagActionType)
          if (this.tagActionType === 'addSearch') {
            this.showType = -5
            this.searchText = ''
          }
          if (this.reserveSearchText === false) {
            this.$nextTick(_ => (this.searchText = ''))
          }
        }
      },
      onSearchClear() {
        console.log('onSearchClear')
        this.$nextTick(_ => {
          this.searchText = ''
          this.$refs.input && this.$refs.input.$refs.input.focus()
          this.$refs.search && this.$refs.search.$refs.searchTips.focus()
        })
      },
      onAdd() {
        console.log('onAdd')
        if (this.tagActionType === 'addSearch') {
          this.showType = 5
        } else if (this.tagActionType === 'addInput') {
          this.showType = 4
        } else {
          this.showType = 1
        }
        if (this.tagActionType === 'add') {
          this.tagAdd && this.tagAdd(this.tags)
          this.$emit('add', this.tags)
        }
        if (this.tagActionType !== 'add') {
          this.$nextTick(_ => {
            this.searchText = ''
            this.$refs.input && this.$refs.input.$refs.input.focus()
            this.$refs.search && this.$refs.search.$refs.searchTips.focus()
          })
        }
      },
      handleInputConfirm() {
        const tag = trim(this.searchText)

        console.log('handleInputConfirm', tag)

        if (!tag) {
          this.searchText = ''
          return
        }

        // 去重
        const isRepeated = this.repeatedMsg && this.tags.some(t => isEqual(t, tag))

        if (isRepeated) {
          return this.$message.warning(this.repeatedMsg)
        }

        this.showType = -4
        this.searchText = ''
        this.tags.push(tag)
        if (this.valueType === 'jsonString') {
          this.$emit('input', JSON.stringify(this.tags))
        } else {
          this.$emit('input', this.tags)
        }
        this.$emit('change', this.tags, tag, this.tagActionType)
      }
    },
    created() {
      this.setValue()
    }
  }
</script>

<style lang="scss">
  .fms-search-tags.el-input__inner {
    display: flex;
    flex-wrap: wrap;
    height: auto;
    line-height: 28px;
    min-height: 28px;
    padding: 0 1px;
    line-height: 10px;
    .el-tag.el-tag--small {
      cursor: default;
      margin-top: 1px;
      margin-right: 1px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 20px;
      position: relative;
      .el-icon-close {
        position: absolute;
        right: 2px;
        top: 4px;
      }
    }
    .fms-search-tags_input-inner {
      flex: 1;
      min-width: 60px;
      .el-input__inner {
        padding: 0 8px;
        height: 26px;
        border-width: 0;
        line-height: 26px;
      }
    }

    &.fms-search-tags_add {
      .el-button {
        height: 24px;
        padding: 0 8px;
        min-width: 32px;
        line-height: 22px;
        display: inline-block;
        margin-top: 1px;
        margin-bottom: 1px;
        vertical-align: bottom;
      }
    }
    &.fms-search-tags_disabled.el-input__inner {
      background-color: #ebebed;
      border-color: #d2d2d6;
      .el-button {
        display: none;
      }
      .el-tag.el-tag--small {
        padding-right: 8px;
        &.fms-search-tags_asterisk {
          cursor: pointer;
        }
      }
    }
  }

  .fms-form-detail,
  .fms-form-page-detail {
    .fms-search-tags.el-input__inner {
      &.fms-search-tags_disabled.el-input__inner {
        color: #000;
        cursor: default;
        background-color: #fff;
      }
    }
  }
</style>
