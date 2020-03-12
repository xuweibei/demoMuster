import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, DatePicker } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';
import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
import moment from 'moment';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class ProjectExamView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            startValue: null,
            endValue: null,
            endOpen: false,
        };
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
                values.startDate = formatMoment(values.startDate);//开始时间
                values.endDate = formatMoment(values.endDate);//截至时间
                if (this.props.editMode == 'Edit') {
                    this.props.viewCallback({itemId: this.state.dataModel.itemId, examBatchId: this.state.dataModel.examBatchId, ...values });//合并保存数据
                } else {
                    this.props.viewCallback({ ...values });//合并保存数据
                }
                
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}项目考季`;
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
                                         required: true, message: '请选择具体项目名称!',
                                    }]
                                   })(
                                    <SelectItem scope='my' hideAll={false}/>
                                )}
                            </FormItem>
                            </Col>
                            <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="考季名称"
                            >
                                {getFieldDecorator('examBatchName', { 
                                    initialValue: this.state.dataModel.examBatchName,
                                    rules: [{
                                        required: true, message: '请输入考季名称!',
                                    }],
                                })(
                                    <Input  placeholder="请输入考季名称"/>
                                )}
                            </FormItem>
                            </Col>
                            <Col span={15}>
                            <FormItem
                                {...searchFormItemLayout}
                                label=""
                            >
                                <p style={{paddingLeft: '22%',color: '#f00'}}>好学生申请时间段设置：</p>
                            </FormItem>
                            </Col>
                            <Col span={24}>
                            
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="开始日期">
                                {getFieldDecorator('startDate', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.startDate), true),
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
                                <FormItem {...searchFormItemLayout} label="结束日期">
                                {getFieldDecorator('endDate', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.endDate), true),
                                        rules: [{
                                            required: true, message: '请选择结束日期!',
                                        }]
                                    })(
                                        <DatePicker
                                            format={dateFormat}
                                            placeholder='结束日期'
                                            disabledDate={this.disabledEndDate}
                                            onChange={this.onEndChange}
                                            open={this.state.endOpen}
                                            onOpenChange={this.handleEndOpenChange}
                                        />
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

const WrappedProjectExamView = Form.create()(ProjectExamView);
export default WrappedProjectExamView;
