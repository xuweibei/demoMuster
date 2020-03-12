import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button,Radio, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import { queryUserByBranchId } from '@/actions/enrolStudent';
import {searchFormItemLayout,searchFormItemLayout24} from '@/utils/componentExt';

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
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
      studentCourseApplyId:[]
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    let id = [];
    this.state.dataModel.taskMan.forEach((item)=>{
      id.push(item.studentCourseApplyId)
    })
    this.setState({
      studentCourseApplyId:id.join(',')
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
        }else if(this.props.editMode == 'editpUser'){
           values.studentCourseApplyIds = this.state.studentCourseApplyId
        }
        else {
          var postData = {
            ids: this.props.UserSelecteds.join(','),
            regionId: values.areaId,
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
      // return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员`;
      return '学生网课批量审核'
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


  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = '确定'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="edit" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >返回</Button>
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
    JSON.stringify(this.state.dataModel);
    switch (this.props.editMode) {
      case "editpUser":
        block_content = (
          <Form className="search-form">
             <p style={{marginLeft:'10%',fontSize:16,color:'black'}}>
                   您选择了<span style={{color:'red',margin:'0 10'}}>{this.state.dataModel.taskMan.length}</span>位学生信息进行操作：
             </p>
            <Row gutter={24}>
            <Col span={24}>
              <FormItem {...searchFormItemLayout24} label="审核结果">
                {getFieldDecorator('isPass', {
                  initialValue: dataBind(this.state.dataModel.isAdmitOther),
                  rules: [{
                    required: true, message: '请选择审核结果!',
                  }],
                })(
                  <RadioGroup value={dataBind(this.state.dataModel.isAdmitOther)} hasFeedback>
                      <Radio value='1' >审核通过</Radio>
                      <Radio value='0' >审核未通过</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
            <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="审核结果"
                >
                  {getFieldDecorator('auditReason', {
                    initialValue: '',
                  })(
                    <TextArea/>
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
