/**
 * Created by cy on 2018-07-04.
 */

import tableColsMonth from './table-cols-month'
import tableColsPerson from './table-cols-person'

export default type => {
  if (type === 'month') {
    return tableColsMonth()
  }
  return tableColsPerson()
}
