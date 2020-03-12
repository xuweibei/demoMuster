import api from '../api'
//招生管理

//----------1. 基础
//获取招生季列表 管理招生季 带分页
export function postRecruitBatchPageList(pagingSearch) {
  return {
    type: 'RECRUIT_BATCH_PAGE_LIST',
    payload: {
      promise: api.put('/recruitBatchPageList', pagingSearch)
    }
  }
}
//获取招生季下拉列表
export function postRecruitBatchList(pagingSearch) {
  return {
    type: 'RECRUIT_BATCH_LIST',
    payload: {
      promise: api.put('/recruitBatchList', pagingSearch)
    }
  }
}
//保存一个招生季
export function postRecruitBatchSave(recruitBatchInfo: any) {
  if (recruitBatchInfo.recruitBatchId) {
    return {
      type: 'RECRUIT_BATCH_SAVE',
      payload: {
        promise: api.put('/recruitBatchUpdate', recruitBatchInfo)
      }
    }
  } else {
    return {
      type: 'RECRUIT_BATCH_SAVE',
      payload: {
        promise: api.put('/recruitBatchAdd', recruitBatchInfo)
      }
    }
  }
}
//用户查询下拉列表
export function postSelectRecruitUser(pagingSearch) {
  return {
    type: 'RECRUIT_USER_LIST',
    payload: {
      promise: api.put('/postSelectRecruitUser', pagingSearch)
    }
  }
}
//用户查询
export function postSearchRecruitUser(pagingSearch) {
  return {
    type: 'RECRUIT_USER_SEARCH',
    payload: {
      promise: api.put('/postSearchRecruitUser', pagingSearch)
    }
  }
}
//========================= 活动与咨询 ===============================
// 电咨信息管理 按学生查询 yzl
export function getStudentAskPList(info) {
  return {
    type: 'GET_STUDENT_ASK_P',
    payload: {
      promise: api.put('/getStudentAskPList', info)
    }
  }
}
// 电咨信息管理 按明细查询 yzl
export function getStudentAskP2List(info) {
  return {
    type: 'GET_STUDENT_ASK_P2',
    payload: {
      promise: api.put('/getStudentAskP2List', info)
    }
  }
}
// 电咨信息管理 按学生ID查询 yzl
export function qryByStudentId(info) {
  return {
    type: 'qryByStudentId',
    payload: {
      promise: api.put('/qryByStudentId', info)
    }
  }
}
// 电咨信息管理 批量删除  yzl
export function delAsk(info) {
  return {
    type: 'delAsk',
    payload: {
      promise: api.put('/delAsk', info)
    }
  }
}
// 电咨信息管理  根据学生id查询学生信息  yzl
export function getStudentById(info) {
  return {
    type: 'getStudentById',
    payload: {
      promise: api.put('/getStudentById', info)
    }
  }
}
// 电咨信息管理  添加咨询  yzl
export function addAskP(info) {
  return {
    type: 'addAskP',
    payload: {
      promise: api.put('/addAskP', info)
    }
  }
}
// 电咨信息管理  根据 咨询ID 查询 学生咨询记录  yzl
export function qryById(info) {
  return {
    type: 'qryById',
    payload: {
      promise: api.put('/qryById', info)
    }
  }
}
// 电咨信息管理  修改 咨询  yzl
export function updAskP(info) {
  return {
    type: 'updAskP',
    payload: {
      promise: api.put('/updAskP', info)
    }
  }
}
// 电咨信息管理  获取当前招生季  yzl
export function selectNowRecruitBatch(info) {
  return {
    type: 'selectNowRecruitBatch',
    payload: {
      promise: api.put('/selectNowRecruitBatch', info)
    }
  }
}



//----- -----2. 商品标准价格
//----- 2.1 总部

//2.1.01 商品标准价格管理列表
export function recruitProductPriceList(info) {
  return {
    type: 'RECRUIT_PRODUCT_PRICE_LIST',
    payload: {
      promise: api.put('/recruitProductPriceList', info)
    }
  }
}

//复制
export function recruitProductPriceCopy(recruitBatchId) {
  return {
    type: 'recruitProductPriceCopy',
    payload: {
      promise: api.put('/recruitProductPriceCopy', { recruitBatchId })
    }
  }
}
//发布
export function recruitProductPricePublish(productPriceIds, status) {
  return {
    type: 'recruitProductPricePublish',
    payload: {
      promise: api.put('/recruitProductPricePublish', { productPriceIds, status })
    }
  }
}


//取消发布
export function recruitProductPriceCancelPublish(productPriceId) {
  return {
    type: 'recruitProductPriceCancelPublish',
    payload: {
      promise: api.put('/recruitProductPriceCancelPublish', { productPriceId: productPriceId})
    }
  }
}
//绑定商品标准价格详情（查看使用）
export function recruitBindProductPriceInfoById(productId, recruitBatchId, productPriceId) {
  return {
    type: 'recruitBindProductPriceInfoById',
    payload: {
      promise: api.put('/recruitBindProductPriceInfoById', { productId, recruitBatchId, productPriceId })
    }
  }
}

//绑定商品标准价格详情（修改使用）
export function recruitBindProductPriceInfoUpById(productId, recruitBatchId, productPriceId) {
  return {
    type: 'recruitBindProductPriceInfoUpById',
    payload: {
      promise: api.put('/recruitBindProductPriceInfoUpById', { productId, recruitBatchId, productPriceId })
    }
  }
}

