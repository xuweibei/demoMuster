import api from '../api'
//================ 功能菜单管理 =================
export function getFunctionList(pagingSearch) {
  return {
    type: 'getFunctionList',
    payload: {
      promise: api.put('/getFunctionList', pagingSearch)
    }
  }
}
export function addFunctionInfo(info) {
  return {
    type: 'addFunctionInfo',
    payload: {
      promise: api.put('/addFunctionInfo', info)
    }
  }
}
export function editFunctionInfo(info) {
  return {
    type: 'editFunctionInfo',
    payload: {
      promise: api.put('/editFunctionInfo', info)
    }
  }
}
export function deleteFunctionInfo(info) {
  return {
    type: 'deleteFunctionInfo',
    payload: {
      promise: api.put('/deleteFunctionInfo', info)
    }
  }
}
//================ 功能URL管理 =================
export function getFunctionUrlList(pagingSearch) {
  return {
    type: 'getFunctionUrlList',
    payload: {
      promise: api.put('/getFunctionUrlList', pagingSearch)
    }
  }
}
export function addFunctionUrlInfo(info) {
  return {
    type: 'addFunctionUrlInfo',
    payload: {
      promise: api.put('/addFunctionUrlInfo', info)
    }
  }
}
export function editFunctionUrlInfo(info) {
  return {
    type: 'editFunctionUrlInfo',
    payload: {
      promise: api.put('/editFunctionUrlInfo', info)
    }
  }
}
export function deleteFunctionUrlInfo(adminPageurlId) {
  return {
    type: 'deleteFunctionInfo',
    payload: {
      promise: api.put('/deleteFunctionUrlInfo', { adminPageurlId })
    }
  }
}

//发起首页饼图请求 == 按分部
export function mainpie(info) {
  return {
    type: 'mainpie',
    payload: {
      promise: api.put('/mainpie', info)
    }
  }
}

//发起首页饼图请求 == 按大区
export function mainpieByRegion(info) {
  return {
    type: 'mainpieByRegion',
    payload: {
      promise: api.put('/mainpieByRegion', info)
    }
  }
}
//发起总部首页的柱形图请求 == 按大区
export function mainLineByRegion(info){
  return {
    type: 'mainLineByRegion',
    payload: {
      promise: api.put('/mainLineByRegion', info)
    }
  }
}
//发起总部首页的柱形图请求 == 按分部
export function mainLine(info){
  return {
    type: 'mainLine',
    payload: {
      promise: api.put('/mainLine', info)
    }
  }
}
//发起首页线型图(分部)的请求
export function mainecharts(info) {
  return {
    type: 'mainecharts',
    payload: {
      promise: api.put('/mainecharts', info)
    }
  }
}
//发起首页学员数量请求
export function studentNum() {
  return {
    type: 'studentNum',
    payload: {
      promise: api.put('/studentNum')
    }
  }
}
//发起首页订单数量的请求
export function orderForACertainTime(){
  return {
    type:'orderForACertainTime',
    payload:{
      promise:api.put('/orderForACertainTime')
    }
  }
}

//首页-分部-页面所需参数
export function getParmForBranchIndex(){
  return {
    type:'getParmForBranchIndex',
    payload:{
      promise:api.put('/getParmForBranchIndex')
    }
  }
}

//首页-总部/分部/大区-查询未审批订单数 + 首页-总部/大区-分部优惠规则待终审的数量
export function getUnapprovedOrderCount(){
  return {
    type:'getUnapprovedOrderCount',
    payload:{
      promise:api.put('/getUnapprovedOrderCount')
    }
  }
}

//首页-总部-页面所需参数
export function getParmForZB(){
  return {
    type:'getParmForZB',
    payload:{
      promise:api.put('/getParmForZB')
    }
  }
}
//分部，即将失效学员查询
export function AbouTtoFail(pagingSearch) {
  return {
    type: 'AbouTtoFail',
    payload: {
      promise: api.put('/AbouTtoFail', pagingSearch)
    }
  }
}

