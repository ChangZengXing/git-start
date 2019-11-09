<template>
  <fms-kye-image
    ref="kyeImage"
    class="fms-image-block"
    v-loading="loading"
    :config="kyeImageConfig"
    :pdfViewer="pdfViewer"
    @prevImge="onPrevImge"
    @nextImge="onNextImge"
  >
    <template slot="topbtn">
      <div v-if="imageBlockParams.opreation" class="fms-image-block-btns">
        <fms-upload
          v-show="buttonList.includes('add') || buttonList.includes('upload')"
          :id="bizId"
          :limit="limit"
          :code="bizCode"
          :successMsg="''"
          :btnType="'text'"
          :accept="accept"
          :multiple="multiple"
          :beforePick="beforePick"
          :auth="buttonAuth.upload"
          :limitMessage="limitMessage"
          :acceptImageTypes="acceptImageTypes"
          :btnIcon="'iconfont icon-fms-shangchuan'"
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
      <div v-if="!imageBlockParams.opreation && !showUploadTime" class="fms-image-block-btns">
        <kye-button
          type="text"
          icon="iconfont icon-fms-xiazai"
          :disabled="kyeImageConfig['imgSrc'].length === 0"
          @click="downloadImg"
        >下载</kye-button>
      </div>
      <span class="fms-image-block-uploadTime" v-if="showUploadTime">{{uploadTime}}</span>
    </template>
  </fms-kye-image>
</template>

