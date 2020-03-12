import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Layout from '../views/Layout';
import Login from '../views/Login';

import Home from '@/views/Home';
import { authHOC } from '@/utils/auth';

//import Products from './Products';

//demo
/*
import demoManage from '@/views/demo/manage';
const demoRoutes = [
  {
    path: '/demo/manage',
    component: demoManage
  }
];
*/

//-------------------权限管理模块
//角色管理
import MenuManageTabs from '@/views/Authority/MenuManage/tabs.jsx';
import innerRoleManage from '@/views/Authority/InnerRoleManage';
import roleManage from '@/views/Authority/RoleManage';
import dictionaryManage from '@/views/Authority/DictionaryManage';
import OrgUserManage from '@/views/Authority/UserManage';
import UserSearch from '@/views/Authority/UserSearch'

import HistoryOrderManage from '@/views/Authority/HistoryOrderManage'

import HomeManage from '@/views/Authority/HomeManage'
//日志查询
import LogQuery from '@/views/Authority/LogQuery'
//流水对账查询
import PipelinePaymentBillLnquiry from '@/views/Authority/PipelinePaymentBillLnquiry'

//高校管理
import UniversityManage from '@/views/Authority/UniversityManage'
//小程序菜单管理
import SmallProgramMenuManagement from '@/views/Authority/SmallProgramMenuManagement'


//-----系统管理-----//
const systemRoutes = [
  {
    'path': '/Authority/MenuManage',
    'component': MenuManageTabs,
    'exactly': true
  },
  {
    'path': '/Authority/InnerRoleManage',
    'component': innerRoleManage,
    'exactly': true
  },
  {
    'path': '/Authority/RoleManage',
    'component': roleManage,
    'exactly': true
  },
  {
    'path': '/Authority/DictionaryManage',
    'component': dictionaryManage,
    'exactly': true
  },
  {
    'path': '/Authority/UserManage',
    'component': OrgUserManage,
    'exactly': true
  },
  {
    'path': '/Authority/UserSearch',
    'component': UserSearch,
    'exactly': true
  },
  {
    'path': '/Authority/HistoryOrderManage',
    'component': HistoryOrderManage,
    'exactly': true
  },
  {
    'path': '/Authority/HomeManage',
    'component': HomeManage,
    'exactly': true
  },
  {
    'path': '/Authority/LogQuery',
    'component': LogQuery,
    'exactly': true
  },
  {
    'path': '/Authority/PipelinePaymentBillLnquiry',
    'component': PipelinePaymentBillLnquiry,
    'exactly': true
  },
  {
    'path': '/Authority/UniversityManage',
    'component': UniversityManage,
    'exactly': true
  },
  {
    'path': '/Authority/SmallProgramMenuManagement',
    'component': SmallProgramMenuManagement,
    'exactly': true
  }
];

//-------------------基础管理模块

import orgManage from '@/views/ZB/Basic/OrgManage';
import itemManage from '@/views/ZB/Basic/ItemManage';
import courseCategoryManage from '@/views/ZB/Basic/CourseCategoryManage';
import CourseManage from '@/views/ZB/Basic/CourseManage';
import AdminUserManage from '@/views/ZB/Basic/AdminUserManage';
import AdminUserBranchManage from '@/views/ZB/Basic/AdminUserBranchManage';
import TeachCenterManage from '@/views/ZB/Basic/TeachCenterManage';
import StudyRuleManage from '@/views/ZB/Basic/StudyRuleManage';
import DeleteTCourseStudentClass from '@/views/ZB/Basic/DeleteTCourseStudentClass';

import ProjectExamManage from '@/views/ZB/Basic/ProjectExamManage';
import PayeeTypeNameSet from '@/views/ZB/Basic/PayeeTypeNameSet';
import ProjectCourseStageManage from '@/views/ZB/Basic/ProjectCourseStageManage';

//订单缴费记录清除
import OrderPaymentRecordClearance from '@/views/ZB/Basic/OrderPaymentRecordClearance';


//公海分部管理
import HighSeasBranchManagement from '@/views/ZB/Basic/HighSeasBranchManagement';


//-------------------商品管理模块
import ClassTypeManage from '@/views/ZB/Product/ClassTypeManage';
import ProductManage from '@/views/ZB/Product/ProductManage';
import ProductSearch from '@/views/ZB/Product/ProductSearch';



import FBAdminUserManage from '@/views/FB/Basic/AdminUserManage';
import FBOrganizationAreaManage from '@/views/FB/Basic/OrganizationAreaManage';
import FBTeachCenterManage from '@/views/FB/Basic/TeachCenterManage';
import FBCampusManage from '@/views/FB/Basic/CampusManage';

//--------------------学生报班管理模块
import StudentNewspaperClassManage from '@/views/FB/Class/StudentNewspaperClassManage';
//--------------------学生历史报班模块
import StudentHistoryClassManage from '@/views/FB/Class/StudentHistoryClassManage';
import CourseArrangeStudentManage from '@/views/FB/Class/CourseArrangeStudentManage';
import AddCourseArrangeStudentManage from '@/views/FB/Class/AddCourseArrangeStudentManage';
//--------------分部学生情况查询manage
import StudentStudyManage from '@/views/FB/Class/StudentStudyManage';
//--------------------考勤管理
import AttendManage from '@/views/FB/Class/AttendManage';

//------------------- 分部-招生管理-活动与咨询-活动管理-----------------------
import ActivityManage from '@/views/FB/Recruit/ActivityManage';
//------------------- 分部-招生管理-活动与咨询-学员识别-----------------------
import StudentDistingushManage from '@/views/FB/EnrolStudents/StudentDistingushManage';

//------------------- 分部-学服学务-班级管理- 学生学习情况查询-----------------------
import StudentStudyInfo from '@/views/FB/Class/StudentStudyInfo';

//------------------- 分部-学服学务-班级管理- 考勤明细查询-----------------------
import AttendanceCheckFB from '@/views/FB/Class/AttendanceCheckFB';


//------------------- 分部-学服学务-班级管理- 考勤情况统计-----------------------
import AttendanceStatisticsFB from '@/views/FB/Class/AttendanceStatisticsFB';



//基础管理
const basicRoutes = [
  {
    'path': '/ZB/Basic/OrgManage',
    'component': orgManage,
  },
  {
    'path': '/ZB/Basic/ItemManage',
    'component': itemManage,
  },
  {
    'path': '/ZB/Basic/CourseCategoryManage',
    'component': courseCategoryManage,
  },
  {
    'path': '/ZB/Basic/CourseManage',
    'component': CourseManage,
  },
  {
    'path': '/ZB/Basic/AdminUserManage',
    'component': AdminUserManage,
  },
  {
    'path': '/ZB/Basic/AdminUserBranchManage',
    'component': AdminUserBranchManage,
  },

  {
    'path': '/ZB/Product/ClassTypeManage',
    'component': ClassTypeManage,
  },
  {
    'path': '/ZB/Product/ProductManage',
    'component': ProductManage,
  },
  {
    'path': '/ZB/Product/ProductSearch',
    'component': ProductSearch,
  },
  {
    'path': '/FB/Basic/AdminUserManage',
    'component': FBAdminUserManage,
  },
  {
    'path': '/FB/Basic/OrganizationAreaManage',
    'component': FBOrganizationAreaManage,
  },

  {
    'path': '/FB/Basic/TeachCenterManage',
    'component': FBTeachCenterManage,
  },
  {
    'path': '/FB/Basic/CampusManage',
    'component': FBCampusManage,
  },

  {
    'path': '/ZB/Basic/TeachCenterManage',
    'component': TeachCenterManage,
  },
  {
    'path': '/ZB/Basic/StudyRuleManage',
    'component': StudyRuleManage,
  },
  {
    'path': '/ZB/Basic/DeleteTCourseStudentClass',
    'component': DeleteTCourseStudentClass,
  },
  {
    'path': '/ZB/Basic/ProjectExamManage',
    'component': ProjectExamManage,
  },
  {
    'path': '/ZB/Basic/ProjectCourseStageManage',
    'component': ProjectCourseStageManage,
  },
  {
    'path': '/ZB/Basic/OrderPaymentRecordClearance',
    'component': OrderPaymentRecordClearance,
  },
  {
    'path': '/ZB/Basic/HighSeasBranchManagement',
    'component': HighSeasBranchManagement,
  },
  {
    'path': '/ZB/Basic/PayeeTypeNameSet',
    'component': PayeeTypeNameSet,
  },
  {
    'path': '/FB/Class/StudentNewspaperClassManage',
    'component': StudentNewspaperClassManage,
  },
  {
    'path': '/FB/Class/StudentHistoryClassManage',
    'component': StudentHistoryClassManage,
  },
  {
    'path': '/FB/Class/StudentStudyManage',
    'component': StudentStudyManage,
  },
  {
    'path': '/FB/Class/CourseArrangeStudentManage',
    'component': CourseArrangeStudentManage,
  },
  {
    'path': '/FB/Class/AddCourseArrangeStudentManage',
    'component': AddCourseArrangeStudentManage,
  },
  {
    'path': '/FB/Class/AttendManage',
    'component': AttendManage,
  },
  {
    'path': '/FB/Class/StudentStudyInfo',
    'component': StudentStudyInfo,
  },
  {
    'path': '/FB/Class/AttendanceStatisticsFB',
    'component': AttendanceStatisticsFB,
  },
  {
    'path': '/FB/Class/AttendanceCheckFB',
    'component': AttendanceCheckFB,
  },
  //学员识别
  {
    'path': '/FB/EnrolStudents/StudentDistingushManage',
    'component': StudentDistingushManage,
  },


];

