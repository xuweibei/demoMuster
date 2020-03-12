import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import { loadBizDictionary,searchFormItemLayout } from '@/utils/componentExt';
import SelectArea from '@/components/BizSelect/SelectArea';
import {searchOutGoingTaskList}  from '@/actions/base';

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
class DiscountView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      startOpen:false,
      endOpen: false,
      startValue: null,
      endValue:null,
      dataModel: [],//数据模型
      regionStatus:null,
      aeraName:''
    };

  }
  //返回
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    if(this.props.editMode == 'Edit'){
      this.searchList()
    }
  }
  //编辑搜索
  searchList=()=>{
    this.props.searchOutGoingTaskList({callcenterTaskId:this.props.currentDataModel.mainNew.callcenterTaskId}).payload.promise.then((response) => {
      let data = response.payload.data;
      this.setState({
          dataModel: data.data.callcenterTask,
          regionStatus:data.data.regionStatus,
          startValue:data.data.callcenterTask.startTime,
          endValue:data.data.callcenterTask.endTime,
          aeraName:data.data.regionName
      })
  })
  }
  //提交
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
            productDiscountId: this.state.dataModel.productDiscountId,
            dateStart: formatMoment(values.dateStart),
            dateEnd: formatMoment(values.dateEnd),
            ids: Array.isArray(values.ids)?values.ids.join(','):values.ids,
            callcenterTaskId:this.props.editMode == 'Edit'?this.state.dataModel.callcenterTaskId:''
          }
        }
        this.props.viewCallback({ ...values, ...postData, });//合并保存数据
      }
    });
  }
  //不可选的日期
  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  //完成日期的时间变化回调
  onEndChange = (value) => {
      this.onChange('endValue', value);
  }
  
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }
  
  //弹出日历和关闭日历的回调
  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  
  //不可选的日期
  disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!endValue || !startValue) {
          return false;
      }
      return startValue.valueOf() >= endValue.valueOf();
  }
  //日期回调
  onStartChange = (value) => {
      this.onChange('startValue', value);
  }
  
  //弹出日历和关闭日历的回调
  handleStartOpenChange = (open) => {
      this.setState({ startOpen: open });
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = this.props.editMode == 'EditDate' ? getViewEditModeTitle('Edit') : getViewEditModeTitle(this.props.editMode)
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
      case "Create":
      case "Edit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  {...searchFormItemLayout}
                  label="区域"
                >
                    {(this.state.regionStatus&&this.props.editMode=='Edit')?(getFieldDecorator('regionId', {
                            initialValue: this.state.dataModel.regionId,
                            rules: [{
                                required: true, message: '请选择区域!',
                            }],
                        })
                            (
                            <SelectArea scope='my' showCheckBox={false} />
                            )):<span>{this.state.aeraName}</span>
                    }
                    {this.props.editMode=='Create'?(getFieldDecorator('regionId', {
                            initialValue: this.state.dataModel.regionId,
                            rules: [{
                                required: true, message: '请选择区域!',
                            }],
                        })
                            (
                            <SelectArea scope='my' showCheckBox={false} />
                            )):''
                    }
                </FormItem>
              </Col>
              <Col span={18}>
                <FormItem
                  {...searchFormItemLayout}
                  label="任务名称"
                >
                  {getFieldDecorator('callcenterTaskName', {
                    initialValue:this.state.dataModel.callcenterTaskName,
                    rules: [{
                      required: true, message: '请输入任务名称!',
                    }],
                  })(
                    <Input placeholder='请输入任务名称' />
                    )}
                </FormItem>
              </Col>

            <Col span={18}>
                <FormItem
                  {...searchFormItemLayout}
                  label={'计划开始日期'}
                >
                  {getFieldDecorator('dateStart', {
                    initialValue: dataBind(timestampToTime(this.state.dataModel.startTime), true),
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                      <DatePicker
                        disabledDate={this.disabledStartDate}
                        format={dateFormat}
                        onChange={this.onStartChange}
                        open={this.state.startOpen}
                        onOpenChange={this.handleStartOpenChange}
                        placeholder='计划开始日期'
                      />
                    )}
                </FormItem>
              </Col>
              
              <Col span={18}>
              
              <FormItem
                      {...searchFormItemLayout}
                      label="计划完成日期">
                      {getFieldDecorator('dateEnd', { 
                        initialValue:dataBind(timestampToTime(this.state.dataModel.endTime), true),
                        rules: [{
                          required: true, message: '请选择日期!',
                        }],
                      })(
                        <DatePicker
                          disabledDate={this.disabledEndDate}
                          format={dateFormat}
                          onChange={this.onEndChange}
                          open={this.state.endOpen}
                          onOpenChange={this.handleEndOpenChange}
                          placeholder='计划开始日期'
                        />
                      )}
                  </FormItem>
              </Col>

              <Col span={18} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="备注"
                  >
                    {getFieldDecorator('remark', {
                    initialValue:this.state.dataModel.remark,
                  })(
                    <TextArea rows={3} />
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
    let title = '新增外呼任务';
    title=(this.props.editMode=='Create')?'新增外呼任务':'编辑外呼任务'
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        {block_editModeView}
      </ContentBox>
    );
  }
}

const WrappedDiscountView = Form.create()(DiscountView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    searchOutGoingTaskList: bindActionCreators(searchOutGoingTaskList, dispatch),//编辑搜索
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDiscountView);
