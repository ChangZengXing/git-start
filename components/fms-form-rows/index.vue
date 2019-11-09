<template>
  <section class="fms-form-rows" :class="{'fms-form-rows-inline': inline}">
    <el-row
      v-for="(row, i) of rowsComputed"
      :key="i"
      :gutter="row.gutter !== undefined
        ? row.gutter
        : gutter !== undefined
          ? gutter
          : 4
        "
      :type="row.type || 'flex'"
      :class="[row.className, { 'fms-form-row--flex': row.flex }]"
      :style="row.style ? row.style : row.width !== undefined ? { width: row.width } : {}"
      v-bind="row.attrs"
    >
      <template v-if="row.slot">
        <slot :name="row.slot" :props="{row}"></slot>
      </template>
      <template v-else>
        <el-col
          v-for="(col, j) of colsComputed(row.cols)"
          :key="col.key || j"
          :span="col.span || 24"
          :class="colClass(col)"
          :style="colStyle(col)"
          v-bind="col.attrs"
        >
          <template v-if="col.rows">
            <fms-form-rows
              :refs="refs"
              :form="form"
              :block="block"
              :rows="col.rows"
              :model="row.model || model"
              :formItem="row.formItem || formItem"
              :inline="row.inline || inline"
              :gutter="row.gutter || gutter"
              :bizId="row.bizId || bizId"
              :moduleCode="row.moduleCode || moduleCodeComputed"
              :labelWidth="row.labelWidth || labelWidth"
            />
          </template>
          <template v-else>
            <template v-if="col.slot">
              <el-radio
                v-if="col.groupRadio"
                v-model="block.groupName"
                :label="col.groupName"
                @change="val => radioChange(val, col)"
              >
                <span></span>
              </el-radio>
              <slot :name="col.slot" :props="{row, col}"></slot>
            </template>
            <template v-else-if="col.form !== undefined ? col.form === false : form === false">
              <fms-components :col="col" :model="model"></fms-components>
            </template>
            <template v-else>
              <el-radio
                v-if="col.groupRadio"
                v-model="block.groupName"
                :label="col.groupName"
                @change="val => radioChange(val, col)"
              >
                <span></span>
              </el-radio>
              <fms-form-item
                :operation="operation(col)"
                :class="['fms-form-item__' + col.component, {'fms-form-item__no-lable': col.labelWidth == '0' || labelWidth === '0px'}]"
                :label="col.component === 'kye-button' ? ' ' : col.label"
                :labelWidth="col.component === 'kye-button' ? '0px' : inline ? (col.labelWidth || labelWidth || 'auto') : col.labelWidth || labelWidth"
                :prop="col.key"
                :rules="col.rules || undefined"
                :ref="col.ref ? (col.ref + '_' + col.key) : col.key"
                :required="col.required"
                v-bind="col.formItem || col.formItemProps || row.formItem || formItem"
              >
                <span
                  v-if="isLink(col)"
                  @click="onLink(col)"
                  slot="label"
                  class="kye-label-click"
                >{{col.label}}</span>
                <fms-components :col="col" :model="model"></fms-components>
              </fms-form-item>
            </template>
          </template>
        </el-col>
      </template>
    </el-row>
  </section>
</template>

