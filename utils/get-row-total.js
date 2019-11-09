import store from '@/public/store'

export default function getRowTotal(url, index = 0) {
  const queryObj = store.state.queryTable[url]
  const total = queryObj.query[index].res.rowTotal || 0
  return total
}
