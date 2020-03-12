import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';



const FormItem = Form.Item;
const { TextArea } = Input;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};
const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class TermRuleView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
    };

  }
  onCancel = () => {
    this.setState({ loading: false });
    this.props.viewCallback();
  }
  componentWillMount() {

  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据

        var postData = {
          termRuleId: this.state.dataModel.termRuleId,
        }
        this.props.viewCallback({ ...postData, ...values });//合并保存数据
      }
    });
  }


  //标题
  getTitle() {
    let op = getViewEditModeTitle(this.props.editMode);
    return `${op}分期付款规则`;
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
      case "Create":
      case "Edit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="是否允许分期"
                >
                  {getFieldDecorator('isTerm', {
                    initialValue: dataBind(this.state.dataModel.isTerm),
                  })(
                    <Select onChange={(value, option) => {
                      this.state.dataModel.isTerm = value;
                      if (value == 0) {
                        this.state.dataModel.firstDiscountScale = 100
                      }

                      this.setState({ dataModel: this.state.dataModel });

                      setTimeout(() => {
                        this.props.form.resetFields(['firstDiscountScale']);
                      }, 500);
                    }}>
                      {this.props.dic_Allow.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="首付最低比例（%）"
                >
                  {getFieldDecorator('firstDiscountScale', {
                    initialValue: this.state.dataModel.firstDiscountScale,
                  })(
                    <InputNumber disabled={this.state.dataModel.isTerm == 0} min={1} max={100} />
                    )}
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

const WrappedTermRuleView = Form.create()(TermRuleView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTermRuleView);
