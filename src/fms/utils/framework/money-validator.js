/**
 * @fileoverview: 生成金额验证规则
 * @author: xuzengqiang
 * @date: 2018-06-21 14:10:15
 *
 * @update xuzengqiang
 * @date 2018-08-06 14:32:30
 * @description 新增isPositive属性
 */
// import isMoney from './isMoney'
import isNormalMoney from './is-normal-money'
import trim from './trim'
import isNumber from './is-number'

/**
 * 生成包含金额的校验规则
 * @param {Object} option - 参数信息
 *   @property {String} label - 字段信息
 *   @property {String} message - 错误提示信息,
 *   @property {String} trigger - 事件触发类型
 *   @property {Boolean} required - 是否必填
 *   @property {Boolean} greaterThanZero - 是否必须>0
 *   @property {Boolean} isPositive - 是否必须为正数(@since 1.0.1)
 */
const validator = ({
  label = '',
  // message = '最多保留两位小数', 删除该属性
  trigger = 'blur',
  required = false,
  validator = null,
  greaterThanZero = false,
  isPositive = true
} = {}) => {
  let moneyValidator = []

  label = trim(label)
  if (required) {
    moneyValidator.push({
      required: true,
      message: `${label}不能为空`,
      trigger
    })
  }

  moneyValidator.push({
    async validator (rule, value, callback) {
      value = trim(value)

      /**
       * 如果有值,但不是money,校验
       */
      if (value.length) {
        if (!isNumber(value)) {
          callback(new Error(`${label}必须为有效金额`))
          return
        }

        const tValue = parseFloat(value)

        // 正数校验
        if (greaterThanZero) {
          if (tValue <= 0) {
            callback(new Error(`${label}必须大于0`))
            return
          }
        }

        // 如果必须>0,负数校验
        if (isPositive) {
          if (tValue < 0) {
            callback(new Error(`${label}必须大于等于0`))
            return
          }
        }

        // 精度校验
        if (!isNormalMoney(value)) {
          callback(new Error(`${label}最多保留两位小数`))
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

  return moneyValidator
}

export default validator
