/*
 * @fileOverview: 工具库
 * @author: xuzengqiang
 * @date: 2018-06-16 17:02:50
 * @version 1.0.0
 */
import isEmpty from './is-empty'
import isNotEmpty from './is-not-empty'
import isBlank from './is-blank'
import isNotBlank from './is-not-blank'
import trim from './trim'
import hump from './hump'
import fetchLayoutModel from './fetch-layout-model'
import fetchEditTableModel from './fetch-edit-table-model'
import fetchFieldsConfig from './fetch-fields-config'
import isMoney from './is-money'
import isNormalMoney from './is-normal-money'
import isNumber from './is-number'
import moneyValidator from './money-validator'
import moneyFormatter from './money-formatter'
import extend from './extend'
import integerValidator from './integer-validator'

const Framework = {}

Object.assign(Framework, {
  isEmpty,
  isNotEmpty,
  isBlank,
  isNotBlank,
  trim,
  hump,
  fetchLayoutModel,
  fetchEditTableModel,
  fetchFieldsConfig,
  isMoney,
  isNormalMoney,
  isNumber,
  moneyValidator,
  moneyFormatter,
  extend,
  integerValidator
})

export default Framework
