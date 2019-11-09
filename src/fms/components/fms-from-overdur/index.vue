<template>
  <div class="infinite-list" style="overflow-y:auto; overflow-x: hidden">
    <kye-form :model="formOne" ref="form" labkye-width="100px" class="demo-dynamic">
      <kye-form-item
        class="infinite-list-item"
        v-for="(domain, index) in formOne['domains']"
        :label="index + 1 + '  '"
        :key="domain.key"
        :prop="'domains.' + index + '.value'"
        :rules="{
      required: true, message: '必填', trigger: 'blur'
    }"
      >
        <div class="fms-overdur-btn">
          <kye-input
            v-model="domain.value"
            :maxlength="maxlength"
            :disabled="domain._edit || domain._other"
            placeholder="请输入类别/请输入原因"
            @blur="domainBlur(domain, index, formOne['domains'])"
          ></kye-input>
          <kye-button
            @click="remove(index, formOne['domains'])"
            :disabled="domain._show || domain._other || domain.readonly === 1"
            v-if="showBtn && !hideButton.includes('delete')"
            type="text"
          >删除</kye-button>
          <kye-button
            @click="domainEdit(index, domain, formOne['domains'])"
            v-if="showBtn && !hideButton.includes('edit')"
            :disabled="!domain._edit || domain._show || domain._other || domain.readonly === 1"
            type="text"
          >编辑</kye-button>
          <kye-button
            v-show="domain._show"
            v-if="showBtn && !hideButton.includes('addplus')"
            @click="domainShow(index,domain,formOne['domains'])"
            type="text"
          >
            <i class="iconfont icon-minus"></i>
          </kye-button>
          <kye-button
            v-show="!domain._show"
            v-if="showBtn && !hideButton.includes('addplus')"
            :disabled="!domain._edit || domain._show"
            @click="domainShow(index,domain,formOne['domains'])"
            type="text"
          >
            <i class="iconfont icon-plus"></i>
          </kye-button>
          <kye-button
            v-if="showBtn && !hideButton.includes('upDown')"
            :disabled="index === 0 || domain._show || domain._other || !domain._edit || domain.readonly === 1"
            @click="domainUp(index, domain, formOne['domains'])"
            type="text"
          >
            <i class="iconfont icon-sort-up-selected"></i>
          </kye-button>
          <kye-button
            v-if="showBtn && !hideButton.includes('upDown')"
            :disabled="index === formOne['domains'].length-1 || domain._show || domain._other || !domain._edit || domain.readonly === 1"
            @click="domainDown(index, domain, formOne['domains'])"
            type="text"
          >
            <i class="iconfont icon-sort-down-selected"></i>
          </kye-button>
        </div>
      </kye-form-item>
      <kye-row type="flex" justify="end" style="padding-right:14px">
        <kye-form-item>
          <kye-button
            v-if="showBtn && showAddBtn && !hideButton.includes('addRowBtn')"
            :disabled="showAddBtnDisabled "
            @click="addDomain(formOne['domains'])"
            type="text"
          >新增</kye-button>
        </kye-form-item>
      </kye-row>
    </kye-form>
  </div>
