/*
网课订单及激活统计表
*/

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import { env } from '@/api/env';
const FormItem = Form.Item;
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { formatMoment,timestampToTime } from '@/utils';
import { loadDictionary } from '@/actions/dic';
//getStudentAskBenefitList
import { OnlineActivationList } from '@/actions/course';
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import DetailView from './DetailView';
import AddCur from './addCur';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  constructor() {
    super();
    let timeArrSatrt = timestampToTime(new Date().getTime()-604800000).split('-');
    console.log(timeArrSatrt)
    let timeArr = timestampToTime(new Date().getTime()).split('-');
    let startTimeYear = timeArr[0];
    let startTimeMonth = timeArr[1];
    let startTimeDay = timeArr[2];
    let endTimeYear = timeArrSatrt[0];
    let endTimeMonth = timeArrSatrt[1];
    let endTimeDay = timeArrSatrt[2];
    this.state = {
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        // itemId:'',
        startDate:endTimeYear+'-'+endTimeMonth+'-'+endTimeDay,
        endDate:startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
      }, 
      data: [],
      totalRecord: 0,
      loading: false,
    };
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount");
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount","student_course_apply_audit_status");
  }
  
  columns = [
    
    {
      title: '项目',
      fixed: 'left',
      width:100,
      dataIndex: 'itemName',
    },
    {
      title: '新增网课订单',
      width:160,
      dataIndex: 'earlyPaidOrders',
    },
    {
      title: '订单总数',
      width:160,
      dataIndex: 'allPaidOrders',
    },
    {
      title: '新增激活课表',
      width:160,
      dataIndex: 'activeCourses',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('addCur',record)
        }}>{record.activeCourses}</a>;
      }
    },
    {
      title: '新增激活网络直播课程',
      width:200,
      dataIndex: 'liveActiveCourses',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('webCast',record)
        }}>{record.liveActiveCourses}</a>;
      }
    },
    {
      title: '在学网络直播课程数',
      width:200,
      dataIndex: 'normalLiveActiveCourses',
    },
    {
      title: '新增激活学员',
      width:160,
      dataIndex: 'firstActiveStudents',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('Newly',record)
        }}>{record.firstActiveStudents}</a>;
      }
    },
    {
      title: '激活在学课程总数',
      width:160,
      dataIndex: 'normalInternetActiveCourses',
    },
    {
      title: '激活在学U+学员数',
      width:160,
      dataIndex: 'rerepairStudents',
    },
    {
      title: '激活在学标准课学员数',
      width:200,
      dataIndex: 'unrepairStudents',
    },
    {
      title: '激活在学学生总数',
      width:160,
      dataIndex:'normalStudents',
      fixed: 'right',
    }


  ];
  //检索数据

  fetch = (params = {}) => {
    var condition = params || this.state.pagingSearch;
    let startDateArr = condition.startDate;
    if(Array.isArray(startDateArr)){
      condition.startDate = formatMoment(startDateArr[0]);
      condition.endDate = formatMoment(startDateArr[1]);
    }
    
    if(!condition.startDate || !condition.endDate ){
      message.warning('请选择对应时间进行查找')
      return 
    }
    this.setState({ loading: true });
    this.props.OnlineActivationList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false })
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Newly':
        block_content = <DetailView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
       break;
      case 'webCast':
      case 'addCur':
        block_content = <AddCur
          viewCallback={this.onViewCallback}
          {...this.state}
        />
      break;
      case 'Manage':
      default:
      let extendButtons = [];
      extendButtons.push(<FileDownloader
        apiUrl={'/edu/statistics/export'}//api下载地址
        method={'post'}//提交方式
        options={this.state.pagingSearch}//提交参数
        title={'导出'}
      >
      </FileDownloader>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={2}> </Col>
                    <Col span={22}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="时间">
                            {getFieldDecorator('startDate', { initialValue:[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]})(
                                <RangePicker
                                format={dateFormat}
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                                // disabledDate={this.disabledBeginDate}
                                style={{width:200}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={'studentCourseApplyId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{x:1800}}
              />
              <div className="space-default"></div>
              {/* <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={14} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div> */}
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentInviteManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    OnlineActivationList: bindActionCreators(OnlineActivationList, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