//================ 首页模块管理 =================
//模块查询
export function adminHomeModule(pagingSearch) {
  return {
    type: 'adminHomeModule',
    payload: {
      promise: api.put('/adminHomeModule', pagingSearch)
    }
  }
}
//模块添加
export function adminHomeModuleAdd(pagingSearch) {
  return {
    type: 'adminHomeModuleAdd',
    payload: {
      promise: api.put('/adminHomeModuleAdd', pagingSearch)
    }
  }
}
//模块修改
export function adminHomeModuleEdit(pagingSearch) {
  return {
    type: 'adminHomeModuleEdit',
    payload: {
      promise: api.put('/adminHomeModuleEdit', pagingSearch)
    }
  }
}
//模块删除
export function adminHomeModuleDel(pagingSearch) {
  return {
    type: 'adminHomeModuleDel',
    payload: {
      promise: api.put('/adminHomeModuleDel', pagingSearch)
    }
  }
}
//根据角色id查询首页模块权限接口
export function getRoleModule(pagingSearch) {
  return {
    type: 'getRoleModule',
    payload: {
      promise: api.put('/getRoleModule', pagingSearch)
    }
  }
}
//新增/更新角色首页模块权限信息接口
export function editRoleModule(pagingSearch) {
  return {
    type: 'editRoleModule',
    payload: {
      promise: api.put('/editRoleModule', pagingSearch)
    }
  }
}
//================ 角色、权限、用户角色管理 =================
export function getRoleList(pagingSearch) {
  return {
    type: 'getRoleList',
    payload: {
      promise: api.put('/getRoleList', pagingSearch)
    }
  }
}
//添加角色信息
export function addRoleInfo(roleInfo) {
  return {
    type: 'addRoleInfo',
    payload: {
      promise: api.put('/addRoleInfo', roleInfo)
    }
  }
}
//保存角色信息
export function editRoleInfo(roleInfo) {
  return {
    type: 'editRoleInfo',
    payload: {
      promise: api.put('/editRoleInfo', roleInfo)
    }
  }
}
//删除角色信息
export function deleteRoleInfo(roleId) {
  return {
    type: 'deleteRoleInfo',
    payload: {
      promise: api.put('/deleteRoleInfo', { roleId })
    }
  }
}

//获取角色功能列表
export function getRoleFunList(roleId) {
  return {
    type: 'getRoleFunList',
    payload: {
      promise: api.put('/getRoleFunList', { roleId })
    }
  }
}

//保存角色功能列表roleId,funids
export function saveRoleFun(roleId, funids) {
  return {
    type: 'saveRoleFun',
    payload: {
      promise: api.put('/saveRoleFun', { roleId, funids })
    }
  }
}

//获取用户角色列表
export function getUserRole(userId) {
  return {
    type: 'getUserRole',
    payload: {
      promise: api.put('/getUserRole', { userId })
    }
  }
}
//保存用户角色列表
export function saveUserRole(postData) {
  return {
    type: 'saveUserRole',
    payload: {
      promise: api.put('/saveUserRole', postData)
    }
  }
}

