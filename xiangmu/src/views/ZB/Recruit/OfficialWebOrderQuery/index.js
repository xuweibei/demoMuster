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
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import SelectPaymentWay from '@/components/BizSelect/SelectPaymentWay'
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';

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
import moment from 'moment';
import NumericInput from '@/components/NumericInput';

import {
  queryOrderListByWebsite,
} from '@/actions/recruit';

const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const searchFormItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
}
class OfficialWebOrderQuery extends React.Component {
  constructor(props) {
    super(props);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    const {auth} = this.props;
    var currentUser = auth.currentUser;
 
    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        itemId: '', 
        branchId: '',//分部ID
        recruitBatchId: '',
        startDate: '',
        endDate: '',
        orderStatus: '',
        delFlag: '0',
        userName:'',
        payWay: '',
        paymentWay:'',
        sonPaymentWay: ''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      startValue: null,
      endValue: null,
      endOpen: false,
      isShowDelete: false,
      studentOtherPayId: ''
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['order_status']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    // this.onSearch();
    
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '订单分部',
      width: 120,
      fixed: 'left',
      dataIndex: 'branchName',
    },
    {
      title: '招生季',
      width: 120, 
      dataIndex: 'recruitBatchName',
    },
    {
      title: '项目',
      dataIndex: 'itemNames',
    },
    {
      title: '订单号',
      width: 200,
      dataIndex: 'orderSn',
    },
    {
      title: '用户名',
      width: 120,
      dataIndex: 'loginName',
    },
    {
      title: '学生姓名',
      width: 120,
      dataIndex: 'studentName',
    },
    {
      title: '手机号',
      width: 120,
      dataIndex: 'mobile',
    },
    {
      title: '班型',
      width: 120,
      dataIndex: 'classTypeName',
    },
    {
      title: '订单标准金额(¥)',
      width: 140,
      dataIndex: 'initAmount',
      render: (text, record, index) => (`${formatMoney(record.initAmount)}`)
    },
    {
      title: '优惠金额(¥)',
      width: 140,
      dataIndex: 'distcountAmount',
      render: (text, record, index) => (`${formatMoney(record.distcountAmount)}`)
    },
    {
      title: '实际金额(¥)',
      width: 140,
      dataIndex: 'totalAmount',
      render: (text, record, index) => (`${formatMoney(record.totalAmount)}`)
    },
    {
      title: '已缴金额(¥)',
      width: 140,
      dataIndex: 'paidAmount',
      render: (text, record, index) => (`${formatMoney(record.paidAmount)}`)
    },

    {
      title: '创建日期',
      width: 120,
      dataIndex: 'createDate',
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    },
    {
      title: '缴费日期',
      width: 120,
      dataIndex: 'paidDate', //自定义显示
      render: (text, record, index) => (`${timestampToTime(record.paidDate)}`)
    },
    {
      title: '缴费方式',
      width: 100,
      dataIndex: 'payWayName',
    },
    {
      title: '支付流水号',
      dataIndex: 'otherPayNo',
      width: 200
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      render: (text, record, index) => (
        <Button onClick={() => { this.onLookView('ViewOrder', record); }}>查看</Button>
      )
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let startDate = condition.startDate;
    let startPayDate = condition.startPayDate;
    if(startDate){
      condition.startDate = startDate[0] ? formatMoment(startDate[0])+' 00:00:00':'';
      condition.endDate = startDate[1] ? formatMoment(startDate[1])+' 23:59:59':'';
    }
    if(startPayDate){
      condition.startPayDate = startPayDate[0] ? formatMoment(startPayDate[0])+' 00:00:00':'';
      condition.endPayDate = startPayDate[1] ? formatMoment(startPayDate[1])+' 23:59:59':'';
    }

    this.props.queryOrderListByWebsite(condition).payload.promise.then((response) => {
      let data = response.payload.data;
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

  //缴费方式参数处理
  onChangeWay = (value, selectedOptions) => {

      this.state.pagingSearch.payWay = value;

      let paymentWay,sonPaymentWay;
      if(selectedOptions.props.parentValue){
      paymentWay = selectedOptions.props.parentValue;
      sonPaymentWay = value;
      }else{
      paymentWay = value;
      sonPaymentWay = selectedOptions.props.parentValue;
      }

      this.state.pagingSearch.paymentWay = paymentWay;
      this.state.pagingSearch.sonPaymentWay = sonPaymentWay;
      
      this.setState({
          pagingSearch: this.state.pagingSearch
      });

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
          apiUrl={'/edu/orderTeacherCenter/exportOrderListByWebsite'}//api下载地址
          method={'POST'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);

        const prefixSelector = getFieldDecorator('textKey', {
          initialValue: dataBind(this.state.pagingSearch.textKey || 'studentName'),
        })(
          <Select style={{ width: 100 }} onChange={this.onCountryChange}>
            <Option value='studentName'>学生姓名</Option>
            <Option value='loginName'>用户名</Option>
            <Option value='mobile'>手机号</Option>
          </Select>
          );

        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="招生季">
                        {getFieldDecorator('recruitBatchId', {
                          initialValue: this.state.pagingSearch.recruitBatchId
                        })(
                          <SelectRecruitBatch hideAll={false} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                            this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value })
                            //变更时自动加载数据
                            // this.onSearch();
                          }} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目" >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                          <SelectItem scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单分部'} >
                          {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                            <SelectFBOrg scope='my' hideAll={false} showCheckBox={false} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单状态'} >
                        {getFieldDecorator('orderStatus', { initialValue: this.state.pagingSearch.orderStatus })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.order_status.filter(a => a.value == 2 || a.value == 5 || a.value== 6 || a.value == 7).map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="缴费方式">
                            {getFieldDecorator('payWay', {
                                initialValue: this.state.pagingSearch.payWay,
                            })(
                              <Select>
                                <Option value="">全部</Option>
                                <Option value={2} key={2}>支付宝</Option>
                                <Option value={4} key={4}>微信</Option>
                              </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'支付流水号'} >
                        {getFieldDecorator('otherPayNo', { initialValue: this.state.pagingSearch.otherPayNo })(
                          <Input placeholder="请输入流水号" />
                        )}
                      </FormItem>
                    </Col>
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
                        label="创建日期"
                      >
                        {getFieldDecorator('startDate', { initialValue:this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]:[] })(
                        <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="多条件查询"
                      >
                        {getFieldDecorator('textValue', {
                          initialValue: this.state.pagingSearch.textValue,
                        })(
                          <Input style={{width:270}} addonBefore={prefixSelector}
                          />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="缴费日期">
                            {getFieldDecorator('startPayDate', { initialValue: (this.state.pagingSearch.startPayDate&&this.state.pagingSearch.startPayDate.indexOf('n')==-1)?[moment(this.state.pagingSearch.startPayDate,dateFormat),moment(this.state.pagingSearch.endPayDate,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label='已缴金额大于？'>
                        {
                          getFieldDecorator('paidAmount', {
                            initialValue: this.state.pagingSearch.paidAmount
                          })(
                              <NumericInput placeholder={"已缴金额"} />
                            )
                        }
                      </FormItem>
                    </Col>
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
                scroll={{ x: 2200 }}
              //rowSelection={rowSelection}
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
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OfficialWebOrderQuery);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  const { auth } = state;
  return { 
    Dictionarys,
    auth: auth ? auth : null,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    queryOrderListByWebsite: bindActionCreators(queryOrderListByWebsite, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);