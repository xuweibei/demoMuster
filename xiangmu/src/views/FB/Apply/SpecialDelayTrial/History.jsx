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
import { getAuditProductDiscountAuditStatus } from '@/actions/recruit';
import { ApplicationForPostponementSee } from '@/actions/base';
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
class History extends React.Component {
  constructor(props) {
    super(props)
    
  this.state = {
    dataModel: props.dataModel,//数据模型
    dic_discountStatus: [],
  };
   
    this.loadBizDictionary = loadBizDictionary.bind(this);

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.loadBizDictionary(['invite_source','visit_status']);
    console.log(this.props)
    //e3cc5be2bb2611e88e9ff8b156c7e183这个id可以查
      this.fetch();
  }
  fetch = () => {
    this.setState({ loading: true })
    console.log(this.state.dataModel)
    let condition = { courseActiveId: this.props.id};
    this.props.ApplicationForPostponementSee(condition).payload.promise.then((response) => {
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
       values.studentInviteId = this.state.dataModel.studentInviteId
       this.props.viewCallback({ ...values });//合并保存数据
     }
   });
 }
  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '机会详细信息'
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
    let invite = this.state.dataModel.inviteSource = value;
    this.setState({
      invite
    })
  }
  //多种模式视图处理
  renderEditModeOfView() {
    console.log(this.state.dataModel)
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
       return block_content = (
          <Form className="search-form">
            <Row gutter={24}>
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
                  label="教学点"
                >
                 {this.state.dataModel.teachCenterName}
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

              <Col span={12} >
                <FormItem
                  {...searchFormItemLayout}
                  label="课程商品"
                >
                  {this.state.dataModel.productName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="课程名称"
                >
                   {this.state.dataModel.courseName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="重修"
                >
                  {this.state.dataModel.isRehear==0?'不允许':'允许'}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
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
              {this.state.dataModel.studentCourseApplyList?this.state.dataModel.studentCourseApplyList.map(e=>{
                  return <div>
                      <Col span={24}>
                          <span style={{marginRight:10}}>{timestampToTime(e.createDate)}</span>{e.isSpecialApply==0? <span style={{marginRight:6}}>延期申请</span>: <span style={{ color: 'red',marginRight:6 }}>特殊延期申请</span>}<span>{e.applyDays}天</span>
                      </Col>
                      <Col span={24}>
                        <FormItem
                          {...searchFormItemLayout24}
                          label="申请理由"
                        >
                          {e.applyReason}
                        </FormItem>
                      </Col>
                      <Col span={24}>
                        <FormItem
                           {...searchFormItemLayout24} 
                          label="审核情况"
                        >
                          {e.auditLog}
                        </FormItem>
                      </Col>
                      </div>
                }):''}
            </Row>

          </Form>)

    
  }

  render() {
    let title ='延期申请信息';
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        {block_editModeView}
      </ContentBox>
    );
  }
}

const WrappedDetailView = Form.create()(History);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    ApplicationForPostponementSee: bindActionCreators(ApplicationForPostponementSee, dispatch),
    getAuditProductDiscountAuditStatus: bindActionCreators(getAuditProductDiscountAuditStatus, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDetailView);
