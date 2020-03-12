import api from '../api'
//发送消息

//获取开课批次
export function getCoursePlanBatchList() {
  return {
    type: 'GET_COURSE_PLAN_BATCH_LIST',
    payload: {
      promise: api.put('/getCoursePlanBatchList')
    }
  }
}
//保存一个开课批次
export function saveCoursePlanBatch(coursePlanBatchInfo: any) {
  if(coursePlanBatchInfo.courseplanBatchId){
    return {
      type: 'UPDATE_COURSE_PLAN_BATCH',
      payload: {
        promise: api.put('/updateCoursePlanBatch', coursePlanBatchInfo)
      }
    }
  }else {
    return {
      type: 'ADD_COURSE_PLAN_BATCH',
      payload: {
        promise: api.put('/addCoursePlanBatch', coursePlanBatchInfo)
      }
    }
  }
}

export function getCoursePlanBatchById(id){
  return {
    type: 'GET_COURSE_PLAN_BATCH_BY_ID',
    payload: {
      promise: api.put('/getCoursePlanBatchById', {id: id})
    }
  }
}
//根据项目Id 查 开课批次列表
export function getCoursePlanBatchByItemId(itemId){
  return {
    type: 'GET_COURSE_PLAN_BATCH_BY_ITEM_ID',
    payload: {
      promise: api.put('/getCoursePlanBatchByItemId', {itemId: itemId})
    }
  }
}
//匹配学生来源的子项
export function subitem(id){
  return {
    type: 'SUBITEM',
    payload: {
      promise: api.put('/subitem',{parentId:id})
    }
  }
}

//获取课程计划新增列表
export function getCoursePlanAddList(info){
  return {
    type: 'GET_COURSE_PLAN_ADD_LIST',
    payload: {
      promise: api.put('/getCoursePlanAddList', info)
    }
  }
}
//开课计划-新增/补报时，获取部分详情
export function getCoursePlanPartInfo(info){
  return {
    type: 'GET_COURSE_PLAN_PART_INFO',
    payload: {
      promise: api.put('/getCoursePlanPartInfo', info)
    }
  }
}
//开课计划-新增课程班 新增
export function createCoursePlanAdd(info){
  return {
    type: 'CREATE_COURSE_PLAN_ADD',
    payload: {
      promise: api.put('/createCoursePlanAdd', info)
    }
  }
}

//开课计划-补报课程班 新增
export function createCoursePlanAdditional(info){
  return {
    type: 'CREATE_COURSE_PLAN_ADDITIONAL',
    payload: {
      promise: api.put('/createCoursePlanAdditional', info)
    }
  }
}

//考季列表 根据项目Id
export function getExamBatchByItem(itemId){
  return {
    type: 'GET_EXAM_BATCH_BY_ITEM',
    payload: {
      promise: api.put('/getExamBatchByItem', {itemId: itemId})
    }
  }
}
//-----管理
//开课计划-管理 列表
export function getCoursePlanList(info){
  return {
    type: 'GET_COURSE_PLAN_LIST',
    payload: {
      promise: api.put('/getCoursePlanList', info)
    }
  }
}
//开课计划-按id查
export function getCoursePlanById(id){
  return {
    type: 'GET_COURSE_PLAN_BY_ID',
    payload: {
      promise: api.put('/getCoursePlanById', {id: id})
    }
  }
}
//开课计划-修改
export function updateCoursePlan(info){
  return {
    type: 'UPDATE_COURSE_PLAN',
    payload: {
      promise: api.put('/updateCoursePlan', info)
    }
  }
}
//开课计划-删除
export function deleteCoursePlan(id){
  return {
    type: 'DELETE_COURSE_PLAN',
    payload: {
      promise: api.put('/deleteCoursePlan', {id: id})
    }
  }
}
//总部 开课计划 审核 列表
export function getCoursePlanAuditList(info){
  return {
    type: 'GET_COURSE_PLAN_AUDIT_LIST',
    payload: {
      promise: api.put('/getCoursePlanAuditList', info)
    }
  }
}
//开课计划-审核详情
export function getCoursePlanAuditById(id){
  return {
    type: 'GET_COURSE_PLAN_AUDIT_BY_ID',
    payload: {
      promise: api.put('/getCoursePlanAuditById', {id: id})
    }
  }
}
//开课计划-审核操作
//开课计划ID    审核结果 0不通过 1通过   审核意见
export function auditCoursePlan(auditInfo){
  return {
    type: 'AUDIT_COURSE_PLAN',
    payload: {
      //{id: id, isPass: isPass, reason: reason}
      promise: api.put('/auditCoursePlan', auditInfo)
    }
  }
}
//分部 开课计划 - 提交列表
export function getCoursePlanSubmitList(submitInfo){
  return {
    type: 'GET_COURSE_PLAN_SUBMIT_LIST',
    payload: {
      //{itemId: , courseplanBatchId: , teachCenterId: }
      promise: api.put('/getCoursePlanSubmitList', submitInfo)
    }
  }
}
//分部 开课计划 - 提交
export function submitCoursePlan(submitInfo){
  return {
    type: 'SUBMIT_COURSE_PLAN',
    payload: {
      //{itemId: , courseplanBatchId: , teachCenterId: }
      promise: api.put('/submitCoursePlan', submitInfo)
    }
  }
}
//分部 开课计划 - 导出(作废，直接通过超链接下载)
/*export function exportCoursePlan(submitInfo){
  return {
    type: 'EXPORT_COURSE_PLAN',
    payload: {
      //{itemId: , courseplanBatchId: , teachCenterId: }
      promise: api.put('/exportCoursePlan', submitInfo)
    }
  }
}*/

