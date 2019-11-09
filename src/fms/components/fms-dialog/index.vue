<template>
  <kye-dialog
    class="fms-dialog"
    :class="{
      'kye-dialog-dynamic': queryTable,
      'fms-dialog__no-scroll': noscroll,
      'fms-dialog__no-modal': !attrs.modal,
      'fms-dialog__no-footer': !$slots.footer,
      'fms-dialog__title-slot': $slots.title,
      'fms-dialog__only-table': onlyTable,
      'fms-dialog__last-form': lastForm || dialogLastForm,
      'fms-dialog__pagination': hasPaginaton
    }"
    v-bind="attrs"
    v-on="listeners"
  >
    <template slot="title">
      <span class="el-dialog__title" v-if="title">{{title}}</span>
      <div class="el-dialog__title-slot">
        <slot name="title"></slot>
      </div>
    </template>
    <template v-if="queryTable" slot="default">
      <slot name="default"></slot>
      <fms-dialog-loading
        :loading="loading === undefined ? attrs.loading : loading"
        :loadingText="loadingText === undefined ? attrs.loadingText : loadingText"
      />
    </template>
    <template v-else>
      <template slot="header">
        <slot name="header"></slot>
      </template>
      <template slot="default">
        <fms-dialog-loading
          :loading="loading === undefined ? attrs.loading : loading"
          :loadingText="loadingText === undefined ? attrs.loadingText : loadingText"
        />
        <slot name="default"></slot>
      </template>
      <template slot="footer">
        <slot name="footer">
          <fms-dialog-footer
            v-if="showDialogFooterComputed"
            :auth="attrs.auth"
            :cancelText="cancelText"
            :submitText="submitText"
            :cancelCall="cancelCall"
            :submitCall="submitCall"
            :showStatistics="statistics"
            :submitDisabled="submitDisabled"
            :cancelDisabled="cancelDisabled"
          />
        </slot>
      </template>
    </template>
  </kye-dialog>
</template>

<script>
  import { vh, toNumber, ResizeObserver } from '@/fms/utils'
  import FmsDialogFooter from '../fms-dialog-footer'
  import FmsDialogLoading from '../fms-dialog-loading'
  export default {
    name: 'fms-dialog',
    props: {
      auth: String,
      title: String,
      loading: Boolean,
      lastForm: Boolean,
      cancelText: String,
      loadingText: String,
      submitText: String,
      queryTable: Boolean,
      cancelCall: Function,
      submitCall: Function,
      submitDisabled: Boolean,
      cancelDisabled: Boolean,
      showDialogFooter: {
        type: Boolean,
        default: true
      },
      // 兼容按钮处显示 统计栏
      showStatistics: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        width: 0,
        noscroll: false,
        onlyTable: false,
        hasPaginaton: false,
        dialogLastForm: false
      }
    },
    components: {
      FmsDialogFooter,
      FmsDialogLoading
    },
    computed: {
      attrs() {
        // console.log('this.$attrs', this.$attrs, this.$props)
        return {
          appendToBody: true,
          modalAppendToBody: true,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          modal: true,
          ...this.$attrs,
          width: this.width || this.$attrs.width || '1200px',
          // 将title显示的申明为组件属性,
          // 主要是不想设置到原生dom上去,这样鼠标浮动就会有一个tooltip
          title: this.$props.title,
          auth: this.$props.auth
        }
      },
      listeners() {
        return this.$listeners
      },
      showDialogFooterComputed() {
        console.log(
          'showDialogFooterComputed',
          this.showDialogFooter,
          !!this.cancelCall,
          !!this.submitCall
        )
        return this.showDialogFooter && (this.cancelCall || this.submitCall)
      },
      statistics() {
        if (this.showStatistics.show) {
          return this.showStatistics
        } else {
          return {
            show: false,
            formBlock: {},
            formModel: {},
          }
        }
      }
    },
    mounted() {
      if (!this.queryTable) {
        this.$nextTick(() => {
          const dialog = this.$el.querySelector('.el-dialog')
          const dialogBody = this.$el.querySelector('.el-dialog__body')
          const dialogFooter = this.$el.querySelector('.el-dialog__footer')
          const headerHeight = 44
          const footerHeight = dialogFooter ? 53 : 0

          if (dialog && this.attrs.position) {
            if (this.attrs.position === 'bottom-right') {
              const dialogStyle = getComputedStyle(dialog)
              const { marginLeft, height } = dialogStyle
              dialog.style.left = `calc(${marginLeft} - 2px)`
              dialog.style.top = `calc(100vh - 15vh - ${height})`
            }
          }
          if (dialogBody) {
            const vo = new ResizeObserver(entries => {
              console.log('ResizeObserver-dialogBody', entries)
              for (let entry of entries) {
                const height = entry.target.offsetHeight
                if (height > 0 && height < vh(70) - 45 - 5) {
                  this.noscroll = true
                } else {
                  this.noscroll = false
                }
                if (dialog && this.attrs.position === 'bottom-right') {
                  dialog.style.top = `calc(100vh - 15vh - ${height +
                    headerHeight +
                    footerHeight +
                    2}px)`
                }
              }
            })
            vo.observe(dialogBody)
            if (dialogBody.children[1]) {
              this.onlyTable = dialogBody.children[1].classList.contains('fms-table')
            }
            const lastEle = dialogBody.children[dialogBody.children.length - 1]
            if (lastEle && lastEle.classList.contains('fms-form-block')) {
              if (!this.$el.classList.contains('fms-dialog-form')) {
                this.dialogLastForm = true
              }
            }
          }
          if (dialogFooter) {
            const paginationEl = dialogFooter.children[0]
            if (paginationEl && paginationEl.classList.contains('el-pagination')) {
              console.log('hasPaginaton', dialogFooter)
              this.hasPaginaton = true
              // 当配置了 翻页组件时, 翻页组件 有一个最小宽度
              if (typeof this.$attrs.width === 'number' && this.$attrs.width < 4) {
                this.width = '800px'
              }
              if (typeof this.$attrs.width === 'string') {
                this.width = Math.max(toNumber(this.$attrs.width), 800) + 'px'
              }
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  .fms-dialog {
    .el-dialog .el-dialog__body {
      // position: relative;
      max-height: calc(70vh - 0px);
      .el-input.is-disabled .el-input__inner {
        color: #333;
      }
    }
  }
  .fms-dialog.fms-dialog__no-modal {
    &.el-dialog__wrapper {
      top: initial;
      right: initial;
      bottom: initial;
      left: initial;
    }
    .el-dialog {
      position: fixed;
      left: 15%;
      // transform: translateX(-50%);
    }
  }
  .fms-dialog__no-scroll {
    .el-dialog .el-dialog__body {
      overflow: hidden;
    }
  }
  .fms-dialog__last-form {
    .el-dialog .el-dialog__body {
      .fms-form-block {
        .fms-form-rows {
          .el-row:last-child {
            margin-bottom: -12px;
          }
        }
      }
    }
  }
  .fms-dialog__only-table {
    .el-dialog__body {
      .fms-table.fms-table {
        margin-top: 0;
      }
    }
  }
  .fms-dialog.fms-dialog__title-slot {
    .el-dialog__header {
      display: flex;
      padding: 2px 16px;
      align-items: center;
      .el-dialog__title {
        margin-right: 8px;
      }
      .el-dialog__title-slot {
        flex: 1;
        padding: 0px 16px;
        display: flex;
        justify-content: center;
        position: absolute;
        width: 100%;
        right: 0;
      }
    }
  }
</style>
