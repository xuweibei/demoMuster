import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';

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
class ItemView extends React.Component {
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
                this.props.viewCallback({ itemId: this.state.dataModel.itemId, ...values });//合并保存数据
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}项目`;
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

                        <FormItem
                            {...searchFormItemLayout}
                            label="项目名称"
                        >
                            {getFieldDecorator('itemName', {
                                initialValue: this.state.dataModel.itemName,
                                rules: [{
                                    required: true, message: '请输入项目名称!',
                                }],
                            })(
                                <Input placeholder='请输入项目名称' style={{width:380}}/>
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="项目全名称"
                        >
                            {getFieldDecorator('itemFullname', {
                                initialValue: this.state.dataModel.itemFullname,
                                rules: [{
                                    required: true, message: '请输入项目全名称!',
                                }],
                            })(
                                <Input placeholder='请输入项目全名称' style={{width:380}}/>
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="频道"
                        >
                            {getFieldDecorator('channelId', {
                                rules: [{
                                    required: true, message: '请选择频道!',
                                }],
                                initialValue: dataBind(this.state.dataModel.channelId)
                            })(
                                <Select　style={{width:180}}>
                                    <Option 　value=''>---请选择频道---</Option>
                                    {this.props.channel.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>

                        <FormItem
                            {...searchFormItemLayout}
                            label="项目状态"
                        >
                            {getFieldDecorator('state', {
                                initialValue: dataBind(this.state.dataModel.state),
                                rules: [{
                                    required: true, message: '请选择项目状态!',
                                }],
                            })(
                                <Select style={{width:180}}>
                                    {this.props.dic_Status.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="项目是否可见"
                        >
                            {getFieldDecorator('isSee', {
                                initialValue: dataBind(this.state.dataModel.isSee),
                                rules: [{
                                    required: true, message: '请选择项目是否可见!',
                                }],
                            })(
                                <Select style={{width:180}}>
                                    {this.props.dic_IsSee.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
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

const WrappedItemView = Form.create()(ItemView);
export default WrappedItemView;
