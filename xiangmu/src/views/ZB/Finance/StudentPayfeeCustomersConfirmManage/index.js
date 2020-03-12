/**
 * （分部）大客户收费订单学费导入查询
 * 2018-5-30
 * suicaijiao
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
    Pagination, Divider, Modal, Card,
    Checkbox,
} from 'antd';
import { env } from '@/api/env';
import SelectArea from '@/components/BizSelect/SelectArea'
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'
import ContentBox from '@/components/ContentBox';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import FileDownloader from '@/components/FileDownloader';
import moment from 'moment';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout,searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';


//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getStudentPayfeeCustomersConfirmList, studentPayfeeCustomersConfirmBatchConfirm } from '@/actions/finance';
import SelectItem from '@/components/BizSelect/SelectItem';

import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';


class StudentPayfeeCustomersConfirmManage extends React.Component {

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
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: env.defaultPageSize,
                importStart:'',
                importEnd:''
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };
    }
    componentWillMount() {
        //载入需要的字典项: 审核状态
        this.loadBizDictionary(['payee_type', 'order_status', 'confirm_status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }


    //table 输出列定义
    columns = [{
        title: '订单分部',
        dataIndex: 'branchName',
        fixed: 'left',
        width: 100
    },

    {
        title: '订单号',
        dataIndex: 'orderSn',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '学生姓名',
        dataIndex: 'studentName',
    },
    {
        title: '收费方',
        dataIndex: 'payeeType',
        render: text => <span>{getDictionaryTitle(this.state.payee_type, text)}</span>

    },
    {
        title: '订单金额（¥）',
        dataIndex: 'totalAmount',
        render: (text, record, index) => {
            return formatMoney(record.totalAmount);
        }
    },
    {
        title: '订单状态',
        dataIndex: 'orderStatus',
        render: text => <span>{getDictionaryTitle(this.state.order_status, text)}</span>
    },
    {
        title: '缴费期数',
        dataIndex: 'term',
        render: text => <span>第{text}期</span>

    },
    {
        title: '缴费金额(¥)',
        dataIndex: 'money',
        render: (text, record, index) => {
            return formatMoney(record.money);
        }
    },
    {
        title: '导入日期',
        dataIndex: 'importDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '财务确认状态',
        dataIndex: 'financeStatus',
        render: text => <span>{getDictionaryTitle(this.state.confirm_status, text)}</span>
    },
    {
        title: '财务确认人',
        dataIndex: 'financeUName',
    },
    {
        title: '确认日期',
        dataIndex: 'confirmDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    ];
    //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let importStart = condition.importStart;
        if(importStart){
            condition.importStart = importStart[0];
            condition.importEnd = importStart[1];
        }
        this.props.getStudentPayfeeCustomersConfirmList(condition).payload.promise.then((response) => {
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
                case "Edit": //提交
            }
        }
    }

    onConfirm = () => {
        this.props.studentPayfeeCustomersConfirmBatchConfirm({ studentPayfeeIds: this.state.UserSelecteds.join(',') }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                message.success('批量确认成功！');
                //刷新数据
                this.onSearch();
            }
        })
    }

    render() {
        
       
        let block_content = <div></div>
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: record.financeStatus != 1,    // Column configuration not to be checked 
            }),
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        switch (this.state.editMode) {
            case 'ViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.studentId}
                    orderId={this.state.currentDataModel.orderId}
                    tab={3}
                />
                break;
            default :
            block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            <Form className="search-form" >
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="订单分部">
                                            {getFieldDecorator('branchId', {
                                                initialValue: '',
                                            })(
                                                <SelectFBOrg scope={'my'} hideAll={false} />
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="大客户">
                                            {getFieldDecorator('partnerId', {
                                                initialValue: ''
                                            })(
                                                <SelectPartnerOrg scope={'my'} hideAll={false} />
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="订单状态">
                                            {getFieldDecorator('financeStatus', {
                                                initialValue: ''
                                            })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.confirm_status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                                )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="收费方">
                                            {getFieldDecorator('payeeType', {
                                                initialValue: ''
                                            })(
                                                <Select >
                                                    <Option value="">全部</Option>
                                                    {this.state.payee_type.map((item, index) => {
                                                        if (item.value == 3 || item.value == 4) {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        }

                                                    })}
                                                </Select>
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="学生姓名">
                                            {getFieldDecorator('realName', {
                                                initialValue: ''
                                            })(
                                                <Input />
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="订单号">
                                            {getFieldDecorator('orderSn', {
                                                initialValue: ''
                                            })(
                                                <Input />
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="导入日期">
                                            {getFieldDecorator('importStart', { initialValue: this.state.pagingSearch.importStart?[moment(this.state.pagingSearch.importStart,dateFormat),moment(this.state.pagingSearch.importEnd,dateFormat)]:[] })(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}></Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="财务确认人">
                                            {getFieldDecorator('financeUName', {
                                                initialValue: ''
                                            })(
                                                <Input />
                                                )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        </ContentBox>
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.data_list}//数据
                                rowSelection={rowSelection}
                                bordered
                                rowKey={record => record.studentPayfeeId}//主键
                                scroll={{ x: 1300 }}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={10}>
                                        <div className='flex-row'>
                                            {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onConfirm} icon="edit">批量确认</Button> : <Button disabled icon="edit">批量确认</Button>}
                                        </div>
                                    </Col>
                                    <Col span={14} className={'search-paging-control'}>
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
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentPayfeeCustomersConfirmManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getStudentPayfeeCustomersConfirmList: bindActionCreators(getStudentPayfeeCustomersConfirmList, dispatch),
        studentPayfeeCustomersConfirmBatchConfirm: bindActionCreators(studentPayfeeCustomersConfirmBatchConfirm, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