//总部-开课计划查询-修改是否是教服试点状态
export function updateIspilot(submitInfo){
  return {
    type: 'updateIspilot',
    payload: {
      //{itemId: , courseplanBatchId: , teachCenterId: }
      promise: api.put('/updateIspilot', submitInfo)
    }
  }
}

//----- ----- 学生异动管理
//01 查询学生转出订单
export function courseStudentOutOrderQuery(info){
  return {
    type: 'COURSE_STUDENT_OUT_ORDER_QUERY',
    payload: {
      promise: api.put('/courseStudentOutOrderQuery', info)
    }
  }
}
//02 查询学生转入订单
export function courseStudentInOrderQuery(info){
  return {
    type: 'COURSE_STUDENT_IN_ORDER_QUERY',
    payload: {
      promise: api.put('/courseStudentInOrderQuery', info)
    }
  }
}
//1.1.23 异动管理 查询学生转出订单详情 按订单id
export function courseStudentOutOrderDetailQuery(orderId){
  return {
    type: 'COURSE_STUDENT_OUT_ORDER_DETAIL_QUERY',
    payload: {
      promise: api.put('/courseStudentOutOrderDetailQuery', {orderId: orderId})
    }
  }
}

//1.3.24 （分部）异动管理 查询学生转入订单详情 按订单id
export function courseStudentInOrderDetailQuery(orderId){
  return {
    type: 'COURSE_STUDENT_IN_ORDER_DETAIL_QUERY',
    payload: {
      promise: api.put('/courseStudentInOrderDetailQuery', {orderId: orderId})
    }
  }
}

//1.3.25 （分部）异动管理 提交
export function courseStudentMoveSubmit(info){
  return {
    type: 'COURSE_STUDENT_MOVE_SUBMIT',
    payload: {
      promise: api.put('/courseStudentMoveSubmit', info)
    }
  }
}


//----- ----- 课表管理

//1.4.26 （总部）课表明细管理 列表
export function courseArrangeDetailListQuery(info){
  return {
    type: 'COURSE_ARRANGE_DETAIL_LIST_QUERY',
    payload: {
      promise: api.put('/courseArrangeDetailListQuery', info)
    }
  }
}

