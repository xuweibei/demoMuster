import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Radio, Button, Icon, Table, Pagination, Tree, Card, DatePicker } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';
import { searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const dateFormat = 'YYYY-MM-DD';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class ReturnVisitTaskView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            startValue: null,
            endValue: null,
            endOpen: false,
        };
    }
    componentWillMount() {
        
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

                values.startTime = formatMoment(values.startTime);//开始时间
                values.endTime = formatMoment(values.endTime);//截至时间

                if (this.props.editMode == 'Edit') {
                    this.props.viewCallback({returnVisitTaskId: this.state.dataModel.returnVisitTaskId, ...values });//合并保存数据
                } else {
                    this.props.viewCallback({ ...values });//合并保存数据
                }
                
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}回访任务`;
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
        return endValue.valueOf() < startValue.valueOf();
    }
    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }
  
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
  
    onStartChange = (value) => {
        this.onChange('startValue', value);
    }
  
    onEndChange = (value) => {
        this.onChange('endValue', value);
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="项目" >
                                    {getFieldDecorator('itemId', { 
                                        initialValue: this.state.dataModel.itemId?this.state.dataModel.itemId:'',
                                        rules: [{
                                            required: true, message: '请选择项目名称!',
                                        }]
                                    })(
                                        <SelectItem scope='my' hideAll={true} isFirstSelected={true}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="任务名称"
                                >
                                    {getFieldDecorator('returnVisitTaskName', { 
                                        initialValue: this.state.dataModel.returnVisitTaskName,
                                        rules: [{
                                            required: true, message: '请输入任务名称!',
                                        }],
                                    })(
                                        <Input  placeholder="请输入任务名称"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="状态">
                                {getFieldDecorator('state', {
                                    initialValue: dataBind(this.state.dataModel.state),
                                    rules: [{
                                        required: true, message: '请选择状态!',
                                    }]
                                })(
                                    <RadioGroup value={dataBind(this.state.dataModel.state)} hasFeedback>
                                    {this.props.dic_Status.map((item, index) => {
                                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                                    })}
                                    </RadioGroup>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="开始日期">
                                {getFieldDecorator('startTime', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.startTime), true),
                                        rules: [{
                                            required: true, message: '请选择开始日期!',
                                        }]
                                    })(
                                        <DatePicker
                                            format={dateFormat}
                                            placeholder='开始日期'
                                            disabledDate={this.disabledStartDate}
                                            onChange={this.onStartChange}
                                            onOpenChange={this.handleStartOpenChange}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="截止日期">
                                {getFieldDecorator('endTime', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.endTime), true),
                                        rules: [{
                                            required: true, message: '请选择截止日期!',
                                        }]
                                    })(
                                        <DatePicker
                                            format={dateFormat}
                                            placeholder='截止日期'
                                            disabledDate={this.disabledEndDate}
                                            onChange={this.onEndChange}
                                            open={this.state.endOpen}
                                            onOpenChange={this.handleEndOpenChange}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                {...searchFormItemLayout24}
                                style={{ paddingRight: 18 }}
                                label="回访要点"
                                >
                                    {getFieldDecorator('remark', {
                                        initialValue: this.state.dataModel.remark,
                                    })(
                                        <TextArea　placeholder='请填写回访要点' rows={3} />
                                    )}
                                </FormItem>
                            </Col>
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

const WrappedReturnVisitTaskView = Form.create()(ReturnVisitTaskView);
export default WrappedReturnVisitTaskView;
