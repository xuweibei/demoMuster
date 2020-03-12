//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table,
    Pagination, Divider, Modal, Card,
    Checkbox,
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import {
    getPartnerList, savePartner, updatePartnerItemList,
    updatePartnerPayeeList, deletePartner
} from '@/actions/partner';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务数据视图（增、删、改、查)
import PartnerView from './view';
import PayeeManage from './payee';
import ItemManage from './item';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';

const model = {
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
    areaCode: '',
    branchId: '',
    branchName: '',
    partnerType: 1
};

class PartnerManage extends React.Component {
    select_timeout: null;
    select_current_value: '';


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

        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                partnerName: '',  //大客户名称
                signState: '',    //签约情况
                recruitState: '', //招生状态
                partnerType: '',  //大客户类型
                itemIds: '',      //合作项目
                branchId: '',     //分部
                currentPage: 1,
                pageSize: env.defaultPageSize,
                hasPayeeType: ''
                //sortField: '',
                //sortOrder: '',
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            dic_item_list: [],    //项目列表
            dic_branch_list: [],  //分部列表
            UserSelecteds: [],
        };
    }
    componentWillMount() {
        //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
        this.loadBizDictionary(['dic_Status', 'signstate', 'partnertype', 'partner_class_type']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [
        {
            title: '大客户名称',
            width: 200,//可预知的数据长度，请设定固定宽度
            dataIndex: 'partnerName',
            fixed: 'left',
            className: 'column-left',
            //自定义显示
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.partnerName}</a>
            }
        },
        {
            title: '大客户类型',
            width: 100,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.partnertype, record.partnerType)
            }
        },
        {
            title: '高校院系',
            //width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'department',
        },
        {
            title: '所属分部',
            dataIndex: 'branchName',
        },
        {
            title: '签约情况',
            //width: 50,
            dataIndex: 'signState',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.signstate, record.signState)
            }
        },
        {
            title: '招生状态',
            //width: 50,
            dataIndex: 'recruitState',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.recruitState)
            }
        },
        {
            title: '合作项目',
            width: 260,
            dataIndex: 'itemNames',
        },
        {
            title: '合作方式',
            dataIndex: 'partnerClassType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.partner_class_type, record.partnerClassType);
            }
        },
        {
            title: '开发负责人',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'devChargeName',
        },
        {
            title: '创建人',
            witdh: 100,
            dataIndex: 'createUName',
        },
        {
            title: '创建日期',
            witdh: 120,
            dataIndex: 'createDate',
            render: (text, record, index) => {
                return timestampToTime(record.createDate);
            }
        },
        {
            title: '操作',
            width: 120,//可预知的数据长度，请设定固定宽度
            fixed: 'right',
            key: 'action',
            render: (text, record) => (
                <DropDownButton>
                    <Button onClick={() => { this.onLookView('PayeeManage', record) }}>收费方</Button>
                </DropDownButton>
            ),
        }
    ];

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.itemIds = condition.itemId;
     
        if(Array.isArray(condition.partnerName)){
            condition.partnerName = (condition.partnerName[0])?(condition.partnerName[0].name):''
        }
        this.props.getPartnerList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(a => {
                    a.key = a.partnerId;
                    list.push(a);
                });
                this.setState({
                    pagingSearch: condition,
                    data_list: list,
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
            this.onSearch();
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit": //提交
                    //delete dataModel.parentOrgid;
                    this.props.savePartner(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result == false || data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            message.success("提交成功");
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "PayeeManage":
                    this.props.updatePartnerPayeeList(dataModel).payload.promise.then(response => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            message.success("提交成功");
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "ItemManage":
                    this.props.updatePartnerItemList(dataModel).payload.promise.then(response => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            message.success("提交成功");
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
        Modal.confirm({
            title: '是否删除所选大客户?',
            content: '点击确认删除所选大客户!否则点击取消！',
            onOk: () => {
                this.props.deletePartner(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.setState({ UserSelecteds: [] })
                        this.onSearch();
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
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <PartnerView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'ItemManage':
                block_content =
                    <ItemManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'PayeeManage':
                block_content =
                    <PayeeManage viewCallback={this.onViewCallback} {...this.state} />
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

                const { getFieldDecorator } = this.props.form;

                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form" >
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="所属分部">
                                                {getFieldDecorator('branchId', {
                                                    initialValue: ''
                                                })(
                                                    <SelectFBOrg scope={'my'} hideAll={false} />
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'大客户名称'} >
                                                {getFieldDecorator('partnerName', { initialValue: '' })(
                                                     <Input placeholder="大客户名称" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="签约情况" >
                                                {getFieldDecorator('signState', { initialValue: '' })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.signstate.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="招生状态" >
                                                {getFieldDecorator('recruitState', { initialValue: '' })(
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
                                            <FormItem {...searchFormItemLayout} label="大客户类型" >
                                                {getFieldDecorator('partnerType', { initialValue: '' })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.partnertype.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="收费方是否设置：" >
                                                    {getFieldDecorator('hasPayeeType', { initialValue: this.state.pagingSearch.hasPayeeType })(
                                                        <Select>
                                                            <Option value="">全部</Option>
                                                            <Option value="1">已设置</Option>
                                                            <Option value="2">未设置</Option>
                                                        </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={24}>
                                            <FormItem
                                                {...searchFormItemLayout24}
                                                style={{ paddingRight: 18 }}

                                                label={'合作项目'} >
                                                {getFieldDecorator('itemId',
                                                    {
                                                        initialValue: ''//this.state.dic_item_ids
                                                    }
                                                )(
                                                    <SelectItem scope='all' hideAll={false} showCheckBox={true} />
                                                    )}
                                            </FormItem>
                                        </Col>
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
                                bordered
                                scroll={{ x: 1800 }}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
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
const WrappedManage = Form.create()(PartnerManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //大客户列表
        getPartnerList: bindActionCreators(getPartnerList, dispatch),
        savePartner: bindActionCreators(savePartner, dispatch),
        deletePartner: bindActionCreators(deletePartner, dispatch),

        updatePartnerItemList: bindActionCreators(updatePartnerItemList, dispatch),
        updatePartnerPayeeList: bindActionCreators(updatePartnerPayeeList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