//=================== 招生管理模块 =======================
import recruitBatchManage from '@/views/ZB/Recruit/RecruitBatchManage';
import productPriceManage from '@/views/ZB/Recruit/ProductPriceManage';
import productPriceListDQ from '@/views/DQ/Recruit/ProductPriceManage';
import productPriceListFB from '@/views/FB/Recruit/ProductPriceManage';
import TermRuleManage from '@/views/ZB/Recruit/TermRuleManage';
import ProductPriceViewList from '@/views/ZB/Recruit/ProductPriceViewList';
import DiscountRuleList from '@/views/ZB/Recruit/DiscountRuleList';
import EditBranchOrderManage from '@/views/ZB/Recruit/EditBranchOrderManage';
import fbTermRuleManage from '@/views/FB/Recruit/TermRuleManage';
import ViewDiscountRuleManage from '@/views/FB/Recruit/ViewDiscountRuleManage';

//电咨信息管理  yzl
import StudentAskPManage from '@/views/FB/Recruit/StudentAskPManage/tabs.jsx';
//面咨信息管理  yzl
import StudentAskFManage from '@/views/FB/Recruit/StudentAskFManage/tabs.jsx';

//import productPriceApplyManage from '@/views/FB/Recruit/ProductPriceApply/index';

import fbProductPriceApplyManage from '@/views/FB/Recruit/ProductPriceApply';
import zbProductPriceApplyList from '@/views/ZB/Recruit/ProductPriceApply/list';
import fbProductPriceApplyList from '@/views/FB/Recruit/ProductPriceApply/list';
import dqProductPriceApplyList from '@/views/DQ/Recruit/ProductPriceApply/list';
//总部初审、终审
import zbProductPriceApplyBaseAudit from '@/views/ZB/Recruit/ProductPriceApply/baseAudit';
import zbProductPriceApplyFinalAudit from '@/views/ZB/Recruit/ProductPriceApply/finalAudit';
//统一优惠规则管理
import discountRuleManage from '@/views/ZB/Recruit/DiscountRuleManage';

//外呼中心协同
import OutgoingTask from '@/views/FB/Recruit/OutgoingTask';
import OutgoingConsultationView from '@/views/FB/Recruit/OutgoingConsultationView';
import OutgoingOpportunityView from '@/views/FB/Recruit/OutgoingOpportunityView';
import OutgoingOpportunityArrive from '@/views/FB/Recruit/OutgoingOpportunityArrive';
import ShareOpportunityArrive from '@/views/FB/Recruit/ShareOpportunityArrive';
import ShareOpportunityView from '@/views/FB/Recruit/ShareOpportunityView';




//订单业绩相关调整

import OrderAchievementManage from '@/views/FB/EnrolStudents/OrderAchievementManage';
//订单异地缴费
import OrderPaymentDiffentManage from '@/views/FB/Recruit/OrderPaymentDiffentManage';
//分部预收款情况统计
import FBStatisticsOnPreCollection from '@/views/FB/Recruit/StatisticsOnPreCollection';
//分部订单缴费退费流水查询
import FBStudentFeeRefundPipelineQuery from '@/views/ZB/Recruit/StudentFeeRefundPipelineQuery';
//分部-招生管理-活动与咨询
import StudentAskBenefitManage from '@/views/FB/EnrolStudents/StudentAskBenefitManage';
//分部-招生管理-学生面资分配
import StudentAskfaceManage from '@/views/FB/EnrolStudents/StudentAskfaceManage';
//分部-招生管理-学生邀约记录
import StudentInviteManage from '@/views/FB/EnrolStudents/StudentInviteManage';
//分部优惠规则审核
import ProductDiscountRuleManage from '@/views/ZB/Recruit/ProductDiscountRuleManage';
import DQProductDiscountRuleManage from '@/views/DQ/Recruit/ProductDiscountRuleManage';
//大区优惠限额管理
import AreaDiscountRuleManage from '@/views/ZB/Recruit/AreaDiscountRuleManage';
//优惠规则查询
import AreaDiscountRuleSearch from '@/views/ZB/Recruit/AreaDiscountRuleSearch';

//分部优惠规则申请
import FBDiscountRuleManage from '@/views/FB/Recruit/DiscountRuleManage';

// 分部员工优惠限额管理
import FBDiscountRuleEmployeeManage from '@/views/FB/Recruit/DiscountRuleEmployeeManage';

//大区特殊优惠限额查看
import DQSpecialRuleManage from '@/views/DQ/Recruit/SpecialRuleManage';
import DQAreaDiscountRuleManage from '@/views/DQ/Recruit/AreaDiscountRuleManage';

//------------------- 分部的招生管理管理学生归属调整-----------------------
import AscriptionManage from '@/views/ZB/Recruit/AscriptionManage';
//------------------- 总部-招生管理-活动与咨询-学生查询-----------------------
import FBStudentSelectManage from '@/views/ZB/Recruit/StudentSelectManage';

//------------------- 总部-招生管理-活动与咨询-学生原始分部查询-----------------------
import StudentOldBranchSelectManage from '@/views/ZB/Recruit/StudentOldBranchSelectManage';

//------------------- 总部-招生管理-活动与咨询-活动查询-----------------------
import ZBActionQueryManage from '@/views/ZB/Recruit/ActionQueryManage';
import DQActionQueryManage from '@/views/DQ/Recruit/ActionQueryManage';
//------------------- 总部-招生管理-活动与咨询-咨询信息导出-----------------------
import ConsultingInfoExport from '@/views/ZB/Recruit/ConsultingInfoExport';
//------------------- 总部-招生管理-活动与咨询-原始分部学生情况导出-----------------------
import PrimitivePartialDerivation from '@/views/ZB/Recruit/PrimitivePartialDerivation';
//------------------- 大区-招生管理-活动与咨询-学生查询-----------------------
import DQStudentSelectManage from '@/views/DQ/Recruit/StudentSelectManage';
//------------------- 分部-招生管理-活动与咨询-学生管理-----------------------
import FBStudentManage from '@/views/FB/Recruit/StudentManage';
//------------------- 分部-招生管理-活动与咨询-公海学生查询-----------------------
import HighSeasStudentInquiry from '@/views/FB/Recruit/HighSeasStudentInquiry';
//------------------- 分部-招生管理-活动与咨询-参加其它分部活动学生查询-----------------------
import InquiriesParticipantsOtherBranchActivities from '@/views/FB/Recruit/InquiriesParticipantsOtherBranchActivities';
//学生保护期设置
import MarketProtectionPeriod from '@/views/ZB/Recruit/MarketProtectionPeriod';
//------------------- 分部的招生管理管理学生归属调整-----------------------
import FBAscriptionManage from '@/views/FB/Recruit/AscriptionManage';
//限价及特价申请开放管理
import ProductLimitPriceAndOpenManage from '@/views/ZB/Recruit/ProductLimitPriceAndOpenManage';

