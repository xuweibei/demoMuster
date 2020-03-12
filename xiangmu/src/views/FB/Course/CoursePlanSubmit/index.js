/*
开课计划 提交列表
2018-05-11
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
import { timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { loadBizDictionary } from '@/utils/componentExt';
import SearchForm from '@/components/SearchForm';

import { loadDictionary } from '@/actions/dic';
import { getCoursePlanSubmitList, submitCoursePlan } from '@/actions/course';

class CoursePlanSubmit extends React.Component {

  constructor() {
    super();
    (this: any).fetch2 = this.fetch2.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).onSubmitCoursePlan = this.onSubmitCoursePlan.bind(this);
    (this: any).onExportCoursePlan = this.onExportCoursePlan.bind(this);

    this.state = {
      editMode: '',
      pagingSearch: {
        itemId: '',
        courseplanBatchId: '',
        teachCenterId: '',
      },
      data_list: [],
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo']);
  }

  columns = [
    {
      title: '教学点',
      width:120,
      fixed:'left',
      dataIndex: 'teachCenterName',
    },
    {
      title: '课程班数',
      dataIndex: 'courseplanCount',
    },
    {
      title: '开课预估总人数（不含重修）',
      dataIndex: 'planStudentNum',
    },
    {
      title: '重修人数',
      dataIndex: 'restudyStudentNum'
    },
    {
      title: '已提交课程班数',
      dataIndex: 'submitCount'
    },
    {
      title: '未提交课程班数',
      dataIndex: 'unsubmitCount'
    },
    {
      title: '待审核计划数',
      dataIndex: 'pendingCount',
    },
    {
      title: '审核不通过计划数',
      dataIndex: 'nopassCount',
      width:120,
      fixed:'right',
    },
  ];

  //检索数据
  fetch2(params) {
    if (!params || !params.courseplanBatchId) {
      this.setState({
        data_list: []
      })
      return;
    }
    var condition = params || this.state.pagingSearch;
    this.setState({ loading: true, pagingSearch: condition });
    this.props.getCoursePlanSubmitList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        data.data.map(a => {
          //a.key = a.
        })
        this.setState({
          data_list: data.data,
          //totalRecord: data.totalRecord,
          loading: false
        })
      }
      else {
        this.setState({ loading: false, data_list: [] })
        message.error(data.message);
      }
    })
  }
  onSubmitCoursePlan() {
    var that = this;
    Modal.confirm({
      title: '是否提交这些开课计划?',
      content: '提交总部后将不再允许修改，您确定提交总部吗？',
      onOk: () => {
        this.props.submitCoursePlan(that.state.pagingSearch).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            this.fetch2();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
  onExportCoursePlan() {
    //window.open("http://192.168.0.212:8080/edu/courseplan/exportCourseplan?token=c648c380-91a6-420d-a07b-f6658413968d&itemId=1&courseplanBatchId=4e071b6b449d11e89e59f8bc129b92ad&teachCenterId=")
    //return;
    var that = this;
    var url = env.serverURL + "/edu/courseplan/exportCourseplan?token=" + env.getToken();
    for (var attr in this.state.pagingSearch) {
      url += "&" + attr + "=" + this.state.pagingSearch[attr];
    }

    openExport(url)
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:
        block_content = (
          <div>
            <SearchForm
              num_column={3}
              isItemUser={true}
              isCoursePlanBatch={true}
              isTeachCenter={true}
              form_item_list={[
                { type: 'select', data: 'item', name: 'itemId', title: '项目', is_all: false },
                { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', is_all: false },
                { type: 'select', data: 'teach_center', name: 'teachCenterId', title: '教学点', is_all: true },
              ]}
              fetch2={(params) => this.fetch2(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                { title: '提交', callback: () => this.onSubmitCoursePlan(),icon:'save',color:true },
                { title: '导出明细', callback: () => this.onExportCoursePlan(),icon:'export',color:true },
              ]}
            />
            <div className="space-default"></div>
            {
              this.state.data_list.length ?
                <div style={{ color: "ff0000" }}>项目{this.state.data_list[0].itemName}{this.state.data_list[0].courseplanBatchName}开课计划提交截止日期：{timestampToTime(this.state.data_list[0].courseBatchEndDate)}，请抓紧时间！</div>
                : <div></div>
            }
            <div style={{height:20}}></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                scroll={{x:1300}}
                bordered
              />
              <div className="space-default"></div>
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CoursePlanSubmit);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getCoursePlanSubmitList: bindActionCreators(getCoursePlanSubmitList, dispatch),
    submitCoursePlan: bindActionCreators(submitCoursePlan, dispatch),
    //exportCoursePlan: bindActionCreators(exportCoursePlan, dispatch),
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
