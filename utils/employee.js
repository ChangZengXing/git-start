/**
 * Created by cy on 2018-08-23.
 */

import APIPublic from '@/fms/api/public'
import { http } from '@/public/utils/http'

export default async function employeeGet (id, dataSource) {
  const k = (k1, k2) => {
    if (dataSource === '10') { return k1 }
    if (dataSource === '20') { return k2 }
    return k1
  }
  const method = ({
    '10': 'hr-employee-get', // 员工信息
    '20': 'mobile-employee-get' // 手机信息
  })[dataSource]
  const res = await http(APIPublic[method], { id }) || {}
  const com = {
    // 员工id
    _id: id,
    // 员工姓名
    _name: res[k('name', 'userName')],
    // 员工部门
    _departmentName: res[k('department', 'departmentName')],
    // 员工部门id
    _departmentId: res[k('departmentId', '')],
    // 员工职位
    _position: res[k('duty', '')],
    // 员工职位id
    _positionId: res[k('dutyId', '')],
    // 员工所属区域
    _region: res[k('employeeArea', 'regionCode')],
    // 员工点部
    _networkName: res[k('networkName', 'pointName')],
    // 员工点部id
    _netWorkId: res[k('networkId', '')],
    // 座机号
    _phone: res[k('phone', 'telephone')],
    // 手机
    _mobile: res[k('privateMobile', 'mobile')],
    // qq
    _qq: res[k('qq', '')]
  }
  return { ...res, ...com }
}
