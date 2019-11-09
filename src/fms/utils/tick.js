/**
 * Created by cy on 2018-08-07.
 */

function tick (t = 1000, state = true, res = true) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      if (state) {
        resolve(res)
      } else {
        reject(res)
      }
    }, t)
  })
}

export default tick
