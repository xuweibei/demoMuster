import React from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card,DatePicker } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';
import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
const FormItem = Form.Item;
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
class ClassBatchView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            endOpen: false,
        };
        (this: any).onBeginChange = this.onBeginChange.bind(this);
        (this: any).onEndChange = this.onEndChange.bind(this);
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
                values.startDate = formatMoment(values.startDate);
                values.endDate = formatMoment(values.endDate);
                if (this.props.editMode == 'Edit') {
                    this.props.viewCallback({itemId: this.state.dataModel.itemId, classBatchId: this.state.dataModel.classBatchId, ...values });//合并保存数据
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
    onBeginChange(date, dateString) {
        this.state.beginDate = dateString;
      }
      onEndChange(date, dateString) {
        this.state.endDate = dateString;
      }
      disabledBeginDate = (startValue) => {
        const endValue = this.state.endDate;
        if (!startValue || !endValue) {
            return false;
        }
        startValue = formatMoment(startValue);
        return startValue.valueOf() > endValue.valueOf();
      }
      disabledEndDate = (endValue) => {
        const startValue = this.state.beginDate;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= (new Date(startValue)).valueOf();
      }
      handleBeginOpenChange = (open) => {
        if (!open) {
          this.setState({ endOpen: true });
        }
      }
      handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
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
                                    <SelectItem scope='my' hideAll={true}/>
                                )}
                            </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="批次名称"
                                >
                                    {getFieldDecorator('classBatchName', { 
                                        initialValue: this.state.dataModel.classBatchName,
                                        rules: [{
                                            required: true, message: '请输入批次名称!',
                                        }],
                                    })(
                                        <Input  placeholder="请输入批次名称"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="开始时间"
                                >
                                    {
                                    getFieldDecorator("startDate", {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.startDate), true),
                                        rules: [{
                                        required: true, message: '请选择开始时间!',
                                        }]
                                    })(
                                        <DatePicker
                                        disabledDate={this.disabledBeginDate}
                                        format={dateFormat}
                                        onChange={this.onBeginChange}
                                        onOpenChange={this.handleBeginOpenChange}
                                        placeholder='开始时间'
                                        />
                                    )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="结束时间"
                                >
                                    {
                                    getFieldDecorator("endDate", {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.endDate), true),
                                        rules: [{
                                        required: true, message: '请选择结束时间!',
                                        }]
                                    })(
                                        <DatePicker
                                        disabledDate={this.disabledEndDate}
                                        format={dateFormat}
                                        onChange={this.onEndChange}
                                        open={this.state.endOpen}
                                        onOpenChange={this.handleEndOpenChange}
                                        placeholder='结束时间'
                                        />
                                    )
                                    }
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

const WrappedClassBatchView = Form.create()(ClassBatchView);
export default WrappedClassBatchView;
