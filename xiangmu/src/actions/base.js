import api from '../api'
//------------------- 项目管理 -----------------------
//获取列表
export function getItemList(pagingSearch) {
  return {
    type: 'ItemList',
    payload: {
      promise: api.put('/getItemList', pagingSearch)
    }
  }
}
//添加
export function addItem(formInfo) {
  return {
    type: 'AddItem',
    payload: {
      promise: api.put('/addItem', formInfo)
    }
  }
}
//修改
export function editItem(formInfo) {
  return {
    type: 'EditItem',
    payload: {
      promise: api.put('/editItem', formInfo)
    }
  }
}
//------------------- 科目管理 -----------------------
//获取列表
export function getCourseCategoryList(pagingSearch) {
  return {
    type: 'CourseCategoryList',
    payload: {
      promise: api.put('/getCourseCategoryList', pagingSearch)
    }
  }
}
//添加
export function addCourseCategory(formInfo) {
  return {
    type: 'AddCourseCategory',
    payload: {
      promise: api.put('/addCourseCategory', formInfo)
    }
  }
}
//修改
export function editCourseCategory(formInfo) {
  return {
    type: 'EditCourseCategory',
    payload: {
      promise: api.put('/editCourseCategory', formInfo)
    }
  }
}

//根据项目ids获取项目课程树
export function getItemCourseTreeByItemIds(formInfo) {
  return {
    type: 'GET_ITEM_COURSE_TREEBY_ITEMIDS',
    payload: {
      promise: api.put('/getItemCourseTreeByItemIds', formInfo)
    }
  }
}
//------------------- 课程管理 -----------------------
//获取列表
export function getCourseList(pagingSearch) {
  return {
    type: 'CourseList',
    payload: {
      promise: api.put('/getCourseList', pagingSearch)
    }
  }
}
//添加
export function addCourse(formInfo) {
  return {
    type: 'AddCourse',
    payload: {
      promise: api.put('/addCourse', formInfo)
    }
  }
}
//修改
export function editCourse(formInfo) {
  return {
    type: 'EditCourse',
    payload: {
      promise: api.put('/editCourse', formInfo)
    }
  }
}
//删除
export function delCourseByIds(info) {
  return {
    type: 'DeleteCourse',
    payload: {
      promise: api.put('/delCourseByIds',info)
    }
  }
}
//查询一个课程
export function getCourseBycourseId(info) {
  return {
    type: 'getCourseBycourseId',
    payload: {
      promise: api.put('/getCourseBycourseId',info)
    }
  }
}
//------------------- 用户负责项目管理-----------------------
//获取列表
export function getAdminUserList(pagingSearch) {
  return {
    type: 'GetAdminUserList',
    payload: {
      promise: api.put('/getAdminUserList', pagingSearch)
    }
  }
}
//------------------- 用户负责区域管理-更改区域-----------------------
//获取列表
export function updQuyuOfUser(pagingSearch) {
  return {
    type: 'updQuyuOfUser',
    payload: {
      promise: api.put('/updQuyuOfUser', pagingSearch)
    }
  }
}
//------------------- 用户负责区域管理-用户负责的区域-----------------------
//获取列表
export function qryQuyuOfUser(pagingSearch) {
  return {
    type: 'qryQuyuOfUser',
    payload: {
      promise: api.put('/qryQuyuOfUser', pagingSearch)
    }
  }
}
//批量设置项目
export function editBatchAdminUser(formInfo) {
  return {
    type: 'editBatchAdminUser',
    payload: {
      promise: api.put('/editBatchAdminUser', formInfo)
    }
  }
}
//查询用户负责项目列表
export function getItemListByUser(userId) {
  return {
    type: 'GET_ITEM_LIST_BY_USER',
    payload: {
      promise: api.put('/getItemListByUser', {userId: userId})
    }
  }
}
//商品管理-复制
export function productCopy(pagingSearch) {
  return {
    type: 'productCopy',
    payload: {
      promise: api.put('/productCopy', pagingSearch)
    }
  }
}
//查询分部下教学点列表
export function getTeachCenterList(pagingSearch) {
  return {
    type: 'GET_TEACH_CENTER_LIST',
    payload: {
      promise: api.put('/orgTeachCenterList', pagingSearch)
    }
  }
}
//查询分部下教学点列表
export function getTeachCenterByBranchId(pagingSearch) {
  return {
    type: 'GET_TEACH_CENTER_BY_BRANCH_ID',
    payload: {
      promise: api.put('/orgTeachCenterByBranchId', pagingSearch)
    }
  }
}
//查询分部下教学点下课程班列表
export function courseplanNameList(pagingSearch) {
  return {
    type: 'courseplanNameList',
    payload: {
      promise: api.put('/courseplanNameList', pagingSearch)
    }
  }
}
//查询 分部下启用的教学点
export function orgTeachCenterOnByBranchId(branchId: any) {
  return {
    type: 'GET_TEACH_CENTER_ON_BY_BRANCH_ID',
    payload: {
      promise: api.put('/orgTeachCenterOnByBranchId', {branchId: branchId})
    }
  }
}

//查询 缴费方式
export function getPaymentWay(pagingSearch) {
  return {
    type: 'getPaymentWay',
    payload: {
      promise: api.put('/getPaymentWay', pagingSearch)
    }
  }
}

//------------------- 用户负责高校及项目管理 -----------------------
//获取列表
export function getBranchAdminUserList(pagingSearch) {
  return {
    type: 'getBranchAdminUserList',
    payload: {
      promise: api.put('/getBranchAdminUserList', pagingSearch)
    }
  }
}
//批量设置高校
export function editBranchAdminUserUniversities(formInfo) {
  return {
    type: 'editBranchAdminUserUniversities',
    payload: {
      promise: api.put('/editBranchAdminUserUniversities', formInfo)
    }
  }
}
//查询所有高校
export function getAllUniversityList(formInfo) {
  return {
    type: 'getAllUniversityList',
    payload: {
      promise: api.put('/getAllUniversityList', formInfo)
    }
  }
}

