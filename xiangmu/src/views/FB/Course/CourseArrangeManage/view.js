/**
* 课表管理 编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Card, Radio, message, DatePicker } from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
import ContentBox from '@/components/ContentBox';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';

import { loadBizDictionary } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind,
  timestampToTime, formatMoment } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { courseArrangeByDetailIdQuery, courseArrangeBaseInfoById } from '@/actions/course';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


class CourseArrangeDetailEdit extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            courseArrangeId: props.courseArrangeId,
            id: props.id,
            dataModel: {},//数据模型
            endOpen: false,
            dic_exam_batch: [],
            courseplanBatchId:'',
            itemId:''

          };
        this.loadBizDictionary = loadBizDictionary.bind(this);
        (this: any).onSubmit = this.onSubmit.bind(this);
        (this: any).onGetDetail = this.onGetDetail.bind(this);
        (this: any).onHourChange = this.onHourChange.bind(this);
    }
    componentWillMount() {
      this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'teach_class_type', 'courseplan_status']);
      //this.onGetCoursePlanPartInfo();
      this.onGetDetail();
    }

    onGetDetail(){
      if(this.state.id){
        this.props.courseArrangeByDetailIdQuery(this.state.id).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state === 'success'){
            var info = data.data.courseArrangeDetailVo;
            info.courseDate = timestampToTime(info.courseDate);
            this.setState({
              dataModel: info,
              courseplanBatchId:data.data.courseArrangeDetailVo.courseplanBatchId,
              itemId:data.data.courseArrangeDetailVo.itemId
            })
          }
        });
      }else if(this.state.courseArrangeId){
        this.props.courseArrangeBaseInfoById(this.state.courseArrangeId).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state === 'success'){
            var info = data.data.headParam;
            //info.courseDate = timestampToTime(info.courseDate);
            this.setState({
              dataModel: info,
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
        let id = this.state.dataModel.courseplanBatchId
        if (!err) {
          //if(!that.state.dataModel.courseDate){
          //  message.error("请输入上课日期");
          //  return;
          //}
          //values.courseDate = that.state.dataModel.courseDate + " 00:00:00";
          values.courseDate = formatMoment(values.courseDate);
          if( values.teacher && values.teacher.length ){
            values.teacherId = values.teacher[0].id;
          }else {
            values.teacherId = that.state.dataModel.teacherId;
          }
          
          delete values.teacher;
          that.setState({ loading: true });
          setTimeout(() => {
            that.setState({ loading: false });
          }, 3000);//合并保存数据
          this.props.viewCallback({...values, courseArrangeDetailId: that.state.id,courseplanBatchId:id,itemId:this.props.itemId});//保存数据
        }
      });
    }
    //标题
    getTitle() {
      let op = getViewEditModeTitle(this.props.editMode);
      return `${op}课程班`;
    }

    onHourChange(value){
      var s = this.state.dataModel;
      switch(value){
        case 1:
          s.timeQuantum = "09:00-18:00";
          break;
        case 2:
          s.timeQuantum = "09:00-13:00";
          break;
        case 3:
          s.timeQuantum = "14:00-18:00";
          break;
        case 4:
          s.timeQuantum = "18:00-21:30";
          break;
        default:
          s.timeQuantum = "";
      }
      var model = this.state.dataModel;
      this.setState({
        dataModel: model
      })
    }

    timeView=()=>{
      if(this.state.dataModel.timeQuantum){
          var dateStart = new Date(this.state.dataModel.courseDate+' '+this.state.dataModel.timeQuantum.slice(0,5)).getTime();
          var dateEnd = new Date(this.state.dataModel.courseDate+' '+this.state.dataModel.timeQuantum.slice(6)).getTime();
          var moningStart = new Date(this.state.dataModel.courseDate+' '+'09:00').getTime();
          var moningEnd = new Date(this.state.dataModel.courseDate+' '+'13:00').getTime();
          var earlMoningStart = new Date(this.state.dataModel.courseDate+' '+'06:00').getTime();
          var earlMoningEnd = new Date(this.state.dataModel.courseDate+' '+'12:00').getTime();
          var afterStart = new Date(this.state.dataModel.courseDate+' '+'14:00').getTime();
          var afterEnd = new Date(this.state.dataModel.courseDate+' '+'18:00').getTime();
          var earlAfterStart = new Date(this.state.dataModel.courseDate+' '+'12:00').getTime();
          var earlAfterEnd = new Date(this.state.dataModel.courseDate+' '+'18:00').getTime();
          var eventStart = new Date(this.state.dataModel.courseDate+' '+'18:00').getTime();
          var eventEnd = new Date(this.state.dataModel.courseDate+' '+'21:30').getTime();
          var earlEventStart = new Date(this.state.dataModel.courseDate+' '+'18:00').getTime();
          var earlEventEnd = new Date(this.state.dataModel.courseDate+' '+'23:59').getTime();
          var allStart = new Date(this.state.dataModel.courseDate+' '+'09:00').getTime();
          var allEnd = new Date(this.state.dataModel.courseDate+' '+'18:00').getTime();
          var earlAllStart = new Date(this.state.dataModel.courseDate+' '+'00:00').getTime();
          var earlAllEnd = new Date(this.state.dataModel.courseDate+' '+'23:59').getTime();
          if((moningStart<=dateStart && dateEnd<=moningEnd) || (earlMoningStart<=dateStart && dateEnd<=earlMoningEnd) ){
            return 2;
          }
          if((afterStart<=dateStart && dateEnd<=afterEnd) || (earlAfterStart<=dateStart && dateEnd<=earlAfterEnd)){
            return 3;
          }
          if((eventStart<=dateStart && dateEnd<=eventEnd) || (earlEventStart<=dateStart && dateEnd<=earlEventEnd)){
            return 4;
          }
          if((allStart<=dateStart && dateEnd<=allEnd) || (earlAllStart<=dateStart && dateEnd<=earlAllEnd)){
            return 1;
          }else{
            return 0
          }
          
      }

    }
    //表单按钮处理
    renderBtnControl() {
        if(this.props.editMode == 'Add' || this.props.editMode == 'Edit'){
          return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{"确定"}</Button>
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
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

    render() {
        let title = this.getTitle();
        const { getFieldDecorator } = this.props.form;
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                <Form>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目">
                        <span>{this.state.dataModel.itemName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="开课批次">
                          <span>{this.state.dataModel.courseplanBatchName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="分部">
                          <span>{this.state.dataModel.branchUniversityName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="教学点">
                          <span>{this.state.dataModel.teachCentername}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="课程班名称">
                          <span>{this.state.dataModel.courseClassName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="课程班类型">
                        <span>{this.state.dataModel.teachClassTypeName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="科目">
                          <span>{this.state.dataModel.courseCategoryName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="上课日期">
                        {
                          getFieldDecorator("courseDate", {
                            initialValue: dataBind(timestampToTime(this.state.dataModel.courseDate), true),
                            rules: [{
                              required: true, message: '请输入上课日期',
                            }]
                          })(
                            <DatePicker
                              format={dateFormat}
                              placeholder='上课日期'
                            />
                          )
                        }
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="讲师">
                        {getFieldDecorator('teacher', {
                          initialValue: this.state.dataModel.teacherId ? [{id: this.state.dataModel.teacherId, name: this.state.dataModel.teacherName}] : [],
                          // rules: [{ required: true, message: '请选择讲师!' }],
                        })( 
                          <EditableUserTagGroup onChange={(value)=>{ 
                            if(Array.isArray(value) && value.length>1){
                              this.state.dataModel.teacherId = value[0].id;
                              this.state.dataModel.name = value[0].name;
                            }else{ 
                              this.state.dataModel.teacherId = '';
                              this.state.dataModel.name = '';
                            }
                            this.setState({
                              dataModel:this.state.dataModel
                            })
                          }} maxTags={1} userType={4} />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="课时">
                        {getFieldDecorator('classHour', {
                          initialValue: this.state.dataModel.hour,
                          rules: [{ required: true, message: '请输入课时!' },
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
                          <Input placeholder="请输入课时"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="上课时段标准">
                          <Select  value={
                            this.timeView()
                            } onChange={this.onHourChange}>
                            <Option value={0}>请选择</Option>
                            <Option value={1}>全天</Option>
                            <Option value={2}>上午</Option>
                            <Option value={3}>下午</Option>
                            <Option value={4}>晚上</Option>
                          </Select>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="上课时段">
                        {getFieldDecorator('timeQuantum', {
                          initialValue: this.state.dataModel.timeQuantum,
                          rules: [{ required: true, message: '请输入上课时段!' },
                            { validator: (rule, value, callback) => {
                                var regex = /^[012][0-9]:[012345][0-9]-[012][0-9]:[012345][0-9]$/;
                                if(value && !regex.test(value)){
                                  callback('不是有效的上课时段！')
                                } else {
                                  callback();
                                }
                              }
                            }
                          ],
                        })(
                          <Input placeholder="请输入课时"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="班型备注">
                        {getFieldDecorator('classTypeRemark', {
                          initialValue: this.state.dataModel.classTypeRemark,
                        })(
                          <Input placeholder="请输入班型备注"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="课程阶段备注">
                        {getFieldDecorator('periodRemark', {
                          initialValue: this.state.dataModel.periodRemark,
                        })(
                          <Input placeholder="请输入课程阶段备注"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="授课科目备注">
                        {getFieldDecorator('courseRemark', {
                          initialValue: this.state.dataModel.courseRemark,
                        })(
                          <Input placeholder="请输入授课科目备注"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                    </Col>

                  </Row>
                </Form>
                <div className="dv_split"></div>
            </ContentBox>

        );
    }
}

const WrappedView = Form.create()(CourseArrangeDetailEdit);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      courseArrangeByDetailIdQuery: bindActionCreators(courseArrangeByDetailIdQuery, dispatch),
      courseArrangeBaseInfoById: bindActionCreators(courseArrangeBaseInfoById, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
