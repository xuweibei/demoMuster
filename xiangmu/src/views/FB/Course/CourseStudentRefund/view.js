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
  message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
  Pagination, Divider, Modal, Card, Radio,
  Checkbox,
} from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import NumericInput from '@/components/NumericInput';
const RadioGroup = Radio.Group;
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import { getCourseStudentRefundSelectOrderOutDetail } from '@/actions/course';
import { loadDictionary } from '@/actions/dic';
import FileUploader from '@/components/FileUploader';

//import CourseStudentMoveSubmit from './submit';


class CourseStudentRefundView extends React.Component {
  index_last: number;

  constructor(props) {
    super(props);
    this.state = {
      newWord:'',
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
  componentWillMount() {
    this.loadBizDictionary(["dic_YesNo", 'student_change_type', 'payee_type', 'zb_payee_type']);
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
      dataIndex: 'produceName',
      render: (text, record, index) => {
        if (index < this.index_last) {
          return <span>{text}</span>
        }
        return {
          children: <span>合计：</span>,
          props: {
            colSpan: 6,
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
      width: 60,
      dataIndex: 'teachModeName',
      render: this.renderContent,
    },
    {
      title: '是否赠送',
      width: 60,
      dataIndex: 'isGive',
      //render: text => getDictionaryTitle(this.state.dic_YesNo, text)
      render: (text, record, index) => {
        return this.renderContent(getDictionaryTitle(this.state.dic_YesNo, text), record, index)
      }
    },
    {
      title: '收费方',
      width: 80,
      dataIndex: 'payeeType',
      render: (text, record, index) => {
        return this.renderContent(getDictionaryTitle(this.state.payee_type, text), record, index)
      }
    },
    {
      title: '公司',
      width: 80,
      dataIndex: 'payeeType',
      render: (text, record, index) => {
        return this.renderContent(getDictionaryTitle(this.state.zb_payee_type, text), record, index)
      }
    },
    {
      title: '子商品缴费金额(￥)',
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
      title: '扣费金额(￥)',
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
      dataIndex: 'balanceAmount',
      width: 120,
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
      title: '补扣费金额(￥)',
      dataIndex: 'deductionAmount',
      //render: text => <Input value={text}/>
      render: (text, record, index) => {
        if (index < this.index_last && this.state.isCloseOrderState == '2') {
          return <NumericInput value={record.deductionAmount}
            onChange={(value) => this.onAmountChange(value, index, 1)} />
        }
        if (index < this.index_last && this.state.isCloseOrderState == '3') {
          return <span>{0.00}</span>
        }
        var amount = 0;
        if (this.state.isCloseOrderState == '2') {
          this.state.dataModel.orderCourseProductList.map(item => {
            amount += parseFloat(item.deductionAmount || 0);
          })
        }
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '扣费返还金额(￥)',
      dataIndex: 'returnAmount',
      //render: text => <Input value={text}/>
      render: (text, record, index) => {
        if (index < this.index_last) {
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
      title: '补退费金额(￥)',
      dataIndex: 'addRefundAmount',
      //render: text => <Input value={text}/>
      render: (text, record, index) => {
        if (index < this.index_last && this.state.isCloseOrderState == '3') {
          return <NumericInput value={record.addRefundAmount}
            onChange={(value) => {
              this.onAmountChange(value, index, 3)
            }} />
        }
        else if (index < this.index_last && this.state.isCloseOrderState == '2') {
          return <span style={{ color: 'red' }}>{formatMoney(record.courrAddRefundAmount || 0)}</span>

        }
        if (this.state.isCloseOrderState == '3') {
          var amount = 0;
          this.state.dataModel.orderCourseProductList.map(item => {
            amount += parseFloat(item.addRefundAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span style={{ color: 'red' }}>{formatMoney(amount)}</span>
        }
        else {
          var amount = 0;

          this.state.dataModel.orderCourseProductList.map(item => {
            amount += parseFloat(item.courrAddRefundAmount == '' ? 0 : item.courrAddRefundAmount)
          })
          amount = Math.round(amount*100)/100;
          return <span style={{ color: 'red' }}>{formatMoney(amount)}</span>
        }

      }
    },
  ];

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
          message.error("“补扣费金额”和“扣费返还余额”只能填写一项");
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
          message.error("“补扣费金额”和“扣费返还余额”只能填写一项");
          return;
        }
        record.returnAmount = value;
        record.addRefundAmount = 0;
      } else if (type == 3) {
        //补退费金额
        //“补退费金额不大于“最高补退费金额”
        var _value = parseFloat(value == '' ? '0' : value);
        record.courrAddRefundAmount = Math.round((parseFloat(record.balanceAmount || 0) - parseFloat(record.deductionAmount || 0) + parseFloat(record.returnAmount || 0))*100)/100;
        if (_value > (record.courrAddRefundAmount)) {
          message.error("“补退费金额”不能大于“最高补退费金额");
          return;
        }
        record.addRefundAmount = value;
      }
    }

    record.courrAddRefundAmount = Math.round((parseFloat(record.balanceAmount || 0) - parseFloat(record.deductionAmount || 0) + parseFloat(record.returnAmount || 0))*100)/100;
    
    let courrAddRefundAmountTotal = 0;
    lst.map(list => {
      courrAddRefundAmountTotal += parseFloat(list.courrAddRefundAmount);
    })

    if(courrAddRefundAmountTotal == 0){
      this.setState({
        newWord: 2
      })
    }else{
      this.setState({
        newWord: 3
      })
    }
    
    this.setState({
      dataModel: dm
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

        // if (data.data.orderStatus == 4) {
        //   this.setState({ isCloseOrderState: '2' });
        // }
        // else {
        //   this.setState({ isCloseOrderState: '3' });
        // } 
        this.setState({ isCloseOrderState: '2' });
        if(data.data.totalAmount && data.data.totalAmount != 0){
          this.setState({
            newWord:'3'
          })
        }else if(data.data.totalAmount == 0 ){ 
          this.setState({
            newWord:'2'
          })
        }
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

  onCountPrice = () => {
    var amount = 0;
    if (this.state.isCloseOrderState == '3') {
      this.state.dataModel.orderCourseProductList.map(item => {
        amount += parseFloat(item.addRefundAmount || 0);
      })
    } else if (this.state.isCloseOrderState == '2') {
      this.state.dataModel.orderCourseProductList.map(item => {
        amount += item.courrAddRefundAmount;
      })
      amount += this.state.dataModel.paidTempAmount;
    }
    amount = Math.round(amount*100)/100;
    return formatMoney(amount)
  }

  onCancel = () => {
    this.props.viewCallback();
  }

  onSubmit = () => {
    var that = this;
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      if (!err) {
        that.setState({ loading: true });
        setTimeout(() => {
          that.setState({ loading: false });
        }, 3000);//合并保存数据
        //let extraRefundAmount = 0;
        let outAmount = 0;
        let json = '';
        // if (this.state.isCloseOrderState == '2') {
        //   extraRefundAmount = this.state.dataModel.paidTempAmount ;
        // } else {
        //   extraRefundAmount = values.extraRefundAmount;
        // }
        let postData = {};
        json = this.state.dataModel.orderCourseProductList
          .filter((item, index) => {
            return (index + 1 < this.state.dataModel.orderCourseProductList.length)
          })
          .map((item, index) => {
            let addRefundAmount = this.state.isCloseOrderState == '2' ? item.courrAddRefundAmount : item.addRefundAmount;
            if (item.orderCourseProductId) {
              outAmount += parseFloat(addRefundAmount);
              outAmount = Math.round(outAmount*100)/100;
              return {
                orderCourseProductId: item.orderCourseProductId,//课程商品ID
                deductionAmount: item.deductionAmount,//补扣金额
                returnAmount: Math.round(item.returnAmount*100)/100,//扣费返还金额
                addRefundAmount: Math.round(addRefundAmount*100)/100,//补退费金额
              }
            }
          });

        if (this.state.isCloseOrderState == '2') {
          outAmount += parseFloat(this.state.dataModel.paidTempAmount);
        }

        postData = {
          outOrderId: this.state.dataModel.orderId,
          changeType: this.state.isCloseOrderState,
          filePath: values.filePath,
          outAmount: Math.round(outAmount*100)/100 || 0,
          json: JSON.stringify(json),
          studentBankAccountName:values.studentBankAccountName,
          studentBankAccountNo:values.studentBankAccountNo,
          studentBankName:values.studentBankName
        };

        if(that.state.dataModel.totalAmount == 0){
          postData.changeType = '2'
        }

        postData.changeType = '2';//退费

        let onOff = 'sure';
        that.props.viewCallback({ ...postData,onOff });
      }
    });
  }
  render() {  
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    switch (this.state.editMode) {
      case 'Submit':
        block_content = <CourseStudentMoveSubmit viewCallback={this.onViewCallback}
          currentDataModel={this.state.currentDataModel}
        />
        break;
      case 'Manage':
      default:
        block_content = (
          <ContentBox titleName="订单课程费用处理" bottomButton={
            <div>
              <Button onClick={() => this.onSubmit()} icon="save">确定退学</Button>
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
                      退学
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="订单号"
                    >
                      {this.state.dataModel.orderSn}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生姓名"
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
                      {timestampToTime(this.state.dataModel.createDate)}
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
                      {formatMoney(this.state.dataModel.totalAmount)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="已缴金额(￥)"
                    >
                      {formatMoney(this.state.dataModel.paymentAmount)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="正式缴费金额(￥)"
                    >
                      {formatMoney(this.state.dataModel.paidAmount)}
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
                      label="临时缴费金额(￥)"
                    >
                      {formatMoney(this.state.dataModel.paidTempAmount)}
                    </FormItem>
                  </Col>

                  {(this.state.dataModel.orderStatus == 4 || this.state.isCloseOrderState == '2') && <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="临时缴费金额退费"
                    >
                      {formatMoney(this.state.dataModel.paidTempAmount)}
                    </FormItem>
                  </Col>
                  }
                  {
                    (this.state.newWord == 2 && this.onCountPrice() == 0 )?<div><Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生户名"
                    >
                     {getFieldDecorator('studentBankAccountName', {
                      initialValue: '', 
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
                        initialValue: '', 
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
                        initialValue: '',
                        // rules: [{ 
                        //   validator:(rule,value,callback)=>{
                        //     console.log(rule,value)
                        //     let a  = /^[1-9]\d*$/;
                        //     if(!value){
                        //       callback()
                        //     }else{
                        //       if(a.test(value)){
                        //         callback()
                        //       }else{
                        //         callback([new Error('输入必须为纯数字')])
                        //       }
                        //     }
                        //   }
                        // }],
                      })(
                        <Input placeholder= '请输入学生银行账号' />
                      )}
                    </FormItem>
                  </Col>
                  </div> :''
                  }
                  {
                    (this.state.newWord == 2 && Number(this.onCountPrice().replace(',','')) > 0 )?<div><Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生户名"
                    >
                     {getFieldDecorator('studentBankAccountName', {
                      initialValue: '', 
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
                        initialValue: '', 
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
                        initialValue: '',
                        
                      })(
                        <Input placeholder= '请输入学生银行账号' />
                      )}
                    </FormItem>
                  </Col>
                  </div> :''
                  }
                  {
                    ( this.state.newWord == 3 )?<div><Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="学生户名"
                    >
                     {getFieldDecorator('studentBankAccountName', {
                      initialValue: '', 
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
                        initialValue: '', 
                        rules: [{ 
                          required:true,message:"请输入学生开户行"
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
                        initialValue: '',
                        rules: [{ 
                          required:true,message:"请输入学生银行账号"
                        }]
                      })(
                        <Input placeholder= '请输入学生银行账号' />
                      )}
                    </FormItem>
                  </Col>
                  </div> :''
                  }
                  <Col span={24}></Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label='附件'>
                      {getFieldDecorator('filePath', {
                        initialValue: '',
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
                    scroll={{x:1500}}
                    bordered
                    footer={() => <Row justify='center' type='flex'><span className='font-large'>此学生订单退费总金额：{this.onCountPrice()}</span></Row>}
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
    getCourseStudentRefundSelectOrderOutDetail: bindActionCreators(getCourseStudentRefundSelectOrderOutDetail, dispatch),
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);

