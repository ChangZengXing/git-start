<template>
  <div class="fms-image" :class="{'fms-image-error': loadErr}">
    <kye-image
      class="fms-image-container"
      :class="{'fms-image-align-top': align === 'top'}"
      :config="config"
      ref="kyeImage"
    >
      <div class="fms-image-btn" slot="topbtn">
        <slot name="btn"></slot>
      </div>
    </kye-image>
    <div class="fms-image-reload" v-show="loadErr" v-loading="loading">
      <p class="el-alert--error">
        <i class="el-icon-error"></i> 加载失败!
      </p>
      <kye-button @click="loadImg">点击重新加载</kye-button>
    </div>
  </div>
</template>

<script>
  import { orderBy } from 'lodash'
  import { getFilesByBizId } from '@/fms/utils'
  export default {
    props: {
      align: String,
      bizId: String,
      errMsg: String,
      bizCode: String,
      width: { type: Number, default: 473 },
      height: { type: Number, default: 354 }
    },
    computed: {
      config() {
        return {
          width: this.width,
          height: this.height,
          imgSrc: this.imgSrc
        }
      }
    },
    data() {
      return {
        imgSrc: '',
        loadErr: false,
        loading: false
      }
    },
    watch: {
      bizId() {
        console.log('fms-image watch bizId', this.bizId)
        this.loadImg()
      }
    },
    methods: {
      async loadImg() {
        if (this.loadErr) {
          this.loading = true
        }
        this.loadErr = false
        if (!this.bizId) {
          this.imgSrc = ''
          this.loading = false
          return
        }
        this.imgSrc = ''
        if (this.bizId.startsWith('http')) {
          this.imgSrc = this.bizId
          this.loading = false
          return
        }
        try {
          console.log('------this.bizId-------', this.bizId, this.bizCode)
          let images = (await getFilesByBizId(this.bizId, this.bizCode, false)) || []
          // 按上传时间排序
          images = orderBy(images, ['updationDate'], ['desc'])
          this.imgSrc = images.map(file => file.url)
        } catch (e) {
          if (e) {
            this.loadErr = true
            const errMsg = this.errMsg || e.message || e.msg
            errMsg && this.$message.error(errMsg)
          }
          console.error(e)
        } finally {
          this.loading = false
        }
      }
    },
    created() {
      this.loadImg()
    }
  }
</script>

<style lang="scss">
  .fms-image {
    position: relative;
    .fms-image-container {
      height: 100%;
    }
    .fms-image-align-top {
      .imgbox {
        align-items: start;
        border: none;
      }
      .no-img {
        margin-top: 100px;
      }
    }
    .btn-icon .pager.pager {
      display: inline-flex;
      width: auto;
      align-items: center;
      cursor: pointer;
      padding: 0 0 0 10px;
      height: 28px;
      padding-top: 2px;
      i {
        margin-top: 1px;
      }
    }
    .fms-image-reload {
      position: absolute;
      top: 1px;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #f1f1f5;
      button {
        margin-top: 12px;
      }
    }
    .fms-image-btn {
      flex: 1;
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