//查询除了已设置高校外的所有高校
export function getOtherUniversityList(formInfo) {
  return {
    type: 'getOtherUniversityList',
    payload: {
      promise: api.put('/getOtherUniversityList', formInfo)
    }
  }
}

//查询某个用户的负责高校
export function getUniversitiesByUser(formInfo) {
  return {
    type: 'getUniversitiesByUser',
    payload: {
      promise: api.put('/getUniversitiesByUser', formInfo)
    }
  }
}

//查询某个用户的负责教学点
export function getTeacheringByUser(formInfo) {
  return {
    type: 'getTeacheringByUser',
    payload: {
      promise: api.put('/getTeacheringByUser', formInfo)
    }
  }
}
//删除某个用户的负责教学点
export function deleteTeacheringByUser(formInfo) {
  return {
    type: 'deleteTeacheringByUser',
    payload: {
      promise: api.put('/deleteTeacheringByUser', formInfo)
    }
  }
}
//查询某个用户的尚未管理的教学点
export function getNotTeacheringByUser(formInfo) {
  return {
    type: 'getNotTeacheringByUser',
    payload: {
      promise: api.put('/getNotTeacheringByUser', formInfo)
    }
  }
}
//批量设置多用户多个教学点权限
export function BatchSettingTeacheringByUser(formInfo) {
  return {
    type: 'BatchSettingTeacheringByUser',
    payload: {
      promise: api.put('/BatchSettingTeacheringByUser', formInfo)
    }
  }
}
//删除选中的负责高校
export function delUserUniversity(formInfo) {
  return {
    type: 'delUserUniversity',
    payload: {
      promise: api.put('/delUserUniversity', formInfo)
    }
  }
}

//------------------- 用户负责分部管理-----------------------
//获取列表
export function getBranchParternList(pagingSearch) {
  return {
    type: 'getBranchParternList',
    payload: {
      promise: api.put('/getBranchParternList', pagingSearch)
    }
  }
}

//修改
export function editBranchPartern(formInfo) {
  return {
    type: 'editBranchPartern',
    payload: {
      promise: api.put('/editBranchPartern', formInfo)
    }
  }
}


//获取用户负责的分部列表
export function qryBranchListByUserVo(pagingSearch) {
  return {
    type: 'qryBranchListByUserVo',
    payload: {
      promise: api.put('/qryBranchListByUserVo', pagingSearch)
    }
  }
}

//获取管理分部列表
export function getOrganizationVoList(pagingSearch) {
  return {
    type: 'getOrganizationVoList',
    payload: {
      promise: api.put('/getOrganizationVoList', pagingSearch)
    }
  }
}

//获取大区管理分部列表--设置分部
export function LargeAreaGetOrganizationVoList(pagingSearch) {
  return {
    type: 'LargeAreaGetOrganizationVoList',
    payload: {
      promise: api.put('/LargeAreaGetOrganizationVoList', pagingSearch)
    }
  }
}



//获取大区管理分部列表 -- 设置分部 -- 修改
export function LargeAreaGetOrganizationVoListEdit(pagingSearch) {
  return {
    type: 'LargeAreaGetOrganizationVoListEdit',
    payload: {
      promise: api.put('/LargeAreaGetOrganizationVoListEdit', pagingSearch)
    }
  }
}


//获取大区管理分部列表 -- 设置用户来源--列表
export function SettingUserSourcesList(pagingSearch) {
  return {
    type: 'SettingUserSourcesList',
    payload: {
      promise: api.put('/SettingUserSourcesList', pagingSearch)
    }
  }
}


//获取大区管理分部列表 -- 设置用户来源--修改
export function SettingUserSources(pagingSearch) {
  return {
    type: 'SettingUserSources',
    payload: {
      promise: api.put('/SettingUserSources', pagingSearch)
    }
  }
}


//获取全部分部列表
export function queryAllBranch(pagingSearch) {
  return {
    type: 'queryAllBranch',
    payload: {
      promise: api.put('/queryAllBranch', pagingSearch)
    }
  }
}

//获取某个用户负责的高校
export function getUniverstyByToken(pagingSearch) {
  return {
    type: 'getUniverstyByToken',
    payload: {
      promise: api.put('/getUniverstyByToken', pagingSearch)
    }
  }
}

//------------------- 分部的区域管理-----------------------
//获取区域列表
export function getAreaByBranchList(pagingSearch) {
  return {
    type: 'getAreaByBranchList',
    payload: {
      promise: api.put('/getAreaByBranchList', pagingSearch)
    }
  }
}

//修改区域
export function editAreaByBranch(formInfo) {
  return {
    type: 'editAreaByBranch',
    payload: {
      promise: api.put('/editAreaByBranch', formInfo)
    }
  }
}
//增加区域
export function addAreaByBranch(formInfo) {
  return {
    type: 'addAreaByBranch',
    payload: {
      promise: api.put('/addAreaByBranch', formInfo)
    }
  }
}

//获取设置-新增用户列表
export function getUserByNotInList(pagingSearch) {
  return {
    type: 'getUserByNotInList',
    payload: {
      promise: api.put('/getUserByNotInList', pagingSearch)
    }
  }
}

//获取设置用户列表
export function getUserByAreaList(pagingSearch) {
  return {
    type: 'getUserByAreaList',
    payload: {
      promise: api.put('/getUserByAreaList', pagingSearch)
    }
  }
}

//设置用户-添加用户列表
export function addUserByAreaId(pagingSearch) {
  return {
    type: 'addUserByAreaId',
    payload: {
      promise: api.put('/addUserByAreaId', pagingSearch)
    }
  }
}


