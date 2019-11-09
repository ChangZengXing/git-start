/**
 * @fileoverview 判断最多保留两位小数
 * @author yaoKangsong
 *
 */

const oneDeci = /^[1-9][0-9]{0,4}$|^[1-9][0-9]{0,2}\.[1-9]$|^0\.[1-9]$|^0$/

export default value => oneDeci.test(value)
