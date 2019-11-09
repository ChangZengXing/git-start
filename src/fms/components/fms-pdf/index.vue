<template>
  <div class="fms-pdf" :style="{ width, height }">
    <!-- <PDFViewer v-bind="{ url }" v-on="$listeners" ref="PDFViewer"></PDFViewer> -->
  </div>
</template>

<script>
  // import PDFViewer from './components/pdf-viewer'
  export default {
    name: 'fms-pdf',
    props: {
      url: String,
      width: String,
      height: String,
      increment: {
        type: Number,
        default: 0.25
      }
    },
    // components: { PDFViewer },
    methods: {
      zoomIn() {
        this.$refs.PDFViewer.zoomIn()
      },

      zoomOut() {
        this.$refs.PDFViewer.zoomOut()
      },

      restore() {
        this.$refs.PDFViewer.restore()
      }
    },
    beforeDestroy() {
      console.log('fms-pdf-beforeDestroy')
      // TODO: 销毁 pdf-pages实例
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      // if (page) page._destroy()
    }
  }
</script>

<style lang="scss">
  .fms-pdf {
    position: relative;
  }
</style>
