import api from '../api'
//================ 大客户 > 大客户管理 =================
//大客户列表
export function getPartnerList(pagingSearch) {
  return {
    type: 'GET_PARTNER_LIST',
    payload: {
      promise: api.put('/GetPartnerList', pagingSearch)
    }
  }
}
//大客户收费方明细管理
export function getPartyList(pagingSearch) {
  return {
    type: 'GET_PARTY_LIST',
    payload: {
      promise: api.put('/getPartyList', pagingSearch)
    }
  }
}
//大客户信息查看
export function GetPartnerInfoList(pagingSearch) {
  return {
    type: 'GetPartnerInfoList',
    payload: {
      promise: api.put('/GetPartnerInfoList', pagingSearch)
    }
  }
}


//大区分部下拉
export function LargeAreaDepartmentalDropDown(pagingSearch) {
  return {
    type: 'LargeAreaDepartmentalDropDown',
    payload: {
      promise: api.put('/LargeAreaDepartmentalDropDown', pagingSearch)
    }
  }
}

//大客户按id查找
export function getPartnerById(partnerId) {
  return {
    type: 'GET_PARTNER_BY_ID',
    payload: {
      promise: api.put('/GetPartnerById', { partnerId: partnerId })
    }
  }
}
//大客户按id查找
export function getPartnerDetails(partnerId) {
  return {
    type: 'GET_PARTNER_DETAILS',
    payload: {
      promise: api.put('/getPartnerDetails', { partnerId: partnerId })
    }
  }
}
//大客户明细公司账户的匹配
export function getCompanyAccount(pagingSearch) {
  return {
    type: 'GET_PARTNER_ACCOUNT',
    payload: {
      promise: api.put('/getCompanyAccount', pagingSearch)
    }
  }
}
//大客户修改/新增
export function savePartner(partnerInfo) {
  if (partnerInfo.partnerId) {
    return {
      type: 'UPDATE_PARTNER',
      payload: {
        promise: api.put('/UpdatePartner', partnerInfo)
      }
    }
  } else {
    return {
      type: 'ADD_PARTNER',
      payload: {
        promise: api.put('/AddPartner', partnerInfo)
      }
    }
  }
}

//大客户明细修改
export function modifyPartner(pagingSearch) {
  return {
    type: 'DELETE_MONDIFY',
    payload: {
      promise: api.put('/modifyPartner', pagingSearch)
    }
  }
}
//大客户删除
export function deletePartner(partnerIds) {
  return {
    type: 'DELETE_PARTNER',
    payload: {
      promise: api.put('/DeletePartner', { partnerIds: partnerIds })
    }
  }
}

//按分部过滤大客户  2018-05-31
export function queryPartnerByBranchId(branchId: any, partnerClassType: any) {
  return {
    type: 'QUERY_PARTNER_BY_BRANCH_ID',
    payload: {
      promise: api.put('/queryPartnerByBranchId', { branchId: branchId, partnerClassType: partnerClassType })
    }
  }
}

