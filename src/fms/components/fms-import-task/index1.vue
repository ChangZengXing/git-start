<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <kye-form label-position="top">
      <kye-row>
        <kye-col :span="24">
          <kye-form-item label="处理进度">
            <el-progress
              :text-inside="true"
              :stroke-width="18"
              :percentage="progress"
              color="rgba(142, 113, 199, 0.7)"
            ></el-progress>
          </kye-form-item>
        </kye-col>
      </kye-row>
    </kye-form>
  </fms-dialog>
</template>

<script>
  import { isEmpty } from 'lodash'
  import FmsDialog from '../fms-dialog'
  import dialogMixins from '@/fms/mixins/dialog'
  import fmsDialogMixins from '@/fms/mixins/fms-dialog'
  export default {
    name: 'FmsAsyncTask',
    mixins: [fmsDialogMixins, dialogMixins],
    components: { FmsDialog },
    data() {
      return {
        loading: false,
        fmsDialogOptions: {
          showClose: false,
          title: '操作处理中',
          width: '360px'
        },
        pending: false,
        progress: 0,
        time: 500,
        isProgress: false
      }
    },
    methods: {
      open(dialogParams) {
        console.log('FmsAsyncTask open', dialogParams)
        this.fmsDialogOpen(dialogParams)
        this.taskProcess()
        this.isProgress = dialogParams.isProgress
      },
      async taskProcess() {
        try {
          let { taskId, apiCode, params, done, success } = this.dialogParams
          if (!taskId) {
            this.loading = true
            const res = (await this.$http(apiCode, { ...params })) || {}
            taskId = res.taskId
            this.loading = false
          }
          if (taskId) {
            this.timer = setInterval(() => {
              if (this.pending === false) {
                this.pending = true
                // 所有的定时任务（settimeout、setInterval）里调用的开放平台的接口, 为防止干扰日志上报需要这么调用： this.$http('xxx', data, { log: false })
                this.$http('file.excelImport.get', { taskId }, { log: false })
                  .then(taskRes => {
                    this.pending = false
                    console.log('taskRes', taskRes)
                    // 导入成功 20
                    if (taskRes.status === '20') {
                      this.progress = 100
                      this.pending = true
                      clearInterval(this.timer)
                      if (typeof done === 'function') {
                        this.fmsDialogClose()
                        return done(taskRes)
                      }
                      success && success()
                      let successMsg = '操作成功!'
                      if (!isEmpty(taskRes.obj)) {
                        successMsg =
                          typeof taskRes.obj === 'object' ? JSON.stringify(taskRes.obj) : taskRes.obj
                      }
                      this.$message.success(taskRes.errorMsg || successMsg)
                      this.fmsDialogClose()
                      // 正在处理 10
                    } else if (taskRes.status === '10') {
                      let progress = 0
                      if (!this.isProgress && taskRes.page && taskRes.pageTotal) {
                        console.log('this.isProgress1', this.isProgress)
                        progress = parseInt((taskRes.page / taskRes.pageTotal) * 100)
                        this.progress = progress >= 100 ? 99 : progress
                        console.log('task-progress', this.progress)
                      } else if (this.isProgress) {
                        progress = parseInt(
                          ((taskRes.sucessPage + taskRes.errorPage) / taskRes.pageTotal) * 100
                        )
                        console.log('this.isProgress2', progress)
                        this.progress = progress >= 100 ? 99 : progress
                        console.log('task-progress2', this.progress)
                      } else {
                        this.progress = 0
                      }
                      if (this.progress >= 100) this.progress = 99
                      if (taskRes.errorMsg) {
                        this.$message.warning(taskRes.errorMsg)
                      }
                    } else if (taskRes.status === '40') {
                      // 导入完成，但数据有问题
                    } else {
                      clearInterval(this.timer)
                      this.$message.warning(
                        taskRes.exception || taskRes.msg || taskRes.errorMsg || '操作异常!'
                      )
                      this.fmsDialogClose()
                    }
                  })
                  .catch(e => {
                    console.error(e)
                    this.fmsDialogClose()
                    clearInterval(this.timer)
                  })
              }
            }, this.time)
          } else {
            this.$message.warning('操作异常!')
            this.fmsDialogClose()
          }
        } catch (e) {
          console.error(e)
          this.loading = false
          clearInterval(this.timer)
          this.fmsDialogClose()
        }
      }
    },
    beforeDestroy() {
      clearInterval(this.timer)
    }
  }
</script>
