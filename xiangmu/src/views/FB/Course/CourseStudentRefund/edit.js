/*
退费退学申请--订单课程费用处理
2018-06-01
suicaijiao
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, InputNumber, Table, DatePicker,
  Pagination, Divider, Modal, Card, Radio,
  Checkbox,
} from 'antd';
const confirm = Modal.confirm;
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle,dataBind,formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox'; 
import NumericInput from '@/components/NumericInput';
import FileDownloader from '@/components/FileDownloader'; 
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24, 
} from '@/utils/componentExt';
import { getCourseStudentRefundSelectOrderOutDetail,MatchNewOrdersSave,EndApplicationSubmission } from '@/actions/course';
import { loadDictionary } from '@/actions/dic';
import FileUploader from '@/components/FileUploader';
import NewOrder from './newOrder.js' 
 
class CourseStudentRefundView extends React.Component {
  index_last: number;

  constructor(props) {
    super(props);
    this.state = {
      Transmit:{
        refundTotalAmount:0,
        refundTempAmount:0,
        applicationDate:'', 
        studentBankAccountName:'',
        studentBankName:'',
        studentBankAccountNo:''
      },
      paidMax:0,//其中临时缴费申请退费金额最高限额
      refundMin:0,//申请退费总金额最低限额
      commodities:0,//课程商品退费申请总金额
      TotalAmount:0,//转入新订单总金额
      payments:0,//临时缴费金额余额
      editMode:props.editMode,
      dataModel: {

        orderCourseProductList: []
      },
      loading: false,
      UserSelecteds: []
    };
    this.index_last = 0;
    (this: any).fetch2 = this.fetch2.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).onAmountChange = this.onAmountChange.bind(this);
  }
  componentWillMount() { 
    this.loadBizDictionary(["dic_YesNo", 'student_change_type', 'payee_type', 'zb_payee_type']);
    // this.fetch2();
    if(this.props.editMode == 'MoveS'){
      this.fetch2()
    } 
    if(this.props.editMode == 'Handle'){
      
      this.setState({
        Submission:this.props.ApplyModel
      })
    }
  }

  renderContent = (value, row, index) => {
    const obj = {
      children: value,
      props: {},
    };
    if (index === this.index_last) {
      obj.props.colSpan = 0;
    }
    return obj;
  };

  renderContentProps = (value, row, index) => {
    const obj = {
      children: value,
      props: {},
    };
    if (index === this.props.ApplyModel.index_last) {
      obj.props.colSpan = 0;
    }
    return obj;
  };
  //选择订单列表
  columns = [
    {
      title: '商品名称',
      width: 160,
      dataIndex: 'produceName', 
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{text}</span>
        }
        return {
          children: <span>合计：</span>,
          props: {
            colSpan: 4,
          },
        }
      }
    },
    {
      title: '子商品名称',
      dataIndex: 'courseProductName',
      render: this.renderContent,
    },
    {
      title: '授课类型',
      width: 160,
      dataIndex: 'teachModeName',
      render: this.renderContent,
    }, 
    {
      title: '是否赠送',
      width: 120,
      dataIndex: 'isGive', 
      render: (text, record, index) => {
        return this.renderContent(getDictionaryTitle(this.state.dic_YesNo, text), record, index)
      }
    }, 
    {
      title: '商品价格(￥)',
      width: 120,
      dataIndex: 'productAmount',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => {
          amount += parseFloat(item.productAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '子商品缴费金额(￥)',
      dataIndex: 'productAmount',
      width: 160,
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => {
          amount += parseFloat(item.productAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '扣费金额(￥)',
      width: 160,
      dataIndex: 'productDeductAmount',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => {
          amount += parseFloat(item.productDeductAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    }, 
    {
      title: '已退费金额(￥)',
      width: 160,
      dataIndex: 'productRefundAmount',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => {
          amount += parseFloat(item.productRefundAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    }, 
    {
      title: '当前余额(￥)',
      width: 160,
      dataIndex: 'balanceAmount',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => {
          amount += parseFloat(item.balanceAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    }, 
    {
      title: '补扣费金额(¥)(-)',
      width: 160,
      dataIndex: 'deductionAmount',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last ) {
          return <NumericInput value={record.deductionAmount}
            onChange={(value) => this.onAmountChange(value, index, 1)} />
        } 
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => {
          amount += parseFloat(item.deductionAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    }, 
    {
      title: '扣费返还金额(¥)(+)',
      width: 160,
      dataIndex: 'returnAmount',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last ) {
          return <NumericInput value={record.returnAmount}
            onChange={(value) => this.onAmountChange(value, index, 2)} />
        } 
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => {
          amount += parseFloat(item.returnAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    }, 
    {
      title: '申请退费金额(¥)(-)',
      width: 160,
      dataIndex: 'ApplicationRefundAmount',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last ) {
          return (index == this.index_last-1) ? <NumericInput disabled value={record.ApplicationRefundAmount} /> : <NumericInput value={record.ApplicationRefundAmount}
            onChange={(value) => this.onAmountChange(value, index, 3)} 
            />
        } 
        var amount = 0;
        this.state.dataModel.orderCourseProductList.map(item => { 
            amount += parseFloat(item.ApplicationRefundAmount || 0); 
        })
        amount = Math.round(amount*100)/100; 
        return <span>{formatMoney(amount)}</span>
      }
    }, 
    {
      title: '转入新订单金额(￥)',
      dataIndex: 'productRefundAmountNew',
      width: 160, 
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{(record.balanceAmount - record.deductionAmount + record.returnAmount - record.ApplicationRefundAmount).toFixed(2) }</span>
        }
        var amount = 0; 
        this.state.dataModel.orderCourseProductList.map((item,data) => { 
          amount += parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0) - parseFloat(item.ApplicationRefundAmount || 0) ;
        })
        amount = Math.round(amount*100)/100;

        return <span>{formatMoney(amount)}</span>
      }
    }
  ];
  //提交申请列表
  columnsHa = [
    {
      title: '商品名称',
      dataIndex: 'productName', 
      width:120,
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{text}</span>
        }
        return {
          children: <span>合计：</span>,
          props: {
            colSpan: 5,
          },
        }
      }
    },
    {
      title: '子商品名称',
      dataIndex: 'courseProductName',
      render: this.renderContentProps,
      width:120
    },
    {
      title: '授课类型',
      dataIndex: 'teachModeName',
      render: this.renderContentProps,
      width:120
    },
    {
      title: '是否赠送',
      dataIndex: 'isGive',
      render: this.renderContentProps,
      width:120
    },
    {
      title: '旧订单是否存在',
      dataIndex: 'isExistsOldOrder',
      render: this.renderContentProps,
      width:120
    },
    {
      title: '商品标准价格(￥)',
      dataIndex: 'initialPrice',
      width: 160,
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.props.ApplyModel.orderCourseProductRefundVoList.map(item => {
          amount += parseFloat(item.initialPrice || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '当前商品优惠金额(￥)',
      dataIndex: 'discountAmount',
      width: 160,
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.props.ApplyModel.orderCourseProductRefundVoList.map(item => {
          amount += parseFloat(item.discountAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '当前商品实际价格(￥)',
      dataIndex: 'productAmount',
      width: 160,
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.props.ApplyModel.orderCourseProductRefundVoList.map(item => {
          amount += parseFloat(item.productAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '退费订单转入新订单金额(￥)',
      width: 160,
      dataIndex: 'inNewOrderAmount', 
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.props.ApplyModel.orderCourseProductRefundVoList.map(item => {
          amount += parseFloat(item.inNewOrderAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '核算后商品实际价格(￥)',
      dataIndex: 'calcuProductAmount',
      width:160, 
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.props.ApplyModel.orderCourseProductRefundVoList.map(item => {
          amount += parseFloat(item.calcuProductAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '核算后商品标准金额(￥)',
      dataIndex: 'calcuInitialPrice',
      width:160, 
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.props.ApplyModel.orderCourseProductRefundVoList.map(item => {
          amount += parseFloat(item.calcuInitialPrice || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '核算后商品优惠金额(￥)',
      dataIndex: 'calcuDiscountAmount', 
      width:160, 
      render: (text, record, index) => {
        if (index < this.props.ApplyModel.index_last) {
          return <span>{formatMoney(text)}</span>
        }
        var amount = 0;
        this.props.ApplyModel.orderCourseProductRefundVoList.map(item => {
          amount += parseFloat(item.calcuDiscountAmount || 0);
        })
        amount = Math.round(amount*100)/100;
        // console.log(amount,'列表')
        return <span>{formatMoney(amount)}</span>
      }
    },
  ]
  onAmountChange(value, index, type) {  
    var dm = this.state.dataModel;
    var lst = dm.orderCourseProductList; 
    this.setState({ countPri: formatMoney(value) });
    if (lst && lst.length > index) {
      var record = lst[index];
      if (type == 1) {
        //补扣费金额
        //补扣费金额”不大于“当前余额
        var _value = parseFloat(value == '' ? '0' : value);
        if (_value > record.balanceAmount) {
          message.error("“补扣费金额”不能大于“当前余额”");
          return;
        }
        else if (_value != 0 && record.returnAmount != 0) {
          message.error("“补扣费金额”和“扣费返还金额”只能填写一项");
          return;
        }

        record.deductionAmount = value;
        record.addRefundAmount = 0;
      } else if (type == 2) {
        //扣费返还金额
        //“扣费返还金额不大于“扣费金额”
        var _value = parseFloat(value == '' ? '0' : value);
        if (_value > record.productDeductAmount) {
          message.error("“扣费返还金额”不能大于“扣费金额”");
          return;
        }
        else if (_value != 0 && record.deductionAmount != 0) {
          message.error("“补扣费金额”和“扣费返还金额”只能填写一项");
          return;
        }
        record.returnAmount = value;
        record.addRefundAmount = 0;
      } else if (type == 3) { 
        //申请退费金额
        //申请退费金额”不能大于“当前余额” - “补扣费金额” + “扣费返还金额
        var _value = parseFloat(value == '' ? '0' : value); 
        if(_value > (record.balanceAmount - record.deductionAmount + record.returnAmount)){
          message.error("“申请退费金额”不能大于“当前余额” - “补扣费金额” + “扣费返还金额”");
          return;
        }
        record.ApplicationRefundAmount = value;
      }
    }
    
    var record = lst[index]; 
    var amount = 0; 
    let lastTotalNum = 0;
    lst.forEach((item,key) => {
      amount += parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0) - parseFloat(item.ApplicationRefundAmount || 0) ;
      if(key < (lst.length-2)){
        lastTotalNum += parseFloat(item.ApplicationRefundAmount)
      }
    }) 
    amount = Math.round(amount*100)/100;

    //计算最后一项金额
    if(type == 3){
      let finalNum = Math.round((this.state.commodities - lastTotalNum)*100)/100;
      if(finalNum<0){
        message.error("“申请退费总金额”不能大于“课程商品退费申请总金额”");
        return;
      }
      if(lst[lst.length-2].balanceAmount >= finalNum){
        lst[lst.length-2].ApplicationRefundAmount = finalNum;
      }
    }
    
    record.courrAddRefundAmount = Math.round((parseFloat(record.balanceAmount || 0) - parseFloat(record.deductionAmount || 0) + parseFloat(record.returnAmount || 0))*100)/100;
    this.setState({
      dataModel: dm,
      TotalAmount:amount
    })

  }
  //检索数据
  fetch2() {
    this.setState({loading:true})
    this.props.getCourseStudentRefundSelectOrderOutDetail({ orderId: this.props.currentDataModel.orderId }).payload.promise.then((response) => {
      let data = response.payload.data; 
      if (data.state === 'success') {
        if(data.data.orderCourseProductList.length){

          data.data.orderCourseProductList.map(item => {
            item.ApplicationRefundAmount = 0;
            item.deductionAmount = 0;
            item.returnAmount = 0;
            item.addRefundAmount = 0;
            item.deductionReturnAmount = item.balanceAmount;
            item.courrAddRefundAmount = Math.round((parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0))*100)/100;
          })
          data.data.orderCourseProductList.push({
            courrAddRefundAmount: 0,
            addRefundAmount: 0,
          })
        }
        this.index_last = data.data.orderCourseProductList.length - 1; 
        var amount = 0;
        data.data.orderCourseProductList.forEach(item => {
          amount += parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0) - parseFloat(item.ApplicationRefundAmount || 0) ;
        }) 
        amount = Math.round(amount*100)/100;
        this.setState({
          dataModel: data.data,
          loading: false,
          TotalAmount:amount,
          paidMax:data.data.paidTempAmount,
          payments:data.data.paidTempAmount
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  } 

  onCancel = () => {
    this.props.viewCallback();
  }
 
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  onViewCallback = (dataModel) => { 
      this.setState({ currentDataModel: null, editMode: 'Manage' }) 
  }
  //计算缴费子商品退费分摊
  showConfirm = () => {
    if(!this.state.commodities)return message.warning('请输入金额进行计算');
    let that = this;
    confirm({
      title: '此操作将修改课程商品的“申请退费分摊金额”，您确定此操作吗?',
      content: '',
      onOk() { 
        let pp = 0; 
        let last = 0;
        let { dataModel } = that.state;
        if(dataModel.orderCourseProductList.length){ 
          var amount = 0; 
          //计算当前余额的合
          dataModel.orderCourseProductList.forEach(item=>{
            if(item.balanceAmount){
              pp += item.balanceAmount;
              pp = Math.round(pp*100)/100;
            }
          }) 
          //计算申请退费金额的比例金额
          dataModel.orderCourseProductList.forEach(item=>{
            if(item.ApplicationRefundAmount == 0 || item.ApplicationRefundAmount){ 
              item.ApplicationRefundAmount = Math.round((that.state.commodities * item.balanceAmount/pp)*100)/100;
            }
          }) 
          dataModel.orderCourseProductList.forEach((item,index)=>{  
            if(dataModel.orderCourseProductList.length-2 > 0 && index < dataModel.orderCourseProductList.length-2){
              last += parseFloat(item.ApplicationRefundAmount || 0); 
            } 
          })  
          
          //这里的目的是为了，如果计算出来的金额有小数导致申请退费金额的合不等于课程商品退费申请总金额，就让最后一条数据的值手动计算 
          if( dataModel.orderCourseProductList.length-2 > 0 ){//多条数据的时候 
              dataModel.orderCourseProductList[dataModel.orderCourseProductList.length-2].ApplicationRefundAmount = Math.round((that.state.commodities - last)*100)/100;
          }else if(dataModel.orderCourseProductList.length == 2){//只有一条数据的时候
              dataModel.orderCourseProductList[dataModel.orderCourseProductList.length-2].ApplicationRefundAmount = that.state.commodities;
          } 
          dataModel.orderCourseProductList.map((item,data) => { 
            amount += parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0) - parseFloat(item.ApplicationRefundAmount || 0) ;
          })
          amount = Math.round(amount*100)/100;
          // console.log(amount,'计算')
          that.setState({
            dataModel, 
            TotalAmount:amount
          })
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  //保存>匹配新订单
  saveOrder = () => {
    let that = this;
    that.props.form.validateFields((err, values) => {  
        if (!err) {
        if( that.state.dataModel.orderCourseProductList.length == 0 && values.refundTotalAmount != values.refundTempAmount ){
          message.warning('没有课程商品，申请退费总金额与临时缴费申请退费金额必须相等')
          return
        }
        confirm({
          title: '按提示创建新订单后，方可顺利进行新订单匹配，您确定已创建新订单？',
          content: '',
          onOk() { 
                  let all = 0;
                  that.state.dataModel.orderCourseProductList.forEach(item=>{
                    all += parseFloat(item.ApplicationRefundAmount || 0); 
                    all = Math.round(all*100)/100;
                  })
                  if(that.state.dataModel.orderCourseProductList.length && all != that.state.commodities){
                    return message.error('申请退费金额合计与课程商品退费申请总金额不相等')
                  }
                  let condition = {
                    orderId:that.state.dataModel.orderId,
                    refundAmount:that.state.commodities,
                    inOrderAmount:that.state.TotalAmount,
                    payeeType:that.state.dataModel.payeeType
                  }
                  that.setState({loading:true, Transmit:values})
                  that.props.MatchNewOrdersSave(condition).payload.promise.then((response) => {
                      let data = response.payload.data; 
                      if(data.state == 'success'){ 
                        that.onLookView('NewOrder',data.data) 
                      }else{
                        message.error(data.msg)
                      }
                        that.setState({loading:false})
                    }
                  )
            // that.MatchNewOrdersSave().payload.promise.then((response) => {
            //   let data = response.payload.data;
            // })
            console.log('OK');
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      }
     }
    )
  }
  //申请退费总金额变化时
  refundChange = (value)=>{ 
    this.props.form.validateFields(['refundTotalAmount','refundTempAmount'], (err, values) => {  
        var kk;  
        if (value >= values.refundTempAmount) {
            kk = value - values.refundTempAmount; 
            if( this.state.dataModel.paidTempAmount > value ){
              this.setState({ 
                paidMax:value
              })
            }else{ 
              this.setState({ 
                paidMax:this.state.dataModel.paidTempAmount
              })
            }
            this.setState({
              commodities:kk,
              refundMin:values.refundTempAmount,
            })
        }else if( value < values.refundTempAmount){ 
          message.error('申请退费总金额不能低于临时缴费申请退费金额')
        } else if(value == 0){
          this.setState({
            commodities:value,
            refundMin:value,
            paidMax:value
          })
        }
      }
    )
  }
  //临时缴费申请退费金额变化时
  paidChange = (value)=>{  
    this.props.form.validateFields(['refundTotalAmount','refundTempAmount'], (err, values) => { 
      var kk;  
          if(values.refundTotalAmount && value <= values.refundTotalAmount) {
              kk = values.refundTotalAmount - value;  
              if( this.state.dataModel.paidTempAmount > value ){
                this.setState({ 
                  paidMax:values.refundTotalAmount
                })
              }else{ 
                this.setState({ 
                  paidMax:this.state.dataModel.paidTempAmount
                })
              }
              this.setState({
                commodities:kk, 
                refundMin:value, 
                payments: Math.round((this.state.dataModel.paidTempAmount-value)*100)/100
              })
          }else if (( values.refundTotalAmount == 0 || values.refundTotalAmount ) && value > values.refundTotalAmount){
             
              this.setState({ 
                paidMax:values.refundTotalAmount
              }) 
 
            message.error('临时缴费申请退费金额不能大于申请退费总金额')
          }else{ 
              this.setState({ 
                paidMax:this.state.dataModel.paidTempAmount,
                payments:Math.round((this.state.dataModel.paidTempAmount-value)*100)/100
              })  
          }  
      }
    )
  }
  //提交申请
  ApplicationForSubmission = () => {   
    let that = this;
    confirm({
    title: '提交申请后，进入审批流程，不可进行修改，您确定提交申请吗？',
    content: '',
    onOk() {  
          let jsona = []; 
          if(that.props.dataModel.orderCourseProductList.length>0){ 
            that.props.dataModel.orderCourseProductList.forEach((item,index)=>{
              if(index<that.props.dataModel.orderCourseProductList.length-1){ 
                jsona.push({'orderCourseProductId':item.orderCourseProductId,'deductionAmount':item.deductionAmount,'deductReturnAmount':item.returnAmount,'refundAmount':item.ApplicationRefundAmount,'inNewOrderAmount':Math.round((parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0) - parseFloat(item.ApplicationRefundAmount || 0))*100)/100})
              }
            })
          } 
          let condition = {
            outOrderId:that.props.RefundOrderId,
            inOrderId:that.props.UserSelectedsArr[0].orderId,
            refundTotalAmount:that.props.Transmit.refundTotalAmount,
            refundTempAmount:that.props.Transmit.refundTempAmount,
            applicationDate:formatMoment(that.props.Transmit.applicationDate),
            filePath:that.props.Transmit.filePath,
            studentBankAccountName:that.props.Transmit.studentBankAccountName,
            studentBankName:that.props.Transmit.studentBankName,
            studentBankAccountNo:that.props.Transmit.studentBankAccountNo,
            json: JSON.stringify(jsona),
          } 
          that.props.EndApplicationSubmission(condition).payload.promise.then((response) => {
              let data = response.payload.data; 
              if(data.state == 'success'){
                message.success('申请提交成功!')
                that.props.endViewCallback()
              }else{
                message.error(data.msg)
              }
              that.setState({loading:false})
            }
          )
          },
          onCancel() {
            console.log('Cancel');
          },
    });
  }
  render() {   
    let block_content = <div></div> 
    const { getFieldDecorator } = this.props.form;
    switch (this.state.editMode) { 
      case 'NewOrder': 
        block_content = <NewOrder endViewCallback = {this.props.endViewCallback} viewCallback={this.onViewCallback} Required = {this.state} {...this.state} RefundOrderId={this.state.dataModel.orderId}/>
        break; 
      case 'Handle':
      block_content = (
        <ContentBox titleName="新订单费用处理情况" bottomButton={
          <div>
            <Button onClick={() =>this.ApplicationForSubmission()} icon="save">提交申请</Button>
            <div className='split_button' style={{ width: 10 }}></div>
            <Button onClick={()=>this.props.OrderViewCallback()} icon="rollback">返回</Button>
          </div>
        }>
          <div className="dv_split"></div>

          <div>
          <Form >
              <Row gutter={24}>
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="新订单号"
                  >
                    {this.state.Submission.orderSn}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="学生姓名"
                  >
                    {this.state.Submission.studentName}
                  </FormItem>
                </Col>  
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单归属"
                  >
                    {this.state.Submission.benefitBranchName}
                  </FormItem>
                </Col>  
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="学生归属"
                  >
                    {this.state.Submission.studentBranchName}
                  </FormItem>
                </Col>  
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单标准金额(￥)"
                  >
                    {this.state.Submission.totalInitialAmount}
                  </FormItem>
                </Col>  
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="优惠总金额(￥)"
                  >
                    {this.state.Submission.totalDiscountAmount}
                  </FormItem>
                </Col>  
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单实际金额(￥)"
                  >
                    {this.state.Submission.totalAmount}
                  </FormItem>
                </Col>  
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="收费方"
                  >
                    {this.state.Submission.payeeTypeStr}
                  </FormItem>
                </Col>  
                <Col span={12}>
                  退费订单转入缴费金额(￥)：{this.state.Submission.paidAmount}
                </Col>
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="课程商品转入缴费金额(￥)"
                  >
                    {formatMoney(this.state.Submission.formalTotalAmount)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="临时缴费转入缴费余额(￥)"
                  >
                    {formatMoney(this.state.Submission.tempTotalAmount)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
          
          <div style={{width:'90%',margin:'0 auto'}}>
            <div className="space-default"></div>
              <div>
                <div style={{height:10}}></div>
                <div>新订单课程商品的价格信息</div>
                <div style={{height:10}}></div>
              </div>
              <div className="search-result-list">
                <Table columns={this.columnsHa} //列定义
                  loading={this.state.loading}
                  pagination={false}
                  dataSource={this.props.ApplyModel.orderCourseProductRefundVoList}//数据
                  scroll={{x:2100}}
                  bordered 
                />
                <div style={{height:30}}></div>
              </div>
            </div>
        </ContentBox>
      )
      break;
      case 'MoveS':
      case 'Manage':
      default: 
        block_content = (
          <ContentBox titleName="选择新订单" bottomButton={
            <div>
              <Button onClick={() =>this.saveOrder() } icon="save">保存>匹配新订单</Button>
              <div className='split_button' style={{ width: 10 }}></div>
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </div>
          }>
            <div className="dv_split"></div>

            <div>
            <Form >
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      {...searchFormItemLayout24}
                      label="申请类型"
                    >
                      {'退费'}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="退费订单号"
                    >
                      {this.state.dataModel.orderSn}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生姓名"
                    >
                      {this.state.dataModel.realName}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="订单归属"
                    >
                      {this.state.dataModel.orderBranchName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生归属"
                    >
                      {this.state.dataModel.studentBranchName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="创建人"
                    >
                      {this.state.dataModel.createUName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="创建日期"
                    >
                      {this.state.dataModel.createDate}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="大客户"
                    >
                      {this.state.dataModel.partnerName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="教学点"
                    >
                      {this.state.dataModel.teachCenterName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="订单实际金额(￥)"
                    >
                      {this.state.dataModel.totalAmount}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="收费方"
                    >
                      {this.state.dataModel.payeeTypeName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="缴费总金额(￥)"
                    >
                      {Number(this.state.dataModel.paidAmount || 0) + Number(this.state.dataModel.paidTempAmount || 0)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="临时缴费金额(￥)"
                    >
                      {this.state.dataModel.paidTempAmount}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="申请退费总金额(￥)"
                    >
                      {getFieldDecorator('refundTotalAmount', {
                        initialValue:this.state.Transmit.refundTotalAmount, 
                        rules: [{ 
                          required:true,message:"请输入申请退费总金额"
                        }]
                      })(
                        <InputNumber style={{width:'100px'}} onChange={(data)=>this.refundChange(data)} max={this.state.dataModel.paymentBalance} min={ this.state.refundMin } placeholder='请输入' />
                      )
                      }
                      <span style={{color:'red'}}>最高{this.state.dataModel.paymentBalance}元</span>
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="临时缴费申请退费金额"
                    >
                      {getFieldDecorator('refundTempAmount', {
                        initialValue:this.state.Transmit.refundTempAmount, 
                        rules: [{ 
                          required:true,message:"请输入临时缴费申请退费金额"
                        }]
                      })(
                        <InputNumber style={{width:'100px'}} onChange={(data)=>this.paidChange(data)}  max={this.state.paidMax} min={0} placeholder='请输入' />
                      )
                      }
                      <span>最高{this.state.dataModel.paidTempAmount}元</span>
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="课程商品退费申请总金额"
                    >
                      <span style={{marginRight:'6px'}}>{this.state.commodities}</span>
                      <Button onClick = {()=>this.showConfirm()}>计算缴费子商品退费分摊</Button>
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="申请日期"
                    >
                      {getFieldDecorator('applicationDate', {
                        initialValue: this.state.Transmit.applicationDate ?moment(formatMoment(this.state.Transmit.applicationDate), dateFormat) :'', 
                        rules: [{ 
                          required:true,message:"请选择日期"
                        }]
                      })(
                        <DatePicker />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}> 
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生户名"
                    >
                     {getFieldDecorator('studentBankAccountName', {
                        initialValue: this.state.Transmit.studentBankAccountName, 
                      rules: [{ 
                        required:true,message:"请输入学生户名"
                      }]
                    })(
                        <Input placeholder='请输入学生户名' />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生开户行"
                    >
                      {getFieldDecorator('studentBankName', {
                        initialValue: this.state.Transmit.studentBankName, 
                        rules: [{ 
                          required:true,message:"请输入学生户行"
                        }]
                      })(
                        <Input placeholder = '请输入学生开户行' />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生银行账号"
                    >
                      {getFieldDecorator('studentBankAccountNo', {
                        initialValue: this.state.Transmit.studentBankAccountNo, 
                        rules: [{ 
                          required:true,message:"请输入学生银行账号"
                        }] 
                      })(
                        <Input placeholder= '请输入学生银行账号' />
                      )}
                    </FormItem>
                  </Col>  
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout}
                      label='附件'
                      extra={!this.state.dataModel.fileUrl?<p style={{color:'red'}}>文件类型为rar、zip</p> : <div><FileDownloader
                          apiUrl={'/edu/file/getFile'}//api下载地址
                          method={'post'}//提交方式
                          options={{ filePath: this.state.dataModel.fileUrl }}
                          title={'下载附件'}
                      >
                      </FileDownloader><p style={{color:'red'}}>文件类型为rar、zip</p></div>}>
                          {getFieldDecorator('filePath', {
                              initialValue: dataBind(this.state.dataModel.fileUrl),
                              // rules: [{
                              //     required: true, message: '请选择上传文件!',
                              //   }],
                              
                          })(
                              <FileUploader />
                          )}
                      </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
            
            <div style={{width:'90%',margin:'0 auto'}}>
              <div className="space-default"></div>
                <div>
                  <div style={{height:10}}></div>
                  <div>学生转出订单已缴费课程商品的费用处理：</div>
                  <div style={{height:10}}></div>
                </div>
                <div className="search-result-list">
                  <Table columns={this.columns} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.dataModel.orderCourseProductList}//数据
                    scroll={{x:2100}}
                    bordered 
                    footer={() => <Row justify='center' type='flex'><span style={{fontSize:'20px',fontWeight:'1000',marginRight:'60px'}}>转入新订单总金额(¥)：{formatMoney(this.state.TotalAmount)}+<span style={{color:'#ff366d'}}>临时缴费金额余额{Number(this.state.payments).toFixed(2)},共计：{(Number(this.state.TotalAmount)+Number(this.state.payments)).toFixed(2)}元</span></span></Row>}
                  />
                  <div style={{height:30}}></div>
                </div>
                <div style={{fontSize:'20px',marginBottom:'30px',fontWeight:'1000'}}> 提示：在进行“下一步>匹配新订单”前，请首先创建学生新订单，需审核的要求审核通过。且新订单收费方为“ <span style={{color:'#ff366d'}}>{this.state.dataModel.payeeTypeName}</span>”，订单最低金额为：<span style={{color:'#ff366d'}}>{(Number(this.state.TotalAmount)+Number(this.state.payments)).toFixed(2)}</span>元。</div>
              </div>
          </ContentBox>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseStudentRefundView);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getCourseStudentRefundSelectOrderOutDetail: bindActionCreators(getCourseStudentRefundSelectOrderOutDetail, dispatch),
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //保存匹配新订单
    MatchNewOrdersSave: bindActionCreators(MatchNewOrdersSave, dispatch),
    //提交申请
    EndApplicationSubmission: bindActionCreators(EndApplicationSubmission, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);