//设置用户-删除用户列表
export function deleteUserByUsersId(pagingSearch) {
  return {
    type: 'deleteUserByUsersId',
    payload: {
      promise: api.put('/deleteUserByUsersId', pagingSearch)
    }
  }
}
//用户负责的区域列表
export function selectAreaByUser(pagingSearch) {
  return {
    type: 'selectAreaByUser',
    payload: {
      promise: api.put('/selectAreaByUser', pagingSearch)
    }
  }
}
//分部下的所有区域
export function selectAreaByBranchId(pagingSearch) {
  return {
    type: 'selectAreaByBranchId',
    payload: {
      promise: api.put('/selectAreaByBranchId', pagingSearch)
    }
  }
}

//------------------- 教学点管理-----------------------
//获取分部下的教学点列表
export function getTeachCenterByBranchIdList(pagingSearch) {
  return {
    type: 'getTeachCenterByBranchIdList',
    payload: {
      promise: api.put('/getTeachCenterByBranchIdList', pagingSearch)
    }
  }
}
//新增分部下的教学点
export function addTeachCenter(pagingSearch) {
  return {
    type: 'addTeachCenter',
    payload: {
      promise: api.put('/addTeachCenter', pagingSearch)
    }
  }
}
//获取该分部下的高校列表
export function getUniversityByBranchId(pagingSearch) {
  return {
    type: 'getUniversityByBranchId',
    payload: {
      promise: api.put('/getUniversityByBranchId', pagingSearch)
    }
  }
}

//获取该分部下的高校校区列表
export function getCampusByUniversityId(pagingSearch) {
  return {
    type: 'getCampusByUniversityId',
    payload: {
      promise: api.put('/getCampusByUniversityId', pagingSearch)
    }
  }
}

//修改分部下的教学点
export function editTeachCenter(pagingSearch) {
  return {
    type: 'editTeachCenter',
    payload: {
      promise: api.put('/editTeachCenter', pagingSearch)
    }
  }
}
//删除分部下的教学点
export function deleteTeachCenter(pagingSearch) {
  return {
    type: 'deleteTeachCenter',
    payload: {
      promise: api.put('/deleteTeachCenter', pagingSearch)
    }
  }
}
//查询教学点下的用户
export function getUserByTeachList(pagingSearch) {
  return {
    type: 'getUserByTeachList',
    payload: {
      promise: api.put('/getUserByTeachList', pagingSearch)
    }
  }
}

//查询教学点下的用户 新写
export function getTeacherList(pagingSearch) {
  return {
    type: 'getTeacherList',
    payload: {
      promise: api.put('/getTeacherList', pagingSearch)
    }
  }
}

//删除教学点下的用户
export function deleteUserByIdOnTechCenter(pagingSearch) {
  return {
    type: 'deleteUserByIdOnTechCenter',
    payload: {
      promise: api.put('/deleteUserByIdOnTechCenter', pagingSearch)
    }
  }
}
//查询不在此教学点下的用户
export function getUserByNotTeachList(pagingSearch) {
  return {
    type: 'getUserByNotTeachList',
    payload: {
      promise: api.put('/getUserByNotTeachList', pagingSearch)
    }
  }
}
//新增此教学点下的用户
export function addUserByTeachCenterId(pagingSearch) {
  return {
    type: 'addUserByTeachCenterId',
    payload: {
      promise: api.put('/addUserByTeachCenterId', pagingSearch)
    }
  }
}

//------------------- 班型管理-----------------------
//查询班型列表
export function getClassList(pagingSearch) {
  return {
    type: 'getClassList',
    payload: {
      promise: api.put('/getClassList', pagingSearch)
    }
  }
}
//修改班型
export function editClass(pagingSearch) {
  return {
    type: 'editClass',
    payload: {
      promise: api.put('/editClass', pagingSearch)
    }
  }
}
//新增
export function addClass(pagingSearch) {
  return {
    type: 'addClass',
    payload: {
      promise: api.put('/addClass', pagingSearch)
    }
  }
}
//获取商品协议类型
export function getAllStudyAgreement(pagingSearch) {
  return {
    type: 'getAllStudyAgreement',
    payload: {
      promise: api.put('/getAllStudyAgreement', pagingSearch)
    }
  }
}


//------------------- 高校管理-----------------------
//查询列表
export function getUniversityList(pagingSearch) {
  return {
    type: 'getUniversityList',
    payload: {
      promise: api.put('/getUniversityList', pagingSearch)
    }
  }
}
//修改
export function editUniversity(pagingSearch) {
  return {
    type: 'editUniversity',
    payload: {
      promise: api.put('/editUniversity', pagingSearch)
    }
  }
}
//新增
export function addUniversity(pagingSearch) {
  return {
    type: 'addUniversity',
    payload: {
      promise: api.put('/addUniversity', pagingSearch)
    }
  }
}
//删除
export function deleteUniversity(pagingSearch) {
  return {
    type: 'deleteUniversity',
    payload: {
      promise: api.put('/deleteUniversity', pagingSearch)
    }
  }
}

//-------------------  总部教学点查询管理-----------------------
//查询列表
export function getZbTeachCenterList(pagingSearch) {
  return {
    type: 'getZbTeachCenterList',
    payload: {
      promise: api.put('/getZbTeachCenterList', pagingSearch)
    }
  }
}
//查询下拉分部列表
export function getBranchList(pagingSearch) {
  return {
    type: 'getBranchList',
    payload: {
      promise: api.put('/getBranchList', pagingSearch)
    }
  }
}

