<template>
  <section class="fms-dialogs">
    <component :is="value" :ref="value"></component>
  </section>
</template>

<script>
  export default {
    props: {
      value: String
    },
    mounted () {
      this.$emit('mounted', this.$refs[this.dialog])
    }
  }
</script>
