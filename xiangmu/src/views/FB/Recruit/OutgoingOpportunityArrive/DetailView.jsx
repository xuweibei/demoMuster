import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24,loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getAuditProductDiscountAuditStatus } from '@/actions/recruit';
import { ShareOpportunitySee } from '@/actions/base';
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
    console.log(this.props)
    // if (this.props.editMode == 'View' || this.props.editMode == 'ViewEdit') {
      this.fetch();
    // }else if(this.props.editMode == 'ViewEdit'){
    //   this.fetchEdit()
    // }
  }
  fetch = () => {
    this.setState({ loading: true })
    let condition = { studentInviteId: this.state.dataModel.studentInviteId };
    this.props.ShareOpportunitySee(condition).payload.promise.then((response) => {
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
       console.log(values)
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
    console.log(value)
    let invite = this.state.dataModel.inviteSource = value
     
    this.setState({
      invite
    })
  }
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    console.log(this.state.dataModel.inviteSource)
    // JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case 'ViewEdit':
      block_content = (
        <Form className="search-form">
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="机会类型"
              >
                 {getDictionaryTitle(this.state.invite_source,this.state.dataModel.inviteSource)}
              </FormItem>
            </Col>
           {this.state.dataModel.inviteSource==1&& <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="任务名称"
              >
                {this.state.dataModel.inviteSourceName}
              </FormItem>
            </Col>}
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label='机会区域'
              >
                {this.state.dataModel.regionName}
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="面咨人员"
              >
                {this.state.dataModel.benefitFconsultUserName}
              </FormItem>
            </Col>

            <Col span={12} >
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

                label="学生归属"
              >
                {this.state.dataModel.belongBranchName}
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
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="学生就读高校"
              >
                {this.state.dataModel.studyCampusName}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="机会创建日期"
              >
              {timestampToTime(this.state.dataModel.createDate)}
                {/* <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.applyReason) }}></span> */}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="预约时间"
              >
               {timestampToTime(this.state.dataModel.inviteDate)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="意向项目"
              >
                 {this.state.dataModel.itemName}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                style={{ paddingRight: 18 }}
                label="商品"
              >
                {this.state.dataModel.productName}

              </FormItem>
            </Col>
            
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="机会备注"
              >
                  {this.state.dataModel.inviteContent}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="到访情况"
              >
                  {getFieldDecorator('visitStatus', { initialValue: dataBind(this.state.dataModel.visitStatus) })(
                        <Select>
                        {this.state.visit_status.map((item,i)=>{
                          return <Option value={item.value}>{item.title}</Option>
                        })}
                        
                    </Select>
                  )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="到访日期"
              >
                 {getFieldDecorator('visitDate', {
                    initialValue: dataBind(timestampToTime(this.state.dataModel.visitDate), true),
                    rules: [{
                      required: true, message: '请选择到访日期!',
                    }],
                  })(
                    <DatePicker
                      disabledDate={this.disabledStartDate}
                      format={dateFormat}
                      onChange={this.onStartChange}
                      onOpenChange={this.handleStartOpenChange}
                      placeholder='开始日期'
                    />
                  )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="到访备注"
              >
               {getFieldDecorator('visitRemark', { initialValue:this.state.dataModel.visitRemark})(
               <TextArea/>
               )}
              </FormItem>
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
                  label="机会类型"
                >
                  {getDictionaryTitle(this.state.invite_source,this.state.dataModel.inviteSource)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="任务名称"
                >
                 {this.state.dataModel.inviteSourceName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label='机会区域'
                >
                   {this.state.dataModel.regionName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="面咨人员"
                >
                 {this.state.dataModel.benefitFconsultUserName}
                </FormItem>
              </Col>

              <Col span={12} >
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
                  label="学生归属"
                >
                   {this.state.dataModel.belongBranchName}
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
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学生就读高校"
                >
                  {this.state.dataModel.studyCampusName}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="机会创建日期"
                >
                   {timestampToTime(this.state.dataModel.createDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="预约时间"
                >
                  {timestampToTime(this.state.dataModel.inviteDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="意向项目"
                >
                  {this.state.dataModel.itemName}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="商品"
                >
                  {this.state.dataModel.productName}

                </FormItem>
              </Col>
              
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="机会备注"
                >
                  {this.state.dataModel.inviteContent}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="到访情况"
                >
                  {getDictionaryTitle(this.state.visit_status,this.state.dataModel.visitStatus)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="到访日期"
                >
                  {timestampToTime(this.state.dataModel.visitDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="反馈人"
                >
                  {this.state.dataModel.replyUserName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="反馈日期"
                >
                  {timestampToTime(this.state.dataModel.replyDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="到访备注"
                >
                  {this.state.dataModel.visitRemark}
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
    let title =this.props.editMode=='View'?'机会详情信息':'机会反馈信息修改';
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
    ShareOpportunitySee: bindActionCreators(ShareOpportunitySee, dispatch),
    getAuditProductDiscountAuditStatus: bindActionCreators(getAuditProductDiscountAuditStatus, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDetailView);