//课程商品标准价格详情
export function recruitCourseProductPriceInfoById(productId, productPriceId) {
  return {
    type: 'recruitCourseProductPriceInfoById',
    payload: {
      promise: api.put('/recruitCourseProductPriceInfoById', { productId, productPriceId })
    }
  }
}
//绑定商品标准价格详情
export function recruitBindProductPriceInfoUpdate(productPriceId, productCoursePrices, productTotalPrice) {
  return {
    type: 'recruitBindProductPriceInfoUpdate',
    payload: {
      promise: api.put('/recruitBindProductPriceInfoUpdate', { productPriceId, productCoursePriceJson: JSON.stringify(productCoursePrices), productTotalPrice })
    }
  }
}
//课程商品标准价格详情
export function recruitCourseProductPriceInfoUpdate(productPriceId, productTotalPrice, classHour) {
  return {
    type: 'recruitCourseProductPriceInfoUpdate',
    payload: {
      promise: api.put('/recruitCourseProductPriceInfoUpdate', { productPriceId, productTotalPrice, classHour })
    }
  }
}

//查找新的未添加招生季商品列表
export function recruitProductPriceAddList(pagingSearch) {
  return {
    type: 'recruitProductPriceAddList',
    payload: {
      promise: api.put('/recruitProductPriceAddList', pagingSearch)
    }
  }
}
//批量保存的未添加招生季商品列表
export function recruitProductPriceAddListSave(recruitBatchId, productPrices) {
  return {
    type: 'recruitProductPriceAddListSave',
    payload: {
      promise: api.put('/recruitProductPriceAddListSave', { recruitBatchId: recruitBatchId, productPriceJson: JSON.stringify(productPrices) })
    }
  }
}


//大区商品标准价格查看
export function recruitProductPriceListDQ(pagingSearch) {
  return {
    type: 'recruitProductPriceListDQ',
    payload: {
      promise: api.put('/recruitProductPriceListDQ', pagingSearch)
    }
  }
}

//分部商品标准价格查看
export function recruitProductPriceListFB(pagingSearch) {
  return {
    type: 'recruitProductPriceListFB',
    payload: {
      promise: api.put('/recruitProductPriceListFB', pagingSearch)
    }
  }
}

//总部 - 限价及特价申请开放管理 - 查询列表
export function queryProductPriceLimitVos(pagingSearch) {
  return {
    type: 'queryProductPriceLimitVos',
    payload: {
      promise: api.put('/queryProductPriceLimitVos', pagingSearch)
    }
  }
}
//总部-商品限价及特价申请开放管理-带批量开头的全部操作
export function batchLimitPrice(pagingSearch) {
  return {
    type: 'batchLimitPrice',
    payload: {
      promise: api.put('/batchLimitPrice', pagingSearch)
    }
  }
}

//=========================分部商品特价申请===============================
//列表
export function selectByFProductPricePriceApply(pagingSearch) {
  return {
    type: 'selectByFProductPricePriceApply',
    payload: {
      promise: api.put('/selectByFProductPricePriceApply', pagingSearch)
    }
  }
}
//添加
export function addFProductPricePriceApply(pagingSearch) {
  return {
    type: 'addFProductPricePriceApply',
    payload: {
      promise: api.put('/addFProductPricePriceApply', pagingSearch)
    }
  }
}
//修改
export function updateFProductPricePriceApply(pagingSearch) {
  return {
    type: 'updateFProductPricePriceApply',
    payload: {
      promise: api.put('/updateFProductPricePriceApply', pagingSearch)
    }
  }
}
//分部查看详情
export function getByProductPriceApplyRelevanceF(pagingSearch) {
  return {
    type: 'getByProductPriceApplyRelevanceF',
    payload: {
      promise: api.put('/getByProductPriceApplyRelevanceF', pagingSearch)
    }
  }
}
//总部查看详情
export function getByProductPriceApplyRelevanceZ(pagingSearch) {
  return {
    type: 'getByProductPriceApplyRelevanceZ',
    payload: {
      promise: api.put('/getByProductPriceApplyRelevanceZ', pagingSearch)
    }
  }
}
//初审列表
export function queryByFSubmitProductPricePriceApplyZExamine(pagingSearch) {
  return {
    type: 'queryByFSubmitProductPricePriceApplyZExamine',
    payload: {
      promise: api.put('/queryByFSubmitProductPricePriceApplyZExamine', pagingSearch)
    }
  }
}
//终审列表
export function queryByFSubmitProductPricePriceApplyZFinallyExamine(pagingSearch) {
  return {
    type: 'queryByFSubmitProductPricePriceApplyZFinallyExamine',
    payload: {
      promise: api.put('/queryByFSubmitProductPricePriceApplyZFinallyExamine', pagingSearch)
    }
  }
}
//初审操作
export function getFirstAuditZ(pagingSearch) {
  return {
    type: 'getFirstAuditZ',
    payload: {
      promise: api.put('/getFirstAuditZ', pagingSearch)
    }
  }
}
//终审操作
export function getFinalAuditZ(pagingSearch) {
  return {
    type: 'getFinalAuditZ',
    payload: {
      promise: api.put('/getFinalAuditZ', pagingSearch)
    }
  }
}
//总部、大区查看分部价格列表
export function selectByFProductPriceZorD(pagingSearch) {
  return {
    type: 'selectByFProductPriceZorD',
    payload: {
      promise: api.put('/selectByFProductPriceZorD', pagingSearch)
    }
  }
}
//查看分部价格列表
export function selectByFProductPriceF(pagingSearch) {
  return {
    type: 'selectByFProductPriceF',
    payload: {
      promise: api.put('/selectByFProductPriceF', pagingSearch)
    }
  }
}

