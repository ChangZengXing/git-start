<script>
  import ElementUi from 'element-ui'
  import { noop } from 'element-ui/src/utils/util'
  import { dp, isSpecifiedField } from '@/fms/utils'
  // import ElFormItem from 'element-ui/packages/form-item'

  const { FormItem } = ElementUi
  const FmsFormItem = dp(FormItem)
  const { validate } = FmsFormItem.methods

  export default {
    extends: FmsFormItem,
    name: 'FmsFormItem',
    fmsName: 'FmsFormItem',
    methods: {
      update$$: () => 'FmsFormItem-2018-12-13 22:12',
      validate(trigger, callback = noop) {
        console.info('[FmsFormItem validate]', this)
        const { prop, form } = this
        if (this.$options._componentTag === 'fms-form-item' && isSpecifiedField(form.model, prop)) {
          callback()
          this.clearValidate()
          return true
        }
        return validate.call(this, trigger, callback)
      }
    }
  }
</script>
