<template>
  <div class="fms-cost-org-tree" v-loading="loading" :style="{ height }">
    <div class="fms-cost-org-tree-input">
      <!-- <kye-input placeholder="输入关键字进行过滤" v-model="filterText" @input="filterFn"></kye-input> -->
      <el-autocomplete
        placeholder="请至少输入2个字符"
        value-key="nameRoute"
        clearable
        :value="filterText"
        :debounce="500"
        :trigger-on-focus="false"
        :fetch-suggestions="querySearch"
        @select="handleSelect"
      ></el-autocomplete>
    </div>
    <div class="fms-cost-org-tree-scroller" :style="{ width }" ref="treeScroller">
      <hr-tree
        ref="tree"
        node-key="idRoute"
        accordion
        :data="treeList"
        :props="defaultProps"
        :default-expanded-keys="defaultExpandKeys"
        :filter-node-method="filterNode"
        :highlight-current="true"
        @node-click="onNodeClick"
      >
        <span
          class="el-tree-node__label"
          slot-scope="{ node, data }"
          :title="data.description"
        >{{ node.label }}</span>
      </hr-tree>
    </div>
  </div>
</template>

<script>
  import { trim, debounce } from 'lodash'
  import comMixins from '@/fms/mixins/common'
  import HrTree from '@/shared/components/kye-select-org/src/tree.vue'
  export default {
    mixins: comMixins,
    components: {
      HrTree
    },
    props: {
      width: { type: String, default: '270px' },
      height: { type: String, default: '350px' }
    },
    data() {
      this.nodeList = []
      return {
        treeList: [],
        loading: false,
        filterText: '',
        filterFn: debounce(this.onNodeFilter, 300),
        defaultProps: { children: 'subList', label: 'name' },
        currentNodeKey: '',
        defaultExpandKeys: []
      }
    },
    watch: {},
    methods: {
      async loadData() {
        try {
          this.loading = true
          const res = await this.$$getCostOrgType()
          console.log('loadData', res)
          this.nodeList = res._list
          this.treeList = [res._tree]
          this.defaultExpandKeys = [res._tree.idRoute]
          this.$nextTick(() => this.$refs.tree.setCurrentNode(res._tree))
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      onNodeClick(node) {
        const { idRoute } = node
        this.scrollToCurrentNode(idRoute)
        this.$emit('nodeClick', node)
      },
      onNodeFilter(val) {
        this.$refs.tree.filter(trim(val))
      },
      filterNode(val, data, node) {
        return val === data.idRoute
      },
      querySearch(queryString, cb) {
        console.log('querySearch', queryString)
        queryString = trim(queryString)
        let results = []
        if (queryString.length < 2) {
          return cb(results)
        }
        results = this.nodeList.filter(li => li.nameRoute.includes(queryString))
        setTimeout(() => cb(results), 300)
      },
      handleSelect(item) {
        console.log('handleSelect', item)
        const { idRoute, name } = item
        this.filterText = name
        this.$nextTick(() => {
          this.$refs.tree.filter(idRoute)
          this.$refs.tree.setCurrentKey(idRoute)
          this.scrollToCurrentNode(idRoute)
        })
        this.$emit('nodeClick', this.$refs.tree.getNode(idRoute).data)
      },
      scrollToCurrentNode(idRoute) {
        // 展开指定的部门，并且滚动到该元素所在位置
        this.$nextTick(_ => {
          let curDomNode = this.$refs.treeScroller.querySelector(
            '.el-tree-node.is-expanded.is-current'
          )
          if (curDomNode) {
            setTimeout(
              () =>
                curDomNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }),
              200
            )
          }
        })
      }
    },
    activated() {
      console.log('activated')
      this.loadData()
    }
  }
</script>

<style lang="scss">
  .fms-cost-org-tree {
    border: 1px solid rgb(220, 218, 226);
    border-radius: 2px;
    padding: 10px 0px;
    display: flex;
    flex-direction: column;
  }
  .fms-cost-org-tree-input {
    padding: 0px 13px 0 10px;
  }
  .fms-cost-org-tree-scroller {
    flex: 1;
    overflow: scroll;
    margin-top: 12px;
    min-height: 200px;
    .el-tree > .el-tree-node {
      display: inline-block !important;
      min-width: 100%;
      width: auto;
    }
    .el-tree-node > .el-tree-node__children {
      overflow: visible;
    }
    .el-tree-node__content {
      padding-right: 8px;
    }
  }
</style>
