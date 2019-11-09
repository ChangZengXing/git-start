<script>
  import { range } from 'lodash'
  import debug from 'debug'
  const log = debug('fms-pdf')

  function getDocument(url) {
    // Using import statement in this way allows Webpack
    // to treat pdf.js as an async dependency so we can
    // avoid adding it to one of the main bundles
    return import(/* webpackChunkName: "fms-pdfjs-dist" */ 'pdfjs-dist/webpack').then(pdfjs =>
      // https://github.com/mozilla/pdf.js/issues/4244
      pdfjs.getDocument({ url, disableFontFace: false })
    )
  }

  // pdf: instance of PDFData
  // see docs for PDF.js for more info
  function getPages(pdf, first, last) {
    const allPages = range(first, last + 1).map(number => pdf.getPage(number))
    return Promise.all(allPages)
  }

  const BUFFER_LENGTH = 30

  function getDefaults() {
    return {
      pages: [],
      cursor: 0
    }
  }

  export default {
    name: 'PDFData',

    props: {
      url: {
        type: String,
        required: true
      }
    },

    data() {
      return Object.assign(getDefaults(), {
        pdf: undefined,
        pdfCache: {}
      })
    },

    computed: {
      pageCount() {
        return this.pdf ? this.pdf.numPages : 0
      }
    },

    watch: {
      url: {
        handler(url) {
          log('document-loading', url, this.pdfCache)

          if (!url) return

          if (this.pdfCache[url]) {
            this.pdf = this.pdfCache[url]
            this.updatePdf()
            log('pdf from cache')
            this.$emit('document-loaded')
            return
          }

          this.$emit('document-loading')

          getDocument(url)
            .then(pdf => {
              log('document-loaded', pdf)
              this.pdf = pdf
              this.pdfCache[url] = pdf
              this.$emit('document-loaded')
            })
            .catch(response => {
              this.$emit('document-errored', { text: 'Failed to retrieve PDF', response })
              log('Failed to retrieve PDF', response)
            })
        },
        immediate: true
      },

      pdf(pdf, oldPdf) {
        if (!pdf) return
        this.updatePdf()
      }
    },
    methods: {
      updatePdf() {
        this.pages = []
        this.cursor = 0
        this.$emit('page-count', this.pageCount)
        this.fetchPages()
      },
      fetchPages(currentPage = 0) {
        if (!this.pdf) return
        if (this.pageCount > 0 && this.pages.length === this.pageCount) return

        const startIndex = this.pages.length
        if (this.cursor > startIndex) return

        const startPage = startIndex + 1
        const endPage = Math.min(Math.max(currentPage, startIndex + BUFFER_LENGTH), this.pageCount)
        this.cursor = endPage

        log(`Fetching pages ${startPage} to ${endPage}`)
        getPages(this.pdf, startPage, endPage)
          .then(pages => {
            log('PDF Pages loaded', pages)

            // 这里不处理分页跳转
            // const deleteCount = 0
            // this.pages.splice(startIndex, deleteCount, ...pages)

            this.pages = [...pages]

            return this.pages
          })
          .catch(response => {
            this.$emit('document-errored', { text: 'Failed to retrieve pages', response })
            log('Failed to retrieve pages', response)
          })
      },

      onPageRendered({ text, page }) {
        log('page-rendered', text, page)
      },

      onPageErrored({ text, response, page }) {
        log('page-errored!', text, response, page)
      }
    },

    created() {
      this.$on('page-rendered', this.onPageRendered)
      this.$on('page-errored', this.onPageErrored)
      this.$on('pages-fetch', this.fetchPages)
    },

    render(h) {
      log('fms-pdf-data-render $slots: %o', this.$slots)
      log('fms-pdf-data-render $scopedSlots: %o', this.$scopedSlots)
      const { pages } = this
      return h('div', [this.$scopedSlots.document({ pages })])
    }
  }
</script>