//1.4.27 （总部）课表明细管理 冲突查询
export function courseArrangeConflictQuery(info){
  return {
    type: 'COURSE_ARRANGE_CONFLICT_QUERY',
    payload: {
      promise: api.put('/courseArrangeConflictQuery', info)
    }
  }
}
//1.4.28 （总部） 课表明细管理 删除
export function courseArrangeDetailDelete(ids){
  return {
    type: 'COURSE_ARRANGE_DETAIL_DELETE',
    payload: {
      promise: api.put('/courseArrangeDetailDelete', {idStr: ids})
    }
  }
}
//1.4.29 （总部） 课表明细管理 按Detailid查
export function courseArrangeByDetailIdQuery(id){
  return {
    type: 'COURSE_ARRANGE_BY_DETAIL_ID_QUERY',
    payload: {
      promise: api.put('/courseArrangeByDetailIdQuery', {courseArrangeDetailId: id})
    }
  }
}
//1.4.30 （总部） 课表明细管理 修改
export function courseArrangeDetailUpdate(info){
  return {
    type: 'COURSE_ARRANGE_DETAIL_UPDATE',
    payload: {
      promise: api.put('/courseArrangeDetailUpdate', info)
    }
  }
}

//1.4.30 （总部） 课表明细管理 新增验证
export function courseArrangeDetailAddConflick(info){
  return {
    type: 'COURSE_ARRANGE_DETAIL_ADDCONFILCK',
    payload: {
      promise: api.put('/courseArrangeDetailAddConflick', info)
    }
  }
}
//1.4.30 （总部） 课表明细管理 新增
export function courseArrangeDetailCreate(info){
  return {
    type: 'COURSE_ARRANGE_DETAIL_CREATE',
    payload: {
      promise: api.put('/courseArrangeDetailCreate', info)
    }
  }
}

//1.4.30 （总部） 课表导入管理 根据课表id查部分信息
export function courseArrangeBaseInfoById(id){
  return {
    type: 'COURSE_ARRANGE_BASE_INFO_BY_ID',
    payload: {
      promise: api.put('/courseArrangeBaseInfoById', {courseArrangeId: id})
    }
  }
}

//1.4.31 （总部） 课表明细管理 批量修改开课日期
export function courseArrangeDateBatchUpdate(info){
  return {
    type: 'COURSE_ARRANGE_DATE_BATCH_UPDATE',
    payload: {
      promise: api.put('/courseArrangeDateBatchUpdate', info)
    }
  }
}
//1.4.32 （总部） 课表明细管理 批量修改讲师
export function courseArrangeTeacherBatchUpdate(info){
  return {
    type: 'COURSE_ARRANGE_TEACHER_BATCH_UPDATE',
    payload: {
      promise: api.put('/courseArrangeTeacherBatchUpdate', info)
    }
  }
}
//1.4.33 （总部）课表明细管理 日历显示按月
export function courseArrangeByCalendarMonth(info){
  return {
    type: 'COURSE_ARRANGE_BY_CALENDAR_MONTH',
    payload: {
      promise: api.put('/courseArrangeByCalendarMonth', info)
    }
  }
}
//1.4.34 （总部）课表明细管理 日历显示按年
export function courseArrangeByCalendarYear(info){
  return {
    type: 'COURSE_ARRANGE_BY_CALENDAR_YEAR',
    payload: {
      promise: api.put('/courseArrangeByCalendarYear', info)
    }
  }
}

//1.4.35 （总部） 课表导入 按课程班查询
export function courseArrangeListByCourseArrange(info){
  return {
    type: 'COURSE_ARRANGE_LIST_BY_COURSE_ARRANGE',
    payload: {
      promise: api.put('/courseArrangeListByCourseArrange', info)
    }
  }
}
//1.4.36 （总部） 课表导入 按讲师查询
export function courseArrangeListByTeacher(info){
  return {
    type: 'COURSE_ARRANGE_LIST_BY_TEACHER',
    payload: {
      promise: api.put('/courseArrangeListByTeacher', info)
    }
  }
}
//1.4.37 （总部） 课表管理 按Id查
export function courseArrangeByIdQuery(id){
  return {
    type: 'COURSE_ARRANGE_BY_ID_QUERY',
    payload: {
      promise: api.put('/courseArrangeByIdQuery', {courseArrangeId: id})
    }
  }
}
//1.4.38 （总部） 课表导入管理 删除
export function courseArrangeDelete(ids){
  return {
    type: 'COURSE_ARRANGE_DELETE',
    payload: {
      promise: api.put('/courseArrangeDelete', {idStr: ids})
    }
  }
}
//1.4.39 （总部） 课表导入管理 确认
export function courseArrangeCommit(ids){
  return {
    type: 'COURSE_ARRANGE_Commit',
    payload: {
      promise: api.put('/courseArrangeCommit', {idStr: ids})
    }
  }
}
//1.4.40 （总部） 课表导入管理 导入
/*export function courseArrangeImport(info){
  return {
    type: 'COURSE_ARRANGE_IMPORT',
    payload: {
      promise: api.put('/courseArrangeImport', info)
    }
  }
}*/

