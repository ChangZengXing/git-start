<template>
  <div class="fms-fields-detail kye-detail">
    <kye-form
      label-position="right"
      :model.sync="formData"
      module-code="finance"
      :biz-id="routeId"
      ref="ruleForm"
    >
      <kye-row class="content">
        <el-col
          v-for="(field, column) in fields"
          v-if="show(field)"
          :key="'field-' + column"
          :span="computeSpan(field.column)"
        >
          <kye-form-item
            :label="isLink(field) ? '' : field.label"
            :class="field.itemClass"
          >
            <!-- 监控字段 -->
            <span
              v-if="isLink(field)"
              @click="onLink(field)"
              class="fms-grid-form-item-click"
              :class="isDecrypt(field) ? 'kye-label-click' : ''"
              slot="label"
            >{{field.label}}</span>
            <!-- 如果需要自己处理,则提供命名插槽出去 -->
            <template v-if="field.slot">
              <slot :name="field.slot"></slot>
            </template>
            <el-input
              v-on="field.listeners"
              v-bind="field"
              :ref="`${routeId}${field.key}`"
              :disabled="dis(field)"
              :value="getFieldValue(field)"
              v-else
            ></el-input>
          </kye-form-item>
        </el-col>
      </kye-row>
    </kye-form>
  </div>
