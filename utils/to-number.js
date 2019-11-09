/**
 * Created by cy on 2018-05-19.
 */

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
export default function toNumber(val, defaultVal) {
  if (val === null || val === undefined || val === '') {
    if (arguments.length === 2) {
      return defaultVal
    }
    return 0
  }
  const n = parseFloat(val)
  return isNaN(n)
    ? defaultVal != null // eslint-disable-line
      ? defaultVal
      : val
    : n
}
