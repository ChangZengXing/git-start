<script>
  import { trim } from 'lodash'
  export default {
    functional: true,
    render(h, ctx) {
      // ! 当组件没有传递任何属性时: 注意ctx.data.attrs 为 undefined
      // ! <fms-row></fms-row>

      // ctx.data.attrs = ctx.data.attrs || {}

      // ! { ...undefined, ...null } 并不会报错
      // ! [ ...undefined ]是会报错的

      // * 这里使用解构取默认值更好一点,特别是对数字
      // * gutter = gutter || 2 这样取默认值,将导致gutter取不到0值
      const { type = 'flex', gutter = 0 } = ctx.props
      ctx.data.attrs = {
        ...ctx.data.attrs, // 不必在乎ctx.data.attrs是否为对象
        type,
        gutter
      }

      ctx.data.staticClass = trim('fms-row' + ' ' + trim(ctx.data.staticClass))

      // !这里暂使用el-row, 因为kye-row的gutter设置不了0
      return h('el-row', ctx.data, ctx.children)
    }
  }
</script>

<style lang="scss">
  .fms-row.fms-row {
    margin-bottom: 4px;
    min-height: 28px;
    &.is-align-center {
      align-items: center;
    }
    &:empty {
      display: none;
    }
  }
  .fms-dialog {
    .fms-row.fms-row {
      margin-bottom: 2px;
    }
  }
</style>
