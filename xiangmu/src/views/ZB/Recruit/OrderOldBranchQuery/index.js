/*
订单查看
2018-06-02
lixuliang
*/
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider,DatePicker } from 'antd';
const FormItem = Form.Item;
const { Option, OptGroup } = Select;
import { formatMoney, timestampToTime, getDictionaryTitle,formatMoment } from '@/utils';
import { env } from '@/api/env'; 
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout,onToggleSearchOption } from '@/utils/componentExt';

import FileDownloader from '@/components/FileDownloader';
import ContentBox from '@/components/ContentBox';
import { loadDictionary } from '@/actions/dic';
import { queryAllPartners } from '@/actions/partner';
import { getClassList } from '@/actions/product';
import { UserSourceDivision,queryAllBranch } from '@/actions/base'; 
import { queryOrder2, getContractUrl } from '@/actions/recruit';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import NumericInput from '@/components/NumericInput';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import SelectAllPartnerOrg from '@/components/BizSelect/SelectAllPartnerOrg';
 
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import DropDownButton from '@/components/DropDownButton';
 
class OrderQuery extends React.Component {
  state= {
    all_org_list:[],
    queryArr:[],
    ClassType:[],
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      recruitBatchId:'',
      userSourceId:'',
      itemId:'',
      orderType:'',
      benefitRegionId:'',
      orderSource:'',
      orderStatus:'',
      partnerId:'',
      payeeType:'',
      esignStatus:'',
      orderSn:'',
      realName:'',
      certificateNo:'',
      createDateStart:'',
      createDateEnd:'',
      isTempOrder:'',
      mobile:''
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
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo','order_type','order_source','order_status','payee_type','esign_status']);
    // this.queryMeans();
    this.ClassTypeMeans();
    this.UserSource();
  }
    //用户来源分部
    UserSource = () => { 
      if(this.props.orgType == 1){

        this.props.UserSourceDivision().payload.promise.then((response) => {
          let data = response.payload.data; 
              if(data.state == 'success'){
                  let all_org_list = [];
                  let orderDQList = data.data.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
                  //循环
                  orderDQList.map((a) => {
                  //没有分部
                  if (a.organizationList.length == 0) {
                      return;
                  }
    
                  let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序
                  let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
                  orderFBList.map((fb) => {
                      dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
                  })
                  all_org_list = [...all_org_list, dqItem];
                  });
                  this.setState({ all_org_list })
              }else{
                message.error(data.msg)
              }
          }
        )

      }else{
        this.props.queryAllBranch({state:1}).payload.promise.then((response) => {
          let data = response.payload.data; 
              if(data.state == 'success'){
                  let all_org_list = [];
                  let orderDQList = data.data.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
                  //循环
                  orderDQList.map((a) => {
                  //没有分部
                  if (a.organizationList.length == 0) {
                      return;
                  }
    
                  let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序
                  let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
                  orderFBList.map((fb) => {
                      dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
                  })
                  all_org_list = [...all_org_list, dqItem];
                  });
                  this.setState({ all_org_list })
              }else{
                message.error(data.msg)
              }
          }
        )
      }
      
    }
  queryMeans = () => { 
    this.props.queryAllPartners().payload.promise.then((response) => {
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
    condition.currentPage = 1;
    condition.pageSize = 999;
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
      title: '用户来源分部',
      dataIndex: 'sourceBranchName'
    },
    {
        title: '学生姓名',
        width:80, 
        dataIndex: 'realName'
    },
    {
        title: '学生创建人',
        dataIndex: 'studentCreateName'
    },
    {
        title: '订单分部',
        dataIndex: 'branchName',
        width:"160"
    },
    {
        title: '订单号',
        dataIndex: 'orderSn'
    },
    {
        title: '项目',
        dataIndex: 'itemName'
    },
    {
        title: '大客户名称',
        dataIndex: 'orgName',
        //render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '收费方',
        dataIndex: 'payeeTypeStr',
    },
    {
        title: '主体',
        dataIndex: 'zbPayeeTypeStr',
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '优惠金额(¥)',
        dataIndex: 'totalDiscountAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '已缴金额(¥)',
        dataIndex: 'paidAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        //title: '挂单金额(¥)',
        //dataIndex: 'restingAmount',
        title: '临时缴费金额(¥)',
        dataIndex: 'paidTempAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '创建日期',
        dataIndex: 'createDateStr'
    },
    {
        title: '订单状态',
        dataIndex: 'orderStatusStr',
    },
    {
        title: '订单类型',
        dataIndex: 'orderStatusStr',
        render: (value, record, index) => {
          if(record.orderType == 1){
            return <span>个人订单</span>
          }else{
            if(record.partnerClassType == 1){
              return <span>大客户方向班</span>
            }else{
              return <span>大客户精英班</span>
            }
          }
        }
    },
    {
        title: '电子签',
        dataIndex: 'esignStatusStr',
        //render: text => <span>{getDictionaryTitle(this.state.dic_YesNo, text)}</span>
    },
    {
        title: '订单来源',
        dataIndex: 'orderSourceStr'
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
              {
                (this.props.orgType == 1 && (record.esignStatus == 1) && record.esignFile) ?
                <Button onClick={() => { this.onLookView('Esign', record); }}>电子签重签</Button>
                : ''
              }
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
      if(condition.createDateStart){condition.createDateStart = formatMoment(condition.createDateStart)};
      if(condition.createDateEnd){condition.createDateEnd = formatMoment(condition.createDateEnd)};
      this.setState({ loading: true, pagingSearch: condition });
      this.props.queryOrder2(condition).payload.promise.then((response) => {
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
        apiUrl={'/edu/order/exportListByQuery2'}//api下载地址
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
                          <SelectItem scope='all' hideAll={false} />
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
                          <FormItem {...searchFormItemLayout} label={'用户来源分部'}>
                            {getFieldDecorator('userSourceId',{ initialValue:this.state.pagingSearch.userSourceId})(
                              <Select
                                showSearch={true}
                                filterOption={(inputValue, option) => {  
                                var result = false;
                                for(var i = 0; i < option.props.children.length; i++){
                                if(option.props.children[i].indexOf(inputValue) != -1){
                                    result = true;
                                    break;
                                }
                                }
                                return result;
                                }}
                            >
                                <Option value=''>全部</Option> 
                                {this.state.all_org_list.map((dqItem) => {
                                    return <OptGroup label={dqItem.orgName}>
                                        {dqItem.children.map((fbItem, index) => {
                                        return <Option title={fbItem.state === 0?fbItem.orgName+'【停用】':fbItem.orgName} value={fbItem.orgId} key={index}>{fbItem.orgName}{fbItem.state === 0 ? '【停用】' : ''}</Option>
                                        })}
                                    </OptGroup>
                                })}
                            </Select>
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
                      <FormItem {...searchFormItemLayout} label="大客户名称" >
                        {getFieldDecorator('partnerId', { initialValue: this.state.pagingSearch.partnerId })(
                            <SelectAllPartnerOrg scope={'all'} hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'收费方'}>
                            {getFieldDecorator('payeeType',{ initialValue:this.state.pagingSearch.payeeType})(
                               <Select>
                                 <Option value=''>全部</Option>
                                  {this.state.payee_type.map(item=>{
                                    return <Option value={item.value}>{item.title}</Option>
                                  })}
                                </Select>
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'电子签'}>
                            {getFieldDecorator('esignStatus',{ initialValue:this.state.pagingSearch.esignStatus})(
                               <Select>
                                 <Option value=''>全部</Option>
                                  {this.state.esign_status.map(item=>{
                                    return <Option value={item.value}>{item.title}</Option>
                                  })}
                                </Select>
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
                            {getFieldDecorator('realName',{ initialValue:this.state.pagingSearch.realName})(
                               <Input placeholder='请输入学生姓名' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'证件号'}>
                            {getFieldDecorator('certificateNo',{ initialValue:this.state.pagingSearch.certificateNo})(
                               <Input placeholder='请输入证件号' />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'创建日期起'}>
                            {getFieldDecorator('createDateStart',{ initialValue:this.state.pagingSearch.createDateStart})(
                              <DatePicker 
                                style={{width: '200px'}}
                                placeholder='创建日期起' 
                              />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'创建日期止'}>
                            {getFieldDecorator('createDateEnd',{ initialValue:this.state.pagingSearch.createDateEnd})(
                              <DatePicker
                                style={{width: '200px'}}
                                placeholder='创建日期止'
                              />
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'是否存在临时缴费'}>
                            {getFieldDecorator('isTempOrder',{ initialValue:this.state.pagingSearch.isTempOrder})(
                               <Select>
                                 <Option value=''>全部</Option>
                                  {this.state.dic_YesNo.map(item=>{
                                    return <Option value={item.value}>{item.title}</Option>
                                  })}
                                </Select>
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
                          <FormItem {...searchFormItemLayout} label={'班型'}>
                            {getFieldDecorator('classTypeId',{ initialValue:this.state.pagingSearch.isTempOrder})(
                               <Select>
                                 <Option value=''>全部</Option>
                                  {this.state.ClassType.map(item=>{
                                    return <Option value={item.classTypeId}>{item.classTypeName}</Option>
                                  })}
                                </Select>
                            )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label='已缴金额大于？'>
                        {
                          getFieldDecorator('gtPaidAmount', {
                            initialValue: this.state.pagingSearch.gtPaidAmount
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
            <div className="space-default">
            </div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{x:2200}}
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
        queryOrder2: bindActionCreators(queryOrder2, dispatch),
        getContractUrl: bindActionCreators(getContractUrl, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //大客户
        queryAllPartners: bindActionCreators(queryAllPartners, dispatch),
        //班型
        getClassList: bindActionCreators(getClassList, dispatch),
        //用户分部来源
        UserSourceDivision: bindActionCreators(UserSourceDivision, dispatch),
        queryAllBranch: bindActionCreators(queryAllBranch, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
