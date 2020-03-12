import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser'


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
      regRegions: [],
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {

  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'Edit') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}个订单进行修改分部调整`;
    }

  }
  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据

        this.props.viewCallback({ orderIds: this.state.dataModel.ids.join(","), ...values });//合并保存数据
      }
    });



  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode == 'Edit') {
      var button_title = '确定'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >

        <Button type="primary" loading={this.state.loading} icon="ok" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
      case "Edit":
        let lable = '您选择了' + `${this.state.dataModel.ids.length}` + '个订单进行所属分部区域的调整：';
        block_content = (
          <Form className="search-form">
            <div style={{marginBottom:20}}>{lable}</div>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label={'请选择分部'}
                >
                  {getFieldDecorator('branchId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请选择分部!',
                    }]
                  })(
                    <SelectFBOrg scope='my' hideAll={false} onChange={(value) => {
                      this.setState({ branchId: value });
                      setTimeout(() => {
                        this.props.form.resetFields(['regionId']);
                      }, 500);
                    }} />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="请选择区域"
                >
                  {getFieldDecorator('regionId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请选择区域!'
                    }]
                  })(
                    <SelectArea scope='all' branchId={this.state.branchId} hideAll={true} showCheckBox={false} />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )
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

const WrappedView = Form.create()(View);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
  };
}
//redux 组件 封装

export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
