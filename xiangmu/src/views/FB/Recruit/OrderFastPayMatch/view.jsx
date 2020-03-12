/*
快捷支付订单匹配
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
const Option = Select.Option;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import {
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';

import { OrderNumberList } from '@/actions/enrolStudent';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea'

import './view.less';

const dateFormat = 'YYYY-MM-DD';


class OrderFastPayMatchView extends React.Component {

  constructor(props) {
    super(props);
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    let payNoArr = [],
        moneyTotal = 0,
        payeeType = props.currentDataModel[0].posAccountType;

    props.currentDataModel.map((item,index)=>{
      payNoArr.push(item.otherPayNo);
      moneyTotal += (item.money*10000);
    })


    this.state = {
      editMode: '',
      dataModel: props.currentDataModel,
      payeeType: payeeType,
      payNoArr: payNoArr,
      moneyTotal: Math.round(moneyTotal),
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        orderSn: '',//订单号
        realName: '',//学生姓名
        payeeType: payeeType,//收费方账户类型：1中博教育;2中博诚通;3共管账户;4大客户
        createDateStart: '',//创建日期(开始)
        createDateEnd: '', //创建日期(结束)
      },
      data: [],
      UserSelecteds: [],
      UserSelectedKeys: [],
      loading: false,
      startValue: null,
      endValue: null,
      endOpen: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['order_status']);
    this.loadBizDictionary(['payee_type']);
    this.onSearch()
  }
  componentWillReceiveProps(nextProps) {
        if ('submitLoading' in nextProps) {
          this.setState({
            loading: nextProps.submitLoading,
          });
        }
    }
  compoentDidMount() {
  }

  columns = [
    {
      title: '订单号',
      dataIndex: 'orderSn',
      fixed: 'left',
      width: 200
    },
    {
      title: '学生姓名',
      dataIndex: 'realName'
    },
    {
      title: '证件号',
      dataIndex: 'certificateNo',
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render: text => <span>{getDictionaryTitle(this.state.payee_type, text)}</span>
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
      render: (text, record, index) => (`${formatMoney(record.totalAmount)}`)
    },
    {
      title: '已缴金额(¥)',
      dataIndex: 'paidAmount',
      render: (text, record, index) => (`${formatMoney(record.paidAmount)}`)
    },
    {
      title: '当期欠缴金额(¥)',
      dataIndex: 'currentPayableAmount',
      render: (text, record, index) => (`${formatMoney(record.currentPayableAmount)}`)
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      fixed: 'right',
      width: 120,
      render: text => <span>{getDictionaryTitle(this.state.order_status, text)}</span>
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    condition.payNo = condition.payNo?condition.payNo.join(","):'';
    // condition.createDateStart = condition.createDateStart ? formatMoment(condition.createDateStart)+' 00:00:00': '';//日期控件处理
    // condition.createDateEnd = condition.createDateEnd ? formatMoment(condition.createDateEnd)+' 23:59:59': '';//日期控件处理
    let createDateStart = condition.createDateStart;
    if(Array.isArray(createDateStart)){
      condition.createDateStart = createDateStart[0]?(formatMoment(createDateStart[0])+' 00:00:00'):'';
      condition.createDateEnd = createDateStart[0]?(formatMoment(createDateStart[1])+' 23:59:59'):'';
    }
    this.props.OrderNumberList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state != 'success') {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ UserSelecteds: [] });
        this.setState({ UserSelectedKeys: [] });
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  }
  onorderMatch = () => {
    let needPayableAmount = 0,
        orderIdArr = [],
        studentIdArr = [],
        isZero = false;

    this.state.UserSelecteds.map((item,index)=>{
      needPayableAmount += item.currentPayableAmount*10000;
      orderIdArr.push(item.orderId);
      studentIdArr.push(item.studentId);
      if(item.currentPayableAmount == 0){
        isZero = true;
      }
    })

    if(!this.props.isAllEqual(studentIdArr)){
      message.error('请选择同一个学生的订单进行匹配！');
      return;
    }

    if(isZero){
      message.error('当期欠缴金额为零，无法进行匹配！');
      return;
    }
    
    if((Math.round(needPayableAmount)) != (this.state.moneyTotal)){
      message.error('您选择的订单当期欠缴金额总额与支付流水总额不一致,无法进行匹配！');
      return;
    }else{
      this.props.setSubmitLoading(true);
      this.props.viewCallback({ otherPayNos:this.state.payNoArr.join(','),orderIds:orderIdArr.join(','),matchType: 1 });//合并保存数据
    }
  
  }

  onorderResidueMatch = () => {
    let needPayableAmount = 0,//剩余应缴总金额
        orderIdArr = [],
        studentIdArr = [];

    this.state.UserSelecteds.map((item,index)=>{
      needPayableAmount += item.totalCurrentPayableAmount*10000;
      orderIdArr.push(item.orderId);
      studentIdArr.push(item.studentId);
    })

    if(!this.props.isAllEqual(studentIdArr)){
      message.error('请选择同一个学生的订单进行匹配！');
      return;
    }
    
    if((Math.round(needPayableAmount)) != (this.state.moneyTotal)){
      message.error('您选择的订单剩余应缴总金额总额与支付流水总额不一致,无法进行匹配！');
      return;
    }else{
      this.props.setSubmitLoading(true);
      this.props.viewCallback({ otherPayNos:this.state.payNoArr.join(','),orderIds:orderIdArr.join(','),matchType: 2 });//合并保存数据
    }
  }

  onCancel = () => {
      this.props.viewCallback();
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
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelectedKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRows })
            this.setState({ UserSelectedKeys: selectedRowKeys })
          }
        };
        let extendButtons = [];

        block_content = (
          <div className="orderMatch">
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="订单区域">
                            {getFieldDecorator('regionId', {
                                initialValue: '',
                            })(
                                <SelectArea scope={'my'} hideAll={false} />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                         {...searchFormItemLayout}
                          label="订单创建日期"createDateStart
                        >
                         {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[] })(
                              <RangePicker style={{width:220}}/>
                          )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单号'} >
                        {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                          <Input placeholder="请输入订单号"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'手机号'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.activeName })(
                         <Input placeholder="按手机号查询" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                          <Input placeholder="请输入学生姓名"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                    
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="payNo">
              支付流水号：{this.state.payNoArr.join('、')}，支付总金额：{ formatMoney(this.state.moneyTotal/10000) }元。
            </div>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={16} style={{paddingBottom:'20px'}}>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button loading={this.state.loading} onClick={this.onorderMatch}>当期匹配</Button> :
                      <Button loading={this.state.loading} disabled>当期匹配</Button>
                    }
                    <div className='split_button' style={{ width: 10 }}></div>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button loading={this.state.loading} onClick={this.onorderResidueMatch}>余额匹配</Button> :
                      <Button loading={this.state.loading} disabled>余额匹配</Button>
                    }
                    <div className='split_button' style={{ width: 10 }}></div>
                    <Button onClick={this.onCancel} icon="rollback">返回</Button>
                  </Col>
                </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={24} className={'search-paging-control'} align="right">
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
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedOrderFastPayMatchView = Form.create()(OrderFastPayMatchView);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    OrderNumberList: bindActionCreators(OrderNumberList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderFastPayMatchView);
