/**
 * Created by cy on 2018-06-22.
 */

import deepCopy from '../deep-copy'

function assignKey (to, from, key) {
  to[key] = deepCopy(from[key])
}

function deepAssign (to, from) {
  Object.keys(from).forEach(key => assignKey(to, from, key))
  return to
}

export default deepAssign
