import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getActivityDetail } from '@/actions/recruit';


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
class View extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.fetch()
  }

  fetch = (params = { activityId: this.state.dataModel.activityId }) => {
    this.setState({ loading: true });
    var condition = params;
    this.props.getActivityDetail(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.state.dataModel.itemNames = data.data.itemNames;
        this.state.dataModel.remark = data.data.remark;
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '活动详细信息'
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
                  label="招生季"
                >
                  {this.state.dataModel.recruitBatchName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部区域"
                >
                  {this.state.dataModel.regionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label='活动名称'
                >
                  {this.state.dataModel.activityName}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="高校活动"
                >
                  {this.state.dataModel.universityName}
                </FormItem>
              </Col>

              <Col span={12} >
                <FormItem
                  {...searchFormItemLayout}
                  label="活动类型"
                >
                  {this.state.dataModel.activityTypeName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="实际费用(¥)"
                >
                  {this.state.dataModel.costAmount}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="负责人"
                >
                  {this.state.dataModel.chargeUserName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="活动开始时间"
                >
                  {timestampToTime(this.state.dataModel.startTime)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="活动结束时间"
                >
                  {timestampToTime(this.state.dataModel.endTime)}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="项目"
                >
                  {this.state.dataModel.itemNames}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="备注"
                >
                  {this.state.dataModel.remark}
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

const WrappedAuditDiscountView = Form.create()(View);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    getActivityDetail: bindActionCreators(getActivityDetail, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuditDiscountView);