//根据学生id获得订单信息
export function getOrderDetailInforList(studentId) {
  return {
    type: 'getOrderDetailInforList',
    payload: {
      promise: api.put('/getOrderDetailInforList', { studentId: studentId })
    }
  }
}


//根据学生id获得缴费记录
export function getStudentFeeRecordByStudentIdList(studentId) {
  return {
    type: 'getStudentFeeRecordByStudentIdList',
    payload: {
      promise: api.put('/getStudentFeeRecordByStudentIdList', { studentId: studentId })
    }
  }
}
//=========================分期付款规则===============================
//查询分期付款规则列表
export function getByTermRuleList(pagingSearch) {
  return {
    type: 'getByTermRuleList',
    payload: {
      promise: api.put('/getByTermRuleList', pagingSearch)
    }
  }
}

//查询按ID分期付款规则
export function getByTermRuleId(pagingSearch) {
  return {
    type: 'getByTermRuleId',
    payload: {
      promise: api.put('/getByTermRuleId', pagingSearch)
    }
  }
}

//编辑
export function updateTermRule(pagingSearch) {
  return {
    type: 'updateTermRule',
    payload: {
      promise: api.put('/updateTermRule', pagingSearch)
    }
  }
}



//----- -----3. 优惠管理
//----- 3.1总部
//3.1.01 统一优惠规则管理列表
export function discountRuleQuery(info) {
  return {
    type: 'DISCOUNT_RULE_QUERY',
    payload: {
      //{ itemId discountType discountName startDate: }
      promise: api.put('/discountRuleQuery', info)
    }
  }
}
//3.1.02 统一优惠规则管理 新增
export function discountRuleCreate(info) {
  return {
    type: 'DISCOUNT_RULE_CREATE',
    payload: {
      promise: api.put('/discountRuleCreate', info)
    }
  }
}
//3.1.03 统一优惠规则管理 新增
export function discountRuleUpdate(info) {
  return {
    type: 'DISCOUNT_RULE_UPDATE',
    payload: {
      promise: api.put('/discountRuleUpdate', info)
    }
  }
}
//3.1.04 统一优惠规则管理 批量修改有效期
export function discountRuleExpiryDateBatchUpdate(info) {
  return {
    type: 'DISCOUNT_RULE_UPDATE',
    payload: {
      promise: api.put('/discountRuleBatchUpdateExpiryDate', info)
    }
  }
}
//3.1.05 统一优惠规则管理 适用商品列表（已添加的）
export function discountRuleProductQuery(info) {
  return {
    type: 'DISCOUNT_RULE_PRODUCT_QUERY',
    payload: {
      promise: api.put('/discountRuleProductQuery', info)
    }
  }
}
//3.1.06 统一优惠规则管理 适用商品列表（未添加）
export function discountRuleNotProductQuery(info) {
  return {
    type: 'DISCOUNT_RULE_NOT_PRODUCT_QUERY',
    payload: {
      promise: api.put('/discountRuleNotProductQuery', info)
    }
  }
}
//3.1.07 统一优惠规则管理 适用商品 添加
export function discountRuleProductAdd(info) {
  return {
    type: 'DISCOUNT_RULE_NOT_PRODUCT_QUERY',
    payload: {
      promise: api.put('/discountRuleProductAdd', info)
    }
  }
}
//3.1.08 统一优惠规则管理 适用商品 删除
export function discountRuleProductDelete(info) {
  return {
    type: 'DISCOUNT_RULE_NOT_PRODUCT_QUERY',
    payload: {
      promise: api.put('/discountRuleProductDelete', info)
    }
  }
}
//3.1.09 统一优惠规则管理 互斥 列表查询
export function discountRuleMutexQuery(info) {
  return {
    type: 'DISCOUNT_RULE_NOT_PRODUCT_QUERY',
    payload: {
      promise: api.put('/discountRuleMutexQuery', info)
    }
  }
}
//3.1.10 统一优惠规则管理 互斥 操作
export function discountRuleMutexSet(info) {
  return {
    type: 'DISCOUNT_RULE_NOT_PRODUCT_QUERY',
    payload: {
      promise: api.put('/discountRuleMutexSet', info)
    }
  }
}

//分部-招生管理-创建订单-整单优惠规则下拉框
export function queryDiscountBySingle(info) {
  return {
    type: 'QUERY_DISCOUNT_BY_SINGLE',
    payload: {
      promise: api.put('/queryDiscountBySingle', info)
    }
  }
}

//分部-招生管理-创建订单-商品优惠规则下拉框
export function queryDiscountByFold(info) {
  return {
    type: 'QUERY_DISCOUNT_BY_FOLD',
    payload: {
      promise: api.put('/queryDiscountByFold', info)
    }
  }
}

//分部-招生管理-创建订单-读取优惠限额
export function queryMaxDiscountQuotaByItems(itemIds) {
  return {
    type: 'QUERY_MAX_DISCOUNT_QUOTA_BY_ITEMS',
    payload: {
      promise: api.put('/queryMaxDiscountQuotaByItems', { ids: itemIds })
    }
  }
}

//=========================分部优惠规则申请与审批===============================
//列表查询
export function getAuditDiscountRuleList(info) {
  return {
    type: 'GET_AUDIT_LIST',
    payload: {
      promise: api.put('/getAuditDiscountRuleList', info)
    }
  }
}
//优惠规则查询
export function getAuditDiscountRuleSearch(info) {
  return {
    type: 'GET_AUDIT_SEARCH',
    payload: {
      promise: api.put('/getAuditDiscountRuleSearch', info)
    }
  }
}

