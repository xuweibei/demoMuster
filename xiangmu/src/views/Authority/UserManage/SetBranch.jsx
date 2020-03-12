import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox,message } from 'antd';
//业务接口方法引入
import { getOrgList } from '@/actions/admin';
import { getDictionaryTitle, getViewEditModeTitle, transformListToTree } from '@/utils';
import { LargeAreaGetOrganizationVoList,LargeAreaGetOrganizationVoListEdit } from '@/actions/base';

import ContentBox from '@/components/ContentBox';


const FormItem = Form.Item;
const { TextArea } = Input;
const TreeNode = Tree.TreeNode;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AdminUserBranchView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: {
                org_name: '',
                org_id: '',
                state: '',
                currentPage: 1,
                pageSize: 9999,
            },
            first_org_list: [],
            all_org_list: [],
            loading: false,
            totalRecord: 0,
            currentUserOrgList1: [], 
            typeChecked1: false,
            typeChecked2: false,
        };
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    componentWillMount() {
        this.fetchUserOrgList(this.state.dataModel.user.userId)
    }
    onSubmit = () => {
        //表单验证后，合并数据提交

        let c = []
        let b = [] 
        if (this.state.currentUserOrgList1.length > 0) {
            this.state.currentUserOrgList1.map((item) => {
                console.log(item)
                b.push(item)
            })
            c.push(1); 
        } else{  
            this.state.all_org_list.map(item=>{
                b.push(item.orgId)
            })
        }   
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });  
                let condition = {};
                condition.userId = this.state.dataModel.user.userId;
                condition.ids = b.length > 1 ? b.join(',') : b[0]; 
                this.props.LargeAreaGetOrganizationVoListEdit(condition).payload.promise.then((response) => {
                    let data = response.payload.data; 
                        if(data.state == 'success'){
                            message.success('修改成功！')
                            this.props.viewCallback(true);
                        }else{
                            message.error(data.msg)
                        }
                        this.setState({
                            loading:false
                        })
                  }
                ) 
            }
        });
    }
    //检索用户负责的分区列表数据
    fetchUserOrgList = (userId) => {
        let condition = { currentPage: 1, pageSize: 999, userId: userId };
        this.props.LargeAreaGetOrganizationVoList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            let d = [];
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                let orgList = [];
                let dqList = []; 
                orgList = [...data.data.organizationVo.organizationList];
                dqList.push({ orgId: data.data.organizationVo.orgId, orgName: data.data.organizationVo.orgName, orgType: data.data.organizationVo.orgType }) 
                this.setState({ first_org_list: dqList })
                orgList = orgList.map((a) => { return ({ orgId: a.orgId, orgName: a.orgName, orgType: a.orgType, parentOrgid: a.parentOrgid, branchType: a.branchType }) })
                this.setState({ 
                    currentUserOrgList1: data.data.userScopeList.map((a) => a.scope.toString()), 
                    all_org_list: orgList,
                })
                this.state.all_org_list.concat(this.state.first_org_list)
                this.setState({ all_org_list: this.state.all_org_list })

            }
        })
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}用户负责分部设置`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" icon="save" onClick={this.onSubmit}>{'修改'}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
    //权限树
    renderTree1(menus, isPower) {
        if (!menus) { return null };
        return menus.map((item) => {
            let funList = this.state.all_org_list;   
            return <TreeNode title={item.orgName} key={'first_' + item.orgId.toString()} dataItem={item} >{
                funList.filter(a => a.parentOrgid == item.orgId && a.orgType == 3 ).map((item1) => {
                    return <TreeNode title={item1.orgName} key={item1.orgId.toString()} dataItem={item1} ></TreeNode>
                })
            }</TreeNode>
        })
    } 
    onCheck1 = (checkedKeys, info) => { 
        this.setState({ currentUserOrgList1: info.checkedNodes.filter(a => a.key.indexOf('first_') == -1).map(a => a.key.toString()) })
    }  
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form; 
        switch (this.props.editMode) {

            case "Branch":
                {
                    //当前用户对应的功能一级菜单

                    let regions = this.state.first_org_list.filter(a => a.orgType == 2)
                    let block_orgTree1 = this.renderTree1(regions, 1);  
                    block_content = (
                        <Row justify='center' type='flex' style={{ width: '100%' }}>
                            <Col span={12} style={{alignItems:'center',display:'flex',flexDirection: 'column' }}> 
                                <div className={'funTree'}>
                                    <Tree
                                        checkable={true}
                                        autoExpandParent={true}
                                        defaultExpandAll={true}
                                        checkedKeys={this.state.currentUserOrgList1}
                                        expandedKeys={this.state.all_org_list.map(a => a.orgId.toString())}
                                        onCheck={this.onCheck1}
                                      
                                    >
                                        {block_orgTree1}
                                    </Tree>
                                </div>
                            </Col>
                            <Col span={12}></Col> 
                        </Row>
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
        );
    }
}
const WrappedAdminUserBranchView = Form.create()(AdminUserBranchView);
const mapStateToProps = (state) => {
    return {};
};
function mapDispatchToProps(dispatch) {
    return {
        //各业务接口
        getOrgList: bindActionCreators(getOrgList, dispatch),
        //查询
        LargeAreaGetOrganizationVoList: bindActionCreators(LargeAreaGetOrganizationVoList, dispatch),
        //修改
        LargeAreaGetOrganizationVoListEdit: bindActionCreators(LargeAreaGetOrganizationVoListEdit, dispatch),

    };
}


export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserBranchView);