//1.4.40 （分部） 课表查询 列表
export function courseArrangeListQuery2(info){
  return {
    type: 'COURSE_ARRANGE_LIST_QUERY2',
    payload: {
      promise: api.put('/courseArrangeListQuery2', info)
    }
  }
}
//1.4.41 （分部） 课表发布 列表
export function courseArrangePublishListQuery(info){
  return {
    type: 'COURSE_ARRANGE_LIST_PUBLISH_QUERY',
    payload: {
      promise: api.put('/courseArrangePublishListQuery', info)
    }
  }
}
//1.4.42 （分部） 课表发布 详情列表
export function courseArrangePublishDetailQuery(id){
  return {
    type: 'COURSE_ARRANGE_PUBLISH_DETAIL_QUERY',
    payload: {
      promise: api.put('/courseArrangePublishDetailQuery', {courseArrangeId: id})
    }
  }
}

//1.4.43 （分部） 课表发布 确认发布
export function courseArrangePublishCommit(ids){
  return {
    type: 'COURSE_ARRANGE_PUBLISH_COMMIT',
    payload: {
      promise: api.put('/courseArrangePublishCommit', {idStr: ids})
    }
  }
}

//1.5  班级管理 到人
//1.5.44 （分部） 学生课表冲突查询列表
export function studentCourseArrangeConflictQuery(info){
  return {
    type: 'STUDENT_COURSE_ARRANGE_CONFLICT_QUERY',
    payload: {
      promise: api.put('/studentCourseArrangeConflictQuery', info)
    }
  }
}

//（分部） 转班申请管理 列表
export function getCourseStudentMoveManagerList(info){
  return {
    type: 'getCourseStudentMoveManagerList',
    payload: {
      promise: api.put('/getCourseStudentMoveManagerList', info)
    }
  }
}

//（分部） 转班申请管理 删除
export function deleteCourseStudentMoveManager(info){
  return {
    type: 'deleteCourseStudentMoveManager',
    payload: {
      promise: api.put('/deleteCourseStudentMoveManager', info)
    }
  }
}

//（分部） 转班申请管理 根据id查询
export function getCourseStudentMoveManagerById(info){
  return {
    type: 'getCourseStudentMoveManagerById',
    payload: {
      promise: api.put('/getCourseStudentMoveManagerById', info)
    }
  }
}

//（分部） 转班申请管理 查询转出订单课程商品费用处理明细
export function getChangeDetailInfoList(info){
  return {
    type: 'getChangeDetailInfoList',
    payload: {
      promise: api.put('/getChangeDetailInfoList', info)
    }
  }
}

//（总部） 转班申请管理 查询转出订单课程商品费用处理明细
export function getChangeDetailMoveInfoList(info){
  return {
    type: 'getChangeDetailMoveInfoList',
    payload: {
      promise: api.put('/getChangeDetailMoveInfoList', info)
    }
  }
}
//（总部） 转班申请管理 查询转出订单课程商品费用处理明细
export function getChangeDetailHeadquartersInfoList(info){
  return {
    type: 'getChangeDetailHeadquartersInfoList',
    payload: {
      promise: api.put('/getChangeDetailHeadquartersInfoList', info)
    }
  }
}
//（分部） 退费退学申请 列表
export function getCourseStudentRefundManagerList(info){
  return {
    type: 'getCourseStudentRefundManagerList',
    payload: {
      promise: api.put('/getCourseStudentRefundManagerList', info)
    }
  }
}

//（分部） 退费退学申请 删除
export function deleteCourseStudentRefundManager(info){
  return {
    type: 'deleteCourseStudentRefundManager',
    payload: {
      promise: api.put('/deleteCourseStudentRefundManager', info)
    }
  }
}

//（分部） 退费退学申请 查看详情
export function getCourseStudentRefundManagerById(info){
  return {
    type: 'getCourseStudentRefundManagerById',
    payload: {
      promise: api.put('/getCourseStudentRefundManagerById', info)
    }
  }
}

