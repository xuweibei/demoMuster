 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import { env } from '@/api/env'; 
import { loadBizDictionary,onToggleSearchOption, onSearch, onPageIndexChange, onShowSizeChange , renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout} from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic'; 
import { VariousOfPrepaidCostOrder } from '@/actions/base';

import ContentBox from '@/components/ContentBox';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents'; 

class OrderQuery extends React.Component {
  constructor(props){
    super(props);
    this.state= {
        onOff:true,
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: env.defaultPageSize,
        groupId:'',
        type:'',
        zbPayeeType:'',
        startDate:props.pagingSearch.startDate,
        endDate:props.pagingSearch.endDate,
        orderType:'',
        payeeType:'',
        studentName:'',
        orderSn:'',
        confirmStatus:'',
        financeStatus:props.editMode=='surePay'?'2':props.editMode=='toBePay'?'1':''
  
      },
      data_list: [],
      loading: false,
      totalRecord: 0,
      currentDataModel: {},
      isShowQrCodeModal: false,
      deleteId:'',
      ButtonProps:false, 
      recruitBatchName:''
    };
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo','order_type','zb_payee_type','course_arrange_status','payee_type','payment_way','confirm_status','order_status']);
    console.log(this.props) 
    this.onSearch();
  }

  columns = [
    {
        title: '项目',
        width:120,
        fixed:'left',
        dataIndex: 'items'
    },
    {
        title: '订单号',
        dataIndex: 'orderSn',
        render:(text,record)=>{
            let orderSnArr = record.orderSn.split(',');
            let orderId = record.orderId.split(',');   
            let arr  =[]
            for(let i = 0;i<orderSnArr.length;i++){
               arr.push(  <a onClick={() => { this.onLookView('ViewOrder', { orderId:orderId[i],studentId:record.studentId}); }}>{orderSnArr[i]}</a>)
              if(i<orderSnArr.length-1){
                arr.push('、') 
              }
            } 
            return arr 
        }
    },
    {
        title: '学生姓名',
        dataIndex: 'studentName'
    },
    {
        title: '订单类型',
        dataIndex: 'orderType',
        render:(text,record)=>{
            return getDictionaryTitle(this.state.order_type,record.orderType)
        }
    },
    {
        title: '大客户名称',
        dataIndex: 'partnerName',
    },
    {
        title: '收费方',
        dataIndex: 'payeeType',
        render:(text,record)=>{
            return getDictionaryTitle(this.state.payee_type,record.payeeType)
        }
    },
    {
        title: '签约公司',
        dataIndex: 'zbPayeeType',
        render: (text,record)=>{
            return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
        }
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount', 
    },
    {
        //title: '挂单金额(¥)',
        //dataIndex: 'restingAmount',
        title: '缴费金额(¥)',
        dataIndex: 'money', 
    },
    {
        title: '缴费日期',
        dataIndex: 'payDate',
        render:(text,record)=>{
            return timestampToTime(record.payDate)
        }
    },
    {
        title: '缴费情况',
        dataIndex: 'confirmStatus',
        render:(text,record)=>{
            return getDictionaryTitle(this.state.confirm_status,record.confirmStatus)
        }
    },
    {
        title: '缴费方式',
        dataIndex: 'payWay',
        render:(text,record)=>{
            return getDictionaryTitle(this.state.payment_way,record.payWay)
        }
    },
    {
        title: '确认情况',
        dataIndex: 'financeStatus',
        render:(text,record)=>{
            return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
        }
    },
    {
        title: '确认日期',
        fixed:'right',
        width:120,
        dataIndex: 'confirmDate',
        render:(text,record)=>{
            return timestampToTime(record.confirmDate)
        }
    }
  ];
//按大客户
columnsBig = [
  {
    title:'分部',
    width:120,
    fixed:'left',
    dataIndex:'barchName'
  },
  {
      title: '项目',
      dataIndex: 'items'
  },
  {
      title: '订单号',
      dataIndex: 'orderSn',
      render:(text,record)=>{
        let orderSnArr = record.orderSn.split(',');
        let orderId = record.orderId.split(',');   
        let arr  =[]
        for(let i = 0;i<orderSnArr.length;i++){
           arr.push(  <a onClick={() => { this.onLookView('ViewOrder', { orderId:orderId[i],studentId:record.studentId}); }}>{orderSnArr[i]}</a>)
          if(i<orderSnArr.length-1){
            arr.push('、') 
          }
        } 
        return arr 
      }
  },
  {
      title: '学生姓名',
      dataIndex: 'studentName'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
  },
  {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '缴费金额(¥)',
      dataIndex: 'money', 
  },
  {
      title: '缴费日期',
      dataIndex: 'payDate',
      render:(text,record)=>{
          return timestampToTime(record.payDate)
      }
  },
  {
      title: '缴费情况',
      dataIndex: 'confirmStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.confirmStatus)
      }
  },
  {
      title: '缴费方式',
      dataIndex: 'payWay',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payment_way,record.payWay)
      }
  },
  {
      title: '确认情况',
      dataIndex: 'financeStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
      }
  },
  {
      title: '确认日期',
      fixed:'right',
      width:120,
      dataIndex: 'confirmDate',
      render:(text,record)=>{
          return timestampToTime(record.confirmDate)
      }
  }
];

