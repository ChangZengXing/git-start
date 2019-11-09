<template>
  <kye-pagination
    class="fms-pagination"
    :class="getClass"
    :total="page.total"
    :layout="page.layout || $pagination.layout2"
    :page-size="page.pageSize || $pagination.pageSize"
    :page-sizes="page.pageSizes || $pagination.pageSizes"
    :current-page="page.currentPage"
    :background="true"
    @size-change="val => change('pageSize', val)"
    @current-change="val => change('currentPage', val)"
  >
    <kye-button class="jumper-button" type="primary" plain>确定</kye-button>
  </kye-pagination>
</template>
<script>
  export default {
    props: {
      fixed: Boolean,
      page: {
        type: Object,
        default: () => ({})
      }
    },
    computed: {
      getClass() {
        return { 'fms-pagination-fixed': this.fixed }
      }
    },
    methods: {
      change(type, val) {
        // 翻页时是否缓存, 改变每页的数量时,不缓存
        const cache = type === 'currentPage'
        this.$emit('change', type, val, cache)
      }
    }
  }
</script>

<style lang="scss">
  .fms-pagination {
    .jumper-button {
      margin-left: 8px;
      margin-right: 8px;
      padding-left: 7px;
      padding-right: 7px;
      span {
        height: 14px;
        line-height: 14px;
      }
    }
  }
  .fms-pagination-fixed {
    position: fixed;
    left: 176px;
    right: 16px;
    bottom: 8px;
    z-index: 10;
    background-color: #ffffff;
    padding-top: 12px;
  }
</style>
