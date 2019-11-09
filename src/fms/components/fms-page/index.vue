<template>
  <section
    class="fms-page"
    :class="[type ? 'fms-page-' + type : '', { 'fms-page-timeout': timeout, 'fms-page-overflow-hidden': overflow === 'hidden' }]"
  >
    <fms-page-alert title="警告" content="该页面已超时" @close="onClose"></fms-page-alert>
    <fms-page-loading :loading="loading" :loadingText="loadingText" />
    <slot></slot>
  </section>
</template>

<script>
  import { get } from 'lodash'
  import APIPublic from '@/fms/api/public'
  import { TIMEOUT_LOCK } from '@/fms/config'
  import FmsPageAlert from '../fms-page-alert'
  import FmsPageLoading from '../fms-page-loading'
  import fmsHelperMixins from '@/fms/mixins/fms-helper'
  const FMS_PAGE_DEBUG = localStorage.getItem('FMS_PAGE_DEBUG')
  export default {
    name: 'fms-page',
    mixins: [fmsHelperMixins],
    props: {
      type: String,
      loading: Boolean,
      loadingText: String,
      overflow: {
        type: String,
        default: 'auto'
      }
    },
    components: {
      FmsPageAlert,
      FmsPageLoading
    },
    data() {
      return {
        timer: null,
        timeout: false
      }
    },
    methods: {
      clear() {
        clearTimeout(this.timer)
        this.timer = null
        this.timeout = false
        this.$$setRouteAction('')
      },
      onClose() {
        const { id } = this.$route.params
        this.$$routerPush(this.$route, 'timeout', id)
      }
    },
    deactivated() {
      FMS_PAGE_DEBUG && console.log('fms-page-deactivated', this)
      // ! 注意deactivated的 this.$route
      // console.log('fms-page-deactivated this', this.$route.path)
      // const sameMenu = this.$route.meta.tag === get(this.$route.params, 'fmsPageFrom.meta.tag')
      // if (this.$route.meta.fmsPageType !== 'modify' && sameMenu) {
      //   console.log('fms-page-deactivated inner')
      //   this.clear()
      // }
    },
    activated() {
      FMS_PAGE_DEBUG && console.log('fms-page-activated', this)
      // 重新映射一下 this.$route, 主要是防止页面进入之后,异常退出
      // createe钩子中只会执行一次,这里会每次都执行的
      this._$route = this.$route

      // 暂不开启页面超时锁定
      if (!this.timer) {
        return
      }
      const sameMenu = this.$route.meta.tag === get(this.$route.params, 'fmsPageFrom.meta.tag')
      // 只是修改页面需要设置超时时间
      if (
        (sameMenu || get(this.$route.params, 'fmsPageFrom.meta.tag') === undefined) &&
        this.$route.meta.fmsPageType === 'modify' &&
        this.$route.meta.fmsUnlockCode
      ) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          if (this.timer) {
            // 关闭父组件的弹窗
            if (this.$parent.$$dialogClose) {
              this.$parent.$$dialogClose()
            }
            this.clear()
            this.timeout = true
            this.$$setRouteAction('timeout')
          }
        }, TIMEOUT_LOCK)
      }
    },
    beforeDestroy() {
      FMS_PAGE_DEBUG && console.log('beforeDestroy in fms-page _$route', this._$route)

      // this.clear()

      // 若销毁的是修改页面
      const route = this._$route
      this._$route = null

      if (route.meta.fmsPageType === 'modify') {
        const { id, waybillNumber, waybillId } = route.params
        const { fmsUnlockCode: bizCode, payableSystem } = route.meta

        // 应付系统内处理-解锁
        if (payableSystem) {
          return this.$http(APIPublic['system-edit-unlock'], payableSystem, false)
        }

        // 财务审单-解锁: 需要传运单号
        const bizId = waybillNumber || id

        if (!bizCode || !bizId) {
          return
        }

        if (waybillId) {
          // 财务模块-解锁
          this.$http(APIPublic['fms-edit-unlock'], { bizId, bizCode, id: waybillId }, false)
        } else {
          this.$http(APIPublic['fms-edit-unlock'], { bizId, bizCode }, false)
        }
      }
    },
    created() {
      // 注意这里,如果第一次进入页面,就抛了异常,那么此时的路由将不会挂载到正确的参数,
      // 这是由于loadModel方法抛了异常, model上的字段 没能挂载到路由 params上
      this._$route = this.$route
    }
  }
</script>

<style lang="scss">
  .fms-page {
    position: relative;
    .fms-page-alert {
      display: none;
    }
    .kye-field-text,
    .kye-field-content {
      display: block;
      height: 28px;
      line-height: 14px;
      padding: 6px 8px;
      border-radius: 2px;
      border: 1px solid #d2d2d6;
    }
  }

  .fms-page-timeout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    padding: 0 16px 8px;
    .fms-page-alert {
      display: block;
    }
    .kye-search-pager {
      position: relative;
      padding-bottom: 0;
      &::before {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        opacity: 0.5;
        background: #000;
      }
    }
  }

  .fms-page-overflow-hidden {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    padding: 0 16px 8px;
  }

  // 详情页面
  .fms-page-detail {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
      background-color: #fff;
    }
  }
  // 修改,新增页面
  .fms-page-add,
  .fms-page-modify {
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      color: #333;
    }

    .kye-field-text,
    .kye-field-content {
      background-color: #ebebed;
    }
  }
</style>