<script>
  import FmsFormRows from './'
  import { get, set, hasIn } from 'lodash'
  import { MODULECODE } from '@/fms/config'
  import FmsFormItem from '../fms-form-item'
  import { decrypt, getModalPageName } from '@/public/utils/common'
  import FmsComponents from '@/fms/components/fms-components'
  import {
    uuid,
    hasAuth,
    getModuleCode
    // formBlockForEach
  } from '@/fms/utils'

  export default {
    name: 'fms-form-rows',
    props: {
      bizId: String,
      gutter: Number,
      inline: Boolean,
      labelWidth: String,
      form: { type: Boolean, default: true },
      rows: { type: Array, default: () => [] },
      refs: { type: Object, default: () => ({}) },
      model: { type: Object, default: () => ({}) },
      block: { type: Object, default: () => ({}) },
      formItem: { type: Object, default: () => ({}) },
      moduleCode: { type: String, default: MODULECODE }
    },
    computed: {
      rowsComputed() {
        return this.rows.filter(row => row.show === undefined || row.show)
      },
      moduleCodeComputed() {
        return getModuleCode(this) || this.moduleCode
      }
    },
    components: { FmsFormRows, FmsComponents, FmsFormItem },
    methods: {
      operation (col) {
        if (col.component === 'kye-date-picker' && (col.componentProps && col.componentProps.type && col.componentProps.type.includes('rang'))) {
          return '范围于'
        } else {
          return '等于'
        }
      },
      colsComputed(cols) {
        return cols.filter(col => this.show(col))
      },
      radioChange(val, col) {
        // console.log('radioChange', val, this.block.groupName)
        // 这里使用$set 在某些组件(比如 kye-date-picker会导致循环渲染,主要是其父子组件嵌套引用)会有问题,
        // 同时这么操作也影响性能,故注释掉 直接使用样式进行disable展示
        // formBlockForEach(this.block, col => {
        //   if (col.groupName === undefined) {
        //     return
        //   }
        //   const disabled = col.groupName !== val
        //   if (col.componentProps) {
        //     this.$set(col.componentProps, 'disabled', disabled)
        //   } else {
        //     this.$set(col, 'componentProps', { disabled })
        //   }
        // })
      },
      show(col) {
        // 注意: 敏改字段前端不再隐藏
        if (col.show === undefined) {
          return true
        }
        if (typeof col.show === 'function') {
          return col.show()
        }
        return col.show
      },
      // 是否是监控字段
      isMonitoredField(col) {
        const { key } = col
        const maskValue = get(this.model, key + 'Mask')
        return !!key && !!maskValue
      },
      // 是否是虚拟号码
      isVirtualNumber(col) {
        const { key } = col
        const virtualValue = get(this.model, key + 'Virtual')
        return !!key && !!virtualValue
      },
      // 是否是敏感字段(前端不要隐藏, 返回6个*)
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
        // 监控字段, 虚拟号码
        return this.isMonitoredField(col) || this.isVirtualNumber(col) || !!col.link
      },
      // 获取监控字段/虚拟号码
      onLink(col) {
        let type = ''
        let maskValue = ''
        const { key, link, label } = col
        // 监控字段
        if (this.isMonitoredField(col)) {
          type = 'mask'
          maskValue = get(this.model, key + 'Mask')
        } else if (this.isVirtualNumber(col)) {
          // 虚拟号码
          type = 'virtual'
          maskValue = get(this.model, key + 'Virtual')
        }
        if (key && maskValue) {
          return decrypt(
            {
              // ? 目前解密监控字段,对于没有dataId,暂时传一个随机id(这种方案是否可取??)
              dataId: col.dataId || this.bizId || this.model.id || uuid(13, true),
              fieldName: col.fieldName || key.replace(/-/g, '.'),
              moduleCode: col.moduleCode || this.moduleCodeComputed,
              fieldContent: col.fieldContent || maskValue,
              fieldNameStr: label,
              buttonName: getModalPageName(this)
            },
            type
          )
            .then(val => {
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
      colStyle(col) {
        if (col.style) {
          return col.style
        }
        const style = {}
        if (col.flex) {
          style.width = 'auto'
          style.flex = col.flex
        }
        if (col.width) {
          style.width = col.width
        }
        if (this.inline) {
          style.width = 'auto'
        }
        return style
      },
      colClass(col) {
        return [
          col.className ? col.className + ' ' + col.key : col.key,
          {
            'fms-form-col-slot': col.slot,
            'fms-form-col-disabled':
              this.block.groupName !== undefined &&
              col.groupName !== undefined &&
              col.groupName !== this.block.groupName
          }
        ]
      }
    }
  }
</script>

<style lang="scss">
  .el-form.el-form .fms-form-item__no-lable {
    .el-form-item__label {
      padding-right: 0;
    }
  }
  .el-form.el-form--label-right {
    .fms-form-item__kye-button {
      .el-form-item__label {
        padding-right: 0;
      }
    }
  }
  .fms-form-rows .fms-form-row--flex {
    .el-col {
      width: auto;
    }
  }

  .el-col.fms-form-col-disabled {
    .fms-components {
      &::before {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        cursor: not-allowed;
        z-index: 1;
      }
      background-color: #ebebed;
      border-color: #d2d2d6;
      color: #000;
      border-radius: 2px;
      * {
        background-color: transparent;
      }
    }
  }
</style>