//大客户-项目列表
export function getPartnerItemList(partnerId) {
  return {
    type: 'GET_PARTNER_ITEM_LIST',
    payload: {
      promise: api.put('/GetPartnerItemList', { partnerId: partnerId })
    }
  }
}
//大客户-项目列表修改
//{ partnerId: partnerId, partnerItems: partnerItems }
export function updatePartnerItemList(data) {

  return {
    type: 'UPDATE_PARTNER_ITEM_LIST',
    payload: {
      promise: api.put('/UpdatePartnerItemList', data)
    }
  }
}
//大客户-收费方列表
export function getPartnerPayeeList(partnerId) {
  return {
    type: 'GET_PARTNER_PAYEE_LIST',
    payload: {
      promise: api.put('/GetPartnerPayeeList', { partnerId: partnerId })
    }
  }
}
//大客户-收费方列表修改
//{ partnerId: partnerId, partnerPayeeTypes: partnerPayeeTypes }
export function updatePartnerPayeeList(data) {
  return {
    type: 'UPDATE_PARTNER_PAYEE_LIST',
    payload: {
      promise: api.put('/UpdatePartnerPayeeList', data)
    }
  }
}
//大客户-收费方删除
export function deletePartnerPayee(partnerPayeeTypeId) {
  return {
    type: 'DELETE_PARTNER_PAYEE',
    payload: {
      promise: api.put('/DeletePartnerPayee', { partnerPayeeTypeId: partnerPayeeTypeId })
    }
  }
}
//大客户收费明细之批量修改
export function batchModification(data) {
  return {
    type: 'DELETE_PARTNER_BATCH',
    payload: {
      promise: api.put('/batchModification', data)
    }
  }
}
//大客户-用户负责统计 列表
export function getPartnerUserStatList(info) {
  return {
    type: 'GET_PARTNER_USER_STAT_LIST',
    payload: {
      promise: api.put('/GetPartnerUserStatList', info)
    }
  }
}
//大客户-用户已负责 列表
export function getPartnerInUserList(info) {
  return {
    type: 'GET_PARTNER_IN_USER_LIST',
    payload: {
      promise: api.put('/GetPartnerInUserList', info)
    }
  }
}
//大客户-用户未负责 列表
export function getPartnerNotInUserList(info) {
  return {
    type: 'GET_PARTNER_NOT_IN_USER_LIST',
    payload: {
      promise: api.put('/GetPartnerNotInUserList', info)
    }
  }
}
//大客户-用户负责 删除
export function deletePartnerInUser(userId, partnerIds) {
  return {
    type: 'DELETE_PARTNER_IN_USER',
    payload: {
      promise: api.put('/DeletePartnerInUser', { userId: userId, partnerIds: partnerIds })
    }
  }
}
//大客户-用户未负责 新增
export function addPartnerNotInUser(userId, partnerIds) {
  return {
    type: 'ADD_PARTNER_NOT_IN_USER',
    payload: {
      promise: api.put('/AddPartnerNotInUser', { userId: userId, partnerIds: partnerIds })
    }
  }
}

//查询省市列表
export function getAreaList(pagingSearch) {
  return {
    type: 'getAreaList',
    payload: {
      promise: api.put('/getAreaList', pagingSearch)
    }
  }
}
//查询所有省市列表
export function getAllAreas(pagingSearch) {
  return {
    type: 'getAllAreas',
    payload: {
      promise: api.put('/getAllAreas', pagingSearch)
    }
  }
}

//=================================大客户协议价============================//
//大客户协议价-分页查询（总部、大区、分部）
export function partnerProductPriceApplyList(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyList',
    payload: {
      promise: api.put('/partnerProductPriceApplyList', pagingSearch)
    }
  }
}
//大客户协议价-详情
export function partnerProductPriceApplyGetById(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyGetById',
    payload: {
      promise: api.put('/partnerProductPriceApplyGetById', pagingSearch)
    }
  }
}
//大客户协议价-添加
export function partnerProductPriceApplyAdd(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyAdd',
    payload: {
      promise: api.put('/partnerProductPriceApplyAdd', pagingSearch)
    }
  }
}
//大客户协议价-修改
export function partnerProductPriceApplyUpdate(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyUpdate',
    payload: {
      promise: api.put('/partnerProductPriceApplyUpdate', pagingSearch)
    }
  }
}
//大客户协议价-删除
export function partnerProductPriceApplyDelete(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyDelete',
    payload: {
      promise: api.put('/partnerProductPriceApplyDelete', pagingSearch)
    }
  }
}
//大客户协议价-查看分期价格
export function partnerProductPriceApplyCaculatorProductTermPrice(pagingSearch) {
  return {
    type: 'caculatorProductTermPrice',
    payload: {
      promise: api.put('/partnerProductPriceApplyCaculatorProductTermPrice', pagingSearch)
    }
  }
}
//大客户协议价-检索符号条件商品
export function partnerProductPriceApplySearchZPriceForPartner(pagingSearch) {
  return {
    type: 'SearchZPriceForPartner',
    payload: {
      promise: api.put('/partnerProductPriceApplySearchZPriceForPartner', pagingSearch)
    }
  }
}
//大客户协议价-批量提交
export function partnerProductPriceApplyBatchSubmit(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyBatchSubmit',
    payload: {
      promise: api.put('/partnerProductPriceApplyBatchSubmit', pagingSearch)
    }
  }
}
//大客户协议价-审核
export function partnerProductPriceApplyAudit(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyAudit',
    payload: {
      promise: api.put('/partnerProductPriceApplyAudit', pagingSearch)
    }
  }
}
//大客户协议价-批量审核
export function partnerProductPriceApplyBatchAudit(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyBatchAudit',
    payload: {
      promise: api.put('/partnerProductPriceApplyBatchAudit', pagingSearch)
    }
  }
}
//大客户协议价-批量复制
export function partnerProductPriceApplyBatchCopy(pagingSearch) {
  return {
    type: 'partnerProductPriceApplyBatchCopy',
    payload: {
      promise: api.put('/partnerProductPriceApplyBatchCopy', pagingSearch)
    }
  }
}
//当前用户大客户数据范围
export function searchUserPartnerScope(partnerName) {
  return {
    type: 'searchUserPartnerScope',
    payload: {
      promise: api.put('/searchUserPartnerScope', {partnerName:partnerName})
    }
  }
}

