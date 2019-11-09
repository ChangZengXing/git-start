<template>
  <el-select
    class="fms-select-remote"
    :value="value"
    :remote="true"
    :remote-method="remoteMethod"
    :loading="loading"
    :multiple="multiple"
    :filterable="true"
    :valueKey="valueKey"
    :collapse-tags="collapseTags"
    @input="onInput"
    @change="onChange"
    @remove-tag="onTagRemove"
    @clear="onClear"
    @blur="onBlur"
    @focus="onFocus"
    v-bind="$attrs"
  >
    <el-option v-for="item in items" :key="item.label" :label="item.label" :value="item.value"></el-option>
  </el-select>
</template>

<script>
  import { get } from 'lodash'
  export default {
    props: {
      value: { type: Array, default: () => [] },
      keys: { type: Array, default: () => [] },
      options: { type: Array, default: () => [] },
      valueKey: { type: String },
      labelKey: { type: String, default: 'label' },
      labelKeys: { type: Array, default: () => ['label'] },
      multiple: { type: Boolean, default: true },
      collapseTags: { type: Boolean, default: false },
      url: { type: String, required: true },
      inputLength: { type: Number, default: 2 },
      formatData: { type: Function, required: true },
      formatResult: { type: Function }
    },
    computed: {
      listeners() {
        console.log('this.$listeners', this.$listeners)
        // const { input } = this.$listeners
        return {
          ...this.$listeners
        }
      },
      itemsComputed() {
        console.log('itemsComputed', this.value)
        return this.formatRes(this.value)
      }
    },
    watch: {
      value(val) {
        console.log('watch value', val)
        this.items = this.formatRes(val)
      }
    },
    data() {
      return {
        loading: false,
        items: this.formatRes(this.value),
        currentValue: this.value || [],
        remoteMethod: async val => {
          console.log('remoteMethod', val, this.value)
          if (val) val = val.trim()
          if (!val || val.length < this.inputLength) {
            this.items = []
            return
          }
          try {
            this.loading = true
            const url = this.url
            const params = this.formatData(val)
            let res = await this.$http(url, params)
            this.items = this.formatRes(res)
          } catch (err) {
            console.error(err)
            this.items = []
          } finally {
            this.loading = false
          }
        }
      }
    },
    methods: {
      formatRes(res) {
        if (!res) {
          this.items = []
          return this.items
        }
        if (!Array.isArray(res)) {
          res = [res]
        }
        if (this.formatResult) {
          res = this.formatResult(res)
        } else {
          const keys = this.keys.length > 0 ? this.keys : this.labelKeys
          res = res.map(it => ({
            label: keys
              .reduce((a, k) => {
                a.push(get(res, k))
                return a
              }, [])
              .join(','),
            value: it
          }))
        }
        return res
      },
      onChange(val) {
        console.log('onChange', val)
        this.$emit('change', val)
      },
      onInput(val) {
        console.log('onInput', val)
        this.$emit('input', val)
      },
      onTagRemove(tag) {
        console.log('onTagRemove', tag)
        this.$emit('remove-tag', tag)
        this.$emit('tag-remove', tag)
      },
      onClear() {
        console.log('onClear')
        this.$emit('clear')
      },
      onBlur() {
        console.log('onBlur')
        this.$emit('blur')
      },
      onFocus() {
        console.log('onFocus')
        this.$emit('focus')
      }
    }
  }
</script>

<style lang="scss">
  .fms-select-remote.el-select {
    .el-select__tags > .el-select__input {
      margin-left: 10px !important;
    }
    .el-select__tags > span + .el-select__input {
      width: 50px !important;
    }
    .el-input .el-input__inner {
      max-height: inherit;
    }
  }
</style>
