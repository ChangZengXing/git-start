/**
 * @fileoverview: 正整数校验
 * @author: xuzengqiang
 * @date: 2018-08-20 18:15:11
 */
import trim from './trim'

/**
 * 生成包含金额的校验规则
 * @param {Object} option - 参数信息
 *   @property {String} label - 字段信息
 *   @property {String} message - 错误提示信息,
 *   @property {String} trigger - 事件触发类型
 *   @property {Boolean} required - 是否必填
 *   @property {Boolean} greaterThanZero - 是否必须>0
 */
const validator = ({
  label = '',
  // message = '必须为正整数', 删除该属性
  trigger = 'blur',
  required = false,
  validator = null,
  greaterThanZero = false
} = {}) => {
  let integerValidator = []

  label = trim(label)
  if (required) {
    integerValidator.push({
      required: true,
      message: `${label}不能为空`,
      trigger
    })
  }

  integerValidator.push({
    async validator (rule, value, callback) {
      value = trim(value)

      if (value.length) {
        if (greaterThanZero) {
          if (!/^[1-9]\d*$/.test(value)) {
            callback(new Error(`${label}必须为>0的正整数`))
            return
          }
        }

        if (!/^(0|[1-9]\d*)$/.test(value)) {
          callback(new Error(`${label}必须为≥0的整数`))
          return
        }
      }

      /**
       * 继续其它校验
       * @description 如果有传入其它的校验规则
       */
      if (typeof validator === 'function') {
        let ret = await validator(rule, value, callback)
        if (ret === false) {
          return
        }
      }
      callback()
    }
  })

  return integerValidator
}

export default validator