//（分部）退费退学申请-查询学生订单 
export function getCourseStudentRefundSelectOrderOut(info){
  return {
    type: 'getCourseStudentRefundSelectOrderOut',
    payload: {
      promise: api.put('/getCourseStudentRefundSelectOrderOut', info)
    }
  }
}

//（分部）退费退学申请-查询学生订单详情
export function getCourseStudentRefundSelectOrderOutDetail(info){
  return {
    type: 'getCourseStudentRefundSelectOrderOutDetail',
    payload: {
      promise: api.put('/getCourseStudentRefundSelectOrderOutDetail', info)
    }
  }
}
//（总部） 转班财务确认 查询审核列表 
export function getCourseStudentMoveAuditList(info){
  return {
    type: 'getCourseStudentMoveAuditList',
    payload: {
      promise: api.put('/getCourseStudentMoveAuditList', info)
    }
  }
}
export function getCourseFBStudentMoveAuditList(info){
  return {
    type: 'getCourseFBStudentMoveAuditList',
    payload: {
      promise: api.put('/getCourseFBStudentMoveAuditList', info)
    }
  }
}

//（总部） 转班财务确认 查询详情
export function getCourseStudentMoveAuditManageById(info){
  return {
    type: 'getCourseStudentMoveAuditManageById',
    payload: {
      promise: api.put('/getCourseStudentMoveAuditManageById', info)
    }
  }
}

//（总部） 转班财务确认 审核前检查
export function getCheckStudentChange(info){
  return {
    type: 'getCheckStudentChange',
    payload: {
      promise: api.put('/getCheckStudentChange', info)
    }
  }
}
//（分部） 转班财务确认 审核前检查
export function getFBCheckStudentChange(info){
  return {
    type: 'getFBCheckStudentChange',
    payload: {
      promise: api.put('/getFBCheckStudentChange', info)
    }
  }
}
//
//（总部） 转班财务确认 审核
export function courseStudentMoveAudit(info){
  return {
    type: 'courseStudentMoveAudit',
    payload: {
      promise: api.put('/courseStudentMoveAudit', info)
    }
  }
}

//（分部） 转班财务确认 审核
export function courseFBStudentMoveAudit(info){
  return {
    type: 'courseFBStudentMoveAudit',
    payload: {
      promise: api.put('/courseFBStudentMoveAudit', info)
    }
  }
}
//（总部） 退费退学申请 列表
export function getCourseStudentRefundHeadquartersManagerList(info){
  return {
    type: 'getCourseStudentRefundHeadquartersManagerList',
    payload: {
      promise: api.put('/getCourseStudentRefundHeadquartersManagerList', info)
    }
  }
}

//（总部） 退费退学申请 查看
export function getCourseStudentRefundHeadquartersManagerById(info){
  return {
    type: 'getCourseStudentRefundHeadquartersManagerById',
    payload: {
      promise: api.put('/getCourseStudentRefundHeadquartersManagerById', info)
    }
  }
}

//（总部） 转班申请申请 查看
export function getCourseStudentMoveHeadquartersManagerById(info){
  return {
    type: 'getCourseStudentMoveHeadquartersManagerById',
    payload: {
      promise: api.put('/getCourseStudentMoveHeadquartersManagerById', info)
    }
  }
}

//（总部） 转班预收款财务确认 查看 
export function ShiftWorkStudentRefundCheckStudentChange(info){
  return {
    type: 'ShiftWorkStudentRefundCheckStudentChange',
    payload: {
      promise: api.put('/ShiftWorkStudentRefundCheckStudentChange', info)
    }
  }
}
//（总部） 退费退学申请 审核前检查
export function getCourseStudentRefundCheckStudentChange(info){
  return {
    type: 'getCourseStudentRefundCheckStudentChange',
    payload: {
      promise: api.put('/getCourseStudentRefundCheckStudentChange', info)
    }
  }
}

//（总部） 退费退学申请 审核
export function courseStudentRefundChangeAudit(info){
  return {
    type: 'courseStudentRefundChangeAudit',
    payload: {
      promise: api.put('/courseStudentRefundChangeAudit', info)
    }
  }
}
//（总部） 副总退费审批最高限额--查询
export function MaximumLimitForApproval(info){
  return {
    type: 'MaximumLimitForApproval',
    payload: {
      promise: api.put('/MaximumLimitForApproval', info)
    }
  }
}

