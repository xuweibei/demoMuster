/*
新增订单 》 学生列表
2018-05-28
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import { env } from '@/api/env';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import { getCookie } from '@/utils/index';
import { loadDictionary } from '@/actions/dic';
import { canOrderStudentQuery, studentCreate, studentUpdate,
  createOrder,studentUpdateOnline,studentCreateOnline, addOrderByHistory, updateOrderByHistory
 } from '@/actions/recruit';

import StudentEdit from './student';
import StudentEditOnline from './studentOnline';
import OrderEdit from './order';
import FeeEdit from './fee';
import DropDownButton from '@/components/DropDownButton';

class OrderCreate extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      realName: '',
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
    submitLoading: false,
    reqErroe:false,
  };
  constructor(){
    super();
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_sex', 'is_study']);
  }

  columns = [
    {
        title: '所属区域',
        fixed: 'left',
        width: '120',
        dataIndex: 'regRegionName',
    },
    {
        title: '咨询人员',
        dataIndex: 'benefitPconsultUserName',
        render: (value, record) => {
          var _list = [];
          if(record.benefitPconsultUserName){
            _list.push(<span>{record.benefitPconsultUserName} </span>);
          }
          if(record.benefitFconsultUserName){
            _list.push(<span> {record.benefitFconsultUserName}</span>);
          }
          return <div>{_list}</div>
        }
    },
    {
        title: '学生姓名',
        width: 100,
        dataIndex: 'realName'
    },
    {
        title: '性别',
        width: 50,
        dataIndex: 'gender',
        render: (value) => {
          return getDictionaryTitle(this.state.dic_sex, value)
        }
    },
    {
        title: '目前情况',
        width: 100,
        dataIndex: 'isStudy',
        render: (value) => {
          return getDictionaryTitle(this.state.is_study, value);
        }
    },
    {
        title: '在读高校',
        dataIndex: 'studyUniversityName',
    },
    {
        title: '入学年份',
        width: 80,
        dataIndex: 'studyUniversityEnterYear',
    },
    {
        title: '证件号',
        dataIndex: 'certificateNo',
    },
    {
        title: '手机',
        width: 120,
        dataIndex: 'mobile',
    },
    {
        title: '微信',
        width: 120,
        dataIndex: 'weixin',
    },
    {
        title: 'QQ',
        width: 120,
        dataIndex: 'qq',
    },
    {
        title: '报班',
        fixed: 'right',
        width: '120',
        key: 'action',
        render: (text, record) => {
          
          if(this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) {//线下分部
            return <Button onClick={() => { this.onLookView('EditPersonOnline', record); }}>个人</Button>
          }else{
            return <DropDownButton>
              <Button onClick={() => { this.onLookView('EditClassDirection', record); }}>方向班</Button>
              <Button onClick={() => { this.onLookView('EditClassAmateur', record); }}>精英班</Button>
              <Button onClick={() => { this.onLookView('EditPerson', record); }}>个人</Button>
            </DropDownButton>
          }
         
        },
    }
  ];
  //检索数据
  fetch(params){
      if(!params){
        return;
      }
      var condition = params || this.state.pagingSearch;
      this.setState({ loading: true, pagingSearch: condition });
      this.props.canOrderStudentQuery(condition).payload.promise.then((response) => {
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
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item || {},//编辑对象
    });
  };
  onNextView = (op, dataModel) => {
    this.onLookView(op, dataModel);
  }
  setSubmitLoading = (flag) => {
     this.setState({ submitLoading: flag })
  }
  //视图回调
  onViewCallback = (dataModel, editMode) => {
    if(!dataModel){
      this.setSubmitLoading(false);
      this.setState({ currentDataModel: null, editMode: editMode || 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'CreateByOrderCreate':
        //case 'CreateByStudentManage'
          this.props.studentCreate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              this.setSubmitLoading(false);
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
        //case 'EditByStudentManage'
          this.props.studentUpdate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              this.setSubmitLoading(false);
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
        case 'EditPersonOnline':
          //case 'EditByStudentManage'
            this.props.studentUpdateOnline(dataModel).payload.promise.then((response) => {
                let data = response.payload.data;
                this.setSubmitLoading(false);
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
        case 'OrderPersonOnline':
          this.props.addOrderByHistory(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              this.setSubmitLoading(false);
              if (data.state === 'error') {
                  message.error(data.message);
                  this.setState({
                    reqErroe:true
                  })
              }
              else {
                  //message.success("订单保存成功");
                  //this.fetch();
                  //进入管理页
                  dataModel.orderId = data.data.orderId;
                  dataModel.paymentStatus = data.data.paymentStatus;
                  if(dataModel.orderStatus == 0){
                    message.success("订单暂存成功，提交时会生成正式订单信息！");
                    var d = this.state.currentDataModel;
                    d.orderId = data.data.orderId;
                    this.setState({
                      currentDataModel: d
                    })
                    this.onLookView("Manage");
                  }else {
                    message.success("订单保存成功");
                    // if((dataModel.payeeType == 1 || dataModel.payeeType == 2) && !dataModel.needAudit){
                    //   this.onNextView("Fee", dataModel);
                    // }else {
                    //   this.onLookView("Manage");
                    // }
                    
                    this.onLookView("Manage");
                    
                    
                  }
              }
          })
          //message.error("提交订单逻辑")
          break;
        case 'CreateStudentOnline':
          this.props.studentCreateOnline(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              this.setSubmitLoading(false);
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
          //message.error("提交订单逻辑")
          break;
        case 'Fee':
          message.error("缴费逻辑")
          break;
      }
    }
  }
  changeEeqError=()=>{
    this.setState({
      reqErroe:false
    })
  }
  render(){ 
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'CreateByOrderCreate':
      case 'CreateByStudentManage':
      case 'EditClassDirection':
      case 'EditClassAmateur':
      case 'EditPerson':
          block_content = <StudentEdit
            viewCallback={this.onViewCallback}
            setSubmitLoading={this.setSubmitLoading}
            submitLoading={this.state.submitLoading}
            editMode={this.state.editMode}
            studentId={this.state.currentDataModel.studentId}
            onNextView={this.onNextView}
          />
        break;
      case 'CreateStudentOnline':
      case 'EditPersonOnline':
          block_content = <StudentEditOnline
            viewCallback={this.onViewCallback}
            setSubmitLoading={this.setSubmitLoading}
            submitLoading={this.state.submitLoading}
            editMode={this.state.editMode}
            studentId={this.state.currentDataModel.studentId}
            onNextView={this.onNextView}
          />
         
        break;
      case 'OrderClassDirection':
      case 'OrderClassAmateur':
      case 'OrderPerson':
      case 'OrderPersonOnline':
        block_content = <OrderEdit
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          {...this.state}
          changeEeqError = {this.changeEeqError}
          currentDataModel={this.state.currentDataModel}
          onNextView={this.onNextView}
        />
        break;
      case 'Fee':
        block_content = <FeeEdit
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          orderId={this.state.currentDataModel.orderId}
        />
        break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              form_item_list={[
                {type:'input', name: 'realName', title: '学生姓名', value: this.state.pagingSearch.realName},
                {type:'input', name: 'weixin', title: '微信', value: this.state.pagingSearch.weixin},
                {type:'input', name: 'certificateNo', title: '证件号', value: this.state.pagingSearch.certificateNo},
                {type:'input', name: 'mobile', title: '手机号', value: this.state.pagingSearch.mobile},

                {type:'input', name: 'qq', title: 'QQ', value: this.state.pagingSearch.qq},
                {type:'input', name: 'benefitMarketUserName', title: '市场人员', value: this.state.pagingSearch.benefitMarketUserName},
                {type:'input', name: 'benefitConsultationUserName', title: '咨询人员', value: this.state.pagingSearch.benefitConsultationUserName},
                {type:''}
              ]}
              fetch2={(params) =>this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                {title: '新增学生', needConditionBack: true, callback: () =>{
                  if(this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2){
                      this.onLookView('CreateStudentOnline')
                    }else{
                      this.onLookView('CreateByOrderCreate')
                    }
                      
                  }
                
                },
              ]}
            />
            <div className="space-default">
            </div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{ x: 1400 }}
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
        )
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OrderCreate);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { currentUser } = state.auth;
    return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
      canOrderStudentQuery: bindActionCreators(canOrderStudentQuery, dispatch),
        studentCreate: bindActionCreators(studentCreate, dispatch),
        studentUpdate: bindActionCreators(studentUpdate, dispatch),
        studentCreateOnline: bindActionCreators(studentCreateOnline, dispatch),
        studentUpdateOnline: bindActionCreators(studentUpdateOnline, dispatch),
        createOrder: bindActionCreators(createOrder, dispatch),
        addOrderByHistory: bindActionCreators(addOrderByHistory, dispatch),
        updateOrderByHistory: bindActionCreators(updateOrderByHistory, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
