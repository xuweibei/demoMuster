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
  courseArrangeDelete, courseArrangeCommit

  , courseArrangeDetailUpdate, courseArrangeDateBatchUpdate, courseArrangeTeacherBatchUpdate
} from '@/actions/course';

import CourseArrangeDetail from './detail';
import CourseArrangeImportPage from './import';
import Conflict from '../CourseArrangeManage/conflict';
import CourseArrangeCalendar from '../CourseArrangeManage/calendar';

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
    (this: any).onDelete = this.onDelete.bind(this);
    (this: any).onCommit = this.onCommit.bind(this);
    (this: any).onHourChange = this.onHourChange.bind(this);
    (this: any).onDateChange = this.onDateChange.bind(this);
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo']);
  }

  onImport = () => {
    this.onLookView('Import');
  }
  onDelete = () => {
    if (!this.state.UserSelecteds.length) {
      return;
    }
    Modal.confirm({
      title: '是否删除所选课表?',
      content: '点击确认删除所选课表!否则点击取消！',
      onOk: () => {
        this.props.courseArrangeDelete(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state != "success") {
            message.error(data.message);
          }
          else {
            message.success("成功删除!");
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
  onCommit() {
    if (!this.state.UserSelecteds.length) {
      return;
    }
    Modal.confirm({
      title: '是否确认所选课表?',
      content: '点击确认所选课表!否则点击取消！',
      onOk: () => {
        this.props.courseArrangeCommit(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
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
  onBatchChangeDate() {
    if (!this.state.UserSelecteds.length) {
      return;
    }
    //var c = "中国";
    //var d = encodeURI(c);
    var that = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var params = {};
        if (!that.state.courseDate) {
          message.error("请输入上课日期");
          return;
        }
        params.courseDate = that.state.courseDate + " 00:00:00";
        params.ids = that.state.UserSelecteds.join(',')
        params.timeQuantum = values.timeQuantum;
        that.props.courseArrangeDateBatchUpdate(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            that.setState({ UserSelecteds: [], isShowChangeDateModal: false, isShowChangeTeacherModal: false })
            that.onSearch();
          }
        })

      }
    });
  }
  onBatchChangeTeacher() {
    if (!this.state.UserSelecteds.length) {
      return;
    }
    var that = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var params = {};
        if (values.teacher && values.teacher.length) {
          params.teacherId = values.teacher[0].id;
        }
        params.ids = that.state.UserSelecteds.join(',')
        that.props.courseArrangeTeacherBatchUpdate(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            that.setState({ UserSelecteds: [], isShowChangeDateModal: false, isShowChangeTeacherModal: false })
            that.onSearch();
          }
        })
      }
    });

  }

  onHourChange(value) {
    var timeQuantum = "";
    switch (value) {
      case 1:
        timeQuantum = "00:00-23:59";
        break;
      case 2:
        timeQuantum = "06:00-12:00";
        break;
      case 3:
        timeQuantum = "12:00-18:00";
        break;
      case 4:
        timeQuantum = "18:00-23:59";
        break;
      default:
        timeQuantum = "";
    }
    this.setState({
      timeQuantum: timeQuantum
    })
  }
  onDateChange(date, dateString) {
    this.setState({
      courseDate: dateString
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
      title: '计划开课时段',
      dataIndex: 'timeQuantumStr',
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
      title: '课表确认',
      dataIndex: 'statusName',
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      key: 'action',
      render: (text, record) => (
        <Button onClick={() => { this.onLookView('Detail', record); }}>明细</Button>
      ),
    }
  ];
  columns_by_teacher = [
    {
      title: '讲师',
      width: 120,
      fixed: 'left',
      dataIndex: 'teacherName',
    },
    {
        title: '英文名',
        dataIndex: 'englishName',
    },
    {
      title: '授课教学点数',
      dataIndex: 'teachCentCount',
    },
    {
      title: '授课课程班数',
      dataIndex: 'courseplanCount',
    },
    {
      title: '科目',
      dataIndex: 'categoryCount',
    },
    {
      title: '排课总次数',
      dataIndex: 'courseNum'
    },
    {
      title: '排课总课时',
      dataIndex: 'hour',
    },
    {
      title: '上课时段',
      dataIndex: 'timeQuantumStr2',
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      key: 'action',
      render: (text, record) => (
        <Button onClick={() => { this.onLookView('Calendar', null, record.teacherName); }}>日历显示</Button>
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
    var that = this;
    var setData = function(data, totalRecord, type) {
      var list = []
      data = data || []
      data.map(item => {
        item.key = item.courseArrangeId || item.teacherId;
        if (item.timeQuantumAll ) {
          var _m = "";
          for (var i in item.timeQuantumAll) {
            var c = formatNumberDateToChineseDate(i);
            _m += c;
            item.timeQuantumAll[i].map(_day => {
              _m += _day + "、";
            })
            if (item.timeQuantumAll[i].length) {
              _m = _m.substr(0, _m.length - 1);
            }
            _m += "。";
            // _m.push(_date);
          }
        }
        item.timeQuantumStr2 = _m;
        list.push(item);
      })
      if(that.state.searchByTeacher){
        that.setState({
          data_list_1: type == 1 ? list : [],
          totalRecord: totalRecord,
          loading: false
        })
      }else {
        that.setState({
          data_list_0: type == 0 ? list : [],
          totalRecord: totalRecord,
          loading: false
        })
      }

    }

    var condition = params || this.state.pagingSearch;
    this.setState({ loading: true, pagingSearch: condition });
    if(this.state.searchByTeacher){
      //按讲师查
      this.props.courseArrangeListByTeacher(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          setData(data.data, data.totalRecord, 1);
        }
        else {
          this.setState({ loading: false, data_list_1: [] })
          message.error(data.message);
        }
      })
    }else {
      //按课表查
      this.props.courseArrangeListByCourseArrange(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          setData(data.data, data.totalRecord, 0);
        }
        else {
          this.setState({ loading: false, data_list_0: [] })
          message.error(data.message);
        }
      })
    }
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
            disabled: !record.del, //仅删除课程班中无考勤信息的课表信息
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
              isBranchAll={false}
              isTeachCenter={true}
              isYesNo={true}
              isCourseArrangeStatus={true}
              defaultSearchName={"按课程班查询"}
              defaultSearchCallback={(params) => {
                this.setState({
                  searchByTeacher: false
                })
                var that = this;
                setTimeout(function(){
                  that.fetch(params);
                }, 200);
              }}
              branchId={this.state.branchId}
              form_item_list={[
                { type: 'select', data: 'item', name: 'itemId', title: '项目', value: this.state.pagingSearch.itemId, is_all: false },
                { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', value: this.state.pagingSearch.courseplanBatchId, is_all: false },
                { type: 'select', data: 'course_category', name: 'courseCategoryId', title: '科目', value: this.state.pagingSearch.courseCategoryId, is_all: true },
                //{ type: 'select', data: 'branch', name: 'branchId', title: '分部', is_all: true },
                { type: 'org', name: 'branchId', title: '分部', value: this.state.pagingSearch.branchId, is_all: true },
                { type: 'select', data: 'teach_center', name: 'teachCenterId', title: '教学点', value: this.state.pagingSearch.teachCenterId, is_all: true },
                { type: 'input', name: 'courseArrangeName', title: '课程班', value: this.state.pagingSearch.courseArrangeName },
                { type: 'input', name: 'teacher', title: '讲师', value: this.state.pagingSearch.teacher },
                { type: 'select', data: 'course_arrange_status', name: 'status', title: '课表确认情况', value: this.state.pagingSearch.status, is_all: true },
                { type: '' },
              ]}
              //fetch2={(params) => this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                {
                  title: '按讲师查询', needConditionBack: true, icon: 'search', callback: (params) => {
                    this.setState({
                      pagingSearch: params,
                      searchByTeacher: true,
                    })
                    var that = this;
                    setTimeout(function(){
                      that.fetch(params);
                    }, 200);
                  }, loading: this.state.loading
                },
                {
                  title: '冲突查询', needConditionBack: true, icon: 'search', callback: (params) => {
                    this.setState({
                      pagingSearch: params
                    })
                    this.onLookView('Conflict');
                  }, loading: this.state.loading
                },
                {
                  title: '按日历显示', needConditionBack: true, icon: 'calendar', callback: (params) => {
                    this.setState({
                      pagingSearch: params
                    })
                    this.onLookView('Calendar')
                  }, loading: this.state.loading
                },
                {
                  title: '导入课表', needConditionBack: false,icon:'download', callback: () => {
                    this.onImport();
                  }, loading: this.state.loading
                }
              ]}
              // isNeedSelectName={true}
              // pagingSearchCallback={(params) => this.setState({ pagingSearch: params })}
              onCallback={(value, name) => {
                var branchId = null;
                if(name == "branchId"){
                  if(value){
                    branchId = value;
                  }
                }
                this.setState({branchId: branchId});
              }}
            />
            <div className="space-default"></div>
            <div className="search-result-list">
              {this.state.searchByTeacher ?
                <Table columns={this.columns_by_teacher} //列定义
                  loading={this.state.loading}
                  pagination={false}
                  dataSource={this.state.data_list_1}//数据
                  bordered
                  rowSelection={rowSelection}
                  scroll={{ x: 1300 }}
                />
                :
                <Table columns={this.columns_by_course} //列定义
                  loading={this.state.loading}
                  pagination={false}
                  dataSource={this.state.data_list_0}//数据
                  bordered
                  rowSelection={rowSelection}
                  scroll={{ x: 1500 }}
                />
              }
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={8}>
                    {
                      this.state.UserSelecteds.length ?
                      <Button loading={this.state.loading} icon="delete" onClick={this.onDelete}>删除课表</Button>
                      :
                      <Button loading={this.state.loading} icon="delete" disabled>删除课表</Button>
                    }
                    <div className='split_button'></div>
                    {
                      this.state.UserSelecteds.length ?
                      <Button loading={this.state.loading} icon="save" onClick={this.onCommit}>课表确认</Button>
                      :
                      <Button loading={this.state.loading} icon="save" disabled>课表确认</Button>
                    }
                  </Col>
                  <Col span={16} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
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

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
