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
import {studentPayfeeEditById,studentPayfeeEditChangeTimeById} from '@/actions/finance';
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
            data_list:[],
            courseplanBatchId:'',
            itemId:'',
            currentDataModel:this.props.currentDataModel,
            studentPayfeeId:''

          };
        this.loadBizDictionary = loadBizDictionary.bind(this);
        (this: any).onSubmit = this.onSubmit.bind(this);
        (this: any).onGetDetail = this.onGetDetail.bind(this); 
    }
    componentWillMount() {
      this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'teach_class_type', 'courseplan_status','partner_Class_Type','order_Type','payee_Type','zb_payee_type']);
      //this.onGetCoursePlanPartInfo();
      // this.onGetDetail();  
      if(this.props.currentDataModel.studentPayfeeId){
        this.fetch();
      }
    }

    fetch(params) {
      this.setState({ loading: true });
      // var condition = params || this.state.pagingSearch; 
      let condition = {
        studentPayfeeId : this.props.currentDataModel.studentPayfeeId
      }
      // condition.studentPayfeeId = this.props.currentDataModel.studentId;
      this.props.studentPayfeeEditById(condition).payload.promise.then((response) => {
          let data = response.payload.data; 
          if (data.state === 'success') {
              this.setState({
                  pagingSearch: condition,
                  data_list: data.data,
                  totalRecord: data.totalRecord,
                  loading: false
              })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  };
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
        this.props.viewCallback(true);
    }
    onSubmit = () => {
      var that = this;
      //表单验证后，合并数据提交
      this.props.form.validateFields((err, values) => {
        let id = this.state.dataModel.courseplanBatchId
        if (!err) { 
          this.setState({
            loading: true 
          })
          let condition = {};
          condition.studentPayfeeId = this.props.currentDataModel.studentPayfeeId;
          condition.payDate = formatMoment(values.payDate) 
          this.props.studentPayfeeEditChangeTimeById(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if (data.state === 'success') {
                this.setState({ 
                    loading: false
                })
                this.props.viewCallback(true);//保存数据
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
         })
         
        }
      });
    }
    //标题
    getTitle() {
      let op = getViewEditModeTitle(this.props.editMode);
      return `大客户收费导入信息修改`;
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
    render() { 
        let title = this.getTitle();
        const { getFieldDecorator } = this.props.form;
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                <Form>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="姓名">
                        <span>{this.state.data_list.studentName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="证件号">
                          <span>{this.state.data_list.certificateNo}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="手机号">
                          <span>{this.state.data_list.moblie}</span>
                      </FormItem>
                    </Col> 
                    <Col span={12}></Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="订单号">
                          <span>{this.state.data_list.orderSn}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="班型">
                          <span>{this.state.data_list.classTypes}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="订单类型">
                        <span>{
                           getDictionaryTitle(this.state.order_Type,this.state.data_list.orderType)
                        }</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="大客户">
                          <span>{this.state.data_list.partnerName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="公司">
                          <span>{
                            getDictionaryTitle(this.state.zb_payee_type,this.state.data_list.zbPayeeType)
                          }</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="收费方">
                          <span>{
                            getDictionaryTitle(this.state.payee_Type,this.state.data_list.payeeType)
                          	}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="订单总金额">
                          <span>{this.state.data_list.totalAmount}</span>
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="缴费期数">
                          <span>{this.state.data_list.term}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="缴费金额">
                          <span>{this.state.data_list.payMoney}</span>
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="缴费日期">
                        {
                          getFieldDecorator("payDate", {
                            initialValue: dataBind(timestampToTime(this.state.data_list.payDate), true),
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
      courseArrangeBaseInfoById: bindActionCreators(courseArrangeBaseInfoById, dispatch),
      studentPayfeeEditById: bindActionCreators(studentPayfeeEditById, dispatch),
      studentPayfeeEditChangeTimeById: bindActionCreators(studentPayfeeEditChangeTimeById, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
