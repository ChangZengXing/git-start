<template>
  <el-row
    class="fms-form-footer"
    :class="{'fms-form-footer__in-dialog': inDialog }"
    justify="center"
    :type="inDialog ? '': 'flex'"
  >
    <slot name="prepend"></slot>
    <template v-if="inDialog">
      <kye-button v-if="saveLabel" type="primary" @click="saveHandle" :auth="auth">{{saveLabel}}</kye-button>
      <kye-button
        v-if="!saveLabel"
        type="primary"
        @click="saveHandle"
        :auth="auth"
        hotkey="ctrl+s"
      >{{'保存(S)'}}</kye-button>
      <kye-button v-if="cancelLabel" class="cancel" @click="cancelHandle">{{'取消' || cancelLabel}}</kye-button>
    </template>
    <template v-else>
      <kye-button v-if="saveLabel" type="primary" @click="saveHandle" :auth="auth">{{saveLabel}}</kye-button>
      <kye-button v-if="cancelLabel" class="cancel" @click="cancelHandle">{{cancelLabel}}</kye-button>
    </template>
    <slot name="append"></slot>
  </el-row>
</template>
<script>
  /**
   * 保存默认label
   */
  const DEFAULT_SAVE_LABEL = '保存'

  /**
   * 取消默认label
   */
  const DEFAULT_CANCEL_LABEL = '取消'

  export default {
    name: 'FmsFormFooter',
    /**
     * 属性列表
     * @property {String|Number|Boolean} saveLabel - 保存label
     * @property {String|Number|Boolean} cancelLabel - 取消label
     * @property {String|Object} route - 点击取消之后的路由跳转
     * @property {Boolean} inDialog - 是否在弹窗中
     * @property {String} auth - 操作权限code
     */
    props: {
      saveLabel: {
        type: [String, Number, Boolean],
        default: DEFAULT_SAVE_LABEL
      },
      saveCall: {
        type: Function,
        default: () => () => {}
      },
      cancelCall: {
        type: Function,
        default: () => () => {}
      },
      cancelLabel: {
        type: [String, Number, Boolean],
        default: DEFAULT_CANCEL_LABEL
      },
      cancelRoute: {
        type: [String, Object]
      },
      route: {
        type: [String, Object]
      },
      inDialog: Boolean,
      /**
       * 确定权限
       */
      auth: {
        type: String
      }
    },
    computed: {
      // styleObject () {
      //   let styleObject = {}
      //   if (!this.inDialog) {
      //     styleObject.margin = '60px 0 0 0'
      //   } else {
      //     Object.assign(styleObject, {
      //       flex: ''
      //     })
      //   }
      //   return styleObject
      // }
    },
    methods: {
      /**
       * 保存处理
       * @since 1.0.0
       */
      saveHandle() {
        this.$emit('save')
        this.$emit('submit')
        this.saveCall()
      },
      /**
       * 取消处理
       * @since 1.0.0
       */
      cancelHandle() {
        const route = this.route || this.cancelRoute
        if (route) {
          return this.$router.push(route)
        }
        this.$emit('cancel')
        this.cancelCall()
      }
    }
  }
</script>

<style lang="scss">
  .fms-form-footer {
    margin-top: 40px;
  }
  .fms-form-footer__in-dialog {
    margin-top: 0;
  }
</style>
