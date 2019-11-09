<template>
  <dl class="fms-remark-block">
    <dt class="kye-block-title" v-if="title">{{title}}</dt>
    <dd style="padding: 0 12px">
      <slot></slot>
    </dd>
  </dl>
</template>

<script>
  export default {
    props: {
      title: { type: String, default: '备注' }
    }
  }
</script>

<style lang="scss">
  .fms-remark-block {
    margin-bottom: 16px;
    li {
      line-height: 20px;
      height: 20px;
      color: #2a2a2a;
    }
  }
</style>
