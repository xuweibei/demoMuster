//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Tabs } from 'antd';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getFunctionList, addFunctionInfo, editFunctionInfo, deleteFunctionInfo, getFunctionUrlList, addFunctionUrlInfo, editFunctionUrlInfo } from '@/actions/admin';

import ContentBox from '@/components/ContentBox';
//业务数据视图（增、删、改、查)
import MenuView from './view.jsx';
import FunUrlManage from '../FunUrlManage/index';
import DropDownButton from '@/components/DropDownButton';

class MenuManage extends React.Component {

    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        let funTypeInfo = props.dic_FuntionTypes.find(a => a.funType == props.funType);
        this.state = {
            currentDataModel: null,
            currentMenuDepth: 1,
            parentMenuPaths: [{ name: funTypeInfo.funTypeName, funId: null, depth: 0 }],
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                funType: props.funType || 1,//默认功能菜单类型
                currentPage: 1,
                pageSize: 999,
            },
            data: [],
            totalRecord: 0,
            loading: false
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


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        this.props.getFunctionList(this.state.pagingSearch).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                this.setState({ ...data, loading: false })
            }
        })
    }

    //浏览视图
    onLookView = (op, item) => {
        if (op == 'Manage' && item != null) {
            this.state.parentMenuPaths = [...this.state.parentMenuPaths, item];
            this.setState({ parentMenuPaths: this.state.parentMenuPaths, currentMenuDepth: this.state.parentMenuPaths.length })
        }
        if (op == 'BackParent') {
            op = "Manage";
            //移除
            this.state.parentMenuPaths.splice(this.state.parentMenuPaths.length - 1, 1);
            this.setState({ parentMenuPaths: this.state.parentMenuPaths, currentMenuDepth: this.state.parentMenuPaths.length })
        }
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
                    this.props.addFunctionInfo({
                        funType: this.state.pagingSearch.funType,
                        isLeaf: this.state.currentMenuDepth == 3 ? 1 : 0,
                        depth: this.state.parentMenuPaths[this.state.parentMenuPaths.length - 1].depth + 1,
                        parentId: this.state.parentMenuPaths[this.state.parentMenuPaths.length - 1].funId,//父节点
                        name: dataModel.name,//相关表单项
                        orderNo: dataModel.orderNo,
                        state: dataModel.state,
                    }).payload.promise.then((response) => {
                        let data = response.payload.data;
                        this.onSearch();
                        if (data.result === false) {
                            message.error(data.message, 3);
                        }
                        else {
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Edit": //提交
                    this.props.editFunctionInfo({
                        funId: dataModel.funId,
                        name: dataModel.name,//相关表单项
                        orderNo: dataModel.orderNo,
                        state: dataModel.state,
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
                    this.props.deleteFunctionInfo(dataModel).payload.promise.then((response) => {
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
            }
        }
    }
    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        //完整路径
        let parentPathName = "";
        this.state.parentMenuPaths.map((item, index) => {
            parentPathName += '/' + item.name;
        })

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <MenuView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "ManageFunUrl":
                block_content = <FunUrlManage viewCallback={this.onViewCallback} funId={this.state.currentDataModel.funId} functionName={`${parentPathName}/${this.state.currentDataModel.name}`} />
                break;
            case "Manage":
            default:
                //table 输出列定义
                let columns = [
                    {
                        title: `${this.state.currentMenuDepth == 1 ? '菜单名称' : '功能名称'}`,
                        dataIndex: 'name',
                        width: 300,
                        fixed: 'left',
                    },
                    this.state.currentMenuDepth < 3 ? {
                        title: '子菜单',
                        render: (text, record) => {
                            let subMenus = this.state.data.filter(a => a.parentId == record.funId);
                            return <div>
                                <Button onClick={() => { this.onLookView('Manage', record) }}>{this.state.currentMenuDepth == 1 ? '管理菜单' : '管理功能'}({subMenus.length})</Button>
                            </div>
                        }
                    } : {
                            title: '功能URL',
                            render: (text, record) => {
                                return <div>
                                    <Button onClick={() => { this.onLookView('ManageFunUrl', record) }}>管理URL</Button>
                                </div>
                            }
                        },
                    {
                        title: '显示顺序',
                        dataIndex: 'orderNo',
                    },
                    {
                        title: '状态',
                        dataIndex: 'state',
                        render: (text, record, index) => {
                            return getDictionaryTitle(this.state.dic_Status, record.state);
                        }
                    },
                    {
                        title: '创建日期',
                        render: (text, record, index) => {
                            return timestampToTime(record.createDate, false);
                        }
                    },
                    {
                        title: '操作',
                        width: 120,//可预知的数据长度，请设定固定宽度
                        key: 'action',
                        fixed: 'right',
                        render: (text, record) => (
                            <DropDownButton>
                                <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                                <Button onClick={() => { this.onLookView('Delete', record) }}>删除</Button>
                            </DropDownButton>
                        ),
                    }].filter(a => a != null);


                let data_list =
                    this.state.data.filter((item) => {
                        return item.parentId == this.state.parentMenuPaths[this.state.parentMenuPaths.length - 1].funId;
                    }).sort((a, b) => { 
                        if(a.orderNo < b.orderNo) {
                            return -1;
                        } else if(a.orderNo > b.orderNo) {
                            return 1;
                        } else {
                            return 0;
                        }
                    })

                //顺序号    
                let nextOrderNo = data_list.length + 1;
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                if (this.state.currentMenuDepth > 1) {
                    extendButtons.push(<Button onClick={() => { this.onLookView('BackParent', null) }} icon="rollback" className="button_dark">上级菜单</Button>);
                }

                if (this.state.currentMenuDepth < 3) {
                    extendButtons.push(<Button onClick={() => { this.onLookView('Create', { orderNo: nextOrderNo, state: '1', isLeaf: 0 }) }} icon="plus" className="button_dark">菜单</Button>);
                }
                else {
                    extendButtons.push(<Button onClick={() => { this.onLookView('Create', { orderNo: nextOrderNo, state: '1', isLeaf: 1 }) }} icon="plus" className="button_dark">功能</Button>);
                }


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
                                            label="上级菜单"
                                        >
                                            <span>{parentPathName}</span>
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
                        <Table columns={columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={data_list}//数据
                            bordered
                        />
                        <div className="space-default"></div>
                        {false && <div className="search-paging">
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
                        }
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedMenuManage = Form.create()(MenuManage);

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
        getFunctionList: bindActionCreators(getFunctionList, dispatch),
        addFunctionInfo: bindActionCreators(addFunctionInfo, dispatch),
        editFunctionInfo: bindActionCreators(editFunctionInfo, dispatch),
        deleteFunctionInfo: bindActionCreators(deleteFunctionInfo, dispatch),
        getFunctionUrlList: bindActionCreators(getFunctionUrlList, dispatch),
        addFunctionUrlInfo: bindActionCreators(addFunctionUrlInfo, dispatch),
        editFunctionUrlInfo: bindActionCreators(editFunctionUrlInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMenuManage);
