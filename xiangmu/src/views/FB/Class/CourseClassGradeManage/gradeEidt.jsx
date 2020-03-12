
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Table, Input, Button, Select, Icon, DatePicker, InputNumber, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
import { env } from '@/api/env';

import FileUploader from '@/components/FileUploader';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD hh:mm';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';


class FaceTeachLiveView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel || {courseCategoryId:'',isPublic:0},//数据模型
            data: [],
            teacherInfo: []
        };
    }

    componentWillMount() {
        
    }

    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据

                if(this.state.dataModel.studentScoreId) values.studentScoreId = this.state.dataModel.studentScoreId;
                if(this.state.dataModel.studentId) values.studentId = this.state.dataModel.studentId;
                if(this.state.dataModel.itemId) values.itemId = this.state.dataModel.itemId;
                if(this.state.dataModel.courseCategoryId) values.courseCategoryId = this.state.dataModel.courseCategoryId;
                if(this.state.dataModel.examBatchId) values.examBatchId = this.state.dataModel.examBatchId;
                values.examDate = formatMoment(values.examDate,dateFormat);

                that.props.viewCallback(values);

            }
        });
    }

    //标题
    getTitle() {
        //加载最新的数据
        return `课程班学生成绩编辑`;
        
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
            span={24}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
            <span className="split_button"></span>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

    //多种模式视图处理
    renderEditModeOfView_CourseProduct() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'教学点'}>
                                    {this.state.dataModel.teachCenterName}
                                </FormItem>
                            </Col>
                            <Col span={12} >
                                <FormItem {...searchFormItemLayout} label="科目">
                                    {this.state.dataModel.courseCategoryName}
                                </FormItem>
                            </Col>
                                
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                {this.state.dataModel.realName}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'就读高校'} >
                                {this.state.dataModel.universityName}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'入学年份'} >
                                {this.state.dataModel.studyUniversityEnterYear}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'专业'} >
                                {this.state.dataModel.studySpecialty}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'手机号'} >
                                {this.state.dataModel.mobile}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'证件号'} >
                                {this.state.dataModel.certificateNo}
                              </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="考季">
                                    {getFieldDecorator('examBatchId', {
                                        initialValue: dataBind(this.state.dataModel.examBatchId),
                                        rules: [{
                                            required: true, message: '请选择考季!',
                                        }]
                                    })(
                                    <Select>
                                        {this.props.dic_exam_batch.map((item, index) => {
                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'考试日期'} >
                                    {getFieldDecorator('examDate', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.examDate, true), true),
                                    })(
                                        <DatePicker className="ant-calendar-picker_time" placeholder='考试日期' format="YYYY-MM-DD"/>
                                    )}
                                </FormItem>
                            </Col>
                              
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'成绩'} >
                                {getFieldDecorator('score', { 
                                    initialValue: this.state.dataModel.score,
                                 })(
                                  <Input placeholder="成绩" />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="通过情况">
                                    {getFieldDecorator('state', {
                                    initialValue: dataBind(this.state.dataModel.state),
                                    })(
                                    <Select>
                                        <Option value="">--请选择--</Option>
                                        {this.props.pass_status.map((item, index) => {
                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24}
                                    label='附件'
                                    extra={this.state.dataModel.scoreFile && <a href={env.serverURL + this.state.dataModel.scoreFile} target='_Blank'>点我查看已上传的附件</a>}>
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
            case "View":
                block_content = (
                    <Form>
                        
                    </Form>
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView_CourseProduct();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedView = Form.create()(FaceTeachLiveView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
