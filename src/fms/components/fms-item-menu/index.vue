<template>
  <div>
    <el-dropdown @command="command" v-if="items.length > 0">
      <div class="fms-form-items-label" style="cursor: pointer">
        <!-- type === 0 总是显示更多 默认 -->
        <template v-if="type === '0'">
          <span class="fms-form-items-label">{{ currentItem.label }}</span>
          <i class="iconfont icon-caretdown"></i>
          <!-- <span>/ 更多</span> -->
        </template>
        <!-- formLabelPosition === 'right' -->
        <template v-else-if="'1'">
          <span class="fms-form-items-label">{{ currentItem.label }}</span>
          <i class="iconfont icon-caretdown"></i>
        </template>
        <!-- type !== 0 只有超过两个选项时 显示更多 -->
        <template v-else>
          <template v-if="items.length === 2">
            <span
              :class="{'fms-form-items-label': currentItem.key === items[0].key }"
            >{{items[0].label}}</span>
            <span>/</span>
            <span
              :class="{'fms-form-items-label': currentItem.key === items[1].key }"
            >{{items[1].label}}</span>
          </template>
          <template v-if="items.length > 2">
            <span class="fms-form-items-label">{{ currentItem.label }}</span>
            <!-- <span>/ 更多</span> -->
          </template>
          <i class="iconfont icon-caretdown"></i>
        </template>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(it, i) in items"
          :key="it.label + i"
          :command="it.key"
        >{{it.label}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- TODO: & FIXME:
      目前日期组件使用动态组件渲染,在更新组件类型时,比如type: daterange 改为 type: 'month'时,
      其下拉选择面板会错位到屏幕左上角!
    -->
    <!-- <fms-components :col="currentItem" :model="model" @input="input"></fms-components> -->
    <template v-for="(col, i) in itemsComputed">
      <fms-components
        :key="col.key + i"
        :col="col"
        :model="model"
        @input="input"
        style="display:inline-block"
      />
    </template>
  </div>
</template>

<script>
  import FmsComponents from '../fms-components'
  export default {
    name: 'fms-form-items',
    components: { FmsComponents },
    props: {
      col: {
        type: Object,
        default: () => ({})
      },
      items: {
        type: Array,
        default: () => []
      },
      value: {
        type: Object,
        default: () => ({ key: '', value: '' })
      },
      prop: String,
      rules: {
        type: Array,
        default: () => []
      },
      type: {
        type: String,
        default: '0'
      }
    },
    computed: {
      itemsComputed() {
        return this.items.filter(col => this.currentItem.key === col.key)
      }
    },
    data() {
      return {
        model: {},
        currentItem: {}
      }
    },
    watch: {
      items() {
        this.init()
      },
      value() {
        if (this.value.key) {
          this.model[this.value.key] = this.value.value
        }
      },
      'value.value'() {
        this.model[this.value.key] = this.value.value
      }
    },
    methods: {
      input(value) {
        value = value || ''
        const { key } = this.currentItem
        const res = { key, value, [key]: value }
        this.$emit('input', res)
        this.$emit('change', res)
      },
      command(key) {
        this.currentItem = this.items.find(it => it.key === key)
        const value = this.currentItem.defaultValue || ''
        this.model[key] = value
        // setTimeout(() => { this.model[key] = value }, 0)
        const res = { key, value, [key]: value }
        this.$emit('input', res)
        this.$emit('change', res)
      },
      init() {
        if (this.value.key) {
          this.currentItem = this.items.find(it => it.key === this.value.key)
        } else {
          this.currentItem = this.items[0] || {}
          this.value.key = this.currentItem.key
          this.value.value = this.currentItem.defaultValue
        }
        this.model = this.items.reduce((obj, it) => {
          obj[it.key] = it.defaultValue || ''
          return obj
        }, {})
      }
    },
    created() {
      this.init()
    }
  }
</script>

<style lang="scss">
  .fms-form-items-label {
    color: #9571e9;
  }
</style>
