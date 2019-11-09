<template>
  <div class="fms-upload" @click.capture="onPick">
    <kye-upload
      v-bind="attrs"
      :id="bizId"
      :ref="'upload'"
      :limit="limit"
      :code="bizCode"
      :multiple="multiple"
      :auto-upload="false"
      :show-file-list="false"
      :accept="acceptComputed"
      :disabled="disabledComputed"
      :on-error="onError"
      :on-exceed="onExceed"
      @error="onError"
      @success="onSuccess"
      @uploadChange="onUploadChange"
      @change.native="onChange"
    />
    <!--
      // 使用原生change.native事件监听用户是否选择文件事件
    -->
  </div>
</template>

<script>
  import { hasAuth } from '@/fms/utils'
  import { BIZCODE } from '@/fms/config'
  import _KyeUpload from '@/public/components/kye-upload'

  // hacking kye-upload (kye-upload cannot get on-change)
  const { handleChange, handleBeforeUpload, beforeRemove } = _KyeUpload.methods

  const KyeUpload = {
    name: 'fms-upload-extend',
    fmsName: 'FmsUploadExtend',
    extends: _KyeUpload,
    props: {
      deleteAlert: Boolean,
      beforeUpload: { type: Function, default: undefined }
    },
    methods: {
      handleChange(file, list) {
        handleChange.call(this, file, list)
        this.$emit('uploadChange', file, list)
      },
      handleSuccess(res, file, fileList) {
        this.num = 0
        // 上传文件大小为0kb的不往下走
        if (file.size === 0) {
          this.$message.warning(`文件大小不能为0KB!`)
          return
        }
        if (res.code === 0) {
          this.$emit('input', res.data, file, fileList)
          this.$emit('success', res.data, file, fileList)
          this.successMsg && this.$message.success(this.successMsg)
        } else {
          this.$emit('error', res.msg || res.message)
          this.$message.error(res.msg || res.message || '上传失败')
        }
      },
      handleBeforeUpload(file, list) {
        const re = handleBeforeUpload.call(this, file, list)
        if (re === false) {
          this.$emit('error', new Error('确认文件上传类型是否正确'))
          return re
        }
        if (this.beforeUpload) {
          return this.beforeUpload(file, list)
        }
      },
      beforeRemove(file, list) {
        if (this.deleteAlert) {
          return beforeRemove.call(this, file, list)
        }
        return true
      },
      handleRemove(file, list) {
        this.$emit('on-remove', file, list)
      }
    }
  }

  export default {
    name: 'fms-upload',
    fmsName: 'FmsUpload',
    props: {
      id: String,
      limit: Number,
      accept: Array,
      uniqueId: Boolean,
      disabled: Boolean,
      limitMessage: String,
      code: { type: String, default: BIZCODE },
      multiple: { type: Boolean, default: false },
      beforePick: { type: Function, default: undefined },
      beforeUpload: { type: Function, default: undefined },
      acceptImageTypes: { type: Array, default: () => [] }
    },
    components: { KyeUpload },
    data() {
      return {
        bizId: '',
        bizCode: this.code,
        startPick: false,
        isExceed: false
      }
    },
    computed: {
      disabledComputed() {
        if (this.disabled) {
          return true
        }
        const { auth } = this.$attrs
        return !hasAuth(auth)
      },
      attrs() {
        const { btnText = '上传', btnType = 'text', btnIcon = '' } = this.$attrs
        return { ...this.$attrs, btnText, btnType, btnIcon }
      },
      upload() {
        return this.$refs.upload.$children[0]
      },
      acceptComputed() {
        if (this.acceptImageTypes.length > 0) {
          const accept = this.accept.filter(a => a !== 'image')
          const types = {
            png: 'image/png',
            gif: 'image/gif',
            jpg: 'image/jpeg',
            bmp: 'image/x-ms-bmp'
          }
          this.acceptImageTypes.forEach(type => accept.push(types[type]))
          return accept
        }
        return this.accept
      }
    },
    watch: {
      id(val) {
        this.bizId = val
      },
      code(val) {
        this.bizCode = val
      }
    },
    methods: {
      onPick($event) {
        console.log('onPick')
        this.$emit('pick', $event)
        if (this.beforePick && !this.startPick) {
          $event.stopPropagation()
          this.beforePick(() => {
            this.startPick = true
            const input = this.$el.querySelector('.el-upload__input')
            // 必须要在用户事件流中触发 注意不会在setTimeout()块中触发 比如可以在点击事件中代码块中触发
            // see https://github.com/angular/material/issues/8639
            /*
             * Because the browsers are only able to open the file dialog,
             * if the click was triggered inside of an event handler,
             * that was triggered by the user and is trusted.
             */
            input.click()
          })
        } else {
          this.startPick = false
        }
      },
      onError(err, file, fileList) {
        console.log('fms-upload:onError', err)
        this.$emit('error', err, file, fileList)
        this.uploadDone(err || new Error('upload error'), this.bizId, file)
        // el-upload 会缓存已经上传的文件,即使外部删除之前上传的文件
        this.limit && file && this.upload.handleRemove(file)
      },
      onSuccess(resFiles, file, fileList) {
        console.log('fms-upload:success', resFiles, file, fileList)
        this.$emit('success', this.bizId, resFiles, file, fileList)
        this.uploadDone(null, this.bizId, resFiles, file, fileList)
        // el-upload 会 缓存已经上传的文件,即使外部删除之前上传的文件
        // 这会导致limit maxUpload判读失效
        this.limit && file && this.upload.handleRemove(file)
      },
      // hook function when limit is exceeded
      // 当选择的文件超过了 limit后,会执行这个函数,目前直接在 onChange 函数中判断
      onExceed(files, fileList) {
        this.isExceed = true
        this.$emit('exceed', files, fileList)
        console.log('fms-upload:onExceed', files, fileList)
      },
      onChange(e) {
        console.log('fms-upload:onChange', e)
        if (this.isExceed) {
          this.isExceed = false
          return
        }
        const input = e.target
        const files = [...(input.files || [])]
        if (this.multiple && this.limit && files.length > this.limit) {
          this.$emit('exceed', files)
          setTimeout(() => {
            this.$message.warning(this.limitMessage || `最多可上传${this.limit}个文件`)
          }, 0)
          return
        }

        this.$emit('change', files)

        if (!this.beforeUpload) {
          this.startUpload()
        } else {
          this.beforeUpload(uploadDone => this.startUpload(uploadDone))
        }
      },
      onUploadChange(file, list = []) {
        // 该事件会触发多次
        // console.log('fms-upload:onUploadChange', file, list)
        // if (this.limitFlag) {
        //   return
        // }
        // if (this.limit > 1 && list.length > this.limit) {
        //   this.limitFlag = true
        //   return this.$message(`每次最多上传${this.limit}个文件`)
        // }
        // this.$emit('change', list)
        // if (!this.beforeUpload) {
        //   this.startUpload()
        // } else {
        //   this.beforeUpload(uploadDone => this.startUpload(uploadDone))
        // }
      },
      // 开始上传
      async startUpload(uploadDone = () => {}) {
        this.uploadDone = uploadDone
        this.bizCode = this.code
        // 有设置 uniqueId就强制获取新的id 没有传入bizId就获取bizId
        if (this.uniqueId || (!this.bizId && !this.id)) {
          // 获取bizId
          try {
            this.bizId = await this.$http('system.idcenter.get', {})
          } catch (e) {
            console.error(e)
            this.uploadDone(e, this.bizId, [])
            this.$emit('error', e, {}, [])
            return
          }
        } else if (!this.bizId) {
          this.bizId = this.id
        }
        setTimeout(() => {
          console.log(`start upload code: ${this.bizId}`)
          this.upload.submit()
        }, 0)
      }
    },
    created() {
      this.bizId = this.id
      this.bizCode = this.code
    }
  }
</script>

<style>
  .fms-upload {
    display: inline-block;
  }
  .fms-upload + button {
    margin-left: 8px;
  }
  .fms-upload .el-upload.el-upload {
    margin-right: 0;
  }
</style>
