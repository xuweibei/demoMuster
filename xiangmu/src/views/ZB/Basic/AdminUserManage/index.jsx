//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getAdminUserList, editBatchAdminUser, } from '@/actions/base';
//业务数据视图（增、删、改、查)
import AdminUserView from '../AdminUserView';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';


class AdminUserManage extends React.Component {

    constructor() {
        super()
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
                department: '',
                realName: '',

            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []//
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
        title: '姓名',
        width: 120,
        fixed: 'left',
        dataIndex: 'user.realName',
    },
    {
        title: '工号',
        width: 150,
        dataIndex: 'user.loginName'
    },
     {
        title: '负责项目',
        dataIndex: 'itemList',
        render: (text, record, index) => {
            var itemList = [];
            record.itemList.map(a => {
                if(a){
                   itemList.push(a.itemName); 
                }
                
            })
            return itemList.join('\\');
        }
    },
    {
        title: '部门',
        dataIndex: 'department'
    },
    {
        title: '状态',
        width: 80,
        dataIndex: 'user.state',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.user.state);
        }
    },
    {
        title: '电话',
        width: 120,
        dataIndex: 'user.mobile',
    },
    {
        title: '邮箱',
        width: 180,
        dataIndex: 'user.email',
    },
   
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (text, record) => {
            return <DropDownButton>
               <Button onClick={() => { this.onLookView('Edit', { userIds: [record.user.userId], itemList: record.itemList, data: this.state.data }) }}>设置项目</Button>
            </DropDownButton>
        }
    }];




    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getAdminUserList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
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
                case "Edit":
                    this.props.editBatchAdminUser(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.setState({ UserSelecteds: [] })
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;

            }
        }
    }
    onBtchEdit = () => {
        this.onLookView('Edit', { userIds: this.state.UserSelecteds, itemList: [], data: this.state.data })
    }

    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case 'Create':
            case "Delete":
                block_content = <AdminUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //表格选择删除后处理
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false,    // Column configuration not to be checked
                    }),
                };

                //除查询外，其他扩展按钮数组
                let extendButtons = [];

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'姓　　名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="请输入姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'部门'} >
                                            {getFieldDecorator('department', { initialValue: this.state.pagingSearch.department })(
                                                <Input placeholder="请输入部门" />
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
                            rowKey={'adminUserId'}
                            rowSelection={rowSelection}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={6}>
                                    {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBtchEdit} icon="tool">批量设置</Button> : <Button disabled icon="tool">批量设置</Button>}
                                </Col>
                                <Col span={18} className='search-paging-control'>
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
const WrappedAdminUserManage = Form.create()(AdminUserManage);

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
        getAdminUserList: bindActionCreators(getAdminUserList, dispatch),
        editBatchAdminUser: bindActionCreators(editBatchAdminUser, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserManage);
