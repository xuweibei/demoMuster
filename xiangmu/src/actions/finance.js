import api from '../api'

//========================= 学生转账上报 ===============================
//分页获取学生转账流水列表
  export function getStudentPayfeeByTransfer(info) {
    return {
      type: 'GET_STUDENT_PAYFEE_BY_TRANSFER',
      payload: {
        promise: api.put('/getStudentPayfeeByTransfer', info)
      }
    }
  }
//根据学生姓名获取学生转账订单列表接口 
  export function getStudentTransferByStudentName(info) {
    return {
      type: 'GET_STUDENT_TRANSFER_BY_STUDENT_NAME',
      payload: {
        promise: api.put('/getStudentTransferByStudentName', info)
      }
    }
  }  

  //获取转账详情接口
  export function getTransferInfoById(info) {
    return {
      type: 'GET_TRANSFER_INFO_BY_ID',
      payload: {
        promise: api.put('/getTransferInfoById', info)
      }
    }
  }  

//（分部） 学生转账上报管理 费用管理-分部-缴费接口-转账 
    export function studentPayfeePaymentByTransfer(info) {
      return {
        type: 'STUDENT_PAYFEE_PAYMENT_BY_TRANSFER',
        payload: {
          promise: api.put('/studentPayfeePaymentByTransfer', info)
        }
      }
    } 
    
   //（总部） 学生转账查询 分页获取学生转账流水列表接口
    export function queryPageByTransferHeadquarters(info) {
      return {
        type: 'QUERY_PAGE_BY_TRANSFER_HEADQUARTERS',
        payload: {
          promise: api.put('/queryPageByTransferHeadquarters', info)
        }
      }
    }  

    //（分部） 学生转账上报管理 费用管理-分部-缴费接口-转账 
    export function studentPayfeeUpdateByTransfer(info) {
      return {
        type: 'UPDATE_BY_TRANSFER',
        payload: {
          promise: api.put('/studentPayfeeUpdateByTransfer', info)
        }
      }
    } 

     //（分部） 学生转账上报管理 费用管理-分部-已确认转账修改转账时间接口
      export function updatePayDateByTransfer(info) {
        return {
          type: 'updatePayDateByTransfer',
          payload: {
            promise: api.put('/updatePayDateByTransfer', info)
          }
        }
      } 
    

  //（分部） 大客户收费导入查询
export function getStudentPayfeeCustomersList(info) {
  return {
    type: 'getStudentPayfeeCustomersList',
    payload: {
      promise: api.put('/getStudentPayfeeCustomersList',info)
    }
  }
}

  //（分部） 大客户收费导入查询删除
  export function studentPayfeeDeleteTransferById(info) {
    return {
      type: 'STUDENT_PAYFEE_DELETE_TRANSFER_BY_ID',
      payload: {
        promise: api.put('/studentPayfeeDeleteTransferById',info)
      }
    }
  }

  //（分部） 大客户收费导入管理编辑页查询
  export function studentPayfeeEditById(info) {
    return {
      type: 'studentPayfeeEditById',
      payload: {
        promise: api.put('/studentPayfeeEditById',info)
      }
    }
  }

    //（分部） 大客户收费导入管理编辑页修改时间
    export function studentPayfeeEditChangeTimeById(info) {
      return {
        type: 'studentPayfeeEditChangeTimeById',
        payload: {
          promise: api.put('/studentPayfeeEditChangeTimeById',info)
        }
      }
    }

//（总部） 大客户收费导入确认 列表
export function getStudentPayfeeCustomersConfirmList(info) {
  return {
    type: 'getStudentPayfeeCustomersConfirmList',
    payload: {
      promise: api.put('/getStudentPayfeeCustomersConfirmList',info)
    }
  }
}

//（总部） 大客户收费导入确认 审核
export function studentPayfeeCustomersConfirmBatchConfirm(info) {
  return {
    type: 'studentPayfeeCustomersConfirmBatchConfirm',
    payload: {
      promise: api.put('/studentPayfeeCustomersConfirmBatchConfirm',info)
    }
  }
}