//任务目标 - 大区任务目标管理
import TaskObjectDQManage from '@/views/ZB/Recruit/TaskObjectDQManage';
//任务目标 - 领航校区任务目标管理
import TaskObjectCampusManage from '@/views/ZB/Recruit/TaskObjectCampusManage';
//大区 - 学生归属管理
import DQAscriptionManage from '@/views/DQ/Recruit/AscriptionManage';

//----------订单管理 Start
import OrderCreate from '@/views/FB/Recruit/OrderCreate';
import OrderManage from '@/views/FB/Recruit/OrderManage';
import OrderQuery from '@/views/FB/Recruit/OrderQuery';
import OrderAudit from '@/views/FB/Recruit/OrderAudit';

import OrderFastPayMatch from '@/views/FB/Recruit/OrderFastPayMatch';
import OrderHistoryRecord from '@/views/FB/Recruit/OrderHistoryRecord';
import OrderHistoryManage from '@/views/FB/Recruit/OrderHistoryManage';

import OrderStageCalculator from '@/views/FB/Recruit/OrderStageCalculator';
import OrderOtherPayQuery from '@/views/FB/Recruit/OrderOtherPayQuery';//分部---未匹配订单快捷支付查询
import OrderPayeeChangeApply from '@/views/FB/Recruit/OrderPayeeChangeApply';//分部---订单收费方变更申请管理
import OrderPInterimPaymentManagement from '@/views/FB/Recruit/OrderPInterimPaymentManagement';//分部---订单POS临时缴费管理
import OrderPayeeChangeAudit from '@/views/ZB/Recruit/OrderPayeeChangeAudit';//总部---订单收费方变更审批
import OrderMoneyTermAdjust from '@/views/ZB/Recruit/OrderMoneyTermAdjust';//总部---订单金额及分期特殊调整
import OfficialWebOrderQuery from '@/views/ZB/Recruit/OfficialWebOrderQuery';//总部---官网订单查询
import CallCenterParticipatesInOrderQuery from '@/views/ZB/Recruit/CallCenterParticipatesInOrderQuery';//总部---呼叫中心参与订单查询
import LecturerPerformanceQuery from '@/views/ZB/Recruit/LecturerPerformanceQuery';//总部---讲师业绩情况查询
import LecturerPerformanceQueryFB from '@/views/FB/Recruit/LecturerPerformanceQueryFB';//分部---讲师业绩情况查询
//预报维护人管理
import ForecastMaintenancePersonManage from '@/views/FB/Recruit/ForecastMaintenancePersonManage';
//预报信息查询 -- 总部
import ForecastInformationQueryZB from '@/views/FB/Recruit/ForecastInformationQuery';
//预报信息查询 -- 分部
import ForecastInformationQuery from '@/views/FB/Recruit/ForecastInformationQuery';
//预报信息查询 -- 大区
import ForecastInformationQueryDQ from '@/views/FB/Recruit/ForecastInformationQuery';

//订单分部调整
import OrderBranchChange from '@/views/DQ/Recruit/OrderBranchChange';
//订单原始分部查询
import OrderOldBranchQuery from '@/views/ZB/Recruit/OrderOldBranchQuery';
//----------订单管理 End

