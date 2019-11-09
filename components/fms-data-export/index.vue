<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <kye-form label-position="top">
      <kye-row>
        <kye-col :span="24">
          <kye-form-item label="导出进度">
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
  import FmsDialog from '../fms-dialog'
  import dialogMixins from '@/fms/mixins/dialog'
  import fmsDialogMixins from '@/fms/mixins/fms-dialog'
  export default {
    name: 'FmsDataExport',
    mixins: [fmsDialogMixins, dialogMixins],
    components: { FmsDialog },
    data() {
      return {
        loading: false,
        fmsDialogOptions: {
          showClose: false,
          title: '数据导出',
          width: '360px'
        },
        pending: false,
        progress: 0,
        time: 500
      }
    },
    methods: {
      open(dialogParams) {
        console.log('FmsDataExport open', dialogParams)
        this.fmsDialogOpen(dialogParams)
        this.dataExport()
      },
      async dataExport() {
        try {
          // this.loading = true
          const { apiCode, searchCode, params, done, taskId, checkSync, exportSuccess } = this.dialogParams
          const menuId = this.$store.state.menus[this.$route.meta.tag].id
          const res = taskId
            ? { taskId }
            : await this.$http(apiCode, { ...params, searchCode, menuId })

          // 判断是否同步导出 checkSync: 是否检查同步导出
          if (checkSync && res && res.successful && res.url) {
            this.progress = 100
            window.erpOpen(res.url)
            setTimeout(() => {
              this.fmsDialogClose()
            }, 1000)
            return
          }

          if (res && res.taskId) {
            this.pending = false
            this.timer = setInterval(() => {
              if (this.pending === false) {
                this.pending = true
                // 所有的定时任务（settimeout、setInterval）里调用的开放平台的接口, 为防止干扰日志上报需要这么调用： this.$http('xxx', data, { log: false })
                this.$http('file.file.result', { taskId: res.taskId }, { log: false })
                  .then(exportRes => {
                    this.pending = false
                    console.log('export-stream', exportRes)
                    if (exportRes.status === 'finish') {
                      const isUrl = exportRes.url && exportRes.url.includes('http')
                      this.progress = 100
                      this.pending = true
                      clearInterval(this.timer)

                      if (isUrl) {
                        window.erpOpen(exportRes.url)
                        exportSuccess && exportSuccess()
                      } else {
                        this.$message.warning(`文件: ${exportRes.url} 无法下载`)
                      }

                      setTimeout(() => {
                        this.fmsDialogClose()
                      }, 1000)

                      if (typeof done === 'function') {
                        return done(exportRes)
                      }
                    } else if (exportRes.status === 'process') {
                      console.log('export-progress', exportRes)
                      if (exportRes.page && exportRes.pageTotal) {
                        let progress = parseInt((exportRes.page / exportRes.pageTotal) * 100)
                        this.progress = progress >= 100 ? 99 : progress
                      } else {
                        this.progress = 99
                      }
                      if (this.progress >= 100) this.progress = 99
                    } else {
                      clearInterval(this.timer)
                      this.$message.warning(exportRes.msg || '文件无法下载')
                      this.fmsDialogClose()
                    }
                  })
                  .catch(e => {
                    console.error(e)
                    clearInterval(this.timer)
                    this.fmsDialogClose()
                  })
              }
            }, this.time)
          } else {
            this.$message.warning('文件错误无法下载')
            this.fmsDialogClose()
          }
        } catch (e) {
          console.error(e)
          clearInterval(this.timer)
          this.fmsDialogClose()
        } finally {
          this.loading = false
        }
      }
    },
    beforeDestroy() {
      clearInterval(this.timer)
    }
  }
</script>
