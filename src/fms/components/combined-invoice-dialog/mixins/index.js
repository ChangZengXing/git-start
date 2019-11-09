/**
 * Created by cy on 2018-07-11.
 */

import comMixins from '@/fms/mixins/common'

import data from './data'
import watch from './watch'
import methods from './methods'
import components from './components'

const locMixins = [data, watch, methods, components]

export default [...comMixins, ...locMixins]
