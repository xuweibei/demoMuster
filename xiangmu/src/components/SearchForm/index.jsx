/*
通用查询列表 表头
*/
import React from 'react'
import { Form, Row, Col, Select, Input, Button, message, DatePicker, Radio } from 'antd';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const Option = Select.Option;
const FormItem = Form.Item;
import { env } from '@/api/env';
import moment from 'moment';
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';

import ContentBox from '@/components/ContentBox';
import SearchInput from '@/components/SearchInput';
import FileDownloader from '@/components/FileDownloader';
import NumericInput from '@/components/NumericInput';
import FileUploader from '@/components/FileUploader';
import {
  searchFormItemLayout, loadBizDictionary, onSearch,
  onPageIndexChange, onShowSizeChange, onToggleSearchOption,
  renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import { getDictionaryTitle, dataBind, timestampToTime } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import {
  getItemList, getItemListByUser,
  getCourseCategoryList, getTeachCenterList, getTeachCenterByBranchId,
  getOrganizationVoList, getBranchList,
  getClassList, selectAreaByUser
} from '@/actions/base';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectClassType from '@/components/BizSelect/SelectClassType';

import { getCoursePlanBatchByItemId } from '@/actions/course';  //开课批次
import { postRecruitBatchList } from '@/actions/recruit';
import { queryPartnerByBranchId, queryByOrderSearch } from '@/actions/partner';
import { orgBranchListByParentId } from '@/actions/admin'

const row24 = {
  justify: "center",
  gutter: 24,
  align: "middle",
  type: "flex"
};

const NUM_COLUMN = 4;
/*select 和传入 data 匹配*
item    bz_item_list
course_plan_batch   bz_course_plan_batch_list
course_category   bz_course_category_list
teach_center    bz_teach_center_list
branch    bz_branch_list
class_type    bz_class_type_list
recruit_batch   bz_recruit_batch_list
dic_YesNo
dic_Status
courseplan_status
publish_state
teach_class_type
producttype
discount_type
order_type
order_status    //订单状态
order_audit_status    //订单审核状态
payee_type
esign_status
student_change_type
order_payee_change_status  //订单收费方变更审核状态
**/

class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num_column: this.props.num_column || NUM_COLUMN,
      pagingSearch: props.pagingSearch || { currentPage: 1, pageSize: env.defaultPageSize },
      dic_Status: [],
      bz_item_list: [],    //项目
      bz_course_plan_batch_list: [],   //开课批次
      bz_course_category_list: [],   //
      bz_teach_center_list: [],    //教学点
      bz_branch_list: [],    //分部
      bz_class_type_list: [],  //班型
      bz_recruit_batch_list: [],  //招生季
      //bz_course_arrange_list: [], //课程班/课表(主表)
      bz_region_list: [],   //区域
      bz_partner_list: [],  //大客户
      course_arrange_status: [],  //课表确认情况
      startValue: null,
      endValue: null,
      endOpen: false,
    };
    this.onSearchCheckedNum = 0;  //查询前 必须要依赖的条件项 数据
    this.intervalHandler = null;

    this.onSearch = onSearch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    (this: any).getFields = this.getFields.bind(this);
    (this: any).checkAndOnSearch = this.checkAndOnSearch.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    (this: any).extendCustomerButtonClick = this.extendCustomerButtonClick.bind(this);

    (this: any).getConditionData = this.getConditionData.bind(this);
    (this: any).getItems = this.getItems.bind(this);
    (this: any).getCoursePlanBatchs = this.getCoursePlanBatchs.bind(this);
    (this: any).getCourseCategorys = this.getCourseCategorys.bind(this);
    (this: any).getTeachCenters = this.getTeachCenters.bind(this);
    (this: any).getBranchs = this.getBranchs.bind(this);
    (this: any).getClassTypes = this.getClassTypes.bind(this);  //班型
    (this: any).getRecruitBatchs = this.getRecruitBatchs.bind(this);  //招生季
    (this: any).getRegions = this.getRegions.bind(this);  //区域
    (this: any).getPartners = this.getPartners.bind(this);  //大客户

    (this: any).setSelect = this.setSelect.bind(this);
    (this: any).addSelectAll = this.addSelectAll.bind(this);
    (this: any).onSelectChange = this.onSelectChange.bind(this);
    (this: any).onRadioChange = this.onRadioChange.bind(this);
    (this: any).onSearchInputGet = this.onSearchInputGet.bind(this);
    (this: any).onSearchInputSet = this.onSearchInputSet.bind(this);
  }
  componentWillMount() {
    console.log("SearchForm componentWillMount");
    var list = [];
    if (this.props.isStatus) {
      list.push('dic_Status');
    }
    if (this.props.isYesNo) {
      list.push('dic_YesNo');
    }
    if (this.props.isTeachClassType) {    //
      list.push('teach_class_type');
    }
    if (this.props.isCoursePlanAuditStatus) {   //课程计划审核状态
      list.push('courseplan_status');
    }
    if (this.props.isPublishState) {  //发布状态
      list.push('publish_state');
    }
    if (this.props.isProductType) {  //商品属性
      list.push('producttype');
    }
    if (this.props.isDiscountType) {  //折扣类型
      list.push('discount_type');
    }
    if (this.props.isOrderType) {
      list.push('order_type');
    }
    if (this.props.isOrderStatus) {
      list.push('order_status')
    }
    if (this.props.isOrderPayeeChangeStatus) {
      list.push('order_payee_change_status')
    }
    if (this.props.isPayeeType) {
      list.push('payee_type')
    }
    if (this.props.isEsignStatus) {
      list.push('esign_status')
    }
    if (this.props.isStudentChangeType) {
      list.push('student_change_type')
    }
    if (this.props.isOrderSource) {
      list.push('order_source');
    }
    if(this.props.isOrderAuditStatus){
      list.push('order_audit_status');
    }
    if(this.props.isCourseArrangeStatus){
      list.push('course_arrange_status');
    }
    this.loadBizDictionary(list);
    this.getConditionData();
  }
  componentDidMount() {
    console.log("SearchForm componentDidMount");
  }
  componentWillUnMount() {
    clearInterval(this.intervalHandler);
  }
  componentWillReceiveProps(nextProps) {
    if ('branchId' in nextProps) {
      //总部》开课计划审核》分部选择》触发 教学点列表
      let value = `${nextProps.branchId || ''}`;
      if(value){
        this.getTeachCenters(value);
      }
    }
  }

  getConditionData() {
    this.getItems();
    //this.getCoursePlanBatchs(); 在选择项目后，级联查找
    if (!this.props.isItemUser) {
      this.getCourseCategorys();
    }
    //this.getBranchs();  使用 SearchInput 方式查找数据
    //if (this.props.isBranchAll || this.props.isBranchDQ) {
    //  this.getBranchs();
    //}

    this.getTeachCenters();
    this.getClassTypes();
    this.getRecruitBatchs();
    this.getRegions();
    this.getPartners();

    var that = this;
    setTimeout(function () {
      that.setSelect();
    }, 1000);
    this.onSearchCheckedNum = 0;
    // this.checkAndOnSearch();
  }

  checkAndOnSearch() {
    var run_num = 0;
    var needNum = 0;
    var that = this;
    var terminal = function () {
      for (var i = 0; i < that.props.form_item_list.length; i++) {
        var item = that.props.form_item_list[i];
        if (!item.is_all && item.data) {
          needNum += 1;
        }
      }
      if (needNum > 0) {
        that.intervalHandler = setInterval(function () {
          if (run_num >= 10) {
            clearInterval(that.intervalHandler);
            return;
          }
          if (that.onSearchCheckedNum == needNum) {
            that.onSearch();
            clearInterval(that.intervalHandler);
          } else {
            terminal();
          }
          run_num += 1;
        }, 1000);
      } else {
        that.onSearch();
      }
    }
    terminal();
  }

  getItems() {
    var that = this;
    var list = this.addSelectAll('item');
    if (this.props.isItemUser) {
      //合作项目（当前用户的）
      this.props.getItemListByUser(this.props.userId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data.map(item => {
            list.push({
              value: item.itemId,
              title: item.itemName
            });
          })
          if (this.props.isNeedSelectName) {
            var ps = this.state.pagingSearch;
            ps.itemName = list[0].title;
            ps.itemId = list[0].value;
            that.setState({ bz_item_list: list, pagingSearch: ps })
            that.props.pagingSearchCallback(ps);
          } else {
            that.setState({ bz_item_list: list })
          }
          if (list.length) {
            if (this.props.isCoursePlanBatch) {
              var _itemId = that.state.pagingSearch.itemId ? that.state.pagingSearch.itemId : list[0].value;
              that.getCoursePlanBatchs(_itemId);
            }
            if (that.props.isCourseCategory) {
              var _itemId = that.state.pagingSearch.itemId ? that.state.pagingSearch.itemId : list[0].value;
              that.getCourseCategorys(_itemId);
            }
          }
        }
        else {
          message.error(data.message);
        }
      })
    } else if (this.props.isItemAll) {
      getAllItemList(function (all_item_list) {
        if (list.length == 0) {
          this.onSearchCheckedNum += 1;
        }
        all_item_list.map(item => {
          list.push({
            value: item.itemId,
            title: item.itemName
          })
        });
        that.setState({ bz_item_list: list })
      })
    }
  }
  getCoursePlanBatchs(itemId) {
    if (!this.props.isCoursePlanBatch) {
      return;
    }
    var that = this;
    var list = this.addSelectAll('course_plan_batch');
    this.props.getCoursePlanBatchByItemId(itemId).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        if (list.length == 0) {
          this.onSearchCheckedNum += 1;
        }
        data.data.map(r => {
          list.push({
            value: r.courseplanBatchId,
            title: r.courseplanBatchName
          })
        });
        if (this.props.isNeedSelectName) {
          var ps = this.state.pagingSearch;
          ps.coursePlanBatchId = list.length ? list[0].value : '';
          ps.courseplanBatchId = ps.coursePlanBatchId;
          ps.coursePlanBatchName = list.length ? list[0].title : '';
          that.props.pagingSearchCallback(ps);
          that.setState({ bz_course_plan_batch_list: list, pagingSearch: ps })
        } else {
          that.setState({ bz_course_plan_batch_list: list });
        }
      }
      else {
        message.error(data.message);
      }
    })
  }
  getCourseCategorys(itemId) {
    if (!this.props.isCourseCategory) {
      return;
    }
    var that = this;
    var list = this.addSelectAll('course_category');
    var condition = { currentPage: 1, pageSize: 99, courseCategoryStatus: 1, itemId: itemId, name: '' }
    if(this.props.isMain){
      condition.isMain = 1; //核心科目
    }
    this.props.getCourseCategoryList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        if (list.length == 0) {
          this.onSearchCheckedNum += 1;
        }
        data.data.map(r => {
          list.push({
            value: r.courseCategoryId,
            title: r.name
          })
        });
        that.setState({ bz_course_category_list: list });
      }
      else {
        message.error(data.message);
      }
    })
  }
  getTeachCenters(branchId) {
    if (!this.props.isTeachCenter) {
      return;
    }
    var that = this;
    var list = this.addSelectAll('teach_center');
    if (branchId) {
      var condition = { currentPage: 1, pageSize: 99, branchId: branchId }
      this.props.getTeachCenterByBranchId(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data = data.data || [];
          data.data.map(r => {
            list.push({
              value: r.orgId,
              title: r.orgName
            })
          });
          that.setState({ bz_teach_center_list: list });
        }
        else {
          message.error(data.message);
        }
      })
    } else {
      var condition = { currentPage: 1, pageSize: 99, state: '', teachCenterType: '', teachCenterName: '' }
      this.props.getTeachCenterList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data = data.data || [];
          data.data.map(r => {
            list.push({
              value: r.orgId,
              title: r.orgName
            })
          });
          that.setState({ bz_teach_center_list: list });
        }
        else {
          message.error(data.message);
        }
      })
    }

  }
  getBranchs(name, callback) {
    var that = this;
    var list = this.addSelectAll('branch');
    if (this.props.isBranchUser) {
      //分部（选中用户的）
      var userId = this.props.choosedUserId || this.props.userId;
      var condition = { currentPage: 1, pageSize: 999, userId: userId, branchName: name }
      this.props.getOrganizationVoList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data.organizationVoList.map(org => {
            org.organizationList.map(item => {
              list.push({
                value: item.orgId,
                title: item.orgName
              });
            })

          })
          that.setState({ bz_branch_list: list })
          if (callback) {
            callback(list);
          }
          if (list.length) {
            if (this.props.isTeachCenter) {
              var _branchId = that.state.pagingSearch.branchId ? that.state.pagingSearch.branchId : list[0].value;
              if (_branchId) {
                that.getTeachCenters(_branchId);
              }
            }
          }
        }
        else {
          message.error(data.message);
        }
      })
    } else if (this.props.isBranchAll) {
      //分部（选中用户的）
      var condition = { currentPage: 1, pageSize: 999, parentId: '', orgName: '' }
      this.props.getBranchList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data.map(org => {
            list.push({
              value: org.orgId,
              title: org.orgName
            });
          })
          that.setState({ bz_branch_list: list })
          if (callback) {
            callback(list);
          }
          if (list.length) {
            if (this.props.isTeachCenter) {
              var _branchId = that.state.pagingSearch.branchId ? that.state.pagingSearch.branchId : list[0].value;
              if (_branchId) {
                that.getTeachCenters(_branchId);
              }
            }
          }
        }
        else {
          message.error(data.message);
        }
      })
    }else if(this.props.isBranchDQ){
      this.props.orgBranchListByParentId(this.props.orgId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                if (list.length == 0) {
                  this.onSearchCheckedNum += 1;
                }
                data.data.map(org => {
                  list.push({
                    value: org.orgId,
                    title: org.orgName
                  });
                })
                that.setState({ bz_branch_list: list })
                if (callback) {
                  callback(list);
                }
            }
            else {
              message.error(data.message);
            }
        })
    }
  }
  getClassTypes() {
    var that = this;
    var list = this.addSelectAll('class_type');
    if (this.props.isClassType) {
      var condition = { currentPage: 1, pageSize: 999, state: 1 }
      this.props.getClassList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data.map(item => {
            list.push({
              value: item.classTypeId,
              title: item.classTypeName
            });
          })
          that.setState({ bz_class_type_list: list })
        }
        else {
          message.error(data.message);
        }
      })
    }
  }
  getRecruitBatchs() {
    var that = this;
    var list = this.addSelectAll('recruit_batch');
    if (this.props.isRecruitBatch) {
      this.props.postRecruitBatchList().payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          //总部，大区，分部，招生管理的，订单审批的招生季需要默认全部所以增加了这个判断属性
          if(this.props.Special){
            data.data.forEach(item=>{
              item.state = 0
            })
          } 
          data.data.map(item => {
            if(item.state == 1){
              list.splice(0, 0, {value: item.recruitBatchId, title: item.recruitBatchName});
            }else {
              list.push({
                value: item.recruitBatchId,
                title: item.recruitBatchName,
              });
            }

          })
          that.setState({ bz_recruit_batch_list: list })
        }
        else {
          message.error(data.message);
        }
      })
    }
  }
  getRegions() {
    var that = this;
    var list = this.addSelectAll('region');
    if (this.props.isRegion) {
      let condition = { currentPage: 1, pageSize: 999, };
      this.props.selectAreaByUser(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data.map(item => {
            list.push({
              value: item.orgId,
              title: item.orgName
            });
          })
          that.setState({ bz_region_list: list })
        }
        else {
          message.error(data.message);
        }
      })
    }
  }
  getPartners() {
    var that = this;
    var list = this.addSelectAll('partner');
    if (this.props.isBranchPartners) {
      let condition = { currentPage: 1, pageSize: 999, };
      this.props.queryPartnerByBranchId(this.props.orgId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data.map(item => {
            list.push({
              value: item.partnerId,
              title: item.partnerName
            });
          })
          that.setState({ bz_partner_list: list })
        }
        else {
          message.error(data.message);
        }
      })
    }else if(this.props.isOrderParnters){
      this.props.queryByOrderSearch().payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if (list.length == 0) {
            this.onSearchCheckedNum += 1;
          }
          data.data.map(item => {
            list.push({
              value: item.partnerId,
              title: item.partnerName
            });
          })
          that.setState({ bz_partner_list: list })
        }
        else {
          message.error(data.message);
        }
      })
    }
  }

  addSelectAll(name) {
    var isAll = false;
    for (var i = 0; i < this.props.form_item_list.length; i++) {
      var _item = this.props.form_item_list[i];
      if (_item.data == name && _item.is_all) {
        isAll = true;
        break;
      }
    }
    var list = [];
    if (isAll) {
      list.push({
        value: '',
        title: '全部'
      })
    }
    return list;
  }


  setSelect() {
    var that = this;
    this.props.form_item_list.map(item => {
      if (item.is_all && item.type == 'select') {
        switch (item.data) {
          case 'dic_YesNo':
            if (that.state.dic_YesNo[0].value != '') {
              that.state.dic_YesNo.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ dic_YesNo: that.state.dic_YesNo });
            }
            break;
          case 'dic_Status':
            if (that.state.dic_Status[0].value != '') {
              that.state.dic_Status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ dic_Status: that.state.dic_Status });
            }
            break;
          case 'courseplan_status':
            if (that.state.courseplan_status[0].value != '') {
              that.state.courseplan_status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ courseplan_status: that.state.courseplan_status });
            }
            break;
          case 'teach_class_type':
            if (that.state.teach_class_type[0].value != '') {
              that.state.teach_class_type.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ teach_class_type: that.state.teach_class_type });
            }
            break;
          case 'publish_state':
            if (that.state.publish_state[0].value != '') {
              that.state.publish_state.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ publish_state: that.state.publish_state });
            }
            break;
          case 'producttype':
            if (that.state.producttype[0].value != '') {
              that.state.producttype.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ producttype: that.state.producttype });
            }
            break;
          case 'discount_type':
            if (that.state.discount_type[0].value != '') {
              that.state.discount_type.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ discount_type: that.state.discount_type });
            }
            break;

          case 'order_type':
            if (that.state.order_type[0].value != '') {
              that.state.order_type.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ order_type: that.state.order_type });
            }
            break;
          case 'order_status':
            if (that.state.order_status[0].value != '') {
              that.state.order_status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ order_status: that.state.order_status });
            }
            break;
          case 'order_payee_change_status':
            if (that.state.order_payee_change_status[0].value != '') {
              that.state.order_payee_change_status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ order_payee_change_status: that.state.order_payee_change_status });
            }
            break;
          case 'payee_type':
            if (that.state.payee_type[0].value != '') {
              that.state.payee_type.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ payee_type: that.state.payee_type });
            }
            break;
          case 'esign_status':
            if (that.state.esign_status[0].value != '') {
              that.state.esign_status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ esign_status: that.state.esign_status });
            }
            break;
          case 'order_source':
            if (that.state.order_source[0].value != '') {
              that.state.order_source.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ order_source: that.state.order_source });
            }
            break;
          case 'order_audit_status':
            if (that.state.order_audit_status[0].value != '') {
              that.state.order_audit_status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ order_audit_status: that.state.order_audit_status });
            }
            break;
          case 'course_arrange_status':
            if (that.state.course_arrange_status[0].value != '') {
              that.state.course_arrange_status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ course_arrange_status: that.state.course_arrange_status });
            }
            break;
        }
      }
    })
  }

  getFields() {
    var that = this;
    var cols = [];
    var span = 24 / this.state.num_column;
    const { getFieldDecorator } = this.props.form;

    if(this.props.form_item_list.length == 2){
      span = 10;
    }
    
    this.props.form_item_list.map((item, item_index) => {
      var initialValue = '';
      for (var name in this.state.pagingSearch) {
        if (name == item.name) {
          initialValue = this.state.pagingSearch[name];
          break;
        }
      }
      if (item.type == 'input') {
        initialValue = item.value == null || item.value == undefined ? "" : item.value;
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {
                getFieldDecorator(item.name, {
                  initialValue: initialValue,
                  rules: [{
                    required: item.required, message: '请输入' + item.title
                  }],
                })(
                  <Input placeholder={"请输入" + item.title} />
                  )
              }
            </FormItem>
          </Col>
        )
      } else if (item.type == 'date') {
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {
                getFieldDecorator(item.name, {
                  initialValue: dataBind(timestampToTime(initialValue), true),
                  rules: [{
                    required: false,
                  }]
                })(
                  (item.name == 'dateStart' || item.name == 'createDateStart' || item.name == 'applyStartDate' || item.name == 'submitDateStart') ?
                  <DatePicker
                    style={{width: '200px'}}
                    disabledDate={this.disabledStartDate}
                    format={dateFormat}
                    onChange={this.onStartChange}
                    onOpenChange={this.handleStartOpenChange}
                    placeholder={item.title}
                  />
                  :
                  <DatePicker
                    style={{width: '200px'}}
                    disabledDate={this.disabledEndDate}
                    format={dateFormat}
                    onChange={this.onEndChange}
                    open={this.state.endOpen}
                    onOpenChange={this.handleEndOpenChange}
                    placeholder={item.title}
                  />
                )
              }
            </FormItem>
          </Col>
        )
      } else if (item.type == 'datePicker') {
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {
                getFieldDecorator(item.name, {
                  initialValue: [],
                  rules: [{
                    required: false,
                  }]
                })(
                  <RangePicker style={{width:220}}/>
                )
              }
            </FormItem>
          </Col>
        )
      } else if (item.type == 'search_input') {
        var list = [];
        list = item.data == 'branch' ? this.state.bz_branch_list
          : []
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title} >
              {
                getFieldDecorator(item.name, {
                  initialValue: initialValue ? initialValue : (list.length ? list[0].value : '')
                })(
                  <SearchInput
                    placeholder={"请输入" + item.title}
                    style={{ width: 200 }}
                    searchInputHandleChange={this.onSearchInputGet}
                    setChooseValueChange={this.onSearchInputSet}
                  />
                  )
              }
            </FormItem>
          </Col>
        )
      }
      else if (item.type == 'radio') {
        var list = [];
        list = item.data == 'student_change_type' ? this.state.student_change_type
          : [];
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {getFieldDecorator(item.name, {
                initialValue: dataBind(initialValue || item.value),
                rules: [{ required: item.required, message: '请选择' + item.title + '!' }],
              })(
                item.need_callback ?
                  <Radio.Group disabled={item.disabled} onChange={(e) => this.onRadioChange(e, item.need_callback)}>
                    {
                      list.map((item, index) => {
                        return <Radio value={item.value.toString()} key={index}>{item.title}</Radio>
                      })
                    }
                  </Radio.Group>
                  :
                  <Radio.Group>
                    {
                      list.map((item, index) => {
                        return <Radio value={item.value.toString()} key={index}>{item.title}</Radio>
                      })
                    }
                  </Radio.Group>
                )}
            </FormItem>
          </Col>
        )
      }
      else if (item.type == 'select') {
        var list = [];
        list = item.data == 'item' ? this.state.bz_item_list
          : item.data == 'course_plan_batch' ? this.state.bz_course_plan_batch_list
            : item.data == 'course_category' ? this.state.bz_course_category_list
              : item.data == 'teach_center' ? this.state.bz_teach_center_list
                : item.data == 'branch' ? this.state.bz_branch_list
                  : item.data == 'class_type' ? this.state.bz_class_type_list
                    : item.data == 'recruit_batch' ? this.state.bz_recruit_batch_list
                      : item.data == 'region' ? this.state.bz_region_list
                        : item.data == 'partner' ? this.state.bz_partner_list

                          : item.data == 'dic_YesNo' ? this.state.dic_YesNo
                            : item.data == 'dic_Status' ? this.state.dic_Status
                              : item.data == 'courseplan_status' ? this.state.courseplan_status
                                : item.data == 'publish_state' ? this.state.publish_state
                                  : item.data == 'teach_class_type' ? this.state.teach_class_type
                                    : item.data == 'producttype' ? this.state.producttype
                                      : item.data == 'discount_type' ? this.state.discount_type
                                        : item.data == 'order_type' ? this.state.order_type
                                          : item.data == 'order_status' ? this.state.order_status
                                            : item.data == 'payee_type' ? this.state.payee_type
                                              : item.data == 'esign_status' ? this.state.esign_status
                                                : item.data == 'order_source' ? this.state.order_source
                                                : item.data == 'course_arrange_status' ? this.state.course_arrange_status
                                                  : item.data == 'order_payee_change_status' ? this.state.order_payee_change_status
                                                    : item.data == 'order_audit_status' ?
                                                    (
                                                      this.props.orgType == 1 ?
                                                      this.state.order_audit_status.filter(a => a.value >= 5 || a.value <= 0)
                                                      : this.props.orgType == 2 ?
                                                      this.state.order_audit_status.filter(a => a.value >= 3 || a.value <= 0)
                                                      : this.state.order_audit_status
                                                    )
                                                    : []
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title} >
              {
                getFieldDecorator(item.name, {
                  initialValue: initialValue ? initialValue.toString() : (list.length ? list[0].value.toString() : '')
                })(
                  <Select style={{width:item.width}} onChange={(value, e) => this.onSelectChange(value, e, item.need_callback)
                  
                  }>
                    {/* item.is_all ? <Option value="">全部</Option> : '' */}
                    {
                      list.map((i, index) => {
                        return <Option title={i.title} value={i.value.toString()} key={item.data + '_' + index}>{i.title}</Option>
                      })
                    }
                  </Select>
                  )
              }
            </FormItem>
          </Col>
        )
      } else if (item.type == 'text') {
        //var _id = "id_" + item_index;
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              <div>{item.value}</div>
            </FormItem>
          </Col>
        )
      } else if (item.type == 'numeric_input') {
        initialValue = item.value == null || item.value == undefined ? "" : item.value;
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {
                getFieldDecorator(item.name, {
                  initialValue: initialValue,
                  rules: [{
                    required: item.required, message: '请输入' + item.title,
                  }],
                })(
                  item.is_int ?
                    <NumericInput placeholder={"请输入" + item.title} type="int" />
                    :
                    <NumericInput placeholder={"请输入" + item.title} />
                  )
              }
            </FormItem>
          </Col>
        )
      } else if (item.type == 'file_uploader') {
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {getFieldDecorator(item.name, {
                initialValue: '',
              })(
                <FileUploader callback={(value) => {
                  if(item.need_callback && this.props.onCallback){
                    this.props.onCallback(value);
                  }
                }} />
                )}
            </FormItem>
          </Col>
        )
      }else if(item.type == 'org'){
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {getFieldDecorator(item.name, {
                initialValue: initialValue,
              })(
                <SelectFBOrg scope={this.props.isBranchUser ? 'user' : this.props.isBranchDQ ? 'dq' : this.props.isBranchAll ? 'all' : ''}
                  hideAll={item.is_all ? false : true}
                  onSelectChange={(value) => this.props.onCallback(value, item.name)}
                />
                )}
            </FormItem>
          </Col>
        )
      }else if(item.type=='classType'){
        cols.push(
          <Col span={span} key={item_index}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {getFieldDecorator(item.name, {
                initialValue: '',
              })(
                <SelectClassType scope={this.props.isBranchUser ? 'user' : this.props.isBranchDQ ? 'dq' : this.props.isBranchAll ? 'all' : ''}
                  hideAll={item.is_all ? false : true}
                  onSelectChange={(value) => this.props.onCallback(value, item.name)}
                />
                )}
            </FormItem>
          </Col>)
      }
      else {
        cols.push(<Col span={span} key={item_index}></Col>)
      }

    })
    return cols;
  }

  fetch = (params = {}) => {
    if (params) {
      if (this.props.isBranchUser) {
        params.branchId = this.state.pagingSearch.branchId;
      }
      if (this.props.fetch2) {
        this.props.fetch2(params);
      }
      if(this.props.defaultSearchCallback){
        this.props.defaultSearchCallback(params);
      }
    }
  }
  onRadioChange(e, need_callback) {
    if (need_callback) {
      if (this.props.onCallback) {
        this.extendCustomerButtonClick(this.props.onCallback);
      }
    }
  }
  //下拉框值改变时，需要的附加操作
  onSelectChange(value, e, need_callback) {
    if (e.key.indexOf('item') >= 0) {
      //项目
      if (this.props.isNeedSelectName) {
        var ps = this.state.pagingSearch;
        ps.itemName = e.props.children;
        //ps.itemId = value;
        this.props.pagingSearchCallback(ps);
        this.setState({ pagingSearch: ps });
      }
      //如果存在 开课批次，则要过滤
      if (this.props.isCoursePlanBatch) {
        this.getCoursePlanBatchs(value);
      }
      if (this.props.isCourseCategory) {
        this.getCourseCategorys(value);
      }
    } else if (e.key.indexOf('branch') >= 0) {
      if (this.props.isBranchAll) {
        this.getTeachCenters(value);
      }
    } else if (e.key.indexOf('course_plan_batch') >= 0) {
      //开课批次
      if (this.props.isNeedSelectName) {
        var ps = this.state.pagingSearch;
        ps.coursePlanBatchName = e.props.children;
        this.props.pagingSearchCallback(ps);
        this.setState({ pagingSearch: ps });
      }
    }else if(e.key.indexOf('course_arrange_status') >=0){
      if (this.props.isNeedSelectName) {
        var ps = this.state.pagingSearch;
        ps.status = e.props.value;
        //ps.coursePlanBatchId = value;
        this.props.pagingSearchCallback(ps);
        this.setState({ pagingSearch: ps });
      }
    }
    if (need_callback) {
      if (this.props.onCallback) {
        this.extendCustomerButtonClick(this.props.onCallback);
      }
    }

  }
  //searchInput输入时，去查找
  onSearchInputGet(value, callback) {
    var that = this;
    if (this.select_timeout) {
      clearTimeout(this.select_timeout);
      this.select_timeout = null;
    }
    function fake() {
      if (that.props.isBranchUser) {
        that.getBranchs(value, function (list) {
          if (callback) {
            if (list && list.length && !list[0].value) {
              list.splice(0, 1)
            }
            callback(list);
          }
        })
      }
    }
    this.select_timeout = setTimeout(fake, 300);
  }
  onSearchInputSet(value) {
    var pagingSearch = this.state.pagingSearch;
    if (this.props.isBranchUser) {
      pagingSearch.branchId = value;
    }
    this.setState({
      pagingSearch: pagingSearch
    })
  }

  extendCustomerButtonClick(callback) {
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      let pagingSearch = { ...this.state.pagingSearch, ...values };
      if (callback) {//自定义方法回调
        callback(pagingSearch);
      }
    });
  }

  disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({ endOpen: true });
      }
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let extendButtons = [];
    if (this.props.extendButtons && this.props.extendButtons.length) {
      this.props.extendButtons.map((info, index) => {
        if (info.type == 'export') {
          //需要改造 FileDownloader接口 来使其回调，得到 options 再去调用下载接口
          extendButtons.push(
            <FileDownloader
              apiUrl={info.url}//api下载地址
              method={info.method || 'post'}//提交方式
              options={this.state.pagingSearch}//提交参数
              title={info.title}
              clickCallback={this.extendCustomerButtonClick}
              key={index}
              type={'export'}
            />
          )
        } else {
          extendButtons.push(
            <Button onClick={() => {
              info.needConditionBack ? this.extendCustomerButtonClick(info.callback) : info.callback()
            }} icon={info.icon || 'plus'} className={info.color?'ant-btn-primary':'button_dark'}>{info.title}</Button>
          );
        }

      })
      //var info = this.props.extendButtons[0];
      //extendButtons.push(<Button onClick={() => { info.callback() }} icon="plus" className="button_dark">{info.title}</Button>);
    }
    return (
      <div>
        <ContentBox topButton={!this.props.hideTopButtons && this.renderSearchTopButtons(extendButtons)} bottomButton={!this.props.hideBottomButtons && this.renderSearchBottomButtons(extendButtons, this.props.defaultSearchName)}>
          {!this.state.seachOptionsCollapsed &&
            <Form className="search-form">
              <Row {...row24}>
                {this.getFields()}
              </Row>
            </Form>
          }
        </ContentBox>
      </div>
    );
  }
}