//系统字典维护
export function getDictionaryList(pagingSearch) {
  return {
    type: 'GetDictionaryList',
    payload: {
      promise: api.put('/getDictionaryList', pagingSearch)
    }
  }
}
export function saveDictionaryInfo(dicInfo) {
  return {
    type: 'SaveDictionaryInfo',
    payload: {
      promise: api.put('/saveDictionaryInfo', dicInfo)
    }
  }
}
//================ 机构用户管理 =================
//查询信息
export function getOrgUserList(pagingSearch) {
  return {
    type: 'getOrgUserList',
    payload: {
      promise: api.put('/getOrgUserList', pagingSearch)
    }
  }
}
//添加信息
export function addOrgUserInfo(userInfo) {
  return {
    type: 'addOrgUserInfo',
    payload: {
      promise: api.put('/addOrgUserInfo', userInfo)
    }
  }
}
//查找
export function getUserInfoByLoginName(loginName) {
  return {
    type: 'getUserInfoByLoginName',
    payload: {
      promise: api.put('/getUserInfoByLoginName', { loginName })
    }
  }
}
//================ 基础 > 用户 =================
//查询用户列表
export function getUserList(realName, userType, orgId) {
  return {
    type: 'GET_USER_LIST',
    payload: {
      promise: api.put('/GetUserList', { realName: realName, userType: userType, orgId: orgId })
    }
  }
}
//用户修改
export function modifyUser(pagingSearch) {
  return {
    type: 'GET_USER_LIST',
    payload: {
      promise: api.put('/modifyUser', pagingSearch)
    }
  }
}
//用户删除
export function deleteAdmin(userId) {
  return {
    type: 'GET_USER_DELETE',
    payload: {
      promise: api.put('/deleteAdmin', userId)
    }
  }
}
//================ 基础 > 机构管理 =================
//机构列表
export function getOrgList(pagingSearch) {
  return {
    type: 'GET_ORG_LIST',
    payload: {
      promise: api.put('/getOrgList', pagingSearch)
    }
  }
}
//获取上级机构(所有大区)列表 供下拉框用
export function getLastDepthList() {
  return {
    type: 'GET_LAST_DEPTH_LIST',
    payload: {
      promise: api.put('/getLastDepthList')
    }
  }
}
//保存机构信息
export function saveOrgInfo(orgInfo) {
  if (orgInfo.orgId) {
    return {
      type: 'UPDATE_ORG_INFO',
      payload: {
        promise: api.put('/updateOrgInfo', orgInfo)
      }
    }
  } else {
    return {
      type: 'ADD_ORG_INFO',
      payload: {
        promise: api.put('/addOrgInfo', orgInfo)
      }
    }
  }
}
//删除机构信息
export function deleteOrgInfo(orgId) {
  return {
    type: 'DELETE_ORG_INFO',
    payload: {
      //promise: api.put('/deleteOrgInfo', { org_ids: orgId })
      promise: api.put('/deleteOrgInfo', { orgIds: orgId })
    }
  }
}
//设置机构管理员信息
export function setOrgAdminInfo(postData) {
  return {
    type: 'setOrgAdmin',
    payload: {
      promise: api.put('/setOrgAdminInfo', postData)
    }
  }
}
//按大区模糊查分部列表
export function orgBranchList(parentId, orgName) {
  return {
    type: 'ORG_BRANCH_LIST',
    payload: {
      promise: api.put('/orgBranchList', { parentId: parentId, orgName: orgName })
      //promise: api.put('/orgBranchList', { orgName: '' })
    }
  }
}
//按大区Id查分部列表
export function orgBranchListByParentId(parentId) {
  return {
    type: 'ORG_BRANCH_LIST_BY_PARENT_ID',
    payload: {
      promise: api.put('/orgBranchListByParentId', { parentId: parentId })
    }
  }
}
export function allUniversityList(pagingSearch) {
  return {
    type: 'ALL_UNIVERSITY_LIST',
    payload: {
      promise: api.put('/allUniversityList', pagingSearch)
    }
  }
}
//机构下院校列表
export function orgUniversityList(orgId) {
  return {
    type: 'ORG_UNIVERSITY_LIST',
    payload: {
      promise: api.put('/orgUniversityList', { orgId: orgId })
    }
  }
}
//机构下未添加院校列表
export function orgUniversityNotInList(orgId, universityName) {
  return {
    type: 'ORG_UNIVERSITY_NOT_IN_LIST',
    payload: {
      promise: api.put('/orgUniversityNotInList', { orgId: orgId, universityName: universityName })
    }
  }
}
//分部添加院校
export function orgAddUniversitys(orgId, universityIds) {
  return {
    type: 'ORG_ADD_UNIVERSITY',
    payload: {
      promise: api.put('/orgAddUniversitys', { branchId: orgId, universityIds: universityIds })
    }
  }
}
//分部删除院校
export function orgDeleteUniversity(orgId, universityId) {
  return {
    type: 'ORG_DELETE_UNIVERSITY',
    payload: {
      promise: api.put('/orgDeleteUniversity', { orgId: orgId, universityId: universityId })
    }
  }
}

//================ 上传模板管理 =================
export function getExcelTempleteList(pagingSearch) {
  return {
    type: 'getExcelTempleteList',
    payload: {
      promise: api.put('/getExcelTempleteList', pagingSearch)
    }
  }
}
//添加信息
export function addExcelTempleteInfo(info) {
  return {
    type: 'addExcelTempleteInfo',
    payload: {
      promise: api.put('/addExcelTempleteInfo', info)
    }
  }
}
//保存信息
export function editExcelTempleteInfo(info) {
  return {
    type: 'editExcelTempleteInfo',
    payload: {
      promise: api.put('/editExcelTempleteInfo', info)
    }
  }
}
//删除信息
export function deleteExcelTempleteInfo(info) {
  return {
    type: 'deleteExcelTempleteInfo',
    payload: {
      promise: api.put('/deleteExcelTempleteInfo', info)
    }
  }
}

//历史订单缴费确认列表
export function queryPageByHistory(info) {
  return {
    type: 'queryPageByHistory',
    payload: {
      promise: api.put('/queryPageByHistory', info)
    }
  }
}

//历史订单缴费确认
export function paymentByHistory(info) {
  return {
    type: 'paymentByHistory',
    payload: {
      promise: api.put('/paymentByHistory', info)
    }
  }
}



