import api from '../api'
//================ 分部招生管理 =================
export function getOrderAchievementList(pagingSearch) {
  return {
    type: 'getOrderAchievementList',
    payload: {
      promise: api.put('/getOrderAchievementList', pagingSearch)
    }
  }
}
export function editOrderAchievement(pagingSearch) {
  return {
    type: 'editOrderAchievement',
    payload: {
      promise: api.put('/editOrderAchievement', pagingSearch)
    }
  }
}
export function queryUserByBranchId(pagingSearch) {
  return {
    type: 'queryUserByBranchId',
    payload: {
      promise: api.put('/queryUserByBranchId', pagingSearch)
    }
  }
}

export function updateOrderAchievementUser(pagingSearch) {
  return {
    type: 'updateOrderAchievementUser',
    payload: {
      promise: api.put('/updateOrderAchievementUser', pagingSearch)
    }
  }
}
export function updateArea(pagingSearch) {
  return {
    type: 'updateArea',
    payload: {
      promise: api.put('/updateArea', pagingSearch)
    }
  }
}
export function changeTeachCenter(pagingSearch) {
  return {
    type: 'changeTeachCenter',
    payload: {
      promise: api.put('/changeTeachCenter', pagingSearch)
    }
  }
}
//=================招生管理-活动与咨询-学生电咨分配==================================
export function getStudentAskBenefitList(pagingSearch) {
  return {
    type: 'getStudentAskBenefitList',
    payload: {
      promise: api.put('/getStudentAskBenefitList', pagingSearch)
    }
  }
}
//==============招生管理-活动与咨询-学生邀约记录查询=====================
export function getStudentInviteList(pagingSearch) {
  return {
    type: 'getStudentInviteList',
    payload: {
      promise: api.put('/getStudentInviteList', pagingSearch)
    }
  }
}

//==============招生管理-订单管理-快捷支付订单匹配 列表=====================
export function OrderFastPayList(pagingSearch) {
  return {
    type: 'OrderFastPayList',
    payload: {
      promise: api.put('/OrderFastPayList', pagingSearch)
    }
  }
}

export function OrderNumberList(pagingSearch) {
  return {
    type: 'OrderNumberList',
    payload: {
      promise: api.put('/OrderNumberList', pagingSearch)
    }
  }
}

export function OrderMatchUpd(pagingSearch) {
  return {
    type: 'OrderMatchUpd',
    payload: {
      promise: api.put('/OrderMatchUpd', pagingSearch)
    }
  }
}
//==============分部-费用管理-订单异地缴费=====================
export function queryByOffsite(pagingSearch) {
  return {
    type: 'queryByOffsite',
    payload: {
      promise: api.put('/queryByOffsite', pagingSearch)
    }
  }
}
//==============总部-费用管理-挂单费用查询=====================
export function selectRegisterList(pagingSearch) {
  return {
    type: 'selectRegisterList',
    payload: {
      promise: api.put('/selectRegisterList', pagingSearch)
    }
  }
}
//==============总部-费用管理-预收款月报=====================
export function selectPayfeeStatement(pagingSearch) {
  return {
    type: 'selectPayfeeStatement',
    payload: {
      promise: api.put('/selectPayfeeStatement', pagingSearch)
    }
  }
}
//==============总部-费用管理-预收款月报 - 重新生成=====================
export function reportFeePayMonthByDate(pagingSearch) {
  return {
    type: 'reportFeePayMonthByDate',
    payload: {
      promise: api.put('/reportFeePayMonthByDate', pagingSearch)
    }
  }
}
//============分部-活动咨询-学员识别==================
export function getStudentDistingushList(pagingSearch) {
  return {
    type: 'getStudentDistingushList',
    payload: {
      promise: api.put('/getStudentDistingushList', pagingSearch)
    }
  }
}
//=============总部-财务管理-费用咨询-学生收入确认明细

export function getincomeList(pagingSearch) {
  return {
    type: 'getincomeList',
    payload: {
      promise: api.put('/getincomeList', pagingSearch)
    }
  }
}
//=============总部-招生管理-订单管理-订单分部调整-列表

export function getOrderList(pagingSearch) {
  return {
    type: 'getOrderList',
    payload: {
      promise: api.put('/getOrderList', pagingSearch)
    }
  }
}
//=============总部-招生管理-订单管理-订单分部调整

export function updateOrderBranchAndRegion(pagingSearch) {
  return {
    type: 'updateOrderBranchAndRegion',
    payload: {
      promise: api.put('/updateOrderBranchAndRegion', pagingSearch)
    }
  }
}//=============分部-学服学务-历史报班管理

export function getHistoryCourseArrangeList(pagingSearch) {
  return {
    type: 'getHistoryCourseArrangeList',
    payload: {
      promise: api.put('/getHistoryCourseArrangeList', pagingSearch)
    }
  }
}
export function studentList(pagingSearch) {
  return {
    type: 'studentList',
    payload: {
      promise: api.put('/studentList', pagingSearch)
    }
  }
}

//=============分部-学服学务-学生情况查询

export function headquarterStudentStudyList(pagingSearch) {
  return {
    type: 'headquarterStudentStudyList',
    payload: {
      promise: api.put('/headquarterStudentStudyList', pagingSearch)
    }
  }
}
//分部-学服学务-学生情况查询
export function branchStudentStudyCheckList(studentCourseCategoryId) {
  return {
    type: 'branchStudentStudyCheckList',
    payload: {
      promise: api.put('/branchStudentStudyCheckList', {studentCourseCategoryId:studentCourseCategoryId})
    }
  }
}
//=============总部-学服学务-学生情况查询

export function ZBheadquarterStudentStudyList(pagingSearch) {
  return {
    type: 'ZBheadquarterStudentStudyList',
    payload: {
      promise: api.put('/ZBheadquarterStudentStudyList', pagingSearch)
    }
  }
}
//总部-学服学务-学生情况查询
export function ZBstudentStudyCheckList(studentCourseCategoryId) {
  return {
    type: 'ZBstudentStudyCheckList',
    payload: {
      promise: api.put('/ZBstudentStudyCheckList', {studentCourseCategoryId:studentCourseCategoryId})
    }
  }
}




//外呼任务列表
export function OutGoingTaskList(pagingSearch) {
  return {
    type: 'OutGoingTaskList',
    payload: {
      promise: api.put('/OutGoingTaskList', pagingSearch)
    }
  }
}
// 外呼咨询查看
export function OutGoingConsultationViewList(pagingSearch) {
  return {
    type: 'OutGoingConsultationViewList',
    payload: {
      promise: api.put('/OutGoingConsultationViewList', pagingSearch)
    }
  }
}



// 订单业绩相关调整 -- 业绩教师 -- 查询
export function PerformanceTeachersList(pagingSearch) {
  return {
    type: 'PerformanceTeachersList',
    payload: {
      promise: api.put('/PerformanceTeachersList', pagingSearch)
    }
  }
}


// 订单业绩相关调整 -- 业绩教师 -- 新增
export function PerformanceTeachersAdd(pagingSearch) {
  return {
    type: 'PerformanceTeachersAdd',
    payload: {
      promise: api.put('/PerformanceTeachersAdd', pagingSearch)
    }
  }
}


// 订单业绩相关调整 -- 业绩教师 -- 删除
export function PerformanceTeachersDelete(pagingSearch) {
  return {
    type: 'PerformanceTeachersDelete',
    payload: {
      promise: api.put('/PerformanceTeachersDelete', pagingSearch)
    }
  }
}
