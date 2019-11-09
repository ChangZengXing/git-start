/*
 * @fileOverview: 员工service
 * @author: xuzengqiang
 * @date: 2018-06-22 14:48:27
 * @version 1.0.0
 */
import { http } from '@/public/utils/http'
import trim from '../framework/trim'

class EmployeeService {
  /**
   * 构造函数
   * @param {Integer} id - 客户ID
   */
  constructor(id) {
    this.id = id
  }

  /**
   * 根据员工ID获取员工信息
   * @since 1.0。0
   */
  async queryById () {
    let employee = null
    const id = trim(this.id)
    if (!id) {
      return employee
    }

    try {
      employee = await http('data.employee.get', { id })
    } catch (e) {
      console.error(e)
    }
    return employee
  }
}

export default EmployeeService
