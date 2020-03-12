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
    getPartyList, modifyPartner, updatePartnerItemList,
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
import Modification from './Modification';
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
            disabled:true,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                partnerName: '',  //大客户名称
                branchId: '',     //分部
                currentPage: 1,
                pageSize: env.defaultPageSize,
                partnerClassType:'',
                payeeType:'',
                zbPayeeType:'',
                itemIds:''
                //sortField: '',
                //sortOrder: '',
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            dic_item_list: [],    //项目列表
            dic_branch_list: [],  //分部列表
            UserSelecteds: [],
            idSelecteds:[]
        };
    }
    componentWillMount() {
        
        //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
        this.loadBizDictionary(['dic_Status', 'signstate', 'partnertype', 'partner_class_type','payee_type','pos_account_type']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [
        {
            title: '所属分部',
            width: 150,//可预知的数据长度，请设定固定宽度
            dataIndex: 'branchName',
            fixed: 'left',
        },
        {
            title: '大客户名称', 
            dataIndex: 'partnerName',
            width: 200,
            // render: (text, record, index) => {
            //     return getDictionaryTitle(this.state.partnertype, record.partnerType)
            // }
        },
        {
            title: '合作项目',
            //width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'itemName',
        },
        {
            title: '合作方式',
            dataIndex: 'partnerClassType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.partner_class_type, record.partnerClassType);
            }
        },
        {
            title: '收费方',
            //width: 50,
            dataIndex: 'payeeType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.payee_type, record.payeeType)
            }
        },
        {
            title: '签约公司',
            //width: 50,
            dataIndex: 'zbPayeeType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.pos_account_type, record.zbPayeeType)
            }
        },
        {
            title: '最后修改人',
            //width: 150,
            dataIndex: 'createUName',
        },
        {
            title: '最后修改时间',
            //width: 150,
            dataIndex: 'createDate',
            render: (text, record, index) => {
                return timestampToTime(record.createDate)
            }
        },
        {
            title: '操作',
            width: 120,//可预知的数据长度，请设定固定宽度
            fixed: 'right',
            key: 'action',
            render: (text, record) => (
                <DropDownButton>
                    <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                </DropDownButton>
            ),
        }
    ];
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        // condition.itemIds = condition.itemId;
        // condition.partnerName = condition.partnerName && condition.partnerName.replace(/(^\s+)|(\s+$)/g,'');
        
        if(Array.isArray(condition.partnerName)){
            condition.partnerName = (condition.partnerName[0])?(condition.partnerName[0].name):''
        }
        if(Array.isArray(condition.branchId)){
        condition.branchId = condition.branchId[0].id
        }
        this.props.getPartyList(condition).payload.promise.then((response) => {
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
    }

    //浏览视图
    onLookView = (op, item) => {
        console.log(op)
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        this.setState({disabled:true})
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
            this.onSearch();
        }
        else {
            switch (this.state.editMode) {
                case "Edit": //提交
                    //delete dataModel.parentOrgid;
                    this.props.modifyPartner(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        console.log(data)
                        if (data.result == false || data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            message.success("修改成功");
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
            }
        }
    }
    onBatchDelete = () => {
        Modal.confirm({
            title: '是否删除所选大客户?',
            content: '点击确认删除所选大客户!否则点击取消！',
            onOk: () => {
                console.log(this.state.UserSelecteds)
                let condition = [];
                this.state.UserSelecteds.forEach((e,i)=>{
                    condition.push(e.partnerId)
                })
                console.log(condition)
                this.props.deletePartner(condition.join(',')).payload.promise.then((response) => {
                    let data = response.payload.data;
                    console.log(data)
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
        if(this.state.UserSelecteds.length>0){
            this.setState
        }
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Edit":
                block_content = <PartnerView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'Batch':
                block_content = <Modification viewCallback={this.onViewCallback} {...this.state} />
                break
            case 'Create':
            case 'PayeeManage':
                block_content = <PayeeManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            default:
                var rowSelection = {
                    selectedRows: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        console.log(selectedRows)
                        let dis = ''
                        if(selectedRows.length>0){
                            dis = false
                        }else{
                            dis = true
                        }
                        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                        this.setState({ UserSelecteds: selectedRows,idSelecteds:selectedRowKeys,disabled:dis })
                    },
                    getCheckboxProps: record => ({
                        //disabled: record.name === 'Disabled User', // Column configuration not to be checked
                        name: record.orgName,
                    }),
                }

                const { getFieldDecorator } = this.props.form;

                // let extendButtons = [];
                // extendButtons.push(<Button onClick={() => { this.onLookView('Create', { ...model, partnerType: 1 }) }} icon="plus" className="button_dark">高校大客户</Button>);
                // extendButtons.push(<Button onClick={() => { this.onLookView('Create', { ...model, partnerType: 2 }) }} icon="plus" className="button_dark">企业大客户</Button>);
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
                                        <Col span={12}></Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'大客户名称'} >
                                                {getFieldDecorator('partnerName', { initialValue: '' })(
                                                     <Input placeholder="大客户名称" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="合作方式" >
                                                {getFieldDecorator('partnerClassType', { initialValue: '' })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        <Option value='1'>方向班</Option>
                                                        <Option value='2'>精英版</Option>
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="收费方" >
                                                {getFieldDecorator('payeeType', { initialValue: '' })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.payee_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="签约公司" >
                                                {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.pos_account_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={24}>
                                            <FormItem
                                                {...searchFormItemLayout24}
                                                style={{ paddingRight: 18 }}

                                                label={'合作项目'} >
                                                {getFieldDecorator('itemIds',
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
                                scroll={{ x: 1300 }}
                                rowSelection={rowSelection}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={2}>
                                            <Button disabled={this.state.disabled} onClick={()=>{this.onLookView('Batch')} } icon="save">批量修改</Button>
                                    </Col>
                                    {/* <Col span={1}></Col> */}
                                    <Col span={10}>
                                         <Button onClick={()=>{this.onLookView('Create') }} icon="plus">增加</Button>
                                    </Col>
                                    <Col span={10}></Col>
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
        getPartyList: bindActionCreators(getPartyList, dispatch),
        modifyPartner: bindActionCreators(modifyPartner, dispatch),
        deletePartner: bindActionCreators(deletePartner, dispatch),

        updatePartnerItemList: bindActionCreators(updatePartnerItemList, dispatch),
        updatePartnerPayeeList: bindActionCreators(updatePartnerPayeeList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
