import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber, message } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { loadBizDictionary, searchFormItemLayout,searchFormItemLayout24} from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { feePayMonthUpdateTime } from '@/actions/course';
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class IncomeStatementView extends React.Component {
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
      
  }
  fetch = () => {
    
  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'Edit') {
      op = '收入月报计算日期设置'
      return `${op}`
    }

  }

  //表单按钮处理
  renderBtnControl() {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button onClick={this.onAudit} icon="save">保存</Button>
        <span className="split_button"></span>
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
  }

  onAudit = () => {
      var that = this;
      this.props.form.validateFields((err, values) => {
        if(!err){
          that.setState({ loading: true });
          setTimeout(() => {
              that.setState({ loading: false });
          }, 3000);//合并保存数据
          values.year = this.state.dataModel.year;
          values.month = this.state.dataModel.month;
          values.date = formatMoment(values.date);
          this.props.viewCallback({ ...values });//合并保存数据
        }
      });
    }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "Edit":
        block_content = (
          <Form className="search-form">
            <Row justify="center" gutter={24} align="middle" type="flex">
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label={`${this.state.dataModel.year}年${this.state.dataModel.month}月计算日期`}
                >
                  {
                    getFieldDecorator('date', {
                      initialValue: dataBind(timestampToTime(this.state.dataModel.date), true),
                      rules: [{
                        required: true, message: '请选择计算日期!',
                      }]
                    })(
                      <DatePicker
                        format="YYYY-MM-DD"
                      />
                    )
                  }
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

const WrappedIncomeStatementView = Form.create()(IncomeStatementView);

const mapStateToProps = (state) => {
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    feePayMonthUpdateTime: bindActionCreators(feePayMonthUpdateTime, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedIncomeStatementView);
