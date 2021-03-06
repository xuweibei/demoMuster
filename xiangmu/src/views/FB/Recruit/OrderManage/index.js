/*
订单管理
2018-06-01
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, DatePicker,
  Table, Pagination, Divider, Menu, Dropdown } from 'antd';
const FormItem = Form.Item;
const SubMenu = Menu.SubMenu; 
import { formatMoney, timestampToTime, getDictionaryTitle, dataBind, formatMoment } from '@/utils';
import { env } from '@/api/env';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, searchFormItemLayout } from '@/utils/componentExt';
import DropDownButton from '@/components/DropDownButton';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
import { loadDictionary } from '@/actions/dic';
import { studentQuery, studentCreate, studentUpdate,TemporaryStorageInterface,
  queryOrderManage, updateOrder, abandonOrder, submitOrder,getContractUrl, updateOrderByHistory,
  updateOrderCreateDate, getQuickPayPathByOrderId
 } from '@/actions/recruit';

import ClipboardJS from 'clipboard';


import './index.less';

import StudentEdit from '../OrderCreate/student';
import OrderEdit from '../OrderCreate/order';
import OrderEditByHistory from '../OrderHistoryRecord/order';
import FeeEdit from '../OrderCreate/fee';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import ImportPsign from './import';

class OrderManage extends React.Component {
  state= {
    ratchId:true,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      recruitBatchId: '',

      weixin: '',
      certificateNo: '',
      mobile: '',
      qq: '',
      benefitMarketUserName: '',
      benefitConsultationUserName: '',
    },
    data_list: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {},
    isShowQrCodeModal: false,
    temporary:false,
    temId:'',
    okButton:false,
    reqErroe:false,
    isShowOrderCreateDate: false,
    currentOrderData: {},
    isShowFeeHref: false,
    feeHref: ''
  };
  constructor(){
    super();
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).onOperate = this.onOperate.bind(this);
    (this: any).onNextView = this.onNextView.bind(this);
  }
  
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo']);
    this.loadBizDictionary(['order_type']);
  }

  columns = [
    {
        title: '招生季',
        width:180,
        fixed:'left',
        dataIndex: 'recruitBatchName'
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
        title: '订单号',
        dataIndex: 'orderSn'
    },
    {
        title: '订单区域',
        dataIndex: 'benefitRegionName',
    },
    {
        title: '证件号码',
        dataIndex: 'certificateNo',
    },
    {
        title: '大客户姓名',
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
        title: '订单状态',
        dataIndex: 'orderStatusStr',
    },
    {
        title: '订单类型',
        dataIndex: 'orderType',
        render: (text, record, index) => {
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
            {
              (record.orderStatus == 0 || (record.orderStatus == 2 && !record.auditFinalOrgType) || record.orderStatus == 3) &&
              <Button onClick={() => { this.onLookView('OrderEdit', record); }}>编辑</Button>
            }
            {
              (record.orderStatus == 0) &&
              <Button onClick={() => { this.onOperate('Submit', record); }}>提交</Button>
            }
            {
              (((record.orderStatus == 2 || record.orderStatus == 4) && (record.payeeType == 1 || record.payeeType == 2 || record.payeeType == 5))) &&
              <Button onClick={() => { this.onLookView('FeeEdit', record); }}>缴费</Button>
            }
            {
              ((record.orderStatus == 4 || record.orderStatus == 5) && (record.payeeType == 2 || record.payeeType == 1)) &&
              <Menu style={{ width: 84 }} mode="vertical">
                <SubMenu key={`${record.orderId}3`} title={<span>合同</span>} className='contract-menu'>
                  {
                    !record.psignFile && <Menu.Item key={`${record.orderId}1`}>{( record.esignStatus == 0 ) ? <span onClick={() => { this.onOperate('Esign', record); }}>电子签</span> : <a style={{fontSize:12+'px',marginLeft:2+'px'}} href={record.esignFile} target='_Blank'>电子签</a> }</Menu.Item>
                  }
                  {
                    !record.esignFile && <Menu.Item key={`${record.orderId}2`}>{<span onClick={() => { this.onLookView('Psign', record); }}>纸质合同</span>}</Menu.Item>
                  }
                  
                </SubMenu>
              </Menu>
              // ((record.orderStatus == 4 || record.orderStatus == 5) && (record.payeeType == 2 || record.payeeType == 1) && !record.isHistoryOrder) && (record.esignStatus==0?<Button onClick={() => { this.onOperate('Esign', record); }}>电子签</Button>:<a style={{fontSize:12+'px',marginLeft:2+'px'}} href={record.esignFile} target='_Blank'>电子签</a>)
            }
            {
              (record.orderStatus == 2 || record.orderStatus == 3) &&
              <Button onClick={() => { this.onOperate('Drop', record); }}>废弃</Button>
            }
            {
              (record.orderStatus == 1 || record.orderStatus == 2 || record.orderStatus == 4 || record.orderStatus == 5 || record.orderStatus == 6) &&
              <Button onClick={() => { this.onLookView('ViewOrder', record); }}>查看</Button>
            }
            
            {
              (record.orderStatus == 2 && record.auditFinalOrgType) &&
              <Button onClick={()=>{this.openTemporary(record.orderId)}}>暂存</Button>
            }
            {
              ((record.orderStatus == 2 || record.orderStatus == 4) && (this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2)) &&
              <Button onClick={()=>{this.openFeeHref(record.orderId)}}>官网缴费</Button>
            }
            {/*{<Button onClick={()=>{this.onUpdateOrderCreateDate(record)}}>修改创建时间</Button>}*/}
          </DropDownButton>
        ),
    }
  ];
  
  //检索数据
  fetch(params){
    if(params && !params.recruitBatchId && this.state.ratchId){
      this.setState({
        ratchId:false
      })
      return;
    }
      var condition = params || this.state.pagingSearch;
      this.setState({ loading: true, pagingSearch: condition });
      this.props.queryOrderManage(condition).payload.promise.then((response) => {
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

  onGetQrCode(dataModel){
    var data = {
      orderId: dataModel.orderId,
      type: 1
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

  //获取官网缴费路径
  openFeeHref(orderId){
    var data = {
      orderId: orderId,
    }
    this.props.getQuickPayPathByOrderId(data).payload.promise.then((response) => {
      let resultData = response.payload.data;
      if (resultData.state === 'success') {
          this.setState({
            feeHref: resultData.data,
            isShowFeeHref: true
          })
          

          //点击复制
          var clipboard = new ClipboardJS('.btn');

          clipboard.on('success', function(e) {

            message.success('复制成功！');
            
              // console.info('Action:', e.action);
              // console.info('Text:', e.text);
              // console.info('Trigger:', e.trigger);

              e.clearSelection();
              clipboard.destroy();
          });
          clipboard.on('error', function(e) {

            message.success('复制失败！');
            clipboard.destroy();

            // console.error('Action:', e.action);
            // console.error('Trigger:', e.trigger);
        });
      }
      else {
          message.error(resultData.msg);
      }
    });
    return;
  }
  

  //浏览视图
  onLookView = (op, item) => {
    if(op == "OrderEdit"){
      //订单类型：1中博订单(个人订单);2大客户订单
      //大客户班级类型：1方向班;2精英班（大客户必填）
      if(item.orderType == 2 && item.partnerClassType == 1){
        op = "OrderClassDirection";
      }else if(item.orderType == 2 && item.partnerClassType == 2){
        op = "OrderClassAmateur";
      }else if(item.orderType == 1){
        op = "OrderPerson";
      }
    }
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item || {},//编辑对象
    });
  };
  onNextView = (op, dataModel) => {
    this.onLookView(op, dataModel);
  }
  onOperate= (op, dataModel) => {
    if(op == "Submit"){
      this.props.submitOrder(dataModel.orderId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'error') {
              message.error(data.message);
          }
          else {
              message.success("订单提交成功");
              this.fetch();
              //进入管理页
              this.onLookView("Manage", null);
          }
      })
    }else if(op == "Drop"){

      Modal.confirm({
          title: '是否作废此订单?',
          content: '点击确认作废此订单!否则点击取消！',
          onOk: () => {
              this.props.abandonOrder(dataModel.orderId).payload.promise.then((response) => {
                  let data = response.payload.data;
                  if (data.state === 'error') {
                      message.error(data.message);
                  }
                  else {
                      message.success("订单作废成功");
                      this.fetch();
                      //进入管理页
                      this.onLookView("Manage", null);
                  }
              })
          }
      })
      
    }else if(op == "Esign"){
      // message.success("电子签暂时不做");
      // return;
      this.onGetQrCode(dataModel);
      return;
    }
  }

  onUpdateOrderCreateDate = (orderData) => {
    this.setState({
        isShowOrderCreateDate:true,
        currentOrderData: orderData
    })
  }

 
  changeEeqError=()=>{
    this.setState({
      reqErroe:false
    })
  }
  //视图回调
  onViewCallback = (dataModel) => {   
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Edit':
        case 'Fee':
          message.error("缴费")
          break;
        //case 'Drop':
        case 'View':
          this.props.studentCreate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  message.success("新增学生成功");
                  this.fetch();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })
          break;
        case 'EditClassDirection':
        case 'EditClassAmateur':
        case 'EditPerson':
          this.props.studentUpdate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  message.success("学生信息保存成功，开始创建订单信息");
                  //this.fetch();
                  //进入管理页
                  this.onNextView(this.state.editMode.replace("Edit", "Order"), dataModel);
              }
          })
          break;
        case 'OrderClassDirection':
        case 'OrderClassAmateur':
        case 'OrderPerson':
          //只针对暂存的订单的修改
          if(dataModel.createDate){ 
            this.props.updateOrderByHistory(dataModel).payload.promise.then((response) => {
                let data = response.payload.data;    
                if (data.state === 'error') {
                    message.error(data.message); 
                    this.setState({
                      reqErroe:true
                    })
                }
                else {
                    message.success("订单保存成功");
                    this.fetch();
                    //进入管理页
                    this.onLookView("Manage", null);
                }
            })
          }else{ 
            this.props.updateOrder(dataModel).payload.promise.then((response) => {
                let data = response.payload.data;   
                if (data.state === 'error') { 
                    message.error(data.message);
                    this.setState({
                        reqErroe:true
                    })
                }
                else {
                    message.success("订单保存成功");
                    if((dataModel.payeeType == 1 || dataModel.payeeType == 2) && (dataModel.orderStatus != 0)){
                        this.onNextView("FeeEdit", dataModel);
                    }else{
                      this.fetch();
                      //进入管理页
                      this.onLookView("Manage", null);
                    }
                }
            })
          }
          
          break;
        case 'Fee':
          message.error("缴费逻辑")
          break;
      }
    }
  }
  
  onHideModal= () => {
    this.setState({
      isShowQrCodeModal: false,
      isShowOrderCreateDate: false,
      isShowFeeHref: false
    })
    this.fetch();
  }

  onHideModalTem= () => {
    this.setState({
      temporary: false,
    })
  }

  //打开暂存弹框
  openTemporary = (id)=>{
    this.setState({
      temporary: true,
      temId:id
    })
  }
  //确定操作暂存
  temporaryStorage =() =>{
    if(this.state.temId){
      this.setState({
        okButton:true
      })
      this.props.TemporaryStorageInterface({orderId:this.state.temId}).payload.promise.then((response)=>{
        let data = response.payload.data;
        if(data.state == 'success'){
          message.success('操作成功!');
          this.fetch();
        }else{
          message.error(data.msg);
        }
        this.setState({
          temporary: false,
          temId:'',
          okButton:false
        })
      })
    }else{
      message.warning('找不到对应订单号！')
    }
  }
  onChangeDate=()=>{
      this.props.form.validateFields((err, values) => {
          let confir = values.confirmDate
          if(!confir){
              message.warning('请选择订单创建时间!');
              return;
          }
          this.props.updateOrderCreateDate({ orderId: this.state.currentOrderData.orderId,createDate:formatMoment(confir,dateFormat) }).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.result === false) {
                  message.error(data.message);
              }
              else {
                  message.success('修改成功！');
                  this.setState({ isShowOrderCreateDate:false })
                  this.onSearch();
              }
          })
      })
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
      case 'OrderEdit':
      case 'OrderClassDirection':
      case 'OrderClassAmateur':
      case 'OrderPerson':
        if(this.state.currentDataModel.isHistoryOrder){
          block_content = <OrderEditByHistory
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode}
            {...this.state}
            changeEeqError = {this.changeEeqError}
            //currentDataModel={this.state.currentDataModel}
            orderId={this.state.currentDataModel.orderId}
            onNextView={this.onNextView}
          />
        }else{
          block_content = <OrderEdit
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode}
            {...this.state}
            changeEeqError = {this.changeEeqError}
            isCustomizeInstalment={this.state.currentDataModel.isCustomizeInstalment?'1':'0'}
            //currentDataModel={this.state.currentDataModel}
            orderId={this.state.currentDataModel.orderId}
            onNextView={this.onNextView}
          />
        }
        
        break;
      case 'FeeEdit':
        block_content = <FeeEdit
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          orderId={this.state.currentDataModel.orderId}
        />
        break;
      case 'Psign':
        block_content = <ImportPsign
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          orderId={this.state.currentDataModel.orderId}
          currentDataModel={this.state.currentDataModel}
        />
        break;
      case 'Manage':
      default:

        const { getFieldDecorator } = this.props.form;

        block_content = (
          <div>
            <SearchForm
              num_column={2}
              isRecruitBatch={true}
              isRegion={true}
              isOrderType={true}
              isOrderStatus={true}
              isBranchPartners={true}
              isPayeeType={true}
              isEsignStatus={true}
              isYesNo={true}
              form_item_list={[
                {type:'select', name: 'recruitBatchId', title: '招生季', data: 'recruit_batch', value: this.state.pagingSearch.recruitBatchId, is_all: true},
                {type:'select', name: 'benefitRegionId', title: '订单区域', data: 'region', value: this.state.pagingSearch.benefitRegionId, is_all: true},
                {type:'select', name: 'orderType', title: '订单类型', data: 'order_type', value: this.state.pagingSearch.orderType, is_all: true},
                {type:'select', name: 'orderStatus', title: '订单状态', data: 'order_status', value: this.state.pagingSearch.orderStatus, is_all: true},
                {type:'select', name: 'partnerId', title: '大客户', data: 'partner', value: this.state.pagingSearch.partnerId, is_all: true},
                {type:'select', name: 'payeeType', title: '收费方', data: 'payee_type', value: this.state.pagingSearch.payeeType, is_all: true},
                {type:'input', name: 'orderSn', title: '订单号', value: this.state.pagingSearch.orderSn},
                {type:'select', name: 'esignStatus', title: '合同', data: 'esign_status', value: this.state.pagingSearch.esignStatus, is_all: true},
                {type:'input', name: 'realName', title: '学生姓名', value: this.state.pagingSearch.realName},
                {type:'input', name: 'certificateNo', title: '证件号', value: this.state.pagingSearch.certificateNo},
                {type:'date', name: 'createDateStart', title: '创建日期起',placeholder:'开始日期', value: this.state.pagingSearch.createDateStart},
                {type:'date', name: 'createDateEnd', title: '创建日期止',placeholder:'结束日期', value: this.state.pagingSearch.createDateEnd},
                {type: 'select', name: 'isTempOrder', title: '是否存在临时缴费', data: 'dic_YesNo', value: this.state.pagingSearch.isTempOrder, is_all: true,width:100},
                {type: 'input', name: 'mobile', title: '手机号', value: this.state.pagingSearch.mobile},
                {type:''}

              ]}
              fetch2={(params) =>this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                {title: '导出', type: 'export',
                  url: '/edu/order/exportList'
                },
              ]}
            />
            <div className="space-default">
            </div>
            <div className="search-result-list order-manage">
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
                {
                  (this.state.status == '5') &&
                  <div>电子签二维码地址：<br/><a href={this.state.pdfUrl} target="frame1">{this.state.esingUrl}</a></div>
                }
                
              </Modal>
            }
            {
              this.state.temporary &&
              <Modal
                visible={this.state.temporary}
                onCancel={this.onHideModalTem}
                onOk={this.temporaryStorage}
                width={370}
                height={400}
                okButtonProps={{ disabled: this.state.okButton }}
              >
                <p style={{fontSize:18}}>对此条数据进行暂存操作?</p>
              </Modal>
            }
            {
              this.state.isShowOrderCreateDate &&
              <Modal
              visible={this.state.isShowOrderCreateDate}
              onOk={this.onChangeDate}
              onCancel={this.onHideModal}
              closable={false}
              //okText="确认"
              //cancelText="取消"
              >
                  <Form>
                      <Row gutter={24}>
                        <Col span={24}>
                            <FormItem {...searchFormItemLayout} label="订单创建时间">
                            {getFieldDecorator('confirmDate', {
                                    initialValue:dataBind(timestampToTime(this.state.currentOrderData.createDateStr), true),
                                    rules: [{
                                    required: true, message: '请选择订单创建时间!',
                                    }],
                                })(
                                    <DatePicker
                                      style={{width:200}}
                                      showTime
                                      format={dateFormat}
                                      placeholder='创建时间'
                                    />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                                <span style={{marginLeft:'44px'}}>请确认</span>
                        </Col>
                      </Row>
                  </Form>
              </Modal>
              
          }
          {
            this.state.isShowFeeHref &&
            <Modal
              title="官网缴费地址"
              visible={this.state.isShowFeeHref}
              onCancel={this.onHideModal}
              onOk={this.onHideModal}
            >
            
                <div>订单官网缴费地址：<br/><a href={this.state.feeHref} target="frame1" id="foo">{this.state.feeHref}</a></div>
                <button class='btn' data-clipboard-target="#foo">点我复制</button>
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
const WrappedManage = Form.create()(OrderManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { currentUser } = state.auth;
    return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        queryOrderManage: bindActionCreators(queryOrderManage, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

        studentQuery: bindActionCreators(studentQuery, dispatch),
        studentCreate: bindActionCreators(studentCreate, dispatch),
        studentUpdate: bindActionCreators(studentUpdate, dispatch),
        updateOrder: bindActionCreators(updateOrder, dispatch),
        updateOrderByHistory: bindActionCreators(updateOrderByHistory, dispatch),
        abandonOrder: bindActionCreators(abandonOrder, dispatch),
        submitOrder: bindActionCreators(submitOrder, dispatch),
        getContractUrl: bindActionCreators(getContractUrl, dispatch),
        TemporaryStorageInterface: bindActionCreators(TemporaryStorageInterface, dispatch),
        updateOrderCreateDate: bindActionCreators(updateOrderCreateDate, dispatch),
        getQuickPayPathByOrderId: bindActionCreators(getQuickPayPathByOrderId, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
