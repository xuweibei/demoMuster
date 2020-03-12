//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table,
    Pagination, Divider, Modal, Card
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, transformListToTree } from '@/utils';

//业务接口方法引入
import {
    getLastDepthList, getOrgList, saveOrgInfo, deleteOrgInfo, setOrgAdminInfo,
    orgBranchListByParentId
} from '@/actions/admin';
//业务数据视图（增、删、改、查)
//import OrgView from '../OrgView';
//import OrgUniversityManage from '../OrgUniversityManage';
import OrgView from './view';
import OrgUniversityManage from './university';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import NewInfo from './newInfo';

const model = {
    orgId: '',
    parentOrgid: null,
    orgName: '',
    orgCode: '',
    chargeMan: '',
    orgType: '2',
    state: '1',
    mobile: '',
    email: '',
    address: '',
    zipcode: '',
    contactPhone: '',
    faxPhone: '',
    orderNo: 0,
    areaCode: ''
};

class OrgManage extends React.Component {

    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        (this: any).getConditionData = this.getConditionData.bind(this);
        this.onBatchDelete = this.onBatchDelete.bind(this);

        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                orgName: '',
                orgId: '',
                state: '',
                currentPage: 1,
                pageSize: env.defaultPageSize,
                //sortField: '',
                //sortOrder: '',
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            last_depth_list: [],
            UserSelecteds: [],
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'dic_OrgType']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
        this.getConditionData();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [{
        title: '机构名称',
        width: 180,//可预知的数据长度，请设定固定宽度
        dataIndex: 'orgName',
        fixed: 'left',
        className:'textLeft',
        //自定义显示
        render: (text, record, index) => {
            record.state = String(record.state);
            record.orgType = String(record.orgType);
            return <a className="textLeft" onClick={() => { this.onLookView('View', record) }}>{record.orgName}</a>
        }
    },
    {
        title: '机构代码',
        dataIndex: 'orgCode',
    },
    {
        title: '机构类型',
        dataIndex: 'orgType',
        //自定义显示
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_OrgType, record.orgType)
        }
    },
    {
        title: '所在行政区号',
        dataIndex: 'areaCode'
    },
    {
        title: '状态',
        dataIndex: 'state',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.state);
        }
    },
    {
        title: '负责人',
        dataIndex: 'chargeMan',
    },
    {
        title: '移动电话',
        dataIndex: 'mobile',
        // className: 'column-number'
    },
    {
        title: '超级管理员',
        dataIndex: 'superAdmin',
    },
    {
        title: '工号',
        dataIndex: 'loginName',
    },
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
                    this.onLookView('Edit', record)
                }}>编辑</Button>
                <Button onClick={() => {
                    this.onLookView('Power', record)
                }}>超级管理员</Button>
                {/*record.orgType == 3 && <Button onClick={() => { this.onLookView('University', record) }}>高校</Button>*/}
            </DropDownButton>
        ),
    }];
    //获取条件列表
    getConditionData() {
        this.props.getLastDepthList().payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(a => {
                    if (a.orgType == 2) {
                        list.push({ title: a.orgName, value: `${a.orgId}` });
                    };
                });
                this.setState({ last_depth_list: list })
            }
            else {
                message.error(data.message);
            }
        })
    };
    //搜索条件
    getFields() {
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;

        const children = [];
        children.push(
            <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="大区"

                >
                    {getFieldDecorator('orgId', { initialValue: '' })(
                        <Select
                            showSearch={true}
                            filterOption={(inputValue, option) => {
                                return (option.props.children.indexOf(inputValue) != -1);
                            }}
                        >
                            <Option value="">全部</Option>
                            {this.state.last_depth_list.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        /*children.push(
            <Col span={8}>
                <FormItem {...searchFormItemLayout} label={'机构名称'} >
                    {getFieldDecorator('orgName', { initialValue: '' })(
                        <Input placeholder="机构名称" />
                    )}
                </FormItem>
            </Col>
        );*/
        children.push(
            <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="状态"

                >
                    {getFieldDecorator('state', { initialValue: '' })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_Status.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        )
        return children;
    }

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getOrgList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(a => {
                    if (a.orgType == 2 || a.orgType == 3) {
                        a.key = a.orgId;
                        list.push(a);
                    };
                });
                var data_list = transformListToTree(list);
                condition.currentPage = data.currentPage;
                this.setState({
                    pagingSearch: condition,
                    data_list: data_list,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    }
    fetchBranchList = (orgId) => {
        this.setState({ loading: true });
        this.props.orgBranchListByParentId(orgId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = this.state.data_list;
                var parent = list.filter(org => {
                    return org.orgId == orgId
                });
                if (parent) {
                    parent[0].fetched = true;
                }
                if (data.data.length) {
                    data.data.map(a => {
                        if (a.orgType == 3) {
                            a.key = a.orgId;
                            list.push(a);
                        };
                    });
                    var data_list = transformListToTree(list);
                    this.setState({
                        data_list: data_list,
                        loading: false
                    })
                } else {
                    this.setState({
                        loading: false
                    })
                }
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        //const pager = this.state.pagingSearch;
        //pager.page = pagination.current;
        //this.setState({ pagination: pager });
        //this.fetch({
        //results: pagination.pageSize,
        //page: pagination.page,
        //sortField: sorter.field,
        //sortOrder: sorter.order,
        //...filters,
        //});
    }
    rowOnExpand = (isExpand, record) => {
        if (isExpand) {
            //record.orgId
            var lst = this.state.data_list.filter(org => {
                return org.orgId == record.orgId;
            });
            if (lst && lst[0].children.length) {
                //已查到子机构了
            } else {
                var parent = this.state.data_list.filter(org => {
                    return org.orgId == record.orgId
                });
                if (parent && parent[0].fetched) {
                    //已查询过了
                } else {
                    this.fetchBranchList(record.orgId);
                }
            }
        }
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
        if(dataModel == 'search'){ 
            this.onLookView("Manage", null);
            this.onSearch();
            return 
        } 
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit": //提交
                    if (dataModel.orgType == 2) {
                        delete dataModel.parentOrgid;
                    }
                    this.props.saveOrgInfo(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            if (dataModel.orgId) {
                                message.success("修改成功")
                            } else {
                                message.success("新增成功")
                            }
                            this.onSearch();
                            if (dataModel.orgType == 2) {
                                this.getConditionData();
                            }
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Delete":
                    //提交
                    this.props.deleteOrgInfo(this.state.currentDataModel.orgId).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            if (dataModel.orgType == 2) {
                                this.getConditionData();
                            }
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Power":
                    //提交
                    this.props.setOrgAdminInfo(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
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
    onBatchDelete = () => {
        var that = this;
        Modal.confirm({
            title: '是否删除所选机构?',
            content: '点击确认删除所选机构!否则点击取消！',
            onOk: () => {
                that.props.deleteOrgInfo(that.state.UserSelecteds.join(',')).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        that.setState({ UserSelecteds: [] })
                        that.onSearch();
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Power":
                block_content = <NewInfo viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <OrgView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'University':
                block_content = <OrgUniversityManage viewCallback={this.onViewCallback} orgId={this.state.currentDataModel.orgId} orgName={this.state.currentDataModel.orgName} />
                break;
            case "Manage":
            default:
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        //disabled: record.name === 'Disabled User', // Column configuration not to be checked
                        name: record.orgName,
                    }),
                }

                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { ...model, orgType: 2 }) }} icon="plus" className="button_dark">大区</Button>);
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { ...model, orgType: 3 }) }} icon="plus" className="button_dark">分部</Button>);
                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form" >
                                    <Row justify="center" align="middle" type="flex">
                                        {this.getFields()}
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                        {/* 内容分割线 */}
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.data_list}//数据
                                //onChange={this.handleTableChange}
                                onExpand={this.rowOnExpand}
                                bordered
                                scroll={{ x: 1300 }}
                                //rowSelection={rowSelection}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={6}>
                                        {/*this.state.UserSelecteds.length > 0 ?
                                            <Button onClick={this.onBatchDelete} icon="delete">删除</Button> :
                                            <Button disabled icon="delete">删除</Button>
                                        */}
                                    </Col>
                                    <Col span={18} className={'search-paging-control'}>
                                        <Pagination showSizeChanger
                                            current={this.state.pagingSearch.currentPage}
                                            defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                            pageSize={this.state.pagingSearch.pageSize}
                                            onShowSizeChange={this.onShowSizeChange}
                                            onChange={this.onPageIndexChange}
                                            showTotal={(total) => { return `共${total}条数据`; }}
                                            total={this.state.totalRecord} />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(OrgManage);

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
        getOrgList: bindActionCreators(getOrgList, dispatch),
        getLastDepthList: bindActionCreators(getLastDepthList, dispatch),
        saveOrgInfo: bindActionCreators(saveOrgInfo, dispatch),
        deleteOrgInfo: bindActionCreators(deleteOrgInfo, dispatch),
        setOrgAdminInfo: bindActionCreators(setOrgAdminInfo, dispatch),
        orgBranchListByParentId: bindActionCreators(orgBranchListByParentId, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