const recruitRoutes = [
  {
    'path': '/ZB/Recruit/MarketProtectionPeriod',
    'component': MarketProtectionPeriod,
  },
  {
    'path': '/ZB/Recruit/RecruitBatchManage',
    'component': recruitBatchManage,
  },
  {
    'path': '/ZB/Recruit/ProductPriceManage',
    'component': productPriceManage,
  },
  {
    'path': '/ZB/Recruit/ProductPriceViewList',
    'component': ProductPriceViewList,
  },
  {
    'path': '/ZB/Recruit/DiscountRuleList',
    'component': DiscountRuleList,
  },
  {//yzl
    'path': '/FB/Recruit/StudentAskPManage',
    'component': StudentAskPManage,
  },
  {//yzl
    'path': '/FB/Recruit/StudentAskFManage',
    'component': StudentAskFManage,
  },
  {
    'path': '/ZB/Recruit/DiscountRuleManage',
    'component': discountRuleManage,
  },

  {
    'path': '/ZB/Recruit/ProductDiscountRuleManage',
    'component': ProductDiscountRuleManage,
  },
  {
    'path': '/DQ/Recruit/ProductDiscountRuleManage',
    'component': DQProductDiscountRuleManage,
  },
  {
    'path': '/FB/Recruit/ProductPriceList',
    'component': productPriceListFB,
  },
  {
    'path': '/DQ/Recruit/ProductPriceList',
    'component': productPriceListDQ,
  },

  {
    'path': '/ZB/Recruit/TermRuleManage',
    'component': TermRuleManage,
  },
  {
    'path': '/FB/Recruit/TermRuleManage',
    'component': fbTermRuleManage,
  },

  {
    'path': '/FB/Recruit/productPriceApply/Manage',
    'component': fbProductPriceApplyManage,
  },
  {
    'path': '/FB/EnrolStudents/OrderAchievementManage',
    'component': OrderAchievementManage,
  },
  {
    'path': '/FB/Recruit/OrderPaymentDiffentManage',
    'component': OrderPaymentDiffentManage,
  },
  {
    'path': '/FB/Recruit/StatisticsOnPreCollection',
    'component': FBStatisticsOnPreCollection,
  },
  {
    'path': '/FB/Recruit/FBStudentFeeRefundPipelineQuery',
    'component': FBStudentFeeRefundPipelineQuery,
  },
  {
    'path': '/FB/EnrolStudents/StudentAskBenefitManage',
    'component': StudentAskBenefitManage,
  },
  {
    'path': '/FB/EnrolStudents/StudentAskfaceManage',
    'component': StudentAskfaceManage,
  },

//外呼中心协同
  {
    'path': '/FB/Recruit/OutgoingTask',
    'component': OutgoingTask,
  },
  {
    'path': '/FB/Recruit/OutgoingConsultationView',
    'component': OutgoingConsultationView,
  },
  {
    'path': '/FB/Recruit/OutgoingOpportunityView',
    'component': OutgoingOpportunityView,
  },
  {
    'path': '/FB/Recruit/OutgoingOpportunityArrive',
    'component': OutgoingOpportunityArrive,
  },
  {
    'path': '/FB/Recruit/ShareOpportunityArrive',
    'component': ShareOpportunityArrive,
  },
  {
    'path': '/FB/Recruit/ShareOpportunityView',
    'component': ShareOpportunityView,
  },
  {
    'path': '/FB/EnrolStudents/StudentInviteManage',
    'component': StudentInviteManage,
  },
  {
    'path': '/FB/Recruit/productPriceApply/List',
    'component': fbProductPriceApplyList,
  },
  {
    'path': '/DQ/Recruit/productPriceApply/List',
    'component': dqProductPriceApplyList,
  },
  {
    'path': '/ZB/Recruit/productPriceApply/List',
    'component': zbProductPriceApplyList,
  },
  {
    'path': '/ZB/Recruit/productPriceApply/BaseAuditManage',
    'component': zbProductPriceApplyBaseAudit,
  },
  {
    'path': '/ZB/Recruit/productPriceApply/FinalAuditManage',
    'component': zbProductPriceApplyFinalAudit,
  },
  {
    'path': '/ZB/Recruit/AreaDiscountRuleManage',
    'component': AreaDiscountRuleManage,
  },
  {
    'path': '/ZB/Recruit/AreaDiscountRuleSearch',
    'component': AreaDiscountRuleSearch,
  },
  {
    'path': '/ZB/Recruit/ConsultingInfoExport',
    'component': ConsultingInfoExport,
  },
  {
    'path': '/ZB/Recruit/PrimitivePartialDerivation',
    'component': PrimitivePartialDerivation,
  },
  {
    'path': '/DQ/Recruit/SpecialRuleManage',
    'component': DQSpecialRuleManage,
  },
  {
    'path': '/FB/Recruit/SpecialRuleManage',
    'component': DQSpecialRuleManage,
  },
  //--------------------订单 start
  {
    'path': '/FB/Recruit/OrderCreate',
    'component': OrderCreate
  },
  {
    'path': '/FB/Recruit/OrderManage',
    'component': OrderManage
  },
  {
    'path': '/FB/Recruit/OrderQuery',
    'component': OrderQuery
  },
  {
    'path': '/FB/Recruit/OrderAudit',
    'component': OrderAudit
  },
  {
    'path': '/FB/Recruit/OrderFastPayMatch',
    'component': OrderFastPayMatch
  },
  {
    'path': '/FB/Recruit/OrderHistoryRecord',
    'component': OrderHistoryRecord
  },
  {
    'path': '/FB/Recruit/OrderHistoryManage',
    'component': OrderHistoryManage
  },
  {
    'path': '/FB/Recruit/OrderStageCalculator',
    'component': OrderStageCalculator
  },
  {
    'path': '/FB/Recruit/OrderOtherPayQuery',
    'component': OrderOtherPayQuery
  },
  {
    'path': '/FB/Recruit/OrderPayeeChangeApply',
    'component': OrderPayeeChangeApply
  },
  {
    'path': '/FB/Recruit/OrderPInterimPaymentManagement',
    'component': OrderPInterimPaymentManagement
  },
  {
    'path': '/ZB/Recruit/OrderPayeeChangeAudit',
    'component': OrderPayeeChangeAudit
  },
  {
    'path': '/ZB/Recruit/OrderMoneyTermAdjust',
    'component': OrderMoneyTermAdjust
  },
  {
    'path': '/ZB/Recruit/OfficialWebOrderQuery',
    'component': OfficialWebOrderQuery
  },
  {
    'path': '/ZB/Recruit/CallCenterParticipatesInOrderQuery',
    'component': CallCenterParticipatesInOrderQuery
  },
  {
    'path': '/ZB/Recruit/LecturerPerformanceQuery',
    'component': LecturerPerformanceQuery
  },
  {
    'path': '/FB/Recruit/LecturerPerformanceQueryFB',
    'component': LecturerPerformanceQueryFB
  },
  {
    'path': '/FB/Recruit/ForecastMaintenancePersonManage',
    'component': ForecastMaintenancePersonManage
  },
  {
    'path': '/FB/Recruit/ForecastInformationQuery',
    'component': ForecastInformationQuery
  },
  {
    'path': '/ZB/Recruit/ForecastInformationQueryZB',
    'component': ForecastInformationQueryZB
  },
  {
    'path': '/DQ/Recruit/ForecastInformationQueryDQ',
    'component': ForecastInformationQueryDQ
  },
  {
    'path': '/DQ/Recruit/OrderBranchChange',
    'component': OrderBranchChange
  },
  {
    'path': '/ZB/Recruit/OrderOldBranchQuery',
    'component': OrderOldBranchQuery
  },
  //--------------------订单 end
  {
    'path': '/DQ/Recruit/AreaDiscountRuleManage',
    'component': DQAreaDiscountRuleManage,
  },
  {
    'path': '/FB/Recruit/DiscountRuleManage',
    'component': FBDiscountRuleManage,
  },
  {
    'path': '/FB/Recruit/ViewDiscountRuleManage',
    'component': ViewDiscountRuleManage,
  },
  {
    'path': '/FB/Recruit/DiscountRuleEmployeeManage',
    'component': FBDiscountRuleEmployeeManage,
  },
  {
    'path': '/ZB/Recruit/AscriptionManage',
    'component': AscriptionManage,
  },

  {
    'path': '/FB/Recruit/AscriptionManage',
    'component': FBAscriptionManage,
  },
  {
    'path': '/ZB/Recruit/StudentSelectManage',
    'component': FBStudentSelectManage,
  },
  {
    'path': '/ZB/Recruit/StudentOldBranchSelectManage',
    'component': StudentOldBranchSelectManage,
  },
  {
    'path': '/DQ/Recruit/StudentSelectManage',
    'component': DQStudentSelectManage,
  },
  {
    'path': '/FB/Recruit/StudentManage',
    'component': FBStudentManage,
  },
  {
    'path': '/FB/Recruit/HighSeasStudentInquiry',
    'component': HighSeasStudentInquiry,
  }, 
  {
    'path': '/FB/Recruit/InquiriesParticipantsOtherBranchActivities',
    'component': InquiriesParticipantsOtherBranchActivities,
  }, 
  {
    'path': '/ZB/Recruit/ActionQueryManage',
    'component': ZBActionQueryManage,
  },
  {
    'path': '/ZB/Recruit/EditBranchOrderManage',
    'component': EditBranchOrderManage,
  },

  {
    'path': '/DQ/Recruit/ActionQueryManage',
    'component': DQActionQueryManage,
  },
  {
    'path': '/FB/Recruit/ActivityManage',
    'component': ActivityManage,
  },
  {
    'path': '/ZB/Recruit/ProductLimitPriceAndOpenManage',
    'component': ProductLimitPriceAndOpenManage,
  },
  {
    'path': '/ZB/Recruit/TaskObjectDQManage',
    'component': TaskObjectDQManage,
  },
  {
    'path': '/ZB/Recruit/TaskObjectCampusManage',
    'component': TaskObjectCampusManage,
  },
  {
    'path': '/DQ/Recruit/AscriptionManage',
    'component': DQAscriptionManage,
  },
];

//=================== END 招生管理模块 =======================

//=================== 大客户模块 =======================
import partnerManage from '@/views/ZB/Partner/PartnerManage';
import partnerDevUserManage from '@/views/ZB/Partner/PartnerDevUserManage';
import PartnerInformationManage from '@/views/ZB/Partner/PartnerInformationManage';
import PartnerContractManage from '@/views/ZB/Partner/PartnerContractManage';
import PartnerProductPriceApplyManage from '@/views/ZB/Partner/ProductPriceApply/index';
import PartnerProductPriceAuditManage from '@/views/ZB/Partner/ProductPriceApply/audit';
import PartnerProductPriceList from '@/views/ZB/Partner/ProductPriceApply/list';

import PartnerProductPriceSearchManage from '@/views/ZB/Partner/ProductPriceSearch/index';
import PartnerProductPriceSearchAuditManage from '@/views/ZB/Partner/ProductPriceSearch/audit';
// import PartnerProductPriceSearch from '@/views/ZB/Partner/ProductPriceSearch/list';

import PartnerChargeparty from '@/views/ZB/Partner/PartnerChargeparty';
import PartnerChargepartyDetailed from '@/views/ZB/Partner/PartnerChargepartyDetailed';
import PartnerInfoManage from '@/views/DQ/Partner/PartnerInfoManage';
import PartnerFBInfoManage from '@/views/FB/Partner/PartnerInfoManage';

//大客户签约信息
import PartnerSignInfo from '@/views/ZB/Partner/PartnerSignInfo';


//=================== 大客户详细信息 =======================
//意向高校情况
import IntentionalCollegesUniversities from '@/views/ZB/Partner/IntentionalCollegesUniversities';



