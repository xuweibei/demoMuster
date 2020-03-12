/*
教学点学生查询
*/
//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row,DatePicker, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime,formatMoment } from '@/utils';

//业务接口方法引入
//import { getCourseArrangeList, updateFinishStatus } from '@/actions/base';
import { OrderPOSList } from '@/actions/recruit';
import { getTeachCenterByBranchId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import FileDownloader from '@/components/FileDownloader';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

import ListView from './list'
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';


class TeachingStudentQuery  extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10, 
        orderSn: '',
        studentName: '',
        createDateStart:''
      },
      data: [],
      totalRecord: 0,
      loading: false,

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','order_status','teachmode', 'study_status','order_type','payee_type']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    // this.onSearch();
  }
  componentWillUnMount() {
  }


  //table 输出列定义
  columns = [
    {
        title: '订单号',
        dataIndex: 'orderSn',
        width:'180',
        fixed:'left',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
      title: '订单类型', 
      dataIndex: 'orderType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
    },
    {
      title: '班型', 
      dataIndex: 'classTypeStr', 
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '手机号', 
      dataIndex: 'mobile'
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '已缴金额(¥)', 
      dataIndex: 'paidAmount',
    },
    {
      title: '当期欠缴金额(¥)', 
      dataIndex: 'currentAmount', 
    },
    {
      title: '已缴定金(¥)', 
      dataIndex: 'paidTempAmount',
    },
    {
      title: '订单状态', 
      dataIndex: 'orderStatus',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.order_status,record.orderStatus)
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => {
        return <Button onClick={() => { this.onLookView('View', record); }}>订金</Button>
      },
    }];


  //检索数据
  fetch = (params = {}) => {
    var condition = params || this.state.pagingSearch;
    let createDate = condition.createDateStart;
    if(!condition.orderSn && !condition.studentName ) return message.warning('订单号和学生姓名至少输入一个查询条件！')
    this.setState({ loading: true });
    if(Array.isArray(createDate)){
      condition.createDateStart = formatMoment(createDate[0])
      condition.createDateEnd = formatMoment(createDate[1])
    } 
    this.props.OrderPOSList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          data: data.data,
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
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case "Student":
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Create":
        case "Edit": //提交
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Import":
          this.onSearch();
          this.onLookView("Manage", null);
          //提交
          break;
          default: 
          this.onSearch();
          this.onLookView("Manage", null);

      }
    }
  }


  //渲染，根据模式不同控制不同输出
  render() {

    const { getFieldDecorator } = this.props.form;

    let block_content = <div></div>
    switch (this.state.editMode) {

      case 'ViewStudentDetail':
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
      case "View":
        block_content = <ListView viewCallback={this.onViewCallback}
             {...this.state}
        />
        break;
      case 'ViewOrderDetail':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
            studentId={this.state.currentDataModel.studentId}
            orderId={this.state.currentDataModel.orderId}
            tab={3}
        />
        break;
      case "Delete":
      case "Manage":
      default:
        //除查询外，其他扩展按钮数组 
        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
                 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单号"
                  >
                    {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                      <Input placeholder='请输入订单号'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="学生姓名"
                  >
                    {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                      <Input placeholder='请输入学生姓名'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem  
                   {...searchFormItemLayout}
                    label="订单创建日期">
                    {getFieldDecorator('createDateStart', { initialValue:this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[]})(
                            <RangePicker
                            disabledDate={this.disabledStartDate}
                            format={dateFormat}
                            onChange={this.onStartChange}
                            onOpenChange={this.handleStartOpenChange}
                            style={{width:220}}  
                            />
                        )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 1600 }}
            />
            <div className="space-default"></div>
            {/* <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={24} className='search-paging-control'>
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
        </div>);
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(TeachingStudentQuery);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    OrderPOSList: bindActionCreators(OrderPOSList, dispatch),
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
