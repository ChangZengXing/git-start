<template>
  <div class="fms-flow-approve">
    <div class="fms-flow-approve_top">
      <div class="fms-flow-approve_top-typeName">{{typeId|lookup('oams_typeid')}}</div>
      <div class="fms-flow-approve_top-serialNumber" v-if="serialNumber">单号：{{serialNumber}}</div>
    </div>
    <kye-steps align-center>
      <kye-step
        v-for="(step, stepIndex) in dataSteps"
        :key="stepIndex"
        :status="getStepStatus(step)"
      >
        <div class="fms-flow-approve_title" slot="title">
          <div v-if="stepIndex === 0">
            <template v-if="step.cancel">
              <el-popover width="220" trigger="hover" placement="bottom" :content="step.cancelInfo">
                <div slot="reference">
                  <span>{{step.taskName}}: {{step.approvNameFirst}}</span>
                  <span class="fms-flow-approve-status-tag fms-flow-approve-status-tag-brown">已撤销</span>
                </div>
              </el-popover>
            </template>
            <template v-else>
              <span slot="reference">{{step.taskName}}: {{step.approvNameFirst}}</span>
            </template>
          </div>
          <div class="fms-flow-approve_more" v-if="step.moreDisplay" @click="openMoreFns">查看全流程</div>
          <el-popover
            v-if="stepIndex > 0 && !step.moreDisplay"
            width="220"
            trigger="hover"
            placement="bottom"
          >
            <div class="fms-flow-approve-step-popover">
              <div
                v-for="(employee, employeeIndex) in step.listEmployee"
                :key="employee.employeeNumber + employeeIndex"
              >
                <p>{{ getEmployeeName(employee, step) }}</p>
                <p
                  v-if="step.comment && employee.employeeName === step.approver"
                >{{`意见: ${step.comment} ${step.supplementOperation ? '，' + step.supplementOperation : ''}`}}</p>
              </div>
            </div>
            <div slot="reference">
              <span>{{step.taskName}}: {{step.approvNameFirst}}</span>
              <span
                v-if="stepIndex > 0"
                class="fms-flow-approve-status-tag"
                :class="getStatusClass(step)"
              >{{getStatusName(step)}}</span>
            </div>
          </el-popover>
        </div>
        <div slot="description">
          <span>{{step.approveTime | minute}}</span>
        </div>
        <i class="iconfont" slot="icon" :class="getStatusIconClass(step)"></i>
      </kye-step>
    </kye-steps>

    <!-- 弹出层 -->
    <!-- 弹出层 -->
    <kye-dialog
      v-bind="dialogOption"
      :view.sync="dialogOption.view"
      :visible.sync="dialogOption.show"
    >
      <component
        :is="dialogOption.view"
        :dialogData.sync="dialogData"
        ref="componentsref"
        @close="dialogOption.show = false"
      ></component>
    </kye-dialog>
  </div>
</template>

