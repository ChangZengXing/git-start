<template>
  <ul class="fms-data-rows"
      :class="{ 'fms-data-rows-inline': inline }">
    <slot name="button"></slot>
    <li v-for="(li, i) in itemsComputed"
        :class="liClass(li)"
        :key="li.label + i"
        @click="onClick(li)">
      <label>{{ li.label }}：</label>
      <strong v-if="disabled">-</strong>
      <template v-else-if="data.model[li.key] != undefined">
        <strong>{{ filter(data.model[li.key], li) }}</strong>
        <em>{{ li.unit }}</em>
      </template>
    </li>
  </ul>
</template>

<script>
  import { set } from 'lodash'
  import { MODULECODE } from '@/fms/config'
  import { decrypt, getModalPageName } from 'public/utils/common'
  import { getMaskField, isSensitiveField, uuid, getModuleCode } from '@/fms/utils'
  export default {
    props: {
      bizId: String,
      moduleCode: { type: String, default: MODULECODE },
      data: {
        type: Object,
        default: () => ({})
      },
      inline: {
        type: Boolean,
        default: false
      },
      disabled: Boolean
    },
    computed: {
      itemsComputed () {
        // 敏改字段前端不再隐藏 使用 *** 显示
        // return this.data.items.filter(li => !isSensitiveField(this.data.model, li.key))
        return this.data.items
      },
      moduleCodeComputed () {
        return getModuleCode(this) || this.moduleCode
      }
    },
    methods: {
      liClass (li) {
        return {
          'is-mask-field': getMaskField(this.data.model, li.key).is,
          'is-sensitive-field': isSensitiveField(this.data.model, li.key)
        }
      },
      filter (val, item) {
        let str = val
        // 敏改字段前端使用 *** 显示
        if (isSensitiveField(this.data.model, item.key)) {
          return val || window.__ERPGLOABLECONFIG__.maskSec || '✽✽✽'
        }
        if (item.filter) {
          switch (typeof item.filter) {
            case 'function':
              str = item.filter(val)
              break
            case 'string':
              if (this.$filter[item.filter]) {
                str = this.$filter[item.filter](val)
              }
              break
            case 'object':
              str = item.filter.type ? this.$filter[item.filter.type](val, ...item.filter.args) : val
              break
            default:
              str = val
          }
        }
        return str
      },
      // 处理监控字段
      onClick (li) {
        const { is, maskKey, maskValue } = getMaskField(this.data.model, li.key)
        if (!is) {
          return
        }
        const { key, label } = li
        const { model } = this.data
        return decrypt(
          {
            // ? 目前解密监控字段,对于没有dataId,暂时传一个随机id
            dataId: this.bizId || model.id || uuid(13, true),
            fieldName: key.replace(/-/g, '.'),
            moduleCode: this.moduleCodeComputed,
            fieldContent: maskValue,
            fieldNameStr: label,
            buttonName: getModalPageName(this)
          },
          'mask'
        )
          .then(val => {
            // 取消返回null
            if (val === null) return
            set(model, key, val)
            // 已经解密,
            set(model, maskKey, undefined)
          })
          .catch(e => console.warn(e))
      }
    }
  }
</script>

<style lang="scss">
  .fms-data-rows {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 4px;
    margin-bottom: 4px;
    padding-left: 12px;
    background-color: #f8f8fa;
    user-select: text;
    li {
      line-height: 28px;
      min-width: 40px;
      margin-right: 24px;
      display: flex;
      align-items: center;
      font-size: 12px;
    }
    li.is-mask-field {
      cursor: pointer;
      em {
        display: none;
      }
    }
    li.is-sensitive-field {
      em {
        display: none;
      }
    }
    label {
      color: #666;
      font-size: 12px;
    }
    strong {
      color: #ff9300;
      margin-right: 1px;
    }
    em {
      font-style: normal;
      color: #666;
      font-size: 12px;
    }
  }

  .fms-data-rows-inline {
    margin: 0 0;
    // margin-left: 16px;
    display: inline-flex;
    background-color: transparent;
  }
</style>