</template>
<script>
  import { trim, cloneDeep, get } from 'lodash'
  import { to } from '@/fms/utils'

  export default {
    data() {
      return {
        loading: false,
        loadingText: '',
        formOne: {
          domains: []
        },
        // 新增按钮禁用属性
        showAddBtnDisabled: false
      }
    },
    computed: {
      form() {
        return this.$refs.form
      }
    },
    props: {
      rows: {
        type: Array,
        default: () => {
          return []
        }
      },
      hideButton: {
        type: Array,
        default: () => {
          // ['delete', 'edit', 'upDown', 'addplus', 'addRowBtn']
          return []
        }
      },
      showAddBtn: {
        type: Boolean,
        default: true
      },
      showBtn: {
        type: Boolean,
        default: true
      },
      // 删除的回调函数
      removeDelete: {
        type: Function
      },
      // 输入框最大输入长度
      maxlength: {
        type: Number,
        default: 50
      }
    },
    activated() {
      this.formOne['domains'] = this.rows
      console.log('this.$route234', this.$route)
      setTimeout(() => {
        // 获取该类别组件的实例 formFirst
        const formFirst = this.$parent.$refs.formFirst
        // 获取该类别对应原因组件的实例 formSecond
        const formSecond = this.$parent.$refs.formSecond
        const categorySetting = get(
          this.$route,
          'params.from.params.categoryGroupItem.categorySetting'
        )
        console.log('categorySetting', categorySetting)

        if (
          categorySetting &&
          categorySetting.addable_excludes &&
          categorySetting.addable_excludes.includes(1) &&
          formFirst === this
        ) {
          this.showAddBtnDisabled = true
        } else if (
          categorySetting &&
          categorySetting.addable_excludes &&
          categorySetting.addable_excludes.includes(2) &&
          formSecond === this
        ) {
          this.showAddBtnDisabled = true
        }
      }, 200)

      setTimeout(() => {
        const showItem = this.formOne['domains'].find(item => {
          return item._show
        })
        if (showItem) {
          showItem._show = true
          this.$emit('domain-show', showItem)
        }
      }, 200)
    },
    deactivated() {
      this.formOne['domains'] = []
      this.$emit('domain-show', {})
      this.showAddBtnDisabled = false
    },
    watch: {
      rows() {
        this.formOne['domains'] = this.rows
        this.showAddBtnDisabled = false
      }
    },
    methods: {
      async remove(index, arry) {
        if (this.removeDelete) {
          await this.removeDelete(index, arry)
          // 获取该类别组件的实例 formFirst
          const formFirst = this.$parent.$refs.formFirst
          // 数组快清空的时候 并且该实例不是类别组件formFirst
          if (!arry.length && formFirst !== this) {
            setTimeout(() => {
              this.addDomain(arry)
            }, 200)
          }
        } else {
          arry.splice(index, 1)
          if (arry.length === 0) {
            this.addDomain(arry)
          }
        }
        arry.forEach((item, i) => {
          item._other = false
        })
      },
      addDomain(arry) {
        arry.push({
          value: '',
          children: [],
          // 编辑状态
          _edit: false,
          // 加减按钮禁用状态
          _show: false,
          // 加减其他按钮状态
          _other: false,
          key: Date.now()
        })
        // 除了刚刚新增输入框外的其他输入框 编辑 上移 下移 缩放 展开 按钮禁用
        setTimeout(async () => {
          arry.forEach((item, i) => {
            if (i !== arry.length - 1) {
              item._other = true
            }
          })
          // 新增按钮禁用
          this.showAddBtnDisabled = true
          // 效验刚刚新增输入框必填
          const [cancel] = await to(this.$refs.form.validate())
          if (cancel) {
            console.warn(cancel)
          }
        }, 200)
      },
      domainBlur(domain, index, arry) {
        if (!trim(domain.value)) {
          return
        }
        // 输入失去焦点时候,判断输入是否和其他的值重复
        const arryList = [...arry]
        arryList.splice(index, 1)
        if (arryList.some(item => item.value === domain.value)) {
          domain.value = ''
          return this.$message.warning('名称不可重复')
        }
        domain._edit = true
        this.showAddBtnDisabled = false
        // 获取该类别组件的实例 formFirst
        const formFirst = this.$parent.$refs.formFirst
        // 获取该类别对应原因组件的实例 formSecond
        const formSecond = this.$parent.$refs.formSecond
        // 如果该实例是对应类别列表的时候 并且 该输入框对应的类别的原因数组children为空的时候
        if (formFirst && formFirst === this && domain.children.length === 0) {
          // 手动触发该输入框的展开按钮
          this.domainShow(index, domain, arry)
          setTimeout(() => {
            // 手动触发该类别的原因输入新增按钮

            if (formSecond) {
              formSecond.addDomain(formSecond.formOne['domains'])
            }
          }, 200)
        }
        // 如果该组件是对应的 原因列表的时候,其它原因对应的按钮取消禁用
        if (formSecond && formSecond === this) {
          arry.forEach((item, i) => {
            if (i !== arry.length - 1) {
              item._other = false
            }
          })
        }
      },
      // 编辑
      domainEdit(index, domain, arry) {
        domain._edit = false
      },
      async domainShow(index, domain, arry) {
        // 逾期原因菜单的原因展示表单效验
        if (this.$parent.$refs.formSecond) {
          const [cancel] = await to(this.$parent.$refs.formSecond.form.validate())
          if (cancel) {
            console.warn(cancel)
            return
          }
        }
        const [cancel] = await to(this.$refs.form.validate())
        if (cancel) {
          console.warn(cancel)
          return
        }
        // + - 按钮的操作 _show 默认为false
        domain._show = !domain._show
        if (domain._show) {
          // 点击展开的时候
          // 新增按钮禁用
          this.showAddBtnDisabled = true
          domain._edit = true
          domain._other = true
          arry.forEach((item, i) => {
            if (i !== index) {
              item._show = false
              item._other = true
            }
          })
          this.$emit('domain-show', domain)
        } else {
          // 点击收缩的时候
          this.showAddBtnDisabled = false
          arry.forEach((item, i) => {
            item._other = false
          })
          this.$emit('domain-show', {})
        }
      },
      // 向下移动
      domainDown(index, domain, arry) {
        const _arry = cloneDeep(arry)
        const item = _arry[index + 1]
        _arry.splice(index + 1, 1, domain)
        _arry[index] = item
        arry.splice(0, arry.length)
        arry.push(..._arry)
      },
      // 向上移动
      domainUp(index, domain, arry) {
        const _arry = cloneDeep(arry)
        const item = _arry[index - 1]
        _arry.splice(index - 1, 1, domain)
        _arry[index] = item
        arry.splice(0, arry.length)
        arry.push(..._arry)
      }
    }
  }
</script>

<style lang="scss">
  .infinite-list {
    .fms-overdur-btn {
      display: flex;
      justify-content: space-between;
      el-button {
        margin-left: 0px;
        margin-right: 0px;
      }
      .el-button--text.el-button--text {
        margin-left: 0px;
        margin-right: 0px;
      }
    }
  }
</style>