//日志查询
export function LogQuerySearch(info) {
  return {
    type: 'LogQuerySearch',
    payload: {
      promise: api.put('/LogQuerySearch', info)
    }
  }
}

//高校管理 - 列表
export function universityList(info) {
  return {
    type: 'universityList',
    payload: {
      promise: api.put('/universityList', info)
    }
  }
}

//高校管理 - 新增（编辑）
export function universityAddOrEdit(info) {
  return {
    type: 'universityAddOrEdit',
    payload: {
      promise: api.put('/universityAddOrEdit', info)
    }
  }
}





//================ 基础 > 订单缴费记录清除 =================
//查询用户列表
export function OrderPaymentRecordList(info) {
  return {
    type: 'OrderPaymentRecordList',
    payload: {
      promise: api.put('/OrderPaymentRecordList', info)
    }
  }
}



//删除数据
export function DeleteOrderPaymentRecord(info) {
  return {
    type: 'DeleteOrderPaymentRecord',
    payload: {
      promise: api.put('/DeleteOrderPaymentRecord', info)
    }
  }
}

//公海分部管理--列表
export function HighSeasBranchManagementList(info) {
  return {
    type: 'HighSeasBranchManagementList',
    payload: {
      promise: api.put('/HighSeasBranchManagementList', info)
    }
  }
}

//公海分部管理--新增
export function HighSeasBranchManagementAddBranch(info) {
  return {
    type: 'HighSeasBranchManagementAddBranch',
    payload: {
      promise: api.put('/HighSeasBranchManagementAddBranch', info)
    }
  }
}

//公海分部管理--删除
export function HighSeasBranchManagementDelete(info) {
  return {
    type: 'HighSeasBranchManagementDelete',
    payload: {
      promise: api.put('/HighSeasBranchManagementDelete', info)
    }
  }
}

//查询超级管理员页面列表
export function SuperAdministratorPageList(info) {
  return {
    type: 'SuperAdministratorPageList',
    payload: {
      promise: api.put('/SuperAdministratorPageList', info)
    }
  }
}

//超级管理员删除
export function SuperAdministratorPageDelete(info) {
  return {
    type: 'SuperAdministratorPageDelete',
    payload: {
      promise: api.put('/SuperAdministratorPageDelete', info)
    }
  }
}

//小程序菜单管理列表
export function SmallProgramMenuList(info) {
  return {
    type: 'SmallProgramMenuList',
    payload: {
      promise: api.put('/SmallProgramMenuList', info)
    }
  }
}

//小程序菜单管理 -- 新增
export function SmallProgramMenuAdd(info) {
  return {
    type: 'SmallProgramMenuAdd',
    payload: {
      promise: api.put('/SmallProgramMenuAdd', info)
    }
  }
}

//小程序菜单管理 -- 编辑
export function SmallProgramMenuEdit(info) {
  return {
    type: 'SmallProgramMenuEdit',
    payload: {
      promise: api.put('/SmallProgramMenuEdit', info)
    }
  }
}

//小程序菜单管理 -- 删除
export function SmallProgramMenuDelete(info) {
  return {
    type: 'SmallProgramMenuDelete',
    payload: {
      promise: api.put('/SmallProgramMenuDelete', info)
    }
  }
}

//角色管理，小程序模块
export function SmallProgramModleView(info) {
  return {
    type: 'SmallProgramModleView',
    payload: {
      promise: api.put('/SmallProgramModleView', info)
    }
  }
}

//角色管理，小程序模块 -- 编辑
export function SmallProgramModleEdit(info) {
  return {
    type: 'SmallProgramModleEdit',
    payload: {
      promise: api.put('/SmallProgramModleEdit', info)
    }
  }
}


//分部--首页-3日内需电咨人员
export function ConsultantWithinThreeDays(info) {
  return {
    type: 'ConsultantWithinThreeDays',
    payload: {
      promise: api.put('/ConsultantWithinThreeDays', info)
    }
  }
}


//分部--首页-首页统计参加其它分部活动学生数量提醒
export function DivisionalActivities(info) {
  return {
    type: 'DivisionalActivities',
    payload: {
      promise: api.put('/DivisionalActivities', info)
    }
  }
}

//分部--首页-1日内需电咨人员
export function ConsultantWithinOneDays(info) {
  return {
    type: 'ConsultantWithinOneDays',
    payload: {
      promise: api.put('/ConsultantWithinOneDays', info)
    }
  }
}

