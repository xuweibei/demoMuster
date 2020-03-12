import api from '../api'

//========================= 资料管理 ===============================
//总部--资料管理--单个或分页查询资料
export function queryMaterialsList(info) {
  return {
    type: 'queryMaterialsList',
    payload: {
      promise: api.put('/queryMaterialsList', info)
    }
  }
}

//总部--资料管理--增加、删除、编辑
export function addOrEditOrDelMaterial(info) {
  return {
    type: 'addOrEditOrDelMaterial',
    payload: {
      promise: api.put('/addOrEditOrDelMaterial', info)
    }
  }
}

//总部--资料管理--打包资料--增加/删除
export function addOrRemoveChildMaterials(info) {
  return {
    type: 'addOrRemoveChildMaterials',
    payload: {
      promise: api.put('/addOrRemoveChildMaterials', info)
    }
  }
}

//总部--资料管理--单个查询资料(增加打包子资料时用)
export function queryMaterialVoList(info) {
  return {
    type: 'queryMaterialVoList',
    payload: {
      promise: api.put('/queryMaterialVoList', info)
    }
  }
}

//总部--资料申请审核--查询列表
export function queryMaterialApplyVosList(info) {
  return {
    type: 'queryMaterialApplyVosList',
    payload: {
      promise: api.put('/queryMaterialApplyVosList', info)
    }
  }
}

//总部--资料申请审核--单个查看
export function queryMaterialApplyVoInfo(info) {
  return {
    type: 'queryMaterialApplyVoInfo',
    payload: {
      promise: api.put('/queryMaterialApplyVoInfo', info)
    }
  }
}

//总部--资料申请审核--更新资料审核申请并记录流水
export function queryMaterialApplyAuditUpdate(info) {
  return {
    type: 'queryMaterialApplyAuditUpdate',
    payload: {
      promise: api.put('/queryMaterialApplyAuditUpdate', info)
    }
  }
}

//总部--资料领取查询
export function BrochureReleaseDesk(info) {
  return {
    type: 'BrochureReleaseDesk',
    payload: {
      promise: api.put('/BrochureReleaseDesk', info)
    }
  }
}

//总部--资料寄件管理--批量寄出
export function updSendState(info) {
  return {
    type: 'updSendState',
    payload: {
      promise: api.put('/updSendState', info)
    }
  }
}

//总部--资料寄件管理--寄件信息修改
export function sendInfoUpdata(info) {
  return {
    type: 'sendInfoUpdata',
    payload: {
      promise: api.put('/sendInfoUpdata', info)
    }
  }
}

//总部--网络课程管理--优播网课讲义领取信息管理 - 列表
export function onlineCourseMaterialGetManageList(info) {
  return {
    type: 'onlineCourseMaterialGetManageList',
    payload: {
      promise: api.put('/onlineCourseMaterialGetManageList', info)
    }
  }
}

//总部--网络课程管理--优播网课讲义领取信息管理 - 批量设置
export function onlineCourseMaterialGetBatchUpdate(info) {
  return {
    type: 'onlineCourseMaterialGetBatchUpdate',
    payload: {
      promise: api.put('/onlineCourseMaterialGetBatchUpdate', info)
    }
  }
}

//总部--网络课程管理--优播网课讲义领取信息管理 - 编辑
export function EditAndDeleteInterfaces(info) {
  return {
    type: 'EditAndDeleteInterfaces',
    payload: {
      promise: api.put('/EditAndDeleteInterfaces', info)
    }
  }
}