//（总部） 副总退费审批最高限额--修改
export function MaximumLimitForEdit(info){
  return {
    type: 'MaximumLimitForEdit',
    payload: {
      promise: api.put('/MaximumLimitForEdit', info)
    }
  }
}
//（分部） 退费退学申请 提交申请
export function courseStudentRefundApplication(info){
  return {
    type: 'courseStudentRefundApplication',
    payload: {
      promise: api.put('/courseStudentRefundApplication', info)
    }
  }
}

//（分部） 退学查询 列表页面
export function getCourseStudentLeaveManagerList(info){
  return {
    type: 'getCourseStudentLeaveManagerList',
    payload: {
      promise: api.put('/getCourseStudentLeaveManagerList', info)
    }
  }
}

//总部分部，退费退学查询接口
export function RefundAndWithdrawalEnquiry(info){
  return {
    type: 'RefundAndWithdrawalEnquiry',
    payload: {
      promise: api.put('/RefundAndWithdrawalEnquiry', info)
    }
  }
}
//（分部） 开课计划查询 列表页面
export function getCourseplanList(info){
  return {
    type: 'getCourseplanList',
    payload: {
      promise: api.put('/getCourseplanList', info)
    }
  }
}

//（分部） 班级管理  课程班成绩管理
export function queryCourseArrangeScoreVosList(info){
  return {
    type: 'queryCourseArrangeScoreVosList',
    payload: {
      promise: api.put('/queryCourseArrangeScoreVosList', info)
    }
  }
}
//（总部） 班级管理  课程班学生成绩查询
export function querySelectCourseArrangeScoreList(info){
  return {
    type: 'querySelectCourseArrangeScoreList',
    payload: {
      promise: api.put('/querySelectCourseArrangeScoreList', info)
    }
  }
}
//（分部） 班级管理  课程班成绩管理 - 成绩查看
export function queryCourseArrangeScoreVosLook(info){
  return {
    type: 'queryCourseArrangeScoreVosLook',
    payload: {
      promise: api.put('/queryCourseArrangeScoreVosLook', info)
    }
  }
}

//（分部） 班级管理  课程班成绩管理 - 成绩管理 - 列表
export function queryCourseArrangeScoreVosManageList(info){
  return {
    type: 'queryCourseArrangeScoreVosManageList',
    payload: {
      promise: api.put('/queryCourseArrangeScoreVosManageList', info)
    }
  }
}

//（分部） 班级管理  课程班成绩管理 - 成绩管理 - 录入成绩/编辑/删除/报考
export function addOrEditOrDelStudentScoreManage(info){
  return {
    type: 'addOrEditOrDelStudentScoreManage',
    payload: {
      promise: api.put('/addOrEditOrDelStudentScoreManage', info)
    }
  }
}

//（分部） 班级管理  课程班结束管理 - 结束课程班
export function CloseAllCourse(info){
  return {
    type: 'CloseAllCourse',
    payload: {
      promise: api.put('/CloseAllCourse', info)
    }
  }
}

//(总部)网络课程 激活管理
export function getCourseActiveList(info){
  return {
    type: 'getCourseActiveList',
    payload: {
      promise: api.put('/getCourseActiveList', info)
    }
  }
}
//(总部)网络课程 激活管理 课程激活
export function courseActiveOperationCourseActive(courseActiveId){
  return {
    type: 'courseActiveOperationCourseActive',
    payload: {
      promise: api.put('/courseActiveOperationCourseActive', {courseActiveId: courseActiveId})
    }
  }
}
//(总部)网络课程 激活管理 修改记录 
export function getCourseActiveOperationSelectLogList(info){
  return {
    type: 'getCourseActiveOperationSelectLogList',
    payload: {
      promise: api.put('/getCourseActiveOperationSelectLogList', info)
    }
  }
}

//(总部)网络课程 激活管理 修改记录 
export function courseActiveOperationCourseCancelActive(info){
  return {
    type: 'courseActiveOperationCourseCancelActive',
    payload: {
      promise: api.put('/courseActiveOperationCourseCancelActive', info)
    }
  }
}

