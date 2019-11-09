/**
 * Created by cy on 2019-08-20.
 */

/**
 * 计数执行
 * @param  {Number} counts 计数次数
 * @param  {Function} countFn 计数间隔回调函数
 * @param  {Number} countTime 计数间隔时间 单位ms 默认值 1000ms
 * @return {Object}
 */
export function countDown(counts, countFn, countTime = 1000) {
  let countLeft = Math.round(counts)

  const count = function() {
    if (countLeft > 0) {
      countLeft -= 1
    } else {
      clearInterval(interval)
    }
    countFn(countLeft, _this)
  }

  const interval = setInterval(() => count(), countTime)

  const _this = {
    abort: function() {
      clearInterval(interval)
    },
    getCount: function() {
      return countLeft
    }
  }
  return _this
}
