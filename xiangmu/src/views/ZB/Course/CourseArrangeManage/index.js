/*
课表明细管理
2018-05-16
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
import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { env } from '@/api/env';
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
import { loadDictionary } from '@/actions/dic';
import {
  courseArrangeDetailListQuery, courseArrangeDetailDelete, courseArrangeDetailUpdate,
  courseArrangeDateBatchUpdate, courseArrangeTeacherBatchUpdate
} from '@/actions/course';

import Conflict from './conflict';
import CourseArrangeCalendar from './calendar';
import CourseArrangeDetailEdit from './view';

const btnformItemLayout = {
  wrapperCol: { span: 24 },
};

class CourseArrangeManage extends React.Component {
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
      dateStart: '',
      dateEnd: '',
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
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).onExport = this.onExport.bind(this);
    (this: any).onDelete = this.onDelete.bind(this);
    (this: any).onShowChangeDate = this.onShowChangeDate.bind(this);
    (this: any).onShowChangeTeacher = this.onShowChangeTeacher.bind(this);
    (this: any).onBatchChangeDate = this.onBatchChangeDate.bind(this);
    (this: any).onBatchChangeTeacher = this.onBatchChangeTeacher.bind(this);
    (this: any).onHideModal = this.onHideModal.bind(this);
    (this: any).onHourChange = this.onHourChange.bind(this);
    (this: any).onDateChange = this.onDateChange.bind(this);
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo']);
  }

  onExport = () => {
    if (!this.state.UserSelecteds.length) {
      message.error("没有数据可导出");
      return;
    }
    var that = this;
    var url = env.serverURL + "/edu/courseArrangeDetail/listExport?token=" + env.getToken();
    url += "&courseArrangeIds=";
    url += this.state.UserSelecteds.join(',');
    openExport(url)
  }
  onDelete = () => {
    if (!this.state.UserSelecteds.length) {
      return;
    }
    Modal.confirm({
      title: '是否删除所选课表?',
      content: '点击确认删除所选课表!否则点击取消！',
      onOk: () => {
        this.props.courseArrangeDetailDelete(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
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
  onShowChangeDate() {
    if (!this.state.UserSelecteds.length) {
      return;
    }
    this.setState({
      isShowChangeDateModal: true
    });
  }
  onShowChangeTeacher() {
    if (!this.state.UserSelecteds.length) {
      return;
    }
    this.setState({
      isShowChangeTeacherModal: true
    });
  }
  onHideModal() {
    this.setState({
      isShowChangeDateModal: false,
      isShowChangeTeacherModal: false
    })
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
    switch(value){
        case 1:
          timeQuantum = "09:00-18:00";
          break;
        case 2:
          timeQuantum = "09:00-13:00";
          break;
        case 3:
          timeQuantum = "14:00-18:00";
          break;
        case 4:
          timeQuantum = "18:00-21:30";
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

  columns = [
    {
      title: '分部',
      width:120,
      fixed:'left',
      dataIndex: 'branchUniversityName',
    },
    {
      title: '教学点',
      width:180,
      dataIndex: 'teachCentername'
    },
    {
      title: '课程班',
      dataIndex: 'courseClassName'
    },
    {
      title: '课程班类型',
      width:120,
      dataIndex: 'teachClassTypeName'
    },
    {
      title: '科目',
      width:110,
      dataIndex: 'courseCategoryName',
    },
    {
      title: '上课日期',
      width:100,
      dataIndex: 'courseDate',
      render: text => <span>{timestampToTime(text)}</span>
    },
    {
      title: '上课时段',
      width:100,
      dataIndex: 'timeQuantum',
    },
    {
      title: '课时',
      width:50,
      dataIndex: 'hour',
    },
    {
      title: '讲师',
      width:120,
      dataIndex: 'teacherName',
    },
    {
      title: '英文名',
      width:120,
      dataIndex: 'englishName',
    },
    {
      title: '确认情况',
      width:80,
      dataIndex: 'statusName',
    },
    {
      title: '班型备注',
      dataIndex: 'classTypeRemark',
    },
    {
      title: '课程阶段',
      dataIndex: 'periodRemark',
    },
    {
      title: '授课科目备注',
      dataIndex: 'courseRemark',
    },
    {
      title: '操作',
      key: 'action',
      width:120,
      fixed:'right',
      render: (text, record) => {
        return <DropDownButton>
          { record.chek && <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>}
        </DropDownButton>
      },
    }
  ];
  //检索数据
  fetch(params) {
    if (!params || !params.itemId || !params.courseplanBatchId) {
      this.setState({
        data_list: []
      })
      return;
    }
    var condition = params || this.state.pagingSearch;
    this.setState({ loading: true, pagingSearch: condition });
    this.props.courseArrangeDetailListQuery(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var list = []
        data.data = data.data || []
        data.data.map(item => {
          item.key = item.courseArrangeDetailId;
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
      case 'Edit':
        block_content = <CourseArrangeDetailEdit
          id={this.state.currentDataModel.courseArrangeDetailId}
          editMode={this.state.editMode}
          viewCallback={this.onViewCallback}
        />
        break;
      case 'Conflict':
        block_content = <Conflict {...this.state}
          viewCallback={this.onViewCallback}
        />
        break;
      case 'Calendar':
        block_content = <CourseArrangeCalendar {...this.state}
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
            disabled: record.chek ? false : true,
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
              isBranchAll={false}
              isTeachCenter={true}
              isYesNo={true}
              isCourseArrangeStatus={true}
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
                { type: 'date', name: 'dateStart', title: '开始日期',placeholder:'开始日期', value: this.state.pagingSearch.dateStart },
                { type: 'date', name: 'dateEnd', title: '截止日期',placeholder:'结束日期', value: this.state.pagingSearch.dateEnd },
                { type: '' },
              ]}
              fetch2={(params) => this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                {
                  title: '冲突查询', needConditionBack: true, icon: 'search', callback: (params) => {
                    this.setState({
                      pagingSearch: params
                    })
                    this.onLookView('Conflict');
                  }
                },
                {
                  title: '按日历显示', needConditionBack: true, icon:'calendar', callback: (params) => {
                    this.setState({
                      pagingSearch: params
                    })
                    this.onLookView('Calendar')
                  }
                },
              ]}
              isNeedSelectName={true}
              pagingSearchCallback={(params) => this.setState({ pagingSearch: params })}
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
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                rowSelection={rowSelection}
                scroll={{x:1800}}
              />
              <div className="space-default"></div>
              <Row type='flex' >
                {
                  this.state.UserSelecteds.length ?
                  <Button loading={this.state.loading} icon="delete" onClick={this.onDelete}>删除课表</Button>
                  :
                  <Button icon="delete" disabled>删除课表</Button>
                }
                <div className='split_button'></div>
                
                <FileDownloader
                  apiUrl={'/edu/courseArrangeCheck/exportExcel'}//api下载地址
                  method={'post'}//提交方式
                  options={this.state.pagingSearch}//提交参数
                  title={'导出课表'}
                  type={'export'}
                />
                  
                <div className='split_button'></div>
                {
                  this.state.UserSelecteds.length ?
                  <Button loading={this.state.loading} icon="edit" onClick={this.onShowChangeDate}>批量修改上课时间</Button>
                  :
                  <Button icon="edit" disabled>批量修改上课时间</Button>
                }
                <div className='split_button'></div>
                {
                  this.state.UserSelecteds.length ?
                  <Button loading={this.state.loading} icon="edit" onClick={this.onShowChangeTeacher}>批量修改讲师</Button>
                  :
                  <Button icon="edit" disabled>批量修改讲师</Button>
                }
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
            {
              this.state.isShowChangeDateModal &&
              <Modal
                title="是否批量修改上课日期?"
                visible={this.state.isShowChangeDateModal}
                //onOk={this.onChangeDate}
                onCancel={this.onHideModal}
                //okText="确认"
                //cancelText="取消"
                footer={null}
              >
                <Form>
                  <Row gutter={24}>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout} label="上课日期">
                        {this.state.courseDate ?
                          <DatePicker
                            value={moment(this.state.courseDate, dateFormat)}
                            format={dateFormat}
                            placeholder='开始日期'
                            onChange={this.onDateChange}
                          />
                          :
                          <DatePicker
                            value={this.state.courseDate}
                            format={dateFormat}
                              placeholder='结束日期'
                            onChange={this.onDateChange}
                          />
                        }

                      </FormItem>
                    </Col>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout} label="上课时段标准">
                        <Select defaultValue={0} onChange={this.onHourChange}>
                          <Option value={0}>请选择</Option>
                          <Option value={1}>全天</Option>
                          <Option value={2}>上午</Option>
                          <Option value={3}>下午</Option>
                          <Option value={4}>晚上</Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout} label="上课时段">
                        {getFieldDecorator('timeQuantum', {
                          initialValue: this.state.timeQuantum,
                          rules: [{ required: true, message: '请输入上课时段!' }],
                        })(
                          <Input placeholder="请输入课时" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={24}>
                      <FormItem className='btnControl' {...btnformItemLayout}>
                        <Button type="primary" icon="save" onClick={this.onBatchChangeDate}>确定</Button>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Modal>
            }
            {
              this.state.isShowChangeTeacherModal &&
              <Modal
                title="是否批量修改讲师?"
                visible={this.state.isShowChangeTeacherModal}
                //onOk={this.onChangeTeacher}
                onCancel={this.onHideModal}
                //okText="确认"
                //cancelText="取消"
                footer={null}
              >
                <Form>
                  <Row gutter={24}>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout} label="讲师">
                        {getFieldDecorator('teacher', {
                          initialValue: [],
                          rules: [{ required: true, message: '请选择讲师!' }],
                        })(
                          <EditableUserTagGroup maxTags={1} userType={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={24}>
                      <FormItem className='btnControl' {...btnformItemLayout}>
                        <Button type="primary" icon="save" onClick={this.onBatchChangeTeacher}>确定</Button>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Modal>
            }
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseArrangeManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    courseArrangeDetailListQuery: bindActionCreators(courseArrangeDetailListQuery, dispatch),
    courseArrangeDetailDelete: bindActionCreators(courseArrangeDetailDelete, dispatch),
    courseArrangeDetailUpdate: bindActionCreators(courseArrangeDetailUpdate, dispatch),
    courseArrangeDateBatchUpdate: bindActionCreators(courseArrangeDateBatchUpdate, dispatch),
    courseArrangeTeacherBatchUpdate: bindActionCreators(courseArrangeTeacherBatchUpdate, dispatch),

    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
