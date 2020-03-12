import React from 'react';
import { bindActionCreators } from 'redux';
import {connect } from 'react-redux';
import { Form,Row,Col,Button,Select,message } from 'antd';
const FormItem = Form.Item;
import ContentBox from '@/components/ContentBox';
import {searchFormItemLayout } from '@/utils/componentExt'; 
import { ManagementOfStudentsCourseSelectiotEdit } from '@/actions/stuService';
import { CourseSelectionDropDown } from '@/actions/stuService';//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
class EditStudent extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dataModel:props.currentDataModel,
            CourseClass:[],
            loading:false,
            editMode:props.editMode,
            pagingSearch:{
                courseplanName:''
            }
        }
    }
    componentWillMount(){
        this.fetch();
    }
    fetch = () => {
        let condition = {};
        condition.courseCategoryId = this.state.dataModel.courseCategoryId;
        condition.studentId = this.state.dataModel.studentId;
        condition.isRehear = this.state.dataModel.isRehear; 
        condition.isHistory = this.state.dataModel.isHistory; 
        this.props.CourseSelectionDropDown(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if(data.state=='success'){
              let { pagingSearch } = this.state;
              pagingSearch.courseplanName = ''
                this.setState({
                    CourseClass:data.data,
                    pagingSearch  
              })
              this.props.form.resetFields(['courseplanName']); 
            }else{
                message.error(data.msg)
            }
        })
    }
    onSubmit = () => {
        this.props.form.validateFields((err,values)=>{
            if(!err){
                let condition = {};
                condition.courseArrangeStudentId = this.state.dataModel.courseArrangeStudentId;
                condition.studentId = this.state.dataModel.studentId;
                condition.newCourseArrangeId = values.newCourseArrangeId;
                this.props.ManagementOfStudentsCourseSelectiotEdit(condition).payload.promise.then((response) => {
                    let data = response.payload.data; 
                    if(data.state=='success'){
                        message.success('编辑成功!')
                      this.props.viewCallback(true);
                    }else{
                        message.error(data.msg)
                    }
                })
            }
        })
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    renderBtnContorl(){
        return <FormItem 
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type='primary' icon='save' loading={this.state.loading} onClick={this.onSubmit}>确定</Button><span className='split_button'></span><Button onClick = {this.onCancel} icon='rollback'>取消</Button>
        </FormItem>
    }
    onLookView = (op,item) => {
        this.setState({
            editMode:op,
            currentDataModel: item
        })
    }
    onViewCallback = (data) => { 
        this.setState({ currentDataModel:null,editMode:'Edit'}) 
    }
    render(){    
        const { getFieldDecorator }  = this.props.form;
        let block_content = <div></div>;
        switch(this.state.editMode){ 
            case 'ViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.dataModel.studentId} />
              break;
            case 'Edit': 
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='学生姓名'
                                >
                                <div><a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail'); }}>{this.state.dataModel.studentName}</a></div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='教学点'
                                >
                                <div>{this.state.dataModel.teachCenterName}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='证件号'
                                >
                                <div>{this.state.dataModel.certificateNo}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='手机号'
                                >
                                <div>{this.state.dataModel.mobile}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='微信号'
                                >
                                <div>{this.state.dataModel.weixin}</div>

                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='QQ'
                                >
                                <div>{this.state.dataModel.qq}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='入学年份'
                                >
                                <div>{this.state.dataModel.studyUniversityEnterYear}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='就读高校'
                                >
                                <div>{this.state.dataModel.teachCenterName}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}> 
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='项目'
                                >
                                <div>{this.state.dataModel.itemName}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='科目'
                                >
                                <div>{this.state.dataModel.courseCategoryName}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='课程班'
                                >
                                {getFieldDecorator('newCourseArrangeId',{ 
                                    initialValue:'',
                                    rules:[{
                                        required:true,message:'请选择课程班！'
                                    }]
                                })(
                                    <Select>
                                        <Select.Option value=''>全部</Select.Option>
                                        {
                                            this.state.CourseClass.map((item,index)=>{
                                                return <Select.Option value={item.courseArrangeId} key={index} title={item.courseplanFullName}>{item.courseplanFullName}</Select.Option>
                                            })
                                        }
                                    </Select>
                                )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                )
                break
        }
        return <div>
            {this.state.editMode == 'ViewStudentDetail'?block_content:
            <ContentBox titleName={'学生选课修改'} bottomButton = {this.renderBtnContorl()}>
                <div className='dv_split'></div>
                {block_content}
                <div className='dv_split'></div>
            </ContentBox>
            }
        </div>
    }

}


const WrappedMange = Form.create()(EditStudent);

const mapStateTopProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}
function mapDispatchTopProps(dispatch){
    return {
        CourseSelectionDropDown: bindActionCreators(CourseSelectionDropDown, dispatch),
        //编辑
        ManagementOfStudentsCourseSelectiotEdit: bindActionCreators(ManagementOfStudentsCourseSelectiotEdit, dispatch),
    }
}

export default connect(mapStateTopProps,mapDispatchTopProps)(WrappedMange)