//-------------------  总部公司账户管理-----------------------
//查询列表
export function getBankAccountList(pagingSearch) {
  return {
    type: 'getBankAccountList',
    payload: {
      promise: api.put('/getBankAccountList', pagingSearch)
    }
  }
}
//增加
export function addBankAccount(pagingSearch) {
  return {
    type: 'addBankAccount',
    payload: {
      promise: api.put('/addBankAccount', pagingSearch)
    }
  }
}
//编辑
export function editBankAccount(pagingSearch) {
  return {
    type: 'editBankAccount',
    payload: {
      promise: api.put('/editBankAccount', pagingSearch)
    }
  }
}
//根椐收费方查询相关大客户
export function getByPayeeType(partnerName) {
  return {
    type: 'getByPayeeType',
    payload: {
      promise: api.put('/getByPayeeType', {partnerName:partnerName})
    }
  }
}
//-------------------  POS机管理-----------------------
//查询列表
export function getPosList(pagingSearch) {
  return {
    type: 'getPosList',
    payload: {
      promise: api.put('/getPosList', pagingSearch)
    }
  }
}
//编辑
export function editPos(pagingSearch) {
  return {
    type: 'editPos',
    payload: {
      promise: api.put('/editPos', pagingSearch)
    }
  }
}
//增加
export function addPos(pagingSearch) {
  return {
    type: 'addPos',
    payload: {
      promise: api.put('/addPos', pagingSearch)
    }
  }
}
//查询收费方列表
export function getPosAccountTypeList(pagingSearch) {
  return {
    type: 'getPosAccountTypeList',
    payload: {
      promise: api.put('/getPosAccountTypeList', pagingSearch)
    }
  }
}
//批量设置分部
export function updateBranchBatch(pagingSearch) {
  return {
    type: 'updateBranchBatch',
    payload: {
      promise: api.put('/updateBranchBatch', pagingSearch)
    }
  }
}
//导入Pose机信息
export function importPos(pagingSearch) {
  return {
    type: 'importPos',
    payload: {
      promise: api.put('/importPos', pagingSearch)
    }
  }
}

//------------------- 面授延期管理-----------------------
//查询列表
export function getFaceToFaceDelayList(pagingSearch) {
  return {
    type: 'getFaceToFaceDelayList',
    payload: {
      promise: api.put('/getFaceToFaceDelayList', pagingSearch)
    }
  }
}

//查询用户的教学点
export function getTeachCenterByUserList(branchId) {
  return {
    type: 'getTeachCenterByUserList',
    payload: {
      promise: api.put('/getTeachCenterByUserList', {branchId:branchId})
    }
  }
}

//终止延期
export function editFinishStatusByPrimaryKey(pagingSearch) {
  return {
    type: 'editFinishStatusByPrimaryKey',
    payload: {
      promise: api.put('/editFinishStatusByPrimaryKey', pagingSearch)
    }
  }
}
//------------------- 学籍规则管理-----------------------
//查询规则列表
export function getStudyRuleList(pagingSearch) {
  return {
    type: 'getStudyRuleList',
    payload: {
      promise: api.put('/getStudyRuleList', pagingSearch)
    }
  }
}
//新增规则 & 修改规则
export function studyRuleUpd(pagingSearch) {
  return {
    type: 'studyRuleUpd',
    payload: {
      promise: api.put('/studyRuleUpd', pagingSearch)
    }
  }
}

//删除规则 && 删除特殊科目
export function studyRuleDel(pagingSearch) {
  return {
    type: 'studyRuleDel',
    payload: {
      promise: api.put('/studyRuleDel', pagingSearch)
    }
  }
}
//特殊科目列表
export function specialCourseList(pagingSearch) {
  return {
    type: 'specialCourseList',
    payload: {
      promise: api.put('/specialCourseList', pagingSearch)
    }
  }
}
//未设置普通科目列表
export function normalCourseList(pagingSearch) {
  return {
    type: 'normalCourseList',
    payload: {
      promise: api.put('/normalCourseList', pagingSearch)
    }
  }
}
//新增特殊科目
export function specialCourseAdd(pagingSearch) {
  return {
    type: 'specialCourseAdd',
    payload: {
      promise: api.put('/specialCourseAdd', pagingSearch)
    }
  }
}
//编辑修改特殊科目
export function specialCourseUpd(pagingSearch) {
  return {
    type: 'specialCourseUpd',
    payload: {
      promise: api.put('/specialCourseUpd', pagingSearch)
    }
  }
}
//------------------- 分部的招生管理管理-----------------------

//------------------- 学生报班管理-----------------------
//查询列表
export function getCourseArrangeList(pagingSearch) {
  return {
    type: 'getCourseArrangeList',
    payload: {
      promise: api.put('/getCourseArrangeList', pagingSearch)
    }
  }
}

//学生-学生列表
export function selectCourseArrangeStudentList(pagingSearch) {
  return {
    type: 'selectCourseArrangeStudentList',
    payload: {
      promise: api.put('/selectCourseArrangeStudentList', pagingSearch)
    }
  }
}

//学生-新增学生-学生列表
export function selectAddCourseArrangeStudentList(pagingSearch) {
  return {
    type: 'selectStudentList',
    payload: {
      promise: api.put('/selectStudentList', pagingSearch)
    }
  }
}

//面授完成
export function updateFinishStatus(pagingSearch) {
  return {
    type: 'updateFinishStatus',
    payload: {
      promise: api.put('/updateFinishStatus', pagingSearch)
    }
  }
}

//批量删除学生
export function deleteByPrimaryKeyForBatch(pagingSearch) {
  return {
    type: 'deleteByPrimaryKeyForBatch',
    payload: {
      promise: api.put('/deleteByPrimaryKeyForBatch', pagingSearch)
    }
  }
}

//学生-新增学生-确定按钮
export function insertCourseStudentBatch(pagingSearch) {
  return {
    type: 'insertCourseStudentBatch',
    payload: {
      promise: api.put('/insertCourseStudentBatch', pagingSearch)
    }
  }
}

//学服-项目考季-考季管理 分页查询
export function examBatchSelectByItem(pagingSearch) {
  return {
    type: 'examBatchSelectByItem',
    payload: {
      promise: api.put('/examBatchSelectByItem', pagingSearch)
    }
  }
}
//学服-项目考季-考季管理 新增
export function examBatchAdd(pagingSearch) {
  return {
    type: 'examBatchAdd',
    payload: {
      promise: api.put('/examBatchAdd', pagingSearch)
    }
  }
}
//学服-项目考季-考季管理 修改
export function examBatchUpd(pagingSearch) {
  return {
    type: 'examBatchUpd',
    payload: {
      promise: api.put('/examBatchUpd', pagingSearch)
    }
  }
}
//学服-项目考季-考季管理 删除
export function examBatchDel(pagingSearch) {
  return {
    type: 'examBatchDel',
    payload: {
      promise: api.put('/examBatchDel', pagingSearch)
    }
  }
}

