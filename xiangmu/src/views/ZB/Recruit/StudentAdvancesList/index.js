/*
学生预收款财务确认查询 列表
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, DatePicker
} from 'antd';
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectItem from '@/components/BizSelect/SelectItem';

//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

const Option = Select.Option;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind, formatMoment } from '@/utils';

import {
  studentPrepaymentList
} from '@/actions/finance';
import moment from 'moment';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class StudentAdvancesList extends React.Component {
  constructor() {
    super();
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    let timeArr = timestampToTime(new Date().getTime()).split('-');
    let startTimeYear = timeArr[1] == 1 ? (timeArr[0]-1) : timeArr[0];
    let startTimeMonth = timeArr[1] == 1 ? 12 : timeArr[1]-1;
    let startTimeDay = '01';
    let endTimeDay = '01';
    startTimeMonth = startTimeMonth < 10 ? startTimeMonth = '0'+startTimeMonth : startTimeMonth;
    endTimeDay = this.getCountDays(startTimeMonth);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        zbPayeeType: '', //公司
        branchId: '',//分部ID
        itemId: '',  //项目ID
        payeeType: '', //收费方
        payeeWay: '', //缴费方式
        type: '1', //类型 默认缴费
        confirmDateStart: startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
        confirmDateEnd: startTimeYear+'-'+startTimeMonth+'-'+endTimeDay
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      isPayFee: true,
      startValue: null,
      endValue: null,
      endOpen: false,
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'product_branch_price_status', 'producttype', 'dic_Allow', 'payee_type', 'pos_account_type', 'payment_way', 'fee_type']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    // this.onSearch();
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '签约公司',
      fixed: 'left',
      width: 150,
      dataIndex: 'zbPayeeTypeName',
      render: text => <span>{getDictionaryTitle(this.state.payee_type, text)}</span>
    },{
      title: '订单分部',
      dataIndex: 'branchName',
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      render: (text, record) => (
        <div>
            <a onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{record.studentName}</a>
        </div>
      ),
    },
    {
      title: '证件号',
      dataIndex: 'certificateNo',
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      render: (text, record) => (
        <div>
            <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderNo}</a>
        </div>
      ),
    },
    {
      title: '订单类型',
      dataIndex: 'orderTypeName',
    },
    {
      title: '项目',
      dataIndex: 'itemName', //自定义显示
    },
    {
      title: '类型',
      dataIndex: 'feeTypeName',
    },
    {
      title: '金额',
      dataIndex: 'money',
      render: (text, record, index) => (`${formatMoney(record.money)}`)
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
    },
    {
      title: '缴费方式',
      dataIndex: 'payWayName',
    },
    {
      title: '财务确认日期',
      dataIndex: 'confirmDate',
      render: (text, record, index) => (`${timestampToTime(record.confirmDate)}`)
    },
    {
      title: '确认人',
      dataIndex: 'financeUIdName',
      fixed: 'right',
      width: 120
    },
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.confirmDateStart = condition.confirmDateStart && condition.confirmDateStart.length ? condition.confirmDateStart : formatMoment(condition.confirmDateStart);//日期控件处理
    condition.confirmDateEnd = condition.confirmDateEnd && condition.confirmDateEnd.length ? condition.confirmDateEnd : formatMoment(condition.confirmDateEnd);//日期控件处理
    let abc = condition.confirmDateStart;
    if(Array.isArray(abc)){
      console.log(123)
      condition.confirmDateStart = formatMoment(abc[0])
      condition.confirmDateEnd = formatMoment(abc[1])
    }
    this.props.studentPrepaymentList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      console.log(data)
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }
  getCountDays = (month) => {
    var curDate = new Date();
    var curMonth = month;
    curDate.setMonth(curMonth);
    curDate.setDate(0);
    return curDate.getDate();
  }

  disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({ endOpen: true });
      }
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
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
  }
  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ViewStudentDetail':
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
      case 'ViewOrder':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          //isDirection={this.state.currentDataModel.orderType == 1 && this.state.currentDataModel.partnerClassType == 1}
          tab={3}
        />
        break;
      case 'Manage':
      default:
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/studentPrepayment/exportList'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'签约公司'} >
                        {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.pos_account_type.filter((a)=>a.title!='全部').filter((a)=>a.title!='大客户收费').filter((a)=>a.title!='共管账户').map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'类型'} >
                        {getFieldDecorator('type', { initialValue: this.state.pagingSearch.type })(
                          <Select 
                              onChange={(value) => {
                                if (value == 1) {
                                    this.setState({
                                        isPayFee: true
                                    })
                                } else {
                                    this.setState({
                                        isPayFee: false
                                    })
                                }
                            }}>
                            {this.state.fee_type.filter((a)=>a.title!='扣费').filter((a)=>a.title!='扣费返还').map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="分部" >
                        {getFieldDecorator('branchId', { initialValue: '' })(
                          <SelectFBOrg scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目">
                        {getFieldDecorator('itemId', {initialValue: ''})(
                          <SelectItem scope='my' hideAll={false}/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="财务确认日期">
                            {getFieldDecorator('confirmDateStart', { initialValue:[moment(this.state.pagingSearch.confirmDateStart, dateFormat), moment(this.state.pagingSearch.confirmDateEnd, dateFormat)]})(
                                <RangePicker
                                  style={{width:220}}
                                  defaultValue={[moment('2015-01-01', dateFormat), moment('2015-01-01', dateFormat)]}
                                  format={dateFormat}
                                />
                            )}
                        </FormItem>
                    </Col>
                    {
                      this.state.isPayFee ?
                      <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'收费方'} >
                          {getFieldDecorator('payeeType', { initialValue: '' })(
                            <Select>
                              <Option value="">全部</Option>
                              {this.state.payee_type.filter((a)=>a.title!='全部').map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                          )}
                        </FormItem>
                      </Col>
                      : ''
                    }
                    {
                      this.state.isPayFee ?
                      <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'缴费方式'} >
                          {getFieldDecorator('payeeWay', { initialValue: '' })(
                            <Select>
                              <Option value="">全部</Option>
                              {this.state.payment_way.filter((a)=>a.title!='全部').map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                          )}
                        </FormItem>
                      </Col>
                      : ''
                    }
                    
                  </Row>
                </Form>
              }
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                rowKey={record => record.productPriceId}//主键
                bordered
                scroll={{ x: 1300 }}
              //rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={10}>
                    <div className='flex-row'>

                    </div>
                  </Col>
                  <Col span={14} className={'search-paging-control'}>
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
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentAdvancesList);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    studentPrepaymentList: bindActionCreators(studentPrepaymentList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
