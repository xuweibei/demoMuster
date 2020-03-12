import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import { queryDiscountPriceByItemId } from '@/actions/recruit';

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};


const CheckboxGroup = Checkbox.Group;

const dateFormat = 'YYYY-MM-DD';

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
      maxDiscountPrice: 0
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.getAreaDiscount(this.state.dataModel.itemId)
  }
  getAreaDiscount = (value) => {

    this.setState({ loading: true });
    var condition = { itemId: value };

    this.props.queryDiscountPriceByItemId(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({...data.data, loading: false ,maxDiscountPrice:data.data})
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
        if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
          var postData = {
            discountRuleId: this.state.dataModel.discountRuleId,
          }
          this.props.viewCallback({ ...values, ...postData });//合并保存数据
        }
        if (this.props.editMode == 'BatchEdit') {
          this.props.viewCallback({ ...values });//合并保存数据
        }
        if (this.props.editMode == 'BatchAudit') {
          var postData = {
            ids: this.state.dataModel.ids.join(','),
            discountPrice:values.discountPrice,

          }
          this.props.viewCallback({...postData });//合并保存数据
        }
      }
    });
  }


  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'BatchAudit') {
      op = '批量修改限额'
      return op;
    }
   
    if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
      op = getViewEditModeTitle(this.props.editMode);
      return `${op}特殊优惠限额`;
    }
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = this.props.editMode == 'BatchEdit' || this.props.editMode == 'BatchAudit' ? '确定' : getViewEditModeTitle(this.props.editMode)
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

    switch (this.props.editMode) {
      case "BatchAudit":
        block_content = <Form className="search-form">
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}

                label="优惠限额金额"
              >
                {getFieldDecorator('discountPrice', {
                  initialValue: this.state.dataModel.discountPrice,
                  rules: [{
                    required: true, message: '请输入优惠限额金额!',
                  }],
                })(
                  <InputNumber min={0} defaultValue={0}/>
                  )}
              </FormItem>
            </Col>
          </Row>
        </Form>
        break;
      case "Create":
      case "Edit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={16}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部"
                >
                  {this.state.dataModel.orgName}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...searchFormItemLayout}
                  label="项目"
                >
                  {this.state.dataModel.itemName}
                </FormItem>
              </Col>
              
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠限额金额"
                >
                  {getFieldDecorator('discountPrice', {
                    initialValue: this.state.dataModel.discountPrice,
                  })(
                    <InputNumber min={0} defaultValue={0}/>
                    )}（大区限额（¥）：{this.state.maxDiscountPrice}）
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
        <div className="dv_split"></div>
        {block_editModeView}
        <div className="dv_split"></div>
      </ContentBox>
    );
  }
}

const WrappedView = Form.create()(View);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    queryDiscountPriceByItemId: bindActionCreators(queryDiscountPriceByItemId, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
