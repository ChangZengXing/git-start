<template>
  <div
    class="waybill-compile_img noselect"
    :style="{width: imgConfig.width ? imgConfig.width + 'px' : '100%'}"
  >
    <div>
      <slot name="btn"></slot>
    </div>
    <div class="btn-icon" :style="{width: imgConfig.width ? imgConfig.width + 'px' : '100%'}">
      <kye-button type="text" @click="imgLeft" icon="iconfont icon-zuozhuan1">左转</kye-button>
      <kye-button type="text" @click="imgRight" icon="iconfont icon-youzhuan1">右转</kye-button>
      <kye-button type="text" @click="imgBig" icon="iconfont icon-fangda1">放大</kye-button>
      <kye-button type="text" @click="imgSmall" icon="iconfont icon-suoxiao1">缩小</kye-button>
      <kye-button type="text" @click="imgRestore" icon="iconfont icon-huanyuan">还原</kye-button>
      <template v-if="imgConfig.btns && imgConfig.btns.length > 0">
        <kye-button
          type="text"
          v-for="(item, index) in imgConfig.btns"
          :key="index"
          :icon="item.icon ? 'iconfont ' + item.icon : ''"
          @click="() => {item.click && item.click()}"
        >{{item.label}}</kye-button>
      </template>
      <span class="pager" v-if="(imgConfig.imgSrc && typeof imgConfig.imgSrc === 'object')">
        <i class="iconfont icon-previous" @click="prevImge">&nbsp;</i>
        {{currentIndex}}&nbsp;/&nbsp;{{imgConfig.imgSrc.length}}&nbsp;
        <i
          class="iconfont icon-next"
          @click="nextImge"
        ></i>
      </span>
      <slot name="topbtn"></slot>
    </div>
    <div
      class="imgbox"
      ref="imgbox"
      v-loading="loading"
      :style="{width: imgConfig.width ? imgConfig.width + 'px' : '100%', height: imgConfig.height+'px'}"
    >
      <img
        width="100%"
        ondragstart="return false;"
        @mousedown="ticketMousedow"
        @mouseout="ticketMouseout"
        @mouseup="ticketMouseup"
        @mousewheel="ticketMousewheel"
        @mousemove="ticketMousemove"
        ref="ticketImg"
        v-show="!!loadImgSrc && isImg"
        :src="loadImgSrc"
      />

      <!-- embed 要求: Content-Disposition 不为 attachment -->
      <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition -->
      <!-- https://stackoverflow.com/questions/291813/recommended-way-to-embed-pdf-in-html -->
      <fms-pdf-embed
        v-if="pdfViewer === 'fms-pdf-embed'"
        v-show="!!loadImgSrc && isPdf"
        :src="isPdf ? loadImgSrc : ''"
        :width="imgConfig.width + 'px'"
        :height="imgConfig.height + 'px'"
      ></fms-pdf-embed>
      <fms-pdf
        ref="pdf"
        v-show="!!loadImgSrc && isPdf"
        v-if="pdfViewer === 'fms-pdf'"
        :url="isPdf ? loadImgSrc : ''"
        :width="imgConfig.width + 'px'"
        :height="imgConfig.height + 'px'"
      ></fms-pdf>
      <div v-show="!!loadImgSrc && !isImg && !isPdf" style="text-align: center;">
        <p style="margin-bottom: 12px;">
          <small>{{currentImage.originalName}}</small>
        </p>
        <h3>该文件不支持预览, 请下载后, 查看!</h3>
      </div>
      <div v-show="!loadImgSrc">
        <div class="no-img">
          <i class="iconfont icon-icon_magnifier"></i>
          <span class="no-img-txt">找不到图片</span>
        </div>
      </div>
    </div>
    <div class="bottomContent">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>
