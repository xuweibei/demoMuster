/*
通用form编辑
*/
import React from 'react'
import { Form, Row, Col, Select, Input, Button, message, DatePicker
  , Radio, Checkbox } from 'antd';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const Option = Select.Option;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group
import { env } from '@/api/env';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
const { TextArea } = Input;

import ContentBox from '@/components/ContentBox';
import SearchInput from '@/components/SearchInput';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, timestampToTime } from '@/utils';
import {
  searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch,
  onPageIndexChange, onShowSizeChange, onToggleSearchOption,
  renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import AreasSelect from '@/components/AreasSelect';
import EditableAllUniversityTagGroup from '@/components/EditableAllUniversityTagGroup';

import { loadDictionary, systemCommonChild } from '@/actions/dic';
import { getItemList, getItemListByUser,
  getCourseCategoryList, getTeachCenterList, getTeachCenterByBranchId,
  getOrganizationVoList, getBranchList,
  getClassList, selectAreaByUser, getCampusByUniversityId,
  getUserByAreaList
} from '@/actions/base';
import { getCoursePlanBatchByItemId,subitem } from '@/actions/course';  //开课批次
import { postRecruitBatchList, gainWayList } from '@/actions/recruit';
import { allUniversityList } from '@/actions/admin';
import './index.css'
const NUM_COLUMN = 2;

const row24 = {
    justify: "flex-start",
    gutter: 24,
    align: "middle",
    type: "flex"
};
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class EditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subRegSource:'',
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
      bz_university_list: [], //院校
      bz_campus_list: [], //校区
      bz_gain_way_list: [], //了解中博的方式  渠道
      bz_area_user_list: [],    //区域下用户
      hasAreaId: false,    //是否选择区域
      listItem:''
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
    (this: any).onSubmit = this.onSubmit.bind(this);

    (this: any).getConditionData = this.getConditionData.bind(this);
    (this: any).getItems = this.getItems.bind(this);
    (this: any).getCoursePlanBatchs = this.getCoursePlanBatchs.bind(this);
    (this: any).getCourseCategorys = this.getCourseCategorys.bind(this);
    (this: any).getTeachCenters = this.getTeachCenters.bind(this);
    (this: any).getBranchs = this.getBranchs.bind(this);
    (this: any).getClassTypes = this.getClassTypes.bind(this);  //班型
    (this: any).getRecruitBatchs = this.getRecruitBatchs.bind(this);  //招生季
    (this: any).getRegions = this.getRegions.bind(this);    //区域
    (this: any).getCampus = this.getCampus.bind(this);  //校区
    (this: any).getGainWay = this.getGainWay.bind(this);  //了解中博的方式
    (this: any).getAreaUsers = this.getAreaUsers.bind(this);  //区域用户

    (this: any).setSelect = this.setSelect.bind(this);
    (this: any).addSelectAll = this.addSelectAll.bind(this);
    (this: any).onSelectChange = this.onSelectChange.bind(this);
    (this: any).onSearchInputGet = this.onSearchInputGet.bind(this);
    (this: any).onSearchInputSet = this.onSearchInputSet.bind(this);
    //(this: any).onDateChange = this.onDateChange.bind(this);
    (this: any).onCheckboxChange = this.onCheckboxChange.bind(this);
    (this: any).onInputChange = this.onInputChange.bind(this);
    (this: any).onUniversityChoose = this.onUniversityChoose.bind(this);
  }
  componentWillMount(){
    console.log("SearchForm componentWillMount");
    var list = [];
    if(this.props.isStatus){
      list.push('dic_Status');
    }
    if(this.props.isYesNo){
      list.push('dic_YesNo');
    }
    if(this.props.isTeachClassType){    //
      list.push('teach_class_type');
    }
    if(this.props.isCoursePlanAuditStatus){   //课程计划审核状态
      list.push('courseplan_status');
    }
    if(this.props.isPublishState){  //发布状态
      list.push('publish_state');
    }
    if(this.props.isProductType){  //商品属性
      list.push('producttype');
    }
    if(this.props.isDiscountType){  //折扣类型
      list.push('discount_type');
    }
    if(this.props.isSex){
      list.push('dic_sex');
    }
    if(this.props.isCertificateType){
      list.push('certificate_type');
    }
    if(this.props.isNation){
      list.push('nation');
    }
    if(this.props.isRegSource){
      list.push('reg_source');  //学生来源
    }
    if(this.props.isEducation){
      list.push('education')    //当前学历
    }
    if(this.props.isGrade){
      list.push('grade')    //当前学历
    }
    if(this.props.isContactType){
      list.push('contact_type')
    }
    if(this.props.isStudy){
      list.push('is_study');
    }
    this.loadBizDictionary(list);
    this.loadBizDictionary(['reg_source_child']);

    this.getConditionData();
  }
  componentDidMount(){
    console.log("SearchForm componentDidMount");
  }
  componentWillUnMount(){
    clearInterval(this.intervalHandler);
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('form_item_list' in nextProps) {
      var _areaId;
      for(var i = 0; i < nextProps.form_item_list.length; i++){
        var item = nextProps.form_item_list[i];
        if(item.data == 'area_user' && item.value2){
          _areaId = item.value2;
          break;
        }
      }
      if(_areaId && !this.state.hasAreaId){
        this.setState({ hasAreaId: true })
        this.getAreaUsers(_areaId);
      }
    }
  }

  getConditionData(){
    this.getItems();
    //this.getCoursePlanBatchs(); 在选择项目后，级联查找
    if(!this.props.isItemUser){
      this.getCourseCategorys();
    }
    //this.getBranchs();  使用 SearchInput 方式查找数据
    if(this.props.isBranchAll){
      this.getBranchs();
    }

    this.getTeachCenters();
    this.getClassTypes();
    this.getRecruitBatchs();
    this.getRegions();
    this.getCampus();
    this.getGainWay();
    //this.getAreaUsers();

    var that = this;
    setTimeout(function(){
      that.setSelect();
    }, 1000);
    this.onSearchCheckedNum = 0;
    this.checkAndOnSearch();
  }

  checkAndOnSearch(){
    var run_num = 0;
    var needNum = 0;
    var that = this;
    var terminal = function(){
      for(var i = 0; i < that.props.form_item_list.length; i++){
        var item = that.props.form_item_list[i];
        if(!item.is_all && item.data){
          needNum += 1;
        }
      }
      if(needNum > 0){
        that.intervalHandler = setInterval(function(){
          if(run_num >= 10){
            clearInterval(that.intervalHandler);
            return;
          }
          if(that.onSearchCheckedNum == needNum){
            that.onSearch();
            clearInterval(that.intervalHandler);
          }else {
            terminal();
          }
          run_num += 1;
        }, 1000);
      }else {
        that.onSearch();
      }
    }
    terminal();
  }

  //-----------------START 查询业务数据列表
  getItems(){
    var that = this;
    var list = this.addSelectAll('item');
    if(this.props.isItemUser){
      //合作项目（当前用户的）
      this.props.getItemListByUser(this.props.userId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
              if(list.length == 0){
                this.onSearchCheckedNum += 1;
              }
              data.data.map(item => {
                list.push({
                  value: item.itemId,
                  title: item.itemName
                });
              })
              if(this.props.isNeedSelectName){
                var ps = this.state.pagingSearch;
                ps.itemName = list[0].title;
                ps.itemId = list[0].value;
                that.setState({ bz_item_list: list, pagingSearch: ps })
                that.props.pagingSearchCallback(ps);
              }else{
                that.setState({ bz_item_list: list })
              }
              if(list.length){
                if(this.props.isCoursePlanBatch){
                  var _itemId = that.state.pagingSearch.itemId ? that.state.pagingSearch.itemId : list[0].value;
                  that.getCoursePlanBatchs(_itemId);
                }
                if(that.props.isCourseCategory){
                  var _itemId = that.state.pagingSearch.itemId ? that.state.pagingSearch.itemId : list[0].value;
                  that.getCourseCategorys(_itemId);
                }
              }
          }
          else {
              message.error(data.message);
          }
      })
    }else if(this.props.isItemAll){
      getAllItemList(function(all_item_list){
        if(list.length == 0){
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
  getCoursePlanBatchs(itemId){
    if(!this.props.isCoursePlanBatch){
      return;
    }
    var that = this;
    var list = this.addSelectAll('course_plan_batch');
    this.props.getCoursePlanBatchByItemId(itemId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if(list.length == 0){
            this.onSearchCheckedNum += 1;
          }
          data.data.map(r => {
            list.push({
              value: r.courseplanBatchId,
              title: r.courseplanBatchName
            })
          });
          if(this.props.isNeedSelectName){
            var ps = this.state.pagingSearch;
            ps.coursePlanBatchId = list.length ? list[0].value : '';
            ps.courseplanBatchId = ps.coursePlanBatchId;
            ps.coursePlanBatchName = list.length ? list[0].title : '';
            that.props.pagingSearchCallback(ps);
            that.setState({ bz_course_plan_batch_list: list, pagingSearch: ps })
          }else{
            that.setState({ bz_course_plan_batch_list: list });
          }
        }
        else {
            message.error(data.message);
        }
    })
  }
  getCourseCategorys(itemId){
    if(!this.props.isCourseCategory){
      return;
    }
    var that = this;
    var list = this.addSelectAll('course_category');
    var condition = { currentPage: 1, pageSize: 99, courseCategoryStatus: '', itemId: itemId, name: '' }
    this.props.getCourseCategoryList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if(list.length == 0){
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
  getTeachCenters(branchId){
    if(!this.props.isTeachCenter){
      return;
    }
    var that = this;
    var list = [];
    if(branchId){
      var condition = { currentPage: 1, pageSize: 99, branchId: branchId }
      this.props.getTeachCenterByBranchId(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if(list.length == 0){
            this.onSearchCheckedNum += 1;
          }
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
    }else {
      var condition = { currentPage: 1, pageSize: 99, state: '', teachCenterType: '', teachCenterName: '' }
      this.props.getTeachCenterList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            if(list.length == 0){
              this.onSearchCheckedNum += 1;
            }
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
  getBranchs(name, callback){
    var that = this;
    var list = this.addSelectAll('branch');
    if(this.props.isBranchUser){
      //分部（选中用户的）
      var userId = this.props.choosedUserId || this.props.userId;
      var condition = { currentPage: 1, pageSize: 999, userId: userId, branchName: name }
      this.props.getOrganizationVoList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
              if(list.length == 0){
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
              if(callback){
                callback(list);
              }
              if(list.length){
                if(this.props.isTeachCenter){
                  var _branchId = that.state.pagingSearch.branchId ? that.state.pagingSearch.branchId : list[0].value;
                  if(_branchId){
                    that.getTeachCenters(_branchId);
                  }
                }
              }
          }
          else {
              message.error(data.message);
          }
      })
    }else if(this.props.isBranchAll){
      //分部（选中用户的）
      var condition = { currentPage: 1, pageSize: 999, parentId: '', orgName: '' }
      this.props.getBranchList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
              if(list.length == 0){
                this.onSearchCheckedNum += 1;
              }
              data.data.map(org => {
                  list.push({
                    value: org.orgId,
                    title: org.orgName
                  });
              })
              that.setState({ bz_branch_list: list })
              if(callback){
                callback(list);
              }
              if(list.length){
                if(this.props.isTeachCenter){
                  var _branchId = that.state.pagingSearch.branchId ? that.state.pagingSearch.branchId : list[0].value;
                  if(_branchId){
                    that.getTeachCenters(_branchId);
                  }
                }
              }
          }
          else {
              message.error(data.message);
          }
      })
    }
  }
  getClassTypes(){
    var that = this;
    var list = this.addSelectAll('class_type');
    if(this.props.isClassType){
      var condition = { currentPage: 1, pageSize: 999, state: 1 }
      this.props.getClassList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
              if(list.length == 0){
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
  getRecruitBatchs(){
    var that = this;
    var list = this.addSelectAll('recruit_batch');
    if(this.props.isRecruitBatch){
      this.props.postRecruitBatchList().payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
              if(list.length == 0){
                this.onSearchCheckedNum += 1;
              }
              data.data.map(item => {
                list.push({
                  value: item.recruitBatchId,
                  title: item.recruitBatchName
                });
              })
              that.setState({ bz_recruit_batch_list: list })
          }
          else {
              message.error(data.message);
          }
      })
    }
  }
  getRegions(){
    var that = this;
    var list = this.addSelectAll('region');
    if(this.props.isRegion){
      let condition = { currentPage: 1, pageSize: 999, };
      this.props.selectAreaByUser(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
              if(list.length == 0){
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
  //获取校区
  getCampus(universityId){
    if(!universityId){
      return;
    }
    let condition = { currentPage: 1, pageSize: 999, universityId: universityId };
    this.props.getCampusByUniversityId(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
            var list = [];
            data.data.map(item => {
              list.push({
                title: item.campusName,
                value: item.campusId.toString()
              })
            })
            this.setState({ bz_campus_list: list })
        }else {
            message.error(data.message);
        }
    })
  }
  //渠道方式
  getGainWay(){
    var that = this;
    var list = this.addSelectAll('gain_way');
    this.props.gainWayList().payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
            if(list.length == 0){
              this.onSearchCheckedNum += 1;
            }
            data.data.map(item => {
              list.push({
                value: item.gainWayId,
                title: item.gainWayName,
                type: item.gainWayType
              });
            })
            that.setState({ bz_gain_way_list: list })
        }
        else {
            message.error(data.message);
        }
    })
  }
  //获取区域下用户
  getAreaUsers(areaId){
    if(!this.props.isAreaUser || !areaId){
      return;
    }
    var condition = {areaId: areaId};
    this.props.getUserByAreaList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
            var list = [];
            data.data.map(item => {
              list.push({
                title: item.realName,
                value: item.userId
              })
            })
            this.setState({ bz_area_user_list: list })
        }else {
            message.error(data.message);
        }
    })
  }
  //-----------------END 查询业务数据列表

  addSelectAll(name){
    var isAll = false;
    for(var i = 0; i < this.props.form_item_list.length; i++){
      var _item = this.props.form_item_list[i];
      if(_item.data == name && _item.is_all){
        isAll = true;
        break;
      }
    }
    var list = [];
    if(isAll){
      list.push({
        value: '',
        title: '全部'
      })
    }
    return list;
  }


  setSelect(){
    var that = this;
    this.props.form_item_list.map(item => {
      if(item.is_all && item.type == 'select'){
        switch(item.data){
          case 'dic_YesNo':
            if(that.state.dic_YesNo[0].value != ''){
              that.state.dic_YesNo.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ dic_YesNo: that.state.dic_YesNo});
            }
            break;
          case 'dic_Status':
            if(that.state.dic_Status[0].value != ''){
              that.state.dic_Status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ dic_Status: that.state.dic_Status});
            }
            break;
          case 'courseplan_status':
            if(that.state.courseplan_status[0].value != ''){
              that.state.courseplan_status.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ courseplan_status: that.state.courseplan_status});
            }
            break;
          case 'teach_class_type':
            if(that.state.teach_class_type[0].value != ''){
              that.state.teach_class_type.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ teach_class_type: that.state.teach_class_type});
            }
            break;
          case 'publish_state':
            if(that.state.publish_state[0].value != ''){
              that.state.publish_state.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ publish_state: that.state.publish_state });
            }
            break;
          case 'producttype':
            if(that.state.producttype[0].value != ''){
              that.state.producttype.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ producttype: that.state.producttype });
            }
            break;
          case 'discount_type':
            if(that.state.discount_type[0].value != ''){
              that.state.discount_type.splice(0, 0, {
                value: '',
                title: '全部'
              })
              that.setState({ discount_type: that.state.discount_type });
            }
            break;
        }
      }

      //放在这里就是为了 在进入修改页面时，能自动触发：有院校，则通过此院校 查其校区列表
      //这里主要是  FB/Recruit/OrderCreate/student.js
      if(item.name == "studyUniversityId" && item.value){
        this.getCampus(item.value)
      }
    })
  }

  getFields(){
    var that = this;
    var cols = [];
    var span = 24 / this.state.num_column;
    const { getFieldDecorator } = this.props.form;
    this.props.form_item_list.map((item, item_index) => {
      if(item.value === 0){
        var c = "";
      }
      //var initialValue = item.value || '';
      var initialValue = item.value == null || item.value == undefined ? "" : item.value;
      /*for(var name in this.state.pagingSearch){
        if(name == item.name){
          initialValue = this.state.pagingSearch[name];
          break;
        }
      }*/
      
      if(item.type == 'input'){
        cols.push(
          <Col span={item.rows ? span * 2 : span}>
            <FormItem { ...(item.rows ? searchFormItemLayout24 : searchFormItemLayout)} label={item.title}>
              {
                getFieldDecorator(item.name, {
                  initialValue: initialValue,
                  rules: [
                    { required: item.required, message: '请输入' + item.title + '!' },
                    { validator: (rule, value, callback) => {
                      if(item.validator){
                        var regex = /^[1-9][0-9]*$/;
                        var msg = "";
                        switch(item.validator){
                          case 'year':
                            regex = /^[1-2][0-9][0-9][0-9]$/;
                            msg = "不是有效的年份";
                            break;
                          case 'mobile':
                            regex = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
                            msg = "不是有效的手机号";
                            break;
                          case 'email':
                            regex = /^[A-Za-z0-9\u4e00-\u9fa5._]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                            msg = "不是有效的邮箱";
                            break;
                          default:
                            break;
                        }
                        if(value && !regex.test(value)){
                          callback(msg);
                        } else {
                          callback();
                        }
                      }else {
                        callback();
                      }
                    }}
                  ]
                })(
                  item.rows ?
                    <TextArea placeholder={"请输入" + item.title} rows={item.rows} />
                  :
                  item.need_callback ?
                    <Input placeholder={"请输入" + item.title} onChange={(e) => this.onInputChange(e, item.name, item.need_callback)}/>
                  :
                    <Input placeholder={"请输入" + item.title}  />
                )
              }
            </FormItem>
          </Col>
        )
      } else if(item.type == 'date'){
        cols.push(
          <Col span={span}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {
                getFieldDecorator(item.name, {
                  initialValue: dataBind(timestampToTime(initialValue), true),
                  rules: [{
                    required: item.required, message: '请输入' + item.title + '!',
                  }]
                })(
                  <DatePicker
                    format={dateFormat}
                    //onChange={(date, dateString) => this.onDateChange(date, dateString, item.name)}
                  />
                )
              }
            </FormItem>
          </Col>
        )
      } else if(item.type == 'search_input'){
        var list = [];
        list = item.data == 'branch' ? this.state.bz_branch_list
        : item.data == 'university' ? this.state.bz_university_list
        : []
        cols.push(
          <Col span={span}>
            <FormItem {...searchFormItemLayout} label={item.title} >
              {
                getFieldDecorator(item.name, {
                  initialValue: initialValue ? initialValue : (list.length ? list[0].value : ''),
                  rules: [{
                    //required: item.required, message: '请输入' + item.title + '!',
                  }]
                })(
                  item.value2 ?
                  <SearchInput
                    placeholder={"请输入" + item.title}
                    style={{ width: 200 }}
                    searchInputHandleChange={this.onSearchInputGet}
                    setChooseValueChange={(value) => this.onSearchInputSet(value, item.name)}
                    title={item.value2}
                  />
                  :
                  <SearchInput
                    placeholder={"请输入" + item.title}
                    style={{ width: 200 }}
                    searchInputHandleChange={this.onSearchInputGet}
                    setChooseValueChange={(value) => this.onSearchInputSet(value, item.name)}
                  />
                )
              }
            </FormItem>
          </Col>
        )
      }
      else if(item.type == 'select'){
        var list = [];
        list = item.data == 'item' ? this.state.bz_item_list
          : item.data == 'course_plan_batch' ? this.state.bz_course_plan_batch_list
          : item.data == 'course_category' ? this.state.bz_course_category_list
          : item.data == 'teach_center' ? this.state.bz_teach_center_list
          : item.data == 'branch' ? this.state.bz_branch_list
          : item.data == 'class_type' ? this.state.bz_class_type_list
          : item.data == 'recruit_batch' ? this.state.bz_recruit_batch_list
          : item.data == 'region' ? this.state.bz_region_list
          : item.data == 'campus' ? this.state.bz_campus_list
          : item.data == 'area_user' ? this.state.bz_area_user_list

          : item.data == 'dic_YesNo' ? this.state.dic_YesNo
          : item.data == 'dic_Status' ? this.state.dic_Status
          : item.data == 'courseplan_status' ? this.state.courseplan_status
          : item.data == 'publish_state' ? this.state.publish_state
          : item.data == 'teach_class_type' ? this.state.teach_class_type
          : item.data == 'producttype' ? this.state.producttype
          : item.data == 'discount_type' ? this.state.discount_type
          : item.data == 'certificate_type' ? this.state.certificate_type
          : item.data == 'nation' ? this.state.nation
          : item.data == 'reg_source' ? this.state.reg_source
          : item.data == 'education' ? this.state.education
          : item.data == 'grade' ? this.state.grade
          : item.data == 'contact_type' ? this.state.contact_type
          : item.data == 'is_study' ? this.state.is_study
          : []
        cols.push(
          item.data=='reg_source'?(
          <Col span={span}>
            <FormItem {...searchFormItemLayout} label={item.title} >
              {
                (item.data == 'campus' && (this.state.bz_campus_list.length < 1)) 
                ?
                <Select value="">
                  
                </Select>
                :
                getFieldDecorator(item.name, {
                  initialValue: dataBind(initialValue[0]),
                  rules: [{ required: item.required, message: '请选择' + item.title + '!'}]
                })(
                  
                <Select disabled={(this.props.title.indexOf('修改')>-1) && initialValue[0] && !( initialValue[0] == 2 || initialValue[0] == 3 || initialValue[0] == 4 || initialValue[0] == 9)} className='Parentitem' onChange={(value, e) => this.onSelectChange(value, e, item.name, item.need_callback,1)}>
                  {/* item.is_all ? <Option value="">全部</Option> : '' */}
                  {
                    ((this.props.title.indexOf('修改')>-1) && ( initialValue[0] == 2 || initialValue[0] == 3 || initialValue[0] == 4 || initialValue[0] == 9)) ?
                      list.filter(a => a.value == 2 || a.value == 3 || a.value == 4 || a.value == 9).map((i, index) => {
                        return <Option title={i.title} value={i.value} key={item.data + '_' + index}>{i.title}</Option>
                      })
                    :
                      list.map((i, index) => {
                        return <Option title={i.title} value={i.value} key={item.data + '_' + index}>{i.title}</Option>
                      })
                  }
                </Select>
                )

              }
                { initialValue[1] ?
                    getFieldDecorator('subRegSource', {
                    initialValue: dataBind(initialValue[1])
                  })(
                    <Select disabled={(this.props.title.indexOf('修改')>-1) && initialValue[0] && !( initialValue[0] == 2 || initialValue[0] == 3 || initialValue[0] == 4 || initialValue[0] == 9)} className='Subitem'>
                      {
                        this.state.reg_source_child.map((i,index)=>{
                          return <Option title={i.title} value={i.value} key={item.data + '_' + index}>{i.title}</Option>
                        })
                      }
                    </Select>
                  ) : this.state.listItem.length ?
                    getFieldDecorator('subRegSource', {
                      initialValue: ''
                    })(
                      <Select className='Subitem'>
                        {
                          this.state.listItem?this.state.listItem.map((i,index)=>{
                            return <Option title={i.title} value={i.value} key={item.data + '_' + index}>{i.title}</Option>
                          }):[]
                        }
                      </Select>
                    ) : ''
                }
            </FormItem>
            {/* <FormItem className='Subitem'>
                {             
                  getFieldDecorator('subRegSource', {
                  initialValue:''
                })(
                    <Select>
                      {
                        this.state.listItem?this.state.listItem.map((i,index)=>{
                          return <Option value={i.value} key={item.data + '_' + index}>{i.title}</Option>
                        }):[]
                      }
                    </Select>
                )}
            </FormItem> */}
          </Col>):( 
          <Col span={span}>
            <FormItem {...searchFormItemLayout} label={item.title} >
              {
                (item.data == 'campus' && (this.state.bz_campus_list.length < 1)) 
                ?
                <Select value="">
                  
                </Select>
                :
                getFieldDecorator(item.name, {
                  initialValue: dataBind(initialValue),
                  rules: [{ required: item.required, message: '请选择' + item.title + '!'}]
                })(
                <Select onChange={(value, e) => this.onSelectChange(value, e, item.name, item.need_callback)}>
                  {/* item.is_all ? <Option value="">全部</Option> : '' */}
                  {
                      list.map((i, index) => {
                        return <Option title={i.title} value={i.value} key={item.data + '_' + index}>{i.title}</Option>
                      })
                  }
                </Select>
                )
              }
            </FormItem>
          </Col>)
        )
      } else if(item.type == 'text') {
        //var _id = "id_" + item_index;
        cols.push(
          <Col span={item.span ? item.span : span} className={item.className ? item.className : {}}>
              <FormItem {...(item.span ? searchFormItemLayout24 : searchFormItemLayout)} label={item.title}>
                  <div>{initialValue}</div>
              </FormItem>
          </Col>
        )
      } else if(item.type == 'radio') {
        var list = [];
        list = item.data == 'sex' ? this.state.dic_sex
        : item.data == 'dic_YesNo' ? this.state.dic_YesNo
        : item.data == 'is_study' ? this.state.is_study
        : [];
        cols.push(
          <Col span={span}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {getFieldDecorator(item.name, {
                initialValue: dataBind(initialValue),
                rules: [{ required: item.required, message: '请选择' + item.title + '!' }],
                })(
                  item.need_callback ?
                  <Radio.Group onChange={(e) => this.onRadioChange(e, item.need_callback)}>
                    {
                      list.map((item, index) => {
                        return <Radio value={item.value}>{item.title}</Radio>
                      })
                    }
                  </Radio.Group>
                  :
                  <Radio.Group>
                    {
                      list.map((item, index) => {
                        return <Radio value={item.value}>{item.title}</Radio>
                      })
                    }
                  </Radio.Group>
              )}
            </FormItem>
          </Col>
        )
      } else if(item.type == 'checkbox'){
        var list = [];
        list = item.data == 'gain_way' ? this.state.bz_gain_way_list
        : [];
        var temp_html = '';
        if(1==2//item.data == 'gain_way'  这个还是有问题，两个名称完全一样的 item.name 会出错
      )
        {
          cols.push(
            <Col span={span * 2}>
              <FormItem {...searchFormItemLayout24} label={item.title}>
                <span style={{color:"red"}}>地面</span>
                {getFieldDecorator(item.name, {
                  initialValue: dataBind(split(initialValue)),
                  rules: [{ required: item.required, message: '请选择' + item.title + '!' }],
                  })(
                    <Checkbox.Group>
                      {
                        list.filter(item => item.type == 1).map((item, index) => {
                          return <Checkbox value={item.value.toString()} key={index}>{item.title}</Checkbox>
                        })
                      }
                    </Checkbox.Group>
                )}
              </FormItem>
            </Col>
          )
          cols.push(
            <Col span={span * 2}>
              <FormItem {...searchFormItemLayout24} label={item.title}>
                <span style={{color:"red"}}>网络</span>
                {getFieldDecorator(item.name, {
                  initialValue: dataBind(split(initialValue)),
                  rules: [{ required: item.required, message: '请选择' + item.title + '!' }],
                  })(
                    <Checkbox.Group>
                      {
                        list.filter(item => item.type == 2).map((item, index) => {
                          return <Checkbox value={item.value.toString()} key={index}>{item.title}</Checkbox>
                        })
                      }
                    </Checkbox.Group>
                )}
              </FormItem>
            </Col>
          )
        }else {
          cols.push(
            <Col span={span * 2}>
              <FormItem {...searchFormItemLayout24} label={item.title}>
                {getFieldDecorator(item.name, {
                  initialValue: dataBind(split(initialValue)),
                  rules: [{ required: item.required, message: '请选择' + item.title + '!' }],
                  })(
                    <Checkbox.Group>
                      {
                        list.map((item, index) => {
                          return <Checkbox value={item.value.toString()} key={index}>{item.title}</Checkbox>
                        })
                      }
                    </Checkbox.Group>
                )}
              </FormItem>
            </Col>
          )
        }

      }
      else if(item.type == 'areas'){
        cols.push(
          <Col span={span}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {getFieldDecorator(item.name, {
                initialValue: initialValue,
                rules: [{ required: item.required, message: '请选择' + item.title + '!' }],
                })(
                  <AreasSelect
                    value={initialValue}
                    areaName={item.value2}
                  />
              )}
            </FormItem>
          </Col>
        )
      }
      else if(item.type == 'university'){
        cols.push(
          <Col span={span}>
            <FormItem {...searchFormItemLayout} label={item.title}>
              {getFieldDecorator(item.name, {
                initialValue: (!item.value ? [] : [{
                  id: item.value,
                  name: item.value2
                }]),
                rules: [{ required: item.required, message: '请选择一个' + item.title + '!' }],
              })(
                <EditableAllUniversityTagGroup maxTags={1}
                    onChange={(value) => this.onUniversityChoose(value, item.name)}
                />
                )}
            </FormItem>
          </Col>
        )
      }
      else {
        cols.push(
          <Col span={span}>
          </Col>
        )
      }

    })
    return cols;
  }

  fetch = (params = {}) => {
    if(params){
      if(this.props.isBranchUser){
        params.branchId = this.state.pagingSearch.branchId;
      }
      if(this.props.fetch2){
        this.props.fetch2(params);
      }
    }
  }
  onRadioChange(e, need_callback){
    if (need_callback) {
      if (this.props.onCallback) {
        this.props.onCallback(e.target.value);
      }
    }
  }
  subitem(value){
    let id = '';
    this.state.reg_source.forEach((e)=>{
        if(e.value==value)id = e.systemCommonId;
    })
    this.props.subitem(id).payload.promise.then((response) => {
      let data = response.payload.data.data;
      if(response.payload.data.state == 'success'){
          this.setState({
            listItem: data
          })
      }
    })
  }
  //下拉框值改变时，需要的附加操作
  onSelectChange(value, e, name, need_callback,from=0){
    if(from==1){
      this.props.form.setFieldsValue({
        subRegSource: '',
      });
      this.subitem(value)
    }
    if(e.key.indexOf('item') >= 0){
      //项目
      if(this.props.isNeedSelectName){
        var ps = this.state.pagingSearch;
        ps.itemName = e.props.children;
        //ps.itemId = value;
        this.props.pagingSearchCallback(ps);
        this.setState({ pagingSearch: ps });
      }
      //如果存在 开课批次，则要过滤
      if(this.props.isCoursePlanBatch){
        this.getCoursePlanBatchs(value);
      }
      if(this.props.isCourseCategory){
        this.getCourseCategorys(value);
      }
    }else if(e.key.indexOf('branch') >= 0){
      if(this.props.isBranchAll){
        this.getTeachCenters(value);
      }
    }else if(e.key.indexOf('course_plan_batch') >= 0){
      //开课批次
      if(this.props.isNeedSelectName){
        var ps = this.state.pagingSearch;
        ps.coursePlanBatchName = e.props.children;
        //ps.coursePlanBatchId = value;
        this.props.pagingSearchCallback(ps);
        this.setState({ pagingSearch: ps });
      }
    }

    if(value && need_callback){
      if (this.props.onCallback) {
        this.props.onCallback(value, name);
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
      if(that.props.isBranchUser){
        that.getBranchs(value, function(list){
          if(callback){
            if(list && list.length && !list[0].value){
              list.splice(0, 1)
            }
            callback(list);
          }
        })
      }else if(that.props.isUniversity){
        if(value.length < 4){
          return;
        }
        that.props.allUniversityList(value).payload.promise.then((response) => {
            let data = response.payload.data;
            var list = [];
            data.data.map(a => {
              list.push({
                value: a.universityId,
                title: a.universityName
              })
            })
            callback(list);
        })
      }
    }
    this.select_timeout = setTimeout(fake, 300);
  }
  onSearchInputSet(value, name){
    if(value){
      var p = this.state.pagingSearch;
      p[name] = value;
      this.setState({
        pagingSearch: p
      })
    }
  }
  onUniversityChoose(value, name){
    
    if(value && value.length && value[0].id){
      if(name == "studyUniversityId"){

        this.getCampus(value[0].id);
      }
      var p = this.state.pagingSearch;
      p[name] = value;
      this.setState({
        pagingSearch: p
      })
    }
    if(value && value.length < 1){
      this.setState({ bz_campus_list: [] });
      var p = this.state.pagingSearch;
      
      p.studyCampusId = '';
      this.setState({ pagingSearch: p })
    }
  }
  /*onDateChange(date, dateString, name) {
    var p = this.state.pagingSearch;
    p[name] = dateString;
    this.setState({
      pagingSearch: p
    })
  }*/
  onCheckboxChange(val, e){
    if(val){
      //var _val = val.join('');

    }

  }
  onInputChange(e, name, need_callback){
    if(e && need_callback){
      if (this.props.onCallback) {
        this.props.onCallback(e.target.value, name);
      }
    }

  }

  onSubmit(callback){
    this.props.form.validateFields((err, values) => {
      if(!err){
        console.log('Received values of form: ', values);
        //let pagingSearch = { ...this.state.pagingSearch, ...values };
        if(values.gainWayIds){
          if(typeof values.gainWayIds === "object"){
            values.gainWayIds = values.gainWayIds.join(",");
          }
        }
        if (values.highSchoolAreaId) {
          if(typeof values.highSchoolAreaId === "object"){
            values.highSchoolAreaId = values.highSchoolAreaId[values.highSchoolAreaId.length - 1];
          }
        }
        if(this.state.pagingSearch.graduateUniversityId){
          values.graduateUniversityId = this.state.pagingSearch.graduateUniversityId;
        }
        if(this.state.pagingSearch.studyUniversityId){
          values.studyUniversityId = this.state.pagingSearch.studyUniversityId;
        }
        if(values.graduateUniversityId instanceof Array){
          if(values.graduateUniversityId.length){
            values.graduateUniversityId = values.graduateUniversityId[0].id;
          }
        }
        if(values.studyUniversityId instanceof Array){
          if(values.studyUniversityId.length){
            values.studyUniversityId = values.studyUniversityId[0].id;
          }
        }

        if (callback) {//自定义方法回调
          //callback(pagingSearch);
          callback(values)
        }
      }
    });
  }

  //表单按钮处理
  renderBtnControl() {
    var btns = [];
    if(this.props.extendButtons && this.props.extendButtons.length){
      this.props.extendButtons.map(info => {
        btns.push(<Button type="primary" loading={info.loading}
          onClick={() => {
            //info.needConditionBack ? this.extendCustomerButtonClick(info.callback) : info.callback()
            this.onSubmit(info.callback)
          }} icon="save">{info.title}</Button>)
          btns.push(
            <span className="split_button"></span>
          )
      })
    }
    btns.push(<Button icon="rollback" onClick={() => this.props.onCancel()} style={{ marginLeft: 8 }} >返回</Button>)

    return <FormItem span={24} className='btnControl' {...btnformItemLayout}>
        {/*<Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button>
        <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>*/}
        {btns}
    </FormItem>
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    /*return (
      <Row gutter={24}>
        {this.getFields()}
      </Row>
    )*/
    let Subitem = document.querySelector('Subitem');
    return (
      <ContentBox titleName={this.props.title} bottomButton={this.renderBtnControl()}>
          <div className="dv_split"></div>
          <Form>
            <Row gutter={24}>
              {this.getFields()}
            </Row>
          </Form>
          <div className="dv_split"></div>
      </ContentBox>
    );
  }
}

