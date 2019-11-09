/**
 * Created by cy on 2018-12-18.
 */

import { camelCase } from 'lodash'
import { basename, dirname } from './path'

/* eslint-disable */

const fms$api = {}
const fms$mixins = {}
const fms$components = {}

const importAPI = r => {
  r.keys().forEach(k => {
    let m = camelCase(basename(k))
    fms$api[m] = r(k)
  })
}

const importMixins = r => {
  r.keys().forEach(k => {
    let m = basename(k)
    if (!m) {
      m = dirname(k)
    }
    m = camelCase(m)
    fms$mixins[m] = r(k)
  })
}

const importComponents = r => {
  r.keys().forEach(k => {
    console.log('importComponents', k)
    let m = basename(k)
    if (!m) {
      m = dirname(k)
    }
    m = camelCase(m)
    console.log('importComponents', m)
    fms$components[m] = r(k)
  })
}

// importAPI(require.context('../api', false, /\.js$/))
// importMixins(require.context('../mixins', true, /\.js$/))
// importComponents(require.context('../components', true, /index\.(js|vue)$/))

// console.log('importAPI', fms$api)
// console.log('importMixins', fms$mixins)

// export { fms$api, fms$mixins }
