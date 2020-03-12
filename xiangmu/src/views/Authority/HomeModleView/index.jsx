import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card } from 'antd';

import './index.less'
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime } from '@/utils';
import { getRoleModule, adminHomeModule } from '@/actions/admin';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';

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
class HomeModleView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            roleFuns: [],//授权功能
            funids: [],
            allRoleFuns: [],//所有角色功能列表，包括父节点
            allFuns: [],
            orgList: [
                {
                    moduleName: '总部',
                    moduleType: 1,
                    homeAreaModuleId: 999999997
                },
                {
                    moduleName: '大区',
                    moduleType: 2,
                    homeAreaModuleId: 999999998
                },
                {
                    moduleName: '分部',
                    moduleType: 3,
                    homeAreaModuleId: 999999999
                }
            ]
        };
    }

    componentWillMount() {
        
        this.loadOrgTypeAllFuntions();
        this.loadRoleFuntions();

    }

    //载入当前机构类型对应的全部功能清单
    loadOrgTypeAllFuntions = () => {
        //获取对应类型的功能菜单全集
        var params = { 
            moduleType: this.state.dataModel.orgType
        }
        this.props.adminHomeModule(params).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                message.error(data.message, 3);
            }
            else {
                this.setState({ allFuns: data.data })
            }
        })
    }

    //载入角色功能清单
    loadRoleFuntions = () => {
        this.props.getRoleModule({roleId:this.state.dataModel.roleId,moduleType: this.state.dataModel.orgType}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                message.error(data.message, 3);
            }
            else {
                let funids = data.data
                    .map(a => a.moduleId);

                let roleFuns = data.data
                    .map(a => a.moduleId);

                this.setState({ allRoleFuns: data.data, roleFuns, funids })
                
            }
        })
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            // if (this.state.funids == '') {//去掉限制
            //     message.error('至少勾选一个权限!')
            //     return;
            // }
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({ ...this.state.dataModel, ...values, funids: this.state.funids });//合并保存数据
            }
        });
    }
    onCheck = (checkedKeys, info) => {

        let funids = checkedKeys.sort((a, b) => { return a > b ? 1 : 0; });

        this.setState({ funids: funids });
        this.setState({ roleFuns: checkedKeys })

    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode, '授权');
        return `${op}首页模块`;
    }
    //权限树
    renderTree(menus, isPower) {
        if (!menus) { return null };
        return menus.map((item) => {
            
            // let funList = this.state.allFuns;
            
            // let subMenu = funList.filter(a => a.moduleType == item.moduleType).sort((a, b) => { return a > b ? 1 : 0; });
            let childs = '';
            // childs = subMenu.map((child) => {
            //     let title = child.moduleName;
            //     return <TreeNode title={title} key={child.homeAreaModuleId.toString()} dataItem={child}></TreeNode>
            // })

            let title = item.moduleName;//+ ":" + item.funId;
            return <TreeNode title={title} key={item.homeAreaModuleId.toString()} dataItem={item} isLeaf={true}>{childs}</TreeNode>
        })
    }
    //表单按钮处理
    renderBtnControl() {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '授权')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "HomeModleView":
                {
                    //当前用户对应的功能菜单
                    let firstMenus = this.state.allFuns;
                    let block_funTree = this.renderTree(firstMenus, 1);
                    block_content = (
                        <Form>
                            <FormItem
                                {...searchFormItemLayout}
                                label="首页模块权限"
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

const WrappedHomeModleView = Form.create()(HomeModleView);

const mapStateToProps = (state) => {
    let { currentUser } = state.auth;
    return { currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        getRoleModule: bindActionCreators(getRoleModule, dispatch),
        adminHomeModule: bindActionCreators(adminHomeModule, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedHomeModleView);
