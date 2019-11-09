<template>
  <fms-dialog class="fms-dept-dialog"
              :loading="loading"
              v-bind="dialogOptions"
              v-on="$listeners">
    <kye-form :model="formModel">
      <kye-form-item label="组织名称"
                     prop="department">
        <kye-search-tips v-model="formModel.orgName"
                         placeholder="请输入组织名称"
                         url="hr.department.refactoring.getByFuzzyValue"
                         clearable
                         value-key="name"
                         :keys="['parentName','name']"
                         :format-data="searchDepartmentParams"
                         @select="chooseDepartment"
                         @clear="clearDepartment"></kye-search-tips>
      </kye-form-item>
    </kye-form>
    <div style="height:calc(60vh - 110px);overflow-y:auto;"
         ref="scrollBar">
      <hr-tree ref="tree"
               accordion
               node-key="id"
               :data="authTree"
               v-if="treeData[0]"
               @node-click="nodeClick"
               highlight-current
               expand-on-click-node
               :default-expanded-keys="[authTree[0].id]"
               :props="{label: 'name', children: 'children'}"
               :filter-node-method="filterNode"></hr-tree>
    </div>
    <template slot="footer">
      <!-- <el-checkbox v-model="checked">是否包含子节点</el-checkbox> -->
      <div>
        <el-button type="primary"
                   hotkey="ctrl+s"
                   @click="dialogSubmit">保存(S)</el-button>
        <el-button @click="dialogClose">取消</el-button>
      </div>
    </template>
  </fms-dialog>
</template>

<script>
  import FmsDialog from '../fms-dialog'
  import HrTree from '@/shared/components/kye-select-org/src/tree.vue'
  import findObjectByValue from '@/fms/utils/find-object-by-value'

  export default {
    components: { HrTree, FmsDialog },
    props: {
      args: Object,
      model: Object
    },
    data () {
      return {
        authTree: [], // 只展示上下一级
        loading: false,
        formModel: {
          orgId: '',
          orgName: ''
        },
        checked: false,
        treeData: [],
        dialogParams: {},
        dialogOptions: {
          title: '组织树',
          width: '400px',
          visible: false,
          modal: true,
          beforeClose: () => this.dialogClose(false)
        }
      }
    },
    methods: {
      // 判断登录用户的工号是否有权限查看所有数据
      checkDataAuth () {
        const userNumber = this.$store.getters.user.employeeNumber
        const lookupArr = this.lookUpOptions['hrms_department_lookup']
        lookupArr.forEach(e => {
          if (e.value === userNumber) {
            this.hasAllTree = true
          }
        })
      },
      async open (dialogParams) {
        this.dialogOpen()
        this.dialogParams = { ...dialogParams }
        if (!this.treeData || !this.treeData.length) {
          try {
            if (this.$root.FMSDepartmentTree && this.$root.FMSDepartmentTree.children) {
              this.treeData = [this.$root.FMSDepartmentTree]
            } else {
              this.loading = true
              // const res = await this.$http('hr.department.refactoring.getAllSimpleAsTreeFast', {})
              this.$root.FMSDepartmentTree = await this.$http(
                'hr.department.refactoring.getAllAsTree',
                // 'hr.department.refactoring.getAllSimpleAsTreeFast',
                {}
              )
              this.treeData = [this.$root.FMSDepartmentTree]
            }
            // 判断是否有查看权限
            if (this.hasAllTree) {
              this.authTree = this.treeData
            } else {
              this.authTree = [
                {
                  id: this.treeData[0].id,
                  name: this.treeData[0].name,
                  level: 1,
                  children: []
                }
              ]
            }
          } catch (e) {
            console.error(e)
          } finally {
            this.loading = false
          }
        }
      },
      dialogOpen () {
        this.dialogOptions.visible = true
      },
      dialogClose () {
        this.clearDepartment()
        this.dialogOptions.visible = false
      },
      // 搜索部门
      searchDepartmentParams (val) {
        return { fuzzyValue: val }
      },
      chooseDepartment (item) {
        if (item) {
          const { id, name } = item
          this.formModel.orgId = id
          this.formModel.orgName = name
          this.ids = [id]
          const parentNode = {
            id: item.parentId,
            name: item.parentName,
            children: []
          }
          // 没有查看所有数据权限的时候 才需要筛选数据
          if (!this.hasAllTree) {
            if (+item.parentId !== 0) {
              this.filterTree(item.id, parentNode)
            } else { // 如果是跨越集团
              this.filterTree(item.id)
            }
          }
          // 这里必须加个延迟才能定位到指定的ID
          this.$nextTick(_ => {
            this.$refs.tree.filter(id)
          })
        } else {
          this.clearDepartment()
        }
      },
      // 筛选数据(只显示上下一级)
      filterTree (id, parentNode) {
        const treeData = this.treeData
        const searchNode = JSON.parse(JSON.stringify(findObjectByValue(treeData, 'id', id)))
        // 将每个children中的children字段都删掉
        searchNode.children.forEach(e => e.children = [])
        if (parentNode) {
          parentNode.children.push(searchNode)
          this.authTree = [parentNode]
        } else {
          this.authTree = [searchNode]
        }
      },
      clearDepartment () {
        this.formModel.orgId = ''
        this.formModel.orgName = ''
      },
      filterNode (val, data) {
        console.log('val, data', val, data)
        let flag = val === data.id
        if (flag) {
          this.setCheckedDept(this.ids)
        }
        return flag
      },
      dialogSubmit () {
        let node = this.$refs.tree.getCurrentNode()
        console.log('dialogSubmit node', node)
        if (node) {
          const {
            children,
            id: orgId,
            name: orgName,
            departmentRoute: orgRoute,
            parentId: departmentId,
            parentName: departmentName
          } = node
          const { onSubmit, lastLevel } = this.dialogParams
          if (lastLevel && children && children.length > 0) {
            return this.$message.warning('请选择组织树最后一级!')
          }
          if (onSubmit) {
            onSubmit({
              orgId,
              orgName,
              orgRoute,
              departmentId,
              departmentName,
              id: orgId,
              name: orgName
            })
          }
          this.dialogClose()
        } else {
          this.$message.warning('请先选择!')
        }
      },
      setCheckedDept (ids) {
        this.checked = false
        // 展开指定的部门，并且滚动到该元素所在位置
        this.$nextTick(_ => {
          this.checked = ids.length > 1
          this.$refs.tree.setCurrentKey(ids[0])
          this.$nextTick(_ => {
            let dom = this.$refs.scrollBar.querySelector('.el-tree-node.is-expanded.is-current')
            if (dom) {
              let top = dom.offsetTop - 26
              dom = null
              this.$refs.scrollBar.scrollTo({ top, behavior: 'smooth' })
            }
          })
        })
      },
      nodeClick (obj, node, vm) {
        this.formModel.orgName = obj.name
      }
    },
    mounted () {
      this.args && this.open(this.args)
    }
  }
</script>
