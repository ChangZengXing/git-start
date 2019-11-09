<template>
  <fms-dialog
    class="fms-dialog-image"
    :class="{
      'fms-dialog-image-align-top': imageAlign === 'top',
      'fms-dialog-image-footer': dialogParams.showDialogFooter,
      'fms-dialog-image-responsive-width': imageResponseType === 'width',
      'fms-dialog-image-responsive-height': imageResponseType === 'height'
     }"
    :loading="loading"
    v-bind="dialogOptions"
    v-on="$listeners"
  >
    <!-- 兼容固定头部显示的信息 -->
    <slot v-if="dialogParams.headerShow" name="fixed-header"></slot>
    <section class="fms-dialog-image-wrapper" :style="`margin-top: ${dialogParams.fixedHeaderTop || 0}px`">
      <fms-kye-image
        ref="kyeImage"
        :config="kyeImageConfig"
        :pdfViewer="pdfViewer"
        @prevImge="onPrevImge"
        @nextImge="onNextImge"
      >
        <template slot="topbtn">
          <div v-if="dialogParams.opreation" class="fms-dialog-image-btns">
            <fms-upload
              v-show="buttonList.includes('add') || buttonList.includes('upload')"
              :id="bizId"
              :code="bizCode"
              :limit="limit"
              :limitMessage="limitMessage"
              :btnType="'text'"
              :accept="accept"
              :acceptImageTypes="acceptImageTypes"
              :successMsg="''"
              :multiple="multiple"
              :btnIcon="'iconfont icon-fms-shangchuan'"
              :beforePick="beforePick"
              :auth="buttonAuth.upload"
              @exceed="onExceed"
              @error="uploadError"
              @change="uploadChange"
              @success="uploadSuccess"
            />
            <kye-button
              v-show="buttonList.includes('download')"
              type="text"
              @click="downloadImg"
              :disabled="kyeImageConfig['imgSrc'].length === 0"
              icon="iconfont icon-fms-xiazai"
              :auth="buttonAuth.download"
            >下载</kye-button>
            <kye-button
              v-show="buttonList.includes('delete')"
              type="text"
              @click="deleteImg"
              :disabled="kyeImageConfig['imgSrc'].length === 0"
              icon="iconfont icon-delete"
              :auth="buttonAuth.delete"
            >删除</kye-button>
            <slot name="btn"></slot>
          </div>
          <div v-if="!dialogParams.opreation && !showUploadTime" class="fms-dialog-image-btns">
            <kye-button
              type="text"
              icon="iconfont icon-fms-xiazai"
              :disabled="kyeImageConfig['imgSrc'].length === 0"
              @click="downloadImg"
            >下载</kye-button>
          </div>
          <span class="fms-dialog-image-uploadTime" v-if="showUploadTime">{{uploadTime}}</span>
        </template>
      </fms-kye-image>
      <div class="fms-dialog-image-slot">
        <slot></slot>
      </div>
    </section>
    <slot name="button"></slot>
    <template slot="footer">
      <slot name="footer">
        <kye-row v-if="dialogParams.showDialogFooter" type="flex" justify="end" style="margin: 0">
          <kye-button
            type="primary"
            hotkey="ctrl+s"
            @click="dialogSubmit"
            :auth="buttonAuth.save"
          >保存(S)</kye-button>
          <kye-button @click="dialogClose(true)">取消</kye-button>
        </kye-row>
      </slot>
    </template>
  </fms-dialog>
</template>

