
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Form, Row, Col, Input, Select, Button,Radio, message,DatePicker 
} from 'antd'; 
const FormItem = Form.Item; 

import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getViewEditModeTitle, dataBind,formatMoment, timestampToTime } from '@/utils';
 
import { ResultInputListOne,ResultInputListSave } from '@/actions/stuService'; 
import FileUploader from '@/components/FileUploader';
import FileDownloader from '@/components/FileDownloader';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class ResultInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            Examination:[],
            dataModel:
            { ...props.currentDataModel, stageList: [] },
            pagingSearch:{
                itemId:'',
                state:'',
                examBatchId:''
            }
        };
    }
    componentWillMount() {
        // console.log(this.props) 
        this.fetch()

    }
    fetch = () => {
        let condition = {};
        condition.studentId = this.props.currentDataModel.studentId; 
        condition.studentScoreId = this.props.currentDataModel.studentScoreId;
        condition.orderId = this.props.currentDataModel.orderId;
        this.props.ResultInputListOne(condition).payload.promise.then((response) => {
                 let data = response.payload.data; 
                 let Examination = [];
                 let studentScore = '';
                 let exam = true;
                 if(data.data.length){
                    data.data.forEach(item=>{ 
                        if(item.examBatchs && item.examBatchs.length){
                            Examination.push(...item.examBatchs)
                        } 
                        if(item.studentScore){
                            studentScore = item.studentScore
                        }
                    })  
                    if(!Examination.length){
                        let exObj = {
                            examBatchId:studentScore.examBatchId,
                            examBatchName:studentScore.examBatchName
                        }
                        Examination.push(exObj)
                    } 
                    let onOff = Examination.find(item=>item.examBatchId == studentScore.examBatchId);   
                    if(onOff){
                        exam = true;
                        this.state.pagingSearch.examBatchId = onOff.modifyUid;
                    }else{
                        exam = false;
                        this.state.pagingSearch.examBatchId = ''
                    }
                    this.setState({
                        pagingSearch:this.state.pagingSearch,
                        Examination
                    })
                 } 
                 if(data.state == 'success'){ 
                     if(!exam)studentScore.examBatchId = '';
                     if(studentScore.state==0)studentScore.state = '';
                     let condition = {...this.state.pagingSearch,...studentScore}; 
                     this.setState({
                         lowInfo:data.data,
                         pagingSearch : condition
                     })
                 }else{
                     message.error(data.msg);
                 }
            }
        )
    } 
    onCancel = () => {
        this.props.viewCallback();
    }

    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => { 
            if (!err) {   
                values.examDate = formatMoment(values.examDate) 
                if(values.score && !values.state)return message.warning('成绩存在时通过情况必选！')
                if(!values.score && values.state)return message.warning('已选通过情况成绩必填！')
                values = {...this.state.pagingSearch,...values}  
                delete values.scoreType;
                delete values.courseArrangeId;
                that.setState({ loading: true });  
                this.props.ResultInputListSave(values).payload.promise.then((response) => {
                    let data = response.payload.data;  
                        if(data.state == 'success'){ 
                            message.success('修改成功！');
                            this.props.viewCallback('set');
                        }else{
                            message.error(data.msg);
                        }
                        that.setState({
                            loading:false
                        })
                    }
                )
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `录入学生考试成绩`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>确定</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let stageArry = [];
            switch (this.props.editMode) {
                case "View":
                case "Result": 
                    block_content = (
                        <Form>
                            <Row gutter={24}> 
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="教学点">
                                        {this.state.dataModel.teachCenterName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="科目">
                                        {this.state.dataModel.courseCategoryName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生姓名">
                                        {this.state.dataModel.realName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="就读高校">
                                        {this.state.dataModel.universityName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="入学年份">
                                        {this.state.dataModel.studyUniversityEnterYear}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="专业">
                                        {this.state.dataModel.studySpecialty}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="手机号">
                                        {this.state.dataModel.mobile}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="证件号">
                                        {this.state.dataModel.certificateNo}
                                    </FormItem>
                                </Col> 
                                <Col span={12}>
                                    <FormItem
                                    {...searchFormItemLayout}
                                    label = '考季'
                                    >
                                        {getFieldDecorator('examBatchId',{
                                            initialValue:this.state.pagingSearch.examBatchId,
                                            rules: [{
                                              required: true, message: '请选择考季!',
                                            }],
                                        })( 
                                            <Select
                                                onChange={(value)=>{ 
                                                    this.state.pagingSearch.examBatchId = value;
                                                    this.setState({
                                                        pagingSearch:this.state.pagingSearch
                                                    })
                                                }}
                                            >
                                                <Option value=''>--请选择--</Option>
                                                {
                                                    this.state.Examination.map(item=>{
                                                        return <Option value={item.examBatchId}>{item.examBatchName}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem> 
                                </Col> 
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="考试日期"
                                    >
                                        {getFieldDecorator('examDate', { initialValue: dataBind(timestampToTime(this.state.pagingSearch.examDate), true) })(
                                            <DatePicker placeholder="考试日期" />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label = '成绩' 
                                    >
                                        {getFieldDecorator('score',{
                                            initialValue:this.state.pagingSearch.score,
                                            rules: [{
                                                pattern: /^[0-9]*$/,message: '请输入数字!',
                                              }],
                                        })(
                                            <Input placeholder='请输入考试成绩' />
                                        )}
                                    </FormItem>
                                </Col> 
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label = '通过情况' 
                                    >
                                        {getFieldDecorator('state',{initialValue:dataBind(this.state.pagingSearch.state)})(
                                            <Select>
                                                <Option value=''>--请选择--</Option>
                                                <Option value='1'>通过</Option>
                                                <Option value='2'>未通过</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col> 
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout}
                                    label='附件'
                                    extra={!this.state.dataModel.scoreFile?<p style={{color:'red'}}>文件类型为PDF、JPG</p> : <div><FileDownloader
                                        apiUrl={'/edu/file/getFile'}//api下载地址
                                        method={'post'}//提交方式
                                        options={{ filePath: this.state.dataModel.scoreFile }}
                                        title={'下载附件'}
                                    >
                                    </FileDownloader><p style={{color:'red'}}>文件类型为PDF、JPG</p></div>}>
                                        {getFieldDecorator('scoreFile', {
                                            initialValue: dataBind(this.state.pagingSearch.scoreFile),
                                        })(
                                            <FileUploader />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form>
                    );
                    break;
            }

        return (
            <div>
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox> 
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(ResultInput);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {  
        ResultInputListOne: bindActionCreators(ResultInputListOne, dispatch),
        ResultInputListSave: bindActionCreators(ResultInputListSave, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
