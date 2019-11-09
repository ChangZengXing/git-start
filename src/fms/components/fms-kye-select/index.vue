<script>
  import { tabNext } from 'public/directives/next'

  export default {
    name: 'kye-select',
    data() {
      return {
        inputEl: null
      }
    },
    mounted() {
      this.resetEnter()
      this.setDelete()
      this.resetNavigateOptions()
    },
    beforeDestroy() {
      this.inputEl && this.inputEl.removeEventListener('keydown', this.keyDown)
    },
    render(h) {
      const data = this.$vnode.data
      const on = { ...data.on, ...this.$listeners }
      data.on = on

      let props = Object.assign(data.props || {}, this.$attrs)
      let value = props.value
      if (value === undefined || value === null) {
        value = this.$attrs.value || ''
      }

      if (typeof value === 'number') {
        value = String(value)
        props.value = value
        if (data.model) {
          data.model.value = value
        }
      }

      if (!props.hasOwnProperty('filterable')) {
        props.defaultFirstOption = true
        props.clearable = props.clearable === undefined ? true : props.clearable
        props.filterable = true
        // props.filterMethod = e => this.filterByIndex(e, !data.model && on.input)
        // if (!props.options) {
        //   let arr = this.$vnode.componentOptions.children
        //   if (arr) {
        //     props.options = arr.reduce((s, v) => {
        //       if (v.componentOptions && v.componentOptions.propsData) {
        //         s.push(v.componentOptions.propsData.value)
        //       }
        //       return s
        //     }, [])
        //   }
        // }
      }

      if (this.$attrs.remote && data.attrs) {
        data.attrs.name = 'remote'
      }
      data.props = props

      return h('el-select', data, this.$slots.default)
    },
    methods: {
      resetEnter() {
        let c = this.$children[0]
        if (c) {
          c.selectOption = e => {
            if (!c.visible) {
              c.toggleMenu()
            } else {
              // 当前激活的选项
              if (c.options[c.hoverIndex]) {
                c.handleOptionSelect(c.options[c.hoverIndex])
                // 历史选择过的选项
              } else if (c.hoverOption !== -1) {
                let index = c.options.findIndex(t => c.hoverOption.currentValue === t.currentValue)
                if (index > -1) {
                  c.handleOptionSelect(c.options[index])
                }
              }
              // 没有匹配的选项时，回车清空绑定的值
              if (c.emptyText !== null) {
                c.$emit('input', null)
              }
              // 回车键next
              tabNext(e.target)
              c.visible = false
            }
          }
        }
      },
      resetNavigateOptions() {
        let c = this.$children[0]
        if (c) {
          let n = c.navigateOptions
          c.navigateOptions = e => {
            if (c.hoverIndex === -1 && c.hoverOption !== -1) {
              c.hoverIndex = c.options.findIndex(t => c.hoverOption.currentValue === t.currentValue)
            }
            n(e)
          }
        }
      },
      setDelete() {
        this.inputEl = this.$el.querySelector('input')
        this.inputEl && this.inputEl.addEventListener('keydown', this.keyDown)
      },
      keyDown(e) {
        if (e.keyCode === 8 || e.keyCode === 46) {
          let c = this.$children[0]
          if (c) {
            if (c.multiple && c.query) {
              return
            }
            let v = this.$attrs.value
            let arr = Array.isArray(v) && v.length > 1 ? v.slice(0, -1) : []
            c.$emit('input', this.$attrs.multiple ? arr : null)
            c.$emit('change', this.$attrs.multiple ? arr : null)
            c.$emit('clear')
          }
        }
      },
      focus() {
        this.$children[0] && this.$children[0].focus()
      },
      // 输入子项序号自动匹配选择
      filterByIndex(val, input) {
        const index = +val - 1
        const context = this.$vnode
        const { options } = context.data.props
        if (options && !isNaN(index) && options[index]) {
          let multiple = context.data.props.multiple
          let value = multiple === undefined || multiple === false ? options[index] : [options[index]]
          context.data.props.value = value
          if (context.data.model) {
            context.data.model.value = value
            context.data.model.callback(value)
          } else if (input) {
            input(value)
          }
        }
      }
    }
  }
</script>
