import api from '../api'
//发送消息

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

//------------------- 商品管理-----------------------
export function getProductList(pagingSearch) {
  return {
    type: 'getProductList',
    payload: {
      promise: api.put('/getProductList', pagingSearch)
    }
  }
}
export function addProductInfo(info) {
  return {
    type: 'addProductInfo',
    payload: {
      promise: api.put('/addProductInfo', info)
    }
  }
}
export function editProductInfo(info) {
  return {
    type: 'editProductInfo',
    payload: {
      promise: api.put('/editProductInfo', info)
    }
  }
}
export function deleteProductInfo(productIds) {
  return {
    type: 'deleteProductInfo',
    payload: {
      promise: api.put('/deleteProductInfo', { productIds })
    }
  }
}
export function getCourseProductInfo(productId) {
  return {
    type: 'getCourseProductInfo',
    payload: {
      promise: api.put('/getCourseProductInfo', { productId })
    }
  }
}
export function updateProductCource(info) {
  return {
    type: 'updateProductCource',
    payload: {
      promise: api.put('/updateProductCource', info)
    }
  }
}
export function getBindProductInfo(productId) {
  return {
    type: 'getBindProductInfo',
    payload: {
      promise: api.put('/getBindProductInfo', { productId })
    }
  }
}
export function searchPageForNotBind(pagingSearch) {
  return {
    type: 'searchPageForNotBind',
    payload: {
      promise: api.put('/searchPageForNotBind', pagingSearch)
    }
  }
}
export function addBindProductCourse(productId, productIds) {
  return {
    type: 'addBindProductCourse',
    payload: {
      promise: api.put('/addBindProductCourse', { productId, productIds })
    }
  }
}
export function VerificationTeachingMethod(pagingSearch) {
  return {
    type: 'VerificationTeachingMethod',
    payload: {
      promise: api.put('/VerificationTeachingMethod', pagingSearch)
    }
  }
}
export function deleteBindProductCource(productCourseIds) {
  return {
    type: 'deleteBindProductCource',
    payload: {
      promise: api.put('/deleteBindProductCource', { productCourseIds })
    }
  }
}
export function updateBindProductCourseIsGiveYes(productCourseIds) {
  return {
    type: 'updateBindProductCourseIsGiveYes',
    payload: {
      promise: api.put('/updateBindProductCourseIsGiveYes', { productCourseIds })
    }
  }
}
export function updateBindProductCourseIsGiveNo(productCourseIds) {
  return {
    type: 'updateBindProductCourseIsGiveNo',
    payload: {
      promise: api.put('/updateBindProductCourseIsGiveNo', { productCourseIds })
    }
  }
}
//查询多个项目对应的科目列表
export function getCourseCategoryListByItemIds(pagingSearch) {
  return {
    type: 'getCourseCategoryListByItemIds',
    payload: {
      promise: api.put('/getCourseCategoryListByItemIds', pagingSearch)
    }
  }
}

//查询大客户合同列表
export function getPartnerContractList(pagingSearch) {
  return {
    type: 'getPartnerContractList',
    payload: {
      promise: api.put('/getPartnerContractList', pagingSearch)
    }
  }
}


//商品管理--适用分部--回显
export function ApplicableDivisionShow(pagingSearch) {
  return {
    type: 'ApplicableDivisionShow',
    payload: {
      promise: api.put('/ApplicableDivisionShow', pagingSearch)
    }
  }
}

//商品管理--适用分部--编辑
export function ApplicableDivisionEdit(pagingSearch) {
  return {
    type: 'ApplicableDivisionEdit',
    payload: {
      promise: api.put('/ApplicableDivisionEdit', pagingSearch)
    }
  }
}
//根据订单商品ids 校验收费方
export function checkProductForOrder(pagingSearch) {
  return {
    type: 'checkProductForOrder',
    payload: {
      promise: api.put('/checkProductForOrder', pagingSearch)
    }
  }
}