//按高校
columnsHigh = [
  {
    title:'分部',
    width:120,
    fixed:'left',
    dataIndex:'barchName'
  },
  {
      title: '项目',
      dataIndex: 'items'
  },
  {
      title: '订单号',
      dataIndex: 'orderSn',
      render:(text,record)=>{
        let orderSnArr = record.orderSn.split(',');
        let orderId = record.orderId.split(',');   
        let arr  =[]
        for(let i = 0;i<orderSnArr.length;i++){
           arr.push(  <a onClick={() => { this.onLookView('ViewOrder', { orderId:orderId[i],studentId:record.studentId}); }}>{orderSnArr[i]}</a>)
          if(i<orderSnArr.length-1){
            arr.push('、') 
          }
        } 
        return arr 
      }
  },
  {
      title: '学生姓名',
      dataIndex: 'studentName'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '大客户名称',
      dataIndex: 'partnerName',
  },
  {
      title: '校区',
      dataIndex: 'zbPayeeTypeStr',
  },
  {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
  },
  {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '缴费金额(¥)',
      dataIndex: 'money', 
  },
  {
      title: '缴费日期',
      dataIndex: 'payDate',
      render:(text,record)=>{
          return timestampToTime(record.payDate)
      }
  },
  {
      title: '缴费情况',
      dataIndex: 'confirmStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.confirmStatus)
      }
  },
  {
      title: '缴费方式',
      dataIndex: 'payWay',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payment_way,record.payWay)
      }
  },
  {
      title: '确认情况',
      dataIndex: 'financeStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
      }
  },
  {
      title: '确认日期',
      fixed:'right',
      width:120,
      dataIndex: 'confirmDate',
      render:(text,record)=>{
          return timestampToTime(record.confirmDate)
      }
  }
];

//按高校校区

columnsCampus = [
  {
    title:'分部',
    width:120,
    fixed:'left',
    dataIndex:'barchName'
  },
  {
      title: '项目',
      dataIndex: 'items'
  },
  {
      title: '订单号',
      dataIndex: 'orderSn',
      render:(text,record)=>{
        let orderSnArr = record.orderSn.split(',');
        let orderId = record.orderId.split(',');   
        let arr  =[]
        for(let i = 0;i<orderSnArr.length;i++){
           arr.push(  <a onClick={() => { this.onLookView('ViewOrder', { orderId:orderId[i],studentId:record.studentId}); }}>{orderSnArr[i]}</a>)
          if(i<orderSnArr.length-1){
            arr.push('、') 
          }
        } 
        return arr 
      }
  },
  {
      title: '学生姓名',
      dataIndex: 'studentName'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '大客户名称',
      dataIndex: 'partnerName',
  },
  {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
  },
  {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '缴费金额(¥)',
      dataIndex: 'money', 
  },
  {
      title: '缴费日期',
      dataIndex: 'payDate',
      render:(text,record)=>{
          return timestampToTime(record.payDate)
      }
  },
  {
      title: '缴费情况',
      dataIndex: 'confirmStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.confirmStatus)
      }
  },
  {
      title: '缴费方式',
      dataIndex: 'payWay',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payment_way,record.payWay)
      }
  },
  {
      title: '确认情况',
      dataIndex: 'financeStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
      }
  },
  {
      title: '确认日期',
      fixed:'right',
      width:120,
      dataIndex: 'confirmDate',
      render:(text,record)=>{
          return timestampToTime(record.confirmDate)
      }
  }
];

//项目

