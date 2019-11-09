<template>
  <div class="kye-block-title fms-block-title" v-if="label">
    <label>{{label}}</label>
  </div>
</template>
<script>
  export default {
    name: 'FmsFormTitle',
    /**
     * 属性列表
     * @property {String|Number|Boolen} label - label信息
     */
    props: {
      label: {
        type: [String, Number, Boolean]
      }
    }
  }
</script>

<style lang="scss" scoped>
  .fms-block-title {
    font-weight: 500;
  }
</style>
