<template>
  <el-autocomplete
    :value="value"
    ref="searchTips"
    v-bind="$attrs"
    :fetch-suggestions="handleChange"
    popper-class="kye-popper-auto"
    :placeholder="placeholder"
    :trigger-on-focus="false"
    style="width:100%"
    class="fms-kye-search-tips"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @select="handleSelect"
    @change="handleInputChange"
  >
    <!-- <i slot="prefix"
    class="el-input__icon el-icon-search"></i>-->
    <i
      slot="suffix"
      v-if="showClear"
      class="el-input__icon el-icon-circle-close search-tips-clear"
      @click="clear"
    ></i>
    <template slot-scope="props">
      <span v-for="(k, i) in getKeys" :key="k">
        {{props.item[k]}}
        <span v-if="i < getKeys.length -1">，</span>
      </span>
    </template>
  </el-autocomplete>
</template>

<script>
  const emptyArr = []
  const emptyFn = () => {}
  export default {
    name: 'fms-kye-search-tips',
    props: {
      value: {
        type: String
      },
      url: {
        type: String
      },
      inputLength: {
        type: Number,
        default: 2
      },
      keys: {
        type: Array
      },
      valueKey: {
        type: String
      },
      formatData: {
        type: Function,
        default: emptyFn
      },
      placeholder: {
        type: String
      },
      warning: {
        type: Boolean,
        default: true
      },
      clearable: {
        type: Boolean,
        default: false
      },
      formatResult: {
        type: Function
      },
      message: {
        type: String,
        default: '搜索结果为空！'
      },
      messageDuration: {
        type: Number,
        default: 1000
      },
      strictMode: {
        type: Boolean,
        default: true
      },
      appkey: { type: String }
    },
    data() {
      return {
        currentValue: ''
      }
    },
    computed: {
      placeholderText() {
        return `字数不少于${this.inputLength}`
      },
      val() {
        return this.value || this.currentValue
      },
      showClear() {
        return this.value && this.clearable && !this.$attrs.disabled
      },
      getKeys() {
        return this.keys || emptyArr
      }
    },
    methods: {
      handleInput(val) {
        if (val) {
          val = val.trim()
        }
        this.currentValue = val
        if (val === '') {
          this.$emit('clear')
          this.$refs.searchTips.suggestions = []
        }
        this.$parent.clearValidate && this.$parent.clearValidate()
      },
      focus() {
        this.$refs.searchTips.focus()
      },
      handleChange(val, cb) {
        if (val) {
          val = val.trim()
        }
        if (!val || val.length < this.inputLength) {
          this.$refs.searchTips.loading = false
          return
        }
        this.fetchData(val, cb)
      },
      async fetchData(val, cb) {
        try {
          let url =
            this.url === 'data.department.listByNames' ? 'hr.department.getByFuzzyValue' : this.url
          let params =
            this.url === 'data.department.listByNames'
              ? { fuzzyValue: this.formatData(val).departmentNames[0] }
              : this.formatData(val)
          let res = await this.$http(url, params, this.appkey ? { appkey: this.appkey } : undefined)
          if (this.formatResult) {
            res = this.formatResult(res)
          }
          let data = res.rows || res
          if (data.length) {
            cb(data)
            // 自动选择第一行
            this.$nextTick(_ => {
              data.length && this.$refs.searchTips.highlight && this.$refs.searchTips.highlight(0)
            })
          } else {
            this.$emit('input', this.currentValue)
            setTimeout(_ => {
              this.$refs.searchTips.suggestions = []
              this.$emit('select', null)
            })
            setTimeout(_ => {
              this.$refs.searchTips.loading = false
              if (this.message !== '') {
                this.$message.warning({
                  duration: this.messageDuration || 1000,
                  message: this.message
                })
              }
            }, 500)
          }
        } catch (err) {
          setTimeout(_ => {
            this.$refs.searchTips.loading = false
          }, 500)
        }
      },
      handleSelect(val) {
        this.$emit('input', val[this.valueKey])
        this.$emit('select', val)
      },
      handleBlur(e) {
        console.log('fms-kye-search-tips blur', this.isClear)
        if (this.warning) {
          if (this.currentValue && this.currentValue.length < this.inputLength) {
            this.$message.warning(this.placeholderText)
          }
        }
        this.$refs.searchTips.loading = false
        setTimeout(_ => {
          this.$parent.clearValidate && this.$parent.clearValidate()
          this.$emit('blur')
        })
        setTimeout(_ => {
          console.log('fms-kye-search-tips blur setTimeout', {
            value: this.value,
            currentValue: this.currentValue
          })
          if (this.value !== this.currentValue) {
            if (this.strictMode) {
              this.$refs.searchTips.$refs.input.currentValue = this.value
            } else if (this.currentValue && this.currentValue.length > 1) {
              this.$emit('select', null)
              setTimeout(() => {
                this.$emit('input', this.currentValue)
                this.$refs.searchTips.$refs.input.currentValue = this.currentValue
                this.$parent.onFieldBlur && this.$parent.onFieldBlur()
              }, 0)
            }
            this.$refs.searchTips.suggestions = []
          }
          this.isClear = false
          this.$parent.onFieldBlur && this.$parent.onFieldBlur()
        }, 300)
      },
      handleInputChange(e) {
        console.log('fms-kye-search-tips', e)
      },
      clear() {
        this.$emit('clear')
        this.$refs.searchTips.suggestions = []
        if (!this.strictMode) {
          this.currentValue = ''
          this.$refs.searchTips.$refs.input.currentValue = ''
        }
        console.log('fms-kye-search-tips clear')
        setTimeout(_ => {
          this.$parent.onFieldBlur && this.$parent.onFieldBlur()
        }, 300)
      },
      handleFocus() {
        this.$emit('focus')
      }
    }
  }
</script>

<style lang="scss">
  .kye-popper-auto {
    width: auto !important;
  }
  .search-tips-clear {
    cursor: pointer;
  }
</style>