const partnerRoutes = [
  {
    'path': '/ZB/Partner/PartnerManage',
    'component': partnerManage,
  },
  {
    'path': '/ZB/Partner/PartnerDevUserManage',
    'component': partnerDevUserManage,
  },
  {
    'path': '/ZB/Partner/PartnerInformationManage',
    'component': PartnerInformationManage,
  },
  {
    'path': '/ZB/Partner/PartnerContract',
    'component': PartnerContractManage,
  },
  {
    'path': '/ZB/Partner/ProductPriceApply',
    'component': PartnerProductPriceApplyManage,
  },
  {
    'path': '/ZB/Partner/ProductPriceAudit',
    'component': PartnerProductPriceAuditManage,
  },
  {
    'path': '/ZB/Partner/ProductPriceSearch',
    'component': PartnerProductPriceSearchManage,
  },
  {
    'path': '/ZB/Partner/ProductPriceSearchAudit',
    'component': PartnerProductPriceSearchAuditManage,
  },
  {
    'path': '/ZB/Partner/Chargeparty',
    'component': PartnerChargeparty,
  },
  {
    'path': '/ZB/Partner/PartnerSignInfo',
    'component': PartnerSignInfo,
  },
  {
    'path': '/ZB/Partner/ChargepartyDetailed',
    'component': PartnerChargepartyDetailed,
  },
  {
    'path': '/ZB/Partner/IntentionalCollegesUniversities',
    'component': IntentionalCollegesUniversities,
  },
  {
    'path': '/DQ/Partner/ProductPriceList',
    'component': PartnerProductPriceList,
  },
  {
    'path': '/FB/Partner/ProductPriceList',
    'component': PartnerProductPriceList,
  },
  {
    'path': '/DQ/Partner/PartnerInfoManage',
    'component': PartnerInformationManage,
  },
  {
    'path': '/FB/Partner/PartnerInfoManage',
    'component': PartnerInformationManage,
  }
];

//=================== END 大客户模块 =======================

//=================== 学服学务模块 =======================
//开课批次
import coursePlanBatchManage from '@/views/ZB/Course/CoursePlanBatchManage';
import coursePlanAudit from '@/views/ZB/Course/CoursePlanAudit';
import HeadStudentStudyManage from '@/views/ZB/Class/HeadStudentStudyManage';
import ZStudentStudyInfo from '@/views/ZB/Class/ZStudentStudyInfo';
import AttendanceCheck from '@/views/ZB/Class/AttendanceCheck';
import AttendanceStatistics from '@/views/ZB/Class/AttendanceStatistics';
import TeachingPointStudentOrderInquiry from '@/views/ZB/Class/TeachingPointStudentOrderInquiry';
import coursePlanAdd from '@/views/FB/Course/CoursePlanAdd';
import coursePlanManage from '@/views/FB/Course/CoursePlanManage';
import coursePlanSubmit from '@/views/FB/Course/CoursePlanSubmit';
import CourseplanManageFB from '@/views/FB/Course/CourseplanManageFB';
import courseStudentMove from '@/views/FB/Course/CourseStudentMove';
import CourseFBStudentMoveAuditManage from '@/views/FB/Course/CourseStudentMoveAuditManage';
//总部 课表明细管理 课表导入
import courseArrangeManage from '@/views/ZB/Course/CourseArrangeManage';
import courseArrangeImportManage from '@/views/ZB/Course/CourseArrangeImportManage';
//总部课表查询
import CourseArrangeQueryZB from '@/views/ZB/Course/CourseArrangeQuery';
//分部 课表导入
import courseArrangeImportFB from '@/views/FB/Course/CourseArrangeImportFB';
import courseArrangeFB from '@/views/FB/Course/CourseArrangeManage';

//分部 课表查看 课表发布
import courseArrangeQuery from '@/views/FB/Course/CourseArrangeQuery';
import courseArrangePublish from '@/views/FB/Course/CourseArrangePublish';
//分部 班级管理
//学生课表冲突查询
import studentConflict from '@/views/FB/Course/StudentCourseArrangeConflict';
//异动申请
import facetofaceDelay from '@/views/FB/Class/FaceToFaceDelayManage'

//转班申请管理
import CourseStudentMoveManager from '@/views/FB/Course/CourseStudentMoveManager';

//退费退学申请
import CourseStudentRefund from '@/views/FB/Course/CourseStudentRefund';

//退费退学申请管理
import CourseStudentRefundManager from '@/views/FB/Course/CourseStudentRefundManager';

//退学查看
import CourseStudentLeaveManager from '@/views/FB/Course/CourseStudentLeaveManager';

//开课计划查看
import CourseplanManage from '@/views/ZB/Course/CourseplanManage';
//开课计划修改
import CourseplanModify from '@/views/ZB/Course/CourseplanModify';
//激活管理
import CourseActiveManage from '@/views/ZB/Course/CourseActiveManage';
//申请重听审核
import ApplicationAuditionAardHearing from '@/views/ZB/Course/ApplicationAuditionAardHearing';


//延期终审
import DeferredFinalAdjudication from '@/views/ZB/Course/DeferredFinalAdjudication';
//教学点学生订单查询
import TeachingStudentQuery from '@/views/ZB/Class/TeachingStudentQuery';
import TeachingPointStudentOrderInquiryFB from '@/views/FB/Class/TeachingPointStudentOrderInquiryFB';
//教学点学生查询
import TeachingStudentQueryFB from '@/views/FB/Class/TeachingStudentQueryFB';


//课程班班主任管理
import ManagementOfTheHeadTeacherOfTheCourse from '@/views/FB/Class/ManagementOfTheHeadTeacherOfTheCourse';


//网课开通特殊处理
import NetSpecialHandle from '@/views/ZB/Course/NetSpecialHandle';


//特殊网课开通导入
import SpecialNetworkCourses from '@/views/ZB/Course/SpecialNetworkCourses';

//网课订单及激活统计表
import OnlineOrderAndActivationStatistics from '@/views/ZB/Course/OnlineOrderAndActivationStatistics';
//优播网课讲义领取信息管理
import OnlineCourseMaterialGetManage from '@/views/ZB/Course/OnlineCourseMaterialGetManage';

//网课讲义领取管理
import ManagementCourses from '@/views/ZB/Course/ManagementCourses';
//优播网课讲义领取
import CollectionLectureNotesWebcastCourse from '@/views/ZB/Course/CollectionLectureNotesWebcastCourse';

import ApplicationForPostponement from '@/views/FB/Apply/ApplicationForPostponement';
import ExtensionApplication from '@/views/FB/Apply/ExtensionApplication';
import SpecialDelayTrial from '@/views/FB/Apply/SpecialDelayTrial';
import ManagementCoursesFB from '@/views/FB/Apply/ManagementCoursesFB';

//退费退学审核
import LeaveRefundAudit from '@/views/ZB/Class/LeaveRefundAudit';
import LeaveRefundAuditFB from '@/views/FB/Class/LeaveRefundAuditFB';


//直播管理 - 面授直播管理
import FaceTeachLiveManage from '@/views/ZB/Live/FaceTeachLiveManage';
//直播管理 - 直播回放管理
import LivePlayBackManage from '@/views/ZB/Live/LivePlayBackManage';
//直播管理 - 直播预约查询
import LiveAppointmentQuery from '@/views/ZB/Live/LiveAppointmentQuery';
//直播管理 - 预约回放设置
import AppointmentBackSet from '@/views/ZB/Live/AppointmentBackSet';

//分部 - 直播管理 - 直播预约管理
import LiveAppointmentManage from '@/views/FB/Live/LiveAppointmentManage';

//总部 - 资料管理 - 资料管理
import MaterialManage from '@/views/ZB/Material/MaterialManage';
//总部 - 资料管理 - 资料申请审核
import MaterialApplyAudit from '@/views/ZB/Material/MaterialApplyAudit';
//总部 - 资料管理 - 资料领取查询
import MaterialGetQuery from '@/views/ZB/Material/MaterialGetQuery';
//总部 - 资料管理 - 资料审核查询
import MaterialApplyQuery from '@/views/ZB/Material/MaterialApplyQuery';
//总部 - 资料管理 - 资料寄件管理
import MaterialSendManage from '@/views/ZB/Material/MaterialSendManage';

//资料申请管理
import ApplicationManagement from '@/views/FB/Material/ApplicationManagement';

//资料查询
import DataQuery from '@/views/FB/Material/DataQuery';

//资料领取管理
import CollectionManagement from '@/views/FB/Material/CollectionManagement';



//学生专属学服管理 学生专属学服管理
import ExclusiveUniformManagement from '@/views/FB/Exclusive/ExclusiveUniformManagement';

