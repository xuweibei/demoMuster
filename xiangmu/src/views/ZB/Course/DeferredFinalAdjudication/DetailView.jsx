import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal,Radio, Form, Row, Col, Input, Select, Button,message, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
const RadioGroup = Radio.Group;
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24,loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getAuditProductDiscountAuditStatus } from '@/actions/recruit';
import { DeferredAuditSee } from '@/actions/base';
import History from './history'
const dateFormat = 'YYYY-MM-DD';


import { loadDictionary } from '@/actions/dic';

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};


const CheckboxGroup = Checkbox.Group;

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class DetailView extends React.Component {
  constructor(props) {
    super(props)
    
  this.state = {
    result:'1',
    exhibition:props.editMode,
    dataModel: props.currentDataModel,//数据模型
    dic_discountStatus: [],
  };
   
    this.loadBizDictionary = loadBizDictionary.bind(this);

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    console.log(this.props)
    this.loadBizDictionary(['invite_source','visit_status','order_audit_status']);
      this.fetch();
  }
  fetch = () => {
    this.setState({ loading: true })
    let condition = { studentCourseApplyId: this.state.dataModel.studentCourseApplyId};
    this.props.DeferredAuditSee(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        this.setState({ dataModel: { ...data.data, productDiscountType: this.state.dataModel.productDiscountType }, loading: false })
      }
    })
  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
     if (!err) {
       this.setState({ loading: true });
       setTimeout(() => {
         this.setState({ loading: false });
       }, 3000);//合并保存数据
       values.studentCourseApplyId = this.props.currentDataModel.studentCourseApplyId;
       this.props.viewCallback({ ...values });//合并保存数据
     }
   });
 }
  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '延期申请信息';
      return `${op}`;
    }else{  
       op = '特殊延期申请初审';
       return `${op}`;
    }
  }
  historical=()=>{
    this.setState({
      exhibition:'histor'
    })
  }

  onViewCallback=()=>{
    this.setState({
      exhibition:'ViewEdit'
    })
  }
  //表单按钮处理
  renderBtnControl() {
    if(this.props.editMode=='ViewEdit'){
      return <FormItem
                className='btnControl'
                {...btnsearchFormItemLayout}
              > 
                <Button type="primary" onClick={this.onSubmit} icon="rollback">确定</Button>
                <span className="split_button"></span>
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
              </FormItem>
    }
    return <FormItem
      className='btnControl'
      {...btnsearchFormItemLayout}
    >
      <Button onClick={this.onCancel} icon="rollback">返回</Button>
    </FormItem>

  }
  changer = (value) =>{
    console.log(value)
    let invite = this.state.dataModel.inviteSource = value
     
    this.setState({
      invite
    })
  }
  
  //单选框变化的回调
  onChangeRadio=(e)=>{
    if(e.target.value==1){
      //重置表格的
      this.props.form.resetFields()
    }
    this.setState({
      result:e.target.value
    })
  }
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    // JSON.stringify(this.state.dataModel)
    switch (this.state.exhibition) {
      case 'ViewEdit':
        block_content = (
        <Form className="search-form">
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="学生姓名"
              >
                {this.state.dataModel.studentName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="教学点"
              >
               {this.state.dataModel.teacherCenterName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label='证件号'
              >
                 {this.state.dataModel.certificateNo}
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="手机号"
              >
               {this.state.dataModel.mobile}
              </FormItem>
            </Col>

            <Col span={24} >
              <FormItem
                {...searchFormItemLayout24}
                label="课程商品"
              >
                {this.state.dataModel.productName}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="重修"
              >
                 {this.state.dataModel.rehearOrNot==1?'允许':'不允许'}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="课程名称"
              >
                {this.state.dataModel.courseName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="激活日期"
              >
                {timestampToTime(this.state.dataModel.activeTime)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="网课截止日期"
              >
                 {timestampToTime(this.state.dataModel.endTime)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="延期天数"
              >
                {this.state.dataModel.applyDays}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="申请日期"
              >
                 {timestampToTime(this.state.dataModel.createDate)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                style={{ paddingRight: 18 }}
                label="是否为特殊申请"
              >
                {this.state.dataModel.isSpecialApply==0?'否':'是'}
                {
                  this.state.dataModel.courseActiveId?<span style={{marginLeft:30,color:'red',cursor: 'pointer'}} onClick={this.historical}>查看历次申请</span>:''
                }
              </FormItem>
            </Col>
            
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="操作人"
              >
                {this.state.dataModel.createUser}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="申请理由"
              >
                {this.state.dataModel.applyReason}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem {...searchFormItemLayout24} label="终审结果">
                {getFieldDecorator('isPass', {
                  initialValue: dataBind(this.state.dataModel.isAdmitOther),
                  rules: [{
                    required: true, message: '请选择审核结果!',
                  }],
                })(
                  <RadioGroup onChange={(e)=>{this.onChangeRadio(e)}}>
                      <Radio value='1' >审核通过</Radio>
                      <Radio value='0' >审核未通过</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
            <Col span={24}>
            {
                 this.state.result==0?( 
                 <FormItem
                  {...searchFormItemLayout24}
                  label="审核意见"
                >
                  {getFieldDecorator('auditReason', {
                    initialValue: '',
                    rules:[{
                      required: true,message:'请输入审核意见!'
                    }]
                  })(
                    <TextArea/>
                  )}
                </FormItem>)  :  ( 
                <FormItem
                  {...searchFormItemLayout24}
                  label="审核意见"
                >
                  {getFieldDecorator('auditReason', {
                    initialValue: '', 
                  })(
                    <TextArea/>
                  )}
                </FormItem>)
               }
            </Col>
          </Row>

        </Form>)
        break;
      case "View":
      block_content = (
        <Form className="search-form">
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="学生姓名"
              >
                {this.state.dataModel.studentName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="教学点"
              >
               {this.state.dataModel.teacherCenterName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label='证件号'
              >
                 {this.state.dataModel.certificateNo}
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="手机号"
              >
               {this.state.dataModel.mobile}
              </FormItem>
            </Col>

            <Col span={24} >
              <FormItem
                {...searchFormItemLayout24}
                label="课程商品"
              >
                {this.state.dataModel.productName}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="重修"
              >
                 {this.state.dataModel.rehearOrNot==1?'允许':'不允许'}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="课程名称"
              >
                {this.state.dataModel.courseName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="激活日期"
              >
                {timestampToTime(this.state.dataModel.activeTime)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="网课截止日期"
              >
                 {timestampToTime(this.state.dataModel.endTime)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="延期天数"
              >
                {this.state.dataModel.applyDays}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="申请日期"
              >
                 {timestampToTime(this.state.dataModel.createDate)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                style={{ paddingRight: 18 }}
                label="是否为特殊申请"
              >
                {this.state.dataModel.isSpecialApply==0?'否':'是'}

              </FormItem>
            </Col>
            
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="操作人"
              >
                {this.state.dataModel.createUser}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="申请理由"
              >
                {this.state.dataModel.applyReason}
              </FormItem>
            </Col>
            <Col span={12}></Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="审核情况"
              >
                {this.state.dataModel.auditLog}
              </FormItem>
            </Col>
          </Row>

        </Form>
        );
        break; 
      case 'histor':
        block_content = <History
          viewCallback={this.onViewCallback}
          {...this.state}
          id={this.state.dataModel.courseActiveId}
        />
      break;
    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (
     this.state.exhibition=='histor'?block_editModeView: <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
     {block_editModeView}
   </ContentBox>
    );
  }
}

const WrappedDetailView = Form.create()(DetailView);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    DeferredAuditSee: bindActionCreators(DeferredAuditSee, dispatch),
    getAuditProductDiscountAuditStatus: bindActionCreators(getAuditProductDiscountAuditStatus, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDetailView);
