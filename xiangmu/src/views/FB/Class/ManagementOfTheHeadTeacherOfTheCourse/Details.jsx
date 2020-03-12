
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Tabs, Radio, message, DatePicker } from 'antd';
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item; 
import ContentBox from '@/components/ContentBox';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import StudentInviteManage from './student'
import {searchFormItemLayout, searchFormItemLayout24, loadBizDictionary } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind,
  timestampToTime, formatMoment } from '@/utils';

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
    }

    onGetCoursePlanPartInfo(){
      if(this.state.dataModel){
        this.props.getCoursePlanPartInfo(this.state.dataModel).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state === 'success'){
            this.setState({
              partInfo: data.data
            })
          }else{
              message.error(data.msg)
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
                    /*if(!that.state.dataModel.startDate || !that.state.dataModel.endDate){
                      message.error("请输入开课日期和结课日期!");
                      return;
                    }*/
                    
                    //values.startDate = that.state.dataModel.startDate;
                    //values.endDate = that.state.dataModel.endDate;
                    values.startDate = formatMoment(values.startDate);
                    values.endDate = formatMoment(values.endDate);
                    that.props.viewCallback({ ...that.state.dataModel, ...values });//合并保存数据
                }
            });
        }
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
      if(this.props.editMode == 'Add'){
        return `新增课程班`;
      }else if(this.props.editMode == 'Additional'){
        return `补报课程班`;
      }else {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}课程班`;
      }
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
        if (this.props.editMode != 'View' && this.props.editMode != 'Details') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button>
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
            case 'Details':
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
                              <FormItem {...searchFormItemLayout} label="是否新生班"> 
                                  <RadioGroup  value={dataBind(this.state.dataModel.isNewStudent)} disabled >
                                    {this.state.is_new_student.map((item, index) => { 
                                      return <Radio value={item.value} key={index}>{item.title}</Radio>
                                    })}
                                  </RadioGroup> 
                              </FormItem>
                        </Col>
                        {/* <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="高校确定日期">
                              <RadioGroup value={dataBind(this.state.dataModel.isUniversityDate)} disabled>
                                {this.state.dic_YesNo.map((item, index) => {
                                  return <Radio value={item.value} key={index}>{item.title}</Radio>
                                })}
                              </RadioGroup>
                          </FormItem>
                        </Col> */}
                        <Col span={12}>
                          <FormItem
                              {...searchFormItemLayout}
                              label="开课日期"
                          >
                                <DatePicker
                                  disabled
                                  disabledDate={this.disabledBeginDate}
                                  value={moment(timestampToTime(this.state.dataModel.startDate), dateFormat)}
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
                                value={moment(timestampToTime(this.state.dataModel.endDate), dateFormat)}
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
                          <FormItem {...searchFormItemLayout} label="预估开课人数">
                              <span>{this.state.dataModel.planStudentNum}</span>（不含重修）
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
                          <p> 
                            <span>{this.state.dataModel.classHour}</span>
                            <span style={{color:'red',marginLeft:'14px'}}>(1小时/1课时)</span>
                          </p>
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
          this.props.editMode == 'Details'?
          <Tabs  defaultActiveKey={'tab0'} type="card"  tabBarExtraContent={<a onClick={this.onCancel} className='button_back'>
          <Icon type="rollback" style={{ fontSize: 16, }} />返回</a>}>
          <TabPane tab={'基本信息'} key={`tab0`}>
          <div style={{padding:'20px 0'}}>
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
          </div>
          </TabPane>
          <TabPane tab={'学生'}  key={`tab1`}>
              <div style={{ padding:'20px 0'}}>
                <StudentInviteManage {...this.state} />
              </div>
          </TabPane>
          </Tabs>:
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