//分部 - 专属学服 - 学生回访管理
import StudentReturnVisitManage from '@/views/FB/Exclusive/StudentReturnVisitManage';
//分部 - 专属学服 - 回访信息查询
import StudentReturnVisitInfoQueryFB from '@/views/FB/Exclusive/StudentReturnVisitInfoQueryFB';
//总部 - 专属学服 - 回访信息查询
import StudentReturnVisitInfoQueryZB from '@/views/ZB/StuService/StudentReturnVisitInfoQueryZB';
//总部 - 专属学服 - 回访情况统计
import ReturnVisitInfoCount from '@/views/ZB/StuService/ReturnVisitInfoCount';
//总部 - 专属学服 - 好学生申请审核
import GoodStudentsApplicationAudit from '@/views/ZB/StuService/GoodStudentsApplicationAudit';
//总部 - 专属学服 - 好学生查询
import GoodStudentInquiry from '@/views/ZB/StuService/GoodStudentInquiry';


//学生专属学服管理 学生信息管理
import StudentInformationManagement from '@/views/FB/Exclusive/StudentInformationManagement';



//学生专属学服管理 学生成绩录入
import StudentAchievementEntry from '@/views/FB/Exclusive/StudentAchievementEntry';


//学生专属学服管理 学生成绩管理
import StudentAchievementManagement from '@/views/FB/Exclusive/StudentAchievementManagement';

//学生专属学服管理 学生科目学习情况查询
import QueriesOnStudentsSubjectLearning from '@/views/FB/Class/StudentStudyInfo';

//学生专属学服管理 学生选课
import StudentElectiveCourse from '@/views/FB/Exclusive/StudentElectiveCourse';
//分部 -- 专属学服好学生申请
import ExclusiveStudentApplication from '@/views/FB/Exclusive/ExclusiveStudentApplication';
//分部 -- 专属学服好学生申请管理
import ExclusiveStudentApplicationAdmin from '@/views/FB/Exclusive/ExclusiveStudentApplicationAdmin';

//学生专属学服管理 学生选课管理
import ManagementOfStudentsCourseSelection from '@/views/FB/Exclusive/ManagementOfStudentsCourseSelection';

//专属学服  -  回访任务管理
import ReturnVisitTaskManage from '@/views/ZB/StuService/ReturnVisitTaskManage';
//班级管理 - 课程班成绩管理
import CourseClassGradeManage from '@/views/FB/Class/CourseClassGradeManage';
//班级管理 - 课程班结束管理
import CourseClosureManagement from '@/views/FB/Class/CourseClosureManagement';
//班级管理 - 考勤二维码打印
import CheckQRCodePrinting from '@/views/FB/Class/CheckQRCodePrinting';

//班级管理 - 班主任好学生申请
import GoodSApplicationHeadTeacher from '@/views/FB/Class/GoodSApplicationHeadTeacher';
//班级管理 - 班主任好学生申请管理
import GoodSApplicationHeadTeacherAdmin from '@/views/FB/Class/GoodSApplicationHeadTeacherAdmin';
//总部 - 课程班学生成绩查询
import CourseClassGradeQuery from '@/views/ZB/Class/CourseClassGradeQuery';


