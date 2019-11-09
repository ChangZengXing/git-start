/*
 * @fileOverview: 将形如kebab-case转化为camelCased
 * @author: xuzengqiang
 * @date: 2018-06-19 16:04:59
 */
const hump = string => {
  return string.replace(/-([a-z])|(\d)/gi, (str, char, number) => {
    if (char) {
      return char.toUpperCase()
    } else if (number) {
      return String.fromCharCode(parseInt(number) + 97)
    }
  })
}

export default hump
