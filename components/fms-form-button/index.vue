<template>
  <div class="fms-search-btn">
    <kye-button v-if="type === 'search'" type="primary" :auth="auth" @click="$emit('search')">
      <i class="iconfont icon-search"></i>
      {{searchText}}
    </kye-button>
    <kye-button v-else-if="type === 'exe'" :auth="auth" type="primary" @click="$emit('search')">
      <i class="iconfont icon-zhihang"></i>
      执行
    </kye-button>
    <!-- <kye-button v-if="reset" type="text" :auth="auth" @click="$emit('reset')">
      <i class="iconfont icon-reset"></i> 重置
    </kye-button>-->

    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      auth: String,
      type: { type: String, default: 'search' },
      reset: { type: Boolean, default: true },
      searchText: { type: String, default: '查询' }
    }
  }
</script>

<style lang="scss">
  .fms-search-btn {
    display: inline-flex;
  }
</style>
