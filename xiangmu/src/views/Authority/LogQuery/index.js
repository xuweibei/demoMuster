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
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { subitem } from '@/actions/course'; 
import { 
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';
import { LogQuerySearch } from '@/actions/admin';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import ContentBox from '@/components/ContentBox';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      logContent: '',
      createDateStart:'',
      createDateEnd:'',
      functionId:'',
      functionClassType:''
    },
    listItem:[]
  };
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount");
    this.loadBizDictionary(['discount_type','order_type','order_status','payee_type','reg_source','grade','operate_log']);
    // this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }
  
  columns = [
    
    {
      title: '被操作公司',
      width:120,
      fixed:'left',
      dataIndex: 'objectOrgName',
    },
    {
      title: '操作内容',
      dataIndex: 'functionName',
    },
    {
      title: '日志内容',
      width:500,
      dataIndex: 'logContent',
    },
    {
      title: '操作人姓名',
      dataIndex: 'operateUserName',
    },
    {
      title: '操作人机构',
      dataIndex: 'operateOrgName',
    },
    {
      title: '操作日期',
      width:130,
      fixed:'right',
      dataIndex: 'operateDate',
      render: (text, record, index) => {
        return this.timestampDo(record.operateDate)
      },
    }

  ];
  timestampDo=(timestamp) =>{
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y+M+D+h+m+s;
}
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let askDate = condition.createDateStart;
    if(Array.isArray(askDate)){
      condition.createDateStart = formatMoment(askDate[0]);
      condition.createDateEnd = formatMoment(askDate[1]);
    }
    this.props.LogQuerySearch(condition).payload.promise.then((response) => {
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

//下拉框改变
  selectChange=(value,New)=>{
    let id = ''
    this.state.operate_log.forEach(item=>{
      if(item.title==New.props.children) id = item.systemCommonId
    })
    this.props.subitem(id).payload.promise.then((response) => {
      let data = response.payload.data.data;
      if(response.payload.data.state == 'success'){
          this.setState({
            listItem: data
          })
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          }
        };
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="所属分部">
                            {getFieldDecorator('objectOrgId', {
                                initialValue: ''
                            })(
                                <SelectFBOrg scope={'my'} hideAll={false} />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                       <FormItem {...searchFormItemLayout} label={'日志内容'} >
                            {
                                getFieldDecorator('logContent', {
                                    initialValue: ''
                                })
                                    (
                                      <Input placeholder="请输入日志内容" />
                                    )
                            }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="操作日期"
                      >
                        {getFieldDecorator('createDateStart', { initialValue: '' })(
                        
                              <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="操作类型"
                          >
                            {getFieldDecorator('functionId', { 
                              
                              initialValue: '' })(
                            
                                  <Select
                                    onChange={this.selectChange}
                                  >
                                  <Option value=''>全部</Option>
                                    {this.state.operate_log.map((item,index)=>{
                                      // console.log(item)
                                      return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                  </Select>
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="操作明细"
                          >
                            {getFieldDecorator('functionClassType', { initialValue: '' })(
                            
                                  <Select>
                                  <Option value=''>全部</Option>
                                    {this.state.listItem.map((item,index)=>{
                                      return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                  </Select>
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="被操作对象"
                          >
                            {getFieldDecorator('objectId', { initialValue: '' })(
                            
                                <Input  />
                            )}
                          </FormItem>
                    </Col> 
                  </Row>
                </Form>
              }
               
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                //rowSelection={rowSelection}
                rowKey={'studentAskId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                className='table'
                scroll={{ x: 1100 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                
                </Row>
                <Row justify="end" align="right" type="flex">
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
const WrappedManage = Form.create()(StudentInviteManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    LogQuerySearch: bindActionCreators(LogQuerySearch, dispatch),
    subitem:bindActionCreators(subitem, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
