/**
 * Created by cy on 2018-12-29.
 */

import { trim, omit } from 'lodash'

export const toValues = (obj, omitKeys = []) =>
  Object.values(omit(obj, omitKeys)).reduce((acc, val) => {
    trim(val) && acc.push(val)
    return acc
  }, [])
