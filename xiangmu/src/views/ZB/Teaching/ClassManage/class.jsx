/**
* 班级详情
*/
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Card, Radio, message,Tabs, DatePicker } from 'antd';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
import ContentBox from '@/components/ContentBox';
import { env } from '@/api/env';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import StudentInviteManage from './student.jsx';
import { loadBizDictionary } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime,convertTextToHtml } from '@/utils';
import { loadDictionary } from '@/actions/dic';
import { classInfoQueryById } from '@/actions/teaching';
import { queryItemStageVosList } from '@/actions/base';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const searchFormItemLayout24 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
}
const searchFormItemLayout18 = {
    labelCol: { span: 8 },
    wrapperCol: { span: 10 },
  }


class CourseClassView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            itemStage_list: [],
            isFinal: 0,
            isShowFimal: false,
            dataModel: props.currentDataModel,//数据模型 
            endOpen: false, 
            teachClassType: props.currentDataModel.teachClassType
          };
        this.loadBizDictionary = loadBizDictionary.bind(this);
        (this: any).onSubmit = this.onSubmit.bind(this);
        (this: any).onGetClassInfo = this.onGetClassInfo.bind(this);
    }
    componentWillMount() {
      this.onGetClassInfo();
    }

    onGetClassInfo(){  
      if(this.state.dataModel.classId){
        this.props.classInfoQueryById({classId:this.state.dataModel.classId}).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state === 'success'){
            this.setState({
              dataModel: data.data,
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
      
        return `班级详情`;
      
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View' && this.props.editMode != 'Class') {
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
          this.props.editMode == 'Class'?
        <Tabs  defaultActiveKey={'tab0'} type="card"  tabBarExtraContent={<a onClick={this.onCancel} className='button_back'>
        <Icon type="rollback" style={{ fontSize: 16, }} />返回</a>}>
        <TabPane tab={'班级详情'} key={`tab0`}>
        <div style={{padding:'20px 0'}}>
        <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
          <div className="dv_split"></div>
          <Form>
            <img 
                style={{width: 150,
                    height: 150,
                    position: 'absolute',
                    right: 60
                }}
                src={env.serverURL+this.state.dataModel.qrCodeUrl}
            />
            <Row span={24}>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="班级名称">
                  <span>{this.state.dataModel.className}</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="已选择课程">
                    <span>{this.state.dataModel.courseName}</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout18} label="教学版本">
                    <span>{this.state.dataModel.versionNameCache}</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout18} label="教学计划">
                    <span>{this.state.dataModel.planNameCache}</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout18} label="讲师">
                    <span>{this.state.dataModel.lecturerNames}</span>
                </FormItem>
              </Col>
              {/* <Col span={24}>
                <FormItem {...searchFormItemLayout18} label="助教">
                    <span>{this.state.dataModel.assistantNames}</span>
                </FormItem>
              </Col> */}
              
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="班主任">
                    <span>{this.state.dataModel.classTeacherName}</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="人数">
                    <span>{this.state.dataModel.studentNum}&nbsp;人</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="周数">
                    <span>{this.state.dataModel.weeks}&nbsp;周</span>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="有效期">
                    <span>{timestampToTime(this.state.dataModel.starTime)+' 至 '+ timestampToTime(this.state.dataModel.endTime)}</span>
                </FormItem>
              </Col>
              
            </Row>
          </Form>
          <div className="dv_split"></div>
      </ContentBox>
      </div>
      </TabPane>
      <TabPane tab={'学员列表'}  key={`tab1`}>
          <div style={{ padding:'20px 0'}}>
            <StudentInviteManage {...this.state} currentDataModel={this.props.currentDataModel} />
          </div>
      </TabPane>
      </Tabs>
      : ''
        );
    }
}

const WrappedView = Form.create()(CourseClassView);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      classInfoQueryById: bindActionCreators(classInfoQueryById, dispatch), 
      queryItemStageVosList: bindActionCreators(queryItemStageVosList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
