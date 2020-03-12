import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { Modal,Radio, Form, Row, Col, Input, Select, Button,message, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
 
const { TextArea } = Input; 
import { dataBind, timestampToTime } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24,loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox'; 
import { EditAndDeleteInterfaces } from '@/actions/base';  


import { loadDictionary } from '@/actions/dic';

const FormItem = Form.Item;  
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

  
 
class DetailView extends React.Component {
  constructor(props) {
    super(props)
    
  this.state = { 
    ChoiceNum:props.currentDataModel.receiveWay,
    exhibition:props.editMode,
    dataModel: props.currentDataModel,//数据模型 
  };
   
    this.loadBizDictionary = loadBizDictionary.bind(this);

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() { 
    this.loadBizDictionary(['invite_source','visit_status','order_audit_status','express']); 
  } 
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
     if (!err) {
       this.setState({ loading: true });   
       values.studentMaterialId = this.props.currentDataModel.studentMaterialId;
       values.studentId = this.props.currentDataModel.studentId;
       values.courseId = this.props.currentDataModel.courseId;
       values.orderId = this.props.currentDataModel.orderId;
       values.courseActiveId = this.props.currentDataModel.courseActiveId;
       values.courseCategoryId = this.props.currentDataModel.courseCategoryId;
       values.itemId = this.props.currentDataModel.itemId;
       values.branchId = this.props.currentDataModel.branchId;
       values.orderCourseProductId = this.props.currentDataModel.orderCourseProductId;
       values.courseProductId = this.props.currentDataModel.courseProductId; 
       values.receiver = this.props.currentDataModel.realName;
       this.props.EditAndDeleteInterfaces(values).payload.promise.then((response) => {
        let data = response.payload.data; 
          if(data.state == 'success'){
            message.success('修改成功！')
            this.props.viewCallback();
          }else{
            message.error(data.msg);
          }
          this.setState({ loading: false });   
       }) 
     }
   });
 }
  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '延期申请信息';
      return `${op}`;
    }else{  
       op = '讲义领取信息编辑';
       return `${op}`;
    }
  } 

  onViewCallback=()=>{
    this.setState({
      exhibition:'ViewEdit'
    })
  }
  //表单按钮处理
  renderBtnControl() {
    if(this.props.editMode=='ViewEdit'){
      return <FormItem
                className='btnControl'
                {...btnsearchFormItemLayout}
              > 
                <Button type="primary" onClick={this.onSubmit} loading={this.state.loading} icon="save">确定</Button>
                <span className="split_button"></span>
                <Button onClick={this.onCancel} icon="rollback" loading={this.state.loading}>返回</Button>
              </FormItem>
    }
    return <FormItem
      className='btnControl'
      {...btnsearchFormItemLayout}
    >
      <Button onClick={this.onCancel} icon="rollback">返回</Button>
    </FormItem>

  }  
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;  
    switch (this.state.exhibition) {
      case 'ViewEdit':
        block_content = (
        <Form className="search-form">
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="分部"
              >
                {this.state.dataModel.orgName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="姓名"
              >
               {this.state.dataModel.realName}
              </FormItem>
            </Col> 
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="手机号"
              >
               {this.state.dataModel.mobile}
              </FormItem>
            </Col>

            <Col span={24} >
              <FormItem
                {...searchFormItemLayout24}
                label="课程名称"
              >
                {this.state.dataModel.courseName}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="所属课程商品"
              >
               {this.state.dataModel.productName}
              </FormItem>
            </Col> 
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}rehearMsg
                label="是否赠送"
              >
              {this.state.dataModel.giveMsg}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="是否允许重修"
              >
              {this.state.dataModel.rehearMsg}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="讲义领取情况"
              > 
               {getFieldDecorator('receiveWay', {
                initialValue: this.state.dataModel.receiveWay==0?'':dataBind(this.state.dataModel.receiveWay),
                rules: [{
                  required: true, message: '请选择领取情况!',
                }],
              })(
                <Select onChange={(value)=>{
                  this.setState({
                    ChoiceNum:value
                  })
                }}>
                  <Option value=''>--请选择--</Option>
                  <Option value='1'>已自取</Option>
                  <Option value='3'>已邮寄</Option>
                </Select>
              )}
              </FormItem>
            </Col>
            {
              (this.state.ChoiceNum==1)? <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="快递公司"
              >
              {getFieldDecorator('express', {
               initialValue: dataBind(this.state.dataModel.express)
             })( 
                  <Select>
                    <Option value=''>--请选择--</Option>
                    {
                      this.state.express.map(item=>{ 
                        return <Option value={item.value}>{item.title}</Option>
                      })
                    }
                  </Select>
                )
                }
              </FormItem>
            </Col>: <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="快递公司"
              >
              {getFieldDecorator('express', {
               initialValue: dataBind(this.state.dataModel.express), 
               rules: [{
                 required: true, message: '请选择快递公司!',
               }],
             })( 
                  <Select>
                    <Option value=''>--请选择--</Option>
                    {
                      this.state.express.map(item=>{ 
                        return <Option value={item.value}>{item.title}</Option>
                      })
                    }
                  </Select>
                )
                }
              </FormItem>
            </Col>
            }
           
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="快递编号"
              >
              {getFieldDecorator('expressNum', {
                initialValue: dataBind(this.state.dataModel.expressNum), 
              })( 
                <Input />
              )} 
              </FormItem>
            </Col>  
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="快递地址"
              >
               {getFieldDecorator('sendAddress', {
                initialValue: this.state.dataModel.sendAddress?dataBind(this.state.dataModel.sendAddress):dataBind(this.state.dataModel.address), 
              })( 
                <TextArea />
              )} 
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem {...searchFormItemLayout24} label="领取备注">
               {getFieldDecorator('receiveRemark', {
                  initialValue: dataBind(this.state.dataModel.receiveRemark), 
                })( 
                  <TextArea />
                )} 
              </FormItem>
            </Col> 
          </Row>

        </Form>)
        break;
      case "View":
      block_content = (
        <Form className="search-form">
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="学生姓名"
              >
                {this.state.dataModel.studentName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="教学点"
              >
               {this.state.dataModel.teacherCenterName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label='证件号'
              >
                 {this.state.dataModel.certificateNo}
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="手机号"
              >
               {this.state.dataModel.mobile}
              </FormItem>
            </Col>

            <Col span={24} >
              <FormItem
                {...searchFormItemLayout24}
                label="课程商品"
              >
                {this.state.dataModel.productName}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="重修"
              >
                 {this.state.dataModel.rehearOrNot==1?'允许':'不允许'}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="课程名称"
              >
                {this.state.dataModel.courseName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="激活日期"
              >
                {timestampToTime(this.state.dataModel.activeTime)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="网课截止日期"
              >
                 {timestampToTime(this.state.dataModel.endTime)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="延期天数"
              >
                {this.state.dataModel.applyDays}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="申请日期"
              >
                 {timestampToTime(this.state.dataModel.createDate)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                style={{ paddingRight: 18 }}
                label="是否为特殊申请"
              >
                {this.state.dataModel.isSpecialApply==0?'否':'是'}

              </FormItem>
            </Col>
            
            <Col span={12}>
              <FormItem
                {...searchFormItemLayout}
                label="操作人"
              >
                {this.state.dataModel.createUser}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="申请理由"
              >
                {this.state.dataModel.applyReason}
              </FormItem>
            </Col>
            <Col span={12}></Col>
            <Col span={24}>
              <FormItem
                {...searchFormItemLayout24}
                label="审核情况"
              >
                {this.state.dataModel.auditLog}
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
     {block_editModeView}
   </ContentBox>
    );
  }
}

const WrappedDetailView = Form.create()(DetailView);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    EditAndDeleteInterfaces: bindActionCreators(EditAndDeleteInterfaces, dispatch), 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDetailView);