//（总部） 项目课程阶段管理 查询列表
export function queryItemStageVosList(pagingSearch) {
  return {
    type: 'queryItemStageVosList',
    payload: {
      promise: api.put('/queryItemStageVosList', pagingSearch)
    }
  }
}
//（总部） 项目课程阶段管理 新增/编辑
export function addOrEditItemStage(pagingSearch) {
  return {
    type: 'addOrEditItemStage',
    payload: {
      promise: api.put('/addOrEditItemStage', pagingSearch)
    }
  }
}
//（总部） 项目课程阶段管理 删除
export function delItemStage(pagingSearch) {
  return {
    type: 'delItemStage',
    payload: {
      promise: api.put('/delItemStage', pagingSearch)
    }
  }
}
//------------------- 分部-学服学务-班级管理-考勤管理-----------------------
//查询列表
export function selectAttendanceList(pagingSearch) {
  return {
    type: 'selectAttendanceList',
    payload: {
      promise: api.put('/selectAttendanceList', pagingSearch)
    }
  }
}

//------------------- 分部-学服学务-班级管理-考勤管理-编辑讲师考勤-----------------------
//查询列表
export function selectAttendanceTeacher(pagingSearch) {
  return {
    type: 'selectAttendanceTeacher',
    payload: {
      promise: api.put('/selectAttendanceTeacher', pagingSearch)
    }
  }
}


//学生数查询列表
export function selectCourseArrangeStudentListForAttend(pagingSearch) {
  return {
    type: 'selectCourseArrangeStudentListForAttend',
    payload: {
      promise: api.put('/selectCourseArrangeStudentListForAttend', pagingSearch)
    }
  }
}

//分部-考勤管理-学生数-编辑
export function updateAttendStatus(pagingSearch) {
  return {
    type: 'updateAttendStatus',
    payload: {
      promise: api.put('/updateAttendStatus', pagingSearch)
    }
  }
}
 

//分部-考勤二维码打印列表
export function TwoDimensionalList(pagingSearch) {
  return {
    type: 'TwoDimensionalList',
    payload: {
      promise: api.put('/TwoDimensionalList', pagingSearch)
    }
  }
}


//分部-考勤二维码打印 -- 二维码详情页
export function TwoDimensionalNew(pagingSearch) {
  return {
    type: 'TwoDimensionalNew',
    payload: {
      promise: api.put('/TwoDimensionalNew', pagingSearch)
    }
  }
}


//分部-考勤二维码打印 -- 二维码图
export function TwoDimensionalImg(pagingSearch) {
  return {
    type: 'TwoDimensionalImg',
    payload: {
      promise: api.put('/TwoDimensionalImg', pagingSearch)
    }
  }
}

//分部-考勤二维码打印 -- 批量导出二维码
export function TwoDimensionalBatchExport(pagingSearch) {
  return {
    type: 'TwoDimensionalBatchExport',
    payload: {
      promise: api.put('/TwoDimensionalBatchExport', pagingSearch)
    }
  }
}


//------------------- 分部-学服学务-----------------------


//分部-学服学务-课程管理-延期申请-列表
export function ApplicationForPostponementList(pagingSearch) {
  return {
    type: 'ApplicationForPostponementList',
    payload: {
      promise: api.put('/ApplicationForPostponementList', pagingSearch)
    }
  }
}

//分部-学服学务-课程管理-延期审核-查看
export function ApplicationForPostponementSee(pagingSearch) {
  return {
    type: 'ApplicationForPostponementSee',
    payload: {
      promise: api.put('/ApplicationForPostponementSee', pagingSearch)
    }
  }
}



//分部-学服学务-课程管理-延期审核-批量申请
export function ApplicationForPostponementBachApply(pagingSearch) {
  return {
    type: 'ApplicationForPostponementBachApply',
    payload: {
      promise: api.put('/ApplicationForPostponementBachApply', pagingSearch)
    }
  }
}




//分部-学服学务-课程管理-延期审核管理、特殊延期初审、总部延期终审-批量申请
export function DelayManagementList(pagingSearch) {
  return {
    type: 'DelayManagementList',
    payload: {
      promise: api.put('/DelayManagementList', pagingSearch)
    }
  }
}

//分部-学服学务-课程管理-延期审核管理-查看
export function DeferredAuditSee(pagingSearch) {
  return {
    type: 'DeferredAuditSee',
    payload: {
      promise: api.put('/DeferredAuditSee', pagingSearch)
    }
  }
}




//分部-学服学务-课程管理-延期审核管理-批量删除
export function DeferredAuditDelete(pagingSearch) {
  return {
    type: 'DeferredAuditDelete',
    payload: {
      promise: api.put('/DeferredAuditDelete', pagingSearch)
    }
  }
}



//分部-学服学务-课程管理-延期审核管理-审核
export function DeferredAuditApply(pagingSearch) {
  return {
    type: 'DeferredAuditApply',
    payload: {
      promise: api.put('/DeferredAuditApply', pagingSearch)
    }
  }
}



//分部-学服学务-课程管理-特殊延期初审-批量审核
export function DeferredAuditBatchApply(pagingSearch) {
  return {
    type: 'DeferredAuditBatchApply',
    payload: {
      promise: api.put('/DeferredAuditBatchApply', pagingSearch)
    }
  }
}






//总部-学服学务-网络课程管理-延期终审-审核
export function NetAuditApply(pagingSearch) {
  return {
    type: 'NetAuditApply',
    payload: {
      promise: api.put('/NetAuditApply', pagingSearch)
    }
  }
}



//总部-学服学务-网络课程管理-延期终审-批量审核
export function NetAuditBatchApply(pagingSearch) {
  return {
    type: 'NetAuditBatchApply',
    payload: {
      promise: api.put('/NetAuditBatchApply', pagingSearch)
    }
  }
}


