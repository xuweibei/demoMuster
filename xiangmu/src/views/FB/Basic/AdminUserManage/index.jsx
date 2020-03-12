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
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities,updQuyuOfUser } from '@/actions/base';
//业务数据视图（增、删、改、查)
import AdminUserView from '../AdminUserView';
import AdminUserTeaching from '../AdminUserView/AdminUserTeaching';
import AdminUserItemView from '../AdminUserItemView';
import AdminUserBatchView from '../AdminUserBatchView';
import AdminUserEditBatchTeaching from '../AdminUserBatchView/AdminUserEditBatchTeaching';
import AdminUserAreaView from '../AdminUserAreaView';
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
                loginName: '',
                realName: '',

            },
            Isparent: false,
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
    columns = [
        {
            title: '工号',
            width: 120,
            fixed: 'left',
            dataIndex: 'user.loginName'
        },
        {
            title: '姓名',
            width: 80,
            dataIndex: 'user.realName',
        },

        {
            title: '部门',
            width: 150,
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
            width: 120,
            dataIndex: 'user.email',
        },
        {
            title: '负责项目',
            dataIndex: 'itemList.itemName',
            render: (text, record, index) => {
                return record.itemList.map(a => a.itemName).join('\\')
            }
        },
        {
            title: '负责高校数',
            width: 100,
            dataIndex: 'universitiesNum',
        },
        {
            title: '负责区域数',
            width: 100,
            dataIndex: 'quyuNum',
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (text, record) => {
                return <DropDownButton>
                    <Button onClick={() => { this.onLookView('Edit', { userId: record.user.userId, ...record }) }}>设置高校</Button>
                    <Button onClick={() => { this.onLookView('EditItem', { userIds: [record.user.userId], itemList: record.itemList, data: this.state.data }) }}>设置项目</Button>
                    <Button onClick={() => { this.onLookView('EditArea', { userIds: record.user.userId }) }}>设置区域</Button>
                    <Button onClick={() => { this.onLookView('Teaching', { userIds: record.user.userId, ...record }) }}>设置教学点</Button>
                </DropDownButton>
            }

        }];




    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getBranchAdminUserList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ UserSelecteds: [] });
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
        console.log(dataModel,this.state.editMode)
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Delete":
                    break;
                case "EditBatch":
                    this.props.editBranchAdminUserUniversities(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            if (this.state.Isparent) {
                                this.setState({ UserSelecteds: [] })
                                let userinfo = this.state.data.find(a => a.adminUserId == dataModel.userIds)
                                this.onLookView("Edit", { userId: dataModel.userIds, ...userinfo });
                            } else {
                                this.setState({ UserSelecteds: [] })
                                this.onSearch();
                                this.onLookView("Manage", null);
                            }

                        }
                    })
                    break;
                case "Edit":
                    if (dataModel.cancel) {
                        this.onSearch();
                        this.onLookView("Manage", null);

                    } else {
                        this.setState({ Isparent: true })
                        this.onLookView("EditBatch", dataModel);
                    }

                    break;
                
                case "Teaching":
                    if (dataModel.cancel) {
                        this.onSearch();
                        this.onLookView("Manage", null);

                    } else {
                        this.setState({ Isparent: true })
                        this.onLookView("EditBatchTeaching", dataModel);
                    }

                break;
                case 'EditBatchTeaching':
                    if(dataModel.userIds){
                        this.onLookView("Teaching", dataModel);
                    }else{ 
                        this.onSearch();
                        this.onLookView("Manage", null);
                    }
                    break;
                case "EditItem":
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
                  case "EditArea":
                    this.props.updQuyuOfUser(dataModel).payload.promise.then((response) => {
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
                 case "EditAreapl":
                    this.props.updQuyuOfUser(dataModel).payload.promise.then((response) => {
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
        this.setState({ Isparent: false })
        this.onLookView('EditBatch', { userIds: this.state.UserSelecteds, data: this.state.data })
    }
    onBtchEditItem = () => {
        this.onLookView('EditItem', { userIds: this.state.UserSelecteds, itemList: [], data: this.state.data })
    } 
    onBtchEditArea = () => {
        this.onLookView('EditAreapl', { userIds: this.state.UserSelecteds})
    }
    //渲染，根据模式不同控制不同输出
    render() { 
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case 'Teaching': 
                block_content = <AdminUserTeaching
                viewCallback={this.onViewCallback} {...this.state} />
            break;
            case 'EditBatchTeaching': 
                block_content = <AdminUserEditBatchTeaching
                viewCallback={this.onViewCallback} {...this.state} />
            break;
            case "EditBatch":
                block_content = <AdminUserBatchView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Edit":

            case "View":
            case 'Create':
            case "Delete":
                block_content = <AdminUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "EditItem":
                block_content = <AdminUserItemView
                    viewCallback={this.onViewCallback} {...this.state} />
                break; 
            case "EditArea":
                block_content = <AdminUserAreaView
                    viewCallback={this.onViewCallback} {...this.state} />
                break; 
            case "EditAreapl":
                block_content = <AdminUserAreaView
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
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'姓　　名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="请输入姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'工   号'} >
                                            {getFieldDecorator('loginName', { initialValue: this.state.pagingSearch.loginName })(
                                                <Input placeholder="请输入工号" />
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
                            scroll={{ x: 1500 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={24}>
                                    <div className='flex-row'>
                                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBtchEdit} icon="plus">批量增加负责高校</Button> : <Button disabled icon="plus">批量增加负责高校</Button>}
                                        <div className='split_button'></div>
                                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBtchEditItem} icon="profile">批量设置项目</Button> : <Button disabled icon="profile">批量设置项目</Button>}
                                        <div className='split_button'></div>
                                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBtchEditArea} icon="profile">批量增加负责区域</Button> : <Button disabled icon="profile">批量增加负责区域</Button>}
                                    </div>
                                </Col>
                                <Col span={24} className='search-paging-control' style={{paddingTop:20}}>
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
        editBatchAdminUser: bindActionCreators(editBatchAdminUser, dispatch),
        getBranchAdminUserList: bindActionCreators(getBranchAdminUserList, dispatch),
        editBranchAdminUserUniversities: bindActionCreators(editBranchAdminUserUniversities, dispatch),
        updQuyuOfUser:bindActionCreators(updQuyuOfUser, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserManage);
