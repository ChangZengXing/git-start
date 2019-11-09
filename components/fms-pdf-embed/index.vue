<template>
  <div class="fms-pdf-embed" v-loading="loading">
    <!-- embed 要求: Content-Disposition 不为 attachment -->
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition -->
    <!-- https://stackoverflow.com/questions/291813/recommended-way-to-embed-pdf-in-html -->
    <embed :src="url" :width="width" :height="height" type="application/pdf">
  </div>
</template>

<script>
  export default {
    name: 'fmsPdfEmbed',
    props: {
      src: String,
      width: [String, Number],
      height: [String, Number]
    },
    watch: {
      src(val) {
        if (!val) return
        this.getPDF()
      }
    },
    data() {
      return {
        url: null,
        loading: false,
        urlCache: {}
      }
    },
    methods: {
      async getPDF() {
        if (this.urlCache[this.src]) {
          this.url = this.urlCache[this.src]
          return
        }
        try {
          this.loading = true
          const res = await fetch(this.src)

          if (!res.ok) throw new Error('Network response was not ok.')

          const pdfBlob = await res.blob()

          // https://www.codexworld.com/embed-pdf-document-file-in-html-web-page/

          this.url = URL.createObjectURL(pdfBlob) + `#toolbar=0&navpanes=0&scrollbar=0`

          this.urlCache[this.src] = this.url
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      }
    },
    beforeDestroy() {
      // URL.revokeObjectURL(this.url)
      Object.values(this.urlCache).forEach(url => URL.revokeObjectURL(url))
    }
  }
</script>
