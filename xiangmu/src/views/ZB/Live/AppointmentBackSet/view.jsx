import React from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, InputNumber } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';

const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const searchFormItemLayout12 = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
  };
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AppointmentBackSetView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
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
                this.props.viewCallback({ itemId: this.state.dataModel.itemId,bitItemLiveHapId: this.state.dataModel.bitItemLiveHapId, ...values });//合并保存数据
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `预约回放设置`;
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
                    <Form className="search-form">
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout12}
                                    label="项目"
                                >
                                    { this.state.dataModel.itemName }
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout12}
                                    label="可预约次数"
                                >
                                    {getFieldDecorator('liveHap', {
                                        initialValue: this.state.dataModel.liveHap,
                                        rules: [{
                                            required: true, message: '请输入可预约次数!',
                                        }],
                                    })(
                                        <InputNumber min={0} step={1} />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout12}
                                    label="观看回放次数"
                                >
                                    {getFieldDecorator('liveReplayHap', {
                                        rules: [{
                                            required: true, message: '请选择观看回放次数!',
                                        }],
                                        initialValue: dataBind(this.state.dataModel.liveReplayHap)
                                    })(
                                        <InputNumber min={0} step={1} />
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
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedAppointmentBackSetView = Form.create()(AppointmentBackSetView);
export default WrappedAppointmentBackSetView;
