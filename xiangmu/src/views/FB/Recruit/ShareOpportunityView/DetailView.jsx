import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber,message } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { auditDiscountRuleDetail, getAuditProductDiscountAuditStatus } from '@/actions/recruit';




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

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    console.log(this.state.dataModel)
    // if (this.props.editMode == 'View') {
    //   this.fetch();
    // }
  }
  // fetch = () => {
  //   this.setState({ loading: true })
  //   let condition = { productDiscountId: this.state.dataModel.productDiscountId };
  //   this.props.auditDiscountRuleDetail(condition).payload.promise.then((response) => {
  //     let data = response.payload.data;
  //     if (data.result === false) {
  //       message.error(data.message);
  //     }
  //     else {
  //       this.setState({ dataModel: { ...data.data, productDiscountType: this.state.dataModel.productDiscountType }, loading: false })
  //     }
  //   })
  // }

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
    return <FormItem
      className='btnControl'
      {...btnsearchFormItemLayout}
    >
      <Button onClick={this.onCancel} icon="rollback">返回</Button>
    </FormItem>

  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "View":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="机会类型"
                >
                  {this.state.dataModel.divisionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="任务名称"
                >
                  {this.state.dataModel.regionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label='机会区域'
                >
                  {this.state.dataModel.productDiscountName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="面咨人员"
                >
                  {getDictionaryTitle(this.props.discount_type, this.state.dataModel.productDiscountType)}
                </FormItem>
              </Col>

              <Col span={12} >
                <FormItem
                  {...searchFormItemLayout}
                  label="学生姓名"
                >
                  {formatMoney(this.state.dataModel.productDiscountPrice)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学生归属"
                >
                  {timestampToTime(this.state.dataModel.startDate)}至{timestampToTime(this.state.dataModel.endDate)}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="手机号"
                >
                  {this.state.dataModel.itemNames}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学生就读高校"
                >
                  {this.state.dataModel.discountMutexNames}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="机会创建日期"
                >
                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.applyReason) }}></span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="预约时间"
                >
                  {this.state.dataModel.createUserName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="意向项目"
                >
                  {timestampToTime(this.state.dataModel.createDate)}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="商品"
                >
                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>

                </FormItem>
              </Col>
              
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="机会备注"
                >
                  {timestampToTime(this.state.dataModel.createDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="到访情况"
                >
                  {timestampToTime(this.state.dataModel.createDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="到访日期"
                >
                  {timestampToTime(this.state.dataModel.createDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="反馈人"
                >
                  {timestampToTime(this.state.dataModel.createDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="反馈日期"
                >
                  {timestampToTime(this.state.dataModel.createDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="到访备注"
                >
                  {timestampToTime(this.state.dataModel.createDate)}
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
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    auditDiscountRuleDetail: bindActionCreators(auditDiscountRuleDetail, dispatch),
    getAuditProductDiscountAuditStatus: bindActionCreators(getAuditProductDiscountAuditStatus, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDetailView);