//（总部） 基础管理  分部个人订单收费方设置列表查询
export function payeeTypeNameList(info) {
  return {
    type: 'payeeTypeNameList',
    payload: {
      promise: api.put('/payeeTypeNameList',info)
    }
  }
}

//（总部） 基础管理  分部个人订单收费方设置列表查询
export function payeeTypeNameUpd(info) {
  return {
    type: 'payeeTypeNameUpd',
    payload: {
      promise: api.put('/payeeTypeNameUpd',info)
    }
  }
}

//（总部） 财务管理  学生预收款财务确认查询
export function studentPrepaymentList(info) {
  return {
    type: 'studentPrepaymentList',
    payload: {
      promise: api.put('/studentPrepaymentList',info)
    }
  }
}

//（总部） 财务管理  分部预收款确认汇总表
export function fbAdvanceReceiveList(info) {
  return {
    type: 'fbAdvanceReceiveList',
    payload: {
      promise: api.put('/fbAdvanceReceiveList',info)
    }
  }
}

//（总部） 财务管理  分部预收款确认明细表
export function fbAdvanceReceiveDetailed(info) {
  return {
    type: 'fbAdvanceReceiveDetailed',
    payload: {
      promise: api.put('/fbAdvanceReceiveDetailed',info)
    }
  }
}

//（总部） 财务管理  预收款财务确认
export function getStudentPayfeeConfirmList(info) {
  return {
    type: 'getStudentPayfeeConfirmList',
    payload: {
      promise: api.put('/getStudentPayfeeConfirmList',info)
    }
  }
}

//（总部） 财务管理  预收款财务确认详细信息
export function getStudentPayfeeInfoById(studentPayfeeId) {
  return {
    type: 'getStudentPayfeeInfoById',
    payload: {
      promise: api.put('/getStudentPayfeeInfoById',{studentPayfeeId:studentPayfeeId})
    }
  }
}
//（总部） 财务管理  预收款财务确认详细信息(确认订单)
export function getStudentPayfeeConfirmBatchConfirm(info) {
  return {
    type: 'getStudentPayfeeConfirmBatchConfirm',
    payload: {
      promise: api.put('/getStudentPayfeeConfirmBatchConfirm',info)
    }
  }
}



//（分部） 财务管理  转班预收款财务确认详细信息(确认订单)
export function ShiftWorkStudentPayfeeConfirmBatchConfirm(info) {
  return {
    type: 'ShiftWorkStudentPayfeeConfirmBatchConfirm',
    payload: {
      promise: api.put('/ShiftWorkStudentPayfeeConfirmBatchConfirm',info)
    }
  }
}

//（总部） 财务管理  预收款财务确认详细信息 限制日期
export function selectConfirmLastDay(info) {
  return {
    type: 'selectConfirmLastDay',
    payload: {
      promise: api.put('/selectConfirmLastDay',info)
    }
  }
}

//（总部） 财务管理  预收款财务确认详细信息 修改
export function updateConfirmStudentPayfee(info) {
  return {
    type: 'updateConfirmStudentPayfee',
    payload: {
      promise: api.put('/updateConfirmStudentPayfee',info)
    }
  }
}
//根据公司查询收费账户（级联绑定下拉列表）
export function getBankAccountByZbPayeeType(zbPayeeType) {
  return {
    type: 'getBankAccountByZbPayeeType',
    payload: {
      promise: api.put('/getBankAccountByZbPayeeType',{zbPayeeType:zbPayeeType})
    }
  }
}

//总部-缴费记录拆分-列表
export function queryPageBysplitByStudentPayfee(info) {
  return {
    type: 'queryPageBysplitByStudentPayfee',
    payload: {
      promise: api.put('/queryPageBysplitByStudentPayfee',info)
    }
  }
}

//总部-缴费记录拆分-拆分
export function splitByStudentPayfee(info) {
  return {
    type: 'splitByStudentPayfee',
    payload: {
      promise: api.put('/splitByStudentPayfee',info)
    }
  }
}

//总部-财务管理--订单缴费退费流水查询
export function OrderPaymentFeeRefundPipelineQuery(info) {
  return {
    type: 'OrderPaymentFeeRefundPipelineQuery',
    payload: {
      promise: api.put('/OrderPaymentFeeRefundPipelineQuery',info)
    }
  }
}