//已惠学员查询
export function alreadyBenefit(info) {
  return {
    type: 'GET_AUDIT_BENEFIT',
    payload: {
      promise: api.put('/alreadyBenefit', info)
    }
  }
}
//审核
export function auditDiscountRulePass(info) {
  return {
    type: 'AUDIT_PASS',
    payload: {
      promise: api.put('/auditDiscountRulePass', info)
    }
  }
}
//查看
export function auditDiscountRuleDetail(info) {
  return {
    type: 'AUDIT_RULE_DETAIL',
    payload: {
      promise: api.put('/auditDiscountRuleDetail', info)
    }
  }
}
//查看的审核类型
export function getProductDiscountAuditStatus(info) {
  return {
    type: 'GET_AUDIT_STATUS',
    payload: {
      promise: api.put('/getProductDiscountAuditStatus', info)
    }
  }
}
//审核时的类型
export function getAuditProductDiscountAuditStatus(info) {
  return {
    type: 'GET_AUDIT_DIC_STATUS',
    payload: {
      promise: api.put('/getAuditProductDiscountAuditStatus', info)
    }
  }
}

//========================= 大区优惠限额管理===============================
//列表查询
export function getAreaDiscountManageList(info) {
  return {
    type: 'GET_DISCOUNT_MANAGE_LIST',
    payload: {
      promise: api.put('/getAreaDiscountManageList', info)
    }
  }
}
//获取大区
export function getReginList(info) {
  return {
    type: 'GET_REGIN_LIST',
    payload: {
      promise: api.put('/getReginList', info)
    }
  }
}

//编辑
export function editReginDiscount(info) {
  return {
    type: 'EDIT_REGIN_DISCOUNT',
    payload: {
      promise: api.put('/editReginDiscount', info)
    }
  }
}

//按项目统一设置
export function BatchByItemEditDiscount(info) {
  return {
    type: 'EDIT_BATCH_ITEM_DISCOUNT',
    payload: {
      promise: api.put('/BatchByItemEditDiscount', info)
    }
  }
}

//批量修改限额
export function BatchEditDiscount(info) {
  return {
    type: 'EDIT_BATCH_DISCOUNT',
    payload: {
      promise: api.put('/BatchEditDiscount', info)
    }
  }
}

//根椐项目查询大区列表
export function getByItemOrg(info) {
  return {
    type: 'GET_BY_ITEM_ORG',
    payload: {
      promise: api.put('/getByItemOrg', info)
    }
  }
}

//按大区设置
export function editByItemOrg(info) {
  return {
    type: 'EDIT_BY_ITEM_ORG',
    payload: {
      promise: api.put('/editByItemOrg', info)
    }
  }
}

//获取大区最大限额
export function queryDiscountPriceByItemId(info) {
  return {
    type: 'QUERY_DISCOUNT_PRICE_BY_ITEMID',
    payload: {
      promise: api.put('/queryDiscountPriceByItemId', info)
    }
  }
}

//-------------------  大区优惠管理-----------------------
//列表查询
export function getSpecialDiscountRuletManageList(info) {
  return {
    type: 'GET_DQ_DISCOUNT_MANAGE_LIST',
    payload: {
      promise: api.put('/getSpecialDiscountRuletManageList', info)
    }
  }
}

//-------------------  分部优惠规则申请-----------------------
//列表查询
export function getProductDiscountRuleList(info) {
  return {
    type: 'GET_PRODUCT_DISCOUNT_RULE_LIST',
    payload: {
      promise: api.put('/getProductDiscountRuleList', info)
    }
  }
}

//新增
export function addproductDiscountRule(info) {
  return {
    type: 'ADD_PRODUCT_DISCOUNT_RULE',
    payload: {
      promise: api.put('/addproductDiscountRule', info)
    }
  }
}

//编辑
export function editproductDiscountRule(info) {
  return {
    type: 'EDIT_PRODUCT_DISCOUNT_RULE',
    payload: {
      promise: api.put('/editproductDiscountRule', info)
    }
  }
}


//分部优惠规则查看
export function getDiscountRuleBranchList(info) {
  return {
    type: 'GETDISCOUNT_RULE_BRANCH',
    payload: {
      promise: api.put('/getDiscountRuleBranchList', info)
    }
  }
}

//------------------- 分部的招生管理管理学生归属调整-----------------------

//列表查询
export function getAscriptionList(pagingSearch) {
  return {
    type: 'GET_ASCRIPTION_LIST',
    payload: {
      promise: api.put('/getAscriptionList', pagingSearch)
    }
  }
}
//批量调整学生所属区域
export function editAdjustBranch(pagingSearch) {
  return {
    type: 'EDIT_ADJUST_BRANCH',
    payload: {
      promise: api.put('/editAdjustBranch', pagingSearch)
    }
  }
}
export function editAreaByAreaId(pagingSearch) {
  return {
    type: 'editAreaByAreaId',
    payload: {
      promise: api.put('/editAreaByAreaId', pagingSearch)
    }
  }
}
export function editUser(pagingSearch) {
  return {
    type: 'editUser',
    payload: {
      promise: api.put('/editUser', pagingSearch)
    }
  }
}

export function getDiscountRuleEmployeeList(info) {
  return {
    type: 'GET_DISCOUNT_RULE_EMPLOYEELIST',
    payload: {
      promise: api.put('/getDiscountRuleEmployeeList', info)
    }
  }
}