</template>
<script>
  import { getModuleCode } from '@/fms/utils'
  import { get, set, hasIn } from 'lodash'
  import { decrypt, getModalPageName } from 'public/utils/common'
  import { MODULECODE } from '@/fms/config'
  import DecryptPlugin from 'public/utils/decrypt-plugin'

  // import moneyFormatter from '@/fms/utils/framework/money-formatter'

  /**
   * 默认列数
   */
  const DEFAULT_COLUMN = 4
  /**
   * 最大栅格数
   */
  const DEFAULT_MAX_SPAN = 24
  const isInt = number => /^[1-9]\d*$/.test(number)

  /**
   * 底层的fields-detail不满足需求,这里重写
   * @author xuzengqiang
   * @date 2018-05-23 10:13:44
   */
  export default {
    name: 'fieldsDetailRender',
    /**
     * 参数信息
     * @property {Array} fields - 当前栏目下的字段信息
     * @property {Object} model - model
     * @property {Number} column - 列数,默认为4列
     */
    data() {
      return {
        routeId: this.$route.params.id
      }
    },
    props: {
      fields: {
        type: Array,
        default: () => []
      },
      model: {
        type: Object,
        required: true
      },
      column: {
        type: Number,
        default: DEFAULT_COLUMN,
        validator(value) {
          return isInt(value) && parseInt(value) % 2 === 0
        }
      }
    },
    created () {
      let menu = this.$store.state.menus[this.$route.meta.tag]
      this.menuId = menu && menu.id
    },
    computed: {
      /**
       * 获取每一行的fields
       * @return {Array}
       */
      // rowFields () {
      //   let rows = []
      //   let sum = 0
      //   let arr = []
      //   let totalspan = DEFAULT_MAX_SPAN
      //   let column = parseInt(this.column)
      //   // 默认一列所占的span数
      //   let span = totalspan / column
      //   this.fields.forEach(field => {
      //     field.span = Math.min(totalspan, (isInt(field.column) ? parseInt(field.column) : 1) * span)
      //     if (sum + field.span < totalspan) {
      //       arr.push(field)
      //       sum += field.span
      //     } else if (sum + field.span === totalspan) {
      //       arr.push(field)
      //       rows.push(arr)
      //       sum = 0
      //       arr = []
      //     } else {
      //       rows.push(arr)
      //       arr = []
      //       arr.push(field)
      //       sum = field.span
      //     }
      //   })
      //   if (arr.length) {
      //     rows.push(arr)
      //   }
      //   return rows
      // }
      formData: {
        get () {
          return this.model
        },
        set (val) {
          return val
        }
      }
    },
    methods: {
      // 计算span
      computeSpan(column) {
        let span = DEFAULT_MAX_SPAN / this.column
        if (column) {
          return span * column
        }
        return span
      },
      // 是否是监控字段
      isMonitoredField(col) {
        const { key, label } = col
        const maskValue = get(this.formData, key + 'Mask')
        const keyValue = get(this.formData, key)
        // 公司名为公司编码的特殊监控（编码不是 ****）
        return key && maskValue && (keyValue.includes('****') || label.includes('公司'))
      },
      // 是否是虚拟号码
      isVirtualNumber(col) {
        const { key } = col
        const virtualValue = get(this.formData, key + 'Virtual')
        return key && virtualValue
      },
      // 是否是敏感字段(前端隐藏)
      isSensitiveField(col) {
        const { key } = col
        const hasMaskSecKey = hasIn(this.formData, key + 'MaskSec')
        return key && hasMaskSecKey
      },
      show(col) {
        // 敏感字段(前端需要隐藏)
        // if (this.isSensitiveField(col)) {
        //   return false
        // }
        if (col.show === undefined) {
          return true
        }
        if (typeof col.show === 'function') {
          return col.show(col)
        }
        return col.show
      },
      isLink(col) {
        // 是否有权限点击
        if (col.auth) {
          return false
        }
        // 监控字段, 虚拟号码
        return (
          this.isMonitoredField(col) ||
          this.isVirtualNumber(col) ||
          (!!col.func && !(typeof col.isFunc === 'function' ? col.isFunc() : col.isFunc))
        )
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
      // 获取监控字段/虚拟号码
      onLink(col) {
        let type = ''
        let maskValue = ''
        const { key, func, label } = col
        // 监控字段
        if (this.isMonitoredField(col)) {
          type = 'mask'
          maskValue = get(this.formData, key + 'Mask')
        } else if (this.isVirtualNumber(col)) {
          // 虚拟号码
          type = 'virtual'
          maskValue = get(this.formData, key + 'Virtual')
        }
        if (key && maskValue) {
          return decrypt(
            {
              // ? 目前解密监控字段,对于没有dataId,暂时传一个随机id(这种方案是否可取??)
              dataId: this.$route.params.id,
              fieldName: col.fieldName || key.replace(/-/g, '.'),
              moduleCode: col.moduleCode || getModuleCode(this) || MODULECODE,
              fieldContent: col.fieldContent || maskValue,
              fieldNameStr: label,
              buttonName: getModalPageName(this)
            },
            type
          )
            .then(val => {
              // 取消返回null
              if (val === null) return
              set(this.formData, key, val)
              if (typeof func === 'function') {
                return func()
              }
            })
            .catch(e => console.warn(e))
        }
        return func()
      },
      dis(field) {
        return field.disabled === undefined ? true : field.disabled
      },
      /**
       * 获取指定字段的值
       * @param {Object} field - 字段信息
       */
      getFieldValue(field) {
        const formData = this.formData
        if (!field || !formData) {
          return ''
        }
        if (field.hasOwnProperty('value')) {
          return typeof field.value === 'function' ? field.value(formData) : field.value
        }

        if (field.hasOwnProperty('lookupCode')) {
          return this.$filter.lookup(field.lookupCode)
        }

        const key = field.key ? (field.key + '').trim() : ''
        if (key) {
          const value = get(this.formData, key) || field.default
          return this.filterField(value, field.filter)
        }
        return ''
      },
      /**
       * 数据过滤
       * @param {mixed} val - 值
       * @param {String} filter - 过滤器
       *
       * @update xuzengqiang
       * @date 2018-06-30 14:53:25
       * @since 1.0.1
       * @description 如果是金额,转换为两位小数
       */
      filterField(val, filter) {
        if (val && filter) {
          if (filter.type && filter.args) {
            let func = this.$filter[filter.type]
            if (func) {
              return func(val, ...filter.args)
            }
            return val
            // 如果是金额
          } else if (/^money$/.test(filter)) {
            return this.$filter.money(val)
          } else if (typeof filter === 'function') {
            return filter(val)
          } else {
            let func = this.$filter[filter]
            if (func) {
              return func(val)
            }
            return val
          }
        }
        return val
      },
      /**
       * label点击
       * @param {Object} field - 字段信息
       */
      labelClicked(field) {
        if (field && typeof field.func === 'function') {
          field.func()
        }
      },
      async autoDecrypt (col) {
        let formData = JSON.parse(JSON.stringify(this.formData))
        const dataId = this.$route.params.id
        const { key } = col
        if (!formData[key].includes('****')) {
          return
        }
        if (!DecryptPlugin.isCached(this.menuId, dataId, key)) {
          return
        }
        try {
          let data = await this.$http('syslog.sensitiveFieldViewLog.decrypt', [{
            fieldName: { dataId: dataId, fieldName: key },
            fieldContent: this.formData[key + 'Mask']
          }], false)
          if (data && data[0]) {
            data = data[0].fieldContent
            if (data !== null) {
              this.formData[key] = data
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
  .form-fields-column .fms-fields-detail.kye-detail .el-form-item__content {
    min-height: 28px;
  }
  .ky-erp .kye-detail .el-form-item__content {
    line-height: 28px;
    height: auto;
  }
</style>
