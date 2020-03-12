import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24} from '@/utils/componentExt';
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
class AuditDiscountView extends React.Component {
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
    if (this.props.editMode == 'View') {
      this.fetch();
    } else {
      this.fetchAuditType()
    }
  }
  fetch = () => {
    this.setState({ loading: true })
    let condition = { productDiscountId: this.state.dataModel.productDiscountId };
    this.props.auditDiscountRuleDetail(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        this.setState({ dataModel: { ...data.data, productDiscountType: this.state.dataModel.productDiscountType }, loading: false })
      }
    })
  }
  fetchAuditType = () => {
    let condition = { productDiscountId: this.state.dataModel.productDiscountId };
    this.props.auditDiscountRuleDetail(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        this.state.dataModel.discountMutexNames = data.data.discountMutexNames;
        this.setState({ dataModel:this.state.dataModel })
      }
    })

    this.props.getAuditProductDiscountAuditStatus({}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        var list = data.data.product_discount_audit_status.map((a) => { return ({ value: a.value, title: a.title }) })
        this.setState({ dic_discountStatus: list })
      }
    })
  }
  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '优惠规则申请查看'
      return `${op}`
    } else {
      op = '优惠规则申请审核'
      return `${op}`
    }

  }
  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据

        this.props.viewCallback({ productDiscountId: this.state.dataModel.productDiscountId, ...values });//合并保存数据
      }
    });



  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode == 'Audit') {
      var button_title = '确定'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >

        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
      </FormItem>
    }
    else {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
    }
  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "Audit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部"
                >
                  {this.state.dataModel.divisionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="所属大区"
                >
                  {this.state.dataModel.regionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label='统一优惠名称'
                >
                  {this.state.dataModel.productDiscountName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠类型"
                >
                  {this.state.dataModel.productDiscountType}
                </FormItem>
              </Col>
              {
                (this.state.dataModel.productDiscountType=='满减' || this.state.dataModel.productDiscountType=='每满减') && <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={`${this.state.dataModel.productDiscountType}条件（¥）`}
                  >
                  {formatMoney(this.state.dataModel.fullPriceCondition)}
                  </FormItem>
                </Col>
              }
              <Col span={12} >
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠金额（¥）"
                >
                  {formatMoney(this.state.dataModel.productDiscountPrice)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠有效期"
                >
                  {timestampToTime(this.state.dataModel.startDate)}至{timestampToTime(this.state.dataModel.endDate)}
                </FormItem>
              </Col>

              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="适用项目"
                >
                  {this.state.dataModel.itemNames}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="互斥规则"
                >
                  {this.state.dataModel.discountMutexNames}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="申请理由"
                >
                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.applyReason) }}></span>
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请人"
                >
                  {this.state.dataModel.createUserName}
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
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="以下为审核情况"
                >
                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>

                </FormItem>
              </Col>
              {/* <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="请进行终审"
                >
                </FormItem>
              </Col> */}
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="请进行初审"
                >
                  {getFieldDecorator('type', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请选择审核结果!',
                    }],
                  })(
                    <Select style={{width:220}}>
                      <Option value=''>--请选择审核结果--</Option>
                      {this.state.dic_discountStatus.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>

                    )}
                </FormItem>
              </Col>

              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="审核意见"
                >
                  {getFieldDecorator('auditReason', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请填写审核意见!',
                    }],
                  })(
                    <TextArea　placeholder='请填写审核意见' rows={3} />
                    )}
                </FormItem>
              </Col>
            </Row>

          </Form>
        )
        break;
      case "View":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部"
                >
                  {this.state.dataModel.divisionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="所属大区"
                >
                  {this.state.dataModel.regionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label='统一优惠名称'
                >
                  {this.state.dataModel.productDiscountName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠类型"
                >
                  {getDictionaryTitle(this.props.discount_type, this.state.dataModel.productDiscountType)}
                </FormItem>
              </Col>

              {
                (this.state.dataModel.productDiscountType=="满减" || this.state.dataModel.productDiscountType=="每满减") && <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={`${getDictionaryTitle(this.props.discount_type, this.state.dataModel.productDiscountType)}条件（¥）`}
                  >
                  {formatMoney(this.state.dataModel.fullPriceCondition)}
                  </FormItem>
                </Col>
              }
              <Col span={12} >
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠金额（¥）"
                >
                  {formatMoney(this.state.dataModel.productDiscountPrice)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠有效期"
                >
                  {timestampToTime(this.state.dataModel.startDate)}至{timestampToTime(this.state.dataModel.endDate)}
                </FormItem>
              </Col>

              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="适用项目"
                >
                  {this.state.dataModel.itemNames}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="互斥规则"
                >
                  {this.state.dataModel.discountMutexNames}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="申请理由"
                >
                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.applyReason) }}></span>
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请人"
                >
                  {this.state.dataModel.createUserName}
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
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="以下为审核情况"
                >
                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>

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

const WrappedAuditDiscountView = Form.create()(AuditDiscountView);

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
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuditDiscountView);