//批更新
export function BatchEditEmployee(info) {
  return {
    type: 'BATCH_EDIT_EMPLOYEE',
    payload: {
      promise: api.put('/BatchEditEmployee', info)
    }
  }
}

//------------------- 分部的招生管理市场与咨询学生归属管理-----------------------
//列表查询
export function getFBAdjustBranchList(info) {
  return {
    type: 'GET_FBADJUST_BRANCHLIST',
    payload: {
      promise: api.put('/getFBAdjustBranchList', info)
    }
  }
}

//----- -----4. 订单管理
//----- 4.1 学生管理
//4.1.01 学生列表
export function studentQuery(info) {
  return {
    type: 'STUDENT_QUERY',
    payload: {
      promise: api.put('/studentQuery', info)
    }
  }
}
//公海学生查询
export function HighSeasStudentInquiryList(info) {
  return {
    type: 'HighSeasStudentInquiryList',
    payload: {
      promise: api.put('/HighSeasStudentInquiryList', info)
    }
  }
}
export function canOrderStudentQuery(info) {
  return {
    type: 'CAN_ORDER_STUDENT_QUERY',
    payload: {
      promise: api.put('/canOrderStudentQuery', info)
    }
  }
}

//4.1.02 学生新增(订单中)
export function studentCreate(info) {
  return {
    type: 'STUDENT_CREATE',
    payload: {
      promise: api.put('/studentCreate', info)
    }
  }
}
//学生新增（来自管网分部）
export function studentCreateOnline(info) {
  return {
    type: 'STUDENT_CREATE_ONLINE',
    payload: {
      promise: api.put('/studentCreateOnline', info)
    }
  }
}
//4.1.02 学生新增(活动中)
export function studentCreateInActive(info) {
  return {
    type: 'STUDENT_CREATE_IN_ACTIVE',
    payload: {
      promise: api.put('/studentCreateInActive', info)
    }
  }
}
//4.1.03 按id查询学生
export function studentById(id) {
  return {
    type: 'STUDENT_BY_ID',
    payload: {
      promise: api.put('/studentById', { studentId: id })
    }
  }
}
//4.1.04 学生修改
export function studentUpdate(info) {
  return {
    type: 'STUDENT_UPDATE',
    payload: {
      promise: api.put('/studentUpdate', info)
    }
  }
}

//4.1.04 学生修改(来自官网分部)
export function studentUpdateOnline(info) {
  return {
    type: 'STUDENT_UPDATE_ONLINE',
    payload: {
      promise: api.put('/studentUpdateOnline', info)
    }
  }
}

//4.1.04 学生修改
export function studentUpdateInActive(info) {
  return {
    type: 'STUDENT_UPDATE_IN_ACTIVE',
    payload: {
      promise: api.put('/studentUpdateInActive', info)
    }
  }
}
//4.1.05 学生验证
export function studentCheck(info) {
  return {
    type: 'STUDENT_CHECK',
    payload: {
      promise: api.put('/studentCheck', info)
    }
  }
}

////根据活动名查询当前用户分部数据范围下的活动（下拉框）
export function queryByActivityName(info) {
  return {
    type: 'queryByActivityName',
    payload: {
      promise: api.put('/queryByActivityName', {activityName:info})
    }
  }
}

//----- 4.1.00 获取“了解中博的方式”
export function gainWayList() {
  return {
    type: 'GAIN_WAY_LIST',
    payload: {
      promise: api.put('/gainWayList', {})
    }
  }
}

//----- 4.2.05 新增订单 新增保存
export function createOrder(info) {
  return {
    type: 'CREATE_ORDER',
    payload: {
      promise: api.put('/createOrder', info)
    }
  }
}
//----- 4.2.06 新增订单 修改保存
export function updateOrder(info) {
  return {
    type: 'UPDATE_ORDER',
    payload: {
      promise: api.put('/updateOrder', info)
    }
  }
}

//----- 4.2.07 订单管理列表
export function queryOrderManage(info) {
  return {
    type: 'QUERY_ORDER_MANAGE',
    payload: {
      promise: api.put('/queryOrderManage', info)
    }
  }
}

/*----- 4.2.08 分部 订单管理 订单列表
       分部 订单查询
       总部 订单查询
       大区 订单查询
*/
export function queryOrder(info) {
  return {
    type: 'QUERY_ORDER',
    payload: {
      promise: api.put('/queryOrder', info)
    }
  }
}
export function queryOrder2(info) {
  return {
    type: 'QUERY_ORDER2',
    payload: {
      promise: api.put('/queryOrder2', info)
    }
  }
}


export function CallCenterList(info) {
  return {
    type: 'CallCenterList',
    payload: {
      promise: api.put('/CallCenterList', info)
    }
  }
}


//订单管理，暂存
export function TemporaryStorageInterface(info) {
  return {
    type: 'TemporaryStorageInterface',
    payload: {
      promise: api.put('/TemporaryStorageInterface', info)
    }
  }
}





//----- 4.2.08 快捷支付订单匹配 POS机编号
export function getPosCode(info) {
  return {
    type: 'GET_POS_CODE',
    payload: {
      promise: api.put('/getPosCode', info)
    }
  }
}

//订单选择商品 列表 2018
export function queryProductPriceForOrder(pagingSearch) {
  return {
    type: 'QUERY_PRODUCT_PRICE_FOR_ORDER',
    payload: {
      promise: api.put('/queryProductPriceForOrder', pagingSearch)
    }
  }
}

