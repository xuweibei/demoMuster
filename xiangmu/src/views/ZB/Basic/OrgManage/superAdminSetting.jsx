import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Radio, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split } from '@/utils';
import { getUserInfoByLoginName, getUserRole } from '@/actions/admin';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';

const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const RadioGroup = Radio.Group
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
class SuperAdminSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }

    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallbackS();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                let postData = {
                    orgId: this.state.dataModel.orgId,
                    orgType: this.state.dataModel.orgType,
                    loginName: this.state.dataModel.loginName,
                    realName: this.state.dataModel.realName,
                    state: this.state.dataModel.state,
                };
                this.props.viewCallback(postData);//合并保存数据
            }
        });
    }

    //标题
    getTitle() {
        let orgTypeName = this.state.dataModel.orgType == 2 ? '大区' : '分部'
        return `设置${orgTypeName}超级管理员`;
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                {!this.state.findUser && <Button type="primary" loading={this.state.loading} icon="save" disabled>{getViewEditModeTitle(this.props.editMode, '授权')}</Button>}
                {this.state.findUser && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '授权')}</Button>}
                <span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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

    onSearchUserInfo = (e) => {
        this.props.getUserInfoByLoginName(e.target.value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ findUser: false });
                message.warn('没有找到对应用户!')
            }
            else {
                message.info('找到对应用户')
                let { orgId, orgType } = this.state.dataModel;
                this.state.dataModel = { ...data.data, orgId, orgType };//属性合并
                this.setState({ findUser: true, dataModel: this.state.dataModel });
            }
        })
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
            case "Power":
                {
                    block_content = (
                        <Form layout="Vertical">
                            <Row gutter={24}>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="工号"
                                    >
                                        {getFieldDecorator('loginName', {
                                            rules: [
                                                {
                                                    required: true, message: '请输入工号!',
                                                }],
                                        })(
                                            <Input onChange={(e) => { this.setState({ loginName: e.target.value }) }}
                                                placeholder="请输入工号查找用户信息"
                                                onBlur={this.onSearchUserInfo}
                                            />
                                            )}
                                    </FormItem>
                                </Col>

                                {
                                    (this.props.editMode == 'Power' && this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="姓名"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.realName}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="证件号"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.certificateNo}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="部门"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.department}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="手机"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.mobile}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="办公电话"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.otherPhone}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="邮箱"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.email}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.state)}</span>
                                        </FormItem>
                                    </Col>
                                }
                            </Row>
                        </Form >
                    )
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

const WrappedSuperAdminSetting = Form.create()(SuperAdminSetting);

const mapStateToProps = (state) => {
    let { currentUser } = state.auth;
    return { currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        getUserRole: bindActionCreators(getUserRole, dispatch),
        getUserInfoByLoginName: bindActionCreators(getUserInfoByLoginName, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSuperAdminSetting);
