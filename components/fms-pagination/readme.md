#### 简化翻页组件

```
<fms-pagination :page="page" @change="pageChange"></fms-pagination>

<script>
  export default {
    methods: {
      pageChange (type, val) {
        this.page[type] = val
        this.loadData()
      }
    }
  }
</script>
```
