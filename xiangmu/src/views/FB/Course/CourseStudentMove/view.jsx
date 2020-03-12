
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Card, Radio, message, DatePicker
} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
import ContentBox from '@/components/ContentBox';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';

import { loadBizDictionary,searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { getCoursePlanPartInfo, getExamBatchByItem } from '@/actions/course';

const btnformItemLayout = {
  wrapperCol: { span: 24 },
};


class CoursePlanAddView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      partInfo: { courseplanBatchItemList: [{}], },
      endOpen: false,
      dic_exam_batch: []
    };
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).onSubmit = this.onSubmit.bind(this);
    (this: any).onGetCoursePlanPartInfo = this.onGetCoursePlanPartInfo.bind(this);
    (this: any).onBeginChange = this.onBeginChange.bind(this);
    (this: any).onEndChange = this.onEndChange.bind(this);
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'teach_class_type']);
    this.onGetCoursePlanPartInfo();
  }

  onGetCoursePlanPartInfo() {
    if (this.state.dataModel) {
      this.props.getCoursePlanPartInfo(this.state.dataModel).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          this.setState({
            partInfo: data.data
          })
        }
      });
    }
    if (this.state.dataModel.itemId) {
      this.props.getExamBatchByItem(this.state.dataModel.itemId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          var list = [];
          data.data.map(item => {
            list.push({ value: item.examBatchId, title: item.examBatchName });
          })
          this.setState({
            dic_exam_batch: list
          })
        }
      });
    }
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  onSubmit = () => {
    var that = this;
    if (this.props.editMode == "Delete") {
      Modal.confirm({
        title: '你确认要删除该角色吗?',
        content: '角色删除后，相关用户权限将受限！',
        onOk: () => {
          this.props.viewCallback(this.state.dataModel);//保存数据
        },
        onCancel: () => {
          console.log('Cancel');
        },
      });
    }
    else {
      //表单验证后，合并数据提交
      this.props.form.validateFields((err, values) => {
        if (!err) {
          if (!that.state.dataModel.startDate || !that.state.dataModel.endDate) {
            message.error("请输入开课日期和结课日期!");
            return;
          }
          that.setState({ loading: true });
          setTimeout(() => {
            that.setState({ loading: false });
          }, 3000);//合并保存数据
          values.startDate = that.state.dataModel.startDate;
          values.endDate = that.state.dataModel.endDate;
          that.props.viewCallback({ ...that.state.dataModel, ...values });//合并保存数据
        }
      });
    }
  }
  //标题
  getTitle() {
    if (this.props.editMode == 'Add') {
      return `新增课程班`;
    } else if (this.props.editMode == 'Additional') {
      return `补报课程班`;
    } else {
      let op = getViewEditModeTitle(this.props.editMode);
      return `${op}课程班`;
    }
  }

  onBeginChange(date, dateString) {
    this.state.dataModel.startDate = dateString;
  }
  onEndChange(date, dateString) {
    this.state.dataModel.endDate = dateString;
  }
  disabledBeginDate = (startValue) => {
    const endValue = this.state.dataModel.endDate;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }
  disabledEndDate = (endValue) => {
    const startValue = this.state.dataModel.startDate;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }
  handleBeginOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }
  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      return <FormItem
        className='btnControl'
        {...btnformItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle('Edit')}</Button>
        <span className="split_button"></span>
        <Button icon="rollback" onClick={this.onCancel} >取消</Button>
      </FormItem>
    }
    else {
      return <FormItem
        className='btnControl'
        {...btnformItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
    }
  }
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    //let filterMenus = this.props.menus.filter(A => A.name != "首页");
    switch (this.props.editMode) {
      case "Add":
      case "Additional":
      case "Edit":
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="开课计划">
                  {getFieldDecorator('courseplanBatchName', {})(
                    <span>{this.state.partInfo.courseplanBatchName}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="项目">
                  {getFieldDecorator('itemName', {})(
                    <span>{this.state.partInfo.itemName}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="教学点">
                  {getFieldDecorator('teachCenterName', {})(
                    <span>{this.state.partInfo.teachCenterName}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="科目">
                  {getFieldDecorator('courseCategoryName', {})(
                    <span>{this.state.partInfo.courseCategoryName}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="课程班名称">
                  {getFieldDecorator('courseplanName', {
                    initialValue: this.state.dataModel.courseplanName,
                    rules: [{ required: true, message: '请输入课程班名称!' }],
                  })(
                    <Input placeholder="课程班名称" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="课程班类型">
                  {getFieldDecorator('teachClassType', {
                    initialValue: dataBind(this.state.dataModel.teachClassType),
                    rules: [{ required: true, message: '请选择课程班类型!' }],
                  })(
                    <Select onChange={(value) => {
                      this.setState({
                        teachClassType: value
                      })
                    }}>
                      <Option value="">请选择</Option>
                      {this.state.teach_class_type.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="预估考季">
                  {getFieldDecorator('examBatchId', {
                    initialValue: dataBind(this.state.dataModel.examBatchId),
                    rules: [{ required: true, message: '请选择预估考季!' }],
                  })(
                    <Select>
                      <Option value="">请选择</Option>
                      {this.state.dic_exam_batch.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="高校确定日期">
                  {getFieldDecorator('isUniversityDate', {
                    initialValue: dataBind(this.state.dataModel.isUniversityDate),
                    rules: [{ required: true, message: '请选择高校确定日期!' }],
                  })(
                    <RadioGroup value={this.state.dataModel.isUniversityDate} hasFeedback>
                      {this.state.dic_YesNo.map((item, index) => {
                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                      })}
                    </RadioGroup>
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="开课日期"
                >
                  {
                    this.state.dataModel.startDate ?
                      <DatePicker
                        disabledDate={this.disabledBeginDate}
                        value={moment(this.state.dataModel.startDate, dateFormat)}
                        format={dateFormat}
                        onChange={this.onBeginChange}
                        onOpenChange={this.handleBeginOpenChange}
                        placeholder='开始日期'
                      />
                      :
                      <DatePicker
                        disabledDate={this.disabledBeginDate}
                        format={dateFormat}
                        onChange={this.onBeginChange}
                        onOpenChange={this.handleBeginOpenChange}
                        placeholder='结束日期'
                      />
                  }

                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="结课日期"
                >
                  {
                    this.state.dataModel.endDate ?
                      <DatePicker
                        disabledDate={this.disabledEndDate}
                        value={moment(this.state.dataModel.endDate, dateFormat)}
                        format={dateFormat}
                        onChange={this.onEndChange}
                        onOpenChange={this.handleEndOpenChange}
                        open={this.state.endOpen}
                        placeholder='开始日期'
                      />
                      :
                      <DatePicker
                        disabledDate={this.disabledEndDate}
                        format={dateFormat}
                        onChange={this.onEndChange}
                        onOpenChange={this.handleEndOpenChange}
                        open={this.state.endOpen}
                        placeholder='结束日期'
                      />
                  }

                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="可排课日期">
                  {getFieldDecorator('arrangeDateRemark', {
                    initialValue: this.state.dataModel.arrangeDateRemark,
                    rules: [{ required: true, message: '请输入可排课日期!' }],
                  })(
                    <TextArea rows={3} />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="预估开课人数">
                  {getFieldDecorator('planStudentNum', {
                    initialValue: this.state.dataModel.planStudentNum,
                    rules: [
                      { required: true, message: '请输入预估开课人数!' },
                      {
                        validator: (rule, value, callback) => {
                          var regex = /^[1-9][0-9]*$/;
                          if (!regex.test(value)) {
                            callback('不是有效的数字！')
                          } else {
                            callback();
                          }
                        }
                      }
                    ],
                  })(
                    <div>
                      <Input style={{width:'60%'}} placeholder="预估开课人数"/>
                      (不含重修)
                    </div>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="要求最低开课人数">
                  <span>{
                    this.state.partInfo.courseplanBatchItemList.map(b => {
                      return b.teachClassType == this.state.teachClassType && b.minStudentNum
                    })
                  }</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="重修人数">
                  {getFieldDecorator('restudyStudentNum', {
                    initialValue: this.state.dataModel.restudyStudentNum,
                  })(
                    <Input placeholder="预估重修人数" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}></Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="对外开放数">
                  {getFieldDecorator('openStudentNum', {
                    initialValue: this.state.dataModel.openStudentNum,
                  })(
                    <Input placeholder="对外开放数" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="是否跨分部开放">
                  {getFieldDecorator('isAdmitOther', {
                    initialValue: dataBind(this.state.dataModel.isAdmitOther),
                  })(
                    <RadioGroup value={dataBind(this.state.dataModel.isAdmitOther)} hasFeedback>
                      {this.state.dic_YesNo.map((item, index) => {
                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                      })}
                    </RadioGroup>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="意向讲师">
                  {getFieldDecorator('intentTeacher', {
                    initialValue: this.state.dataModel.intentTeacher,
                  })(
                    <Input placeholder="意向讲师" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="课时备注">
                  {getFieldDecorator('classHour', {
                    initialValue: this.state.dataModel.classHour,
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          var regex = /^[0-9]*$/;
                          if (!regex.test(value)) {
                            callback('不是有效的数字！')
                          } else {
                            callback();
                          }
                        }
                      }
                    ]
                  })(
                    <Input placeholder="课时备注" />
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="备注">
                  {getFieldDecorator('remark', {
                    initialValue: this.state.dataModel.remark,
                  })(
                    <TextArea rows={3} />
                    )}
                </FormItem>
              </Col>
            </Row>

          </Form>
        );
        break;
      case "View":
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="开课计划">
                  <span>{this.state.partInfo.courseplanBatchName}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="项目">
                  <span>{this.state.partInfo.itemName}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="教学点">
                  <span>{this.state.partInfo.teachCenterName}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="科目">
                  <span>{this.state.partInfo.courseCategoryName}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="课程班名称">
                  <span>{this.state.dataModel.courseplanName}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="课程班类型">
                  <Select defaultValue={dataBind(this.state.dataModel.teachClassType)} disabled>
                    {this.state.teach_class_type.map((item, index) => {
                      return <Option value={item.value} key={index}>{item.title}</Option>
                    })}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="预估考季">
                  <Select defaultValue={dataBind(this.state.dataModel.examBatchId)} disabled>
                    {this.state.dic_exam_batch.map((item, index) => {
                      return <Option value={item.value} key={index}>{item.title}</Option>
                    })}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="高校确定日期">
                  <RadioGroup value={dataBind(this.state.dataModel.isUniversityDate)} disabled>
                    {this.state.dic_YesNo.map((item, index) => {
                      return <Radio value={item.value} key={index}>{item.title}</Radio>
                    })}
                  </RadioGroup>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="开课日期"
                >
                  <DatePicker
                    disabled
                    disabledDate={this.disabledBeginDate}
                    value={moment(this.state.dataModel.startDate, dateFormat)}
                    format={dateFormat}
                    placeholder='开始日期'
                  />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="结课日期"
                >
                  <DatePicker
                    disabled
                    disabledDate={this.disabledEndDate}
                    value={moment(this.state.dataModel.endDate, dateFormat)}
                    format={dateFormat}
                    placeholder='结束日期'
                  />
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="可排课日期">
                  <span>{this.state.dataModel.arrangeDateRemark}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="预估开课人数（不含重修）">
                  <span>{this.state.dataModel.planStudentNum}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="要求最低开课人数">
                  <span>30</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="重修人数">
                  <span>{this.state.dataModel.restudyStudentNum}</span>
                </FormItem>
              </Col>
              <Col span={12}></Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="对外开放数">
                  <span>{this.state.dataModel.openStudentNum}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="是否跨分部开放">
                  <RadioGroup value={dataBind(this.state.dataModel.isAdmitOther)} disabled>
                    {this.state.dic_YesNo.map((item, index) => {
                      return <Radio value={item.value} key={index}>{item.title}</Radio>
                    })}
                  </RadioGroup>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="意向讲师">
                  <span>{this.state.dataModel.intentTeacher}</span>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="课时备注">
                  <span>{this.state.dataModel.classHour}</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="备注">
                  <span>{this.state.dataModel.remark}</span>
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
      case "Delete":
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

const WrappedView = Form.create()(CoursePlanAddView);

const mapStateToProps = (state) => {
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getCoursePlanPartInfo: bindActionCreators(getCoursePlanPartInfo, dispatch),
    getExamBatchByItem: bindActionCreators(getExamBatchByItem, dispatch)
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
