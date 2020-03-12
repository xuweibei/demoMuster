
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Form, Row, Col, Input, Select, Button, message,DatePicker 
} from 'antd'; 
const FormItem = Form.Item; 

import { searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getViewEditModeTitle, dataBind, formatMoment } from '@/utils';
  
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
                courseCategoryId:'',
                examBatchId:'',
                state:''
            },
            itemArr:[],
            Subjects:[],
            Examination:[]
        };
    }
    componentWillMount() { 
        this.fetch()

    }
    fetch = () => {
        let condition = {};
        condition.studentId = this.props.currentDataModel.studentId; 
        condition.studentScoreId = this.props.currentDataModel.studentScoreId;
        condition.orderId = this.props.currentDataModel.orderId;
        this.props.ResultInputListOne(condition).payload.promise.then((response) => {
                 let data = response.payload.data; 
                 let itemArr = [];
                 let Subjects = [];
                 let Examination  = [];
                 if(data.data.length){
                     data.data.forEach(item=>{
                        itemArr.push({id:item.itemId,name:item.itemName})
                     })
                     this.state.pagingSearch.itemId = itemArr[0].id;
                     Subjects = data.data[0].categorys;
                     Examination = data.data[0].examBatchs;
                 } 
                 if(data.state == 'success'){
                     this.setState({
                         lowInfo:data.data,
                         itemArr:itemArr,
                         pagingSearch:this.state.pagingSearch,
                         Examination,
                         Subjects
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
                that.setState({ loading: true });  
                values.studentScoreId = this.props.currentDataModel.studentScoreId;
                values.studentId = this.props.currentDataModel.studentId; 
                values.orderId = this.props.currentDataModel.orderId; 
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
    itemIdChange = (value) => { 
        let info = this.state.lowInfo.find(item=>item.itemId == value); 
        this.setState({
            Subjects:info.categorys,
            Examination:info.examBatchs
        })
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
                                <Col span={24}>
                                    <FormItem {...searchFormItemLayout24} label="专业">
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
                                    <FormItem {...searchFormItemLayout} label={'项目'}>
                                        {getFieldDecorator('itemId', {
                                        initialValue: this.state.pagingSearch.itemId,
                                        rules: [{
                                          required: true, message: '请输入选择项目!',
                                        }],
                                        })( 
                                            <Select
                                                onChange={(value)=>this.itemIdChange(value)}
                                            >
                                                {this.state.itemArr.map(item=>{
                                                    return <Option value={item.id}>{item.name}</Option>
                                                })}
                                            </Select>
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
                                            initialValue:this.state.pagingSearch.courseCategoryId,
                                            rules: [{
                                              required: true, message: '请选择科目!',
                                            }],
                                        })( 
                                            <Select>
                                                <Option value=''>--请选择--</Option>
                                                {this.state.Subjects.map(item=>{
                                                    return <Option value={item.courseCategoryId}>{item.name}</Option>
                                                })}
                                            </Select>
                                        // <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                                        )
                                    }
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                    {...searchFormItemLayout}
                                    label = '考季'
                                    >
                                        {getFieldDecorator('examBatchId',{
                                            initialValue:'',
                                            rules: [{
                                              required: true, message: '请选择考季!',
                                            }],
                                        })(
                                            <Select>
                                                <Option value=''>--请选择--</Option>
                                                {this.state.Examination.map(item=>{
                                                    return <Option value={item.examBatchId}>{item.examBatchName}</Option>
                                                })}
                                            </Select> 
                                        )}
                                    </FormItem> 
                                </Col> 
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="考试日期"
                                    >
                                        {getFieldDecorator('examDate', { initialValue: this.state.pagingSearch.examDate })(
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
                                            <Input placeholder='请输入考试成绩!' />
                                        )}
                                    </FormItem>
                                </Col> 
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label = '通过情况' 
                                    >
                                        {getFieldDecorator('state',{initialValue:this.state.pagingSearch.state})(
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
                                            initialValue: dataBind(this.state.dataModel.scoreFile),
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
