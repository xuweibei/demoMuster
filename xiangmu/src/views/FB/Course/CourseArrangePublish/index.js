/*
课表管理 发布
2018-05-23
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle, openExport,
  formatNumberDateToChineseDate,
 } from '@/utils';
import { env } from '@/api/env';
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

import SearchForm from '@/components/SearchForm';
import {searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';

import { loadDictionary } from '@/actions/dic';
import { courseArrangePublishListQuery, courseArrangePublishCommit
 } from '@/actions/course';

import CourseArrangeDetail from './detail';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

class CourseArrangePublish extends React.Component {
  state= {
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
    data_list: [],
    totalRecord: 0,
    loading: false,
    UserSelecteds: [],
    isShowChangeDateModal: false,
    isShowChangeTeacherModal: false,
    courseDate: '',
  };
  constructor(){
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).onCommit = this.onCommit.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo']);
  }

  onCommit(){
    if(!this.state.UserSelecteds.length){
      return;
    }
    Modal.confirm({
        title: '是否确认发布所选课表?',
        content: '点击确认发布所选课表!否则点击取消！',
        onOk: () => {
            this.props.courseArrangePublishCommit(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
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

  columns = [
    {
        title: '教学点',
        width: 120,
        fixed: 'left',
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
            console.log(c)
            _m += c;
            text[i].map(_day => {
              _m += _day + "、";
            })
            if (text[i].length) {
              _m = _m.substr(0, _m.length - 1);
            }
            _m += "。";
          }
          return _m
        }
    },
    {
        title: '课次',
        dataIndex: 'courseNum',
    },
    {
        title: '排课课时',
        dataIndex: 'hour',
    },
    {
        title: '讲师',
        dataIndex: 'teacherName',
    },
    {
        title: '课表确认',
        dataIndex: 'publishStateName',
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
  //检索数据
  fetch(params){
    if (!params || !params.courseplanBatchId) {
      this.setState({
        data_list: []
      })
      return;
    }
      var condition = params || this.state.pagingSearch;
      this.setState({ loading: true, pagingSearch: condition });
      this.props.courseArrangePublishListQuery(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = []
            data.data = data.data || []
            data.data.map(item => {
              item.key = item.courseArrangeId;
              if(item.timeQuantum){
                var _m = "";
                for(var i in item.timeQuantum){
                  var c = formatNumberDateToChineseDate(i);
                  _m += c;
                  item.timeQuantum[i].map(_day => {
                    _m += _day + "、";
                  })
                  if(item.timeQuantum[i].length){
                    _m = _m.substr(0, _m.length - 1);
                  }
                  _m += "。";
                  //_m.push(_date);
                }
              }
              item.timeQuantumStr2 = _m;
              list.push(item);
            })
            this.setState({
              data_list: list,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false, data_list: [] })
              message.error(data.message);
          }
      })
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
  }

  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Detail':
        block_content = <CourseArrangeDetail {...this.state}
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
            getCheckboxProps: record => ({
                disabled: record.publishStateName === '发布'?true:false, // Column configuration not to be checked
            }),
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
              form_item_list={[
                {type:'select', data: 'item'             , name: 'itemId',            title: '项目',    value: this.state.pagingSearch.itemId,              is_all:false},
                {type:'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', value: this.state.pagingSearch.courseplanBatchId,  is_all:false },
                {type:'select', data: 'course_category'  , name: 'courseCategoryId',  title: '科目',    value: this.state.pagingSearch.courseCategoryId,    is_all: true},
                // {type:'select', data: 'branch'           , name: 'branchId',          title: '分部',    value: this.state.pagingSearch.branchId,  is_all: true },
                {type:'select', data: 'teach_center'     , name: 'teachCenterId',     title: '教学点',  value: this.state.pagingSearch.teachCenterId,       is_all: true },
                {type:'input', name: 'courseArrangeName', title: '课程班',  value: this.state.pagingSearch.courseArrangeName},
                {type:'input', name: 'teacher', title: '讲师',  value: this.state.pagingSearch.teacher},
                {type:'select', data: 'publish_state', name: 'publishState', title: '课表发布情况', value: this.state.pagingSearch.status,  is_all:true},
                {type:''}
              ]}
              fetch2={(params) =>this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              isNeedSelectName={true}
              pagingSearchCallback={(params)=>this.setState({pagingSearch:params})}
            />
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                rowSelection={rowSelection}
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <Row justify="space-between" align="middle" type="flex">
                  <Col span={4}>
                    {
                      this.state.UserSelecteds.length ?
                      <Button loading={this.state.loading} icon="save" onClick={this.onCommit}>课表发布</Button>
                      :
                      <Button icon="save" disabled>课表发布</Button>
                    }
                  </Col>
                  <Col span={20} className={'search-paging-control'}>
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
        )
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseArrangePublish);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseArrangePublishListQuery: bindActionCreators(courseArrangePublishListQuery, dispatch),
        courseArrangePublishCommit: bindActionCreators(courseArrangePublishCommit, dispatch),
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
