import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime } from '@/utils';
import { getRoleFunList, getFunctionList } from '@/actions/admin';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout,searchFormItemLayout24} from '@/utils/componentExt';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
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
class FunUrlView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }

    componentWillMount() {

    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: `你确认要删除该功能Url吗?`,
                content: `功能Url删除后，相关用户权限将受限！`,
                onOk: () => {
                    let { funId } = this.state.dataModel;
                    this.props.viewCallback({ funId });//保存数据
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
        return `${op}功能Url`;
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
                            label={'功能Url'}
                        >
                            {getFieldDecorator('urlRule', {
                                initialValue: this.state.dataModel.urlRule,
                                rules: [{
                                    required: true, message: `请输入功能Url!`,
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="是否首页"
                        >
                            {getFieldDecorator('isMain', { initialValue: dataBind(this.state.dataModel.isMain) })(
                                <Select>
                                    {this.props.dic_YesNo.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        {/* {this.renderBtnControl()} */}
                    </Form>
                );
                break;
            case "View":
            case "Delete":
                {
                    block_content = (
                        <Form layout="Vertical">
                            <Row gutter={24}>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label={'功能Url'}
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.urlRule}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="是否首页"
                                    >
                                        <span className="ant-form-text">{getDictionaryTitle(this.props.dic_YesNo, this.state.dataModel.isMain)}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="创建日期"
                                    >
                                        <span className="ant-form-text">{timestampToTime(this.state.dataModel.createDate, false)}</span>
                                    </FormItem>
                                </Col>
                            </Row>
                            {/* {this.renderBtnControl()} */}
                        </Form>
                    );
                }
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
            // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
            //     {block_editModeView}
            // </Card>

        );
    }
}

const WrappedFunUrlView = Form.create()(FunUrlView);

export default WrappedFunUrlView;
