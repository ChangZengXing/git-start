<template>
  <fms-dialog
    :loading="loading"
    class="fms-expense-type-wrapper"
    v-bind="fmsDialogOptions"
    v-on="$listeners"
  >
    <kye-tabs type="border-card" v-model="activeName" class="fms-expense-type-tabs">
      <kye-tab-pane label="历史常用" name="first" :disabled="firstDisabled">
        <kye-input
          clearable
          placeholder="请输入搜索内容"
          v-model="input"
          @input="search"
          @clear="clearSearch"
        ></kye-input>
        <div class="fms-expense-type-scroller">
          <el-radio-group v-model="expenseTypeId" @change="expenseTypeIdChange">
            <div class="type-list" v-for="(item, index) in typeList.emp" :key="index">
              <el-radio-button :label="item.id" :title="item.description">{{item.expenseType}}</el-radio-button>
            </div>
          </el-radio-group>
        </div>
      </kye-tab-pane>
      <kye-tab-pane label="部门常用" name="second" :disabled="secondDisabled">
        <kye-input
          clearable
          placeholder="请输入搜索内容"
          v-model="input"
          @input="search"
          @clear="clearSearch"
        ></kye-input>
        <div class="fms-expense-type-scroller">
          <el-radio-group v-model="expenseTypeId" @change="expenseTypeIdChange">
            <div class="type-list" v-for="(item, index) in typeList.dep" :key="index">
              <el-radio-button :label="item.id" :title="item.description">{{item.expenseType}}</el-radio-button>
            </div>
          </el-radio-group>
        </div>
      </kye-tab-pane>
      <kye-tab-pane label="所有" name="third" :disabled="thirdDisabled">
        <kye-input placeholder="输入关键字进行过滤" v-model="filterText"></kye-input>
        <div class="fms-expense-type-scroller">
          <el-tree
            ref="tree"
            :data="typeList.tree.children"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :highlight-current="true"
            @node-click="nodeClick"
          >
            <span
              class="el-tree-node__label"
              slot-scope="{ node, data }"
              :title="data.description"
            >{{ node.label }}</span>
          </el-tree>
        </div>
      </kye-tab-pane>
    </kye-tabs>
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import { dp } from '@/fms/utils'
  import { trim } from 'lodash'
  export default {
    mixins: comMixins,
    data() {
      return {
        fmsDialogOptions: {
          title: '报销分类',
          width: '562px',
          submitCall: this.dialogSubmit,
          cancelCall: this.fmsDialogClose
        },
        input: '',
        filterText: '',
        activeName: 'first',
        expenseTypeId: '',
        checkLastLevel: true,
        typeList: { tree: { children: [] }, all: [] },
        dpTypeList: { tree: { children: [] }, all: [] },
        defaultProps: { children: 'children', label: 'expenseType' },
        firstDisabled: false,
        secondDisabled: false,
        thirdDisabled: false
      }
    },
    watch: {
      activeName(newVal, oldVal) {
        this.input = ''
        this.typeList = dp(this.dpTypeList)
        this.expenseTypeId = ''
        this.expenseTypeObj = {}
      },
      filterText(val) {
        this.$refs.tree.filter(val)
      }
    },
    methods: {
      async open(dialogParams) {
        this.fmsDialogOpen(dialogParams)

        let list = dp(dialogParams.hotExpenseType)

        // pcExpenseType 为 true 表示只显示 pc端可以新增的报销分类
        // ers_expenseType_mobile_display (1: APP端显示, 2: PC端显示, 3: PC且APP显示, 4: PC和APP不显示)
        const {
          activeTab,
          expenseTypeDisplay,
          checkLastLevel = true,
          firstDisabled = false,
          secondDisabled = false,
          thirdDisabled = false
        } = dialogParams

        if (activeTab) {
          this.activeName = activeTab
        }

        this.firstDisabled = firstDisabled
        this.secondDisabled = secondDisabled
        this.thirdDisabled = thirdDisabled

        this.checkLastLevel = checkLastLevel

        if (!list) {
          try {
            this.loading = true
            const res = await this.$$getHotExpenseType(expenseTypeDisplay)
            if (!res || !res.all || !res.tree) {
              return this.$message.warning('获取报销分类失败!')
            }
            list = res
            this.expenseTypeRes = dp(res)
          } catch (e) {
            console.error(e)
          } finally {
            this.loading = false
          }
        }
        this.typeList = list
        this.dpTypeList = list
      },
      search(evt) {
        if (!trim(evt)) {
          this.clearSearch()
          return
        }
        const type = {
          first: 'emp',
          second: 'dep',
          third: 'all'
        }
        const childList = []
        this.typeList[type[this.activeName]].map(item => {
          if (item.label.includes(trim(evt))) {
            childList.push(item)
          }
        })
        this.typeList[type[this.activeName]] = childList
      },
      expenseTypeIdChange(expenseTypeId) {
        console.log('expenseTypeIdChange', expenseTypeId)
      },
      clearSearch() {
        this.typeList = dp(this.dpTypeList)
        this.expenseTypeId = ''
        this.expenseTypeObj = {}
      },
      filterNode(value, data) {
        if (!value) return true
        return data.expenseType.indexOf(value) !== -1
      },
      nodeClick(node) {
        console.log('nodeExpenseTypeClick', node)
        this.expenseTypeId = ''
        this.expenseTypeObj = node
      },
      dailogLoading(loading = true) {
        this.loading = loading
      },
      dailogClose() {
        this.fmsDialogClose()
      },
      dialogSubmit() {
        if (this.expenseTypeId) {
          this.expenseTypeObj = this.dpTypeList.all.find(li => li.id === this.expenseTypeId) || {}
        }

        const { expenseTypeObj = {}, expenseTypeRes, checkLastLevel } = this

        if (checkLastLevel && expenseTypeObj.nextLevelSubnodeCount > 0 && !this.expenseTypeId) {
          return this.$message.warning('请选择最末级分类!')
        }

        const expenseTypeId = expenseTypeObj.id
        const expenseTypeName = expenseTypeObj.expenseType

        const dialog = { loading: this.dailogLoading, close: this.dailogClose }

        if (!expenseTypeId) {
          return this.$message.warning('请选择费用项!')
        }

        this.dialogParams.onSubmit({
          dialog,
          expenseTypeId,
          expenseTypeRes,
          expenseTypeName,
          expenseTypeObj: dp(expenseTypeObj)
        })
      }
    }
  }
</script>
<style lang="scss">
  .fms-expense-type-wrapper {
    .el-input {
      margin: 0 0 8px;
    }
    .fms-expense-type-tabs {
      .fms-expense-type-scroller {
        height: 270px;
        overflow: auto;
      }
      .el-radio-button__inner {
        min-width: 116px;
      }
    }
    .type-list {
      display: inline-block;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      margin: 0 8px 8px 0;
      &:hover {
        a {
          color: #7352cd;
        }
      }
      a {
        cursor: pointer;
      }
      i {
        float: right;
        margin: 6px 0 0 0;
        visibility: hidden;
      }
      .item.active {
        a {
          color: #7352cd;
        }
        i {
          visibility: visible;
        }
      }
    }
    .el-tree-node__label {
      display: block;
      width: 100%;
    }
  }
</style>