<script>
  import FmsUpload from '../fms-upload'
  import FmsDialog from '../fms-dialog'
  import FmsKyeImage from '../fms-kye-image'
  import { BIZCODE } from '@/fms/config'
  import { trim, unionBy, orderBy, toString, xorBy, differenceBy } from 'lodash'
  import { to, dp, filter, toNumber, getFilesByBizId, delFilesByIds } from '@/fms/utils'

  export default {
    props: { args: Object },
    components: { FmsDialog, FmsUpload, FmsKyeImage },
    data() {
      return {
        loading: false,
        multiple: true,
        limit: undefined,
        limitMessage: undefined,
        maxUploads: undefined,
        imageAlign: '',
        uploadTime: '',
        sortByDate: true,
        pdfViewer: 'fms-pdf-embed',
        showUploadTime: false,
        imageResponseType: '',
        dialogOptions: {
          title: '',
          width: '740px',
          modal: true,
          visible: false,
          beforeClose: () => this.dialogClose(true)
        },
        kyeImageConfig: {
          width: 708,
          height: 400,
          imgSrc: []
        },
        dialogParams: {},
        // 业务id
        bizId: '',
        bizCode: BIZCODE,
        // 图片
        images: [],
        buttonList: ['upload', 'download', 'delete'],
        accept: ['image'],
        acceptImageTypes: [],
        buttonAuth: {}
      }
    },
    methods: {
      async open(dialogParams) {
        console.log('fms-dialog-images open', dialogParams)
        this.delImages = []
        this.oriImages = []
        this.diffImages = []
        this.dialogParams = {
          bizCode: BIZCODE,
          opreation: true,
          delSuccessMsg: '文件删除成功!',
          delFileFromServer: true,
          showDialogFooter: false,
          dialogCloseWarning: false,
          dialogCloseWarningText: '有修改操作(上传或删除), 确定不保存?',
          delFileNotEmpty: false,
          delFileNotEmptyMsg: '不可全部删除!',
          ...dialogParams
        }
        const {
          bizId,
          bizCode,
          width,
          height,
          accept,
          position,
          multiple,
          imageSize,
          imageAlign,
          maxUploads,
          limitMessage,
          modal = true,
          showUploadTime,
          imageResponseType,
          buttonList,
          images,
          sortByDate = true,
          title = '文件预览',
          dialogOptions,
          pdfViewer,
          buttonAuth,
          fileListApiCode,
          fileListApiArgs,
          acceptImageTypes
        } = this.dialogParams
        this.dialogOptions.title = title
        this.dialogOptions.modal = modal
        // 兼容按钮处显示 统计栏
        this.dialogOptions.showStatistics = dialogParams.showStatistics || {}
        this.sortByDate = sortByDate
        if (acceptImageTypes) {
          this.acceptImageTypes = acceptImageTypes
        }
        if (bizCode) {
          this.bizCode = bizCode
        }
        if (buttonAuth) {
          this.buttonAuth = buttonAuth
        }
        if (position) {
          this.dialogOptions.position = position
        }
        if (Array.isArray(accept)) {
          this.accept = accept
        }
        if (imageAlign) {
          this.imageAlign = imageAlign
        }
        if (multiple !== undefined) {
          this.multiple = multiple
        }
        if (maxUploads) {
          // 最多上传一个文件时, 设置为只可以进行单选操作
          if (maxUploads === 1) {
            this.multiple = false
          }
          this.maxUploads = maxUploads
        }
        if (limitMessage) {
          this.limitMessage = limitMessage
        }
        if (showUploadTime) {
          this.showUploadTime = showUploadTime
        }
        if (imageSize === 'big') {
          this.kyeImageConfig.width = 808
          this.kyeImageConfig.height = 444
          this.dialogOptions.width = 808 + 32 + 'px'
        }
        if (imageSize === 'small') {
          this.kyeImageConfig.width = 708
          this.kyeImageConfig.height = 400
          this.dialogOptions.width = 708 + 32 + 'px'
        }
        if (width) {
          this.kyeImageConfig.width = toNumber(width)
          this.dialogOptions.width = toNumber(width) + 32 + 'px'
        }
        if (height) {
          this.kyeImageConfig.height = toNumber(height)
        }
        if (imageResponseType) {
          this.imageResponseType = imageResponseType
        }
        if (dialogOptions) {
          Object.assign(this.dialogOptions, dialogOptions)
        }
        if (buttonList) {
          this.buttonList = buttonList
        }
        if (pdfViewer) {
          this.pdfViewer = pdfViewer
        }

        this.dialogOpen()

        // images 存在,不发请求
        if (images && images.length) {
          this.oriImages = dp(images)
          return this.updateImages(images, true)
        }
        // bizId不存在 清空图片
        if (trim(bizId) === '') {
          return this.clearImages()
        }
        // bizId相同 缓存
        if (this.bizId === bizId) {
          return
        }
        if (toString(bizId).startsWith('http')) {
          this.bizId = bizId
          this.updateImages([{ url: this.bizId }], true)
        } else {
          try {
            this.loading = true
            this.bizId = bizId
            // 清空缓存图片
            this.clearImages()
            // 通过业务id 业务编码 获取图片 获取图片列表
            let images = null
            if (fileListApiCode) {
              // 报销票据, OCR业务需要和文件中心列表比较
              if (fileListApiCode === 'ers.expenseFile.getFileList') {
                const [imagesList0, imagesList1] = await Promise.all([
                  getFilesByBizId(bizId, bizCode),
                  this.$http(fileListApiCode, {
                    bizId,
                    bizCode,
                    ...fileListApiArgs
                  })
                ])
                if (imagesList0 && imagesList1) {
                  imagesList1.forEach(img => {
                    if (img.fileId) {
                      img._id = img.id
                      img.id = img.fileId
                      if (img.uploadTime) {
                        img.updationDate = filter.time(img.uploadTime)
                      }
                    }
                  })

                  this.diffImages = differenceBy(imagesList0, imagesList1, 'id')

                  console.log('this.diffImages', this.diffImages)

                  images = imagesList1

                  // 删除文件中心文件列表和fms这边列表不一致的文件
                  // 这里一定要注意 imagesList1.length 要大于 0 才可以删除
                  if (this.diffImages.length > 0 && imagesList1.length > 0) {
                    delFilesByIds(this.diffImages.map(img => img.id))
                  }
                }
              } else {
                images = await this.$http(fileListApiCode, {
                  bizId,
                  bizCode,
                  ...fileListApiArgs
                })
                if (images && fileListApiCode !== 'file.getByBizCodeAndBizId') {
                  images.forEach(img => {
                    if (img.fileId) {
                      img._id = img.id
                      img.id = img.fileId
                      if (img.uploadTime) {
                        img.updationDate = filter.time(img.uploadTime)
                      }
                    }
                  })
                }
              }
            } else {
              // 从文件服务器获取列表
              images = await getFilesByBizId(bizId, bizCode)
            }
            if (images) {
              images.forEach(img => (img._oriId = img._id || img.id))

              this.oriImages = dp(images)

              this.updateImages(images, true)
            }
          } catch (e) {
            console.error(e)
          } finally {
            this.loading = false
          }
        }
      },
      onPrevImge(index) {
        console.log('onPrevImge', index)
        if (this.images.length) {
          const img = this.images[index - 1]
          const { onPrevImgeFn } = this.dialogParams
          if (onPrevImgeFn) {
            onPrevImgeFn(img, index - 1)
          }
          if (this.showUploadTime) {
            this.uploadTime = '上传时间: ' + filter.time(img.updationDate)
          }
        }
      },
      onNextImge(index) {
        console.log('onNextImge', index)
        if (this.images.length > 1) {
          const img = this.images[index - 1]
          const { onNextImgeFn } = this.dialogParams
          if (onNextImgeFn) {
            onNextImgeFn(img, index - 1)
          }
          if (this.showUploadTime) {
            this.uploadTime = '上传时间: ' + filter.time(img.updationDate)
          }
        }
      },
      dialogOpen() {
        console.log('dialogOpen')
        this.dialogOptions.visible = true
      },
      async dialogClose(warning = true) {
        try {
          const {
            onCancel,
            showDialogFooter,
            dialogCloseWarning,
            dialogCloseWarningText
          } = this.dialogParams

          const { bizId, bizCode, images, delImages, oriImages } = this
          // 文件是否有变化(包括新增,删除)
          const xorImages = xorBy(images, oriImages, 'id')
          // 新上传的文件(新上传的文件id都不同, 这是新上传到文件服务器的文件,包括用户前端本地标记删除的文件)
          const uploadImages = xorBy([...images, ...delImages], oriImages, 'id')
          // 新上传的文件中需要排除掉标记为删除的文件(这是用户实际新增的文件)
          const addImages = differenceBy(uploadImages, delImages, 'id')
          if (
            warning &&
            showDialogFooter &&
            dialogCloseWarning &&
            dialogCloseWarningText &&
            oriImages.length > 0 &&
            xorImages.length > 0 &&
            typeof oriImages[0] === 'object'
          ) {
            await this.$confirm(dialogCloseWarningText, '提示')
          }

          const cancelModel = {
            bizId,
            images,
            bizCode,
            delImages,
            addImages,
            uploadImages,
            dialog: {
              loading: this.dialogLoading,
              // 注意这里的循环调用
              // close: () => this.dialogClose(false)
              close: () => (this.dialogOptions.visible = false)
            }
          }

          console.log('fmsDialogImageClose, cancelModel', cancelModel)

          if (onCancel && showDialogFooter) {
            return onCancel(cancelModel)
          }

          this.dialogOptions.visible = false
        } catch (e) {
          console.error(e)
        }
      },
      dialogSubmit() {
        const { onSubmit, showDialogFooter } = this.dialogParams
        const { bizId, bizCode, images, delImages, oriImages } = this
        // 文件是否有变化(包括新增,删除)
        const xorImages = xorBy(images, oriImages, 'id')
        // 新上传的文件(新上传的文件id都不同, 这是新上传到文件服务器的文件,包括用户前端本地标记删除的文件)
        const uploadImages = xorBy([...images, ...delImages], oriImages, 'id')
        // 新上传的文件中需要排除掉标记为删除的文件(这是用户实际新增的文件)
        const addImages = differenceBy(uploadImages, delImages, 'id')

        // 文件没有变化(没有新上传/删除的文件)
        if (xorImages.length === 0 && delImages.length === 0) {
          return (this.dialogOptions.visible = false)
        }

        const submitModel = {
          bizId,
          images,
          bizCode,
          delImages,
          addImages,
          uploadImages,
          dialog: { loading: this.dialogLoading, close: () => (this.dialogOptions.visible = false) }
        }

        console.log('fmsDialogImage onSubmit', submitModel)

        if (onSubmit && showDialogFooter) {
          onSubmit(submitModel)
        }
      },
      dialogLoading(loading = true) {
        this.loading = !!loading
        if (typeof loading !== 'string') {
          this.loadingText = ''
        } else {
          this.loadingText = loading
        }
      },
      clearImages() {
        this.images = []
        this.delImages = []
        this.oriImages = []
        this.diffImages = []
        this.kyeImageConfig.imgSrc = []
      },
      updateImages(images, remove = false, index) {
        images = images || []
        images = remove ? images : unionBy(this.images, images, 'id')

        if (images.length > 1 && this.sortByDate) {
          images = orderBy(images, ['updationDate'], ['desc'])
        }
        if (this.showUploadTime && images[0] && images[0].updationDate) {
          this.uploadTime = '上传时间: ' + filter.time(images[0].updationDate)
        }

        this.images = images

        if (typeof images[0] === 'object') {
          this.kyeImageConfig.imgSrc = this.images.map(img => ({ ...img, src: img.url || '' }))
        } else {
          this.kyeImageConfig.imgSrc = images
        }

        if (index !== undefined) {
          this.kyeImageConfig.index = index
        }
      },
      beforePick(startUpload) {
        console.log('fms-dialog-image beforePick')
        // 判断最大的上传文件数
        if (this.maxUploads) {
          if (this.images.length >= this.maxUploads) {
            return this.$message.warning(`最多可上传${this.maxUploads}个文件`)
          }
          // 若是多选
          if (this.multiple) {
            this.limit = this.maxUploads - this.images.length
          }
        }
        setTimeout(() => {
          startUpload()
        }, 0)
      },
      // 超出 limit 限制
      onExceed(files, fileList) {
        this.loading = false
        console.log('fmsDialogImage onExceed', files)
        const limitMessage = `本次最多还可上传${this.limit}个文件`
        // 有filesList 表示来自el-upload的onExceed事件
        if (fileList) {
          return this.$message.warning(limitMessage)
        }
        this.limitMessage = limitMessage
      },
      downloadImg() {
        // 获取当前显示文件索引
        const curIndex = this.$refs.kyeImage.currentIndex - 1
        const curImage = this.kyeImageConfig.imgSrc[curIndex]
        window.erpOpen(typeof curImage === 'string' ? curImage : curImage.src)
      },
      async deleteImg() {
        // 是否只是本地删除,默认是从文件服务器中删除
        const {
          onDelImgeFn,
          delSuccessMsg,
          delFileNotEmpty,
          showDialogFooter,
          delFileFromServer,
          delFileNotEmptyMsg
        } = this.dialogParams

        if (delFileNotEmpty && this.images.length === 1) {
          return delFileNotEmptyMsg && this.$message.warning(delFileNotEmptyMsg)
        }

        const [cancel] = await to(this.$confirm('确认删除?', '提示'))

        if (cancel) return

        try {
          // 获取当前显示图片(将要删除的图片)
          const curDelIndex = this.$refs.kyeImage.currentIndex - 1
          const curDelImage = this.images[curDelIndex]
          if (delFileFromServer) {
            this.loading = true
            await delFilesByIds(curDelImage.id)
            delSuccessMsg && this.$message.success(delSuccessMsg)
          }

          const images = this.images.filter(img => img.id !== curDelImage.id)

          this.delImages.push(curDelImage)

          // 获取删除后显示文件index
          const curShowIndex = images[curDelIndex] ? curDelIndex : Math.max(curDelIndex - 1, 0)

          // 获取删除后显示文件
          const curShowImage = images[curShowIndex] || {}

          this.updateImages(images, true, curShowIndex)

          if (onDelImgeFn) {
            onDelImgeFn({ curDelIndex, curDelImage, curShowImage, curShowIndex, images })
          }

          // 如果图片全部删除 fix: 20958
          if (images.length === 0 && !showDialogFooter) {
            const { bizCode, onUpdate } = this.dialogParams
            onUpdate && onUpdate('', [], { bizCode, dialog: { loading: this.dialogLoading } })
          }
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      uploadChange(files) {
        this.loading = true
      },
      uploadError(err, file) {
        this.loading = false
        console.log('fmsDailogImageUploadError', err)
      },
      uploadSuccess(bizId, images) {
        console.log('fms-dialog-image-uploadSuccess', bizId, images, this.dialogParams)
        // !更新bizId
        this.bizId = bizId
        this.loading = false

        const {
          bizCode,
          onUpdate,
          fileListApiCode,
          delFileFromServer,
          uploadSuccessMsg = '文件上传成功!'
        } = this.dialogParams

        // 处理报销票据与OCR识别图片列表一致性 只有该业务场景这么处理
        if (fileListApiCode === 'ers.expenseFile.getFileList') {
          images = differenceBy(images, this.diffImages, 'id')
        }

        // 需要排除掉删除的图片(因为每次本地删除的话,每一次上传成功,都会获取到文件中心返回的图片列表)
        if (!delFileFromServer) {
          images = differenceBy(images, this.delImages, 'id')
        }

        this.updateImages(images)

        uploadSuccessMsg && this.$message.success(uploadSuccessMsg)

        onUpdate && onUpdate(this.bizId, images, { bizCode, dialog: { loading: this.dialogLoading } })
      }
    },
    mounted() {
      this.args && this.open(this.args)
    }
  }
</script>

<style lang="scss">
  .fms-dialog-image {
    .imgbox {
      margin-left: auto;
      margin-right: auto;
    }
    .btn-icon.btn-icon {
      padding-top: 0;
    }
    .fms-dialog-image-btns {
      position: relative;
      flex: 1;
      text-align: right;
    }
  }
  .fms-dialog-image.fms-dialog-image-align-top {
    .imgbox {
      align-items: start;
    }
    .no-img {
      margin-top: 100px;
    }
  }
  .fms-dialog-image-uploadTime {
    display: inline-block;
    line-height: 28px;
    font-size: 12px;
    flex: 1;
    text-align: right;
  }
  .fms-dialog-image-responsive-width {
    .imgbox img {
      height: auto;
      max-width: 100%;
    }
  }
  .fms-dialog-image-responsive-height {
    .imgbox img {
      width: auto;
      max-height: 100%;
    }
  }
  .fms-dialog-image-wrapper {
    display: flex;
  }
  .fms-dialog-image-slot {
    flex: 1;
    margin-left: 4px;
  }
</style>