const WrappedForm = Form.create()(EditForm);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { userId } = state.auth.currentUser.user;
    let { orgId, usertype } = state.auth.currentUser.userType;
    return { Dictionarys, userId, orgId, orgType: usertype };
};
function mapDispatchToProps(dispatch){
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    systemCommonChild: bindActionCreators(systemCommonChild, dispatch),
    getItemList: bindActionCreators(getItemList, dispatch),
    getItemListByUser: bindActionCreators(getItemListByUser, dispatch),
    getCoursePlanBatchByItemId: bindActionCreators(getCoursePlanBatchByItemId, dispatch),
    getCourseCategoryList: bindActionCreators(getCourseCategoryList, dispatch),
    getTeachCenterList: bindActionCreators(getTeachCenterList, dispatch),
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch),
    getOrganizationVoList: bindActionCreators(getOrganizationVoList, dispatch),
    getBranchList: bindActionCreators(getBranchList, dispatch),
    getClassList: bindActionCreators(getClassList, dispatch),
    postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
    selectAreaByUser: bindActionCreators(selectAreaByUser, dispatch),
    getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),
    gainWayList: bindActionCreators(gainWayList, dispatch),
    subitem:bindActionCreators(subitem, dispatch),

    allUniversityList: bindActionCreators(allUniversityList, dispatch),
    getUserByAreaList: bindActionCreators(getUserByAreaList, dispatch),
  }
}

//ReactDOM.render(<WrappedHorizontalLoginForm />, mountNode);
export default connect(mapStateToProps, mapDispatchToProps)(WrappedForm);