<script>
  import fmsPdf from '../fms-pdf'
  import fmsPdfEmbed from '../fms-pdf-embed'
  export default {
    name: 'fms-kye-image',
    components: { fmsPdf, fmsPdfEmbed },
    props: {
      pdfViewer: {
        type: String,
        default: 'fms-pdf-embed'
      },
      config: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {
        isImg: true,
        isPdf: false,
        isMove: false, // 标记是否移动事件
        lastStatus: {
          scale: 1,
          rotate: 0,
          translateX: 0,
          translateY: 0,
          mouseX: 0,
          mouseY: 0
        },
        loadImgSrc: '',
        currentIndex: 1,
        currentImage: {},
        loading: true,
        loadingError: false,
        imgConfig: {
          width: 0,
          height: 600,
          imgSrc: '',
          maxScale: 4.0, // 最大放大倍数
          minScale: 0.5, // 最小放大倍数
          step: 0.06 // 每次放大、缩小 倍数的变化值
        }
      }
    },
    methods: {
      initConfig() {
        this.imgConfig = { ...this.imgConfig, ...this.config }
        this.currentIndex = (this.imgConfig.index || 0) + 1
        let { imgSrc } = this.imgConfig
        if (imgSrc) {
          if (typeof imgSrc === 'string') {
            this.loadImgSrc = imgSrc
          } else if (Array.isArray(imgSrc)) {
            if (imgSrc.length === 0) {
              this.currentIndex = 0
              this.loadImgSrc = ''
            } else {
              this.setImgSrc(this.currentIndex - 1)
            }
          }
        } else {
          this.loadImgSrc = ''
        }
        this.loadImg(this.loadImgSrc)
      },
      setImgSrc(index) {
        let { imgSrc, urlKey } = this.imgConfig
        const img = imgSrc[index]
        console.log('setImgSrc', img, index)
        if (!img) {
          this.loadImgSrc = ''
          this.isImg = false
        }
        if (typeof img === 'string') {
          this.loadImgSrc = img
          this.isImg = true
        }
        if (typeof img === 'object') {
          this.currentImage = img || {}
          const imageURL = this.currentImage[urlKey] || this.currentImage.src || this.currentImage.url
          this.loadImgSrc = imageURL

          // 默认为 图片
          if (!this.currentImage.extendName) {
            this.isImg = true
            this.isPdf = false
          } else {
            // 某些手机上传的图片文件contentType为 application/octet-stream
            // 这里就不可以根据contentType判断是否为图片
            // this.isImg = (img.contentType || '').toLowerCase().startsWith('image')
            this.isImg =
              (this.currentImage.contentType || '').toLowerCase().startsWith('image') ||
              ['jpg', 'jpeg', 'png', 'bmp', 'HEIC', 'webp', 'tiff'].includes(
                (this.currentImage.extendName || '').toLowerCase()
              )
            this.isPdf =
              (this.currentImage.contentType || '').toLowerCase().includes('pdf') ||
              ['pdf'].includes((this.currentImage.extendName || '').toLowerCase())
          }
        }
        this.loadImg(this.loadImgSrc)
        return this.loadImgSrc
      },
      loadImg(imgSrc) {
        this.loading = true
        let img = new Image()
        img.src = imgSrc
        img.onload = () => {
          this.loading = false
          this.loadingError = false
        }
        img.onerror = imgSrc => {
          this.loading = false
          this.loadingError = true
        }
        this.imgRestore()
      },
      isMax() {
        let number =
          this.lastStatus.scale >= this.imgConfig.maxScale
            ? this.imgConfig.maxScale
            : this.lastStatus.scale + this.imgConfig.step
        return number
      },
      isMin() {
        let number =
          this.lastStatus.scale <= this.imgConfig.minScale
            ? this.imgConfig.minScale
            : this.lastStatus.scale - this.imgConfig.step
        return number
      },
      imgBig() {
        if (this.isImg) {
          this.lastStatus.scale = this.isMax()
          this.toTransfrom()
        }
        if (this.isPdf && this.$refs.pdf && this.$refs.pdf.restore) {
          this.$refs.pdf.zoomIn()
        }
      },
      imgSmall() {
        if (this.isImg) {
          this.lastStatus.scale = this.isMin()
          this.toTransfrom()
        }
        if (this.isPdf && this.$refs.pdf && this.$refs.pdf.restore) {
          this.$refs.pdf.zoomOut()
        }
      },
      toTransfrom() {
        let str =
          `translate3d(` +
          `${this.lastStatus.translateX}px,` +
          `${this.lastStatus.translateY}px,0.1px) scale3d(${this.lastStatus.scale},` +
          `${this.lastStatus.scale},0.0001) rotate(${this.lastStatus.rotate}deg)`
        this.ticketImg.style.transform = str
        this.ticketImg.style.webkitTransform = str
        this.ticketImg.style.msTransform = str
        this.ticketImg.style.omzTransform = str
      },
      imgLeft() {
        if (this.isImg) {
          this.lastStatus.rotate = parseInt(this.lastStatus.rotate / 90) * 90 - 90
          this.toTransfrom()
        }
      },
      imgRight() {
        if (this.isImg) {
          this.lastStatus.rotate = parseInt(this.lastStatus.rotate / 90) * 90 + 90
          this.toTransfrom()
        }
      },
      imgRestore() {
        if (this.isImg) {
          this.lastStatus = {
            scale: 1,
            rotate: 0,
            translateX: 0,
            translateY: 0
          }
          this.toTransfrom()
        }
        if (this.isPdf && this.$refs.pdf && this.$refs.pdf.restore) {
          this.$refs.pdf.restore()
        }
      },
      windowToCanvas(x, y) {
        var box = this.$refs.imgbox.getBoundingClientRect()
        return {
          x: x - box.left,
          y: y - box.top
        }
      },
      drawImgByMove(x, y) {
        this.lastStatus.translateX = this.lastStatus.translateX + (x - this.lastStatus.mouseX)
        this.lastStatus.translateY = this.lastStatus.translateY + (y - this.lastStatus.mouseY)
        this.lastStatus.mouseX = x
        this.lastStatus.mouseY = y
        this.toTransfrom()
      },
      ticketMousedow(e) {
        this.isMove = true
        this.$refs.imgbox.style.cursor = 'move'
        let box = this.windowToCanvas(e.clientX, e.clientY)
        this.lastStatus.mouseX = box.x
        this.lastStatus.mouseY = box.y
      },
      ticketMouseout(e) {
        this.isMove = false
        this.$refs.imgbox.style.cursor = 'default'
      },
      ticketMouseup(e) {
        this.isMove = false
        this.$refs.imgbox.style.cursor = 'default'
      },
      ticketMousemove(e) {
        if (this.isMove) {
          var box = this.windowToCanvas(e.clientX, e.clientY)
          this.drawImgByMove(box.x, box.y)
        }
      },
      ticketMousewheel(e) {
        e.preventDefault()
        if (e.wheelDelta > 0) {
          this.lastStatus.scale = this.isMax()
        } else {
          this.lastStatus.scale = this.isMin()
        }
        this.toTransfrom()
      },
      prevImge() {
        let { imgSrc } = this.imgConfig
        if (Array.isArray(imgSrc) && imgSrc.length === 0) {
          this.currentIndex = 0
          return
        }
        this.currentIndex -= 1
        if (this.currentIndex === 0) {
          this.currentIndex = 1
          return
        }
        this.lastStatus.rotate = 0
        this.toTransfrom()
        // this.loadImgSrc = this.imgConfig.imgSrc[this.currentIndex - 1]
        this.loadImgSrc = this.setImgSrc(this.currentIndex - 1)
        this.loadImg(this.loadImgSrc)
        this.$emit('change', this.currentIndex - 1)
        this.$emit('prevImge', this.currentIndex)
      },
      nextImge() {
        let { imgSrc } = this.imgConfig
        if (Array.isArray(imgSrc) && imgSrc.length === 0) {
          this.currentIndex = 0
          return
        }
        this.currentIndex += 1
        if (this.currentIndex > imgSrc.length) {
          this.currentIndex = imgSrc.length
          return
        }
        this.lastStatus.rotate = 0
        this.toTransfrom()
        // this.loadImgSrc = this.imgConfig.imgSrc[this.currentIndex - 1]
        this.loadImgSrc = this.setImgSrc(this.currentIndex - 1)
        this.loadImg(this.loadImgSrc)
        this.$emit('change', this.currentIndex - 1)
        this.$emit('nextImge', this.currentIndex)
      },
      changeIndex(index) {
        if (Number(index) && Array.isArray(this.imgConfig.imgSrc)) {
          this.currentIndex = Number(index) + 1
        }
      },
      handleKeydown(e) {
        if (e.keyCode === 37) {
          this.prevImge()
        } else if (e.keyCode === 39) {
          this.nextImge()
        }
      }
    },
    mounted() {
      this.changeIndex(this.imgConfig.index)
      this.$nextTick(() => {
        this.ticketImg = this.$refs.ticketImg
        this.initConfig()
      })
      document.addEventListener('keydown', this.handleKeydown)
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.handleKeydown)
    },
    watch: {
      'config.index'(val) {
        this.changeIndex(val)
      },
      'config.imgSrc'(val) {
        this.initConfig()
      }
    }
  }
</script>

<style lang='scss' scoped>
  // @import '@/public/assets/scss/variable.scss';

  .overHider {
    overflow: hidden;
  }
  .waybill-compile_img {
    position: relative;
  }
  .imgbox {
    clear: both;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border: 1px solid #eeeeee;
    background-color: #f1f1f5;
  }
  .waybill-compile_img img {
    display: block;
    clear: both;
  }
  .no-img {
    color: #cccccc;
    text-align: center;
    .iconfont {
      font-size: 36px;
    }
    .no-img-txt {
      display: block;
      padding-top: 20px;
      font-size: 16px;
    }
  }
  .btn-icon {
    display: flex;
    flex-wrap: wrap;
    user-select: none;
    padding: 12px 0 4px;
    .pager {
      display: inline-block;
      width: 110px;
      line-height: 30px;
      cursor: pointer;
      padding: 0 0 0 10px;
      white-space: nowrap;
    }
    i {
      padding: 0 2px;
      color: #9571e9;
    }
  }
</style>