columnsProject = [
  {
    title:'分部',
    width:120,
    fixed:'left',
    dataIndex:'barchName'
  },
  {
      title: '订单号',
      dataIndex: 'orderSn',
      render:(text,record)=>{
        let orderSnArr = record.orderSn.split(',');
        let orderId = record.orderId.split(',');   
        let arr  =[]
        for(let i = 0;i<orderSnArr.length;i++){
           arr.push(  <a onClick={() => { this.onLookView('ViewOrder', { orderId:orderId[i],studentId:record.studentId}); }}>{orderSnArr[i]}</a>)
          if(i<orderSnArr.length-1){
            arr.push('、') 
          }
        } 
        return arr 
      }
  },
  {
      title: '学生姓名',
      dataIndex: 'studentName'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '大客户名称',
      dataIndex: 'partnerName',
  },
  {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
  },
  {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '缴费金额(¥)',
      dataIndex: 'money', 
  },
  {
      title: '缴费日期',
      dataIndex: 'payDate',
      render:(text,record)=>{
          return timestampToTime(record.payDate)
      }
  },
  {
      title: '缴费情况',
      dataIndex: 'confirmStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.confirmStatus)
      }
  },
  {
      title: '缴费方式',
      dataIndex: 'payWay',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payment_way,record.payWay)
      }
  },
  {
      title: '确认情况',
      dataIndex: 'financeStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
      }
  },
  {
      title: '确认日期',
      fixed:'right',
      width:120,
      dataIndex: 'confirmDate',
      render:(text,record)=>{
          return timestampToTime(record.confirmDate)
      }
  }
];

//按班型

columnsClassType = [
  {
    title:'分部',
    width:120,
    fixed:'left',
    dataIndex:'barchName'
  },
  {
      title: '项目',
      dataIndex: 'items'
  },
  {
      title: '订单号',
      dataIndex: 'orderSn',
      render:(text,record)=>{
        let orderSnArr = record.orderSn.split(',');
        let orderId = record.orderId.split(',');   
        let arr  =[]
        for(let i = 0;i<orderSnArr.length;i++){
           arr.push(  <a onClick={() => { this.onLookView('ViewOrder', { orderId:orderId[i],studentId:record.studentId}); }}>{orderSnArr[i]}</a>)
          if(i<orderSnArr.length-1){
            arr.push('、') 
          }
        } 
        return arr 
      }
  },
  {
      title: '学生姓名',
      dataIndex: 'studentName'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '大客户名称',
      dataIndex: 'partnerName',
  },
  {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
  },
  {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '缴费金额(¥)',
      dataIndex: 'money', 
  },
  {
      title: '缴费日期',
      dataIndex: 'payDate',
      render:(text,record)=>{
          return timestampToTime(record.payDate)
      }
  },
  {
      title: '缴费情况',
      dataIndex: 'confirmStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.confirmStatus)
      }
  },
  {
      title: '缴费方式',
      dataIndex: 'payWay',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.payment_way,record.payWay)
      }
  },
  {
      title: '确认情况',
      dataIndex: 'financeStatus',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
      }
  },
  {
      title: '确认日期',
      fixed:'right',
      width:120,
      dataIndex: 'confirmDate',
      render:(text,record)=>{
          return timestampToTime(record.confirmDate)
      }
  }
]; 

