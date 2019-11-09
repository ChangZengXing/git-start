<template>
  <div class="fms-upload" @click.capture="onPick">
    <kye-upload
      v-bind="attrs"
      :id="bizId"
      :code="bizCode"
      :on-error="onError"
      :show-file-list="false"
      :auto-upload="false"
      :ref="'upload'"
      :disabled="disabledComputed"
      @success="onSuccess"
      @change.native="onChange"
    />
    <!--
      // 使用原生change.native事件监听用户是否选择文件事件
    -->
  </div>
</template>

<script>
  import Vue from 'vue'
  import { hasAuth } from '@/fms/utils'
  import { BIZCODE } from '@/fms/config'
  import _KyeUpload from '@/public/components/kye-upload'

  // hacking kye-upload (kye-upload cannot get on-change)
  const { handleChange, handleBeforeUpload } = _KyeUpload.methods
  const KyeUpload = Vue.extend(_KyeUpload)
  // !! 会影响原KyeUpload
  KyeUpload.mixin({
    methods: {
      handleChange(file, list) {
        handleChange.call(this, file, list)
        this.$emit('uploadChange', file, list)
      },
      handleBeforeUpload(file) {
        const re = handleBeforeUpload.call(this, file)
        return re
      }
    }
  })

  export default {
    props: {
      id: String,
      disabled: Boolean,
      code: { type: String, default: BIZCODE },
      beforePick: { type: Function, default: undefined },
      beforeUpload: { type: Function, default: undefined }
    },
    components: { KyeUpload },
    data() {
      return {
        bizId: '',
        bizCode: this.code,
        startPick: false
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
        this.$emit('error', err, file, fileList)
        this.uploadDone(err || new Error('upload error'), this.bizId, file)
      },
      onSuccess(files) {
        this.$emit('success', this.bizId, files)
        this.uploadDone(null, this.bizId, files)
      },
      async onChange(e) {
        this.$emit('change', [])
        if (!this.beforeUpload) {
          this.startUpload()
        } else {
          this.beforeUpload(uploadDone => this.startUpload(uploadDone))
        }
      },
      // 开始上传
      async startUpload(uploadDone = () => {}) {
        this.uploadDone = uploadDone
        this.bizCode = this.code
        // 没有传入bizId就获取bizId
        if (!this.bizId && !this.id) {
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
