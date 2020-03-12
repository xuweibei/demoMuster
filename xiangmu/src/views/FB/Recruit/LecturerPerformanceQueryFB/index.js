/*
讲师业绩情况查询  
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider,DatePicker } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
import { formatMoney, timestampToTime, getDictionaryTitle,formatMoment } from '@/utils';
import { env } from '@/api/env'; 
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout,onToggleSearchOption } from '@/utils/componentExt';

import FileDownloader from '@/components/FileDownloader';
import ContentBox from '@/components/ContentBox';
import { loadDictionary } from '@/actions/dic'; 
import { LecturerPerformanceQueryList } from '@/actions/recruit';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectArea from '@/components/BizSelect/SelectArea'; 
 
class OrderQuery extends React.Component {
  state= { 
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      benefitRegionId:'',
      itemId:'',
      orderType:'',
      partnerName:'',
      partnerId:'',
      orderSn:'',
      studentName:'', 
      mobile:'',
      orderSn:'',
      activityName:'',
      activityStartDate:'',
      activityEndDate:'',
      teacherName:'',
      englishName:'',
      paymentAmount:'',
      orderCreateStartDate:'',
      orderCreateEndDate:'',
      performanceStartDate:'',
      performanceStartEndDate:'',
      orderCreateStartDate:''
    },
    data_list: [],
    loading: false,
    totalRecord: 0, 
  }
  constructor(){
    super();
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo','order_type','order_source','order_status','payee_type','esign_status']); 
  } 
  
  columns = [ 
    {
        title: '区域',
        width:180,
        fixed:'left',
        dataIndex: 'benefitRegionName',
        width:"160"
    },
    {
        title: '讲师',
        dataIndex: 'teacherName'
    },
    {
        title: '讲师城市',
        dataIndex: 'cityName'
    },
    {
        title: '业绩日期',
        dataIndex: 'performanceDate',
        render:(text,record)=>{
          return timestampToTime(record.performanceDate)
        }
    },
    {
        title: '项目',
        dataIndex: 'itemName'
    },
    {
        title: '订单号',
        dataIndex: 'orderSn'
    },
    {
        title: '学生姓名',
        width:80, 
        dataIndex: 'studentName'
    },
    {
        title: '手机号',
        dataIndex: 'mobile',
    }, 
    {
        title: '大客户名称',
        dataIndex: 'partnerName',
        //render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    }, 
    {
        title: '净缴金额(¥)',
        dataIndex: 'paidAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    }, 
    {
        title: '订单创建日期',
        dataIndex: 'orderCreateDate',
        render:(text,record)=>{
          return timestampToTime(record.orderCreateDate)
        }
    },
    {
        title: '活动名称',
        dataIndex: 'activityName'
    },  
    {
        title: '活动开始日期',
        dataIndex: 'activityStartTime',
        width:120,
        fixed:'right',
        render:(text,record)=>{
          return timestampToTime(record.activityStartTime)
        }
    }
  ];
  //检索数据
  fetch(params){ 
      if(!params){
        return;
      };
      var condition = params || this.state.pagingSearch;
      let activityStartDate = condition.activityStartDate;
      let orderCreateStartDate = condition.orderCreateStartDate;
      let performanceStartDate = condition.performanceStartDate;
      if(Array.isArray(activityStartDate)){
        condition.activityStartDate = formatMoment(activityStartDate[0]);
        condition.activityEndDate = formatMoment(activityStartDate[1]);
      };
      if(Array.isArray(orderCreateStartDate)){
        condition.orderCreateStartDate = formatMoment(orderCreateStartDate[0]);
        condition.orderCreateEndDate = formatMoment(orderCreateStartDate[1]);
      };  
      if(Array.isArray(performanceStartDate)){
        condition.performanceStartDate = formatMoment(performanceStartDate[0]);
        condition.performanceStartEndDate = formatMoment(performanceStartDate[1]);
      };  
      this.setState({ loading: true, pagingSearch: condition });
      this.props.LecturerPerformanceQueryList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data;
            //list.push(data.data);
            this.setState({
              data_list: list,
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
 
  render(){  
    let block_content = <div></div>
    switch (this.state.editMode) { 
      case 'Manage':
      default:
      const { getFieldDecorator } = this.props.form;
      let extendButtons = [];
      extendButtons.push(<FileDownloader
        apiUrl={'/edu/order/exportOrderActivityTeacher'}//api下载地址
        method={'POST'}//提交方式
        options={this.state.pagingSearch}//提交参数
        title={'导出'}
      >
      </FileDownloader>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>  
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'区域'} >
                        {
                          getFieldDecorator('benefitRegionId', { initialValue: this.state.pagingSearch.benefitRegionId })(
                            <SelectArea scope='my' hideAll={false} showCheckBox={false} />
                          )
                        }
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
                          <FormItem {...searchFormItemLayout} label={'订单类型'}>
                            {getFieldDecorator('orderType',{ initialValue:this.state.pagingSearch.orderType})(
                              <Select>
                                <Option value=''>全部</Option>
                                {this.state.order_type.map(item=>{
                                  return <Option value={item.value}>{item.title}</Option>
                                })}
                              </Select>
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'大客户'}>
                            {getFieldDecorator('partnerName',{ initialValue:this.state.pagingSearch.partnerName})(
                               <Input placeholder='请输入大客户名称' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'订单号'}>
                            {getFieldDecorator('orderSn',{ initialValue:this.state.pagingSearch.orderSn})(
                               <Input placeholder='请输入订单号' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'学生姓名'}>
                            {getFieldDecorator('studentName',{ initialValue:this.state.pagingSearch.studentName})(
                               <Input placeholder='请输入学生姓名' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'手机号'}>
                            {getFieldDecorator('mobile',{ initialValue:this.state.pagingSearch.mobile})(
                               <Input placeholder='请输入手机号' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'活动名称'}>
                            {getFieldDecorator('activityName',{ initialValue:this.state.pagingSearch.activityName})(
                               <Input placeholder='请输入活动名称' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="活动开始日期">
                            {getFieldDecorator('activityStartDate', { initialValue: this.state.pagingSearch.activityStartDate?[moment(this.state.pagingSearch.activityStartDate,dateFormat),moment(this.state.pagingSearch.activityEndDate,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'讲师姓名'}>
                            {getFieldDecorator('teacherName',{ initialValue:this.state.pagingSearch.teacherName})(
                               <Input placeholder='请输入讲师姓名' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'讲师英文名'}>
                            {getFieldDecorator('englishName',{ initialValue:this.state.pagingSearch.englishName})(
                               <Input placeholder='请输入讲师英文名' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="订单创建日期">
                            {getFieldDecorator('orderCreateStartDate', { initialValue: this.state.pagingSearch.orderCreateStartDate?[moment(this.state.pagingSearch.orderCreateStartDate,dateFormat),moment(this.state.pagingSearch.orderCreateEndDate,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="业绩日期">
                            {getFieldDecorator('performanceStartDate', { initialValue: this.state.pagingSearch.performanceStartDate?[moment(this.state.pagingSearch.performanceStartDate,dateFormat),moment(this.state.pagingSearch.performanceStartEndDate,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col> 
                  </Row>
                </Form>
              }
            </ContentBox> 
            <div className="space-default">
            </div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{x:1800}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                  </Col>
                  <Col span={24} className={'search-paging-control'}>
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
        )
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OrderQuery);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        //列表
        LecturerPerformanceQueryList: bindActionCreators(LecturerPerformanceQueryList, dispatch), 
        loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