const WrappedForm = Form.create()(SearchForm);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { userId } = state.auth.currentUser.user;
  let { orgId, usertype } = state.auth.currentUser.userType;
  return { Dictionarys, userId, orgId, orgType: usertype };
};
function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getItemList: bindActionCreators(getItemList, dispatch),
    getItemListByUser: bindActionCreators(getItemListByUser, dispatch),
    getCoursePlanBatchByItemId: bindActionCreators(getCoursePlanBatchByItemId, dispatch),
    getCourseCategoryList: bindActionCreators(getCourseCategoryList, dispatch),
    getTeachCenterList: bindActionCreators(getTeachCenterList, dispatch),
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch),
    getOrganizationVoList: bindActionCreators(getOrganizationVoList, dispatch),
    getBranchList: bindActionCreators(getBranchList, dispatch),
    orgBranchListByParentId: bindActionCreators(orgBranchListByParentId, dispatch),
    getClassList: bindActionCreators(getClassList, dispatch),
    postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
    queryPartnerByBranchId: bindActionCreators(queryPartnerByBranchId, dispatch),
    selectAreaByUser: bindActionCreators(selectAreaByUser, dispatch),
    queryByOrderSearch: bindActionCreators(queryByOrderSearch, dispatch),
  }
}

//ReactDOM.render(<WrappedHorizontalLoginForm />, mountNode);
export default connect(mapStateToProps, mapDispatchToProps)(WrappedForm);