//大客户合同列表
export function getPartnerContractList(pagingSearch) {
  return {
    type: 'getPartnerContractList',
    payload: {
      promise: api.put('/getPartnerContractList', pagingSearch)
    }
  }
}


//批量删除大客户合同
export function batchDeletePartnerContract(pagingSearch) {
  return {
    type: 'batchDeletePartnerContract',
    payload: {
      promise: api.put('/batchDeletePartnerContract', pagingSearch)
    }
  }
}

//新增大客户合同
export function addParterContractInfo(pagingSearch) {
  return {
    type: 'addParterContractInfo',
    payload: {
      promise: api.put('/addParterContractInfo', pagingSearch)
    }
  }
}

//根据id查询大客户合同
export function getPartnerContractById(partnerContractId) {
  return {
    type: 'getPartnerContractById',
    payload: {
      promise: api.put('/getPartnerContractById', { partnerContractId: partnerContractId })
    }
  }
}

//修改大客户合同
export function updateParterContractInfo(pagingSearch) {
  return {
    type: 'updateParterContractInfo',
    payload: {
      promise: api.put('/updateParterContractInfo', pagingSearch)
    }
  }
}

//按 大客户Id、公司 （默认 共管账户） 查询 账户列表
export function queryPartnerAccount(partnerId, zbPayeeType) {
  return {
    type: 'QUERY_PARTNER_ACCOUNT',
    payload: {
      promise: api.put('/queryPartnerAccount', { partnerId: partnerId, zbPayeeType: zbPayeeType })
    }
  }
}

//订单查询中 使用的 大客户列表
export function queryByOrderSearch() {
  return {
    type: 'queryByOrderSearch',
    payload: {
      promise: api.put('/queryByOrderSearch')
    }
  }
}
//订单原始分部查询中 使用的 大客户列表
export function queryAllPartners() {
  return {
    type: 'queryAllPartners',
    payload: {
      promise: api.put('/queryAllPartners')
    }
  }
}

//大客户 合作收费方 新增
export function addPartnerPayeeType(info) {
  return {
    type: 'addPartnerPayeeType',
    payload: {
      promise: api.put('/addPartnerPayeeType', info)
    }
  }
}
//总部-大客户-大客户合同信息-大客户签约信息-列表查询
export function partnerSignSelectList(info) {
  return {
    type: 'partnerSignSelectList',
    payload: {
      promise: api.put('/partnerSignSelectList', info)
    }
  }
}
//总部-大客户-大客户合同信息-大客户签约信息-新增
export function partnerSignInsert(info) {
  return {
    type: 'partnerSignInsert',
    payload: {
      promise: api.put('/partnerSignInsert', info)
    }
  }
}
//总部-大客户-大客户合同信息-大客户签约信息-编辑
export function partnerSignUpdate(info) {
  return {
    type: 'partnerSignUpdate',
    payload: {
      promise: api.put('/partnerSignUpdate', info)
    }
  }
}
//总部-大客户-大客户合同信息-大客户签约信息-编辑按钮/查看按钮查询
export function partnerSignSelectById(info) {
  return {
    type: 'partnerSignSelectById',
    payload: {
      promise: api.put('/partnerSignSelectById', info)
    }
  }
}

//大客户详细信息-意向高校情况-列表查询
export function IntentionalCollegesUniversitiesList(info) {
  return {
    type: 'IntentionalCollegesUniversitiesList',
    payload: {
      promise: api.put('/IntentionalCollegesUniversitiesList', info)
    }
  }
}


//大客户详细信息-意向高校情况-编辑
export function IntentionalCollegesUniversitiesEdit(info) {
  return {
    type: 'IntentionalCollegesUniversitiesEdit',
    payload: {
      promise: api.put('/IntentionalCollegesUniversitiesEdit', info)
    }
  }
}