//商品详情列表 列表 2018
export function getByIdsForOrderView(pagingSearch) {
  return {
    type: 'getByIdsForOrderView',
    payload: {
      promise: api.put('/getByIdsForOrderView', pagingSearch)
    }
  }
}

//订单选择商品 根据商品价格id获取商品详情
export function productPriceGetById(pagingSearch) {
  return {
    type: 'PRODUCT_PRICE_GET_BYID',
    payload: {
      promise: api.put('/productPriceGetById', pagingSearch)
    }
  }
}

//商品-价格-查询（订单新增用）-后台指定招生季
export function productForOrderByRecruitBatchId(pagingSearch) {
  return {
    type: 'PRODUCT_FOR_ORDER_BY_RECRUITBATCHID',
    payload: {
      promise: api.put('/productForOrderByRecruitBatchId', pagingSearch)
    }
  }
}

//订单管理-分部-历史订单新增的接口
export function addOrderByHistory(pagingSearch) {
  return {
    type: 'ADD_ORDER_BY_HISTORY',
    payload: {
      promise: api.put('/addOrderByHistory', pagingSearch)
    }
  }
}

//订单管理-分部-历史订单修改的接口
export function updateOrderByHistory(pagingSearch) {
  return {
    type: 'UPDATE_ORDER_BY_HISTORY',
    payload: {
      promise: api.put('/updateOrderByHistory', pagingSearch)
    }
  }
}

//订单管理-分部-修改订单创建时间
export function updateOrderCreateDate(pagingSearch) {
  return {
    type: 'updateOrderCreateDate',
    payload: {
      promise: api.put('/updateOrderCreateDate', pagingSearch)
    }
  }
}
//订单管理-获取官网缴费路径
export function getQuickPayPathByOrderId(pagingSearch) {
  return {
    type: 'getQuickPayPathByOrderId',
    payload: {
      promise: api.put('/getQuickPayPathByOrderId', pagingSearch)
    }
  }
}

//判断用户是否存在在学科目接口
export function checkCourseIsStudy(pagingSearch) {
  return {
    type: 'CHECK_COURSE_IS_STUDY',
    payload: {
      promise: api.put('/checkCourseIsStudy', pagingSearch)
    }
  }
}

//预报信息维护人管理列表查询
export function selectFeePreReportManagePage(pagingSearch) {
  return {
    type: 'selectFeePreReportManagePage',
    payload: {
      promise: api.put('/selectFeePreReportManagePage', pagingSearch)
    }
  }
}
//预报信息维护人管理 - 调整维护人员
export function updateFeePreReportProtectId(pagingSearch) {
  return {
    type: 'updateFeePreReportProtectId',
    payload: {
      promise: api.put('/updateFeePreReportProtectId', pagingSearch)
    }
  }
}

//预报信息查询
export function ForecastInformationQueryList(pagingSearch) {
  return {
    type: 'ForecastInformationQueryList',
    payload: {
      promise: api.put('/ForecastInformationQueryList', pagingSearch)
    }
  }
}
//根据订单Id获取订单详情 方向班 2018
export function getDirectionOrderById(orderId) {
  return {
    type: 'GET_DIRECTION_ORDER_BY_ID',
    payload: {
      promise: api.put('/getDirectionOrderById', { orderId: orderId })
    }
  }
}
//根据订单Id获取订单详情 非方向班 2018
export function getNotDirectionOrderById(orderId) {
  return {
    type: 'GET_NOT_DIRECTION_ORDER_BY_ID',
    payload: {
      promise: api.put('/getNotDirectionOrderById', { orderId: orderId })
    }
  }
}

//根据订单Id获取订单详情 2018
export function getOrderById(orderId) {
  return {
    type: 'GET_ORDER_BY_ID',
    payload: {
      promise: api.put('/getOrderById', { orderId: orderId })
    }
  }
}

//订单科目费用计算接口
export function getCourseCategoryPrice(pagingSearch) {
  return {
    type: 'getCourseCategoryPrice',
    payload: {
      promise: api.put('/getCourseCategoryPrice', pagingSearch)
    }
  }
}

//根据订单Id获取订单详情 缴费情况 2018
export function getOrderFeeById(orderId) {
  return {
    type: 'GET_ORDER_FEE_BY_ID',
    payload: {
      promise: api.put('/getOrderFeeById', { orderId: orderId })
    }
  }
}
//根据订单Id获取订单详情 退费情况 2018
export function getOrderRefundById(orderId) {
  return {
    type: 'GET_ORDER_REFUND_BY_ID',
    payload: {
      promise: api.put('/getOrderRefundById', { orderId: orderId })
    }
  }
}
//根据订单Id获取订单详情 扣费情况 2018
export function getOrderDeductById(orderId) {
  return {
    type: 'GET_ORDER_DEDUCT_BY_ID',
    payload: {
      promise: api.put('/getOrderDeductById', { orderId: orderId })
    }
  }
}

//4.2.13 调用Pos机成功后，调用 服务端 缴费
export function paymentByPos(info) {
  return {
    type: 'PAYMENT_BY_POS',
    payload: {
      promise: api.put('/paymentByPos', info)
    }
  }
}

//4.2.14 作废订单
export function abandonOrder(orderId) {
  return {
    type: 'abandon_order',
    payload: {
      promise: api.put('/abandonOrder', { orderId: orderId })
    }
  }
}

//电子签
export function getContractUrl(info) {
  return {
    type: 'getContractUrl',
    payload: {
      promise: api.put('/getContractUrl', info)
    }
  }
}