//(总部)网络课程 激活管理 修改时间 
export function courseActiveOperationCourseUpdateEndTime(info){
  return {
    type: 'courseActiveOperationCourseUpdateEndTime',
    payload: {
      promise: api.put('/courseActiveOperationCourseUpdateEndTime', info)
    }
  }
}



//(总部)网课开通特殊处理---首页列表
export function NetOpenHomeList(info){
  return {
    type: 'NetOpenHomeList',
    payload: {
      promise: api.put('/NetOpenHomeList', info)
    }
  }
}





//(总部)网课开通特殊处理---网课开通查看
export function NetOpenView(info){
  return {
    type: 'NetOpenView',
    payload: {
      promise: api.put('/NetOpenView', info)
    }
  }
}



//(总部)网课开通特殊处理---新开网课列表
export function NewNetClassList(info){
  return {
    type: 'NewNetClassList',
    payload: {
      promise: api.put('/NewNetClassList', info)
    }
  }
}



//(总部)网课开通特殊处理---新开网课-确定新开
export function NewNetClassSure(info){
  return {
    type: 'NewNetClassSure',
    payload: {
      promise: api.put('/NewNetClassSure', info)
    }
  }
}



//(总部)网课开通特殊处理---修改记录
export function ModifyTheRecord(info){
  return {
    type: 'ModifyTheRecord',
    payload: {
      promise: api.put('/ModifyTheRecord', info)
    }
  }
}




//(总部)网课开通特殊处理---批量终止
export function BatchTermination(info){
  return {
    type: 'BatchTermination',
    payload: {
      promise: api.put('/BatchTermination', info)
    }
  }
}





//(总部)网课开通特殊处理---修改时长查询
export function ModifiedTimeSearch(info){
  return {
    type: 'ModifiedTimeSearch',
    payload: {
      promise: api.put('/ModifiedTimeSearch', info)
    }
  }
}


//(总部)网课开通特殊处理---修改时长
export function ModifiedTimeLength(info){
  return {
    type: 'ModifiedTimeLength',
    payload: {
      promise: api.put('/ModifiedTimeLength', info)
    }
  }
}






//(总部)网课开通特殊处理---修改时长批量
export function ModifiedTimeLengthBatch(info){
  return {
    type: 'ModifiedTimeLengthBatch',
    payload: {
      promise: api.put('/ModifiedTimeLengthBatch', info)
    }
  }
}






//(总部)网课开通特殊处理---重新激活
export function ReactivationInterface(info){
  return {
    type: 'ReactivationInterface',
    payload: {
      promise: api.put('/ReactivationInterface', info)
    }
  }
}






//(总部)网课订单及激活统计表---列表
export function OnlineActivationList(info){
  return {
    type: 'OnlineActivationList',
    payload: {
      promise: api.put('/OnlineActivationList', info)
    }
  }
}


//(总部)新增激活学员---列表
export function NewActivationStudentList(info){
  return {
    type: 'NewActivationStudentList',
    payload: {
      promise: api.put('/NewActivationStudentList', info)
    }
  }
}



//（总部） 收入月报计算日期设置  列表
export function feePayMonthTimeList(info){
  return {
    type: 'feePayMonthTimeList',
    payload: {
      promise: api.put('/feePayMonthTimeList', info)
    }
  }
}
//（总部） 收入月报计算日期设置  编辑日期
export function feePayMonthUpdateTime(info){
  return {
    type: 'feePayMonthUpdateTime',
    payload: {
      promise: api.put('/feePayMonthUpdateTime', info)
    }
  }
}

//分部、总部-学服学务-班级管理-教学点学生查询列表
export function teachingStudentList(info){
  return {
    type: 'teachingStudentList',
    payload: {
      promise: api.put('/teachingStudentList', info)
    }
  }
}
//分部、总部-学服学务-班级管理-教学点学生查询列表
export function teachingPointStudent(info){
  return {
    type: 'teachingPointStudent',
    payload: {
      promise: api.put('/teachingPointStudent', info)
    }
  }
}

