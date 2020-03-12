import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, DatePicker, Table, Pagination, Tree, Card } from 'antd';
import moment from 'moment';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24,loadBizDictionary, onSearch } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';

import ContentBox from '@/components/ContentBox';
//业务接口方法引入
import { getStudentById, qryById } from '@/actions/recruit';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';

const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class editView extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            data_ask: '',//数据模型
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['sex', 'attend_status']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({
                    courseArrangeStudentAttendId:this.props.currentDataModel.courseArrangeStudentAttendId,
                    courseArrangeDetailId:this.props.currentDataModel.courseArrangeDetailId,
                    studentId:this.props.currentDataModel.studentId,
                    ...values
                });//合并保存数据 
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}考勤`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'课程班名称'} >
                                {this.props.currentDataModel.courseplanName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'教学点'} >
                                {this.props.currentDataModel.teacheCenterName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'科目'} >
                                {this.props.currentDataModel.courseCategoryName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'上课日期'} >

                                {timestampToTime(this.props.currentDataModel.courseDate)}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'讲师'} >
                                {this.props.currentDataModel.teacherName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'上课时段'} >
                                {this.props.currentDataModel.classTime}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'课时'} >
                                {this.props.currentDataModel.classHour}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                {this.props.currentDataModel.realName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'证件号'} >
                                {this.props.currentDataModel.certificateNo}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'考勤情况'} >
                               
                                            {getFieldDecorator('attendStatus', { initialValue:dataBind(this.props.currentDataModel.attendStatus) })(
                                                <Select>
                                                    
                                                    {this.state.attend_status.filter(e=>e.value!=5).map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'考勤备注'} >
                                {getFieldDecorator('leaveReason', {
                                    initialValue: this.props.currentDataModel.leaveReason
                                })(
                                    <TextArea rows={2} />
                                )}
                            </FormItem>
                        </Col>


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

const WrappedAskPView = Form.create()(editView);
const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};
function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getStudentById: bindActionCreators(getStudentById, dispatch),
        qryById: bindActionCreators(qryById, dispatch),

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WrappedAskPView);
