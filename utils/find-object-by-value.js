import { flattenDeep } from 'lodash'
/**
* 扁平化处理,将所有对象放到大数组中
* @param {Array} arr 小数组
* @param {Array} wrapperArr 大数组
* @return {Array} 返回最后拼成的大数组
*/
function findDeep (arr, wrapperArr) {
  const oldArr = flattenDeep(arr)
  oldArr.forEach((val, index) => {
    Object.values(val).forEach(val => {
      if (val instanceof Array) {
        wrapperArr.push(...val)
        findDeep(val, wrapperArr)
      }
    })
  })
  return wrapperArr
}
/**
* 根据对象的一个键值对在复杂的数据结构中找到键值对所在的对象
* @param {Array} arr 需要在哪个数组中寻找
* @param {String} key 所要寻找的键
* @param {String/Number} value 所要寻找的值
* @return {Object} 返回键值对所在的对象
*/
function findObjectByValue (arr, key, value) {
  if (arr instanceof Array) {
    const wrapperArr = flattenDeep(arr)
    const newArr = findDeep(arr, wrapperArr)
    return newArr.filter(val => {
      return val[key] === value
    })[0]
  }
}
export default findObjectByValue
