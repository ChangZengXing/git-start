/*
 * @fileOverview: 新增布局文件
 * @author: xuzengqiang
 * @date: 2018-06-23 14:47:19
 */
import fieldsConfig from './fields/fields-config'

export default vm => {
  return [{
    cols: [{
      column: 4,
      fields: fieldsConfig(vm)
    }]
  }]
}
