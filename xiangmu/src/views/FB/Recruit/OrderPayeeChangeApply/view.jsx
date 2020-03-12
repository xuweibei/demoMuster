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
import { OrderPayeeChangeInfo } from '@/actions/recruit';

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
class PayeeChangeDetailView extends React.Component {
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
      this.fetch();
  }
  fetch = () => {
    this.setState({ loading: true })
    let condition = { orderPayeeChangeId: this.state.dataModel.orderPayeeChangeId };
    this.props.OrderPayeeChangeInfo(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state != 'success') {
        message.error(data.message);
      }
      else {
        this.setState({ dataModel: { ...data.data }, loading: false })
      }
    })
  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '订单收费方变更查看'
      return `${op}`
    } else {
      op = '订单收费方变更审核'
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

    switch (this.props.editMode) {
      case "View":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单分部"
                >
                  {this.state.dataModel.branchName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单区域"
                >
                  {this.state.dataModel.regionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label='订单号'
                >
                  {this.state.dataModel.orderSn}
                </FormItem>
              </Col>

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
                  label="订单类型"
                >
                  {this.state.dataModel.orderTypeName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="大客户名称"
                >
                  {this.state.dataModel.partnerName}
                </FormItem>
              </Col>

              <Col span={12} >
                <FormItem
                  {...searchFormItemLayout}
                  label="订单金额（¥）"
                >
                  {formatMoney(this.state.dataModel.totalAmount)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单状态"
                >
                  {this.state.dataModel.orderStatusName}
                </FormItem>
              </Col>

              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="收费方"
                >
                  {this.state.dataModel.oldOrderPayeeTypeName}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="申请变更收费方"
                >
                  {this.state.dataModel.newOrderPayeeTypeName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请日期"
                >
                  {timestampToTime(this.state.dataModel.applyDate)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请人"
                >
                  {this.state.dataModel.applyUserName}
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

const WrappedPayeeChangeDetailView = Form.create()(PayeeChangeDetailView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    OrderPayeeChangeInfo: bindActionCreators(OrderPayeeChangeInfo, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPayeeChangeDetailView);
