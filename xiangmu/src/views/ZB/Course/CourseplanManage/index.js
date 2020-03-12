/*
开课计划查询
2018-05-09
suicaijiao
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
import { timestampToTime, getDictionaryTitle,formatMoment } from '@/utils';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import SearchForm from '@/components/SearchForm';

import { loadDictionary } from '@/actions/dic';
import { getCourseplanList, auditCoursePlan } from '@/actions/course';

//操作按钮
import DropDownButton from '@/components/DropDownButton';

import CoursePlanView from '../CoursePlanAudit/view';

class CourseplanManage extends React.Component {

  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: env.defaultPageSize,
        itemId: '',
        courseplanBatchId: '',  //批次
        courseCategoryId: '',   //科目
        branchId: '',           //分部
        teachCenterId: '',
        status: '',
        isUniversityDate: '',
        courseplanName: '',
        intentTeacher: '',
        submitDateStart:'',
        submitDateEnd:''
      },
      data_list: [],
      totalRecord: 0,
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo','is_new_student']);
  }
  compoentDidMount() {
  }

  columns = [
    {
      title: '分部',  
      dataIndex: 'branchUniversityName',
      width:120,
      fixed:'left',
    },
    {
      title: '教学点',
      width:120,
      dataIndex: 'teachCenterName',
    },
    {
      title: '课程班名称',
      width:120,
      dataIndex: 'courseplanName',
    },
    {
      title: '课程班类型',
      width:120,
      dataIndex: 'teachClassTypeName',
    },
    {
      title: '预估考季',
      width:120,
      dataIndex: 'examBatchName',
    },
    {
      title: '科目',
      width:100,
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
      title: '教服试点',
      width:80,
      dataIndex: 'isPilot',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.dic_YesNo, record.isPilot);
      }
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
      width:120,
      dataIndex: 'startDate',
      render: (text, record, index) => {
        return timestampToTime(record.endDate);
      }
    },
    {
      title: '开课预估总人数(不含重修)',
      width:160,
      dataIndex: 'planStudentNum',
      render: (text, record) => {
        return <span>{record.planStudentNum}</span>
      }
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
      title: '创建人',
      width:100,
      dataIndex: 'createName',
    },
    {
      title: '手机',
      width:100,
      dataIndex: 'createNameMobile',
    },
    {
      title: '提交日期',
      dataIndex: 'submitDate',
      width:120,
      render: (text, record, index) => {
        return timestampToTime(record.submitDate);
      }
    }, 
    {
      title: '操作',
      width: 120,//可预知的数据长度，请设定固定宽度
      fixed: 'right',
      key: 'action',
      render: (text, record) => {
        return <DropDownButton>
          <Button onClick={() => { this.onLookView('searchView', record); }}>查看</Button>
        </DropDownButton>
      }
    }
  ];

  //检索数据
  fetch(params) {
    
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    condition.submitDateStart = formatMoment(condition.submitDateStart);
    condition.submitDateEnd = formatMoment(condition.submitDateEnd);
    this.props.getCourseplanList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        data.data = data.data || []
        data.data.map(a => {
          a.key = a.courseplanId;
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

  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {
      switch (this.state.editMode) {
        case 'Audit':
          //delete dataModel.parentOrgid;
          this.props.auditCoursePlan(dataModel).payload.promise.then((response) => {
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
      case 'searchView':
      case 'Audit':
        block_content = <CoursePlanView
          viewCallback={this.onViewCallback}
          {...this.state}
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
              isBranchAll={false}
              isTeachCenter={true}
              isCoursePlanAuditStatus={true}
              isYesNo={true}
              branchId={this.state.branchId}
              form_item_list={[
                { type: 'select', data: 'item', name: 'itemId', title: '项目', value: this.state.pagingSearch.itemId, is_all: false },
                { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', value: this.state.pagingSearch.courseplanBatchId, is_all: false },
                { type: 'select', data: 'course_category', name: 'courseCategoryId', title: '科目', value: this.state.pagingSearch.courseCategoryId, is_all: true },
                //{ type: 'select', data: 'branch', name: 'branchId', title: '分部', is_all: true },
                { type: 'org', name: 'branchId', title: '分部', value: this.state.pagingSearch.branchId, is_all: true },
                { type: 'select', data: 'teach_center', name: 'teachCenterId', title: '教学点', value: this.state.pagingSearch.teachCenterId, is_all: true },
                { type: 'select', data: 'courseplan_status', name: 'status', title: '状态', value: this.state.pagingSearch.status, is_all: true },
                // { type: 'select', data: 'dic_YesNo', name: 'isUniversityDate', title: '高校定日期', is_all: true },
                { type: 'input', name: 'courseplanName', value: this.state.pagingSearch.courseplanName, title: '课程班' },
                { type: 'input', name: 'intentTeacher', value: this.state.pagingSearch.intentTeacher, title: '意向讲师' },
                { type: 'select', data: 'dic_YesNo', name: 'isPilot', title: '教服试点', value: this.state.pagingSearch.isPilot, is_all: true },
                // { type: 'date', name: 'submitDateStart', title: '提交日期开始',placeholder:'提交日期开始' },
                // { type: 'date', name: 'submitDateEnd', title: '提交日期截止',placeholder:'提交日期截止' },
                { type: 'date', name: 'submitDateStart', title: '提交日期开始',placeholder:'开始日期', value: this.state.pagingSearch.submitDateStart },
                { type: 'date', name: 'submitDateEnd', title: '提交日期截止',placeholder:'结束日期', value: this.state.pagingSearch.submitDateEnd },
                { type: '' },
              ]}
              fetch2={(params) => this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                {
                  title: '导出', type: 'export',
                  url: '/edu/courseplan/exportCourseplanQuery'
                },
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
            />
            <div className="space-default"></div>
            <span style={{color:'red',display:'inline-block',marginBottom:'10px'}}>课时备注1小时/1课时</span>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{x:2400}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                  </Col>
                  <Col span={18} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(CourseplanManage);

const mapStateToProps = (state) => {
  //基本字典数据  
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getCourseplanList: bindActionCreators(getCourseplanList, dispatch),
    auditCoursePlan: bindActionCreators(auditCoursePlan, dispatch),

    loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
