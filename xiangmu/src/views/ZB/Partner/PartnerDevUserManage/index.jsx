//用户负责大客户管理

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Button, Table, Pagination
} from 'antd';
import { env } from '@/api/env';

//数据转字典标题
import { getDictionaryTitle } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import SearchForm from '@/components/SearchForm';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getPartnerUserStatList } from '@/actions/partner';

//业务数据视图（增、删、改、查)
import PartnerDevUserIn from './partner_in';

/*const model = {
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
};*/

class PartnerDevUserManage extends React.Component {

    constructor() {
        super();
        (this: any).fetch = this.fetch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.onSearch = onSearch.bind(this);

        this.state = {
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                devChargeName: '',
                partnerName: '',
                currentPage: 1,
                pageSize: env.defaultPageSize,
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
        };
    }
    componentWillMount() {
        //this.fetch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [{
        title: '姓名',
        dataIndex: 'realName',
        fixed:'left',
        width:120,
    },
    {
        title: '工号',
        width:120,
        dataIndex: 'loginName',
    },
    {
        title: '部门',
        dataIndex: 'department',
    },
    {
        title: '电话',
        width:120,
        dataIndex: 'mobile'
    },
    {
        title: '邮箱',
        dataIndex: 'email',
    },
    {
        title: '负责大客户数',
        width:100,
        dataIndex: 'partnerCount',
        render: value => <span>{value || 0}</span>
    },
    {
        title: '操作',
        width: 120,//可预知的数据长度，请设定固定宽度
        fixed: 'right',
        key: 'action',
        render: (text, record) => (
            <Button onClick={() => {
                this.onLookView('Edit', record)
            }}>管理</Button>
        ),
    }];
    //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.devChargeName = condition.devChargeName && condition.devChargeName.replace(/(^\s+)|(\s+$)/g,'');
        condition.partnerName = condition.partnerName && condition.partnerName.replace(/(^\s+)|(\s+$)/g,'');
       
        this.props.getPartnerUserStatList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    };
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            //currentDataModel: item,//编辑对象
            userId: item.userId
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ userId: null, currentDataModel: null, editMode: 'Manage' })
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
            }
        }
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
                block_content = <PartnerDevUserIn viewCallback={this.onViewCallback} userId={this.state.userId} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div>
                        <SearchForm
                            num_column={2}
                            form_item_list={[
                                { type: 'input', name: 'devChargeName', title: '用户姓名', value: this.state.pagingSearch.devChargeName },
                                { type: 'input', name: 'partnerName', title: '大客户', value: this.state.pagingSearch.partnerName },
                            ]}
                            fetch2={(params) => this.fetch(params)}
                        />
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.data_list}//数据
                                // scroll={{x:1300}}
                                bordered
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={6}>
                                    </Col>
                                    <Col span={24} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(PartnerDevUserManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        getPartnerUserStatList: bindActionCreators(getPartnerUserStatList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
