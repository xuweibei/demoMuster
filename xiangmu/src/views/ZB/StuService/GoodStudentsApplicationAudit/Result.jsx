
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Form, Row, Col, Input, Select, Button,Radio, message,DatePicker 
} from 'antd'; 
const { TextArea } = Input;
const FormItem = Form.Item; 
const RadioGroup = Radio.Group;

import { searchFormItemLayout,searchFormItemLayout24  } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getViewEditModeTitle, dataBind,formatMoment, timestampToTime,convertTextToHtml } from '@/utils';
 
import { ResultInputListOne,GoodStudentsApplicationAuditSure } from '@/actions/stuService'; 
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
        // this.fetch()

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
                values.goodStudentId = this.state.dataModel.goodStudentId; 
                that.setState({ loading: true });  
                this.props.GoodStudentsApplicationAuditSure(values).payload.promise.then((response) => {
                    let data = response.payload.data;  
                        if(data.state == 'success'){ 
                            message.success('修改成功！');
                            this.props.viewCallback(true);
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
        let op = '';
        if(this.props.editMode == 'View'){
            op = '查看'
        }else{
            op = '审核'
        }
        return op;
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
                case "examine": 
                    block_content = (
                        <Form>
                            <Row gutter={24}> 
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="项目">
                                        {this.state.dataModel.itemName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="教学点">
                                        {this.state.dataModel.teachCenterName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生姓名">
                                        {this.state.dataModel.studentName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="手机号">
                                        {this.state.dataModel.mobile}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="所在高校">
                                        {this.state.dataModel.universityName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="入学年份">
                                        {this.state.dataModel.studyUniversityEnterYear}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="考季">
                                        {this.state.dataModel.examBatchName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="首次考试通过科目">
                                        {this.state.dataModel.firstPassExamCourseCategoryName}
                                    </FormItem>
                                </Col>   
                                {(this.state.dataModel.fileUrl != '' && this.state.dataModel.fileUrl != null) && <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label='附件'>
                                        <div style={{ marginBottom: 20 }}>
                                            <FileDownloader
                                                apiUrl={'/edu/file/getFile'}//api下载地址
                                                method={'post'}//提交方式
                                                options={{ filePath: this.state.dataModel.fileUrl }}
                                                title={'下载附件'}
                                            >
                                            </FileDownloader>
                                        </div>
                                    </FormItem>
                                </Col>
                                }
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="申请人">
                                        {this.state.dataModel.applyUserName}
                                    </FormItem>
                                </Col>   
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="申请日期">
                                        {timestampToTime(this.state.dataModel.applyDate)}
                                    </FormItem>
                                </Col> 
                                <Col span={24}> 
                                    <FormItem {...searchFormItemLayout24} label="备注">
                                        {this.state.dataModel.remark}
                                    </FormItem>
                                </Col> 
                                {/* <Col span={24}>
                                    <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>历史审核情况:</p>
                                </Col> */}
                                <Col span={24}>  
                                    <FormItem
                                    {...searchFormItemLayout24}
                                    style={{ paddingRight: 18 }}
                                    label="历史审核情况"
                                    >
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>
                                    </FormItem>
                                </Col> 
                                <Col span={24}>
                                    <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>请进行好学生申请审核:</p>
                                </Col> 
                                <Col span={24}>
                                    <FormItem
                                        {...searchFormItemLayout24}
                                        label="审核结果"
                                    >
                                        {getFieldDecorator('auditStatus', {
                                            initialValue: '',
                                            rules: [{
                                                required: true, message: '请选择审核结果!',
                                            }],
                                        })(
                                            <RadioGroup>
                                                <Radio value={2} key={2}>审核通过</Radio>
                                                <Radio value={3} key={3}>审核不通过</Radio>
                                            </RadioGroup>
                                            )}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem
                                        {...searchFormItemLayout24}
                                        label="审核意见"
                                    >
                                        {getFieldDecorator('auditLog', {
                                            initialValue: '',
                                            rules: [{
                                                required: true, message: '请输入审核意见!',
                                            }],
                                        })(
                                            <TextArea placeholder='请输入审核意见' rows={4} />
                                            )}
                                    </FormItem>
                                </Col>  
                            </Row>
                        </Form>
                    );
                    break;
                    case "View": 
                    block_content = (
                        <Form>
                            <Row gutter={24}> 
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="项目">
                                        {this.state.dataModel.itemName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="教学点">
                                        {this.state.dataModel.teachCenterName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生姓名">
                                        {this.state.dataModel.studentName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="手机号">
                                        {this.state.dataModel.mobile}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="所在高校">
                                        {this.state.dataModel.universityName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="入学年份">
                                        {this.state.dataModel.studyUniversityEnterYear}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="考季">
                                        {this.state.dataModel.examBatchName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="首次考试通过科目">
                                        {this.state.dataModel.firstPassExamCourseCategoryName}
                                    </FormItem>
                                </Col>    
                                {(this.state.dataModel.fileUrl != '' && this.state.dataModel.fileUrl != null) && <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label='附件'>
                                        <div style={{ marginBottom: 20 }}>
                                            <FileDownloader
                                                apiUrl={'/edu/file/getFile'}//api下载地址
                                                method={'post'}//提交方式
                                                options={{ filePath: this.state.dataModel.fileUrl }}
                                                title={'下载附件'}
                                            >
                                            </FileDownloader>
                                        </div>
                                    </FormItem>
                                </Col>
                                }
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="申请人">
                                        {this.state.dataModel.applyUserName}
                                    </FormItem>
                                </Col>   
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="申请日期">
                                        {timestampToTime(this.state.dataModel.applyDate)}
                                    </FormItem>
                                </Col> 
                                <Col span={24}> 
                                    <FormItem {...searchFormItemLayout24} label="备注">
                                        {this.state.dataModel.remark}
                                    </FormItem>
                                </Col> 
                                {/* <Col span={24}>
                                    <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>历史审核情况:</p>
                                </Col> */}
                                <Col span={24}>  
                                    <FormItem
                                    {...searchFormItemLayout24}
                                    style={{ paddingRight: 18 }}
                                    label="以下为审核情况"
                                    >
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>
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
        GoodStudentsApplicationAuditSure: bindActionCreators(GoodStudentsApplicationAuditSure, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
