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
import { getBankAccountList, editBankAccount, addBankAccount } from '@/actions/base';
//业务数据视图（增、删、改、查)
import BankAccountView from '../BankAccountView';
import ContentBox from '@/components/ContentBox';



class BankAccountManage extends React.Component {

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
                bankAccountName: '',
                bankAccountNo: '',
                status: '',
                zbPayeeType: '',
            },
            data: [],
            totalRecord: 0,
            loading: false,
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'payee_type', 'pos_account_type']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '公司',
            width: 120,
            fixed: 'left',
            dataIndex: 'zbPayeeType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.pos_account_type, record.zbPayeeType);
            }
        },
        {
            title: '账户名',
            width: 220,
            dataIndex: 'bankAccountName',
        },
        {
            title: '账号',
            width: 300,
            dataIndex: 'bankAccountNo'
        },
        {
            title: '开户行',
            width: 300,
            dataIndex: 'bankName'
        },
        {
            title: '所在省及城市',
            width: 120,
            dataIndex: 'city',
        },
        {
            title: '开户行网点',
            dataIndex: 'bankBranch',
        },
        {
            title: '状态',
            width: 80,
            dataIndex: 'status',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.status);
            }
        },
        {
            title: '账户类型',
            width: 100,
            dataIndex: 'payeeType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.payee_type, record.payeeType);
            }
        },
        {
            title: '相关大客户',
            width: 200,
            dataIndex: 'partnerName',
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (text, record) => (
                <Button onClick={() => { this.onLookView('Edit', { payeeName: getDictionaryTitle(this.state.payee_type, record.payeeType), ...record }) }}>编辑</Button>
            ),
        }];




    //检索数据
    fetch = (params = {}) => {

        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getBankAccountList(condition).payload.promise.then((response) => {
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
                    this.props.addBankAccount(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Edit":
                    this.props.editBankAccount(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {

                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
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
            case "Create":
            case "Edit":
            case "View":
            case 'Create':
            case "Delete":
                block_content = <BankAccountView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:

                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { bankAccountName: '', bankAccountNo: '', status: '' }) }
                } icon="plus" className="button_dark" > 公司账户</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'状态'} >
                                            {getFieldDecorator('status', { initialValue: this.state.pagingSearch.status })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'账户名'} >
                                            {getFieldDecorator('bankAccountName', { initialValue: this.state.pagingSearch.bankAccountName })(
                                                <Input placeholder="请输入账户名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'账号'} >
                                            {getFieldDecorator('bankAccountNo', { initialValue: this.state.pagingSearch.bankAccountNo })(
                                                <Input placeholder="请输入账号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'公司'} >
                                            {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.pos_account_type.map((item, index) => {
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
                            scroll={{ x: 1800 }}
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
const WrappedBankAccountManage = Form.create()(BankAccountManage);

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
        getBankAccountList: bindActionCreators(getBankAccountList, dispatch),
        editBankAccount: bindActionCreators(editBankAccount, dispatch),
        addBankAccount: bindActionCreators(addBankAccount, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedBankAccountManage);
