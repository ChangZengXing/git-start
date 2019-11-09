
<template>
  <!-- list-新增报价 -->
  <div v-loading="loading">
    <table-list :data="data"
                ref="reportTables"
                :column="column"
                :scrollY="true"
                :pageable="false"
                :stripe="false"
                :page="{pageSize:pageSize, currentPage: currentPage}"
                :operation="operation"
                :dialog="dialog"
                :fixed-header="true"
                @sort-change="sortChange"
                :options="options" />
    <template>
      <slot name="append"></slot>
    </template>
  </div>

</template>

<script>
  import mixins from 'public/mixins'
  export default {
    mixins: [mixins],
    name: 'crmTableList',
    props: {
      data: Array,
      column: Array,
      // 是否计算弹窗高度，默认为false
      dialog: {
        type: Boolean,
        default () {
          return false
        }
      },
      operation: {
        type: Object,
        default () {
          return {}
        }
      },
      type: {
        type: String,
        default: 'index'
      },
      moduleCode: {
        type: String,
        default () {
          return ''
        }
      },
      detailAuth: {
        type: [Boolean, String],
        default () {
          return false
        }
      },
      currentPage: {
        type: [String, Number],
        default () {
          return 1
        }
      },
      pageSize: {
        type: [String, Number, Array],
        default () {
          return this.$pagination.pageSizes
        }
      }
    },
    data () {
      return {
        loading: false,
        options: {
          detailAuth: this.detailAuth,
          dialog: true,
          type: this.type, // 复选框列
          stripe: false,
          moduleCode: this.moduleCode,
          rowClick: (row) => {
            this.$emit('rowClick', row)
          },
          rowDblClick: (row) => {
            this.$emit('rowDblClick', row)
          },
          selectionChange: (arr) => {
            if (this.type === 'selection') {
              this.$emit('selectionChange', arr)
            }
          },
        }
      }
    },
    methods: {
      sortChange (obj) {
        let tableData = this.data
        let numberType = obj.column.sortType
        let order = obj.order
        tableData = tableData.sort((a, b) => {
          let one = a[obj.prop] || ''
          let two = b[obj.prop] || ''
          // ascending:升序，descending:降序
          if (order === 'ascending') {
            if (numberType === 'number') {
              // console.log('ascending-number', Number(one) - Number(two))
              return Number(one) - Number(two)
            }
            // console.log('ascending-other', one.localeCompare(two, 'zh'))
            return one.localeCompare(two, 'zh')
          } else {
            if (numberType === 'number') {
              // console.log('othrer-number', Number(two) - Number(one))
              return Number(two) - Number(one)
            }
            // console.log('other-other', one.localeCompare(two, 'zh'))
            return two.localeCompare(one, 'zh')
          }
        })
        this.tableData = tableData
      }
    }
  }
</script>
