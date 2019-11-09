<template>
  <div class="fms-pdf-scrolling" v-scroll.immediate="updateScrollBounds">
    <PDFScrollingPage
      v-for="page in pages"
      :key="page.pageNumber"
      v-bind="{ page, clientHeight, scrollTop, focusedPage, enablePageJump }"
      @page-jump="onPageJump"
    >
      <div
        class="fms-pdf-scrolling-page"
        slot="default"
        slot-scope="{ isPageFocused, isElementFocused }"
      >
        <slot v-bind="{ page, isPageFocused, isElementFocused }"></slot>
      </div>
    </PDFScrollingPage>
    <div v-visible="fetchPages" class="fms-pdf-observer"></div>
  </div>
</template>

<script>
  import scroll from '../directives/scroll'
  import visible from '../directives/visible'
  import PDFScrollingPage from './pdf-scrolling-page.vue'
  export default {
    name: 'PDFScrolling',
    directives: { visible, scroll },
    components: { PDFScrollingPage },
    props: {
      pages: { required: true },
      currentPage: { type: Number, default: 1 },
      enablePageJump: { type: Boolean, default: false },
      isParentVisible: { default: true }
    },
    data() {
      return {
        focusedPage: undefined,
        scrollTop: 0,
        clientHeight: 0
      }
    },

    computed: {
      pagesLength() {
        return this.pages.length
      }
    },

    methods: {
      fetchPages(currentPage) {
        this.$emit('pages-fetch', currentPage)
      },

      onPageJump(scrollTop) {
        this.$emit('page-jump', scrollTop)
      },

      updateScrollBounds() {
        const { scrollTop, clientHeight } = this.$el
        // console.log('updateScrollBounds', { scrollTop, clientHeight })
        this.scrollTop = scrollTop
        this.clientHeight = clientHeight
      }
    },

    watch: {
      isParentVisible: 'updateScrollBounds',

      pagesLength(count, oldCount) {
        if (oldCount === 0) this.$emit('pages-reset')

        // Set focusedPage after new pages are mounted
        this.$nextTick(() => {
          this.focusedPage = this.currentPage
        })
      },

      currentPage(currentPage) {
        if (currentPage > this.pages.length) {
          this.fetchPages(currentPage)
        } else {
          this.focusedPage = currentPage
        }
      }
    }
  }
</script>

<style lang="scss">
  .fms-pdf-scrolling {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  .fms-pdf-scrolling-page {
    text-align: center;
  }
</style>
