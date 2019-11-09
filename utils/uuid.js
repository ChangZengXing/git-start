/**
 * Created by cy on 2018-06-09.
 */

/**
 * **该函数不可作为后端uuid使用,仅供前端页面使用**
 * uuid (由小写字母26个 + [0-9]十个数字组成的共36个字符的随机字符串)
 * @param  {Number} len uuid的长度,默认7位 最长为20个字符
 * @param  {Boolean} allNumber 是否全部由数字组成
 * @return {String}
 */
export default function uuid (len = 7, allNumber) {
  let id = ''
  len = allNumber ? Math.max(len - 1, 4) : len
  const type = allNumber ? 10 : 36
  if (len <= 10) {
    id = Math.random().toString(type).substring(3, 3 + len)
  } else {
    id =
      Math.random().toString(type).substring(3, 3 + 10) +
      Math.random().toString(type).substring(3, 3 + (len - 10))
  }
  return allNumber ? Math.floor(Math.random() * 9) + 1 + id : id
}
