import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox,message } from 'antd';
//业务接口方法引入
import { getOrgList } from '@/actions/admin';
import { getDictionaryTitle, getViewEditModeTitle, transformListToTree } from '@/utils';
import { getOrganizationVoList } from '@/actions/base';

import ContentBox from '@/components/ContentBox';


const FormItem = Form.Item;
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
            currentUserOrgList2: [],
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
        if (this.state.typeChecked1) {
            if (this.state.currentUserOrgList1.length > 0) {
                this.state.currentUserOrgList1.map((item) => {
                    b.push(item)
                })
            }
            c.push(1);
        }
        if (this.state.typeChecked2) {
            if (this.state.currentUserOrgList2.length > 0) {
                this.state.currentUserOrgList2.map((item) => {
                    b.push(item)
                })
            }
            c.push(2);
        }
        if (c.length == 0) { message.warning('必须要勾选一个分部！'); return } 
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据

                console.log('branchIds: ' + b.join(',') + ' branchType: ' + c.join(','))
                this.props.viewCallback({ userId: this.state.dataModel.user.userId, branchIds: b.length > 1 ? b.join(',') : b[0], branchType: c.join(',') });//合并保存数据
            }
        });
    }
    //检索用户负责的分区列表数据
    fetchUserOrgList = (userId) => {
        this.setState({
            loading:true
        })
        let condition = { currentPage: 1, pageSize: 999, userId: userId };
        this.props.getOrganizationVoList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            let d = [];
            if (data.result === false) {
                message.error(data.message);
                this.setState({
                    loading:false
                })
            }
            else {
                let orgList = [];
                let dqList = [];
                data.data.organizationVoList.map((a) => {
                    //把二级数组的对象合并到一起
                    orgList = [...orgList, ...a.organizationList];
                    dqList.push({ orgId: a.orgId, orgName: a.orgName, orgType: a.orgType, state: a.state })
                })

                this.setState({ first_org_list: dqList })
                orgList = orgList.map((a) => { return ({ orgId: a.orgId, orgName: a.orgName, orgType: a.orgType, parentOrgid: a.parentOrgid, branchType: a.branchType, state: a.state }) })
                this.setState({
                    typeChecked1: data.data.userScopeListOfBranchType.filter(a => a.scope == 1).length > 0,
                    typeChecked2: data.data.userScopeListOfBranchType.filter(a => a.scope == 2).length > 0,
                    currentUserOrgList1: data.data.userScopeList.filter(a => a.createUid == 1).map((a) => a.scope.toString()),
                    currentUserOrgList2: data.data.userScopeList.filter(a => a.createUid == 2).map((a) => a.scope.toString()),
                    all_org_list: orgList,
                })
                this.state.all_org_list.concat(this.state.first_org_list)
                this.setState({ all_org_list: this.state.all_org_list , loading:false})

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
                <Button type="primary" loading = {this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
                funList.filter(a => a.parentOrgid == item.orgId && a.orgType == 3 && a.branchType == 1).map((item1) => {
                    if(item1.state === 0){
                        return <TreeNode title={item1.orgName+'【停用】'} key={item1.orgId.toString()} dataItem={item1} ></TreeNode>
                    }
                    return <TreeNode title={item1.orgName} key={item1.orgId.toString()} dataItem={item1} ></TreeNode>
                })
            }</TreeNode>
        })
    }
    renderTree2(menus, isPower) {
        if (!menus) { return null };
        return menus.map((item) => {
            let funList = this.state.all_org_list;
            return <TreeNode title={item.orgName} key={'first_' + item.orgId.toString()} dataItem={item} >{
                funList.filter(a => a.parentOrgid == item.orgId && a.orgType == 3 && a.branchType == 2).map((item1) => {
                    if(item1.state === 0){
                        return <TreeNode title={item1.orgName+'【停用】'} key={item1.orgId.toString()} dataItem={item1} ></TreeNode>
                    }
                    return <TreeNode title={item1.orgName} key={item1.orgId.toString()} dataItem={item1} ></TreeNode>
                })
            }</TreeNode>
        })
    }
    onCheck1 = (checkedKeys, info) => {
        this.setState({ currentUserOrgList1: info.checkedNodes.filter(a => a.key.indexOf('first_') == -1).map(a => a.key.toString()) })
    }
    onCheck2 = (checkedKeys, info) => {
        this.setState({ currentUserOrgList2: info.checkedNodes.filter(a => a.key.indexOf('first_') == -1).map(a => a.key.toString()) })

    }
    onChangeType1 = (e) => {
        this.setState({ typeChecked1: e.target.checked });
    }
    onChangeType2 = (e) => {
        this.setState({ typeChecked2: e.target.checked });
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {

            case "Edit":
                {
                    //当前用户对应的功能一级菜单

                    let regions = this.state.first_org_list.filter(a => a.orgType == 2)
                    let block_orgTree1 = this.renderTree1(regions, 1);
                    let block_orgTree2 = this.renderTree2(regions, 1);
                    let arr2 = block_orgTree1.filter(item=>{
                        if(item.props.children.length){
                            return item
                        }
                    })
                    let arr3 = block_orgTree2.filter(item=>{
                        if(item.props.children.length){
                            return item
                        }
                    })
                    block_content = (
                        <Row justify='center' type='flex' style={{ width: '100%' }}>
                            <Col span={12} style={{alignItems:'center',display:'flex',flexDirection: 'column' }}>
                                <div><Checkbox checked={this.state.typeChecked1} onChange={this.onChangeType1}>线下分部</Checkbox></div>
                                <div className={'funTree'}>
                                    <Tree
                                        checkable={this.state.typeChecked1}
                                        autoExpandParent={true}
                                        defaultExpandAll={true}
                                        checkedKeys={this.state.currentUserOrgList1}
                                        expandedKeys={this.state.all_org_list.map(a => a.orgId.toString())}
                                        onCheck={this.onCheck1}
                                      
                                    >
                                        {arr2}
                                    </Tree>
                                </div>


                            </Col>

                            <Col span={12} style={{alignItems:'center',display:'flex',flexDirection: 'column' }}>
                                <div><Checkbox checked={this.state.typeChecked2} onChange={this.onChangeType2}>官网分部</Checkbox></div>
                                <div className={'funTree'}>
                                    <Tree
                                        checkable={this.state.typeChecked2}
                                        autoExpandParent={true}
                                        checkedKeys={this.state.currentUserOrgList2}
                                        expandedKeys={this.state.all_org_list.map(a => a.orgId.toString())}
                                        onCheck={this.onCheck2}
                                         defaultExpandAll={true}
                                    >
                                        {arr3}
                                    </Tree>
                                </div>
                            </Col>
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
        getOrganizationVoList: bindActionCreators(getOrganizationVoList, dispatch),

    };
}


export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserBranchView);

