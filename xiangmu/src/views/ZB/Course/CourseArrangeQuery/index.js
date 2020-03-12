/*
课表查看
2018-10-11
zhujunying
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal,
} from 'antd';
const FormItem = Form.Item;
import {
  formatMoney, timestampToTime, getDictionaryTitle, openExport,
  formatNumberDateToChineseDate, formatMoment
} from '@/utils';
import { env } from '@/api/env';
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import FileDownloader from '@/components/FileDownloader';

import { loadDictionary } from '@/actions/dic';
import {
  courseArrangeListQuery2,
} from '@/actions/course';

import CourseArrangeCalendar from '../../../ZB/Course/CourseArrangeManage/calendar';

const btnformItemLayout = {
  wrapperCol: { span: 24 },
};

class CourseArrangeQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: '',
      pagingSearch: {
        pageSize: env.defaultPageSize,
        currentPage: 1,
        itemId: '',
        courseplanBatchId: '',
        courseCategoryId: '',
        branchId: props.usertype == 3 ? props.orgId : '',
        teachCenterId: '',
        courseArrangeName: '',
        teacher: '',
        dateStart: '',
        dateEnd: '',
        publishStatus: '',
      },
      data_list: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      isShowChangeDateModal: false,
      isShowChangeTeacherModal: false,
      courseDate: '',
    };
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo']);
  }

  columns = [
    {
      title: '分部',
      width: 150,
      fixed: 'left',
      dataIndex: 'branchUniversityName',
    },
    {
      title: '教学点',
      width: 120,
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
      dataIndex: 'timeQuantumStr2',
      render: (text, record) => {
        let a = '';
        let b ='';
        for (var i in record.timeQuantum) {
          var c = formatNumberDateToChineseDate(i);
          a += c;
          record.timeQuantum[i].map(_day => {
            a += _day + "、";
          })
          if (record.timeQuantum[i].length) {
            a = a.substr(0, a.length - 1);
          }
          a += "、";
          //_m.push(_date);
        }
        a = a.substr(0, a.length - 1);

        for (var i in record.timeQuantumUpdate) {
          var c = formatNumberDateToChineseDate(i);
          b += c;
          record.timeQuantumUpdate[i].map(_day => {
            b += _day + "、";
          })
          if (record.timeQuantumUpdate[i].length) {
            b = b.substr(0, b.length - 1);
          }
          b += "、";
          //_m.push(_date);
        }
        b = b.substr(0, b.length - 1);
        
        return  <div><div>{a}</div><div style={{ color: "ff0000" }}>{b}</div></div>
      }
    },
    {
      title: '课次',
      dataIndex: 'courseNum',
    },
    {
      title: '排课总课时',
      dataIndex: 'hour',
    },
    {
      title: '讲师',
      dataIndex: 'teacherName',
    },
    {
      title: '英文名',
      width:120,
      dataIndex: 'englishName',
    },
    {
      title: '发布情况',
      width: 120,
      fixed: 'right',
      dataIndex: 'publishStateName',
    },
  ];
  //检索数据
  fetch(params) {
    if (!params || !params.courseplanBatchId) {
      this.setState({
        data_list: []
      })
      return;
    }
    var condition = params || this.state.pagingSearch;
    // condition.publishStatus = condition.status;
    condition.dateStart = formatMoment(condition.dateStart);
    condition.dateEnd = formatMoment(condition.dateEnd);
    this.setState({ loading: true, pagingSearch: condition });
    this.props.courseArrangeListQuery2(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var list = []
        data.data = data.data || []
        data.data.map(item => {
          item.key = item.courseArrangeId;
          var _t = "";
          if (item.timeQuantumUpdate) {
            _t = item.timeQuantumUpdate;
            item.isUpdate = true;
          } else {
            _t = item.timeQuantum;
          }
          if (_t) {
            var _m = "";
            for (var i in _t) {
              var c = formatNumberDateToChineseDate(i);
              _m += c;
              _t[i].map(_day => {
                _m += _day + "、";
              })
              if (_t[i].length) {
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
    if (!dataModel) {
      if(this.state.pagingSearch.dateStart && !this.state.pagingSearch.dateEnd){
        this.state.pagingSearch.dateStart = "";
      }
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
      case 'Calendar':
        block_content = <CourseArrangeCalendar pagingSearch={this.state.pagingSearch}
          viewCallback={this.onViewCallback}
        />
        break;
      case 'Manage':
      default:
        const { getFieldDecorator } = this.props.form;

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
              branchId={this.state.branchId}
              isPublishState={true}
              form_item_list={[
                { type: 'select', data: 'item', name: 'itemId', title: '项目', value: this.state.pagingSearch.itemId, is_all: false },
                { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', value: this.state.pagingSearch.courseplanBatchId, is_all: false },
                { type: 'select', data: 'course_category', name: 'courseCategoryId', title: '科目', value: this.state.pagingSearch.courseCategoryId, is_all: true },
                { type: 'select', data: 'publish_state', name: 'publishStatus', title: '发布情况', value: this.state.pagingSearch.publishStatus, is_all: true },
                { type: 'org', name: 'branchId', title: '分部', value: this.state.pagingSearch.branchId, is_all: true },
                { type: 'select', data: 'teach_center', name: 'teachCenterId', title: '教学点', value: this.state.pagingSearch.teachCenterId, is_all: true },
                { type: 'input', name: 'teacher', title: '讲师', value: this.state.pagingSearch.teacher },
                { type: 'date', name: 'dateStart', title: '上课开始日期',placeholder:'开始日期', value: this.state.pagingSearch.dateStart },
                { type: 'date', name: 'dateEnd', title: '上课截止日期',placeholder:'结束日期', value: this.state.pagingSearch.dateEnd },
                { type: '' },
              ]}
              fetch2={(params) => this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                { icon:'calendar',
                  title: '按日历显示', needConditionBack: true, callback: (params) => {
                    this.setState({
                      pagingSearch: params
                    })
                    this.onLookView('Calendar')
                  }
                }
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
              // isNeedSelectName={true}
              // pagingSearchCallback={(params) => this.setState({ pagingSearch: params })}
            />
            <div className="space-default"></div>
            {
              this.state.data_list.length ?
                <div style={{ color: "ff0000" }}>说明：红色上课日期为调整后日期。</div>
                : <div></div>
            }
            <div style={{height:20}}></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <Row>
                <FileDownloader
                  apiUrl={'/edu/courseArrangeCheck/exportExcel'}//api下载地址
                  method={'post'}//提交方式
                  options={this.state.pagingSearch}//提交参数
                  title={'导出课表明细'}
                />
                <Col span={24} className={'search-paging-control'}>
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
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseArrangeQuery);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { orgId, usertype } = state.auth.currentUser.userType;
  return { Dictionarys, orgId, usertype };
};

function mapDispatchToProps(dispatch) {
  return {
    courseArrangeListQuery2: bindActionCreators(courseArrangeListQuery2, dispatch),
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
