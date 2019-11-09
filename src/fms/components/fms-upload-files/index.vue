<template>
  <div
    class="fms-upload-files el-input__inner"
    :class="{'fms-upload-files-tags__empty': files.length === 0, 'fms-upload-files-loading': loadingText }"
  >
    <div class="fms-upload-files-tags">
      <span class="fms-upload-files-loading-text">{{loadingText}}</span>
      <el-tag
        v-for="file in files"
        :key="file.id"
        :size="'small'"
        :title="file.name"
        :closable="!disabled && closable"
        @close="onClose(file)"
      >{{ file.name }}</el-tag>
    </div>
    <div class="fms-upload-files-btns">
      <fms-upload
        v-bind="$attrs"
        :code="bizCode"
        :uniqueId="!append"
        :btnText="''"
        :btnType="'primary'"
        :btnIcon="'iconfont icon-plus'"
        @error="uploadError"
        @change="uploadChange"
        @success="uploadSuccess"
      ></fms-upload>
    </div>
  </div>
</template>

<script>
  import { delFilesByIds } from '@/fms/utils'
  import FmsUpload from '../fms-upload'
  export default {
    props: {
      bizCode: String,
      append: Boolean,
      value: { type: Array, default: () => [] },
      closable: { type: Boolean, default: true },
      disabled: { type: Boolean, default: false }
    },
    components: { FmsUpload },
    data() {
      return {
        files: this.value || [],
        loadingText: ''
      }
    },
    watch: {
      value(files, oldFiles) {
        this.files = files || []
        this.loadingText = ''
        if (this.files.length === 0 && oldFiles && oldFiles.length > 0) {
          delFilesByIds(oldFiles.map(file => file.id, false))
        }
        this.$emit('change', files)
      }
    },
    methods: {
      async onClose(file) {
        try {
          await this.$confirm('确定删除该文件?', '提示')
          await delFilesByIds(file.id)
          this.$message.success('文件删除成功!')
          const files = this.value.filter(f => f !== file)
          this.$emit('input', files)
          this.$emit('change', files)
        } catch (e) {
          console.error(e)
        }
      },
      uploadChange(files) {
        this.$emit('uploadingStart', files)
        if (!this.append) {
          this._files = this.files
          this.files = []
          this.loadingText = '文件上传中...'
        }
      },
      uploadError(err, file) {
        this.loadingText = ''
        this.files = this._files
        this.$emit('uploadingError', err, file)
      },
      uploadSuccess(bizId, files) {
        this.loadingText = ''
        this.$emit('input', files)
        this.$emit('uploadingSuccess', files)
        // 若不是追加,那么就删除之前上传的文件
        if (!this.append && this._files && this._files.length > 0) {
          delFilesByIds(this._files.map(file => file.id), false)
        }
      }
    }
  }
</script>

<style lang="scss">
  .fms-upload-files.el-input__inner {
    display: flex;
    align-items: center;
    height: auto;
    min-height: 28px;
    padding: 0px 4px;
    padding-top: 1px;
    line-height: 10px;
    flex: 1;
    margin-right: 4px;
    .el-tag {
      margin-right: 4px;
      margin-bottom: 1px;
    }
    .fms-upload-files-tags {
      flex: 1;
      overflow: hidden;
      span.el-tag {
        margin-right: 0;
        margin-left: 0;
        max-width: calc(100% - 4px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: relative;
        padding-right: 22px;
        i.el-icon-close {
          position: absolute;
          top: 5px;
          right: 4px;
          font-size: 14px;
        }
      }
    }
    &.fms-upload-files-tags__empty {
      .el-button.el-button.el-button {
        margin-bottom: 1px;
      }
    }
    .el-button.el-button.el-button {
      min-width: 32px;
      margin-bottom: 1px;
    }
    .fms-upload-files-btns .el-button {
      height: 24px;
      padding: 4px 10px;
      span {
        margin-right: 0;
        margin-left: 0;
      }
    }
    .fms-upload-files-loading-text {
      display: none;
      color: #c4c8cf;
      font-size: 12px;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      line-height: 28px;
      padding-left: 10px;
      background-color: #cccccc63;
      border-radius: 2px;
      user-select: none;
      cursor: not-allowed;
    }
    &.fms-upload-files-loading:hover {
      border-color: #d2d2d6;
    }
    &.fms-upload-files-loading .fms-upload-files-loading-text {
      display: block;
    }
  }
</style>
