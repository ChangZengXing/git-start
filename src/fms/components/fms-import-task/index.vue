<template>
  <kye-dialog
    :visible="visible"
    v-bind="$attrs"
    v-on="$listeners"
    append-to-body
    :title="$attrs.title || '数据导入'"
    :width="$attrs.width || '360px'"
    @open="open"
    :before-close="close"
  >
    <div>
      <el-row>
        <kye-upload
          :code="code"
          :id="uuid"
          v-model="list"
          :accept="accept"
          successMsg
          @success="uploadSuccess"
        ></kye-upload>
        <div v-if="showProgress">
          <el-progress
            type="line"
            :percentage="progress"
            :show-text="false"
            color="rgba(142, 113, 199, 0.7)"
            style="margin-top:10px;"
          ></el-progress>
          <p>{{tips}}</p>
        </div>
      </el-row>
      <el-row style="margin-top:20px">
        <el-col :span="12">
          <el-button @click="downloadTemplate" :disabled="downloadDisabled">
            <i class="iconfont icon-xiazai"></i>
            模板下载
          </el-button>
          <p style="font-size:12px;color:#888;">请按该模板格式录入数据。</p>
        </el-col>
        <el-col :span="12">
          <el-button @click="downloadErrorFile" type="danger" :disabled="disabled">
            <i class="iconfont icon-xiazai"></i>
            异常文件下载
          </el-button>
          <p v-if="!disabled" style="font-size:12px;color:#f56c6c;">请下载该文件查看错误原因。</p>
        </el-col>
      </el-row>
    </div>
  </kye-dialog>
</template>

<script>
  export default {
    name: 'kye-data-import',
    props: {
      visible: {
        type: Boolean
      },
      code: {
        type: String
      },
      url: {
        type: String
      },
      params: {
        type: Object,
        default: () => ({})
      },
      accept: {
        type: Array,
        default: () => ['excel', '.xls', '.xlsx', '.et']
      },
      downloadDisabled: {
        type: Boolean,
        default: false
      },
      isAsync: {
        // 是否异步导入
        type: Boolean
      },
      time: {
        // 定时请求间隔时间
        type: Number,
        default: 500
      }
    },
    data() {
      return {
        uuid: '',
        list: [],
        disabled: true,
        errorFile: '',
        progress: 0,
        showProgress: false,
        tips: ''
      }
    },
    methods: {
      open() {
        this.getUUId()
      },
      async getUUId() {
        let data = await this.$http('system.idcenter.get')
        this.uuid = data
        this.$emit('change', data)
      },
      close() {
        this.$emit('update:visible', false)
        this.uuid = ''
        this.list = []
        this.disabled = true
        this.errorFile = ''
        if (this.isAsync) {
          clearInterval(this.timer)
          this.showProgress = false
          this.progress = 0
        }
      },
      async downloadTemplate() {
        let data = await this.$http('system.excelTemplate.getFileByCode', { templateCode: this.code })
        window.erpOpen(data.url)
      },
      async uploadSuccess() {
        try {
          let data = await this.$http(this.url, { id: this.uuid, ...this.params })
          if (!this.isAsync) {
            this.$emit('uploadSuccess', data)
            this.$message.success('数据导入成功')
            this.$emit('success', data)
            this.close()
          } else {
            if (data.id) {
              this.tips = ''
              this.timer = setInterval(() => {
                this.$http(
                  'file.excelImport.get',
                  {
                    id: data.id
                  },
                  { log: false }
                )
                  .then(importRes => {
                    if (importRes && importRes.status) {
                      this.tips = importRes.errorMsg
                      if (importRes.status === 20) {
                        this.$emit('success', importRes)
                        this.$message.success('数据导入成功')
                        this.progress = 100
                        this.close()
                      } else if (importRes.status === 10) {
                        this.showProgress = true
                        this.progress += 20
                        if (this.progress > 100) this.progress = 100
                      } else if (importRes.status === 30) {
                        this.$message.error(importRes.errorMsg)
                        this.close()
                      } else if (importRes.status === 40) {
                        this.disabled = true
                        this.$message.error('文件导入数据异常，请下载异常文件查看')
                        clearInterval(this.timer)
                        this.disabled = false
                        this.showProgress = false
                        this.progress = 0
                      }
                    } else {
                      this.$message.error('接口返回参数异常！')
                      this.close()
                    }
                  })
                  .catch(error => {
                    this.$message.error(error)
                    this.close()
                  })
              }, this.time)
            } else {
              this.$message('文件导入失败')
              this.close()
            }
          }
        } catch (err) {
          if (err.code === 13610) {
            this.disabled = false
          }
        }
      },
      async downloadErrorFile() {
        let data = await this.$http('file.getByBizCodeAndBizId', {
          bizCode: 'excel_import_error',
          bizId: this.uuid
        })
        window.erpOpen(data[0].url)
      }
    }
  }
</script>
