/**
 * Created by cy on 2018-06-15.
 * Modified From https://github.com/scopsy/await-to-js
 */

function isPromise (obj) {
  return !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    (typeof obj.then === 'function')
}

/**
 * @param {Any} p
 * @param {Object} errExt - Additional Information you can pass to the err object
 * @return { Promise } [err, data]
 * @example const [err, user] = await to(UserModel.findById(1))
 */
function to (p, errExt) {
  !isPromise(p) && (p = Promise.resolve(p))
  return p
    .then(data => [null, data])
    .catch(err => {
      if (!err) {
        err = new Error()
      }
      if (typeof err === 'string') {
        err = new Error(err)
      }
      if (errExt) {
        Object.assign(err, errExt)
      }
      return [err, undefined]
    })
}

export default to
