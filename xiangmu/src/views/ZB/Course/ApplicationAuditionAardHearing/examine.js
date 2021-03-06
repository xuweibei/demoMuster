/**
 * 总部-学服学务-网络课程管理-激活管理-修改记录 
 * suicaijiao
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
    Pagination, Divider, Modal, InputNumber  , 
    Checkbox,
} from 'antd';
const { TextArea } = Input;
import { env } from '@/api/env';
import SelectArea from '@/components/BizSelect/SelectArea'
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { ApplicationDetails,ApplicationExamine } from '@/actions/course';
import SelectItem from '@/components/BizSelect/SelectItem';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents'; 

class CourseActiveManageView extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);

        this.state = {
            visible:false,
            CheckboxonOff:true,
            msgContext:'',
            onOff:false,
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: {
                currentPage: 1,
                pageSize: env.defaultPageSize, 
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };
        this.index_last = 0;
    }
    componentWillMount() {
        //载入需要的字典项: 审核状态
        this.loadBizDictionary(['dic_YesNo', 'payee_type']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
 
    //获取条件列表
    fetch(params) { 
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.ApplicationDetails({studentCourseApplyId:this.props.currentDataModel.studentCourseApplyId}).payload.promise.then((response) => {
            let data = response.payload.data;

            if (data.state === 'success') { 
                this.setState({
                    pagingSearch: condition,
                    dataModel: data.data,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    };
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    onCancel = () => {
      this.props.viewCallback();
    }
    onSubmit = () => {
      //表单验证后，合并数据提交
      this.props.form.validateFields((err, values) => {
       if (!err) {
         this.setState({ loading: true }); 
         values.studentCourseApplyId = this.props.currentDataModel.studentCourseApplyId;
         if(values.isSend){
            values.isSend = 1;
         }else{
            values.isSend = 0;
         } 
         this.props.ApplicationExamine(values).payload.promise.then((response) => {
            let data = response.payload.data;

            if (data.state === 'success') { 
                this.props.viewCallback(true)
            }
            else {
                message.error(data.message);
            }
            this.setState({ loading: false })
        })
       }
     });
   }
    //视图回调
    onViewCallback = (dataModel) => { 
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit": //提交
            }
        }
        this.setState({
            visible:false
        })
    } 
    CheckboxChange = (data) => {
        this.setState({
            CheckboxonOff:data.target.value
        })
    }
    auditChange = (value) => {   
        this.setState({
            onOff: value == 2?true : false
        })
        var block = ''; 
        switch(value){
            case '2':
                block = `亲爱的童鞋！您申请的 ${this.state.dataModel.courseName}科目重听审核通过，请至"在学课程"进行学习，祝考试顺利通过哦。`;
            break;
            case '3':
                block = `亲爱的童鞋！因您所提交的成绩单信息不完整，您申请的 ${this.state.dataModel.courseName} 科目重听审核未通过，如需重听，请重新提交哦。`;
            break;
            case '1':
            default:
                block = ''
            break;
        }
        this.setState({
            msgContext:block
        }) 
    }
    oldViewStudentDetail = () =>{
        this.setState({
            visible:true
        })
    }
    handleCancel = () => { 
        this.setState({
            visible:false
        })
    }
    render() { 
        let block_content = <div></div> 
        const { getFieldDecorator } = this.props.form;
        switch(this.props.editMode){ 
            case 'Examine': 
            block_content = (
                <div> 
                    <Form className="search-form">
                        <Row gutter={24}>
                            <Col span={24}><strong style={{ marginLeft:'30px',color:'rgba(0, 0, 0, 0.85)'}}>申请信息:</strong></Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学生姓名">
                                <span>
                                    <a href="javascript:;" onClick={() => this.oldViewStudentDetail() }>{this.state.dataModel.studentName}</a>
                                </span> 
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="手机号">
                                    <span>{this.state.dataModel.mobile}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="用户名">
                                <span>
                                    <a href="javascript:;" onClick={() => this.oldViewStudentDetail() }>{this.state.dataModel.loginName}</a>
                                </span> 
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="科目">
                                    <span>{this.state.dataModel.courseCategoryName}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="考试时间">
                                    <span>{timestampToTime(this.state.dataModel.examDate)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="考试状态">
                                    <span>{this.state.dataModel.examState}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="分数"> 
                                    <span>{this.state.dataModel.score}</span>
                                    <span style={{display:'inline-block',width:'20px'}}></span>
                                    { 
                                        this.state.dataModel.scoreFile && <FileDownloader
                                        apiUrl={'/edu/file/getFile'}//api下载地址
                                        method={'post'}//提交方式
                                        options={{ filePath: this.state.dataModel.scoreFile }}//提交参数
                                        title={'附件'}
                                    >
                                    </FileDownloader> 
                                    }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="下次考试时间">
                                    <span>{timestampToTime(this.state.dataModel.examNextDate)}</span>
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="重听课程名称">
                                    <span>{this.state.dataModel.courseName}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学生属性">
                                    <span>{this.state.dataModel.studentSourse?this.state.dataModel.studentSourse==1?'新生':'老生':''}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="课程激活日期">
                                    <span>{timestampToTime(this.state.dataModel.activeTime)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="有效期">
                                    <span>{this.state.dataModel.totalDays }天</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请重听日期">
                                    <span>{timestampToTime(this.state.dataModel.createDate)}</span>
                                </FormItem>
                            </Col>
                            <Col span={24}><strong style={{ marginLeft:'30px',color:'rgba(0, 0, 0, 0.85)'}}>审核信息填写:</strong></Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="审核状态">
                                    {getFieldDecorator('auditState', {
                                            initialValue: '',
                                            rules: [{
                                              required: true, message: '请选择审核状态!',
                                            }],
                                        })(
                                            <Select
                                                onChange={(data)=>this.auditChange(data)}
                                            >
                                                <Option value=''>--请选择--</Option>
                                                <Option value='2'>通过</Option>
                                                <Option value='3'>未通过</Option>
                                            </Select>
                                        )}
                                </FormItem>
                            </Col>
                            {
                                this.state.onOff?<Col span={12}>
                                <FormItem {...searchFormItemLayout} label="延长天数">
                                        {getFieldDecorator('applyDays', {
                                            initialValue: this.state.dataModel.applyDays,
                                            rules: [{
                                              required: true, message: '请输入延长天数!',
                                            }],
                                        })(
                                            <InputNumber min={1} />
                                        )}
                                </FormItem>
                            </Col>:<Col span={12}>
                                <FormItem {...searchFormItemLayout} label="延长天数">
                                        {getFieldDecorator('applyDays', {
                                            initialValue: this.state.dataModel.applyDays,
                                        })(
                                            <InputNumber min={1} />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="预计课程到期日期">
                                    <span>{timestampToTime(this.state.dataModel.endTime )}</span>
                                </FormItem>
                            </Col>
                            {
                                this.state.onOff?<Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="审核备注">
                                    {getFieldDecorator('auditReason', {
                                        initialValue: this.state.dataModel.auditLog,
                                    })(
                                        <TextArea  />
                                    )}
                                </FormItem>
                            </Col> :<Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="审核备注">
                                    {getFieldDecorator('auditReason', {
                                        initialValue: this.state.dataModel.auditLog,
                                        rules: [{
                                          required: true, message: '请输入审核备注!',
                                        }],
                                    })(
                                        <TextArea  />
                                    )}
                                </FormItem>
                            </Col>  
                            }
                            
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="审核同时发送消息">
                                    {getFieldDecorator('isSend', {
                                        initialValue:'',
                                    })(
                                        <Checkbox onChange = {(data)=>this.CheckboxChange(data)} style={{marginTop:'8px'}} value={1}></Checkbox >
                                    )}
                                </FormItem>
                            </Col> 
                            {
                                this.state.CheckboxonOff?
                                <Col span={24}>
                                    <FormItem {...searchFormItemLayout24} label="消息内容">
                                        {getFieldDecorator('msgContext', {
                                            initialValue: this.state.msgContext,
                                        })(
                                            <TextArea  />
                                        )}
                                    </FormItem>
                                </Col>:
                                <Col span={24}>
                                    <FormItem {...searchFormItemLayout24} label="消息内容">
                                        {getFieldDecorator('msgContext', {
                                            initialValue: this.state.msgContext,
                                            rules: [{
                                              required: true, message: '请输入消息内容!',
                                            }],
                                        })(
                                            <TextArea  />
                                        )}
                                    </FormItem>
                                </Col>
                            }
                        </Row>
                    </Form>  
                </div>
            );
            break;
        } 
        return(
            <ContentBox titleName={"审核"} bottomButton={
              <FormItem
                className='btnControl' 
              > 
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>确定审核</Button>
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >返回</Button>
              </FormItem>
            }>
              <div className="dv_split"></div>
              {block_content}
              <div className="dv_split"></div>
              <Modal
                visible={this.state.visible}
                title="学生基本情况"  
                onCancel={this.handleCancel} 
                width = {'1000px'}
                footer = {null}
                >
                   <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.dataModel.studentId} />
                </Modal>
            </ContentBox>
          )
    }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseActiveManageView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        ApplicationDetails: bindActionCreators(ApplicationDetails, dispatch),
        //审核
        ApplicationExamine: bindActionCreators(ApplicationExamine, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
