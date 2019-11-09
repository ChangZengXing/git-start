/**
 * Created by cy on 2018-12-05.
 */

import Vue from 'vue'
import ElementUi from 'element-ui'
import { noop } from 'element-ui/src/utils/util'
import { isSpecifiedField } from '@/fms/utils'

const { FormItem } = ElementUi

const { validate } = FormItem.methods

const FmsFormItem = Vue.extend(FormItem)

// ? 此方法继承的组件会影响全局的组件 el-form-item
FmsFormItem.mixin({
  methods: {
    validate(trigger, callback = noop) {
      console.log('FmsFormItem validate', this)
      const { prop, form } = this
      if (isSpecifiedField(form.model, prop)) {
        callback()
        this.clearValidate()
        return true
      }
      return validate.call(this, trigger, callback)
    }
  }
})

export default FmsFormItem
