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
import { searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
const confirm = Modal.confirm;
import { loadDictionary } from '@/actions/dic';
import {
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet,
  MatchingFlowCode
} from '@/actions/recruit';

import { OrderFastPayList } from '@/actions/enrolStudent';
import { OrderMatchUpd } from '@/actions/enrolStudent';
import ContentBox from '@/components/ContentBox';
import SelectFBPosCode from '@/components/BizSelect/SelectFBPosCode'; 
import PayNumSelect from './payNumSelect';

const dateFormat = 'YYYY-MM-DD';
const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class OrderFastPayMatch extends React.Component {
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      okButton:false,
      visible:false,
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        posCode: '',//pos机编号
        matchStatus: 0,//匹配状态.1已匹配,0未匹配
        payeeType: '',//收费方账户类型：1中博教育;2中博诚通;3共管账户;4大客户
        payNo: '',  //流水号
        userNumber: '',   //工号
        posDateStart: '',//支付时间-开始
        posDateEnd: '', //支付时间-结束
        payeeType:''
      },
      data: [],
      startValue: null,
      endValue: null,
      endOpen: false,
      UserSelecteds: [],
      UserSelectedKeys: [],
      loading: false,
      submitLoading: false
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['discount_type']);
    this.loadBizDictionary(['order_type']);
    this.loadBizDictionary(['order_status']);
    this.loadBizDictionary(['payee_type','zb_payee_type']);
    this.onSearch()
    // console.log(this.props)
  }
  compoentDidMount() {
  }

  columns = [
    {
      title:'公司',
      fixed: 'left',
      width: 120,
      dataIndex:'posAccountTypeName'
    },
    {
      title: '支付流水号',
      dataIndex: 'otherPayNo',
    },
    {
      title: '支付费用',
      dataIndex: 'money',
      width: 100,
      render: (text, record, index) => (`${formatMoney(record.money)}`)
    },
    {
      title: '支付日期',
      dataIndex: 'posDateStr',
      width: 100,
      render: (text, record, index) => (`${record.posDateStr.split(' ')[0]}`)
    },
    {
      title: 'POS机名称',
      dataIndex: 'posName',
    },
    {
      title: 'POS机编号',
      dataIndex: 'posCode',
    },
    {
      title: '匹配情况',
      width: 80,
      dataIndex: 'matchStatusStr'
    }, 
    {
      title: '员工工号',
      width: 130,
      dataIndex: 'userNumber',
    }, 
    {
      title: '操作人',
      width: 80,
      dataIndex: 'createName',
    },
    {
      title: '操作日期',
      dataIndex: 'createDateStr',
      fixed: 'right',
      width: 160,
      render: (text, record, index) => (`${timestampToTime(record.createDateStr)}`)
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    if(typeof(condition.payNo) != 'string'){
      condition.payNo = condition.payNo.join(",");
    }
  
    let posDateStart = condition.posDateStart;
    if(posDateStart){
      condition.posDateStart = formatMoment(posDateStart[0])
      condition.posDateEnd = formatMoment(posDateStart[1])
    }
    if(this.props.currentDataModel.orderType==1){
      condition.payeeType = this.props.data.zbPayfeeType
    }
    this.props.OrderFastPayList(condition).payload.promise.then((response) => {
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
    let payeeTypeArr = this.state.UserSelecteds.map((item,index)=>{
      return item.posAccountTypeName;
    })
    
    if(!this.isAllEqual(payeeTypeArr)){
      message.error('请选择相同收费方的流水号！');
      return;
    }

    let params = this.state.UserSelecteds;
    this.onLookView("orderMatch", params)
  }
  isAllEqual = (array) => {
      if(array.length>0){
         return !array.some(function(value,index){
           return value !== array[0];
         });   
      }else{
          return true;
      }
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

  setSubmitLoading = (flag) => {
     this.setState({ submitLoading: flag })
  }
  
  onCancel = () => {
    this.props.viewCallback(true);
  }
  showConfirm = () => {
    this.setState({
      visible:true
    })
  }
  
  handleCancel = () =>{
    this.setState({
      visible:false
    })
  }
  handleOk = () =>{
        this.setState({
          okButton:true
        })
        let arr = []
        this.state.UserSelecteds.forEach(item=>{
          arr.push(item.otherPayNo)
        })
        let condition = {}
        condition.orderId = this.props.currentDataModel.orderId;
        condition.otherPayNos = arr.join(','); 
        this.props.MatchingFlowCode(condition).payload.promise.then((response) => {
          let data = response.payload.data; 
          if (data.state == 'error') {
            this.setState({ loading: false })
            message.error(data.message);
          }
          else { 
            message.success('匹配成功！');
            this.setState({ loading: false,UserSelecteds: [],UserSelectedKeys: [] });
            this.onSearch();
          }
          
          this.setState({
            visible:false,
            okButton:false
          })
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
      this.setSubmitLoading(false);
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {

      switch (this.state.editMode) {
        case 'orderMatch':
          this.props.OrderMatchUpd(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setSubmitLoading(false);
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              message.success('匹配成功！');
              this.setState({ UserSelecteds: [] });
              this.setState({ UserSelectedKeys: [] });
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        default:
          
          break;
      }
    }
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
          },
          getCheckboxProps: record => ({
            disabled: record.matchStatus == 0 ? false : true,
          }),
        };
        let extendButtons = [];

        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'POS机编号'} >
                        {getFieldDecorator('posCode', { initialValue: this.state.pagingSearch.posCode })(
                          <SelectFBPosCode scope='all' hideAll={false} 
                              showCheckBox={false}/>
                        )}
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                    {
                      this.props.currentDataModel.orderType==1?  <FormItem {...searchFormItemLayout} label={'公司'} >
                      {getFieldDecorator('payeeType', { initialValue: this.props.data.zbPayfeeType })(
                        <div>{
                          getDictionaryTitle(this.state.zb_payee_type,this.props.data.zbPayfeeType)
                        }
                        </div>
                         
                      )}
                    </FormItem>:  <FormItem {...searchFormItemLayout} label={'公司'} >
                          {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                            <Select>
                              <Option value=''>全部</Option>
                              {
                                this.state.zb_payee_type.map(item=>{
                                  return <Option value={item.value}>{item.title}</Option>
                                })
                              }
                            </Select>
                          )}
                        </FormItem>
                    }
                      
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'员工工号'} >
                        {getFieldDecorator('userNumber', { initialValue: this.state.pagingSearch.userNumber })(
                          <Input placeholder="请输入员工工号"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem
                              {...searchFormItemLayout}
                              label="支付日期">
                              {getFieldDecorator('posDateStart', { initialValue:this.state.pagingSearch.posDateStart?[moment(this.state.pagingSearch.posDateStart,dateFormat),moment(this.state.pagingSearch.posDateEnd,dateFormat)]:[]})(
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
                    <Col span={12}>
                    
                    </Col>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout24} label={'支付流水号'}  style={{ marginLeft: -5 }}>
                        {getFieldDecorator('payNo', { initialValue: this.state.pagingSearch.payNo?[this.state.pagingSearch.payNo]:'' })(
                          <PayNumSelect />
                        )}
                          <div>请一次性将匹配订单的支付流水号全部查询出来后进行匹配。</div>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <Modal 
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              okButtonProps={{ disabled: this.state.okButton }}
              cancelButtonProps={{ disabled: this.state.okButton }}
            >
              <p style={{fontSize:'16px'}}>确定匹配选中的流水号吗?</p> 
            </Modal>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1600 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={3}>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.showConfirm} icon='save' loading={this.state.loading}>确定匹配</Button> :
                      <Button disabled icon='save' loading={this.state.loading}>确定匹配</Button>
                    }
                  </Col>
                  <Col span={3}>
                      <Button onClick={this.onCancel} icon="rollback">返回</Button>
                  </Col>
                  <Col span={18} className={'search-paging-control'} align="right">
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
const WrappedOrderFastPayMatch = Form.create()(OrderFastPayMatch);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    OrderFastPayList: bindActionCreators(OrderFastPayList, dispatch),
    OrderMatchUpd: bindActionCreators(OrderMatchUpd, dispatch),
    MatchingFlowCode: bindActionCreators(MatchingFlowCode, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderFastPayMatch);