showCoump=()=>{
    var block_columns = '';
    switch(this.props.press){
      //分部
      case 'columns':
         block_columns = this.columns;
      break;
      //大客户
      case 'customerColumns':
         block_columns = this.columnsBig;
      break;
      //高校
      case 'universitiesColumns':
         block_columns = this.columnsHigh;
      break;
      //高校校区
      case 'campusColumns':
         block_columns = this.columnsCampus;
      break;
      //项目
      case 'projectColumns':
         block_columns = this.columnsProject;
      break;
      //班型
      case 'typeColumns':
         block_columns = this.columnsClassType;
      break;
      default:
         block_columns = ''
    }
    return block_columns;
  }
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  }; 
  
  onCancel = () => {
    this.props.viewCallback();
  }
  //检索数据
  fetch(params){
      var condition = params || this.state.pagingSearch;
      if(this.state.onOff){
        //已确认缴费
        if(this.props.editMode == 'surePay'){
          condition.financeStatus = '2';
        }  
        //待确认缴费
        if(this.props.editMode == 'toBePay'){
          condition.financeStatus = '1';
        }
        //临时缴费
        if(this.props.editMode == 'shortPay'){
          condition.confirmStatus = '1';
        }
        //中博待确认
        if(this.props.editMode == 'zbToBePay'){
          condition.zbjyType = '1';
          condition.financeStatus = '1';
        }
        //非中博待确认
        if(this.props.editMode == 'notToBePay'){
          condition.zbjyType = '2';
          condition.financeStatus = '1';
        }
      }
      //个人缴费
      if(this.props.editMode == 'perOrder'){
        condition.orderType = '1';
      }
      //大客户缴费
      if(this.props.editMode == 'bigOrder'){
        condition.orderType = '2';
      }
      let time = this.state.pagingSearch.startDate;
      let endTime = this.state.pagingSearch.endDate;
      if(time){
        condition.startDate = time;
      }
      if(endTime){
        condition.endDate = endTime;
      }
      condition.type = this.typeNum(this.props.press);
      condition.groupId = this.props.currentDataModel.groupId; 
      this.setState({ loading: true, pagingSearch: condition });
      this.props.VariousOfPrepaidCostOrder(condition).payload.promise.then((response) => {
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
  typeNum = (value)=>{
    switch(value){
        case 'columns':
            return 1;
        case 'customerColumns':
            return 3;
        case 'universitiesColumns':
            return 4;
        case 'campusColumns':
            return 5;
        case 'projectColumns':
            return 6;
        case 'typeColumns':
            return 7
    }
 }  
 typeName = (value)=>{
    switch(value){
        case 'columns':
            return '分部';
        case 'customerColumns':
            return '大客户';
        case 'universitiesColumns':
            return '高校';
        case 'campusColumns':
            return '高校校区';
        case 'projectColumns':
            return '项目';
        case 'typeColumns':
            return '班型';
    }
 }
 onViewCallback = () => {
      this.setState({  editMode: 'Manage' })
 }
  render(){ 
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>;
        let extendButtons = []; 
        extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);

        if(this.state.editMode == 'ViewOrder'){
            console.log(this.state.currentDataModel)
            return  block_content = <OrderDetailView viewCallback={this.onViewCallback}
            studentId={this.state.currentDataModel.studentId}
            orderId={this.state.currentDataModel.orderId}
            //isDirection={this.state.currentDataModel.orderType == 1 && this.state.currentDataModel.partnerClassType == 1}
            tab={3}
          />
        }
        block_content = (
        <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={this.typeName(this.props.press)} >
                                            {getFieldDecorator('recruitBatchId', { initialValue:'' })(
                                            <div>{this.props.currentDataModel.groupName}</div>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'缴费时间'} >
                                            {getFieldDecorator('startDate', { initialValue: '' })(
                                                <div>
                                                    {
                                                        this.props.pagingSearch.startDate?
                                                        this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                                    }
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'财务确认时间'} >
                                            {getFieldDecorator('confirmDateStart', { initialValue: ''})(
                                                <div>
                                                    {
                                                        this.props.pagingSearch.confirmDateStart?
                                                        this.props.pagingSearch.confirmDateStart+(this.props.pagingSearch.confirmDateEnd?'至'+this.props.pagingSearch.confirmDateEnd:'至今'):'全部'
                                                    }
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'签约公司'} >
                                            {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
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
                                    </Col>
                                    <Col span={12}>
                                        {
                                        this.props.press != 'customerColumns'?
                                            <FormItem {...searchFormItemLayout} label={'订单类型'} >
                                                {getFieldDecorator('orderType', { initialValue: this.state.pagingSearch.orderType })(
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.order_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>:''
                                        }
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'确认情况'} >
                                            {getFieldDecorator('financeStatus', { initialValue: this.state.pagingSearch.financeStatus })(
                                                <Select onChange={()=>{
                                                    this.setState({
                                                        onOff:false
                                                    })
                                                }}>
                                                    <Option value=''>全部</Option>
                                                    {
                                                        this.state.course_arrange_status.filter(e=>e.value!=0).map(item=>{
                                                            return <Option value={item.value}>{item.title}</Option>
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'缴费情况'} >
                                            {getFieldDecorator('confirmStatus', { initialValue: this.state.pagingSearch.confirmStatus })(
                                                <Select onChange={()=>{
                                                    this.setState({
                                                        onOff:false
                                                    })
                                                }}>
                                                    <Option value=''>全部</Option>
                                                    {
                                                        this.state.confirm_status.map(item=>{
                                                            return <Option value={item.value}>{item.title}</Option>
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'订单号'} >
                                            {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                                <Input placeholder="请输入订单号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                <Input placeholder="请输入学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}></Col>
                                </Row>
                            </Form>
                        }
                    </ContentBox>
            <div className="space-default">
            </div>
            <div className="search-result-list">
            <Table columns={
                this.showCoump()
            } //列定义
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
        </div>)

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
        VariousOfPrepaidCostOrder: bindActionCreators(VariousOfPrepaidCostOrder, dispatch), 
        loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
