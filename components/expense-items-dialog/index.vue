<template>
  <fms-dialog
    :loading="loading"
    v-bind="fmsDialogOptions"
    v-on="$listeners"
    class="fms-expense-items-dialog"
  >
    <dl>
      <dt>
        <el-input v-model="filterText"></el-input>
      </dt>
      <dd class="fms-expense-tree-wrapper">
        <el-tree
          :data="tree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          ref="tree"
          :filter-node-method="filterNode"
          :default-expanded-keys="checkedKeys"
          :default-checked-keys="checkedKeys"
        ></el-tree>
      </dd>
    </dl>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  export default {
    mixins: comMixins,
    data() {
      return {
        fmsDialogOptions: {
          title: '费用层级',
          width: '380px',
          submitCall: this.dialogSubmit,
          cancelCall: this.dialogCancel,
          beforeClose: this.dialogCancel
        },
        tree: [],
        treeProps: {
          children: 'children',
          label: 'expenseType'
        },
        checkedKeys: [],
        filterText: ''
      }
    },
    watch: {
      filterText(val) {
        this.$refs.tree.filter(val)
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        this.loadTree()
      },
      async loadTree() {
        try {
          this.tree = []
          this.loading = true
          const res = await this.$http('ers.expenseType.get')
          if (!res) {
            return this.$message.warning('获取数据为空')
          }
          this.tree = res.children || []
          const { checkedNodes } = this.dialogParams
          this.checkedKeys = (checkedNodes || []).map(n => n.id)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      filterNode(value, data) {
        if (!value) return true
        console.log('data', data)
        return data.expenseType.indexOf(value) !== -1
      },
      dialogSubmit() {
        // const checkedKeys = this.$refs.tree.getCheckedKeys()
        const checkedNodes = this.$refs.tree.getCheckedNodes()
        console.log('dialogSubmit', { checkedNodes })
        this.dialogParams.onSubmit && this.dialogParams.onSubmit(checkedNodes)
        this.fmsDialogClose()
      },
      dialogCancel() {
        this.fmsDialogClose()
        this.dialogParams.onCancel && this.dialogParams.onCancel()
      }
    }
  }
</script>

<style lang="scss">
  .fms-expense-items-dialog {
    .el-dialog__body {
      overflow: hidden;
    }
  }
  .fms-expense-tree-wrapper {
    margin-top: 12px;
    min-height: 200px;
    max-height: calc(70vh - 45px - 60px);
    overflow-y: auto;
  }
</style>
