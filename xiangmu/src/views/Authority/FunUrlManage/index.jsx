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
import { getFunctionUrlList, addFunctionUrlInfo, editFunctionUrlInfo, deleteFunctionUrlInfo } from '@/actions/admin';

import ContentBox from '@/components/ContentBox';
//业务数据视图（增、删、改、查)
import FunUrlView from './view.jsx';
class FunUrlManage extends React.Component {

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

        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            functionName: props.functionName,
            pagingSearch: {
                funId: props.funId || 1,//默认功能菜单类型
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
        this.loadBizDictionary(['dic_YesNo']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        this.props.getFunctionUrlList(this.state.pagingSearch).payload.promise.then((response) => {
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
                    this.props.addFunctionUrlInfo({
                        funId: this.props.funId,
                        urlRule: dataModel.urlRule,
                        isMain: dataModel.isMain,
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
                    this.props.editFunctionUrlInfo({
                        adminPageurlId: dataModel.adminPageurlId,
                        funId: this.props.funId,
                        urlRule: dataModel.urlRule,
                        isMain: dataModel.isMain,
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
                    this.props.deleteFunctionUrlInfo(this.state.currentDataModel.adminPageurlId).payload.promise.then((response) => {
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

    //table 输出列定义
    columns = [
        {
            title: `功能URL`,
            fixed: 'left',
            width: 300,
            dataIndex: 'urlRule',
            className: 'textLeft'
        },
        {
            title: '是否首页',
            dataIndex: 'isMain',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_YesNo, record.isMain);
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
            width: 220,//可预知的数据长度，请设定固定宽度
            fixed: 'right',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button><Divider type="vertical" />
                    <Button onClick={() => { this.onLookView('Delete', record) }}>删除</Button>
                </div>
            ),
        }];
    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <FunUrlView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.props.viewCallback(null) }} icon="rollback" className="button_dark">功能菜单</Button>);
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', {}) }} icon="plus" className="button_dark">功能Url</Button>);
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
                                            label="功能名称"
                                        >
                                            <span>{this.state.functionName}</span>
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
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        {false && <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={24} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.PageSize}
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
const WrappedFunUrlManage = Form.create()(FunUrlManage);

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
        getFunctionUrlList: bindActionCreators(getFunctionUrlList, dispatch),
        addFunctionUrlInfo: bindActionCreators(addFunctionUrlInfo, dispatch),
        editFunctionUrlInfo: bindActionCreators(editFunctionUrlInfo, dispatch),
        deleteFunctionUrlInfo: bindActionCreators(deleteFunctionUrlInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedFunUrlManage);
