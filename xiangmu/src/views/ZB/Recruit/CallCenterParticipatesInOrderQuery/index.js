/*
订单查看
2018-06-02
lixuliang
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
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout,onToggleSearchOption } from '@/utils/componentExt';

import FileDownloader from '@/components/FileDownloader';
import ContentBox from '@/components/ContentBox';
import { loadDictionary } from '@/actions/dic';
import { queryByOrderSearch } from '@/actions/partner';
import { getClassList } from '@/actions/product';
import { studentQuery, studentCreate, studentUpdate } from '@/actions/recruit';
import { CallCenterList, getContractUrl } from '@/actions/recruit';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import NumericInput from '@/components/NumericInput';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
 
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import DropDownButton from '@/components/DropDownButton';
 
class OrderQuery extends React.Component {
  state= {
    queryArr:[],
    ClassType:[],
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      recruitBatchId:'',
      itemId:'',
      orderType:'',
      benefitBranchId:'',
      orderSource:'',
      orderStatus:'',
      studentName:'',
      totalAmount:'',
      mobile:'',
      orderSn:'',
      orderCreateDateStart:'',
      orderCreateDateEnd:'',
      firstPaymentDateStart:'',
      firstPaymentDateEnd:'',
      callCenterUserName:'',
      paymentAmount:''
    },
    data_list: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {},
    isShowQrCodeModal: false,
  };
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
    this.queryMeans();
    this.ClassTypeMeans();
  }
  queryMeans = () => { 
    this.props.queryByOrderSearch().payload.promise.then((response) => {
      let data = response.payload.data;
          if(data.state == 'success'){
            this.setState({
              queryArr:data.data
            })
          }else{
            message.error(data.msg)
          }
      }
    )
  }
  ClassTypeMeans = () => { 
    let condition = {};
    condition.state = 1;
    this.props.getClassList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
          if(data.state == 'success'){
            this.setState({
              ClassType:data.data
            })
          }else{
            message.error(data.msg)
          }
      }
    )
  }
  
  columns = [
    {
        title: '招生季',
        width:180,
        fixed:'left',
        dataIndex: 'recruitBatchName'
    },
    {
        title: '分部',
        dataIndex: 'branchName',
        width:"160"
    },
    {
        title: '项目',
        dataIndex: 'itemNames'
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
        title: '呼叫中心电咨人员',
        dataIndex: 'callCenterUserName',
        //render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '手机号',
        dataIndex: 'mobile',
    }, 
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '已缴金额(¥)',
        dataIndex: 'paidAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '已退金额(¥)',
        dataIndex: 'refundAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '净缴金额(¥)',
        dataIndex: 'paymentAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    }, 
    {
        title: '创建日期',
        dataIndex: 'createDate',
        render:(text,record)=>{
          return timestampToTime(record.createDate)
        }
    },
    {
        title: '订单状态',
        dataIndex: 'orderStatus',
        render:(text,record)=>{ 
          return getDictionaryTitle(this.state.order_status,record.orderStatus)
        }
    }, 
    {
        title: '订单来源',
        dataIndex: 'orderSource',
        render:(text,record)=>{
          return getDictionaryTitle(this.state.order_source,record.orderSource)
        }
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          //编辑  缴费  废弃 查看
          //订单状态：0暂存;1审核中;2待缴费;3审核不通过;4部分缴费;5已完成;6废弃
          <DropDownButton>
              <Button onClick={() => { this.onLookView('ViewOrder', record); }}>查看</Button>
          </DropDownButton>
        ),
    }
  ];
  //检索数据
  fetch(params){ 
      if(!params){
        return;
      };
      var condition = params || this.state.pagingSearch;
      let creatDate = condition.orderCreateDateStart;
      let firstDate = condition.firstPaymentDateStart;
      if(Array.isArray(creatDate)){
        condition.orderCreateDateStart = formatMoment(creatDate[0]);
        condition.orderCreateDateEnd = formatMoment(creatDate[1]);
      };
      if(Array.isArray(firstDate)){
        condition.firstPaymentDateStart = formatMoment(firstDate[0]);
        condition.firstPaymentDateEnd = formatMoment(firstDate[1]);
      };  
      this.setState({ loading: true, pagingSearch: condition });
      this.props.CallCenterList(condition).payload.promise.then((response) => {
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
  onHideModal= () => {
    this.setState({
      isShowQrCodeModal: false,
    })
    this.fetch(this.state.pagingSearch);
  }

  onGetQrCode(dataModel){
    var data = {
      orderId: dataModel.orderId,
      type: 2
    }
    this.props.getContractUrl(data).payload.promise.then((response) => {
      let resultData = response.payload.data;
      if (resultData.state === 'success') {
          this.setState({
            allUrl: resultData.data.allUrl,
            esingUrl: resultData.data.url,
            isShowQrCodeModal: true
          })
      }
      else {
          message.error(resultData.message);
      }
    });
    return;
  }
  //浏览视图
  onLookView = (op, item) => {
    if(op == 'Esign'){
      this.onGetQrCode(item);
      return;
    }
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item || {},//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
  } 
  render(){  
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
        apiUrl={'/edu/order/exportCallCenterParticipateOrder'}//api下载地址
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
                      <FormItem {...searchFormItemLayout} label="招生季">
                        {getFieldDecorator('recruitBatchId', {
                          initialValue: this.state.pagingSearch.recruitBatchId
                        })(
                          <SelectRecruitBatch hideAll={false} onSelectChange={(value, selectOptions) => {
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
                      <FormItem {...searchFormItemLayout} label={'订单分部'} >
                          {getFieldDecorator('benefitBranchId', { initialValue: this.state.pagingSearch.benefitBranchId })(
                            <SelectFBOrg scope='my' hideAll={false} showCheckBox={false} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'订单来源'}>
                            {getFieldDecorator('orderSource',{ initialValue:this.state.pagingSearch.orderSource})(
                               <Select>
                                 <Option value=''>全部</Option>
                                  {this.state.order_source.map(item=>{
                                    return <Option value={item.value}>{item.title}</Option>
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
                            {this.state.order_status.filter(a => a.value == 2 || a.value == 5 || a.value== 6 || a.value == 7).map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
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
                          <FormItem {...searchFormItemLayout} label={'订单金额>?'}>
                            {getFieldDecorator('totalAmount',{ initialValue:this.state.pagingSearch.totalAmount})(
                               <NumericInput placeholder='订单金额' />
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
                          <FormItem {...searchFormItemLayout} label={'订单号'}>
                            {getFieldDecorator('orderSn',{ initialValue:this.state.pagingSearch.orderSn})(
                               <Input placeholder='请输入订单号' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="创建日期">
                            {getFieldDecorator('orderCreateDateStart', { initialValue: this.state.pagingSearch.orderCreateDateStart?[moment(this.state.pagingSearch.orderCreateDateStart,dateFormat),moment(this.state.pagingSearch.orderCreateDateEnd,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="首次缴费日期">
                            {getFieldDecorator('firstPaymentDateStart', { initialValue: this.state.pagingSearch.firstPaymentDateStart?[moment(this.state.pagingSearch.firstPaymentDateStart,dateFormat),moment(this.state.pagingSearch.firstPaymentDateEnd,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'呼叫中心人员'}>
                            {getFieldDecorator('callCenterUserName',{ initialValue:this.state.pagingSearch.callCenterUserName})(
                               <Input placeholder='请输入呼叫中心人员' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label='净缴金额>?'>
                        {
                          getFieldDecorator('paymentAmount', {
                            initialValue: this.state.pagingSearch.paymentAmount
                          })(
                              <NumericInput placeholder={"净缴金额"} />
                            )
                        }
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
            {
              this.state.isShowQrCodeModal &&
              <Modal
                title="电子签二维码"
                visible={this.state.isShowQrCodeModal}
                onCancel={this.onHideModal}
                footer={null}
                width={370}
                height={400}
              >
              
                <img style={{width:'100%'}} src = {this.state.allUrl}/>
                
              </Modal>
            }
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
        CallCenterList: bindActionCreators(CallCenterList, dispatch),
        getContractUrl: bindActionCreators(getContractUrl, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //大客户
        queryByOrderSearch: bindActionCreators(queryByOrderSearch, dispatch),
        //班型
        getClassList: bindActionCreators(getClassList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
