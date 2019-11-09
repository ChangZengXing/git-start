<template>
  <fms-dialog
    class="fms-cost-org-dialog"
    :loading="loading"
    v-bind="dialogOptions"
    v-on="$listeners"
  >
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
    <div style="height: calc(60vh - 110px); overflow-y: auto; margin-top: 8px;" ref="treeScroller">
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
          :class="data.effectiveFlag ? 'fms-cost-node-deleted' : ''"
          slot-scope="{ node, data }"
          :title="data.description"
        >{{ node.label }}</span>
      </hr-tree>
    </div>
    <template slot="footer">
      <div>
        <el-button type="primary" hotkey="ctrl+s" @click="dialogSubmit">保存(S)</el-button>
        <el-button @click="dialogClose">取消</el-button>
      </div>
    </template>
  </fms-dialog>
</template>

<script>
  import { up } from '@/fms/utils'
  import { trim, debounce } from 'lodash'
  import comMixins from '@/fms/mixins/common'
  import HrTree from '@/shared/components/kye-select-org/src/tree.vue'

  export default {
    mixins: comMixins,
    components: { HrTree },
    props: {
      args: Object,
      model: Object
    },
    data() {
      this.curNode = null
      this.nodeList = []
      return {
        treeList: [],
        loading: false,
        dialogParams: {},
        dialogOptions: {
          title: '组织树',
          width: '380px',
          visible: false,
          modal: true,
          beforeClose: () => this.dialogClose()
        },
        filterText: '',
        filterFn: debounce(this.onNodeFilter, 300),
        defaultProps: { children: 'subList', label: 'name' },
        currentNodeKey: '',
        defaultExpandKeys: []
      }
    },
    methods: {
      async open(dialogParams) {
        console.log('fms-cost-org-dialog open', dialogParams)
        this.dialogOpen()
        this.dialogParams = { ...dialogParams }
        this.loadData()
      },
      dialogOpen() {
        this.dialogOptions.visible = true
      },
      dialogClose() {
        this.dialogOptions.visible = false
      },
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
        this.curNode = node
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
        if (name) {
          this.filterText = name
        }
        this.$nextTick(() => {
          this.$refs.tree.filter(idRoute)
          this.$refs.tree.setCurrentKey(idRoute)
          this.scrollToCurrentNode(idRoute)
        })
        this.curNode = this.$refs.tree.getNode(idRoute).data
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
      },
      dialogSubmit() {
        console.log('dialogSubmit', this.curNode)
        if (!this.curNode) {
          return this.$message.warning('请选择数据')
        }

        const { onSubmit, lastLevel } = this.dialogParams

        const children = this.curNode.subList

        if (lastLevel && children && children.length > 0) {
          return this.$message.warning('请选择最后一级!')
        }

        const nodeModel = up(
          {},
          this.curNode,
          [
            'id',
            'name',
            'idRoute',
            'parentId',
            'nameRoute',
            'parentIdRoute',
            ['lastLevel', '', false],
            ['effectiveFlag', '', false]
          ],
          ''
        )

        if (onSubmit) {
          onSubmit(nodeModel)
        }
        this.dialogClose()
      }
    },
    mounted() {
      // 注意这里有混入comMixin中有mounted已经执行了this.open
      // 所以这里就不在需要再次执行this.open,要不就会执行两次this.open
      // this.args && this.open(this.args)
    }
  }
</script>

<style lang="scss">
  .fms-cost-org-dialog {
    .fms-cost-node-deleted {
      text-decoration: line-through;
      color: #f10;
    }
    .is-current > .el-tree-node__content {
      .fms-cost-node-deleted {
        color: #ff9300;
        font-weight: 600;
        background-color: #fff !important;
      }
    }
  }
</style>
