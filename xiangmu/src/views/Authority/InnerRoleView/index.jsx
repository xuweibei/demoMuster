import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card } from 'antd';

import './index.less'
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime } from '@/utils';
import { getRoleFunList, getFunctionList } from '@/actions/admin';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
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
class InnerRoleView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            allFuns: [],//所有功能菜单
            roleFuns: [],//授权功能
        };
    }

    componentWillMount() {

        if (this.props.editMode == 'View'
            || this.props.editMode == 'Delete'
            || this.props.editMode == 'Power') {
            this.loadOrgTypeAllFuntions();
            this.loadRoleFuntions();
        }
    }
    //载入当前机构类型对应的全部功能清单
    loadOrgTypeAllFuntions = () => {
        //获取对应类型的功能菜单全集
        this.props.getFunctionList({ funType: this.state.dataModel.orgType }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message, 3);
            }
            else {
                this.setState({ allFuns: data.data })
            }
        })
    }

    //载入角色功能清单
    loadRoleFuntions = () => {
        this.props.getRoleFunList(this.state.dataModel.roleId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message, 3);
            }
            else {
                let funids = data.data
                    //.filter(a => a.isLeaf == 1)
                    .map(a => a.funId);
                let roleFuns = data.data
                    .filter(a => a.isLeaf == 1)
                    .map(a => a.funId);
                
                this.setState({ roleFuns: roleFuns, funids })
            }
        })
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该角色吗?',
                content: '角色删除后，相关用户权限将受限！',
                onOk: () => {
                    let { roleId } = this.state.dataModel;
                    this.props.viewCallback({ roleId });//保存数据
                },
                onCancel: () => {
                    console.log('Cancel');
                },
            });
        }
        else {
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (this.state.funids == '') {
                    message.error('至少勾选一个权限!')
                    return;
                }
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...this.state.dataModel, ...values, funids: this.state.funids });//合并保存数据
                }
            });
        }
    }
    onCheck = (checkedKeys, info) => {
        let dataItemArr = [];
        info.checkedNodes.map((item) => {
            dataItemArr = dataItemArr.concat(item.props.dataItem.path.split(','));
        })
        let funids = [];
        dataItemArr.map((item) => {
            funids = [...funids.filter(a => a != item), item];
        }).sort((a, b) => { return a > b ? 1 : 0; });
        this.setState({ funids: funids });
        this.setState({ roleFuns: checkedKeys })
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode, '授权');
        return `${op}角色`;
    }
    //权限树
    renderTree(menus) {
        if (!menus) { return null };
        return menus.map((item) => {
            let subMenu = this.state.allFuns.filter(a => a.parentId == item.funId).sort((a, b) => { return a > b ? 1 : 0; });
            let childs = this.renderTree(subMenu);
            let title = item.name;// + ":" + item.funId;
            return <TreeNode title={title} key={item.funId.toString()} dataItem={item} isLeaf={item.isLeaf == 1}>{childs}</TreeNode>
        })
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '授权')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
        let firstMenus = this.state.allFuns.filter(a => a.depth == 1);
        let block_funTree = this.renderTree(firstMenus);
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <FormItem
                            {...searchFormItemLayout}
                            label="角色名称"
                        >
                            {getFieldDecorator('roleName', {
                                initialValue: this.state.dataModel.roleName,
                                rules: [{
                                    required: true, message: '请输入角色名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="角色描述"
                        >
                            {getFieldDecorator('description', {
                                initialValue: this.state.dataModel.description
                            })(
                                <TextArea rows={4} placeholder="请输入角色描述" />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="角色状态"
                        >
                            {getFieldDecorator('state', { initialValue: dataBind(this.state.dataModel.state) })(
                                <Select>
                                    {this.props.dic_Status.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>

                        {/* {this.renderBtnControl()} */}
                    </Form>
                );
                break;
            case "Power":
                block_content = (
                    <Form>
                        <FormItem
                            {...searchFormItemLayout}
                            label="功能权限"
                        >
                            <div className={'funTree'}>
                                {
                                    block_funTree.length > 0 && <Tree
                                        checkable
                                        autoExpandParent={true}
                                        checkedKeys={this.state.roleFuns}
                                        defaultExpandAll={true}
                                        onCheck={this.onCheck}
                                    >
                                        {block_funTree}
                                    </Tree>
                                }
                            </div>
                        </FormItem>
                    </Form>
                )
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form layout="Vertical">
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="角色名称"
                                >
                                    <span className="ant-form-text">{this.state.dataModel.roleName}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="角色描述"
                                >
                                    <span className="ant-form-text">{this.state.dataModel.description}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="角色状态"
                                >
                                    <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.state)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="机构类型"
                                >
                                    <span className="ant-form-text">{getDictionaryTitle(this.props.dic_OrgType, this.state.dataModel.orgType)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="管理员角色"
                                >
                                    <span className="ant-form-text">{getDictionaryTitle(this.props.dic_YesNo, this.state.dataModel.isAdmin)}</span>
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
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="功能权限"
                                >
                                    <div className={'funTree'}>
                                        {
                                            block_funTree.length > 0 && <Tree
                                                checkable={true}
                                                autoExpandParent={true}
                                                checkedKeys={this.state.roleFuns}
                                                defaultExpandAll={true}
                                            >
                                                {block_funTree}
                                            </Tree>
                                        }
                                    </div>
                                </FormItem>
                            </Col>
                        </Row>
                        {/* {this.renderBtnControl()} */}
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
            // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
            //     {block_editModeView}
            // </Card>

        );
    }
}

const WrappedRoleView = Form.create()(InnerRoleView);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
        getRoleFunList: bindActionCreators(getRoleFunList, dispatch),
        getFunctionList: bindActionCreators(getFunctionList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedRoleView);
