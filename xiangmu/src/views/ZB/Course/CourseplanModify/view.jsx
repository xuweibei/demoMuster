
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Tabs, Radio, message, DatePicker } from 'antd';
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
import ContentBox from '@/components/ContentBox';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import {searchFormItemLayout, searchFormItemLayout24, loadBizDictionary } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind,
  timestampToTime, formatMoment } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { queryItemStageVosList } from '@/actions/base';
import { getCoursePlanPartInfo, getExamBatchByItem } from '@/actions/course';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const searchFormItemLayout12 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};



class CoursePlanAddView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShowFimal: false,
            itemStage_list: [],
            dataModel: props.currentDataModel,//数据模型
            partInfo: { courseplanBatchItemList: [{}], },
            endOpen: false,
            dic_exam_batch: [],
            teachClassType: props.currentDataModel.teachClassType
          };
        this.loadBizDictionary = loadBizDictionary.bind(this);
        (this: any).onSubmit = this.onSubmit.bind(this);
        (this: any).onGetCoursePlanPartInfo = this.onGetCoursePlanPartInfo.bind(this);
        (this: any).onBeginChange = this.onBeginChange.bind(this);
        (this: any).onEndChange = this.onEndChange.bind(this);
    }
    componentWillMount() {
      this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'teach_class_type','is_new_student']);
      this.onGetCoursePlanPartInfo();
      this.classId();
      if(this.state.dataModel.isFinal == 0 || this.state.dataModel.isFinal == 1){
        this.setState({ isShowFimal: true, isFinal: this.state.dataModel.isFinal });
      } 
    }
    classId = () => {
      this.props.queryItemStageVosList({itemId:this.state.dataModel.itemId,stateMsg:1}).payload.promise.then((response) => {
        let data = response.payload.data;
        if(data.state === 'success'){
          var list = [];
          data.data.map(item => {
            list.push({value: item.itemStageId, title: item.itemStageName, isFinal: item.isFinal });
          })
          this.setState({
            itemStage_list: list
          })
        }
      });
    }
    onGetCoursePlanPartInfo(){
      if(this.state.dataModel){
        this.state.dataModel.isUpatePage = 1;////是否是开课计划修改页面的列表查询
        this.props.getCoursePlanPartInfo(this.state.dataModel).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state === 'success'){
            this.setState({
              partInfo: data.data
            })
          }
        });
      }
      if(this.state.dataModel.itemId){
        this.props.getExamBatchByItem(this.state.dataModel.itemId).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state === 'success'){
            var list = [];
            data.data.map(item => {
              list.push({value: item.examBatchId, title: item.examBatchName});
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
        
      //表单验证后，合并数据提交
      this.props.form.validateFields((err, values) => {
          if (!err) { 
                if(!values.planStudentNum){
                  message.error("预估开课人数要大于0");
                  return;
                } 
                if(values.isAdmitOther == 1){
                  if(values.openStudentNum < 1){
                    message.error("跨分部开放时，对外开放数人数必须大于0");
                    return;
                  }
                }
                this.props.changeEeqError(); 
                that.setState({ loading: true });
              
              values.startDate = formatMoment(values.startDate);
              values.endDate = formatMoment(values.endDate);
              values.isHeadquarters = 1;//是否是总部-开课计划修改页面操作
              values.branchId = that.state.dataModel.branchId;//是否是总部-开课计划修改页面操作

              that.props.viewCallback({ ...that.state.dataModel, ...values });//合并保存数据
          }
      });
    }
    componentWillReceiveProps(props){  
      if(props.reqErroe){ 
        this.setState({
            loading:false,
            liveOnff:false, 
        })
      }
    } 
    //标题
    getTitle() {
      
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}开课计划`;
      
    }

    onBeginChange(date, dateString) {
      this.state.startDate = dateString;
    }
    onEndChange(date, dateString) {
      this.state.endDate = dateString;
    }
    disabledBeginDate = (startValue) => {
      const endValue = this.state.endDate;
      if (!startValue || !endValue) {
        return false;
      }
      startValue = formatMoment(startValue);
      return startValue.valueOf() > endValue.valueOf();
    }
    disabledEndDate = (endValue) => {
      const startValue = this.state.startDate;
      if (!endValue || !startValue) {
        return false;
      }
      endValue = formatMoment(endValue);
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
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button>
            <span className="split_button"></span>
            <Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Edit":
                block_content = (
                    <Form>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="分部">
                            {getFieldDecorator('branchUniversityName', {})(
                                <span>{this.state.dataModel.branchUniversityName}</span>
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
                              <Input placeholder="课程班名称"/>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="课程阶段">
                            {getFieldDecorator('itemStageId', {
                              initialValue: dataBind(this.state.dataModel.itemStageId),
                              rules: [{ required: true, message: '请选择课程阶段!' }],
                            })(
                              <Select onChange={(value,label) => {

                                if(value){
                                  this.setState({ isFinal: label.props.isFinal,isShowFimal: true });
                                }else{
                                  this.setState({ isFinal: 0,isShowFimal: false });
                                }

                              }}>
                                <Option value="">--请选择--</Option>
                                {this.state.itemStage_list.map((item, index) => {
                                    return <Option value={item.value} key={index} isFinal={item.isFinal}>{item.title}</Option>
                                })}
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                        {
                          this.state.isShowFimal ? <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="是否结课阶段">
                              {getFieldDecorator('isFinal', {
                                initialValue: dataBind(this.state.isFinal),
                              })(
                                <div>{ this.state.isFinal == 0 ? '否' : '是'}</div>
                              )}
                            </FormItem>
                          </Col>
                          : ''
                        }
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
                            {
                              (this.props.editMode=='Add'|| this.props.editMode=='Additional')? <FormItem {...searchFormItemLayout} label="是否新生班">
                              {getFieldDecorator('isNewStudent', {
                                initialValue: '0',
                                rules: [{ required: true, message: '请选择!' }]
                              })(
                                <RadioGroup hasFeedback>
                                  {this.state.is_new_student.map((item, index) => { 
                                    return <Radio value={item.value} key={index}>{item.title}</Radio>
                                  })}
                                </RadioGroup>
                              )}
                            </FormItem>: <FormItem {...searchFormItemLayout} label="是否新生班">
                                {getFieldDecorator('isNewStudent', {
                                  initialValue: dataBind(this.state.dataModel.isNewStudent), 
                                })(
                                  <RadioGroup hasFeedback>
                                    {this.state.is_new_student.map((item, index) => { 
                                      return <Radio value={item.value} key={index}>{item.title}</Radio>
                                    })}
                                  </RadioGroup>
                                )}
                              </FormItem>
                            }
                           
                        </Col>
                        {/* <Col span={12}>
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
                        </Col> */}
                      </Row>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="开课日期">
                            {
                              getFieldDecorator('startDate', {
                                initialValue: dataBind(timestampToTime(this.state.dataModel.startDate), true),
                                rules: [{
                                  required: true, message: '请输入开课日期!',
                                }]
                              })(
                                <DatePicker
                                  format={dateFormat}
                                  placeholder='开始日期'
                                  disabledDate={this.disabledBeginDate}
                                  onChange={this.onBeginChange}
                                  onOpenChange={this.handleBeginOpenChange}
                                />
                              )
                            }
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="结课日期">
                            {
                              getFieldDecorator('endDate', {
                                initialValue: dataBind(timestampToTime(this.state.dataModel.endDate), true),
                                rules: [{
                                  required: true, message: '请输入结课日期!',
                                }]
                              })(
                                <DatePicker
                                  format={dateFormat}
                                  placeholder='结束日期'
                                  disabledDate={this.disabledEndDate}
                                  onChange={this.onEndChange}
                                  onOpenChange={this.handleEndOpenChange}
                                />
                              )
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
                              <TextArea rows={3}/>
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
                                { validator: (rule, value, callback) => {
                                    var regex = /^[1-9][0-9]*$/;
                                    if(value && !regex.test(value)){
                                      callback('不是有效的数字！')
                                    } else {
                                      callback();
                                    }
                                  }
                                }
                              ],
                            })(
                                <Input style={{width:'60%'}} placeholder="预估开课人数"/>
                            )}
                            (不含重修)
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
                        </Row>
                        <Row gutter={24}>
                          <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="重修人数">
                              {getFieldDecorator('restudyStudentNum', {
                                initialValue: this.state.dataModel.restudyStudentNum,
                                rules: [
                                { validator: (rule, value, callback) => {
                                  var regex = /^[1-9][0-9]*$/;
                                  if(value && !regex.test(value)){
                                    callback('不是有效的数字！')
                                  } else {
                                    callback();
                                  }
                                }
                              }]
                              },
                              )(
                                <Input placeholder="预估重修人数"/>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={12}></Col>
                        </Row>
                        <Row gutter={24}>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="对外开放数">
                            {getFieldDecorator('openStudentNum', {
                              initialValue: this.state.dataModel.openStudentNum,
                              rules: [
                              { validator: (rule, value, callback) => {
                                var regex = /^[1-9][0-9]*$/;
                                if(value && !regex.test(value)){
                                  callback('不是有效的数字！')
                                } else {
                                  callback();
                                }
                              }
                            }]
                            }
                            )(
                              <Input placeholder="对外开放数"/>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="是否跨分部开放">
                            {getFieldDecorator('isAdmitOther', {
                              initialValue: this.state.dataModel.isAdmitOther?dataBind(this.state.dataModel.isAdmitOther):'0',
                            })(
                              <RadioGroup hasFeedback>
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
                              <Input placeholder="意向讲师"/>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="课时备注">
                            {getFieldDecorator('classHour', {
                              initialValue: this.state.dataModel.classHour,
                              rules: [{
                                required: true, message: '请输入课时备注!',
                              },
                                { 
                                  validator: (rule, value, callback) => {
                                    var regex = /^[0-9]*$/;
                                    if(!regex.test(value)){
                                      callback('不是有效的数字！')
                                    } else {
                                      callback();
                                    }
                                  },
                                }
                              ]
                            })( 
                                <Input style={{width:'40%'}} placeholder="课时备注"/>
                            )}
                            (1小时/1课时)
                          </FormItem>
                        </Col>
                        <Col span={24}>
                          <FormItem {...searchFormItemLayout24} label="备注">
                            {getFieldDecorator('remark', {
                              initialValue: this.state.dataModel.remark,
                            })(
                              <TextArea rows={3}/>
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

const WrappedView = Form.create()(CoursePlanAddView);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      getCoursePlanPartInfo: bindActionCreators(getCoursePlanPartInfo, dispatch),
      getExamBatchByItem: bindActionCreators(getExamBatchByItem, dispatch),
      queryItemStageVosList: bindActionCreators(queryItemStageVosList, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
