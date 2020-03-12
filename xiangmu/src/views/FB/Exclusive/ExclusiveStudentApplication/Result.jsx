
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Form, Row, Col, Input, Select, Button,Radio, message,DatePicker,Modal 
} from 'antd'; 
const { TextArea } = Input;
const FormItem = Form.Item; 
const RadioGroup = Radio.Group;

import { searchFormItemLayout,searchFormItemLayout24  } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getViewEditModeTitle, dataBind,formatMoment, timestampToTime,convertTextToHtml } from '@/utils';
 
import { ResultInputListOne,TemporaryStorageApply } from '@/actions/stuService'; 
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
        console.log(this.props)

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

    onSubmit = (data) => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {  
            if (!err) {     
                values.auditPosition = 1; 
                values.operationPosition = 1; 
                values.studentId = this.state.dataModel.studentId; 
                values.firstPassExamCourseCategoryId = this.state.dataModel.courseCategoryId; 
                values.examBatchId = this.state.dataModel.examBatchId; 
                values.itemId = this.state.dataModel.itemId; 
                values.teachCenterId = this.state.dataModel.teachCenterId; 
                if(data == 'tem'){
                    values.auditStatus = 0;
                    values.operationType = 0;
                    that.setState({ loading: true });  
                    this.props.TemporaryStorageApply(values).payload.promise.then((response) => {
                        let data = response.payload.data;  
                            if(data.state == 'success'){ 
                                message.success('操作成功！');
                                this.props.viewCallback(true);
                            }else{
                                message.error(data.msg);
                            }
                            that.setState({
                                loading:false
                            })
                        }
                    )
                }else if(data == 'apply'){ 
                    values.auditStatus = 1;
                    values.operationType = 1;
                    Modal.confirm({
                        title: '是否提交审核?',
                        content: '',
                        onOk() { 
                          that.setState({ loading: true });  
                          that.props.TemporaryStorageApply(values).payload.promise.then((response) => {
                              let data = response.payload.data;  
                                  if(data.state == 'success'){ 
                                      message.success('修改成功！');
                                      that.props.viewCallback(true);
                                  }else{
                                      message.error(data.msg);
                                  }
                                  that.setState({
                                      loading:false
                                  })
                              }
                          )
                        },
                        onCancel() {
                          console.log('Cancel');
                          return 
                        },
                      });
                } 
            }
        });
    }
    //标题
    getTitle() {
        let op = '';
        if(this.props.editMode == 'View'){
            op = '查看'
        }else{
            op = '申请'
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
                <Button loading={this.state.loading} icon="save" onClick={()=>this.onSubmit('tem')}>暂存</Button><span className="split_button"></span><Button loading={this.state.loading} icon="save" onClick={()=>this.onSubmit('apply')}>提交审核</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >返回</Button>
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
                                    <FormItem {...searchFormItemLayout} label="教学点">
                                        {this.state.dataModel.teachCenterName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="项目">
                                        {this.state.dataModel.itemName}
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
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout}
                                    label='附件'
                                    extra={!this.state.dataModel.fileUrl?<p style={{color:'red'}}>文件类型为rar、zip</p> : <div><FileDownloader
                                        apiUrl={'/edu/file/getFile'}//api下载地址
                                        method={'post'}//提交方式
                                        options={{ filePath: this.state.dataModel.fileUrl }}
                                        title={'下载附件'}
                                    >
                                    </FileDownloader><p style={{color:'red'}}>文件类型为rar、zip</p></div>}>
                                        {getFieldDecorator('fileUrl', {
                                            initialValue: dataBind(this.state.dataModel.fileUrl),
                                            rules: [{
                                                required: true, message: '请选择上传文件!',
                                              }],
                                            
                                        })(
                                            <FileUploader />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem {...searchFormItemLayout24} label="备注">
                                        {getFieldDecorator('remark', {
                                            initialValue: dataBind(this.state.dataModel.remark),
                                        })(
                                            <TextArea />
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
        TemporaryStorageApply: bindActionCreators(TemporaryStorageApply, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
