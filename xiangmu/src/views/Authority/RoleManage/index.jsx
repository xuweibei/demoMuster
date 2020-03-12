//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getRoleList, addRoleInfo, editRoleInfo, deleteRoleInfo, saveRoleFun, editRoleModule } from '@/actions/admin';
//业务数据视图（增、删、改、查)
import RoleView from '../RoleView';
import HomeModleView from '../HomeModleView';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import SmallProgramModleView from '../SmallProgramModleView';


class RoleManage extends React.Component {

    constructor(props) {
        super(props)
        console.log(this.props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                roleName: '',
                state: '',
                isAdmin: 0,
            },
            data: [],
            totalRecord: 0,
            loading: false
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_OrgType', 'dic_Status', 'dic_YesNo']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [{
        title: '角色名称',
        width: 200,//可预知的数据长度，请设定固定宽度
        dataIndex: 'roleName',
        fixed: 'left',
        //自定义显示
        render: (text, record, index) => {
            return <a onClick={() => { this.onLookView('View', record) }}>{record.roleName}</a>
        }
    },
    {
        title: '角色描述',
        dataIndex: 'description',
    },
    {
        title: '状态',
        width: 80,
        dataIndex: 'state',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.state);
        }
    },
    {
        title: '创建日期',
        width: 120,
        render: (text, record, index) => {
            return timestampToTime(record.createDate, false);
        }
    },
    {
        title: '操作',
        width: 120,//可预知的数据长度，请设定固定宽度
        key: 'action',
        fixed: 'right',
        render: (text, record) => {
            return <DropDownButton>
                <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                <Button onClick={() => { this.onLookView('Power', record) }}>权限</Button>
                <Button onClick={() => { this.onLookView('HomeModleView', record) }}>首页模块</Button>
                <Button onClick={() => { this.onLookView('SmallProgramModleView', record) }}>小程序模块</Button>
                <Button onClick={() => { this.onLookView('Delete', record) }}>删除</Button>
            </DropDownButton>
        }
    }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getRoleList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
    }
    /*
    handleTableChange = (pagination, filters, sorter) => {
                    //const pager = this.state.pagingSearch;
                    //pager.currentPage = pagination.current;
                    //this.setState({ pagination: pager });
                    this.fetch({
                        results: pagination.pageSize,
                        currentPage: pagination.currentPage,
                        sortField: sorter.field,
                        sortOrder: sorter.order,
                        ...filters,
                    });
                }
    */
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
                    this.props.addRoleInfo({
                        roleName: dataModel.roleName,
                        isAdmin: dataModel.isAdmin,
                        description: dataModel.description,
                        state: dataModel.state,
                    }).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message, 3);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Edit": //提交
                    this.props.editRoleInfo({
                        roleId: dataModel.roleId,
                        roleName: dataModel.roleName,
                        isAdmin: dataModel.isAdmin,
                        description: dataModel.description,
                        state: dataModel.state,
                        orgId: dataModel.orgId,
                    }).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Delete":
                    //提交
                    this.props.deleteRoleInfo(this.state.currentDataModel.roleId).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Power":
                    //提交
                    this.props.saveRoleFun(this.state.currentDataModel.roleId, dataModel.funids.join(',')).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "HomeModleView":
                    //提交
                    this.props.editRoleModule({roleId:this.state.currentDataModel.roleId, moduleIds:dataModel.funids.join(',')}).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'SmallProgramModleView':
                    this.onSearch();
                    //进入管理页
                    this.onLookView("Manage", null);

            }
        }
    }
    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
            case "Power":
                block_content = <RoleView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "HomeModleView":
                block_content = <HomeModleView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "SmallProgramModleView":
                block_content = <SmallProgramModleView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { isAdmin: 0, state: 1, roleName: '', description: '' }) }} icon="plus" className="button_dark">角色</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12} >
                                        <FormItem
                                            style={{ marginBottom: 0 }}
                                            {...searchFormItemLayout}
                                            label="角色名称"
                                        >
                                            {getFieldDecorator('roleName', { initialValue: this.state.pagingSearch.roleName })(
                                                <Input placeholder="请输入角色名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            style={{ marginBottom: 0 }}
                                            {...searchFormItemLayout}
                                            label="角色状态"
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
                            //onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: this.columns.length > 7 ? 1300 : 0 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={24} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
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
const WrappedRoleManage = Form.create()(RoleManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getRoleList: bindActionCreators(getRoleList, dispatch),
        addRoleInfo: bindActionCreators(addRoleInfo, dispatch),
        editRoleInfo: bindActionCreators(editRoleInfo, dispatch),
        deleteRoleInfo: bindActionCreators(deleteRoleInfo, dispatch),
        saveRoleFun: bindActionCreators(saveRoleFun, dispatch),
        editRoleModule: bindActionCreators(editRoleModule, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedRoleManage);
