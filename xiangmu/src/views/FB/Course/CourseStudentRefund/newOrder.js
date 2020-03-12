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
  message, Form, Row, Col, Input, InputNumber, Button, Icon, Table, DatePicker,
  Pagination, Divider, Modal, Card, Radio,
  Checkbox,
} from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle,dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox'; 
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24, 
} from '@/utils/componentExt';
import { getCourseStudentRefundSelectOrderOutDetail,NewOrderCostProcessing } from '@/actions/course';
import { loadDictionary } from '@/actions/dic'; 

import Edit from './edit';
 
 
class CourseStudentRefundView extends React.Component {
  index_last: number;

  constructor(props) {
    super(props);
    this.state = {
      dataMain:props.currentDataModel,
      editMode:props.editMode,
      dataModel:props.dataModel || [],
      loading: false,
      UserSelecteds: []
    };
    this.index_last = 0; 
    this.loadBizDictionary = loadBizDictionary.bind(this); 
  }
  componentWillMount() { 
    console.log(this.props)
    this.loadBizDictionary(["dic_YesNo", 'student_change_type', 'payee_type', 'zb_payee_type']); 
  }
 
  columns = [
    {
      title: '订单号',
      fixed:'left',
      width:200,
      dataIndex: 'orderSn', 
    },
    {
      title: '学生姓名',
      width:200,
      dataIndex: 'realName', 
    },
    {
      title: '证件号码',
      width:200,
      dataIndex: 'certificateNo', 
    }, 
    {
      title: '收费方',
      width:200,
      dataIndex: 'payeeTypeName', 
    }, 
    {
      title: '标准价格(￥)',
      width:200,
      dataIndex: 'initialAmount',
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
      title: '优惠金额(￥)',
      width:200,
      dataIndex: 'totalDiscountAmount', 
    },
    {
      title: '实际价格(￥)',
      width:200,
      dataIndex: 'totalAmount', 
    },  
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      fixed:'right',
      width:200,
    }
  ];
   
  onCancel = () => {
    this.props.viewCallback();
  }
 
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      ApplyModel: item,//编辑对象
    });
  };
  
  onViewCallback = (dataModel) => { 
    this.setState({ currentDataModel: null, editMode: 'Manage' }) 
  }
  //点击下一步
  Nextstep = () => {
    console.log(this.props)
    let jsona = [];
    if(!this.state.UserSelectedsArr)return message.warning('请选择一条订单进行操作')
    if(this.props.dataModel.orderCourseProductList.length>0){ 
      this.props.dataModel.orderCourseProductList.forEach((item,index)=>{
        if(index<this.props.dataModel.orderCourseProductList.length-1){ 
          jsona.push({'courseProductId':item.courseProductId,'inNewOrderAmount':Math.round((parseFloat(item.balanceAmount || 0) - parseFloat(item.deductionAmount || 0) + parseFloat(item.returnAmount || 0) - parseFloat(item.ApplicationRefundAmount || 0))*100)/100})
        }
      })
    }  
    let condition = {
      outOrderId:this.props.RefundOrderId,
      inOrderId:this.state.UserSelectedsArr[0].orderId,
      refundTempAmount:this.props.payments,
      refundCourseAmount:this.props.TotalAmount,
      json:JSON.stringify( jsona )
    }  
    this.setState({loading:true})
    this.props.NewOrderCostProcessing(condition).payload.promise.then((response) => {
      let data = response.payload.data; 
      if(data.state == 'success'){ 
        if(data.data.orderCourseProductRefundVoList.length){
          data.data.orderCourseProductRefundVoList.push({
            id:0,
            number:0
          })
          data.data.index_last = data.data.orderCourseProductRefundVoList.length - 1; 
        }
        this.onLookView('Handle',data.data)
      } else{
        message.error(data.msg)
      }
      this.setState({loading:false})
    })
  }
  render() {  
    let block_content = <div></div>  
    switch (this.state.editMode) {   
      case 'Handle':
        block_content = <Edit endViewCallback = {this.props.endViewCallback} OrderViewCallback={this.onViewCallback} {...this.props} {...this.state} />
        break;  
      case 'NewOrder':
      case 'Manage':
      default:
      var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => { 
              this.setState({ UserSelecteds: [selectedRowKeys[selectedRowKeys.length-1]],UserSelectedsArr: [selectedRows[selectedRows.length-1]]})
          },
          // type:'radio'
      }
        block_content = (
          <ContentBox titleName="选择新订单" bottomButton={
            <div>
              <Button onClick={() => this.Nextstep() } icon="save">下一步>新订单费用处理</Button>
              <div className='split_button' style={{ width: 10 }}></div>
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </div>
          }>
            <div className="dv_split"></div>

            <div>
            <Form >
                <Row gutter={24}> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="退费订单号"
                    >
                      {this.state.dataMain.orderSn}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生姓名"
                    >
                      {this.state.dataMain.studentName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="订单归属"
                    >
                      {this.state.dataMain.benefitBranchName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label='学生归属'
                    >
                      {this.state.dataMain.studentRegionName}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="创建人"
                    >
                      {this.state.dataMain.createName}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="创建日期"
                    >
                      {this.state.dataMain.createDate}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="大客户"
                    >
                      {this.state.dataMain.partnerName}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="教学点"
                    >
                      {this.state.dataMain.teachCenterName}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="订单实际金额(￥)"
                    >
                      {formatMoney(this.state.dataMain.totalAmount)}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="收费方"
                    >
                      {this.state.dataMain.payeeTypeStr}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="申请退费总金额(￥)"
                    >
                      {formatMoney(this.state.dataMain.refundAmount)}
                    </FormItem>
                  </Col> 
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="转入新订单金额"
                    >
                      {formatMoney(this.state.dataMain.paidAmount)}
                    </FormItem>
                  </Col>  
                </Row>
              </Form>
            </div>
            
            <div style={{width:'90%',margin:'0 auto'}}>
              <div className="space-default"></div>
                <div>
                  <div style={{height:10}}></div>
                  <div>请选择新订单，点击“下一步》新订单费用处理”操作。</div>
                  <div style={{height:10}}></div>
                </div>
                <div className="search-result-list">
                  <Table columns={this.columns} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.dataMain.refundOrderVoList}//数据
                    scroll={{x:1500}}
                    bordered 
                    rowSelection = {rowSelection}
                  />
                  <div style={{height:30}}></div>
                </div>
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
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getCourseStudentRefundSelectOrderOutDetail: bindActionCreators(getCourseStudentRefundSelectOrderOutDetail, dispatch),
    NewOrderCostProcessing: bindActionCreators(NewOrderCostProcessing, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);

