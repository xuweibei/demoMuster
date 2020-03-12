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
import SelectArea from '@/components/BizSelect/SelectArea';
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
  OrderPaymentFeeRefundPipelineQuery
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
        endDate: '',  
        startDate: '', 
        branchId: '',   
        regionId: '',  
        zbPayeeType: '',  
        payeeType: '',  
        feeProperty:'',
        payWay:'',
        studentName:'',
        orderSn:'',
        mobile:'',
        feeType:''

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
  componentDidMount(){ 
  }
  componentWillUnMount() {
  } 

  columns = [
    {
      title: '分部',
      fixed: 'left',
      width: 150,
      dataIndex: 'branchName', 
    }, 
    {
      title: '学生姓名',
      dataIndex: 'realName',
      render: (text, record) => (
        <div>
            <a onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{record.realName}</a>
        </div>
      ),
    }, 
    {
      title: '订单号',
      dataIndex: 'orderSn',
      render: (text, record) => (
        <div>
            <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
        </div>
      ),
    },
    {
      title: '订单金额(￥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '费用创建日期',
      dataIndex: 'feeCreateDate', //自定义显示
    },
    {
      title: '收费方',
      dataIndex: 'payeeTypeStr',
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeTypeStr', 
    },
    {
      title: '费用流水类型',
      dataIndex: 'feeType',
    },
    {
      title: '费用流水金额(￥)',
      dataIndex: 'money',
    },
    {
      title: '费用属性',
      dataIndex: 'feePropertyStr', 
    },
    {
      title: '支付方式',
      dataIndex: 'payWayStr',
      fixed: 'right',
      width: 120
    },
  ];
  
  FBcolumns = [
    {
      title: '订单区域',
      fixed: 'left',
      width: 150,
      dataIndex: 'regionName', 
    }, 
    {
      title: '学生姓名',
      dataIndex: 'realName',
      render: (text, record) => (
        <div>
            <a onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{record.realName}</a>
        </div>
      ),
    }, 
    {
      title: '订单号',
      dataIndex: 'orderSn',
      render: (text, record) => (
        <div>
            <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
        </div>
      ),
    },
    {
      title: '订单金额(￥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '费用创建日期',
      dataIndex: 'feeCreateDate', //自定义显示
    },
    {
      title: '收费方',
      dataIndex: 'payeeTypeStr',
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeTypeStr', 
    },
    {
      title: '费用流水类型',
      dataIndex: 'feeType',
    },
    {
      title: '费用流水金额(￥)',
      dataIndex: 'money',
    },
    {
      title: '费用属性',
      dataIndex: 'feePropertyStr', 
    },
    {
      title: '支付方式',
      dataIndex: 'payWayStr',
      fixed: 'right',
      width: 120
    },
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let abc = condition.startDate;
    if(Array.isArray(abc)){ 
      condition.startDate = formatMoment(abc[0])
      condition.endDate = formatMoment(abc[1])
    }
    this.props.OrderPaymentFeeRefundPipelineQuery(condition).payload.promise.then((response) => {
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
  typeChange = (value) =>{
    let { payment_way,pagingSearch } = this.state;
    pagingSearch.payWay = ''
    this.props.form.resetFields('payWay','')
    this.state.payment_way.forEach(item=>{ 
        item.disabled = false 
    })
    if(value == 2){
      this.state.payment_way.forEach(item=>{
        if(item.value !== '5'){
          item.disabled = true
        }
      })
    }
    // else if(value == 1) { 
    //   this.state.payment_way.forEach(item=>{
    //     if(item.value == '3'){
    //       item.disabled = true
    //     }
    //   })
    // }
    this.setState({
      payment_way, 
      pagingSearch
    })
  }
  feePropertyChange = (value) => { 
    let { payment_way,pagingSearch } = this.state;
    pagingSearch.payWay = ''
    this.props.form.resetFields('payWay','')
    this.state.payment_way.forEach(item=>{ 
        item.disabled = false 
    })
    if(value == 2){
      this.state.payment_way.forEach(item=>{
        if(item.value !== '5'){
          item.disabled = true
        }
      })
    }else if(value == 1) { 
      this.state.payment_way.forEach(item=>{
        if(item.value == '5'){
          item.disabled = true
        }
      })
    }
    this.setState({
      payment_way,
      pagingSearch
    })
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
          apiUrl={'/edu/studentFeeRecord/exportStudentFeeRecordList'}//api下载地址
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
                  {
                    this.props.currentUser.userType.usertype == 1 && 
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'所属分部'} >
                            {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                                <SelectFBOrg scope={'my'} hideAll={false} />

                            )}
                        </FormItem>
                    </Col>
                  }
                  {
                    this.props.currentUser.userType.usertype == 3 && 
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="订单区域">
                            {getFieldDecorator('regionId', {
                                initialValue: '',
                            })(
                                <SelectArea scope={'my'} hideAll={false} />
                                )}
                        </FormItem>
                    </Col>
                  }
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'收费方'} >
                        {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.payee_type.filter((a)=>a.title!='全部').map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'签约公司'} >
                        {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                          <Select>
                            <Option value=''>全部</Option> 
                            <Option value='1'>中博教育</Option> 
                            <Option value='2'>中博诚通</Option> 
                          </Select>
                        )}
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'费用属性'} >
                        {getFieldDecorator('feeProperty', { initialValue: this.state.pagingSearch.feeProperty })(
                          <Select
                            onChange={(data)=>this.feePropertyChange(data)}
                          >
                            <Option value=''>全部</Option> 
                            <Option value='1'>真实</Option> 
                            <Option value='2'>虚拟</Option> 
                          </Select>
                        )}
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'费用流水类型'} >
                        {getFieldDecorator('feeType', { initialValue: this.state.pagingSearch.feeType })(
                          <Select 
                            onChange={(data)=>this.typeChange(data)}
                          >
                            <Option value=''>全部</Option> 
                            <Option value='1'>缴费</Option> 
                            <Option value='2'>退费</Option> 
                          </Select>
                        )}
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'支付方式'} >
                        {getFieldDecorator('payWay', { initialValue: this.state.pagingSearch.payWay })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.payment_way.filter((a)=>a.title!='全部').map((item, index) => { 
                              return <Option disabled={item.disabled} value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="费用创建日期">
                            {getFieldDecorator('startDate', { initialValue:this.state.pagingSearch.startDate ?[moment(this.state.pagingSearch.startDate, dateFormat), moment(this.state.pagingSearch.endDate, dateFormat)]:''})(
                                <RangePicker
                                  style={{width:220}} 
                                  format={dateFormat}
                                />
                            )}
                        </FormItem>
                    </Col>   
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })( 
                            <Input placeholder='请输入学生姓名'/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单号'} >
                        {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                            <Input placeholder='请输入订单号'/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'手机号'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                            <Input placeholder='请输入手机号'/>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.props.currentUser.userType.usertype == 1 ? this.columns : this.FBcolumns} //列定义
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
                      defaultPageSize={this.state.pagingSearch.pageSize}      
                      pageSizeOptions = {['10','20','30','50','100','200']}
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
  let { currentUser } = state.auth;

  return { Dictionarys,currentUser };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    OrderPaymentFeeRefundPipelineQuery: bindActionCreators(OrderPaymentFeeRefundPipelineQuery, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