//班级管理 - 课表取消发布及确认
import ReleaseConfirmationScheduleCancellation from '@/views/ZB/Course/ReleaseConfirmationScheduleCancellation';
const courseRoutes = [
  {
    'path': '/ZB/Course/CoursePlanBatchManage',
    'component': coursePlanBatchManage,
  },
  //==============总部-学服学务-班级管理-学习情况查询
  {
    'path': '/ZB/Class/HeadStudentStudyManage',
    'component': HeadStudentStudyManage,
  },
  //==============总部-学服学务-班级管理-学习情况查询
  {
    'path': '/ZB/Class/ZStudentStudyInfo',
    'component': ZStudentStudyInfo,
  },
  //==============总部-学服学务-班级管理-考勤明细查询
  {
    'path': '/ZB/Class/AttendanceCheck',
    'component': AttendanceCheck,
  },
  //==============总部-学服学务-班级管理-考勤情况统计
  {
    'path': '/ZB/Class/AttendanceStatistics',
    'component': AttendanceStatistics,
  },
  {
    'path': '/ZB/Class/TeachingPointStudentOrderInquiry',
    'component': TeachingPointStudentOrderInquiry,
  },
  {
    'path': '/ZB/Class/TeachingStudentQuery',
    'component': TeachingStudentQuery
  },
  {
    'path': '/FB/Class/TeachingPointStudentOrderInquiryFB',
    'component': TeachingPointStudentOrderInquiryFB
  },
  {
    'path': '/FB/Class/TeachingStudentQueryFB',
    'component': TeachingStudentQueryFB
  },
  {
    'path': '/FB/Class/ManagementOfTheHeadTeacherOfTheCourse',
    'component': ManagementOfTheHeadTeacherOfTheCourse
  },
  {
    'path': '/ZB/Course/CoursePlanAudit',
    'component': coursePlanAudit,
  },
  {
    'path': '/FB/Course/CoursePlanAdd',
    'component': coursePlanAdd,
  },
  {
    'path': '/FB/Course/CoursePlanManage',
    'component': coursePlanManage,
  },
  {
    'path': '/FB/Course/CoursePlanSubmit',
    'component': coursePlanSubmit,
  },
  {
    'path': '/FB/Course/CourseplanManageFB',
    'component': CourseplanManageFB,
  },
  {
    'path': '/FB/Course/CourseStudentMove',
    'component': courseStudentMove,
  },
  {
    'path': '/FB/Course/CourseStudentMoveAuditManage',
    'component': CourseFBStudentMoveAuditManage,
  },
  {
    'path': '/ZB/Course/CourseArrangeManage',
    'component': courseArrangeManage,
  },
  {
    'path': '/ZB/Course/CourseArrangeImportManage',
    'component': courseArrangeImportManage,
  },
  {
    'path': '/FB/Course/CourseArrangeQuery',
    'component': courseArrangeQuery,
  },
  {
    'path': '/FB/Course/CourseArrangePublish',
    'component': courseArrangePublish,
  },
  {
    'path': '/FB/Course/StudentCourseArrangeConflict',
    'component': studentConflict,
  },

  {
    'path': '/FB/Class/FaceToFaceDelayManage',
    'component': facetofaceDelay,
  },
  {
    'path': '/FB/Course/CourseStudentMoveManager',
    'component': CourseStudentMoveManager,
  },
  {
    'path': '/FB/Course/CourseStudentRefund',
    'component': CourseStudentRefund,
  },
  {
    'path': '/FB/Course/CourseStudentRefundManager',
    'component': CourseStudentRefundManager,
  },
  {
    'path': '/FB/Course/CourseStudentLeaveManager',
    'component': CourseStudentLeaveManager,
  },
  {
    'path': '/ZB/Course/CourseplanManage',
    'component': CourseplanManage,
  },
  {
    'path': '/ZB/Course/CourseplanModify',
    'component': CourseplanModify,
  },
  {
    'path': '/ZB/Course/CourseActiveManage',
    'component': CourseActiveManage,
  },
  {
    'path': '/ZB/Course/ApplicationAuditionAardHearing',
    'component': ApplicationAuditionAardHearing,
  },
  {
    'path': '/ZB/Course/DeferredFinalAdjudication',
    'component': DeferredFinalAdjudication,
  },
  {
    'path': '/ZB/Course/NetSpecialHandle',
    'component': NetSpecialHandle,
  },
  {
    'path': '/ZB/Course/SpecialNetworkCourses',
    'component': SpecialNetworkCourses,
  },
  {
    'path': '/ZB/Course/OnlineOrderAndActivationStatistics',
    'component': OnlineOrderAndActivationStatistics,
  },
  {
    'path': '/ZB/Course/ManagementCourses',
    'component': ManagementCourses,
  },
  {
    'path': '/ZB/Course/CollectionLectureNotesWebcastCourse',
    'component': CollectionLectureNotesWebcastCourse,
  },
  {
    'path': '/ZB/Course/OnlineCourseMaterialGetManage',
    'component': OnlineCourseMaterialGetManage,
  },
  //==============分部-学服学务-课表导入
  {
    'path': '/FB/Course/CourseArrangeImportFB',
    'component': courseArrangeImportFB,
  },
  //==============分部-学服学务-课表明细管理
  {
    'path': '/FB/Course/CourseArrangeFB',
    'component': courseArrangeFB,
  },
  {
    'path': '/ZB/Course/CourseArrangeQueryZB',
    'component': CourseArrangeQueryZB,
  },
  //==============分部-学服学务-课程管理
  {
    'path': '/FB/Apply/ApplicationForPostponement',
    'component': ApplicationForPostponement,
  },
  {
    'path': '/FB/Apply/ExtensionApplication',
    'component': ExtensionApplication,
  },
  {
    'path': '/FB/Apply/SpecialDelayTrial',
    'component': SpecialDelayTrial,
  },
  {
    'path': '/FB/Apply/ManagementCoursesFB',
    'component': ManagementCoursesFB,
  },
  {
    'path': '/ZB/Class/LeaveRefundAudit',
    'component': LeaveRefundAudit,
  },
  {
    'path': '/FB/Class/LeaveRefundAuditFB',
    'component': LeaveRefundAuditFB,
  },
  {
    'path': '/FB/Class/CourseClassGradeManage',
    'component': CourseClassGradeManage,
  },
  {
    'path': '/ZB/Class/CourseClassGradeQuery',
    'component': CourseClassGradeQuery,
  },
  {
    'path': '/FB/Class/CourseClosureManagement',
    'component': CourseClosureManagement,
  },
  {
    'path': '/ZB/Live/FaceTeachLiveManage',
    'component': FaceTeachLiveManage,
  },
  {
    'path': '/ZB/Live/LivePlayBackManage',
    'component': LivePlayBackManage,
  },
  {
    'path': '/ZB/Live/LiveAppointmentQuery',
    'component': LiveAppointmentQuery,
  },
  {
    'path': '/ZB/Live/AppointmentBackSet',
    'component': AppointmentBackSet,
  },
  {
    'path': '/FB/Live/LiveAppointmentManage',
    'component': LiveAppointmentManage,
  },
  {
    'path': '/ZB/Material/MaterialManage',
    'component': MaterialManage,
  },
  {
    'path': '/ZB/Material/MaterialApplyAudit',
    'component': MaterialApplyAudit,
  },
  {
    'path': '/ZB/Material/MaterialGetQuery',
    'component': MaterialGetQuery,
  },
  {
    'path': '/ZB/Material/MaterialApplyQuery',
    'component': MaterialApplyQuery,
  },
  {
    'path': '/ZB/Material/MaterialSendManage',
    'component': MaterialSendManage,
  },
  {
    'path': '/FB/Material/ApplicationManagement',
    'component': ApplicationManagement,
  },
  {
    'path': '/FB/Material/DataQuery',
    'component': DataQuery,
  },
  {
    'path': '/FB/Material/CollectionManagement',
    'component': CollectionManagement,
  },
  {
    'path': '/FB/Exclusive/ExclusiveUniformManagement',
    'component': ExclusiveUniformManagement,
  },
  {
    'path': '/FB/Exclusive/StudentInformationManagement',
    'component': StudentInformationManagement,
  },
  {
    'path': '/FB/Exclusive/StudentAchievementEntry',
    'component': StudentAchievementEntry,
  },
  {
    'path': '/FB/Exclusive/StudentAchievementManagement',
    'component': StudentAchievementManagement,
  },
  {
    'path': '/FB/Exclusive/StudentElectiveCourse',
    'component': StudentElectiveCourse,
  },
  {
    'path': '/FB/Exclusive/ExclusiveStudentApplication',
    'component': ExclusiveStudentApplication,
  },
  {
    'path': '/FB/Exclusive/ExclusiveStudentApplicationAdmin',
    'component': ExclusiveStudentApplicationAdmin,
  },
  {
    'path': '/FB/Exclusive/ManagementOfStudentsCourseSelection',
    'component': ManagementOfStudentsCourseSelection,
  },
  {
    'path': '/FB/Exclusive/QueriesOnStudentsSubjectLearning',
    'component': QueriesOnStudentsSubjectLearning,
  },
  {
    'path': '/FB/Exclusive/StudentReturnVisitManage',
    'component': StudentReturnVisitManage,
  },
  {
    'path': '/ZB/StuService/ReturnVisitTaskManage',
    'component': ReturnVisitTaskManage,
  },
  {
    'path': '/FB/Exclusive/StudentReturnVisitInfoQueryFB',
    'component': StudentReturnVisitInfoQueryFB,
  },
  {
    'path': '/ZB/StuService/StudentReturnVisitInfoQueryZB',
    'component': StudentReturnVisitInfoQueryZB,
  },
  {
    'path': '/ZB/StuService/ReturnVisitInfoCount',
    'component': ReturnVisitInfoCount,
  },
  {
    'path': '/ZB/StuService/GoodStudentInquiry',
    'component': GoodStudentInquiry,
  },
  {
    'path': '/ZB/StuService/GoodStudentsApplicationAudit',
    'component': GoodStudentsApplicationAudit,
  },
  {
    'path': '/FB/Class/CheckQRCodePrinting',
    'component': CheckQRCodePrinting,
  },
  {
    'path': '/FB/Class/GoodSApplicationHeadTeacher',
    'component': GoodSApplicationHeadTeacher,
  },
  {
    'path': '/FB/Class/GoodSApplicationHeadTeacherAdmin',
    'component': GoodSApplicationHeadTeacherAdmin,
  },
  {
    'path': '/ZB/Course/ReleaseConfirmationScheduleCancellation',
    'component': ReleaseConfirmationScheduleCancellation,
  },
];
//=================== END 学服学务模块 =======================

//=================== 财务管理模块 =======================
import BankAccount from '@/views/ZB/Accounter/BankAccountManage';
import Pose from '@/views/ZB/Pose/PoseManage';
//转班财务审核
import CourseStudentMoveAuditManage from '@/views/ZB/Course/CourseStudentMoveAuditManage';
//退费财务审核
import CourseStudentRefundHeadquartersManager from '@/views/ZB/Course/CourseStudentRefundHeadquartersManager';

//退费退学财务初审
import LeaveRefundExamination from '@/views/ZB/Course/LeaveRefundExamination';
//退费退学分管副总审核
import LeaveRefundDeputyChiefAudit from '@/views/ZB/Course/LeaveRefundDeputyChiefAudit';
//退费退学分管老总审核
import LeaveRefundManagerAudit from '@/views/ZB/Course/LeaveRefundManagerAudit';
//副总批次最高限额
import ViceCatchCeiling from '@/views/ZB/Course/ViceCatchCeiling'; 
//退费退学申请查询
import LeaveRefundApplicationInquiry from '@/views/ZB/Course/LeaveRefundApplicationInquiry';




//学生转账上报管理
import StudentTransferReport from '@/views/FB/Finance/StudentTransferReport';
//新增学生转账上报
import StudentTransferReportCreate from '@/views/FB/Finance/StudentTransferReport/ChoiceStudentOrder.jsx';

import StudentTransferQuery from '@/views/ZB/Finance/StudentTransferQuery';
//(总部)预收款情况及业绩导出
import HeadPrepaymentListExport from '@/views/ZB/Finance/HeadPrepaymentListExport';

//大客户收费导入
import StudentPayfeeCustomersImprot from '@/views/FB/Finance/StudentPayfeeCustomersImprot';

//总部-费用管理-挂单费用查询maange
import FailOrderMoneyQueryManage from '@/views/ZB/Recruit/FailOrderMoneyQueryManage';

//总部-费用管理-预收款月报maange
import PayfeeStatementManage from '@/views/ZB/Recruit/PayfeeStatementManage';
//总部-费用管理-历史订单导入
import HistoricalOrderImport from '@/views/ZB/Recruit/HistoricalOrderImport';
//总部-费用管理-学生收入确认明细
import StudentIncomeDetailsManage from '@/views/ZB/Recruit/StudentIncomeDetailsManage';
//总部-费用管理-预收款情况确认
import StatisticsOnPreCollection from '@/views/ZB/Recruit/StatisticsOnPreCollection';
//总部-费用管理-互联网预收款情况统计
import InternetStatisticsOnPreCollection from '@/views/ZB/Recruit/InternetStatisticsOnPreCollection';
//总部-费用管理-订单缴费退费流水查询
import StudentFeeRefundPipelineQuery from '@/views/ZB/Recruit/StudentFeeRefundPipelineQuery';
//总部-费用管理-大客户预收款情况确认
import StatisticsAdvanceReceipts from '@/views/ZB/Recruit/StatisticsAdvanceReceipts';
//大客户收费导入
import StudentPayfeeCustomers from '@/views/FB/Finance/StudentPayfeeCustomers';
//大客户收费订单学费导入确认
import StudentPayfeeCustomersConfirmManage from '@/views/ZB/Finance/StudentPayfeeCustomersConfirmManage';

