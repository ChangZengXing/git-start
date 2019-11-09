<template>
  <dl class="fms-grid">
    <dt class="fms-grid-title kye-block-title" v-if="grid.title || title">{{grid.title || title}}</dt>
    <dd v-if="$slots.default" class="fms-grid-slot">
      <slot></slot>
    </dd>
    <dd v-else class="fms-grid-container" :style="gridStyle">
      <template v-if="form === false">
        <div
          class="fms-grid-item"
          :class="'fms-grid-item__' + (col.key || col.slot || col.component)"
          v-for="(col, i) of gridCols"
          :key="col.key + '-' + i"
          :style="colStyle(col)"
        >
          <fms-components :col="col" :index="i" :model="model">
            <template v-for="scopedSlot in Object.keys($scopedSlots)" :slot="scopedSlot">
              <slot :name="scopedSlot" :col="col" :model="model" :index="i"/>
            </template>
            <template v-for="slot in Object.keys($slots)" :slot="slot">
              <slot :name="slot" :col="col" :model="model" :index="i"></slot>
            </template>
          </fms-components>
        </div>
      </template>
      <template v-else v-for="(col, i) of gridCols">
        <template v-if="col.formItem === false">
          <div
            class="fms-grid-item"
            :class="'fms-grid-item__' + (col.key || col.slot || col.component)"
            :key="col.key + '-' + i"
            :style="colStyle(col)"
          >
            <fms-components :col="col" :model="model" :index="i">
              <template v-for="scopedSlot in Object.keys($scopedSlots)" :slot="scopedSlot">
                <slot :name="scopedSlot" :col="col" :model="model" :index="i"/>
              </template>
              <template v-for="slot in Object.keys($slots)" :slot="slot">
                <slot :name="slot" :col="col" :model="model" :index="i"></slot>
              </template>
            </fms-components>
          </div>
        </template>
        <template v-else>
          <fms-form-item
            class="fms-grid-item fms-grid-form-item"
            :key="col.key + '-' + i"
            :prop="col.key"
            :rules="col.rules"
            :style="colStyle(col)"
            :class="colClass(col)"
            :label="colLabel(col)"
            :labelWidth="colLabelWidth(col)"
            :required="col.required"
            v-bind="col.formItem || col.formItemProps || formItem"
          >
            <span
              v-if="isLink(col)"
              @click="onLink(col)"
              class="fms-grid-form-item-click"
              :class="isDecrypt(col) ? 'kye-label-click' : ''"
              slot="label"
            >{{colLabel(col)}}</span>
            <fms-components :col="col" :model="model" :index="i">
              <template v-for="scopedSlot in Object.keys($scopedSlots)" :slot="scopedSlot">
                <slot :name="scopedSlot" :col="col" :model="model" :index="i"/>
              </template>
              <template v-for="slot in Object.keys($slots)" :slot="slot">
                <slot :name="slot" :col="col" :model="model" :index="i"></slot>
              </template>
            </fms-components>
          </fms-form-item>
        </template>
      </template>
    </dd>
  </dl>
</template>

