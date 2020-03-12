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
import { getAreaByBranchList, editAreaByBranch, addAreaByBranch, addUserByAreaId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import OrganizationAreaView from '../OrganizationAreaView';
import OrganizationSetUserView from '../OrganizationSetUserView';
import OrganizationAddUserView from '../OrganizationAddUserView';
import DropDownButton from '@/components/DropDownButton';
import ContentBox from '@/components/ContentBox';



class OrganizationAreaManage extends React.Component {

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
                orgName: '',
                state: 1,
            },

            data: [],
            totalRecord: 0,
            loading: false,
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
            title: '区域名称',
            width: 220,
            fixed: 'left',
            dataIndex: 'orgName'
        },
        {
            title: '状态',
            width: 100,
            dataIndex: 'state',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.state);
            }
        },
        {
            title: '管理用户人数',
            dataIndex: 'count',
            width:120,

        },

        {
            title: '地址',
            dataIndex: 'address',
        },

        {
            title: '负责人',
            width:120,
            dataIndex: 'chargeMan',
        },
        {
            title: '移动电话',
            width:150,
            dataIndex: 'mobile',
        },

        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                    <Button onClick={() => { this.onLookView('EditArea', { ...record }) }}>编辑</Button>
                    <Button onClick={() => { this.onLookView('EditUser', { ...record }) }}>设置用户</Button>
                </DropDownButton>
            }
        }];




    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getAreaByBranchList(condition).payload.promise.then((response) => {
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
                case "Delete":
                    break;
                case "AddArea":
                    this.props.addAreaByBranch(dataModel).payload.promise.then((response) => {
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
                case "EditArea":
                    this.props.editAreaByBranch(dataModel).payload.promise.then((response) => {
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
                case "AddUser":
                    if (!dataModel.cancel) {
                        this.props.addUserByAreaId(dataModel).payload.promise.then((response) => {
                            let data = response.payload.data;
                            if (data.result === false) {
                                message.error(data.message);
                            }
                            else {
                                //进入设置用户页
                                this.onLookView("EditUser", dataModel);
                            }
                        })
                    } else {

                        this.onLookView("EditUser", dataModel);
                    }
                    break;
                case "EditUser":
                    if (!dataModel.cancel) {
                        this.onLookView("AddUser", dataModel);
                    } else {
                        this.onSearch();
                        this.onLookView("Manage", null);
                    }
                    //提交
                    break;

            }
        }
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "EditArea":
            case "AddArea":
                block_content = <OrganizationAreaView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "EditUser":
            case "Delete":
                block_content = <OrganizationSetUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "AddUser":
                block_content = <OrganizationAddUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:

                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('AddArea', { orgName: '', chargeMan: '', address: '', mobile: '', state: '1', faxPhone: '', }) }
                } icon="plus" className="button_dark" > 区域</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'区域名称'} >
                                            {getFieldDecorator('orgName', { initialValue: this.state.pagingSearch.orgName })(
                                                <Input placeholder="区域名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'状态'} >
                                            {getFieldDecorator('state', { initialValue: '1' })(
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
                            scroll={{ x: 1100 }}
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
const WrappedOrganizationAreaManage = Form.create()(OrganizationAreaManage);

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
        getAreaByBranchList: bindActionCreators(getAreaByBranchList, dispatch),
        addAreaByBranch: bindActionCreators(addAreaByBranch, dispatch),
        editAreaByBranch: bindActionCreators(editAreaByBranch, dispatch),
        addUserByAreaId: bindActionCreators(addUserByAreaId, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrganizationAreaManage);
