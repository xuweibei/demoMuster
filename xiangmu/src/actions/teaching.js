import api from '../api'

//========================= 教师管理 ===============================
//获取教师列表
export function getZBTeacherSelectList(info) {
  return {
    type: 'GET_ZB_TEACHER_SELECT_LIST',
    payload: {
      promise: api.put('/getZBTeacherSelectList', info)
    }
  }
}

//获取教师列表
export function getAllTeacherList(info) {
  return {
    type: 'getAllTeacherList',
    payload: {
      promise: api.put('/getAllTeacherList', info)
    }
  }
}

//创建教师
export function createTeacher(info) {
  return {
    type: 'CREATE_TEACHER',
    payload: {
      promise: api.put('/createTeacher', info)
    }
  }
}

//更新教师
export function updateTeacher(info) {
  return {
    type: 'UPDATE_TEACHER',
    payload: {
      promise: api.put('/updateTeacher', info)
    }
  }
}

//验证教师号唯一性
export function checkLoginNameUnique(info) {
  return {
    type: 'checkLoginNameUnique',
    payload: {
      promise: api.put('/checkLoginNameUnique', info)
    }
  }
}

//分页查询网课批次
export function classBatchPageList(info) {
  return {
    type: 'classBatchPageList',
    payload: {
      promise: api.put('/classBatchPageList', info)
    }
  }
}
//创建网课批次
export function classBatchCreate(info) {
  return {
    type: 'classBatchCreate',
    payload: {
      promise: api.put('/classBatchCreate', info)
    }
  }
}
//更新网课批次
export function classBatchUpdate(info) {
  return {
    type: 'classBatchUpdate',
    payload: {
      promise: api.put('/classBatchUpdate', info)
    }
  }
}
//根据主键删除网课批次
export function classBatchDelete(info) {
  return {
    type: 'classBatchDelete',
    payload: {
      promise: api.put('/classBatchDelete', info)
    }
  }
}
//分页查询网课班级
export function classPageList(info) {
  return {
    type: 'classPageList',
    payload: {
      promise: api.put('/classPageList', info)
    }
  }
}
//新建网课班级
export function classPageCreate(info) {
  return {
    type: 'classPageCreate',
    payload: {
      promise: api.put('/classPageCreate', info)
    }
  }
}
//更新网课班级
export function classPageUpdate(info) {
  return {
    type: 'classPageUpdate',
    payload: {
      promise: api.put('/classPageUpdate', info)
    }
  }
}
//删除网课班级
export function classPageDelete(info) {
  return {
    type: 'classPageDelete',
    payload: {
      promise: api.put('/classPageDelete', info)
    }
  }
}
//根据课程获取教学版本
export function coursesversionlist(info) {
  return {
    type: 'coursesversionlist',
    payload: {
      promise: api.put('/coursesversionlist', info)
    }
  }
}
//根据课程的教学版本id获取教学计划或者学习计划，没有周计划的不取
export function getPlanByCourseId(info) {
  return {
    type: 'getPlanByCourseId',
    payload: {
      promise: api.put('/getPlanByCourseId', info)
    }
  }
}
//网课班级添加或修改课程
export function classCourseCreateOrUpdate(info) {
  return {
    type: 'classCourseCreateOrUpdate',
    payload: {
      promise: api.put('/classCourseCreateOrUpdate', info)
    }
  }
}
//班级详情
export function classInfoQueryById(info) {
  return {
    type: 'classInfoQueryById',
    payload: {
      promise: api.put('/classInfoQueryById', info)
    }
  }
}
//查询可以添加到当前班级的学生
export function canAddClassStudent(info) {
  return {
    type: 'canAddClassStudent',
    payload: {
      promise: api.put('/canAddClassStudent', info)
    }
  }
}
//查询已经添加到当前班级的学生
export function alreadyAddClassStudent(info) {
  return {
    type: 'alreadyAddClassStudent',
    payload: {
      promise: api.put('/alreadyAddClassStudent', info)
    }
  }
}
//添加学生到网课班级
export function classStudentAdd(info) {
  return {
    type: 'classStudentAdd',
    payload: {
      promise: api.put('/classStudentAdd', info)
    }
  }
}
//根据主键删除网课学生
export function deleteByClassStudentId(info) {
  return {
    type: 'deleteByClassStudentId',
    payload: {
      promise: api.put('/deleteByClassStudentId', info)
    }
  }
}
//根据主键批量删除网课学生
export function deleteByClassStudentIdBetch(info) {
  return {
    type: 'deleteByClassStudentIdBetch',
    payload: {
      promise: api.put('/deleteByClassStudentIdBetch', info)
    }
  }
}