//4.2.15 提交订单
export function submitOrder(orderId) {
  return {
    type: 'SUBMIT_ORDER',
    payload: {
      promise: api.put('/submitOrder', { orderId, orderId })
    }
  }
}
//4.2.16 审核订单列表
export function queryOrderForAudit(info) {
  return {
    type: 'QUERY_ORDER_FOR_AUDIT',
    payload: {
      promise: api.put('/queryOrderForAudit', info)
    }
  }
}
//4.2.17 审核订单
export function auditOrder(info) {
  return {
    type: 'AUDIT_ORDER',
    payload: {
      promise: api.put('/auditOrder', info)
    }
  }
}
//订单选择商品 列表 2018
export function queryPayeeTypeByBranchId() {
  return {
    type: 'QUERY_PAYEE_TYPE_BY_BRANCH_ID',
    payload: {
      promise: api.put('/queryPayeeTypeByBranchId', {})
    }
  }
}
//4.2.17 获取订单已缴金额
export function queryOrderByPayment(orderId) {
  return {
    type: 'queryOrderByPayment',
    payload: {
      promise: api.put('/queryOrderByPayment', {orderId: orderId})
    }
  }
}

//订单收费方变更申请管理 - 列表
export function orderPayeeChangeList(pagingSearch) {
  return {
    type: 'orderPayeeChangeList',
    payload: {
      promise: api.put('/orderPayeeChangeList', pagingSearch)
    }
  }
}
//订单收费方变更申请管理 - 新增申请 - 列表
export function addOrderPayeeChangeList(pagingSearch) {
  return {
    type: 'addOrderPayeeChangeList',
    payload: {
      promise: api.put('/addOrderPayeeChangeList', pagingSearch)
    }
  }
}
//订单收费方变更申请管理 - 新增申请 - 变更
export function addOrderPayeeChange(pagingSearch) {
  return {
    type: 'addOrderPayeeChange',
    payload: {
      promise: api.put('/addOrderPayeeChange', pagingSearch)
    }
  }
}
//订单收费方变更申请管理 - 删除
export function OrderPayeeChangeDelete(pagingSearch) {
  return {
    type: 'OrderPayeeChangeDelete',
    payload: {
      promise: api.put('/OrderPayeeChangeDelete', pagingSearch)
    }
  }
}
//订单收费方变更申请管理 - 查看
export function OrderPayeeChangeInfo(pagingSearch) {
  return {
    type: 'OrderPayeeChangeInfo',
    payload: {
      promise: api.put('/OrderPayeeChangeInfo', pagingSearch)
    }
  }
}
//订单收费方变更申请管理 - 总部 - 提交审核
export function auditPayeeChangeApply(pagingSearch) {
  return {
    type: 'auditPayeeChangeApply',
    payload: {
      promise: api.put('/auditPayeeChangeApply', pagingSearch)
    }
  }
}
//订单收费方变更申请管理 - 总部 - 批量提交审核
export function auditPayeeChangeApplyByBatch(pagingSearch) {
  return {
    type: 'auditPayeeChangeApplyByBatch',
    payload: {
      promise: api.put('/auditPayeeChangeApplyByBatch', pagingSearch)
    }
  }
}


//订单POS临时缴费管理 - 分部 - 首页列表
export function OrderPOSList(pagingSearch) {
  return {
    type: 'OrderPOSList',
    payload: {
      promise: api.put('/OrderPOSList', pagingSearch)
    }
  }
}


//订单POS临时缴费管理 - 分部 - 定金详情列表
export function OrderPOSDetailsList(pagingSearch) {
  return {
    type: 'OrderPOSDetailsList',
    payload: {
      promise: api.put('/OrderPOSDetailsList', pagingSearch)
    }
  }
}



//订单POS临时缴费管理 - 分部 - 匹配流水号
export function MatchingFlowCode(pagingSearch) {
  return {
    type: 'MatchingFlowCode',
    payload: {
      promise: api.put('/MatchingFlowCode', pagingSearch)
    }
  }
}



//总部 - 订单金额及分期特殊调整 - 列表
export function queryBySpecialList(pagingSearch) {
  return {
    type: 'queryBySpecialList',
    payload: {
      promise: api.put('/queryBySpecialList', pagingSearch)
    }
  }
}

//总部 - 订单金额及分期特殊调整 - 调整
export function queryBySpecialUpdate(pagingSearch) {
  return {
    type: 'queryBySpecialUpdate',
    payload: {
      promise: api.put('/queryBySpecialUpdate', pagingSearch)
    }
  }
}

//总部 - 官网订单查询
export function queryOrderListByWebsite(pagingSearch) {
  return {
    type: 'queryOrderListByWebsite',
    payload: {
      promise: api.put('/queryOrderListByWebsite', pagingSearch)
    }
  }
}
//大区 - 订单分部调整 - 列表
export function queryOrderPageByRegionList(pagingSearch) {
  return {
    type: 'queryOrderPageByRegionList',
    payload: {
      promise: api.put('/queryOrderPageByRegionList', pagingSearch)
    }
  }
}
//大区 - 订单分部调整 - 调整
export function updateBranchByOrderIds(pagingSearch) {
  return {
    type: 'updateBranchByOrderIds',
    payload: {
      promise: api.put('/updateBranchByOrderIds', pagingSearch)
    }
  }
}
//----- -----END 4. 订单管理

