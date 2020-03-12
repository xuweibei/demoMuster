import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber } from 'antd';
import {searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle } from '@/utils';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const DefineDictionaryForm = Form.create()(
    (props) => {
        const { visible, onCancel, onCreate, form } = props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={visible}
                title="添加字典"
                okText="添加"
                cancelText="取消"
                onCancel={onCancel}
                onOk={onCreate}
            >
                <Form layout="vertical">
                    <FormItem label="字典">
                        {getFieldDecorator('GroupName', {
                            rules: [{ required: true, message: '请定义字典' }],
                        })(
                            <Input />
                            )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
);
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class DictionaryView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            showAddGroupName: false,
            dic_GroupNames: props.dic_GroupNames,
        };
    }

    componentWillMount() {

    }
    showModal = () => {
        this.setState({ showAddGroupName: true });
    }
    handleCancel = () => {
        this.setState({ showAddGroupName: false });
    }
    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({ dic_GroupNames: [{ title: values.GroupName, value: values.GroupName }, ...this.state.dic_GroupNames], showAddGroupName: false });

            //重置
            form.resetFields();
        });
    }
    saveFormRef = (form) => {
        this.form = form;
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该字典吗?',
                content: '如果字典已经使用，则不能被删除！',
                onOk: () => {
                    this.props.viewCallback(this.state.dataModel);//保存数据
                },
                onCancel: () => {
                    console.log('Cancel');
                },
            });
        }
        else {
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据

                    this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}字典`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典项名称"
                        >
                            {getFieldDecorator('Title', {
                                initialValue: this.state.dataModel.Title,
                                rules: [{
                                    required: true, message: '请输入字典项名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典项值"
                        >
                            {getFieldDecorator('Value', {
                                initialValue: this.state.dataModel.Value,
                                rules: [{
                                    required: true, message: '请输入字典项值!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典"
                            extra={this.props.editMode == 'Create' ? <a onClick={this.showModal} >添加新字典</a> : ''}
                        >
                            {getFieldDecorator('GroupName', {
                                initialValue: this.state.dataModel.GroupName,
                                rules: [{
                                    required: true, message: '请设置字典!',
                                }],
                            })(
                                <Select>
                                    {this.state.dic_GroupNames.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="显示顺序"
                        >
                            {getFieldDecorator('OrderNo', {
                                initialValue: this.state.dataModel.OrderNo,
                                rules: [{
                                    required: true, message: '请设置显示顺序!',
                                }],
                            })(
                                <InputNumber min={1} max={100} />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典说明"
                            extra="特殊时请备注清楚字典的含义"
                        >
                            {getFieldDecorator('Description')(
                                <TextArea rows={4} />
                            )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="状态"
                        >
                            {getFieldDecorator('Status', {
                                initialValue: (this.state.dataModel.Status || "1").toString(),
                                rules: [{
                                    required: true, message: '请设置状态!',
                                }],
                            })(
                                <Select>
                                    {this.props.dic_Status.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                    <DefineDictionaryForm
                        ref={this.saveFormRef}
                        visible={this.state.showAddGroupName}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                    />
                </div>
                );
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典项名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Title}</span>
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典项值"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Value}</span>
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典"
                        >
                            <span className="ant-form-text">{this.state.dataModel.GroupName}</span>
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="显示顺序"
                        >
                            <span className="ant-form-text">{this.state.dataModel.OrderNo}</span>
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="字典说明"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Description}</span>
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.Status)}</span>
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="创建信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="修改信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.UpdatedDate} by {this.state.dataModel.UpdatedUserInfo.name}</span>
                        </FormItem>
                        {this.renderBtnControl()}
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
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedDictionaryView = Form.create()(DictionaryView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDictionaryView);