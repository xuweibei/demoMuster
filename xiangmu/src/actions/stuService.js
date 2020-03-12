import api from '../api'

//========================= 专属学服 ===============================
// 总部 - 专属学服 - 回访任务管理 - 分页查询
export function returnVisitGetByPage(info) {
  return {
    type: 'returnVisitGetByPage',
    payload: {
      promise: api.put('/returnVisitGetByPage', info)
    }
  }
}
// 总部 - 专属学服 - 回访任务管理 - 新增
export function returnVisitAdd(info) {
  return {
    type: 'returnVisitAdd',
    payload: {
      promise: api.put('/returnVisitAdd', info)
    }
  }
}

// 总部 - 专属学服 - 回访任务管理 - 编辑
export function returnVisitUpd(info) {
  return {
    type: 'returnVisitUpd',
    payload: {
      promise: api.put('/returnVisitUpd', info)
    }
  }
}
// 总部 - 专属学服 - 回访任务管理 - 删除
export function returnVisitDel(info) {
  return {
    type: 'returnVisitDel',
    payload: {
      promise: api.put('/returnVisitDel', info)
    }
  }
} 

// 总部 - 专属学服 - 学生专属学服管理
export function StudentsExclusiveList(info) {
  return {
    type: 'StudentsExclusiveList',
    payload: {
      promise: api.put('/StudentsExclusiveList', info)
    }
  }
} 


// 总部 - 专属学服 - 学生专属学服管理 => 批量设置
export function StudentsExclusiveBatch(info) {
  return {
    type: 'StudentsExclusiveBatch',
    payload: {
      promise: api.put('/StudentsExclusiveBatch', info)
    }
  }
}


// 总部 - 专属学服 - 学生成绩录入
export function ResultInputList(info) {
  return {
    type: 'ResultInputList',
    payload: {
      promise: api.put('/ResultInputList', info)
    }
  }
}



// 总部 - 专属学服 - 学生信息单个查询
export function ResultInputListOne(info) {
  return {
    type: 'ResultInputListOne',
    payload: {
      promise: api.put('/ResultInputListOne', info)
    }
  }
}




// 总部 - 专属学服 - 学生信息 - 编辑
export function ResultInputEdit(info) {
  return {
    type: 'ResultInputEdit',
    payload: {
      promise: api.put('/ResultInputEdit', info)
    }
  }
}


// 总部 - 专属学服 - 学生成绩录入 == 保存
export function ResultInputListSave(info) {
  return {
    type: 'ResultInputListSave',
    payload: {
      promise: api.put('/ResultInputListSave', info)
    }
  }
} 


// 总部 - 专属学服 - 学生信息管理
export function StudentInformationManagementList(info) {
  return {
    type: 'StudentInformationManagementList',
    payload: {
      promise: api.put('/StudentInformationManagementList', info)
    }
  }
} 

// 总部 - 专属学服 - 学生成绩管理列表
export function StudentAchievementManagementList(info) {
  return {
    type: 'StudentAchievementManagementList',
    payload: {
      promise: api.put('/StudentAchievementManagementList', info)
    }
  }
} 
 
// 分部 - 专属学服 - 学生回访管理 - 列表
export function returnVisitGetByPageInBranch(info) {
  return {
    type: 'returnVisitGetByPageInBranch',
    payload: {
      promise: api.put('/returnVisitGetByPageInBranch', info)
    }
  }
}

// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 分页查询学生
export function returnVisitSelectStudent(info) {
  return {
    type: 'returnVisitSelectStudent',
    payload: {
      promise: api.put('/returnVisitSelectStudent', info)
    }
  }
}

// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 查询学生该任务下的回访记录
export function returnVisitSelectReturnSivit(info) {
  return {
    type: 'returnVisitSelectReturnSivit',
    payload: {
      promise: api.put('/returnVisitSelectReturnSivit', info)
    }
  }
}

// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 添加学生回访记录
export function returnVisitStudentAdd(info) {
  return {
    type: 'returnVisitStudentAdd',
    payload: {
      promise: api.put('/returnVisitStudentAdd', info)
    }
  }
}

// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 删除 学生回访记录
export function returnVisitStudentDel(info) {
  return {
    type: 'returnVisitStudentDel',
    payload: {
      promise: api.put('/returnVisitStudentDel', info)
    }
  }
}

// 分部 - 专属学服 - 回访信息查询
export function returnVisitStudentSelectSivitInFb(info) {
  return {
    type: 'returnVisitStudentSelectSivitInFb',
    payload: {
      promise: api.put('/returnVisitStudentSelectSivitInFb', info)
    }
  }
}

// 总部 - 专属学服 - 回访信息查询
export function returnVisitStudentselectSivitInZb(info) {
  return {
    type: 'returnVisitStudentselectSivitInZb',
    payload: {
      promise: api.put('/returnVisitStudentselectSivitInZb', info)
    }
  }
}

// 总部 - 专属学服 - 回访情况统计 - 列表
export function returnVisitStudentSelectReturnVisitTj(info) {
  return {
    type: 'returnVisitStudentSelectReturnVisitTj',
    payload: {
      promise: api.put('/returnVisitStudentSelectReturnVisitTj', info)
    }
  }
}

// 总部 - 专属学服 - 回访情况统计 - 明细
export function returnVisitStudentSelectReturnVisitTjmx(info) {
  return {
    type: 'returnVisitStudentSelectReturnVisitTjmx',
    payload: {
      promise: api.put('/returnVisitStudentSelectReturnVisitTjmx', info)
    }
  } 
}    

