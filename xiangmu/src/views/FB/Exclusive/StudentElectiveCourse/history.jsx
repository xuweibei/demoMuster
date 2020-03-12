import React from 'react';
import { bindActionCreators } from 'redux';
import {connect } from 'react-redux';
import { Form,Row,Col,Button,Select,message } from 'antd';
const FormItem = Form.Item;
import ContentBox from '@/components/ContentBox';
import {searchFormItemLayout } from '@/utils/componentExt'; 
import { SubjectRequestList,CourseSelectionDropDown,ConfirmationOfCourseSelection } from '@/actions/stuService'; 
import SelectItem from '@/components/BizSelect/SelectItem'; 
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

class HistroySelection extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dataModel:props.currentDataModel,
            UserSelecteds:[],
            CourseClass:[],
            loading:false, 
            editMode:props.editMode,
            subjectList:[]
        }
    }
    componentWillMount(){ 
    } 
    //课程班请求接口
    CourseClassList = (courseCategoryId) => {
        let condition = {};
        condition.courseCategoryId = courseCategoryId;
        condition.studentId	 = this.state.dataModel.studentId; 
        condition.isHistory = 1; 
        this.props.CourseSelectionDropDown(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if(data.state=='success'){ 
                this.setState({
                    CourseClass:data.data, 
              }) 
            }else{
                message.error(data.msg)
            }
        })
    }
    onSubmit = () => {
        this.props.form.validateFields((err,values)=>{
            if(!err){ 
                let condition = {}; 
                condition.isHistory = 1;
                condition.courseArrangeIds = values.courseplanName;
                condition.studentId = this.state.dataModel.studentId;
                this.props.ConfirmationOfCourseSelection(condition).payload.promise.then((response) => {
                    let data = response.payload.data; 
                    if(data.state=='success'){
                        message.success('操作成功！')
                        this.props.viewCallback(true);
                    }else{
                        message.error(data.msg)
                    }
                    }
                )
            }
        })
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    renderBtnContorl(){
        if(this.props.editMode == 'View'){
            return <Button onClick = {this.onCancel} icon='rollback'>返回</Button>
        }else{
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type='primary' icon='save' loading={this.state.loading} onClick={this.onSubmit}>确定</Button><span className='split_button'></span><Button onClick = {this.onCancel} icon='rollback'>取消</Button>
            </FormItem>
        }
    }
    getTitleName = ()=>{
        if(this.props.editMode == 'View'){
            return '学生学习情况查询'
        }else if(this.props.editMode == 'History'){
            return '学生历史科目选课'
        }
    }
    //科目请求
    SubjectRequest = (itemId) =>{
        let condition = {}
        condition.studentId = this.state.dataModel.studentId;
        condition.itemId = itemId;
        this.props.SubjectRequestList(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if(data.state=='success'){ 
                this.setState({
                    subjectList:data.data
              })
              this.props.form.resetFields(['courseplanName']); 
            }else{
                message.error(data.msg)
            }
        })
    }
    onLookView = (op,item) => {
        this.setState({
            editMode:op,
            currentDataModel: item
        })
    }
    onViewCallback = (data) => {
        if(data){
            this.onSearch();
            this.setState({
                currentDataModel:null,
                editMode:'Selection',
                UserSelecteds:[],
                selectDataList:[],
                selectedRowKeys:[]
            })
        }else{
            this.setState({ currentDataModel:null,editMode:'History'})
        }
    }
    //科目改变的时候，课程班跟着改变
    SubjectChange = (value) => { 
        this.CourseClassList(value);
    }
    render(){     
        const { getFieldDecorator }  = this.props.form;
        let block_content = <div></div>; 
        switch(this.state.editMode){
            case 'ViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.dataModel.studentId} />
              break;
            case 'History':
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
                                <div>{this.state.dataModel.universityName}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'项目'}>
                                    {getFieldDecorator('itemId', {
                                    initialValue:'',
                                    rules:[{
                                        required:true,message:'请选择项目'
                                    }]
                                    })(
                                    <SelectItem
                                        scope={'my'}
                                        hideAll={true}
                                        hidePleaseSelect={true}
                                        isFirstSelected={true}
                                        onSelectChange={(value) => {
                                            this.state.dataModel.itemId = value;
                                            this.state.dataModel.courseCategoryId = ''; 
                                            this.SubjectRequest(value)
                                            this.setState({ dataModel: this.state.dataModel });
                                            setTimeout(() => {
                                                {/* 重新重置科目项 */ }
                                                this.props.form.resetFields(['courseCategoryId']);
                                                // this.onSearch();
                                            }, 500);
                                        }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                {...searchFormItemLayout}
                                label = '科目'
                                >
                                {
                                    getFieldDecorator('courseCategoryId',{ 
                                        initialValue:'',
                                        rules: [{
                                            required: true, message: '请选择科目!',
                                        }],
                                    })( 
                                        <Select
                                            onChange = {this.SubjectChange}
                                        >
                                            <Select.Option value=''>--请选择--</Select.Option>
                                            {
                                                this.state.subjectList.map(item=>{
                                                    return <Select.Option value={item.courseCategoryId}>{item.courseCategoryFullname}</Select.Option>
                                                })
                                            }
                                        </Select>
                                    )
                                }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='课程班'
                                >
                                {getFieldDecorator('courseplanName',{ 
                                    initialValue:'',
                                    rules:[{
                                        required:true,message:'请选择课程班！'
                                    }]
                                })(
                                    <Select>
                                        <Select.Option value=''>全部</Select.Option>
                                        {
                                            this.state.CourseClass.map((item,index)=>{
                                                return <Select.Option value={item.courseArrangeId} key={index}>{item.courseplanFullName}</Select.Option>
                                            })
                                        }
                                    </Select>
                                )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                )
            break; 
        }
        
        return <div>
            {this.state.editMode == 'ViewStudentDetail'?block_content:
                <ContentBox titleName={this.getTitleName()} bottomButton = {this.renderBtnContorl()}>
                    <div className='dv_split'></div>
                    {block_content}
                    <div className='dv_split'></div> 
                </ContentBox>
            }
        </div>
        
    }

}


const WrappedMange = Form.create()(HistroySelection);

const mapStateTopProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}
function mapDispatchTopProps(dispatch){
    return {
        //课程班下拉
        CourseSelectionDropDown: bindActionCreators(CourseSelectionDropDown, dispatch), 
        //科目的下拉
        SubjectRequestList: bindActionCreators(SubjectRequestList, dispatch),
        //确认
        ConfirmationOfCourseSelection: bindActionCreators(ConfirmationOfCourseSelection, dispatch),
    }
}

export default connect(mapStateTopProps,mapDispatchTopProps)(WrappedMange)