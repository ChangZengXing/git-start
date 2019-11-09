<template>
  <kye-cascader
    class="fms-select-quarter"
    v-on="listeners"
    v-bind="attrs"
    :options="options"
    :expand-trigger="'hover'"
  />
</template>

<script>
  export default {
    props: {
      years: { type: Number, default: 5 }
    },
    computed: {
      attrs () {
        return { ...this.$attrs, ...this.$props }
      },
      listeners () {
        return { ...this.$listeners }
      }
    },
    data () {
      const date = new Date()
      const curYear = date.getFullYear()
      const curMonth = date.getMonth() + 1
      const options = []
      for (let i = curYear; i > curYear - this.years; i--) {
        const quarter = (_ => {
          if (curMonth <= 3) return 1
          if (curMonth <= 6) return 2
          if (curMonth <= 9) return 3
          if (curMonth <= 12) return 4
        })()
        if (i === curYear) {
          options.push({
            value: i,
            label: `${i}年`,
            children: Array.from({ length: quarter }, (v, k) => ({ value: k + 1, label: `${k + 1}季度` }))
          })
        }
        if (i < curYear) {
          options.push({
            value: i,
            label: `${i}年`,
            children: [
              { value: 1, label: '1季度' },
              { value: 2, label: '2季度' },
              { value: 3, label: '3季度' },
              { value: 4, label: '4季度' }
            ]
          })
        }
      }
      return {
        options: options
      }
    }
  }
</script>

<style>
  .fms-select-quarter {
    width: 100%;
  }
</style>