//总部-学服学务-开课计划审核/开课计划查询/(分部，学服学务，开课计划管理)-点击审核或查看里的学生列表
export function StudentsWhoStartTheProgram(pagingSearch) {
  return {
    type: 'StudentsWhoStartTheProgram',
    payload: {
      promise: api.put('/StudentsWhoStartTheProgram', pagingSearch)
    }
  }
}

//总部-学服学务-开课计划审核/开课计划查询/(分部，学服学务，开课计划管理)-所属教学点下拉框
export function AlreadyTeachingPointDropdown(pagingSearch) {
  return {
    type: 'AlreadyTeachingPointDropdown',
    payload: {
      promise: api.put('/AlreadyTeachingPointDropdown', pagingSearch)
    }
  }
}

//总部-财务管理-预收款情况统计
export function ListOfPrepaidStatistics(pagingSearch) {
  return {
    type: 'ListOfPrepaidStatistics',
    payload: {
      promise: api.put('/ListOfPrepaidStatistics', pagingSearch)
    }
  }
}


//总部-财务管理-预收款情况统计--缴费订单
export function ListOfPrepaidPaymentOrder(pagingSearch) {
  return {
    type: 'ListOfPrepaidPaymentOrder',
    payload: {
      promise: api.put('/ListOfPrepaidPaymentOrder', pagingSearch)
    }
  }
}




//总部-财务管理-预收款情况统计--退费订单
export function ListOfPrepaidRefundOrder(pagingSearch) {
  return {
    type: 'ListOfPrepaidRefundOrder',
    payload: {
      promise: api.put('/ListOfPrepaidRefundOrder', pagingSearch)
    }
  }
}




//总部-财务管理-预收款情况统计--各种费用
export function VariousOfPrepaidCostOrder(pagingSearch) {
  return {
    type: 'VariousOfPrepaidCostOrder',
    payload: {
      promise: api.put('/VariousOfPrepaidCostOrder', pagingSearch)
    }
  }
}


//   学生报班管理--学生所属教学点---下拉框


export function TeachingPointDropdown(pagingSearch) {
  return {
    type: 'TeachingPointDropdown',
    payload: {
      promise: api.put('/TeachingPointDropdown', pagingSearch)
    }
  }
}



// ===========总部====网课订单及激活统计表===========

//新增激活课程   列表
export function NewActivationCourseList(pagingSearch) {
  return {
    type: 'NewActivationCourseList',
    payload: {
      promise: api.put('/NewActivationCourseList', pagingSearch)
    }
  }
}



//------------------- 分部-活动管理-----------------------
//查询列表
export function queryPage(pagingSearch) {
  return {
    type: 'queryPage',
    payload: {
      promise: api.put('/queryPage', pagingSearch)
    }
  }
}

//负责人下拉列表
export function selectUserByAreaId(pagingSearch) {
  return {
    type: 'selectUserByAreaId',
    payload: {
      promise: api.put('/selectUserByAreaId', pagingSearch)
    }
  }
}

//新增活动接口
export function addActivity(pagingSearch) {
  return {
    type: 'addActivity',
    payload: {
      promise: api.put('/addActivity', pagingSearch)
    }
  }
}

//根据活动id查询活动详情
export function getActivityDetail(pagingSearch) {
  return {
    type: 'getActivityDetail',
    payload: {
      promise: api.put('/getActivityDetail', pagingSearch)
    }
  }
}

//修改活动
export function updateActivity(pagingSearch) {
  return {
    type: 'updateActivity',
    payload: {
      promise: api.put('/updateActivity', pagingSearch)
    }
  }
}

//删除活动
export function deleteById(pagingSearch) {
  return {
    type: 'deleteById',
    payload: {
      promise: api.put('/deleteById', pagingSearch)
    }
  }
}

//活动管理-学生-查询列表
export function participateStudentList(pagingSearch) {
  return {
    type: 'participateStudentList',
    payload: {
      promise: api.put('/participateStudentList', pagingSearch)
    }
  }
}

//活动管理-学生-新增学生-查询列表
export function addStudentList(pagingSearch) {
  return {
    type: 'addStudentList',
    payload: {
      promise: api.put('/addStudentList', pagingSearch)
    }
  }
}

//活动管理-学生-新增学生-确定
export function addActivityAndStudent(pagingSearch) {
  return {
    type: 'addActivityAndStudent',
    payload: {
      promise: api.put('/addActivityAndStudent', pagingSearch)
    }
  }
}

//活动管理-学生-删除
export function deleteByActivityStudentIds(pagingSearch) {
  return {
    type: 'deleteByActivityStudentIds',
    payload: {
      promise: api.put('/deleteByActivityStudentIds', pagingSearch)
    }
  }
}

//根据学生id查询咨询情况
export function qryAskByStudentId(pagingSearch) {
  return {
    type: 'qryAskByStudentId',
    payload: {
      promise: api.put('/qryAskByStudentId', pagingSearch)
    }
  }
}



//转班情况
export function TransferStatusSearch(pagingSearch) {
  return {
    type: 'TransferStatusSearch',
    payload: {
      promise: api.put('/TransferStatusSearch', pagingSearch)
    }
  }
}


//获取最新招生季
export function selectNowRecruitBatch(pagingSearch) {
  return {
    type: 'selectNowRecruitBatch',
    payload: {
      promise: api.put('/selectNowRecruitBatch', pagingSearch)
    }
  }
}


//===== 调用第三方接口 支付 生成支付二维码
export function getFeeQrCode(info) {
  return {
    type: 'getFeeQrCode',
    payload: {
      promise: api.put('/getFeeQrCode', info)
    }
  }
}

//外呼任务下拉列表
export function OutCallTask(info) {
  return {
    type: 'OutCallTask',
    payload: {
      promise: api.put('/OutCallTask', info)
    }
  }
}


//新增外呼任务