<script>
  import FmsUpload from '../fms-upload'
  import FmsKyeImage from '../fms-kye-image'
  import { BIZCODE } from '@/fms/config'
  import { trim, orderBy, toString, xorBy, differenceBy } from 'lodash'
  import { to, dp, filter, toNumber, delFilesByIds, getFilesByBizId } from '@/fms/utils'

  export default {
    props: { args: Object },
    components: { FmsUpload, FmsKyeImage },
    data() {
      return {
        loading: false,
        multiple: true,
        limit: undefined,
        imageAlign: '',
        maxUploads: undefined,
        limitMessage: undefined,
        uploadTime: '',
        sortByDate: true,
        pdfViewer: 'fms-pdf-embed',
        showUploadTime: false,
        imageResponseType: '',
        kyeImageConfig: {
          width: 708,
          height: 400,
          imgSrc: []
        },
        imageBlockParams: {},
        // 业务id
        bizId: '',
        bizCode: BIZCODE,
        // 图片
        images: [],
        buttonAuth: {},
        accept: ['image'],
        acceptImageTypes: [],
        buttonList: ['upload', 'download', 'delete']
      }
    },
    methods: {
      async open(imageBlockParams) {
        console.log('fms-images-block open', imageBlockParams)
        this.delImages = []
        this.oriImages = []
        this.diffImages = []
        this.imageBlockParams = {
          bizCode: BIZCODE,
          opreation: true,
          delFileNotEmpty: false,
          delFileFromServer: true,
          delSuccessMsg: '文件删除成功!',
          delFileNotEmptyMsg: '不可全部删除!',
          ...imageBlockParams
        }
        const {
          bizId,
          width,
          index,
          height,
          accept,
          images,
          bizCode,
          multiple,
          imageSize,
          pdfViewer,
          buttonList,
          buttonAuth,
          imageAlign,
          maxUploads,
          imagesDiff,
          limitMessage,
          showUploadTime,
          fileListApiCode,
          fileListApiArgs,
          fileListApiDiff,
          fileListLoadedFn,
          acceptImageTypes,
          imageResponseType,
          sortByDate = true,
          fileIdKey = 'id',
          fileUrlKey = 'url',
          fileOriginalName = 'name',
          fileExtendNameKey = 'extendName',
          fileUpdationDateKey = 'updationDate'
        } = this.imageBlockParams

        this.sortByDate = sortByDate

        this.fileIdKey = fileIdKey
        this.fileUrlKey = fileUrlKey
        this.fileOriginalName = fileOriginalName
        this.fileExtendNameKey = fileExtendNameKey
        this.fileUpdationDateKey = fileUpdationDateKey

        if (acceptImageTypes) {
          this.acceptImageTypes = acceptImageTypes
        }
        if (bizCode) {
          this.bizCode = bizCode
        }
        if (buttonAuth) {
          this.buttonAuth = buttonAuth
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
        }
        if (imageSize === 'small') {
          this.kyeImageConfig.width = 708
          this.kyeImageConfig.height = 400
        }
        if (width) {
          this.kyeImageConfig.width = toNumber(width)
        }
        if (height) {
          this.kyeImageConfig.height = toNumber(height)
        }
        if (imageResponseType) {
          this.imageResponseType = imageResponseType
        }
        if (buttonList) {
          this.buttonList = buttonList
        }
        if (pdfViewer) {
          this.pdfViewer = pdfViewer
        }
        // images 存在,不发请求
        if (images && images.length > 0) {
          this.mapImageKey(images, false)
          this.oriImages = dp(images)
          if (bizId) {
            this.bizId = bizId
            if (imagesDiff) {
              try {
                this.loading = true
                // 是否需要根据文件中心bizId比对
                const files = await getFilesByBizId(bizId, bizCode)
                if (files && files.length > 0) {
                  this.mapImageKey(files, true)
                  // diffImages是文件中心服务器同后端外部传入图片进行比较 文件中心服务器多出的文件
                  this.diffImages = differenceBy(files, images, this.fileIdKey)
                  // 删除文件中心文件列表和fms这边列表不一致的文件
                  if (this.diffImages.length > 0) {
                    delFilesByIds(this.diffImages.map(img => img[this.fileIdKey]))
                  }
                }
              } catch (e) {
                console.error(e)
              } finally {
                this.loading = false
              }
            }
          }
          return this.updateImages(images, index)
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
          this.updateImages([{ url: this.bizId }], index)
        } else {
          try {
            this.loading = true
            this.bizId = bizId
            // 清空缓存图片
            this.clearImages()
            // 通过业务id 业务编码 获取图片 获取图片列表
            let images = null
            if (fileListApiCode) {
              // 是否需要和文件中心那边的文件列表进行比对
              if (fileListApiDiff && fileListApiCode !== 'file.getByBizCodeAndBizId') {
                const [imagesList0, imagesList1] = await Promise.all([
                  getFilesByBizId(bizId, bizCode),
                  this.$http(fileListApiCode, { bizId, bizCode, ...fileListApiArgs })
                ])

                if (imagesList0 && imagesList1) {
                  this.mapImageKey(imagesList0, true)
                  this.mapImageKey(imagesList1, false)

                  // diffImages是文件中心服务器同后端外部接口比较 文件中心服务器多出的文件
                  this.diffImages = differenceBy(imagesList0, imagesList1, this.fileIdKey)

                  console.log('this.diffImages', this.diffImages)

                  // 最终是取外部接口(不是文件服务器)返回的文件数据
                  images = imagesList1

                  // 删除文件中心文件列表和fms这边列表不一致的文件
                  // 这里一定要注意 imagesList1.length 要大于 0 才可以删除
                  if (this.diffImages.length > 0 && imagesList1.length > 0) {
                    delFilesByIds(this.diffImages.map(img => img[this.fileIdKey]))
                  }
                }
              } else {
                images = await this.$http(fileListApiCode, { bizId, bizCode, ...fileListApiArgs })
                this.mapImageKey(images, false)
              }
            } else {
              // 从文件服务器获取列表
              images = await getFilesByBizId(bizId, bizCode)
              this.mapImageKey(images, true)
              // 对文件服务器获取的列表进行排序(按照上传日期进行排序,最新上传的文件放最前面)
              images = orderBy(images, [this.fileUpdationDateKey], ['desc'])
            }
            if (images) {
              this.oriImages = dp(images)
              this.updateImages(images, index)
              if (fileListLoadedFn) {
                fileListLoadedFn(images)
              }
              this.$emit('update', images)
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
          const { prevFn } = this.imageBlockParams
          if (prevFn) {
            prevFn(img, index - 1)
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
          const { nextFn } = this.imageBlockParams
          if (nextFn) {
            nextFn(img, index - 1)
          }
          if (this.showUploadTime) {
            this.uploadTime = '上传时间: ' + filter.time(img.updationDate)
          }
        }
      },
      getImageModel() {
        const { bizId, bizCode, images, delImages, oriImages } = this
        // 文件是否有变化(包括新增,删除)
        const xorImages = xorBy(images, oriImages, this.fileIdKey)
        // 新上传的文件(新上传的文件id都不同, 这是新上传到文件服务器的文件,包括用户前端本地标记删除的文件)
        const uploadImages = xorBy([...images, ...delImages], oriImages, this.fileIdKey)
        // 新上传的文件中需要排除掉标记为删除的文件(这是用户实际新增的文件)
        const addImages = differenceBy(uploadImages, delImages, this.fileIdKey)

        const imageModel = {
          bizId,
          images,
          bizCode,
          xorImages,
          delImages,
          addImages,
          uploadImages
        }
        return dp(imageModel)
      },
      mapImageKey(images, fromFileServer) {
        images.forEach(img => {
          if (fromFileServer) {
            img._$_id = img.id
            if (this.fileIdKey !== 'id') {
              img[this.fileIdKey] = img.id
              img.id = undefined
            }
          } else {
            if (Array.isArray(this.fileUrlKey)) {
              img.url = img[this.fileUrlKey[0]] || img[this.fileUrlKey[1]]
            } else {
              img.url = img[this.fileUrlKey]
            }
            if (Array.isArray(this.fileExtendNameKey)) {
              img.extendName = img[this.fileExtendNameKey[0]] || img[this.fileExtendNameKey[1]]
            } else {
              img.extendName = img[this.fileExtendNameKey]
            }
            if (Array.isArray(this.fileOriginalName)) {
              img.originalName = img[this.fileOriginalName[0]] || img[this.fileOriginalName[1]]
            } else {
              img.originalName = img[this.fileOriginalName]
            }

            img.updationDate = img[this.fileUpdationDateKey]
          }
        })
      },
      setLoading(loading = true) {
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
      updateImages(images, index = 0) {
        this.images = images || []

        console.log('updateImages', this.images)

        if (typeof this.images[0] === 'object') {
          this.images.forEach(img => (img.src = img.url || ''))
        }

        this.kyeImageConfig.index = index
        this.kyeImageConfig.imgSrc = this.images

        return this.images
      },
      beforePick(startUpload) {
        console.log('fms-image-block beforePick')
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
          updateFn,
          deleteFn,
          delSuccessMsg,
          delFileNotEmpty,
          delFileFromServer,
          delFileNotEmptyMsg
        } = this.imageBlockParams

        const { bizId, bizCode } = this

        if (delFileNotEmpty && this.images.length === 1) {
          return delFileNotEmptyMsg && this.$message.warning(delFileNotEmptyMsg)
        }

        const [cancel] = await to(this.$confirm('确认删除?', '提示'))

        if (cancel) return

        try {
          // 获取当前显示图片(将要删除的图片)
          const curDelIndex = this.$refs.kyeImage.currentIndex - 1

          const curDelImage = this.images[curDelIndex]

          const images = this.images.filter(
            img => img[this.fileIdKey] !== curDelImage[this.fileIdKey]
          )
          // 获取删除后显示文件index
          const curShowIndex = images[curDelIndex] ? curDelIndex : Math.max(curDelIndex - 1, 0)
          // 获取删除后显示文件
          const curShowImage = images[curShowIndex] || {}

          const loading = this.setLoading

          if (deleteFn) {
            const index = curDelIndex
            const image = curDelImage
            const res = deleteFn({ bizId, bizCode, index, image, images, loading })

            if (res === false) return

            if (delFileFromServer) {
              this.loading = true
              await delFilesByIds(curDelImage[this.fileIdKey])
              delSuccessMsg && this.$message.success(delSuccessMsg)
            }
          }

          this.delImages.push(curDelImage)

          const index = curShowIndex
          const image = curShowImage
          if (updateFn) {
            updateFn({ bizId, bizCode, index, image, images, loading })
          }
          this.updateImages(images, index)
          this.$emit('update', images)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      uploadChange(files) {
        this.loading = true
        console.log('fms-image-block:uploadChange', files)
      },
      uploadError(err, file) {
        this.loading = false
        console.log('fms-image-block:uploadError', err)
      },
      uploadSuccess(bizId, images) {
        this.bizId = bizId
        this.loading = false
        const { bizCode } = this
        const {
          updateFn,
          fileListApiCode,
          delFileFromServer,
          uploadSuccessMsg = '文件上传成功!'
        } = this.imageBlockParams

        this.mapImageKey(images, true)

        // 处理报销票据与OCR识别图片列表一致性 只有该业务场景这么处理
        if (fileListApiCode === 'ers.expenseFile.getFileList') {
          images = differenceBy(images, this.diffImages, this.fileIdKey)
        }

        // 需要排除掉删除的图片(因为每次本地删除的话,每一次上传成功,都会获取到文件中心返回的图片列表)
        if (!delFileFromServer) {
          images = differenceBy(images, this.delImages, this.fileIdKey)
        }

        // 根据文件id选出新上传的文件 images 中有, 而 this.images 没有
        let newImages = differenceBy(images, this.images, this.fileIdKey)

        // 只处理新上传的文件按照上传日期排序
        if (newImages.length > 0 && this.sortByDate) {
          newImages = orderBy(newImages, [this.fileUpdationDateKey], ['desc'])
        }

        console.log('fms-image-block:uploadSuccess newImages', newImages)
        console.log('fms-image-block:uploadSuccess delImages', this.delImages)

        images = [...newImages, ...this.images]

        console.log('fms-image-block:uploadSuccess images', images)

        uploadSuccessMsg && this.$message.success(uploadSuccessMsg)

        if (updateFn) {
          const index = 0
          const image = images[index]
          const loading = this.setLoading
          updateFn({ bizId, bizCode, index, image, images, loading })
        }
        this.updateImages(images)
        this.$emit('update', images)
      }
    }
  }
</script>

<style lang="scss">
  // in dialog
  .el-dialog__body .fms-image-block {
    .btn-icon {
      padding-top: 0;
      margin-top: -6px;
    }
  }
  .fms-image-block {
    .fms-image-block-btns {
      flex: 1;
      text-align: right;
      position: relative;
    }
  }
</style>
