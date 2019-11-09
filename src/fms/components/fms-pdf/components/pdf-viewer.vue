<template>
  <div class="fms-pdf-viewer" v-loading="loading">
    <PDFData
      v-bind="{ url }"
      @page-count="updatePageCount"
      @page-focus="updateCurrentPage"
      @document-rendered="onDocumentRendered"
      @document-errored="onDocumentErrored"
      @document-loading="onDocumentLoading"
      @document-loaded="onDocumentLoaded"
    >
      <template slot="document" slot-scope="{ pages }">
        <PDFDocument
          ref="PDFDocument"
          :class="{ 'preview-enabled': isPreviewEnabled }"
          v-bind="{ url, pages, scale, optimalScale, fit, currentPage, pageCount, isPreviewEnabled, width, height }"
          @scale-change="updateScale"
        />
      </template>
    </PDFData>
  </div>
</template>

<script>
  import PDFData from './pdf-data.vue'
  import PDFDocument from './pdf-document.vue'
  import debug from 'debug'
  const log = debug('fms-pdf')

  function floor(value, precision) {
    const multiplier = Math.pow(10, precision || 0)
    return Math.floor(value * multiplier) / multiplier
  }

  export default {
    name: 'PDFViewer',
    props: { url: String, width: String, height: String },
    components: { PDFData, PDFDocument },
    data() {
      return {
        fit: undefined,
        scale: undefined,
        currentPage: 1,
        pageCount: undefined,
        optimalScale: undefined,
        isPreviewEnabled: false,
        increment: 0.25,
        loading: false
      }
    },

    methods: {
      onDocumentRendered() {
        this.$emit('document-rendered', this.url)
      },

      onDocumentErrored(e) {
        this.loading = false
        this.$emit('document-errored', e)
      },

      onDocumentLoading(e) {
        this.loading = true
        this.$emit('document-loading', e)
      },

      onDocumentLoaded(e) {
        this.loading = false
        this.$emit('document-loaded', e)
      },

      updateScale({ scale, isOptimal = false }) {
        const roundedScale = floor(scale, 2)
        if (isOptimal) this.optimalScale = roundedScale
        this.scale = roundedScale
        log('updateScale', this.scale, this.optimalScale)
      },

      updateFit(fit) {
        this.fit = fit
      },

      zoomIn() {
        const scale = this.scale + this.increment
        this.updateScale({ scale })
      },

      zoomOut() {
        if (this.scale <= this.increment) return
        const scale = this.scale - this.increment
        this.updateScale({ scale })
      },

      restore() {
        log('pdf-restore')
        this.$refs.PDFDocument.fitWidth()
      },

      updatePageCount(pageCount) {
        this.pageCount = pageCount
      },

      updateCurrentPage(pageNumber) {
        this.currentPage = pageNumber
      },

      togglePreview() {
        this.isPreviewEnabled = !this.isPreviewEnabled
      }
    },

    watch: {
      url() {
        this.currentPage = undefined
      }
    },

    mounted() {
      document.body.classList.add('overflow-hidden')
    }
  }
</script>

<style lang="scss">
  .fms-pdf-viewer {
    width: 100%;
    height: 100%;
  }
</style>
