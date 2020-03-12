/*
学生异动管理 第三步 转出订单费用处理
2018-05-16
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import { loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import NumericInput from '@/components/NumericInput';

import { courseStudentOutOrderDetailQuery } from '@/actions/course';
import { loadDictionary } from '@/actions/dic';

import CourseStudentMoveSubmit from './submit';

class CourseStudentMoveFee extends React.Component {
  index_last: number;
  constructor(props){
    super(props);
    this.state = {
      editMode: '',
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
  componentWillMount(){
    this.loadBizDictionary(["dic_YesNo"]);
    this.fetch2();
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

  columns = [
    {
        title: '商品名称',
        width:150,
        fixed:'left',
        dataIndex: 'courseProductName',
        render: (text, record, index) => {
          if(index < this.index_last){
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
        width: 120,
        dataIndex: 'produceName',
        render: this.renderContent,
    },
    {
        title: '授课类型',
        width: 100,
        dataIndex: 'teachModeName',
        render: this.renderContent,
    },
    {
        title: '是否赠送',
        width: 100,
        dataIndex: 'isGive',
        //render: text => getDictionaryTitle(this.state.dic_YesNo, text)
        render: (text, record, index) => {
          return this.renderContent(getDictionaryTitle(this.state.dic_YesNo, text), record, index)
        }
    },
    {
        title: '子商品缴费金额(￥)',
        width: 140,
        dataIndex: 'productAmount',
        //render: text => <span>{formatMoney(text)}</span>
        render: (text, record, index) => {
          if(index < this.index_last){
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.dataModel.orderCourseProductList.map(item => {
            amount += (item.productAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '扣费金额(￥)',
        width: 120,
        dataIndex: 'productDeductAmount',
        //render: text => <span>{formatMoney(text)}</span>
        render: (text, record, index) => {
          if(index < this.index_last){
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.dataModel.orderCourseProductList.map(item => {
            amount += (item.productDeductAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '已退费金额(￥)',
        width: 120,
        dataIndex: 'productRefundAmount',
        //render: text => <span>{formatMoney(text)}</span>
        render: (text, record, index) => {
          if(index < this.index_last){
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.dataModel.orderCourseProductList.map(item => {
            amount += (item.productRefundAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '当前余额(￥)',
        dataIndex: 'balanceAmount',
        width: 120,
        //render: text => <span>{formatMoney(text)}</span>
        render: (text, record, index) => {
          if(index < this.index_last){
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.dataModel.orderCourseProductList.map(item => {
            amount += (item.balanceAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '补扣费金额(￥)',
        dataIndex: 'deductionAmount',
        fixed:'right',
        //render: text => <Input value={text}/>
        render: (text, record, index) => {
          if(index < this.index_last){
            return <NumericInput style={{width:"60%"}} value={record.deductionAmount}
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
        title: '扣费返还金额(￥)',
        dataIndex: 'returnAmount',
        fixed:'right',
        //render: text => <Input value={text}/>
        render: (text, record, index) => {
          if(index < this.index_last){
            return <NumericInput style={{width:"60%"}} value={record.returnAmount}
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
        title: '补退费金额(￥)',
        dataIndex: '',
        width:100,
        fixed:'right',
        render: (text, record, index) => {
          if(index < this.index_last){
            return <span>{formatMoney(Math.round((parseFloat(record.balanceAmount) - parseFloat(record.deductionAmount) + parseFloat(record.returnAmount))*100)/100)}</span>
          }
          var amount = 0;
          this.state.dataModel.orderCourseProductList.map(item => {
            amount += parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0)
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    }
  ];
  onAmountChange(value, index, type){
    var dm = this.state.dataModel;
    var lst = dm.orderCourseProductList;
    if(lst && lst.length > index){
      var record = lst[index];
      if(type == 1){
        //补扣费金额
        //补扣费金额”不大于“当前余额
        var _value = parseFloat(value);
        if(_value > record.balanceAmount){
          message.error("“补扣费金额”不能大于“当前余额”");
          return;
        }
        else if(_value != 0 &&  record.returnAmount!=0 ){
          message.error("“补扣费金额”和“扣费返还余额”只能填写一项");
          return;
        }
        //record.deductionAmount = _value;
        record.deductionAmount = value;
      }else if(type == 2){
        //扣费返还金额
        //“扣费返还金额不大于“扣费金额”
        var _value = parseFloat(value);
        if(_value > record.productDeductAmount){
          message.error("“扣费返还金额”不能大于“扣费金额”");
          return;
        }
        else if(_value != 0 &&  record.deductionAmount!=0 ){
          message.error("“补扣费金额”和“扣费返还余额”只能填写一项");
          return;
        }
        //record.returnAmount = _value;
        record.returnAmount = value;
      }
    }
    this.setState({
      dataModel: dm
    })

  }
  //检索数据
  fetch2(){
      this.props.courseStudentOutOrderDetailQuery(this.props.outOrderId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            data.data.orderCourseProductList.map(item => {
              item.deductionAmount = 0;
              item.returnAmount = 0;
              item.deductionReturnAmount = item.balanceAmount;
            })
            data.data.orderCourseProductList.push({
            })
            this.index_last = data.data.orderCourseProductList.length - 1;
            this.setState({
              dataModel: data.data,
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
    if(op == "Submit"){
      //var outAmount = this.state.dataModel.payBalanceAmount;
      var outAmount = this.state.dataModel.paidTempAmount;
      var json = [];
      this.state.dataModel.orderCourseProductList.map(item => {
        if(item.orderCourseProductId){
          json.push({
            orderCourseProductId: item.orderCourseProductId,
            deductionAmount: item.deductionAmount,
            returnAmount: item.returnAmount,
          })
          outAmount += parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0)
        }
      })
      outAmount = Math.round(outAmount*100)/100;
      this.setState({
        editMode: op,//编辑模式
        currentDataModel: {
          inOrderId: this.props.inOrderId,
          outOrderId: this.state.dataModel.orderId,
          outAmount: outAmount,
          json: json,
          //filePath: this.state.filePath
        }
      });
    }else {
      this.setState({
          editMode: op,//编辑模式
      });
    }
  };
  //视图回调
  onViewCallback = (dataModel, isToFirst) => {
    if(isToFirst){
      this.props.viewCallback(null, isToFirst);
      return;
    }
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Add':
          //delete dataModel.parentOrgid;
          this.props.createCoursePlanAdd(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  this.fetch2();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })

          break;
        case 'Additional':
          //delete dataModel.parentOrgid;
          this.props.createCoursePlanAdditional(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  this.fetch2();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })
          break;
      }
    }
  }

  onCancel = () => {
    this.props.viewCallback();
  }

  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Submit':
        block_content = <CourseStudentMoveSubmit viewCallback={this.onViewCallback}
          currentDataModel={this.state.currentDataModel}
        />
        break;
      case 'Manage':
      default:
        block_content = (
          <ContentBox titleName="异动" bottomButton={
            <div>
              <Button onClick={() => this.onLookView('Submit')} icon="edit">下一步》转入订单设置</Button>
              <span className="split_button"></span>
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </div>
          }>
            <div className="dv_split"></div>
          <div style={{width:'90%'}}>
            <SearchForm
              num_column={2}
              form_item_list={[
                {type:'text', value: this.state.dataModel.orderSn, title: '转出订单号'},
                {type:'text', value: this.state.dataModel.realName, title: '学生姓名'},
                {type:'text', value: this.state.dataModel.orderBranchName, title: '订单归属'},
                {type:'text', value: this.state.dataModel.studentBranchName, title: '学生归属'},
                {type:'text', value: this.state.dataModel.createUName, title: '创建人'},
                {type:'text', value: timestampToTime(this.state.dataModel.createDate), title: '创建日期'},
                {type:'text', value: this.state.dataModel.partnerName, title: '大客户'},
                {type:'text', value: this.state.dataModel.teachCenterName, title: '教学点'},
                {type:'text', value: formatMoney(this.state.dataModel.totalAmount), title: '订单实际金额(￥)'},
                {type:'text', value: formatMoney(this.state.dataModel.paidAmount), title: '已缴金额(￥)'},
                {type:'text', value: this.state.dataModel.payeeTypeName, title: '收费方'},
                //{type:'text', value: formatMoney(this.state.dataModel.payBalanceAmount), title: '缴费余额(￥)'},
                {type:'text', value: formatMoney(this.state.dataModel.paidTempAmount), title: '临时缴费金额(￥)'},
                //{type:'file_uploader', name:'filePath', title: '附件',span:24,need_callback: true},
              ]}
              hideTopButtons={true}
              hideBottomButtons={true}
              onCallback={(value) => {
                this.setState({filePath:value});
              }}
            />
            <div className="space-default"></div>
            <div style={{margin:'15px 0'}}>学生转出订单已缴费课程商品的费用处理：</div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                scroll={{x:1330}}
                dataSource={this.state.dataModel.orderCourseProductList}//数据
                bordered
              />
              <div className="space-default"></div>
            </div>
          </div>
            <div className="dv_split"></div>
          </ContentBox>
        )
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseStudentMoveFee);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseStudentOutOrderDetailQuery: bindActionCreators(courseStudentOutOrderDetailQuery, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
