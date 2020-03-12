/*
课表管理
2018-05-19
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, DatePicker
} from 'antd';
const FormItem = Form.Item;
import {
  formatMoney, timestampToTime, getDictionaryTitle, openExport,
  formatNumberDateToChineseDate,
} from '@/utils';
import { env } from '@/api/env';
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';

import { loadDictionary } from '@/actions/dic';
import {
  courseArrangeListByCourseArrange, courseArrangeListByTeacher,
  courseArrangeDelete, courseArrangeCommit,
  courseArrangePublishListQuery
  , courseArrangeDetailUpdate, courseArrangeDateBatchUpdate, courseArrangeTeacherBatchUpdate,ClassScheduleReleaseConfirmation
} from '@/actions/course';

import CourseArrangeDetail from './detail';
import CourseArrangeImportPage from './import';
import Conflict from '../CourseArrangeManage/conflict';
import CourseArrangeCalendar from '../CourseArrangeManage/calendar';
import DropDownButton from '@/components/DropDownButton';

const btnformItemLayout = {
  wrapperCol: { span: 24 },
};

class CourseArrangeImportManage extends React.Component {
  state = {
    editMode: '',
    pagingSearch: {
      pageSize: env.defaultPageSize,
      currentPage: 1,
      itemId: '',
      courseplanBatchId: '',
      courseCategoryId: '',
      branchId: '',
      teachCenterId: '',
      courseArrangeName: '',
      teacher: '',
      //dateStart: '',
      //dateEnd: '',
      status: '',
    },
    searchByTeacher: false,   //按教师查 就为 true
    data_list_0: [],
    data_list_1: [],
    totalRecord: 0,
    loading: false,
    UserSelecteds: [],
    isShowChangeDateModal: false,
    isShowChangeTeacherModal: false,
    courseDate: '',
  };
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).onImport = this.onImport.bind(this);    
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo','publish_state']);
  }

  onImport = () => {
    this.onLookView('Import');
  } 
  cancelConfirm = (value) => { 
    let condition = {};
    condition.operationType = 1;
    condition.courseArrangeId = value.courseArrangeId;
    Modal.confirm({
      title: '您确认对此课程班课表取消确认操作吗?',
      content: '',
      onOk: () => {
        this.props.ClassScheduleReleaseConfirmation(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state != "success") {
            message.error(data.message);
          }
          else {
            message.success("成功取消!");
            this.setState({ UserSelecteds: [] })
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
  cancelRelease = () => { 
    let condition = {};
    condition.operationType = 2;
    condition.courseArrangeId = this.state.UserSelecteds.join(',');
    Modal.confirm({
      title: '您确定对所选的课程班课表取消发布吗?',
      content: '',
      onOk: () => {
        this.props.ClassScheduleReleaseConfirmation(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state != "success") {
            message.error(data.message);
          }
          else {
            message.success("成功取消!");
            this.setState({ UserSelecteds: [] })
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
  onCommit = () => { 
    let condition = {};
    condition.operationType = 3;
    condition.courseArrangeId = this.state.UserSelecteds.join(',');
    Modal.confirm({
      title: '您确定对所选的课程班课表取消发布，同时取消确认吗?',
      content: '',
      onOk: () => {
        this.props.ClassScheduleReleaseConfirmation(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            this.setState({ UserSelecteds: [] })
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }   

  columns_by_course = [
    {
      title: '分部',
      width: 120,
      fixed: 'left',
      dataIndex: 'branchUniversityName',
    },
    {
      title: '教学点',
      dataIndex: 'teachCentername',
    },
    {
      title: '课程班',
      dataIndex: 'courseplanName'
    },
    {
      title: '课程班类型',
      dataIndex: 'teachClassTypeName'
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName',
    }, 
    {
      title: '上课日期',
      dataIndex: 'timeQuantumAll',
      render: (text, record) => {
        var _m = "";
        for (var i in text) {
          var c = formatNumberDateToChineseDate(i);
          _m += c;
          text[i].map(_day => {
            _m += _day + "、";
          })
          if (text[i].length) {
            _m = _m.substr(0, _m.length - 1);
          }
          _m += "、";
        }
        _m = _m.substr(0, _m.length - 1);
        return _m
      }
    },
    {
      title: '课次',
      dataIndex: 'courseNum',
    },
    {
      title: '课时',
      dataIndex: 'hour',
    },
    {
      title: '讲师',
      dataIndex: 'teacherName',
    },
    {
      title: '课表发布',
      dataIndex: 'publishStateName',
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onLookView('Detail', record); }}>明细</Button>

         {
           (record.publishStateName == '未发布' && record.status == 2)&&<Button onClick={()=>this.cancelConfirm(record)}>取消确认</Button>
         } 
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params) {
    if (!params || !params.itemId || !params.courseplanBatchId) {
      this.setState({
        data_list_0: [],
        data_list_1: []
      })
      return;
    } 
    var condition = params || this.state.pagingSearch;
    condition.isZB = 1;
    this.setState({ loading: true, pagingSearch: condition }); 
    this.props.courseArrangePublishListQuery(condition).payload.promise.then((response) => {
        let data = response.payload.data; 
        if (data.state === 'success') {
          // setData(data.data, data.totalRecord, 1);
          this.setState({
            data_list_0:data.data,
            totalRecord:data.totalRecord,
            loading:false
          })
        }
        else {
          this.setState({ loading: false, data_list_1: [] })
          message.error(data.message);
        } 
    }) 
  }
  //浏览视图
  onLookView = (op, item, teacherName) => {
    var p = this.state.pagingSearch;
    p.teacher = teacherName;
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
      pagingSearch: p
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Edit':
          //delete dataModel.parentOrgid;
          this.props.courseArrangeDetailUpdate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.fetch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      /*case 'Edit':
        block_content = <CourseArrangeEdit
          id={this.state.currentDataModel.courseArrangeDetailId}
          editMode={this.state.editMode}
          viewCallback={this.onViewCallback}
        />
        break;*/
      case 'Detail':
        block_content = <CourseArrangeDetail {...this.state}
          viewCallback={this.onViewCallback}
        />
        break;
      case 'Import':
        block_content = <CourseArrangeImportPage {...this.state}
          viewCallback={this.onViewCallback}
        />
        break;
      case 'Conflict':
        block_content = <Conflict {...this.state}
          viewCallback={this.onViewCallback}
        />
        break;
      case 'Calendar':
        block_content = <CourseArrangeCalendar pagingSearch={this.state.pagingSearch}
          viewCallback={this.onViewCallback}
        />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => 
            {
              return{
            disabled: record.publishStateName == '发布'?false : true, 
          }
        }
          ,
        }

        const { getFieldDecorator } = this.props.form;

        block_content = (
          <div>
            <SearchForm
              num_column={2}
              isItemUser={true}
              isCoursePlanBatch={true}
              isCourseCategory={true}
              isMain={true}
              isBranchAll={true}
              isTeachCenter={true}
              isPublishState={true}
              isYesNo={true}
              branchId={this.state.branchId}
              isCourseArrangeStatus={true} 
              defaultSearchCallback={(params) => {
                this.setState({
                  searchByTeacher: false
                })
                var that = this;
                setTimeout(function(){
                  that.fetch(params);
                }, 200);
              }} 
              form_item_list={[
                { type: 'select', data: 'item', name: 'itemId', title: '项目', value: this.state.pagingSearch.itemId, is_all: false },
                { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', value: this.state.pagingSearch.courseplanBatchId, is_all: false },
                { type: 'select', data: 'course_category', name: 'courseCategoryId', title: '科目', value: this.state.pagingSearch.courseCategoryId, is_all: true },
                //{ type: 'select', data: 'branch', name: 'branchId', title: '分部', is_all: true },
                { type: 'org', name: 'branchId', title: '分部', value: this.state.pagingSearch.branchId, is_all: true },
                { type: 'select', data: 'teach_center', name: 'teachCenterId', title: '教学点', value: this.state.pagingSearch.teachCenterId, is_all: true },
                { type: 'input', name: 'courseArrangeName', title: '课程班', value: this.state.pagingSearch.courseArrangeName },
                { type: 'input', name: 'teacher', title: '讲师', value: this.state.pagingSearch.teacher },
                { type:'select', data: 'publish_state', name: 'publishState', title: '课表发布情况', value: this.state.pagingSearch.status,  is_all:true},
                { type: '' },
              ]} 
              onCallback={(value, name) => {
                var branchId = null;
                if(name == "branchId"){
                  if(value){
                    branchId = value;
                  }
                }
                this.setState({branchId: branchId});
              }}
              //fetch2={(params) => this.fetch(params)}
              pagingSearch={this.state.pagingSearch} 
            />
            <div className="space-default"></div>
            <div className="search-result-list"> 
                <Table columns={this.columns_by_course} //列定义
                  loading={this.state.loading}
                  pagination={false}
                  dataSource={this.state.data_list_0}//数据
                  bordered
                  rowKey = {'courseArrangeId'}
                  rowSelection={rowSelection}
                  scroll={{ x: 1500 }}
                /> 
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={8}>
                    {
                      this.state.UserSelecteds.length ?
                      <Button loading={this.state.loading} icon="delete" onClick={this.cancelRelease}>取消发布</Button>
                      :
                      <Button loading={this.state.loading} icon="delete" disabled>取消发布</Button>
                    }
                    <div className='split_button'></div>
                    {
                      this.state.UserSelecteds.length ?
                      <Button loading={this.state.loading} icon="save" onClick={this.onCommit }>取消"发布及确认"</Button>
                      :
                      <Button loading={this.state.loading} icon="save" disabled>取消"发布及确认"</Button>
                    }
                  </Col>
                  </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      
                      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseArrangeImportManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    courseArrangeListByCourseArrange: bindActionCreators(courseArrangeListByCourseArrange, dispatch),
    courseArrangeListByTeacher: bindActionCreators(courseArrangeListByTeacher, dispatch),
    courseArrangeDelete: bindActionCreators(courseArrangeDelete, dispatch),
    courseArrangeCommit: bindActionCreators(courseArrangeCommit, dispatch),

    courseArrangeDetailUpdate: bindActionCreators(courseArrangeDetailUpdate, dispatch),
    courseArrangeDateBatchUpdate: bindActionCreators(courseArrangeDateBatchUpdate, dispatch),
    courseArrangeTeacherBatchUpdate: bindActionCreators(courseArrangeTeacherBatchUpdate, dispatch),

    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    ClassScheduleReleaseConfirmation: bindActionCreators(ClassScheduleReleaseConfirmation, dispatch),
    courseArrangePublishListQuery: bindActionCreators(courseArrangePublishListQuery, dispatch),


  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