export function addOutGoingTask(pagingSearch) {
  return {
    type: 'addOutGoingTask',
    payload: {
      promise: api.put('/addOutGoingTask', pagingSearch)
    }
  }
}

//编辑外呼任务

export function updateOutGoingTask(pagingSearch) {
  return {
    type: 'updateOutGoingTask',
    payload: {
      promise: api.put('/updateOutGoingTask', pagingSearch)
    }
  }
}
//编辑外呼任务前的数据查找

export function searchOutGoingTaskList(pagingSearch) {
  return {
    type: 'searchOutGoingTaskList',
    payload: {
      promise: api.put('/searchOutGoingTaskList', pagingSearch)
    }
  }
}
//外呼任务提交
export function SubmissionNew(pagingSearch) {
  return {
    type: 'SubmissionNew',
    payload: {
      promise: api.put('/SubmissionNew', pagingSearch)
    }
  }
}
//外呼任务删除
export function deleteOutGoingTask(pagingSearch) {
  return {
    type: 'deleteOutGoingTask',
    payload: {
      promise: api.put('/deleteOutGoingTask', pagingSearch)
    }
  }
}


//外呼任务学生数查询列表
export function OutCallTaskStudentNum(pagingSearch) {
  return {
    type: 'OutCallTaskStudentNum',
    payload: {
      promise: api.put('/OutCallTaskStudentNum', pagingSearch)
    }
  }
}

//外呼任务学生数删除
export function OutCallTaskStudentNumDelete(pagingSearch) {
  return {
    type: 'OutCallTaskStudentNumDelete',
    payload: {
      promise: api.put('/OutCallTaskStudentNumDelete', pagingSearch)
    }
  }
}


//外呼任务产生机会
export function OutCallTaskCreateChange(pagingSearch) {
  return {
    type: 'OutCallTaskCreateChange',
    payload: {
      promise: api.put('/OutCallTaskCreateChange', pagingSearch)
    }
  }
}


//外呼机会查看列表
export function OutGoingTaskOppoList(pagingSearch) {
  return {
    type: 'OutGoingTaskOppoList',
    payload: {
      promise: api.put('/OutGoingTaskOppoList', pagingSearch)
    }
  }
}


//外呼机会到访反馈的批量到访
export function OutGoingTaskBatchArrive(pagingSearch) {
  return {
    type: 'OutGoingTaskBatchArrive',
    payload: {
      promise: api.put('/OutGoingTaskBatchArrive', pagingSearch)
    }
  }
}

//外呼机会到访反馈的批量未到访
export function OutGoingTaskBatcNohArrive(pagingSearch) {
  return {
    type: 'OutGoingTaskBatcNohArrive',
    payload: {
      promise: api.put('/OutGoingTaskBatcNohArrive', pagingSearch)
    }
  }
}

//共享机会列表（那两个菜单用同一个）

export function ShareOpportunityList(pagingSearch) {
  return {
    type: 'ShareOpportunityList',
    payload: {
      promise: api.put('/ShareOpportunityList', pagingSearch)
    }
  }
}


//共享机会查看

export function ShareOpportunitySee(pagingSearch) {
  return {
    type: 'ShareOpportunitySee',
    payload: {
      promise: api.put('/ShareOpportunitySee', pagingSearch)
    }
  }
}

//共享机会编辑保存

export function ShareOpportunityPreservation(pagingSearch) {
  return {
    type: 'ShareOpportunityPreservation',
    payload: {
      promise: api.put('/ShareOpportunityPreservation', pagingSearch)
    }
  }
}



//===== 学服学务-班级管理-学习情况列表查询
export function getStudySituation(info) {
  return {
    type: 'getStudySituation',
    payload: {
      promise: api.put('/getStudySituation', info)
    }
  }
}


//===== 学服学务-班级管理-学习情况列表查询
export function getStudySituationInfo(info) {
  return {
    type: 'getStudySituationInfo',
    payload: {
      promise: api.put('/getStudySituationInfo', info)
    }
  }
}


//===== 学服学务-班级管理-考勤情况统计
export function AttendanceStatisticsList(info) {
  return {
    type: 'AttendanceStatisticsList',
    payload: {
      promise: api.put('/AttendanceStatisticsList', info)
    }
  }
}

//===== 总部==考情明细查询
export function AttendanceDetailsList(info) {
  return {
    type: 'AttendanceDetailsList',
    payload: {
      promise: api.put('/AttendanceDetailsList', info)
    }
  }
}

//===== 分部==资料申请管理
export function DataApplicationManagementList(info) {
  return {
    type: 'DataApplicationManagementList',
    payload: {
      promise: api.put('/DataApplicationManagementList', info)
    }
  }
}



//===== 分部==资料申请管理==查看
export function DataApplicationViewList(info) {
  return {
    type: 'DataApplicationViewList',
    payload: {
      promise: api.put('/DataApplicationViewList', info)
    }
  }
}

//===== 分部==资料申请管理==查看==资料详情信息
export function DetailsOfInformation(info) {
  return {
    type: 'DetailsOfInformation',
    payload: {
      promise: api.put('/DetailsOfInformation', info)
    }
  }
}


//===== 分部==资料申请管理==编辑
export function DetailsOfEdit(info) {
  return {
    type: 'DetailsOfEdit',
    payload: {
      promise: api.put('/DetailsOfEdit', info)
    }
  }
}


//===== 分部==资料申请管理==选择资料，确认
export function DetailsOfChoiceSure(info) {
  return {
    type: 'DetailsOfChoiceSure',
    payload: {
      promise: api.put('/DetailsOfChoiceSure', info)
    }
  }
}



//===== 分部==资料申请管理==选择资料，提交
export function SubmissionOfInformation(info) {
  return {
    type: 'SubmissionOfInformation',
    payload: {
      promise: api.put('/SubmissionOfInformation', info)
    }
  }
}


//===== 分部==资料申请管理==选择资料，提交
export function SubmissionOfDelete(info) {
  return {
    type: 'SubmissionOfDelete',
    payload: {
      promise: api.put('/SubmissionOfDelete', info)
    }
  }
}