//未匹配订单快捷支付查询 == 总部
import OrderOtherPayList from '@/views/ZB/Recruit/OrderOtherPayList';
//未匹配订单快捷支付查询 == 大区
import OrderOtherPayListLargeArea from '@/views/ZB/Recruit/OrderOtherPayList';
//退费退学审核 == 大区
import LeaveRefundAuditDQ from '@/views/DQ/Recruit/LeaveRefundAuditDQ';
//分部预收款确认汇总表
import FBadvanceReceive from '@/views/ZB/Recruit/FBadvanceReceive';
//学生预收款确认查询
import StudentAdvancesList from '@/views/ZB/Recruit/StudentAdvancesList';
//（分部）预收款情况及业绩归属查询报表
import BranchPrepaymentListExport from '@/views/FB/Finance/BranchPrepaymentListExport';

//总部-财务管理-预收款财务确认
import StudentPayfeeConfirmManage from '@/views/ZB/Finance/StudentPayfeeConfirmManage';
//分部-财务管理-转班预收款财务确认
import ShiftWorkStudentPayfeeConfirmManageFB from '@/views/FB/Finance/ShiftWorkStudentPayfeeConfirmManageFB'; 
//总部-财务管理-收入月报计算日期设置
import IncomeStatementSetDate from '@/views/ZB/Recruit/IncomeStatementSetDate';
//分部-财务管理-缴费记录拆分
import PaymentRecordSplit from '@/views/FB/Finance/PaymentRecordSplit';

//总部-转班信息查询
import TransferFinancialInformationQuery from '@/views/ZB/Finance/TransferFinancialInformationQuery';

const accountRoutes = [
  {
    'path': '/ZB/Accounter/BankAccountManage',
    'component': BankAccount,
  },
  {
    'path': '/ZB/Pose/PoseManage',
    'component': Pose,
  },
  {
    'path': '/ZB/Course/CourseStudentMoveAuditManage',
    'component': CourseStudentMoveAuditManage,
  },
  {
    'path': '/ZB/Recruit/FailOrderMoneyQueryManage',
    'component': FailOrderMoneyQueryManage,
  },
  {
    'path': '/ZB/Recruit/PayfeeStatementManage',
    'component': PayfeeStatementManage,
  },
  {
    'path': '/ZB/Recruit/HistoricalOrderImport',
    'component': HistoricalOrderImport,
  },
  {
    'path': '/ZB/Recruit/StudentIncomeDetailsManage',
    'component': StudentIncomeDetailsManage,
  },
  {
    'path': '/ZB/Recruit/StatisticsOnPreCollection',
    'component': StatisticsOnPreCollection,
  },
  {
    'path': '/ZB/Recruit/StudentFeeRefundPipelineQuery',
    'component': StudentFeeRefundPipelineQuery,
  },
  {
    'path': '/ZB/Recruit/InternetStatisticsOnPreCollection',
    'component': InternetStatisticsOnPreCollection,
  },
  {
    'path': '/ZB/Recruit/StatisticsAdvanceReceipts',
    'component': StatisticsAdvanceReceipts,
  },
  {
    'path': '/ZB/Course/CourseStudentRefundHeadquartersManager',
    'component': CourseStudentRefundHeadquartersManager,
  },
  {
    'path': '/ZB/Course/LeaveRefundExamination',
    'component': LeaveRefundExamination,
  },
  {
    'path': '/ZB/Course/LeaveRefundDeputyChiefAudit',
    'component': LeaveRefundDeputyChiefAudit,
  },
  {
    'path': '/ZB/Course/LeaveRefundManagerAudit',
    'component': LeaveRefundManagerAudit,
  },
  {
    'path': '/ZB/Course/ViceCatchCeiling',
    'component': ViceCatchCeiling,
  }, 
  {
    'path': '/ZB/Course/LeaveRefundApplicationInquiry',
    'component': LeaveRefundApplicationInquiry,
  },
  {
    'path': '/ZB/Finance/StudentTransferQuery',
    'component': StudentTransferQuery,
  },
  {
    'path': '/FB/Finance/StudentTransferReport',
    'component': StudentTransferReport,
  },
  {
    'path': '/FB/Finance/StudentTransferReportCreate',
    'component': StudentTransferReportCreate,
  },
  {
    'path': '/FB/Finance/StudentPayfeeCustomersImprot',
    'component': StudentPayfeeCustomersImprot,
  },
  {
    'path': '/FB/Finance/StudentPayfeeCustomers',
    'component': StudentPayfeeCustomers,
  },
  {
    'path': '/ZB/Recruit/OrderOtherPayList',
    'component': OrderOtherPayList,
  },
  {
    'path': '/DQ/Recruit/OrderOtherPayList',
    'component': OrderOtherPayListLargeArea,
  },
  {
    'path': '/DQ/Recruit/LeaveRefundAuditDQ',
    'component': LeaveRefundAuditDQ,
  },
  {
    'path': '/ZB/Finance/StudentPayfeeCustomersConfirmManage',
    'component': StudentPayfeeCustomersConfirmManage,
  },
  {
    'path': '/ZB/Recruit/FBadvanceReceive',
    'component': FBadvanceReceive,
  },
  {
    'path': '/ZB/Recruit/StudentAdvancesList',
    'component': StudentAdvancesList,
  },
  {
    'path': '/ZB/Finance/StudentPayfeeConfirmManage',
    'component': StudentPayfeeConfirmManage,
  },
  {
    'path': '/FB/Finance/ShiftWorkStudentPayfeeConfirmManageFB',
    'component': ShiftWorkStudentPayfeeConfirmManageFB,
  },
  {
    'path': '/ZB/Finance/TransferFinancialInformationQuery',
    'component': TransferFinancialInformationQuery,
  },
  {
    'path': '/FB/Finance/BranchPrepaymentListExport',
    'component': BranchPrepaymentListExport,
  },
  {
    'path': '/ZB/Finance/HeadPrepaymentListExport',
    'component': HeadPrepaymentListExport,
  },
  {
    'path': '/ZB/Recruit/IncomeStatementSetDate',
    'component': IncomeStatementSetDate,
  },
  {
    'path': '/FB/Finance/PaymentRecordSplit',
    'component': PaymentRecordSplit,
  },
];


//=================== 教学模块 =======================
import TeacherManage from '@/views/ZB/Teaching/TeacherManage';
import TeacherView from '@/views/FB/Teaching/TeacherManage';

//批次管理
import ClassBatchManage from '@/views/ZB/Teaching/ClassBatchManage';
//班级管理
import ClassManage from '@/views/ZB/Teaching/ClassManage';

const teachingRoutes = [
  {
    'path': '/ZB/Teaching/TeacherManage',
    'component': TeacherManage,
  },
  {
    'path': '/FB/Teaching/TeacherManage',
    'component': TeacherView,
  },
  {
    'path': '/ZB/Teaching/ClassBatchManage',
    'component': ClassBatchManage,
  },
  {
    'path': '/ZB/Teaching/ClassManage',
    'component': ClassManage,
  },
];

export const childRoutes = [
  {
    'path': '/home',
    'component': Home,
    'exactly': true
  },
  //...demoRoutes,//功能区域模块定义
  ...systemRoutes,  //系统管理
  ...basicRoutes,
  ...recruitRoutes,
  ...partnerRoutes,
  ...courseRoutes,
  ...accountRoutes,
  ...teachingRoutes,
];

const routes = (
  <Switch>
    <Route path="/login" component={Login} />
    <Route path="/" component={authHOC(Layout)} />
  </Switch>
);

export default routes;