//-----------------------------总部-招生管理-市场与咨询-学生查询-----------------------------------------
//列表查询
export function getFBStudentSelectList(info) {
  return {
    type: 'GET_FBSTUDENT_SELECT_LIST',
    payload: {
      promise: api.put('/getFBStudentSelectList', info)
    }
  }
}
export function getFBStudentSelectList2(info) {
  return {
    type: 'GET_FBSTUDENT_SELECT_LIST2',
    payload: {
      promise: api.put('/getFBStudentSelectList2', info)
    }
  }
}

//-----------------------------总部-招生管理-任务目标-----------------------------------------
//大区任务目标管理列表查询
export function taskObjectDQManageList(info) {
  return {
    type: 'taskObjectDQManageList',
    payload: {
      promise: api.put('/taskObjectDQManageList', info)
    }
  }
}
//大区任务目标管理 修改任务目标
export function taskObjectDQManageAddOrUpdate(info) {
  return {
    type: 'taskObjectDQManageAddOrUpdate',
    payload: {
      promise: api.put('/taskObjectDQManageAddOrUpdate', info)
    }
  }
}

//领航校区任务目标管理
export function taskObjectCampusList(info) {
  return {
    type: 'taskObjectCampusList',
    payload: {
      promise: api.put('/taskObjectCampusList', info)
    }
  }
}

//验证领航高校是不是在当前招生季或历史招生季中有任务
export function checkUniversityHaveFeeKpi(info) {
  return {
    type: 'checkUniversityHaveFeeKpi',
    payload: {
      promise: api.put('/checkUniversityHaveFeeKpi', info)
    }
  }
}

//-----------------------------分部-招生管理-市场与咨询-学生管理-----------------------------------------
//导出学生
export function exportStudent(info) {
  return {
    type: 'EXPORT_STUDENT',
    payload: {
      promise: api.put('/exportStudent', info)
    }
  }
}



//根据学生id查询科目学习情况
export function queryCourseStudyStatus(id) {
  return {
    type: 'QUERY_COURSE_STUDY_STATUS',
    payload: {
      promise: api.put('/queryCourseStudyStatus', { studentId: id })
    }
  }
}

//-----------------------------总部-财务管理-未匹配订单快捷支付查询-----------------------------------------
export function getOtherPayList(pagingSearch) {
  return {
    type: 'GET_OTHER_PAY_LIST',
    payload: {
      promise: api.put('/getOtherPayList', pagingSearch)
    }
  }
}

//-----------------------------总部-流水对账查询----------------------------------------
export function PipelineReconciliationQueryList(pagingSearch) {
  return {
    type: 'PipelineReconciliationQueryList',
    payload: {
      promise: api.put('/PipelineReconciliationQueryList', pagingSearch)
    }
  }
}
//根据学生id查询参加活动情况
export function queryByStudentId(id) {
  return {
    type: 'QUERY_BY_STUDENT_ID',
    payload: {
      promise: api.put('/queryByStudentId', { studentId: id })
    }
  }
}

//（总部、分部） 未匹配订单快捷支付 删除
export function delOtherPayList(pagingSearch) {
  return {
    type: 'delOtherPayList',
    payload: {
      promise: api.put('/delOtherPayList', pagingSearch)
    }
  }
}
//（总部、分部） 未匹配订单快捷支付 恢复
export function recoveryOtherPayList(pagingSearch) {
  return {
    type: 'recoveryOtherPayList',
    payload: {
      promise: api.put('/recoveryOtherPayList', pagingSearch)
    }
  }
}

//-----------------------------总部-市场与咨询-活动查询------------------------------------------
//列表查询
export function getZBActivityList(info) {
  return {
    type: 'GET_ZBACTIVE_LIST',
    payload: {
      promise: api.put('/getZBActivityList', info)
    }
  }
}

//活动详情页
export function getActivityDetail(info) {
  return {
    type: 'GET_ACTIVE_DETAIL',
    payload: {
      promise: api.put('/getActivityDetail', info)
    }
  }
}
//活动查询
export function getParticipateStudentList(info) {
  return {
    type: 'GET_PARTICIPATE_STUDENTLIST',
    payload: {
      promise: api.put('/getParticipateStudentList', info)
    }
  }
}


//-----------------------------大区-市场与咨询-活动查询------------------------------------------
//活动查询
export function getDQParticipateStudentList(info) {
  return {
    type: 'GET_DQ_PARTICIPATE_STUDENTLIST',
    payload: {
      promise: api.put('/getDQParticipateStudentList', info)
    }
  }
}


//-----------------------------总部-市场与咨询-修改学生市场保护期------------------------------------------
//查询
export function getProtectionInfo(info) {
  return {
    type: 'GET_PROTECTION_INFO',
    payload: {
      promise: api.put('/getProtectionInfo', info)
    }
  }
}
//修改
export function updateProtection(info) {
  return {
    type: 'UPDATE_PROTECTION',
    payload: {
      promise: api.put('/updateProtection', info)
    }
  }
}
//订单详情里的资料领取接口
export function OrderBrochureList(info) {
  return {
    type: 'OrderBrochureList',
    payload: {
      promise: api.put('/OrderBrochureList', info)
    }
  }
}



//总部 、分部 -- 讲师业绩情况查询  - - 列表
export function LecturerPerformanceQueryList(info) {
  return {
    type: 'LecturerPerformanceQueryList',
    payload: {
      promise: api.put('/LecturerPerformanceQueryList', info)
    }
  }
}




//总部 --  参加其它分部活动学生查询
export function InquiriesForParticipantsList(info) {
  return {
    type: 'InquiriesForParticipantsList',
    payload: {
      promise: api.put('/InquiriesForParticipantsList', info)
    }
  }
}



