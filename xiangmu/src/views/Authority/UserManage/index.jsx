//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider,Tooltip } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getOrgUserList, addOrgUserInfo, getRoleList, saveUserRole } from '@/actions/admin';
//业务数据视图（增、删、改、查)
import UserView from '../UserView';
import ContentBox from '@/components/ContentBox';
import Modify from './Modify';
import Edit from './Edit';
import Branch from './SetBranch';

import DropDownButton from '@/components/DropDownButton';

class UserManage extends React.Component {
    constructor() {
        super();
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                loginName: '',
                realName: '',
                roleId: '',
                email: '',
                certificateNo: '',
                department: '',
                state: '',
            },
            data: [],
            dic_Roles: [],
            totalRecord: 0,
            loading: false,
            reqErroe:false
        };
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
    }
    componentWillMount() { 
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //载入角色列表
        this.fetchRoleList();
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
        let name = this.props.currentUser.user.loginName;
        if(name == 'admin' || name == 'sysadmin'){
            this.columns[this.columns.length-1] = 
                                    {
                                        title: '操作',
                                        width: 120,//可预知的数据长度，请设定固定宽度
                                        fixed: 'right',
                                        key: 'action',
                                        render: (text, record) => (
                                            <DropDownButton>
                                                <Button onClick={() => {
                                                    record.state = String(record.state);
                                                    record.orgType = String(record.orgType);
                                                    this.onLookView('Power', record)
                                                }}>权限</Button>
                                                <Button onClick={() => {
                                                    this.onLookView('modify', record)
                                                }}>修改</Button>
                                                {/*record.orgType == 3 && <Button onClick={() => { this.onLookView('University', record) }}>高校</Button>*/}
                                            </DropDownButton>
                                        ),
                                    }
        }
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [{
        title: '工号',
        width: 150,//可预知的数据长度，请设定固定宽度
        fixed: 'left',
        dataIndex: 'loginName', //自定义显示
        render: (text, record, index) => {
            return <a onClick={() => { this.onLookView('View', record) }}>{record.loginName}</a>
        }
    },
    {
        title: '姓名',
        width: 80,
        dataIndex: 'realName',
    },
    {
        title: '部门',
        dataIndex: 'department',
    },
    {
        title: '负责分部数',
        dataIndex: 'manageBranchNum',
    },
    {
        title: '角色',
        dataIndex: 'roleName',
    },
    {
        title: '手机',
        width: 120,
        dataIndex: 'mobile',
    },
    {
        title: '办公电话',
        width: 120,
        dataIndex: 'otherPhone',
    },
    {
        title: '邮箱',
        dataIndex: 'email',
    },
    {
        title: '状态',
        width: 50,
        dataIndex: 'state',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.state);
        }
    },
    {
        title: '创建日期',
        width: 100,
        render: (text, record, index) => {
            return timestampToTime(record.createDate, false);
        }
    },
    {
        title: '操作',
        width: 120,//可预知的数据长度，请设定固定宽度
        fixed: 'right',
        key: 'action',
        render: (text, record) => ( 
            <DropDownButton>
                <Button onClick={() => { this.onLookView('Power', record) }}>权限</Button>
                {this.props.currentUser.userType.usertype == '2'?<Button onClick={() => { this.onLookView('Branch', record) }}>负责分部</Button>:''}
                {this.props.currentUser.userType.usertype == '2'?<Button onClick={() => { this.onLookView('Edit', { userIds: [record.user.userId], itemList: record.manageItemIds, data: this.state.data }) }}>设置项目</Button>:''}
            </DropDownButton >
        ),
    }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getOrgUserList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            console.log(data)
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
    }
    //检索数据
    fetchRoleList = (params = {}) => {
        var condition = { pageSize: 999, currentPage: 1, state: 1, isAdmin: '' };
        this.props.getRoleList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message, 3);
            }
            else {
                //角色列表过滤
                let roles = data.data;
                if (this.props.currentUser.user.userId != '00000000000000000000000000000001') {//非超级管理员账号，去除内置角色
                    roles = roles.filter(a => a.orgId != '00000000000000000000000000000001' || (a.orgId == '00000000000000000000000000000001' && a.orgType == 1 && a.isAdmin==0))
                }

                //过滤机构数据
                roles = roles.filter(a => a.orgId == this.props.currentUser.userType.orgId);

                this.setState({
                    dic_Roles: roles.map((a) => {
                        return { title: a.roleName, value: a.roleId.toString() }
                    })
                })
            }
        })
    }
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => { 
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                    this.props.addOrgUserInfo({
                        loginName: dataModel.loginName,
                        realName: dataModel.realName,
                        mobile: dataModel.mobile,
                        otherPhone: dataModel.otherPhone,
                        email: dataModel.email,
                        department: dataModel.department,
                        roleId: dataModel.roleIds.join(','),
                        scopeTypes: dataModel.scopeTypes,
                        state: 1,
                    }).payload.promise.then((response) => {
                        let data = response.payload.data; 
                        if (data.result === false) {
                            message.error(data.message, 3);
                            this.setState({
                                reqErroe:true
                            })
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Power":
                    //提交
                    let { isSelfOrder, isSelfStudent, isSelfQuickPay } = dataModel;
                    let postData = {
                        userId: this.state.currentDataModel.userId,
                        roleids: dataModel.roleIds.join(','),
                        isSelfOrder,
                        isSelfStudent,
                        isSelfQuickPay
                    };
                    this.props.saveUserRole(postData).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                            this.setState({
                                reqErroe:true
                            })
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'modify':
                    this.onLookView("modify", null);
                    break;
                case 'Branch':
                case 'Edit':
                    this.onSearch();
                    //进入管理页
                    this.onLookView("Manage", null);
                break;
            }
        }
    }
    changeEeqError=()=>{
        this.setState({
          reqErroe:false
        })
    }
    //渲染，根据模式不同控制不同输出
    render() {
    const {auth} = this.props;
    // var currentUser = auth.currentUser;
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            case 'Branch':
                block_content = <Branch changeEeqError={this.changeEeqError} viewCallback={this.onViewCallback} {...this.state} />
            break;
            case "Edit":
                block_content = <Edit changeEeqError={this.changeEeqError} viewCallback={this.onViewCallback} {...this.state} />
            break;
            case "Create":
            case "View":
            case "Delete":
            case "Power":
                block_content = <UserView changeEeqError={this.changeEeqError} viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'modify':
                block_content = <Modify viewCallback={this.onViewCallback} {...this.state} />;
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { roleId: '' }) }} icon="plus" className="button_dark">用户</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="姓名"
                                        >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input
                                                    placeholder="请输入姓名" 
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="工号"
                                        >
                                            {getFieldDecorator('loginName', { initialValue: this.state.pagingSearch.loginName })(
                                                <Input placeholder="请输入工号"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="证件号"
                                        >
                                            {getFieldDecorator('certificateNo', { initialValue: this.state.pagingSearch.certificateNo })(
                                                <Input placeholder="请输入证件号"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="部门"
                                        >
                                            {getFieldDecorator('department', { initialValue: this.state.pagingSearch.department })(
                                                <Input placeholder="请输入部门"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="角色"
                                        > {getFieldDecorator('roleId', { initialValue: this.state.pagingSearch.roleId })(
                                            <Select
                                                showSearch={true}
                                                filterOption={(inputValue, option) => { 
                                                var result = false;
                                                for(var i = 0; i < option.props.children.length; i++){
                                                    if(option.props.children.indexOf(inputValue) != -1){
                                                    result = true;
                                                    break;
                                                    }
                                                }
                                                return result;
                                                // return (option.props.children.indexOf(inputValue) != -1);
                                                }}
                                            >
                                                <Option value=''>全部</Option>
                                                {
                                                    this.state.dic_Roles.map(item=>{
                                                        return <Option value={item.value} key={item.value} title={item.title}>{item.title}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}

                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        }
                    </ContentBox>
                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                    {/* 数据表格 */}
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 2000 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={24} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                        // defaultPageSize={10}
                                        onShowSizeChange={this.onShowSizeChange}
                                        onChange={this.onPageIndexChange}
                                        showTotal={(total) => { return `共${total}条数据`; }}
                                        total={this.state.totalRecord} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedUserManage = Form.create()(UserManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { currentUser } = state.auth;
    return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getOrgUserList: bindActionCreators(getOrgUserList, dispatch),
        addOrgUserInfo: bindActionCreators(addOrgUserInfo, dispatch),
        getRoleList: bindActionCreators(getRoleList, dispatch),
        saveUserRole: bindActionCreators(saveUserRole, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUserManage);