<script>
  import { get, toNumber, toString } from 'lodash'
  import MoreStep from './more-step'
  export default {
    props: {
      typeId: String,
      serialNumber: String,
      data: { type: Array, default: () => [] }
    },
    /* eslint-disable-next-line */
    components: { MoreStep },
    data() {
      return {
        dataSteps: [],
        dialogData: {},
        dialogOption: {
          loading: false,
          width: '1200px',
          title: '',
          show: false,
          view: ''
        }
      }
    },
    watch: {
      data(val) {
        console.log('dataSteps', val)
        this.setDataSteps(val)
      }
    },
    methods: {
      setDataSteps() {
        if (!this.data || this.data.length === 0) {
          // 这里需要清除缓存
          this.dataSteps = []
          return
        }

        const dataSteps = [...this.data]
        const lastStep = dataSteps[dataSteps.length - 1]

        if (lastStep.more) {
          dataSteps.push({
            moreDisplay: true,
            listEmployee: [],
            approvalChart: lastStep.approvalChart
          })
        }
        // status 0 未审 2 正在审核 1 已审核
        dataSteps.forEach((step, index) => {
          step.approvNameList = ''
          step.approvNameFirst = step.approver || get(step.listEmployee, '0.employeeName')

          if (step.listEmployee && step.listEmployee.length > 1) {
            step.listEmployee.forEach(employee => {
              step.approvNameList += employee.employeeName
            })
          }
          if (typeof step.approveTime === 'string') {
            step.approveTime = step.approveTime.replace(/\//g, '-')
          }
        })

        this.dataSteps = dataSteps
      },
      openMoreFns() {
        const lastStep = this.dataSteps[this.dataSteps.length - 1]
        if (lastStep && lastStep.approvalChart) {
          Object.assign(
            this.dialogData,
            JSON.parse(this.dataSteps[this.dataSteps.length - 1].approvalChart)
          )
          this.showDynamicDialog('moreStep', '流程图', 6)
        }
      },
      showDynamicDialog(view, title, width = '360px') {
        this.dialogOption.show = true
        this.dialogOption.view = view
        this.dialogOption.title = title
        this.dialogOption.width = width
      },
      closeDynamicDialog(needRrefresh) {
        this.dialogOption = {
          show: false,
          view: null,
          title: '',
          width: '0px'
        }
        if (needRrefresh) {
          this.reload()
        }
      },
      getStepStatus(step) {
        const status = {
          '1': 'success',
          '2': 'process',
          '3': 'error'
        }
        return status[step.status] || 'wait'
      },
      getEmployeeName(employee, step) {
        const name = `${employee.employeeName}(${employee.employeeNumber}): `
        const status =
          employee.employeeName === step.approver || toString(step.status) === '2'
            ? this.getStatusName(step)
            : ''
        return name + status
      },
      getStatusClass(step) {
        const status = toString(step.status)
        return {
          'fms-flow-approve-status-tag-gray': status === '1',
          'fms-flow-approve-status-tag-blue': status === '2'
        }
      },
      getStatusIconClass(step) {
        const status = toString(step.status)
        const iconClass = []
        if (status === '2') {
          iconClass.push('icon-shenpizhong')
        } else if (status === '3') {
          iconClass.push('icon-HROA-guanbi')
        } else {
          iconClass.push('icon-HROA-yuan')
        }
        return iconClass
      },
      // 获取状态名称
      getStatusName(step) {
        const status = toString(step.status)
        const statusList = ['', '同意', '审批中', '不同意']
        if (status === '3' && !step.taskStatus) return
        if (step.supplementOperation && status === '0') {
          return '补/转'
        } else {
          return statusList[toNumber(status)]
        }
      }
    },
    created() {
      this.setDataSteps()
    }
  }
</script>

<style lang="scss">
  .fms-flow-approve {
    min-height: 100px;
    margin-top: 2px;
    position: relative;
    margin-bottom: 12px;
    .el-steps {
      margin: 4px 0;
      .el-step__main {
        cursor: pointer;
      }
      .el-step__head {
        .icon-shenpizhong {
          font-size: 28px;
        }
        .el-step__line {
          margin-left: 0px;
          margin-right: 0px;
        }
        &.is-success {
          color: #7352bf;
          border-color: #7352bf;
          .el-step__line {
            background-color: #7352bf;
          }
        }
        &.is-process {
          color: #7352bf;
          border-color: #7352bf;
        }
        &.is-error {
          color: #ff9033;
          border-color: #ff9033;
        }
        &.is-wait {
          color: #c0c4cc;
          border-color: #c0c4cc;
        }
      }
      .el-step__title {
        margin-top: 2px;
        font-size: 13px;
        line-height: 20px;
        font-weight: 400;
        &.is-success,
        &.is-process {
          color: #333;
        }
        &.is-error {
          color: #ff9033;
        }
        &.is-wait {
          color: #c0c4cc;
        }
      }
      .el-step__description {
        margin-top: -2px;
        height: 20px;
        &.is-success {
          color: #333;
        }
        &.is-error {
          color: #ff9033;
        }
        &.is-wait {
          color: #c0c4cc;
        }
      }
    }
  }
  .fms-flow-approve-status-tag {
    padding: 0 3px;
    font-size: 12px;
    border-radius: 3px;
    white-space: nowrap;
    &-brown {
      background-color: #ff9033;
      color: #fff;
    }
    &-blue {
      background-color: #7352bf;
      color: #ffffff;
    }
    &-gray {
      // background-color: #e4e4ea;
      background-color: #f1eaff;
      color: #7352bf;
    }
  }
  .fms-flow-approve_more {
    color: #7352bf;
    cursor: pointer;
  }
  .fms-flow-approve_top {
    padding: 4px 0;
  }
  .fms-flow-approve_top-serialNumber {
    text-align: right;
    white-space: nowrap;
  }
  .fms-flow-approve-step-popover {
    max-height: 200px;
    overflow-y: auto;
  }
</style>
