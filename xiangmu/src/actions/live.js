import api from '../api'

//========================= 直播管理 ===============================
//获取面授直播管理列表
export function queryLiveList(info) {
  return {
    type: 'queryLiveList',
    payload: {
      promise: api.put('/queryLiveList', info)
    }
  }
}
//总部 - 直播管理 - 操作直播 --删除 更新 新增
export function operateLive(info) {
  return {
    type: 'operateLive',
    payload: {
      promise: api.put('/operateLive', info)
    }
  }
}
//总部 - 直播管理 - 根据直播id获取直播信息
export function getLiveDetaile(info) {
  return {
    type: 'getLiveDetaile',
    payload: {
      promise: api.put('/getLiveDetaile', info)
    }
  }
}
//总部 - 直播管理 - 批量--发布直播
export function batchReleaseLives(info) {
  return {
    type: 'batchReleaseLives',
    payload: {
      promise: api.put('/batchReleaseLives', info)
    }
  }
}
//总部 - 直播管理 - 预约明细
export function queryBookDetail(info) {
  return {
    type: 'queryBookDetail',
    payload: {
      promise: api.put('/queryBookDetail', info)
    }
  }
}
//总部 - 直播管理 -  - 批量/取消预约
export function batchCancelBook(info) {
  return {
    type: 'batchCancelBook',
    payload: {
      promise: api.put('/batchCancelBook', info)
    }
  }
}
//总部 - 直播回放 - 当前直播下的回放记录
export function queryLiveReplays(info) {
  return {
    type: 'queryLiveReplays',
    payload: {
      promise: api.put('/queryLiveReplays', info)
    }
  }
}
//总部 - 直播回放 - 新增直播回放信息
export function addLiveReplay(info) {
  return {
    type: 'addLiveReplay',
    payload: {
      promise: api.put('/addLiveReplay', info)
    }
  }
}
//根据教师姓名模糊查询
export function queryTeacher(info) {
  return {
    type: 'queryTeacher',
    payload: {
      promise: api.put('/queryTeacher', {realName:info})
    }
  }
}
//根据直播名称模糊查询
export function queryByLiveName(info) {
  return {
    type: 'queryByLiveName',
    payload: {
      promise: api.put('/queryByLiveName', {liveName:info})
    }
  }
}
//直播预约管理-课程班预约信息-分部-分页
export function queryAppointmentList(info) {
  return {
    type: 'queryAppointmentList',
    payload: {
      promise: api.put('/queryAppointmentList', info)
    }
  }
}

//直播预约管理-某课程班可预约的直播 - 分页
export function getLivesAppointmentList(info) {
  return {
    type: 'getLivesAppointmentList',
    payload: {
      promise: api.put('/getLivesAppointmentList', info)
    }
  }
}

//直播预约管理-某课程班预约直播的学员列表 - 分页
export function getNotLiveStudents(info) {
  return {
    type: 'getNotLiveStudents',
    payload: {
      promise: api.put('/getNotLiveStudents', info)
    }
  }
}

//直播预约管理-批量预约
export function batchLiveBook(info) {
  return {
    type: 'batchLiveBook',
    payload: {
      promise: api.put('/batchLiveBook', info)
    }
  }
}

//直播预约管理-批量预约
export function queryLiveStudentDetail(info) {
  return {
    type: 'queryLiveStudentDetail',
    payload: {
      promise: api.put('/queryLiveStudentDetail', info)
    }
  }
}

//总部/分部--学服学务--直播管理--预约回放设置 - 分页查询项目观看直播次数
export function itemLiveHapPage(info) {
  return {
    type: 'itemLiveHapPage',
    payload: {
      promise: api.put('/itemLiveHapPage', info)
    }
  }
}
//总部/分部--学服学务--直播管理--预约回放设置 - 创建或修改项目直播观看和回顾次数
export function itemLiveHapCreateOrUpdate(info) {
  return {
    type: 'itemLiveHapCreateOrUpdate',
    payload: {
      promise: api.put('/itemLiveHapCreateOrUpdate', info)
    }
  }
}