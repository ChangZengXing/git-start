/**
 * @fileoverview 判断是否是正整数
 * @author yaoKangsong
 * @since 1.0
 */
const isInterger = /^(0|[1-9]\d*)$/
export default value => isInterger.test(value)
