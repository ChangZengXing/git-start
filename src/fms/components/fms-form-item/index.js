/**
 * Created by cy on 2018-12-14.
 */

import { FormItem } from 'element-ui'
import { isSpecifiedField } from '@/fms/utils'

const noop = function() {}
const { validate } = FormItem.methods

export default {
  name: 'fms-form-item',
  fmsName: 'FmsFormItem',
  extends: FormItem,
  methods: {
    validate(trigger, callback = noop) {
      const { prop, form } = this
      const name = this.$options.name || this.$options._componentTag
      // 处理监控字段,不做验证
      if (name === 'fms-form-item' && isSpecifiedField(form.model, prop)) {
        callback()
        this.clearValidate()
        return true
      }
      return validate.call(this, trigger, callback)
    }
  }
}
