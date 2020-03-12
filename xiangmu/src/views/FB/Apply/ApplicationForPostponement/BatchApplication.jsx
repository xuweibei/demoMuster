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
      arriveMan:[],
      studentInviteIds:[],
      visible:false
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    let man = [];
    let id = [];
    this.state.dataModel.taskMan.forEach((item)=>{
      man.push(item.realName)
      id.push(item.courseActiveId)
    })                                                                                                                 
    this.setState({
      arriveMan:man.join(','),
      studentInviteIds:id.join(',')
    })
  }
  onSubmit = () => {
     //表单验证后，合并数据提交
     this.props.form.validateFields((err, values) => {
      if (!err) {
        
        this.setState({
          visible:true
        })
        if(!this.state.visible)return
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
           values.courseActiveIds = this.state.studentInviteIds
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
  handleCancel=()=>{
    this.setState({
      visible:false
    })
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
      return '延期申请'
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

    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "editpUser":
        block_content = (
          <Form className="search-form">
             <p style={{marginLeft:'10%',fontSize:16,color:'black'}}>
                   选择了<span style={{color:'red',margin:'0 10'}}>{ this.state.dataModel.taskMan.length}</span>个课程进行延期申请
             </p>
            <Row gutter={24}>
            <Col span={24}>
                <FormItem
                  {...searchFormItemLayout}
                  label="延期天数"
                >
                  {getFieldDecorator('day', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入延期天数！',
                    
                    },{
                      validator:function (rule,value,callback){
                        let re = /^\d+$/;
                        if(value<=0||!re.test(value)){
                          callback('输入天数必须为大于零的整数！')
                        }
                        callback()
                      },message: '输入天数必须为大于零的整数！'
                    }],
                  })(
                    <Input style={{width:100}}/>
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout}
                  label="延期理由"
                >
                  {getFieldDecorator('reason', {
                    initialValue: '',
                  })(
                    <TextArea/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Modal
              title={<strong>延期申请</strong>}
              visible={this.state.visible}
              onOk={this.onSubmit}
              onCancel={this.handleCancel}
            >
            <p style={{fontSize:'16px'}}>一个学生一个科目延期只有一次机会，您确认对<span style={{color:'red'}}>{this.state.arriveMan}</span>进行延期处理吗？</p>
            </Modal>
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
