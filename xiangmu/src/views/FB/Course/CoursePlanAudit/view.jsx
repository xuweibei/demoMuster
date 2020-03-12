/**
* 开课计划审核 / 查看 界面
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Card, Radio, message,Tabs, DatePicker } from 'antd';
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { TextArea } = Input;
import ContentBox from '@/components/ContentBox';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import StudentInviteManage from './student.jsx';
import { loadBizDictionary } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime,convertTextToHtml } from '@/utils';
import { loadDictionary } from '@/actions/dic';
import { getCoursePlanAuditById } from '@/actions/course';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const searchFormItemLayout24 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
}
const searchFormItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
}
const searchFormItemLayout12 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
}

class CoursePlanView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型 
            endOpen: false, 
            teachClassType: props.currentDataModel.teachClassType
          };
        this.loadBizDictionary = loadBizDictionary.bind(this);
        (this: any).onSubmit = this.onSubmit.bind(this);
        (this: any).onGetCoursePlanInfo = this.onGetCoursePlanInfo.bind(this);
        (this: any).onBeginChange = this.onBeginChange.bind(this);
        (this: any).onEndChange = this.onEndChange.bind(this); 
    }
    componentWillMount() {
      this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'teach_class_type', 'courseplan_status']); 
      this.onGetCoursePlanInfo();
    }

    onGetCoursePlanInfo(){ 
      if(this.state.dataModel.courseplanId){
        this.props.getCoursePlanAuditById(this.state.dataModel.courseplanId).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state === 'success'){
            data.data.startDate = timestampToTime(data.data.startDate);
            data.data.endDate = timestampToTime(data.data.endDate);
            data.data.courseplanId = this.state.dataModel.courseplanId;
            this.setState({
              dataModel: data.data
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
      if (this.props.editMode == "Audit") {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
          if (!err) {
              Modal.confirm({
                title: '审核',
                content: '你确认要审核吗？',
                onOk: () => {
                  that.setState({ loading: true });
                  setTimeout(() => {
                      that.setState({ loading: false });
                  }, 3000);//合并保存数据
                  this.props.viewCallback({...values, id: that.state.dataModel.courseplanId});//保存数据
                },
                onCancel: () => {
                  console.log('Cancel');
                },
              });
          }
        });
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
        if (this.props.editMode != 'View' && this.props.editMode != 'searchView') {
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
        switch (this.props.editMode) {
            case "Audit":
              block_content = (
                <Form>
                  <Row span={24}>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout12} label="以下为审核情况">
                        {/* <div>{this.state.dataModel.auditLog}</div><br/> */}
                        <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>
                      </FormItem>
                      {/* <div style={{marginLeft:0}}>以下为审核情况：</div><br/>
                      <div>{this.state.dataModel.auditLog}</div><br/> */}
                    </Col>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout12} label="总部审核" style={{marginLeft:"-54px"}}>
                      </FormItem>
                      {/* <div style={{marginLeft:0}}>总部审核：</div> */}
                    </Col>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout12} label="审核结果">
                        {getFieldDecorator('isPass', {
                          initialValue: "",
                          rules: [{ required: true, message: '请选择审核状态!' }]
                        })(
                          <Select>
                            <Option value={1}>审核通过</Option>
                            <Option value={0}>审核不通过</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}></Col>
                    <Col span={24}>
                      <FormItem {...searchFormItemLayout12} label="审核意见">
                        {getFieldDecorator('reason', {
                          initialValue: this.state.dataModel.reason,
                          rules: [{ required: true, message: '请输入审核意见!' }],
                        })(
                          <TextArea rows={3}/>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              )
              break;
            case "View":
            case 'searchView':
              break;
            case "Delete":
                break;
        }
        return block_content;
    }

    render() { 
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView(); 
        return (
          this.props.editMode == 'Audit'?
            // <div>
            <Tabs  defaultActiveKey={'tab0'} type="card"  tabBarExtraContent={<a onClick={this.onCancel} className='button_back'>
            <Icon type="rollback" style={{ fontSize: 16, }} />返回</a>}>
            <TabPane tab={'审核'} key={`tab0`}>
            <div style={{padding:'20px 0'}}>
            <ContentBox bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                <Form>
                  <Row span={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="开课计划">
                        <span>{this.state.dataModel.courseplanBatchName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目">
                          <span>{this.state.dataModel.itemName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="教学点">
                          <span>{this.state.dataModel.teachCenterName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="科目">
                          <span>{this.state.dataModel.courseCategoryName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="课程班名称">
                          <span>{this.state.dataModel.courseplanName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="课程班类型">
                        <span>{this.state.dataModel.teachClassTypeName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="预估考季">
                          <span>{this.state.dataModel.examBatchName}</span>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="是否新生班">
                          <span>{this.props.currentDataModel.isNewStudent==0?'否':this.props.currentDataModel.isNewStudent==1?'是':''}</span>
                      </FormItem>
                    </Col>
                    {/* <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="高校确定日期">
                          {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isUniversityDate)}
                      </FormItem>
                    </Col> */}
                    <Col span={12}>
                      <FormItem
                          {...searchFormItemLayout}
                          label="开课日期"
                      >
                        {timestampToTime(this.state.dataModel.startDate, dateFormat)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                          {...searchFormItemLayout}
                          label="结课日期"
                      >
                      {timestampToTime(this.state.dataModel.endDate, dateFormat)}
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
                          {/* <span>{
                            this.state.partInfo.courseplanBatchItemList.map(b => {
                              return b.teachClassType == this.state.teachClassType && b.minStudentNum
                            })
                          }</span> */}
                          <span>{this.state.dataModel.minStudentNum}</span>
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
                          {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isAdmitOther)}
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
             </Tabs>
             :this.props.editMode == 'searchView'?
        <Tabs  defaultActiveKey={'tab0'} type="card"  tabBarExtraContent={<a onClick={this.onCancel} className='button_back'>
        <Icon type="rollback" style={{ fontSize: 16, }} />返回</a>}>
        <TabPane tab={'基本信息'} key={`tab0`}>
        <div style={{padding:'20px 0'}}>
        <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
      <div className="dv_split"></div>
      <Form>
        <Row span={24}>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="开课计划">
              <span>{this.state.dataModel.courseplanBatchName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="项目">
                <span>{this.state.dataModel.itemName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="教学点">
                <span>{this.state.dataModel.teachCenterName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="科目">
                <span>{this.state.dataModel.courseCategoryName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="课程班名称">
                <span>{this.state.dataModel.courseplanName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="课程班类型">
              <span>{this.state.dataModel.teachClassTypeName}</span>
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem {...searchFormItemLayout24} label="预估考季">
                <span>{this.state.dataModel.examBatchName}</span>
            </FormItem>
          </Col>
          {/* <Col span={12}>
            <FormItem {...searchFormItemLayout} label="高校确定日期">
                {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isUniversityDate)}
            </FormItem>
          </Col> */}
          <Col span={12}>
            <FormItem
                {...searchFormItemLayout}
                label="开课日期"
            >
              {timestampToTime(this.state.dataModel.startDate, dateFormat)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
                {...searchFormItemLayout}
                label="结课日期"
            >
            {timestampToTime(this.state.dataModel.endDate, dateFormat)}
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
                {/* <span>{
                  this.state.partInfo.courseplanBatchItemList.map(b => {
                    return b.teachClassType == this.state.teachClassType && b.minStudentNum
                  })
                }</span> */}
                <span>{this.state.dataModel.minStudentNum}</span>
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
                {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isAdmitOther)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="意向讲师">
                <span>{this.state.dataModel.intentTeacher}</span>
            </FormItem>
          </Col>
          <Col>
            <FormItem {...searchFormItemLayout12} label="以下为审核情况">
                <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>
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
      </Tabs>
      :
      
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
      <div className="dv_split"></div>
      <Form>
        <Row span={24}>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="开课计划">
              <span>{this.state.dataModel.courseplanBatchName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="项目">
                <span>{this.state.dataModel.itemName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="教学点">
                <span>{this.state.dataModel.teachCenterName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="科目">
                <span>{this.state.dataModel.courseCategoryName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="课程班名称">
                <span>{this.state.dataModel.courseplanName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="课程班类型">
              <span>{this.state.dataModel.teachClassTypeName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="预估考季">
                <span>{this.state.dataModel.examBatchName}</span>
            </FormItem>
          </Col> 
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="手机号">
                <span>{this.props.currentDataModel.createNameMobile}</span>
            </FormItem>
          </Col>
          {/* <Col span={12}>
            <FormItem {...searchFormItemLayout} label="高校确定日期">
                {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isUniversityDate)}
            </FormItem>
          </Col> */}
          <Col span={12}>
            <FormItem
                {...searchFormItemLayout}
                label="开课日期"
            >
              {timestampToTime(this.state.dataModel.startDate, dateFormat)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
                {...searchFormItemLayout}
                label="结课日期"
            >
            {timestampToTime(this.state.dataModel.endDate, dateFormat)}
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
                {/* <span>{
                  this.state.partInfo.courseplanBatchItemList.map(b => {
                    return b.teachClassType == this.state.teachClassType && b.minStudentNum
                  })
                }</span> */}
                <span>{this.state.dataModel.minStudentNum}</span>
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
                {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isAdmitOther)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="意向讲师">
                <span>{this.state.dataModel.intentTeacher}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="创建人">
                <span>{this.props.currentDataModel.createName}</span>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="提交日期">
                <span>{timestampToTime(this.props.currentDataModel.submitDate)}</span>
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
      {block_editModeView}
      <div className="dv_split"></div>
  </ContentBox>
        );
    }
}

const WrappedView = Form.create()(CoursePlanView);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      getCoursePlanAuditById: bindActionCreators(getCoursePlanAuditById, dispatch), 
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
