/*
分部 学生课表管理 冲突查询
2018-05-24
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider
} from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { studentCourseArrangeConflictQuery } from '@/actions/course';
import FileDownloader from '@/components/FileDownloader';

class StudentCourseArrangeConflict extends React.Component {
  state = {
    editMode: '',
    data_list: [],
    totalRecord: 0,
    loading: false,
    pagingSearch: {
      pageSize: env.defaultPageSize,
      currentPage: 1,
      itemId: '',
      courseplanBatchId: '',
    }
  };
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo', 'teach_class_type']);
  }

  onExport() {
    //window.open("http://192.168.0.212:8080/edu/courseplan/exportCourseplan?token=c648c380-91a6-420d-a07b-f6658413968d&itemId=1&courseplanBatchId=4e071b6b449d11e89e59f8bc129b92ad&teachCenterId=")
    //return;
    var that = this;
    var url = env.serverURL + "/edu/courseArrangeStudent/exportStudentConflictList?token=" + env.getToken();
    for (var attr in this.state.pagingSearch) {
      url += "&" + attr + "=" + this.state.pagingSearch[attr];
    }

    openExport(url)
  }

  columns = [
    {
      title: '学号',
      dataIndex: 'studentNo',
      width: 120,
      fixed: 'left',
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '上课日期',
      dataIndex: 'courseDate',
      render: text => <span>{timestampToTime(text)}</span>
    },
    {
      title: '上课时段',
      //dataIndex: 'timeQuantumStr'
      dataIndex: 'classTime'
    },
    {
      title: '教学点',
      dataIndex: 'teachCenterName',
    },
    {
      title: '课程班名称',
      dataIndex: 'courseplanName',
    },
    {
      title: '课程班类型',
      dataIndex: 'teachClassType',
      render: (value) => <span>{getDictionaryTitle(this.state.teach_class_type, value)}</span>
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName',
    },
    {
      title: '课时',
      dataIndex: 'classHour'
    },
    {
      title: '班型备注',
      dataIndex: 'classTypeRemark',
    },
    {
      title: '阶段备注',
      dataIndex: 'periodRemark',
    },
    {
      title: '授课科目备注',
      dataIndex: 'courseRemark',
      width: 120,
      fixed: 'right',
    },
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.studentCourseArrangeConflictQuery(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          data_list: data.data.listResult,
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
  render() {
    let block_content = <div></div>
    block_content = (
      <div>
        <SearchForm
          num_column={2}
          isItemUser={true}
          isCoursePlanBatch={true}
          form_item_list={[
            { type: 'select', data: 'item', name: 'itemId', title: '项目', is_all: false },
            { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', is_all: false },
          ]}
          fetch2={(params) => this.fetch(params)}
          pagingSearch={this.state.pagingSearch}
          //isNeedSelectName={true}
          //pagingSearchCallback={(params)=>this.setState({pagingSearch:params})}
          extendButtons={[
            //{ title: '导出', type: 'export', needConditionBack: true, callback: () => this.onExport() },
            {title: '导出', type: 'export', url: '/edu/courseArrangeStudent/exportStudentConflictList', method: 'get'}
          ]}

        />
        <div className="space-default"></div>
        <div className="search-result-list">
          <Table columns={this.columns} //列定义
            loading={this.state.loading}
            pagination={false}
            dataSource={this.state.data_list}//数据
            bordered
            scroll={{ x: 1300 }}
          />
          <div className="space-default"></div>
        </div>
        <div className="dv_split">
        </div>
      </div>
    )
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentCourseArrangeConflict);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    studentCourseArrangeConflictQuery: bindActionCreators(studentCourseArrangeConflictQuery, dispatch),
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
