/*
新增开课计划 列表
2018-05-04
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { env } from '@/api/env';

import { loadBizDictionary, onSearch, onPageIndexChange,
  onShowSizeChange } from '@/utils/componentExt';
import SearchForm from '@/components/SearchForm';
import { getCoursePlanAddList, createCoursePlanAdd,
  createCoursePlanAdditional } from '@/actions/course';

import CoursePlanAddView from './view';
//import CoursePlanAdditionalView from './additional';

class CoursePlanAdd extends React.Component {
  state= {
    reqErroe:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      courseplanBatchId: '',
      itemId: '',
      courseCategoryId: '',
      teachCenterId: '',
    },
    data_list: [],
    //totalRecord: 0,
    loading: false,
    dataModelAdd: {
      courseplanBatchId: '',
      itemId: '',
      teachCenterId: '',
      courseCategoryId: '',

      courseId: '',

      courseplanName: '',
      teachClassType: '',
      examBatchId: '',
      isUniversityDate: '',
      startDate: '',
      endDate: '',
      arrangeDateRemark: '',
      planStudentNum: 0,
      restudyStudentNum: 0,
      openStudentNum: 0,
      isAdmitOther: '',
      intentTeacher: '',
      classHour: '',
      remark: '',
    },
    dataModelAdditional: {

    }
  };
  constructor(){
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }

  columns = [
    {
        title: '教学点',
        width:120,
        fixed:'left',
        dataIndex: 'teachCenterName',
    },
    {
        title: '科目',
        dataIndex: 'courseCategoryName'
    },
    // {
    //     title: '首次上课人数',
    //     dataIndex: 'firstStudyCount'
    // },
    // {
    //     title: '重修人数',
    //     dataIndex: 'reStudyCount'
    // },
    {
        title: '课程班数',
        dataIndex: 'courseCount'
    },
    {
        title: '开课预估总人数\n（不含重修）',
        dataIndex: 'planStudentnum',
        render: (text, record) => {
          return <span>{record.planStudentnum - record.restudyStudentNum}</span>
        }
    },
    {
        title: '预估重修人数',
        dataIndex: 'restudyStudentNum',
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          <div>
            {record.isValid &&
              <Button onClick={() => { this.onLookView('Add', record); }}>新增课程班</Button>
            }
            {!record.isValid &&
              <Button onClick={() => { this.onLookView('Additional', record) }}>补报课程班</Button>
            }
          </div>
        ),
    }
  ];
  //检索数据
  fetch(params){
    if(!params || !params.courseplanBatchId){
      //message.error("")
      this.setState({
        data_list: []
      })
      return;
    }
      this.setState({ loading: true });
      var condition = params || this.state.pagingSearch;
      this.props.getCoursePlanAddList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              pagingSearch: condition,
              data_list: data.data,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }
  changeEeqError=()=>{
    this.setState({
      reqErroe:false
    })
  }
  //浏览视图
  onLookView = (op, item) => {
    if(op == 'Add' || op == 'Additional'){
      var _item = this.state.dataModelAdd;
      _item.courseplanBatchId = this.state.pagingSearch.courseplanBatchId;
      _item.itemId = this.state.pagingSearch.itemId;
      _item.teachCenterId = item.teachCenterId;
      _item.courseCategoryId = item.courseCategoryId;
      this.setState({
        //editMode: 'Create',
        editMode: op,
        currentDataModel: _item
      })
    }else {
      this.setState({
          editMode: op,//编辑模式
          currentDataModel: item,//编辑对象
      });
    }
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Add':
          //delete dataModel.parentOrgid;
          this.props.createCoursePlanAdd(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
                  this.setState({
                    reqErroe:true
                  })
              }
              else {
                  message.success("新增课程班成功!");
                  this.fetch();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })

          break;
        case 'Additional':
          delete dataModel.parentOrgid;
          this.props.createCoursePlanAdditional(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message); 
                  this.setState({
                    reqErroe:true
                  })
              }
              else {
                  message.success("补报课程班成功!");
                  this.fetch();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })
          break;
      }
    }
  }

  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Add':
        block_content = <CoursePlanAddView
          viewCallback={this.onViewCallback}
          {...this.state}
          editMode={'Add'}
          changeEeqError = {this.changeEeqError}
        />
        break;
      case 'Additional':
        block_content = <CoursePlanAddView
          viewCallback={this.onViewCallback}
          {...this.state}
          changeEeqError = {this.changeEeqError}
          editMode={'Additional'}
        />
        break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              isItemUser={true}
              isCoursePlanBatch={true}
              isCourseCategory={true}
              isMain={true}
              isTeachCenter={true}
              form_item_list={[
                {type:'select', data: 'item'             , name: 'itemId',            title: '项目',    value: this.state.pagingSearch.itemId,            is_all:false},
                {type:'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次',value: this.state.pagingSearch.courseplanBatchId, is_all:false },
                {type:'select', data: 'course_category'  , name: 'courseCategoryId',  title: '科目',    value: this.state.pagingSearch.courseCategoryId,  is_all: true},
                {type:'select', data: 'teach_center'     , name: 'teachCenterId',     title: '教学点',  value: this.state.pagingSearch.teachCenterId,     is_all: true }
              ]}
              fetch2={(params) =>this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
            />
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                scroll={{x:1000}}
                bordered
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
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
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CoursePlanAdd);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        //loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getCoursePlanAddList: bindActionCreators(getCoursePlanAddList, dispatch),
        createCoursePlanAdd: bindActionCreators(createCoursePlanAdd, dispatch),
        createCoursePlanAdditional: bindActionCreators(createCoursePlanAdditional, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
