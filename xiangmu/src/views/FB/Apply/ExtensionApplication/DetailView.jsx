import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber,message } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24,loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { DeferredAuditSee } from '@/actions/base';
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
    dataModel: props.currentDataModel,//数据模型
    dic_discountStatus: [],
  };
   
    this.loadBizDictionary = loadBizDictionary.bind(this);

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.loadBizDictionary(['invite_source','visit_status']);
    this.fetch();
  }
  fetch = () => {
    this.setState({ loading: true })
    let condition = { studentCourseApplyId: this.state.dataModel.studentCourseApplyId };
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
       values.visitDate = formatMoment(values.visitDate);
       values.studentInviteId = this.state.dataModel.studentInviteId;
       this.props.viewCallback({ ...values });//合并保存数据
     }
   });
 }
  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '延期申请信息'
      return `${op}`
    }
  }

  //表单按钮处理
  renderBtnControl() {
    if(this.props.editMode=='ViewEdit'){
      return <FormItem
                className='btnControl'
                {...btnsearchFormItemLayout}
              > 
                <Button type="primary" onClick={this.onSubmit} icon="rollback">保存</Button>
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
    let invite = this.state.dataModel.inviteSource = value
     
    this.setState({
      invite
    })
  }
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    // JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
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

    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
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
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDetailView);
