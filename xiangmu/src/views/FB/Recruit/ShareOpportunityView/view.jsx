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
import { queryUserByBranchId } from '@/actions/enrolStudent';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import {searchFormItemLayout,searchFormItemLayout24} from '@/utils/componentExt';

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
class StudentAskfaceView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      user_list: [],
      startValue: null,
      endValue: null,
      endOpen: false,
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.fetchUser();
  }
  fetchUser = (params = {}) => {
    this.props.queryUserByBranchId().payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        this.setState({ user_list: data.data })
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
        if (this.props.editMode == 'Edit') {
          var postData = {
            ids: this.state.dataModel.studentId,
            benefitUserId: values.marketUserId,
          }
        }
        else {
          var postData = {
            ids: this.props.UserSelecteds.join(','),
           // branchId: values.branchId,
            regionId: values.areaId,
           // marketUserId: values.marketUserId,
           // pconsultUserId: values.pconsultUserId,
           // fconsultUserId: values.fconsultUserId,
            type:this.state.dataModel.type,
          }
        }
        this.props.viewCallback({ ...values, ...postData, });//合并保存数据
      }
    });
  }


  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'EditDate') {
      op = `批量${this.props.UserSelecteds.length}修改`
      return `${op}有效期`
    }
    if (this.props.editMode == 'Edit') {
      op = getViewEditModeTitle(this.props.editMode);
      return `修改业绩人员`;
    }
    if (this.props.editMode == 'editmUser') {
      // let length=`${this.props.UserSelecteds.length};`
      // if(length==0){
      //   alert('没有选择要修改的订单');
      // }
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员`;
    }
    if (this.props.editMode == 'editpUser') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员`;
    }
    if (this.props.editMode == 'editfUser') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员`;
    }
    if (this.props.editMode == 'editArea') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}个订单进行所属区域的调整`;
    }

  }

  disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({ endOpen: true });
      }
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = this.props.editMode == 'editpUser' ? getViewEditModeTitle('Edit') : getViewEditModeTitle(this.props.editMode)
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="edit" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
      case "editArea":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label={'请选择分部及区域：'} >
                  {
                    getFieldDecorator('branchId', {
                      //initialValue: this.state.pagingSearch.benefitRegionId 
                      rules: [{
                        required: true, message: '请选择分部!',
                    }],
                    })
                      (
                      <SelectFBOrg scope='my' hideAll={true} showCheckBox={false}
                        onSelectChange={(branchId => {
                          this.setState({ branchId });
                          setTimeout(() => {
                            {/* 重新重置才能绑定这个科目值 */ }
                            this.props.form.resetFields(['areaId']);
                          }, 500);
                        })}
                      />
                      )
                  }
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout}>
                  {
                    getFieldDecorator('areaId', {
                      //initialValue: this.state.pagingSearch.benefitRegionId 
                      rules: [{
                        required: true, message: '请选择区域!',
                    }],
                    })
                      (
                      <SelectArea scope='all' branchId={this.state.branchId} hideAll={true} showCheckBox={false} />
                      )
                  }

                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;

      case "EditDate":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout}
                  label="有效期"
                >
                  {getFieldDecorator('startDate', {
                    initialValue: dataBind(timestampToTime(this.state.dataModel.startDate), true),
                    rules: [{
                      required: true, message: '请选择优惠开始日期!',
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
                  <span style={{ marginLeft: 8, marginRight: 8 }}>至</span>
                  {getFieldDecorator('endDate', {
                    initialValue: dataBind(timestampToTime(this.state.dataModel.endDate), true),
                    rules: [{
                      required: true, message: '请选择优惠结束日期!',
                    }],
                  })(
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      format={dateFormat}
                      onChange={this.onEndChange}
                      open={this.state.endOpen}
                      onOpenChange={this.handleEndOpenChange}
                      placeholder='结束日期'
                    />
                  )}
                </FormItem>
              </Col>

            </Row>

          </Form>
        );
        break;
      case "Create":
        break;
      case "editmUser":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout}
                  label="市场人员"
                >
                  {getFieldDecorator('marketUserId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入选择的市场人员!',
                    }],

                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "editpUser":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout}
                  label="请输入选择的面咨人员:"
                >
                  {getFieldDecorator('benefitUserId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入选择的面咨人员!',
                    }],

                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "editfUser":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout}
                  label="市场人员"
                >
                  {getFieldDecorator('fconsultUserId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入选择的市场人员!',
                    }],

                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "Edit":
        block_content = (

          <Form className="search-form">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout}
                  label="市场人员"
                >
                  {getFieldDecorator('marketUserId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入选择的市场人员!',
                    }],

                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  {...searchFormItemLayout}
                  label="电咨人员"
                >
                  {getFieldDecorator('pconsultUserId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入选择的市场人员!',
                    }],

                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  {...searchFormItemLayout}
                  label="面咨人员"
                >
                  {getFieldDecorator('fconsultUserId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入选择的市场人员!',
                    }],
                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
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

const WrappedStudentAskfaceView = Form.create()(StudentAskfaceView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    queryUserByBranchId: bindActionCreators(queryUserByBranchId, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentAskfaceView);
