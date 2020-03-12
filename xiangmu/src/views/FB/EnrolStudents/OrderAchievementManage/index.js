/*
订单业绩相关调整
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
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import {
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';

import { getOrderAchievementList } from '@/actions/enrolStudent';
import { updateOrderAchievementUser } from '@/actions/enrolStudent';
import { updateArea } from '@/actions/enrolStudent';

import ContentBox from '@/components/ContentBox';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import SelectRegion from '@/components/BizSelect/SelectRegion';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg';
import OrderAchievementView from './view';
import Achievement from './achievement';
import SelectArea from '@/components/BizSelect/SelectArea';
import DropDownButton from '@/components/DropDownButton';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
const dateFormat = 'YYYY-MM-DD';
class OrderAchievementManage extends React.Component {

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
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        recruitBatchId: '',
        orderType: '',
        partnerId: '',
        studentName: '',  
        benefitRegionId: '',   
        orderStatus: '',
        orderSn: '',
        results:'',
        //开始时间
      },
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
    };
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount");
    this.loadBizDictionary(['discount_type']);
    this.loadBizDictionary(['order_type']);
    this.loadBizDictionary(['order_status']);
    this.loadBizDictionary(['payee_type']);
    //this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '招生季',
      dataIndex: 'recruitBatchName',
      width: 180,
      fixed:'left'
    },
    {
      title: '订单号',
      dataIndex: 'orderSn', 
      render: (text, record, index) => {
        return <span>
          <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
        </span>
      },
      width: 180
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '订单区域',
      dataIndex: 'orgName',
    },
    {
      title: '市场人员',
      dataIndex: 'marketName',
    },
    {
      title: '市场人员2',
      dataIndex: 'marketTwoName',
    },
    {
      title: '面资人员',
      dataIndex: 'fconsultName'
    },
    {
      title: '面咨人员2',
      dataIndex: 'fconsultTwoName',
    },
    {
      title: '电咨人员',
      dataIndex: 'pconsultName',
    },
    {
      title: '大客户名称',
      dataIndex: 'partnerName',
    },
    {
      title: '收款方',
      dataIndex: 'payeeType',
      render: (text, record, index) => {
        var payeeType = record.payeeType == 0 ? 1 : record.payeeType
        return getDictionaryTitle(this.state.payee_type, payeeType);
      }
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return formatMoney(record.totalAmount);
      }
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
      render: (text, record, index) => {
        return formatMoney(record.paidAmount);
      }
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      render: (text, record, index) => {
        var orderStatus = record.orderStatus == 0 ? 1 : record.orderStatus
        return getDictionaryTitle(this.state.order_status, orderStatus);
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (text, record) => {
        return <DropDownButton>
          <Button onClick={() => { this.onLookView('Edit', { ...record }) }}>编辑</Button>
          <Button onClick={() => { this.onLookView('achievement', { ...record }) }}>业绩教师</Button>
          <Button onClick={() => { this.onLookView('ViewOrderDetail', { ...record }) }}>查看</Button>
        </DropDownButton>
      }
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.startDate = formatMoment(condition.startDate);//日期控件处理
    let askDate = condition.createDateStart;
    if (askDate) {
      condition.createDateStart = formatMoment(askDate[0]);
      condition.createDateEnd = formatMoment(askDate[1]);
    }
    this.props.getOrderAchievementList(condition).payload.promise.then((response) => {
      let data = response.payload.data;

      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ UserSelecteds: [] })
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  }
  oneditArea = () => {
    let params = { orderIds: this.state.UserSelecteds }
    this.onLookView("editArea", params);
  }
  oneditmUser = () => {
    let results='';
    let flag = true;
    this.state.UserSelecteds.map((item, index) => {
      let result = this.state.data.find(rocode => rocode.orderId == `${item}`)
      if(results==''){
        results = result.areaId;
      }
      else if(results!=result.areaId){
        message.error('所选区域不同,不允许进行人员调整');
        flag = false;
      }
    });
    if(flag){
      let params = { orderIds: this.state.UserSelecteds,results:results }
      this.onLookView("editmUser", params);
    }
  }
  oneditmUser2 = () => {
    let results='';
    let flag = true;
    this.state.UserSelecteds.map((item, index) => {
      let result = this.state.data.find(rocode => rocode.orderId == `${item}`)
      if(results==''){
        results = result.areaId;
      }
      else if(results!=result.areaId){
        message.error('所选区域不同,不允许进行人员调整');
        flag = false;
      }
    });
    if(flag){
      let params = { orderIds: this.state.UserSelecteds,results:results }
      this.onLookView("editmUser2", params);
    }
  }
  oneditpUser = () => {
    let results='';
    let flag = true;
    this.state.UserSelecteds.map((item, index) => {
      let result = this.state.data.find(rocode => rocode.orderId == `${item}`)
      if(results==''){
        results = result.areaId;
      }
      else if(results!=result.areaId){
        message.error('所选区域不同,不允许进行人员调整');
        flag = false;
      }
    });
    if(flag){
      let params = { orderIds: this.state.UserSelecteds,results:results }
      this.onLookView("editpUser", params);
    }
  }
  oneditfUser = () => {
    let results='';
    let flag = true;
    this.state.UserSelecteds.map((item, index) => {
      let result = this.state.data.find(rocode => rocode.orderId == `${item}`)
      if(results==''){
        results = result.areaId;
      }
      else if(results!=result.areaId){
        message.error('所选区域不同,不允许进行人员调整');
        flag = false;
      }
    });
    if(flag){
      let params = { orderIds: this.state.UserSelecteds,results:results }
      this.onLookView("editfUser", params);
    }
  }
  oneditfUser2 = () => {
    let results='';
    let flag = true;
    this.state.UserSelecteds.map((item, index) => {
      let result = this.state.data.find(rocode => rocode.orderId == `${item}`)
      if(results==''){
        results = result.areaId;
      }
      else if(results!=result.areaId){
        message.error('所选区域不同,不允许进行人员调整');
        flag = false;
      }
    });
    if(flag){
      let params = { orderIds: this.state.UserSelecteds,results:results }
      this.onLookView("editfUser2", params);
    }
  }
  //浏览视图
  onLookView = (op, item) => {
    if(op == 'Edit'){
      item = { ...item, orderId: item.orderId,results:item.areaId }
    }
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {
      switch (this.state.editMode) {
        case "EditDate":
          this.props.discountRuleExpiryDateBatchUpdate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Edit':
          this.props.updateOrderAchievementUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({ UserSelecteds: [] });
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Create':
          this.props.discountRuleCreate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'editArea':
          this.props.updateArea(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({ UserSelecteds: [] });
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        default:
          this.props.updateOrderAchievementUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({ UserSelecteds: [] });
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'achievement':
        block_content = <Achievement viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          state={this.state} 
        />
        break;
      case 'ViewOrderDetail':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          tab={3}
        />
        break;
      case 'EditDate':
      case 'Edit':
      case 'editmUser':
      case 'editmUser2':
      case 'editpUser':
      case 'editfUser':
      case 'editfUser2':
      case 'editArea':
        block_content = <OrderAchievementView
          viewCallback={this.onViewCallback}
          {...this.state}
          editMode={this.state.editMode}
        />
        break;
      case 'Create':
      case 'Audit':
        // block_content = <DiscountView
        //   viewCallback={this.onViewCallback}
        //   {...this.state}
        // />
        // break;
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
        // extendButtons.push(<Button onClick={() => { this.onLookView('Create', { itemNames: '', startDate: '', endDate: '', remark: '', productDiscountType: '', productDiscountName: '', validDate: '', productDiscountPrice: '' }) }
        // } icon="plus" className="button_dark" > 优惠</Button>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'招生季'} >
                        {getFieldDecorator('recruitBatchId', { initialValue: this.state.pagingSearch.recruitBatchId })(
                          <SelectRecruitBatch scope='current' hideAll={false} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                            this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value })
                            //变更时自动加载数据
                            this.onSearch();
                          }} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单区域'} >
                        {/* {getFieldDecorator('benefitRegionId', { initialValue: dataBind(this.state.pagingSearch.benefitRegionId) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.discount_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )} */
                          getFieldDecorator('benefitRegionId', { initialValue: this.state.pagingSearch.benefitRegionId })(
                            <SelectArea scope='my' hideAll={false} showCheckBox={false} />
                          )
                        }
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单类型'} >
                        {getFieldDecorator('orderType', { initialValue: this.state.pagingSearch.orderType })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.order_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单状态'} >
                        {getFieldDecorator('orderStatus', { initialValue: this.state.pagingSearch.orderStatus })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.order_status.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'大客户'} >
                        {getFieldDecorator('partnerId', { initialValue: this.state.pagingSearch.partnerId })(
                          <SelectPartnerOrg scope='my' hideAll={false} showCheckBox={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单号'} >
                        {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                          <Input placeholder="订单号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                          <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="创建日期"
                      >
                        {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[] })(

                          <RangePicker style={{ width: 220 }} />
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
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'orderId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1600 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} style={{paddingBottom:'20px'}}>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditArea} icon='editArea'>区域调整</Button> :
                      <Button disabled icon='editArea'>区域调整</Button>
                    }
                    <div className='split_button' style={{ width: 10 }}></div>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditmUser} icon='editmUser'>市场人员调整</Button> :
                      <Button disabled icon='editmUser'>市场人员调整</Button>
                    }
                    
                    <div className='split_button' style={{ width: 10 }}></div>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditfUser} icon='editfUser'>面资人员调整</Button> :
                      <Button disabled icon='editfUser'>面咨人员调整</Button>
                    }

                    <div className='split_button' style={{ width: 10 }}></div>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditpUser} icon='editpUser'>电咨人员调整</Button> :
                      <Button disabled icon='editpUser'>电咨人员调整</Button>
                    }
                    
                    <div className='split_button' style={{ width: 10 }}></div>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditmUser2} icon='editmUser2'>市场人员2调整</Button> :
                      <Button disabled icon='editmUser2'>市场人员2调整</Button>
                    }

                    <div className='split_button' style={{ width: 10 }}></div>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditfUser2} icon='editfUser2'>面资人员2调整</Button> :
                      <Button disabled icon='editfUser2'>面咨人员2调整</Button>
                    }

                  </Col>
                </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={24} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}
                      pageSizeOptions = {['10','20','30','50','100','200']}
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
const WrappedManage = Form.create()(OrderAchievementManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    // discountRuleQuery: bindActionCreators(discountRuleQuery, dispatch),
    // discountRuleCreate: bindActionCreators(discountRuleCreate, dispatch),
    // discountRuleUpdate: bindActionCreators(discountRuleUpdate, dispatch),
    // discountRuleExpiryDateBatchUpdate: bindActionCreators(discountRuleExpiryDateBatchUpdate, dispatch),
    // discountRuleProductQuery: bindActionCreators(discountRuleProductQuery, dispatch),
    // discountRuleNotProductQuery: bindActionCreators(discountRuleNotProductQuery, dispatch),
    // discountRuleProductAdd: bindActionCreators(discountRuleProductAdd, dispatch),
    // discountRuleProductDelete: bindActionCreators(discountRuleProductDelete, dispatch),
    // discountRuleMutexQuery: bindActionCreators(discountRuleMutexQuery, dispatch),
    // discountRuleMutexSet: bindActionCreators(discountRuleMutexSet, dispatch),

    // getCoursePlanAuditList: bindActionCreators(getCoursePlanAuditList, dispatch),
    // auditCoursePlan: bindActionCreators(auditCoursePlan, dispatch),
    getOrderAchievementList: bindActionCreators(getOrderAchievementList, dispatch),
    updateArea: bindActionCreators(updateArea, dispatch),
    updateOrderAchievementUser: bindActionCreators(updateOrderAchievementUser, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