//分部、总部-学服学务-班级管理-教学点学生查询--二级列表
export function teachingStudentTwoList(info){
  return {
    type: 'teachingStudentTwoList',
    payload: {
      promise: api.put('/teachingStudentTwoList', info)
    }
  }
}
//分部、总部-学服学务-班级管理-教学点学生查询--三级列表
export function teachingStudentThreeList(info){
  return {
    type: 'teachingStudentThreeList',
    payload: {
      promise: api.put('/teachingStudentThreeList', info)
    }
  }
}

//分部、总部-学服学务-班级管理-教学点学生查询--三级列表(王文君新写)
export function queryCourseCategoryStudyInfo(info){
  return {
    type: 'queryCourseCategoryStudyInfo',
    payload: {
      promise: api.put('/queryCourseCategoryStudyInfo', info)
    }
  }
}

//（总部、分部）退费退学审核-列表查询
export function leaveRefundAuditQueryList(info){
  return {
    type: 'leaveRefundAuditQueryList',
    payload: {
      promise: api.put('/leaveRefundAuditQueryList', info)
    }
  }
}
//（总部、分部）新的退费退学审核-列表查询
export function NewleaveRefundAuditQueryList(info){
  return {
    type: 'NewleaveRefundAuditQueryList',
    payload: {
      promise: api.put('/NewleaveRefundAuditQueryList', info)
    }
  }
}

//退费退学财务确认-修改按钮
export function leaveRefundUpdateOperateDate(info){
  return {
    type: 'leaveRefundUpdateOperateDate',
    payload: {
      promise: api.put('/leaveRefundUpdateOperateDate', info)
    }
  }
}

//转班财务信息查询
export function TransferFinanceList(info){
  return {
    type: 'TransferFinanceList',
    payload: {
      promise: api.put('/TransferFinanceList', info)
    }
  }
}


//课程班班主任管理列表
export function TeacherOfTheCourseList(info){
  return {
    type: 'TeacherOfTheCourseList',
    payload: {
      promise: api.put('/TeacherOfTheCourseList', info)
    }
  }
}

//分部--开课计划查询
export function InquiryOnTheOpeningScheduleList(info){
  return {
    type: 'InquiryOnTheOpeningScheduleList',
    payload: {
      promise: api.put('/InquiryOnTheOpeningScheduleList', info)
    }
  }
}

//总部-课表取消发布及确认
export function ClassScheduleReleaseConfirmation(info){
  return {
    type: 'ClassScheduleReleaseConfirmation',
    payload: {
      promise: api.put('/ClassScheduleReleaseConfirmation', info)
    }
  }
}

//总部-学服学务-审核重听申请
export function ApplicationAuditionAardHearing(info){
  return {
    type: 'ApplicationAuditionAardHearing',
    payload: {
      promise: api.put('/ApplicationAuditionAardHearing', info)
    }
  }
}

//总部-学服学务-审核重听申请 -- 详情
export function ApplicationDetails(info){
  return {
    type: 'ApplicationDetails',
    payload: {
      promise: api.put('/ApplicationDetails', info)
    }
  }
}


//总部-学服学务-审核重听申请 -- 审核
export function ApplicationExamine(info){
  return {
    type: 'ApplicationExamine',
    payload: {
      promise: api.put('/ApplicationExamine', info)
    }
  }
}

//总部-学服学务-审核重听申请 -- 发送短信
export function SendingSMS(info){
  return {
    type: 'SendingSMS',
    payload: {
      promise: api.put('/SendingSMS', info)
    }
  }
}

//分部--退费退学申请--保存匹配新订单
export function MatchNewOrdersSave(info){
  return {
    type: 'MatchNewOrdersSave',
    payload: {
      promise: api.put('/MatchNewOrdersSave', info)
    }
  }
}



//分部--退费退学申请--新订单费用处理
export function NewOrderCostProcessing(info){
  return {
    type: 'NewOrderCostProcessing',
    payload: {
      promise: api.put('/NewOrderCostProcessing', info)
    }
  }
}

//分部--退费退学申请--提交申请
export function EndApplicationSubmission(info){
  return {
    type: 'EndApplicationSubmission',
    payload: {
      promise: api.put('/EndApplicationSubmission', info)
    }
  }
}

//退费退学详情页的  查看课程明细
export function CheckDetails(info){
  return {
    type: 'CheckDetails',
    payload: {
      promise: api.put('/CheckDetails', info)
    }
  }
}