//===== 分部==资料申请管理==到件反馈
export function FeedbackTParts(info) {
  return {
    type: 'FeedbackTParts',
    payload: {
      promise: api.put('/FeedbackTParts', info)
    }
  }
}

//===== 分部==资料申请管理==新增
export function NewDataManagement(info) {
  return {
    type: 'NewDataManagement',
    payload: {
      promise: api.put('/NewDataManagement', info)
    }
  }
}



//===== 分部==资料申请管理==公共子资料页查询
export function PublicSubpageQuery(info) {
  return {
    type: 'PublicSubpageQuery',
    payload: {
      promise: api.put('/PublicSubpageQuery', info)
    }
  }
}

//===== 分部==资料领取查询==列表
export function BrochureReleaseDesk(info) {
  return {
    type: 'BrochureReleaseDesk',
    payload: {
      promise: api.put('/BrochureReleaseDesk', info)
    }
  }
}

//===== 分部==资料领取查询==新增资料查询
export function NewlyReceivedList(info) {
  return {
    type: 'NewlyReceivedList',
    payload: {
      promise: api.put('/NewlyReceivedList', info)
    }
  }
}



//===== 分部==资料领取查询==新增资料查询 => 资料查询
export function NewlyReceivedListData(info) {
  return {
    type: 'NewlyReceivedListData',
    payload: {
      promise: api.put('/NewlyReceivedListData', info)
    }
  }
}



//===== 分部==资料领取查询==新增资料查询 => 保存编辑
export function NewDataPreservation(info) {
  return {
    type: 'NewDataPreservation',
    payload: {
      promise: api.put('/NewDataPreservation', info)
    }
  }
}


//===== 分部==课程班随教学点联动
export function TeachingPointCourseFB(info) {
  return {
    type: 'TeachingPointCourseFB',
    payload: {
      promise: api.put('/TeachingPointCourseFB', info)
    }
  }
}


//===== 总部==课程班随教学点联动
export function TeachingPointCourse(info) {
  return {
    type: 'TeachingPointCourse',
    payload: {
      promise: api.put('/TeachingPointCourse', info)
    }
  }
}


//===== 分部==资料领取查询==单个查看
export function DataCollectionSingle(info) {
  return {
    type: 'DataCollectionSingle',
    payload: {
      promise: api.put('/DataCollectionSingle', info)
    }
  }
}



//===== 分部==资料领取查询==删除和编辑确认
export function EditAndDeleteInterfaces(info) {
  return {
    type: 'EditAndDeleteInterfaces',
    payload: {
      promise: api.put('/EditAndDeleteInterfaces', info)
    }
  }
}


//===== 总部==考勤统计==课次明细
export function ExaminationClass(info) {
  return {
    type: 'ExaminationClass',
    payload: {
      promise: api.put('/ExaminationClass', info)
    }
  }
}

//===== 总部==考勤统计==学生数
export function AttendanceNumber(info) {
  return {
    type: 'AttendanceNumber',
    payload: {
      promise: api.put('/AttendanceNumber', info)
    }
  }
}

//===== 总部==考勤统计==学生数
export function StudentAttendance(info) {
  return {
    type: 'StudentAttendance',
    payload: {
      promise: api.put('/StudentAttendance', info)
    }
  }
}


//===== 总部==考勤统计==学生数
export function AttendanceRate(info) {
  return {
    type: 'AttendanceRate',
    payload: {
      promise: api.put('/AttendanceRate', info)
    }
  }
}
 

//===== 总部==网课讲义领取管理
export function ManagementOfCollectionList(info) {
  return {
    type: 'ManagementOfCollectionList',
    payload: {
      promise: api.put('/ManagementOfCollectionList', info)
    }
  }
}


//===== 总部==网课讲义领取管理==批量设置
export function OnlineBatchSettingMethod(info) {
  return {
    type: 'OnlineBatchSettingMethod',
    payload: {
      promise: api.put('/OnlineBatchSettingMethod', info)
    }
  }
}



//===== 总部==优播网课讲义领取==讲义领取数
export function NumberOfHandoutsReceived(info) {
  return {
    type: 'NumberOfHandoutsReceived',
    payload: {
      promise: api.put('/NumberOfHandoutsReceived', info)
    }
  }
}



//===== 分部-课程班班主任管理--批量保存设置
export function TeacherOfTheCourseSubmit(info) {
  return {
    type: 'TeacherOfTheCourseSubmit',
    payload: {
      promise: api.put('/TeacherOfTheCourseSubmit', info)
    }
  }
}


//===== 分部-考勤管理--学生考勤--删除考勤
export function DeleteAttendance(info) {
  return {
    type: 'DeleteAttendance',
    payload: {
      promise: api.put('/DeleteAttendance', info)
    }
  }
}

//===== 用户来源分部下拉框
export function UserSourceDivision(info) {
  return {
    type: 'UserSourceDivision',
    payload: {
      promise: api.put('/UserSourceDivision', info)
    }
  }
}



//===== 批次下拉
export function BatchDropDown(info) {
  return {
    type: 'BatchDropDown',
    payload: {
      promise: api.put('/BatchDropDown', info)
    }
  }
}

//===== 互联网预收款情况统计
export function StatisticsInternetAdvances(info) {
  return {
    type: 'StatisticsInternetAdvances',
    payload: {
      promise: api.put('/StatisticsInternetAdvances', info)
    }
  }
}


//===== 课程班学员删除列表
export function DeleteStudentClassList(info) {
  return {
    type: 'DeleteStudentClassList',
    payload: {
      promise: api.put('/DeleteStudentClassList', info)
    }
  }
}

//===== 课程班学员删除 -- 删除
export function DeleteStudentClassDelete(info) {
  return {
    type: 'DeleteStudentClassDelete',
    payload: {
      promise: api.put('/DeleteStudentClassDelete', info)
    }
  }
}