// 分部 - 专属学服 - 学生选课管理
export function ManagementOfStudentsCourseSelectionList(info) {
  return {
    type: 'ManagementOfStudentsCourseSelectionList',
    payload: {
      promise: api.put('/ManagementOfStudentsCourseSelectionList', info)
    }
  } 
}   


// 分部 - 专属学服 - 学生选课管理 ==>课程班下拉接口
export function courseplanNameSelectionList(info) {
  return {
    type: 'courseplanNameSelectionList',
    payload: {
      promise: api.put('/courseplanNameSelectionList', info)
    }
  } 
} 


// 分部 - 专属学服 - 学生选课管理 ==>编辑
export function ManagementOfStudentsCourseSelectiotEdit(info) {
  return {
    type: 'ManagementOfStudentsCourseSelectiotEdit',
    payload: {
      promise: api.put('/ManagementOfStudentsCourseSelectiotEdit', info)
    }
  } 
}   


// 学生详细信息 - 回访情况 - 分页查询
export function returnVisitStudentSelectByStudentId(info) {
  return {
    type: 'returnVisitStudentSelectByStudentId',
    payload: {
      promise: api.put('/returnVisitStudentSelectByStudentId', info)
    }
  }
} 



//学生选课 -- 列表查询
export function StudentElectiveCourseList(info) {
  return {
    type: 'StudentElectiveCourseList',
    payload: {
      promise: api.put('/StudentElectiveCourseList', info)
    }
  }
} 


//学生选课 -- 选课，列表查询
export function CourseSelectionList(info) {
  return {
    type: 'CourseSelectionList',
    payload: {
      promise: api.put('/CourseSelectionList', info)
    }
  }
} 

//学生选课 -- 选课，下拉课程表
export function CourseSelectionDropDown(info) {
  return {
    type: 'CourseSelectionDropDown',
    payload: {
      promise: api.put('/CourseSelectionDropDown', info)
    }
  }
} 


//学生选课 -- 历史科目选课 - 科目的下拉
export function SubjectRequestList(info) {
  return {
    type: 'SubjectRequestList',
    payload: {
      promise: api.put('/SubjectRequestList', info)
    }
  }
} 


//学生选课 -- 选课、历史科目选课 -  确认修改
export function ConfirmationOfCourseSelection(info) {
  return {
    type: 'ConfirmationOfCourseSelection',
    payload: {
      promise: api.put('/ConfirmationOfCourseSelection', info)
    }
  }
} 


//总部学服学务--专属学服--好学生申请审核
export function GoodStudentsApplicationAuditList(info) {
  return {
    type: 'GoodStudentsApplicationAuditList',
    payload: {
      promise: api.put('/GoodStudentsApplicationAuditList', info)
    }
  }
} 

//总部学服学务--专属学服--好学生申请审核 -- 审核
export function GoodStudentsApplicationAuditSure(info) {
  return {
    type: 'GoodStudentsApplicationAuditSure',
    payload: {
      promise: api.put('/GoodStudentsApplicationAuditSure', info)
    }
  }
} 

//总部学服学务--专属学服--好学生申请审核 -- 发放奖金
export function BonusPayment(info) {
  return {
    type: 'BonusPayment',
    payload: {
      promise: api.put('/BonusPayment', info)
    }
  }
} 


//总部学服学务--专属学服--好学生查询
export function GoodStudentInquiryList(info) {
  return {
    type: 'GoodStudentInquiryList',
    payload: {
      promise: api.put('/GoodStudentInquiryList', info)
    }
  }
} 



//分部学服学务 --- 班级管理 --- 班主任好学生申请
export function GoodSApplicationHeadTeacherList(info) {
  return {
    type: 'GoodSApplicationHeadTeacherList',
    payload: {
      promise: api.put('/GoodSApplicationHeadTeacherList', info)
    }
  }
} 

//分部学服学务 --- 班级管理 --- 班主任好学生申请/专属学服好学生申请 -- 暂存 -- 申请
export function TemporaryStorageApply(info) {
  return {
    type: 'TemporaryStorageApply',
    payload: {
      promise: api.put('/TemporaryStorageApply', info)
    }
  }
} 

//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --列表
export function GoodSApplicationHeadTAdminList(info) {
  return {
    type: 'GoodSApplicationHeadTAdminList',
    payload: {
      promise: api.put('/GoodSApplicationHeadTAdminList', info)
    }
  }
} 


//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --批量提交审核
export function BatchSubmissionForAudit(info) {
  return {
    type: 'BatchSubmissionForAudit',
    payload: {
      promise: api.put('/BatchSubmissionForAudit', info)
    }
  }
} 



//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --批量删除
export function BatchSubmissionForDelete(info) {
  return {
    type: 'BatchSubmissionForDelete',
    payload: {
      promise: api.put('/BatchSubmissionForDelete', info)
    }
  }
} 


//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --编辑
export function BatchSubmissionForEdit(info) {
  return {
    type: 'BatchSubmissionForEdit',
    payload: {
      promise: api.put('/BatchSubmissionForEdit', info)
    }
  }
} 


//分部学服学务 --- 专属学服好学生申请
export function ExclusiveStudentApplicationList(info) {
  return {
    type: 'ExclusiveStudentApplicationList',
    payload: {
      promise: api.put('/ExclusiveStudentApplicationList', info)
    }
  }
} 