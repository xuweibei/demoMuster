import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, DatePicker, Table, Pagination, Tree, Card } from 'antd';
import moment from 'moment';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD hh:mm:ss';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';

import ContentBox from '@/components/ContentBox';
//业务接口方法引入
import { getStudentById, qryById } from '@/actions/recruit';

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
class AskFView extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            data_ask: '',//数据模型
            startValue: null,
            endValue: null,
            endOpen: false,
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['sex','grade']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    //检索数据
    fetch = (params = {}) => {
        console.log('123456')
        this.setState({ loading: true });
        var condition = {
            studentId: this.state.dataModel.studentId,
            studentAskId: this.state.dataModel.studentAskId,
        }
        this.props.getStudentById(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            console.log(data)
            if (data.state === 'success') {
                this.setState({ pagingSearch: condition, dataModel: data.data, loading: false })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
                this.onCancel()
            }
        })
        //查询咨询信息
        if (condition.studentAskId) {
            this.props.qryById(condition).payload.promise.then((response) => {
                let ask = response.payload.data;
                console.log(ask)
                if (ask.state === 'success') {
                    this.setState({ pagingSearch: condition, data_ask: ask.data, loading: false })

                }
                else {
                    this.setState({ loading: false })
                    message.error(ask.message);
                    this.onCancel()
                }
            })
        }
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
                    studentId: this.state.dataModel.studentId,
                    studentAskId: this.state.data_ask.studentAskId,
                    createUid: this.state.dataModel.benefitFconsultUserId,
                    askSource: 1,
                    askType: 2,//面咨类型
                    branchId: this.state.dataModel.branchId,
                    grade:this.state.dataModel.grade,
                    ...values
                });//合并保存数据 
            }
        });
    }
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }
  
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }
    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }
  
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
  
    onStartChange = (value) => {
        this.onChange('startValue', value);
    }
  
    onEndChange = (value) => {
        this.onChange('endValue', value);
    }
  
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}电咨`;
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
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'姓名'} >
                                    {this.state.dataModel.realName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'性别'} >
                                    {getDictionaryTitle(this.state.sex, this.state.dataModel.gender)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'证件号码'} >
                                    {this.state.dataModel.certificateNo}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'手机'} >
                                    {this.state.dataModel.mobile}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'微信'} >
                                    {this.state.dataModel.weixin}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'QQ'} >
                                    {this.state.dataModel.qq}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'电子邮箱'} >
                                    {this.state.dataModel.email}
                                    {this.state.dataModel.askDate}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'面咨人员'} >
                                    {this.state.dataModel.benefitFconsultUserName}
                                </FormItem>
                            </Col>
                        </Row>

                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'面咨日期'} >
                                    {getFieldDecorator('askDate', {
                                        initialValue: dataBind(timestampToTime(this.state.data_ask.askDate), true),//
                                        rules: [{
                                            required: true, message: '请选择面咨日期!',
                                        }],
                                    })(
                                        <DatePicker format={dateFormat} placeholder='面咨日期'
                                            disabledDate={this.disabledStartDate}
                                            format={dateFormat}
                                            onChange={this.onStartChange}
                                            onOpenChange={this.handleStartOpenChange}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'邀约面咨日期'} >
                                    {getFieldDecorator('inviteDate', {
                                        initialValue: dataBind(timestampToTime(this.state.data_ask.inviteDate), true)
                                    })(
                                        <DatePicker placeholder='邀约面咨日期'
                                            disabledDate={this.disabledEndDate}
                                            format={dateFormat}
                                            onChange={this.onEndChange}
                                            onOpenChange={this.handleEndOpenChange}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'面咨内容'} >
                                    {getFieldDecorator('askContent', {
                                        initialValue: this.state.data_ask.askContent,
                                        rules: [{
                                            required: true, message: '请填写面咨内容!',
                                        }],
                                    })(
                                        <TextArea rows={2} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'邀约面咨备注'} >
                                    {getFieldDecorator('remark', {
                                        initialValue: this.state.data_ask.remark
                                    })(
                                        <TextArea rows={2} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'下次电咨日期'} >
                                    {getFieldDecorator('nextAskDate', {
                                        initialValue: dataBind(timestampToTime(this.state.data_ask.nextAskDate), true)
                                    })(
                                        <DatePicker placeholder='电咨日期'
                                            disabledDate={this.disabledEndDate}
                                            format={dateFormat}
                                            onChange={this.onEndChange}
                                            onOpenChange={this.handleEndOpenChange}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'学生意向等级'} >
                                    {getFieldDecorator('grade', { initialValue: dataBind(this.state.dataModel.grade) })(
                                        <Select>
                                            <Option value="">请选择</Option>
                                            {this.state.grade.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'下次电咨内容'} >
                                    {getFieldDecorator('nextAskContent', { initialValue: this.state.data_ask.nextAskContent })(
                                        <TextArea rows={2} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>
                        </Row>
                    </Form>
                );
                break;
            case "View":
                block_content = (
                    <Form>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'姓名'} >
                                    {this.state.dataModel.realName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'性别'} >
                                    {getDictionaryTitle(this.state.sex, this.state.dataModel.gender)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'证件号码'} >
                                    {this.state.dataModel.certificateNo}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'手机'} >
                                    {this.state.dataModel.mobile}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'微信'} >
                                    {this.state.dataModel.weixin}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'QQ'} >
                                    {this.state.dataModel.qq}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'电子邮箱'} >
                                    {this.state.dataModel.email}
                                    {this.state.dataModel.askDate}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'面咨人员'} >
                                    {this.state.dataModel.benefitFconsultUserName}
                                </FormItem>
                            </Col>
                        </Row>

                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'面咨日期'} >
                                    {timestampToTime(this.state.data_ask.askDate)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'邀约面咨日期'} >
                                    {timestampToTime(this.state.data_ask.inviteDate)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'面咨内容'} >
                                    {this.state.data_ask.askContent}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'邀约面咨备注'} >
                                    {this.state.data_ask.remark}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'下次电咨日期'} >
                                    {timestampToTime(this.state.data_ask.nextAskDate)}
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'下次电咨内容'} >
                                    {this.state.data_ask.nextAskContent }
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>
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
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedAskFView = Form.create()(AskFView);
const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};
function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        //loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getStudentById: bindActionCreators(getStudentById, dispatch),
        qryById: bindActionCreators(qryById, dispatch),

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WrappedAskFView);
