/*
开课计划 管理列表
2018-05-08
lixuliang
*/

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle } from '@/utils';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import SearchForm from '@/components/SearchForm';

import { loadDictionary } from '@/actions/dic';
import { getCoursePlanList, updateCoursePlan, deleteCoursePlan, getCoursePlanById } from '@/actions/course';

import CoursePlanView from '../CoursePlanAdd/view';
import DropDownButton from '@/components/DropDownButton';


class CoursePlanManage extends React.Component {

  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).onDeleteCoursePlan = this.onDeleteCoursePlan.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: env.defaultPageSize,
        itemId: '',
        courseplanBatchId: '',
        courseplanName: '',
        courseCategoryId: '',
        courseId: '',
        teachCenterId: '',
        isUniversityDate: '',
        status: '',
        teachClassType: '',
        intentTeacher: '',
        isAppend: ''
      },
      data_list: [],
      loading: false,
      reqErroe:false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo','is_new_student']);
  }

  columns = [
    {
      title: '教学点',
      width:120,
      fixed:'left',
      dataIndex: 'teachCenterName',
    },
    {
      title: '课程班',
      width:120,
      dataIndex: 'courseplanName',
    },
    {
      title: '课程班类型',
      width:120,
      dataIndex: 'teachClassTypeName',
    },
    {
      title: '科目',
      width:120,
      dataIndex: 'courseCategoryName'
    },
    {
      title: '意向讲师',
      width:100,
      dataIndex: 'intentTeacher'
    },
    {
      title: '课时备注',
      width:80,
      dataIndex: 'classHour'
    },
    {
      title: '开课日期',
      dataIndex: 'startDate',
      width:120,
      render: (text, record, index) => {
        return timestampToTime(record.startDate);
      }
    },
    {
      title: '结课日期',
      dataIndex: 'startDate',
      width:120,
      render: (text, record, index) => {
        return timestampToTime(record.endDate);
      }
    },
    {
      title: '开课预估总人数（不含重修）',
      width:160,
      dataIndex: 'planStudentNum',
      render: (text, record) => {
        return <span>{record.planStudentNum}</span>
      }
      // render: (text, record) => {
      //   return <span>{record.planStudentNum - record.restudyStudentNum}</span>
      // }
    },
    // {
    //   title: '高校定日期',
    //   dataIndex: 'isUniversityDate',
    //   render: (text, record) => {
    //     return getDictionaryTitle(this.state.dic_YesNo, record.isUniversityDate);
    //   }
    // },
    {
      title: '可排课日期',
      dataIndex: 'arrangeDateRemark'
    },
    {
      title: '预估考季',
      width:120,
      dataIndex: 'examBatchName'
    },
    {
      title: '状态',
      width:90,
      dataIndex: 'statusName'
    },
    {
      title: '是否新生班',
      width:90,
      dataIndex: 'isNewStudent',
      render:(text,record)=>{ 
        return getDictionaryTitle(this.state.is_new_student,record.isNewStudent)
      }
    },
    {
      title: '操作',
      width: '120',
      fixed:'right',
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          {(record.status == 0 || record.status == 3) && <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>}
          {record.status <= 0 && <Button onClick={() => { this.onDeleteCoursePlan(record.courseplanId); }}>删除</Button>}
          {record.status > 0 && <Button onClick={() => { this.onLookView('studentView', record) }}>查看</Button>}
        </DropDownButton>
      ),
    }
  ];

  //检索数据
  fetch(params) {
    if (!params || !params.courseplanBatchId) {
      this.setState({
        data_list: []
      })
      return;
    }
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.getCoursePlanList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        data.data.map(a => {
          a.startDate = timestampToTime(a.startDate);
          a.endDate = timestampToTime(a.endDate);
        })
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

  onDeleteCoursePlan(id) {
    Modal.confirm({
      title: '是否删除所选开课计划?',
      content: '点击确认删除所选开课计划!否则点击取消！',
      onOk: () => {
        this.props.deleteCoursePlan(id).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            this.fetch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

  //浏览视图
  onLookView = (op, item) => {
    if (op == 'Add' || op == 'Additional') {
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
    } else {
      this.setState({
        editMode: op,//编辑模式
        currentDataModel: item,//编辑对象
      });
    }
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
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
              this.fetch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })

          break;
        case 'Additional':
          //delete dataModel.parentOrgid;
          this.props.createCoursePlanAdditional(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
              this.setState({
                reqErroe:true
              })
            }
            else {
              this.fetch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Edit':
          this.props.updateCoursePlan(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
              this.setState({
                reqErroe:true
              })
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
      case 'studentView':
      case 'View':
      case 'Edit':
        block_content = <CoursePlanView
          viewCallback={this.onViewCallback}
          {...this.state}
          changeEeqError = {this.changeEeqError}
        //editMode={this.state.editMode}
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
              isYesNo={true}
              isTeachClassType={true}
              isCoursePlanAuditStatus={true}
              form_item_list={[
                { type: 'select', data: 'item', name: 'itemId', title: '项目', value: this.state.pagingSearch.itemId, is_all: false },
                { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', value: this.state.pagingSearch.courseplanBatchId, is_all: false },
                { type: 'select', data: 'course_category', name: 'courseCategoryId', title: '科目', value: this.state.pagingSearch.courseCategoryId, is_all: true },
                { type: 'select', data: 'teach_center', name: 'teachCenterId', title: '教学点', value: this.state.pagingSearch.teachCenterId, is_all: true },
                // { type: 'select', data: 'dic_YesNo', name: 'isUniversityDate', title: '高校定日期', is_all: true },
                { type: 'select', data: 'courseplan_status', name: 'status', title: '状态', value: this.state.pagingSearch.status, is_all: true },
                { type: 'select', data: 'teach_class_type', name: 'teachClassType', title: '课程班类型', value: this.state.pagingSearch.teachClassType, is_all: true },
                { type: 'input', name: 'courseplanName', title: '课程班', value: this.state.pagingSearch.courseplanName },
                { type: 'input', name: 'intentTeacher', title: '意向讲师', value: this.state.pagingSearch.intentTeacher },
                { type: 'select', data: 'dic_YesNo', name: 'isAppend', title: '是否补报', value: this.state.pagingSearch.isAppend, is_all: true },
                { type: 'select', data: 'dic_YesNo', name: 'isNewStudent', title: '是否新生班', value: this.state.pagingSearch.isNewStudent, is_all: true },
                {}
              ]}
              fetch2={(params) => this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
            />
            <div className="space-default"></div>
            {
                this.state.data_list.length ?
                  <div style={{ color: "ff0000" }}>项目{this.state.data_list[0].itemName}{this.state.data_list[0].courseplanBatchName}开课计划提交截止日期：{timestampToTime(this.state.data_list[0].courseBatchEndDate)}，请抓紧时间！</div>
                  : <div></div>
              }
              <span style={{color:'red'}}>课时备注1小时/1课时</span>
            <div style={{height:20}}></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                scroll={{x:1800}}
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
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CoursePlanManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getCoursePlanList: bindActionCreators(getCoursePlanList, dispatch),
    getCoursePlanById: bindActionCreators(getCoursePlanById, dispatch),
    updateCoursePlan: bindActionCreators(updateCoursePlan, dispatch),
    deleteCoursePlan: bindActionCreators(deleteCoursePlan, dispatch),
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
