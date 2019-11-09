/**
 * Created by cy on 2018-12-18.
 */

export const dirname = path => {
  return path.replace(/\\/g, '/').replace(/\/[^\\/]*$/, '')
}

export const extName = path => {
  const a = path.split('.')
  if (a.length === 1 || (a[0] === '' && a.length === 2)) {
    return ''
  }
  return a.pop()
}

export const basename = (path, ext = false) => {
  const name = path.replace(/\\/g, '/').replace(/.*\//, '')
  return ext ? name : name.split('.')[0]
}