<script>
  import { get, set, hasIn } from 'lodash'
  import { MODULECODE } from '@/fms/config'
  import FmsFormItem from '../fms-form-item'
  import FmsComponents from '../fms-components'
  import { decrypt, getModalPageName } from 'public/utils/common'
  import { hasAuth, getModuleCode } from '@/fms/utils'
  import DecryptPlugin from 'public/utils/decrypt-plugin'
  export default {
    name: 'fms-grid',
    props: {
      type: String,
      bizId: String,
      title: String,
      inline: Boolean,
      border: Boolean,
      columns: Number,
      labelWidth: String,
      form: { type: Boolean, default: false },
      grid: { type: Object, default: () => ({}) },
      model: { type: Object, default: () => ({}) },
      rules: { type: Object, default: () => ({}) },
      gutter: { type: [Number, String], default: 8 },
      formItem: { type: Object, default: () => ({}) },
      moduleCode: { type: String, default: MODULECODE }
    },
    components: { FmsComponents, FmsFormItem },
    computed: {
      gridCols() {
        return (this.grid.cols || []).filter(col => this.show(col))
      },
      gridStyle() {
        let { gutter = this.gutter, columns = this.columns } = this.grid

        if (typeof gutter === 'number') {
          gutter = gutter + 'px'
        }

        const style = {
          'grid-column-gap': gutter
        }

        if (columns) {
          style['grid-template-columns'] = `repeat(${columns}, 1fr)`
        }

        return style
      },
      moduleCodeComputed() {
        return getModuleCode(this) || this.moduleCode
      }
    },
    created () {
      let menu = this.$store.state.menus[this.$route.meta.tag]
      this.menuId = menu && menu.id
    },
    methods: {
      show(col) {
        // 敏感字段(前端不再隐藏)
        if (col.show === undefined) {
          return true
        }
        if (typeof col.show === 'function') {
          return col.show(col)
        }
        return col.show
      },
      colStyle({ style = {}, span }) {
        style = { ...style }
        if (span !== undefined) {
          if (!Array.isArray(span)) {
            span = [span]
          }
          style['grid-row-end'] = `span ${span[1] || 1}`
          style['grid-column-end'] = `span ${span[0] || 1}`
        }
        return style
      },
      colClass(col) {
        return [
          'fms-grid-form-item__' + (col.key || col.slot || col.component),
          { 'fms-grid-form-item__no-lable': col.labelWidth || this.labelWidth === '0px' }
        ]
      },
      colLabel(col) {
        if (col.component === 'kye-button') {
          return ' '
        }
        return col.label
      },
      colLabelWidth(col) {
        return col.component === 'kye-button'
          ? '0px'
          : this.inline
          ? 'auto'
          : col.labelWidth || this.labelWidth
      },
      // 是否是监控字段
      isMonitoredField(col) {
        const { key, label } = col
        const maskValue = get(this.model, key + 'Mask')
        const keyValue = get(this.model, key)
        // 公司名为公司编码的特殊监控（编码不是 ****）
        return key && maskValue && (keyValue.includes('****') || label.includes('公司'))
      },
      isDecrypt (col) {
        // 如果是按钮 则直接显示按钮颜色
        if (col.link) {
          return true
        }
        if (this.isVirtualNumber(col) || (!!col.func && !(typeof col.isFunc === 'function' ? col.isFunc() : col.isFunc))) {
          return true
        }
        // 监控字段, 虚拟号码
        if (this.isMonitoredField(col)) {
          this.autoDecrypt(col)
          return this.isMonitoredField(col)
        }
        return false
      },
      // 是否是虚拟号码
      isVirtualNumber(col) {
        const { key } = col
        const virtualValue = get(this.model, key + 'Virtual')
        return !!key && !!virtualValue
      },
      // 是否是敏感字段(前端隐藏)
      isSensitiveField(col) {
        const { key } = col
        const hasMaskSecKey = hasIn(this.model, key + 'MaskSec')
        return !!key && hasMaskSecKey
      },
      isLink(col) {
        // 是否有权限点击
        if (!hasAuth(col.auth)) {
          return false
        }
        // this.autoDecrypt(col)
        // 监控字段, 虚拟号码
        return this.isMonitoredField(col) || this.isVirtualNumber(col) || !!col.link
      },
      // 获取监控字段/虚拟号码
      async onLink(col) {
        let type = ''
        let maskValue = ''
        const { key, link, label, virtualLink } = col
        // 监控字段
        if (this.isMonitoredField(col)) {
          type = 'mask'
          maskValue = get(this.model, key + 'Mask')
        } else if (this.isVirtualNumber(col)) {
          // 虚拟号码
          if (virtualLink) {
            await virtualLink()
          }
          type = 'virtual'
          maskValue = get(this.model, key + 'Virtual')
        }
        if (key && maskValue) {
          return decrypt(
            {
              // ? 目前解密监控字段,对于没有dataId,暂时传一个随机id(这种方案是否可取??)
              dataId: this.$route.params.id,
              fieldName: col.fieldName || key.replace(/-/g, '.'),
              moduleCode: col.moduleCode || this.grid.moduleCode || this.moduleCodeComputed,
              fieldContent: col.fieldContent || maskValue,
              fieldNameStr: label,
              buttonName: getModalPageName(this)
            },
            type
          )
            .then(val => {
              // 取消返回null
              if (val === null) return
              set(this.model, key, val)
              // 已经解密
              set(this.model, key + type.replace(/^./, type[0].toUpperCase()), undefined)
              if (typeof link === 'function') {
                return link()
              }
            })
            .catch(e => console.warn(e))
        }
        if (typeof link === 'function') {
          return link()
        }
      },
      async autoDecrypt (col) {
        let model = JSON.parse(JSON.stringify(this.model))
        const dataId = this.$route.params.id
        const { key } = col
        if (!model[key].includes('****')) {
          return
        }
        if (!DecryptPlugin.isCached(this.menuId, dataId, key)) {
          return
        }
        try {
          let data = await this.$http('syslog.sensitiveFieldViewLog.decrypt', [{
            fieldName: { dataId: dataId, fieldName: key },
            fieldContent: this.model[key + 'Mask']
          }], false)
          if (data && data[0]) {
            data = data[0].fieldContent
            if (data !== null) {
              this.model[key] = data
            }
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
</script>

<style lang="scss">
  .fms-grid-container {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    .fms-grid-item {
      position: relative;
    }
    .el-form-item__content {
      position: relative;
      height: 100%;
    }
    .fms-components {
      height: 100%;
      .el-textarea {
        height: 100%;
        .el-textarea__inner {
          height: 100%;
          resize: none;
        }
      }
    }
  }
  // fix: 20270
  .el-form.el-form--inline,
  .el-form.el-form--label-left,
  .el-form.el-form--label-right {
    .fms-grid {
      .el-form-item.is-required {
        position: relative;
        .el-form-item__label {
          display: inline-block;
          height: auto;
          position: absolute;
          top: 6px;
          transform: translateY(0%);
          // 保证5个汉字不换行
          white-space: nowrap;
          &::before {
            margin-right: -4px;
            position: relative;
            top: 0px;
            right: 4px;
            font-size: 12px;
          }
        }
      }
    }
  }
  .el-form.el-form.el-form.fms-form-grids {
    .fms-grid {
      .el-form-item.is-required {
        position: relative;
        .el-form-item__label {
          display: inline-block;
          height: auto;
          position: absolute;
          // top: 50%;
          top: 13px;
          transform: translateY(-50%);
          white-space: normal;
          &::before {
            margin-right: -4px;
            position: relative;
            top: 0px;
            right: 4px;
            font-size: 12px;
          }
        }
      }
    }
  }
  .el-form.el-form--label-top {
    .fms-grid {
      .el-form-item.is-required {
        .el-form-item__label {
          &::before {
            margin-right: 0;
            right: 0;
          }
        }
      }
    }
  }

  .el-form .fms-grid .fms-grid-form-item__no-lable {
    .el-form-item__label {
      padding-right: 0;
    }
  }

  .el-form.el-form--label-right .fms-grid .fms-grid-form-item__kye-button {
    .el-form-item__label {
      padding-right: 0;
    }
  }

  .fms-grid-title.kye-block-title {
    margin-bottom: 12px;
  }
</style>
