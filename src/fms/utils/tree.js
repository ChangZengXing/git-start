/**
 * Created by cy on 2019-07-19.
 */

// 将线性数组转为tree结构
export function listToTree({
  list,
  idkey = 'id',
  parentKey = 'parentId',
  indentKey = '_indent',
  childKey = '_children'
} = {}) {
  let indent = 0
  const tree = []
  if (!Array.isArray(list)) list = [list]
  // 找寻根节点(根据: 根节点是没有父节点的) 需要排除掉自己本身
  list.forEach(li => {
    let _list = list.filter(fi => fi[idkey] !== li[idkey])
    if (!_list.find(lt => li[parentKey] === lt[idkey])) {
      tree.push({ ...li, [indentKey]: indent, [childKey]: [] })
    }
  })
  // 找寻子节点
  _h(tree, list)
  function _h(tree = [], list) {
    indent++
    tree.forEach(lr => {
      list.forEach(li => {
        // 需要排除掉自己本身
        if (li[parentKey] === lr[idkey] && li[idkey] !== lr[idkey]) {
          lr.children.push({ ...li, [indentKey]: indent, [childKey]: [] })
        }
      })
      _h(lr[childKey], list)
    })
    indent--
  }
  return tree
}

// 将tree结构转成线性的数组列表
export function treeToList(
  {
    tree,
    indentKey = '_indent',
    childKey = 'children',
    includeRootNode = true,
    indentKeyInherit = true
  } = {},
  callBack
) {
  let indent = 0
  if (!Array.isArray(tree)) {
    if (indentKeyInherit && indentKey && tree[indentKey]) {
      indent = tree[indentKey] - 1
    }
    if (includeRootNode) {
      tree = [tree]
    } else {
      tree = tree[childKey] || []
    }
  } else if (indentKeyInherit && indentKey && tree[0] && tree[0][indentKey]) {
    indent = tree[0][indentKey] - 1
  }
  let list = []
  _h(tree, childKey)
  function _h(_tree = [], _childKey) {
    indent++
    _tree.forEach((tr, i) => {
      if (indentKey) tr[indentKey] = indent
      list.push(tr)
      callBack && callBack(tr, i, indent)
      _h(tr[_childKey], _childKey)
    })
    indent--
  }
  return list
}

// 设置tree的缩进
export function treeIndent(
  { tree = [], childkey = 'children', indentKey = '_indent', indentKeyInherit = true } = {},
  callBack
) {
  let indent = 0
  if (!Array.isArray(tree)) {
    if (indentKeyInherit && tree[indentKey]) {
      indent = tree[indentKey] - 1
    }
    tree = [tree]
  } else if (indentKeyInherit && tree[0] && tree[0][indentKey]) {
    indent = tree[0][indentKey] - 1
  }

  _h(tree, childkey)
  function _h(_tree = [], _childkey) {
    indent++
    _tree.forEach((tr, i) => {
      tr[indentKey] = indent
      callBack && callBack(indent, tr, i)
      _h(tr[_childkey], _childkey)
    })
    indent--
  }
  return tree
}
