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
import ContentBox from '@/components/ContentBox';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import FileDownloader from '@/components/FileDownloader';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import moment from 'moment';
import DropDownButton from '@/components/DropDownButton';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

import CourseArrangeDetailEdit from './view';
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
import { getStudentPayfeeCustomersList } from '@/actions/finance';
import SelectItem from '@/components/BizSelect/SelectItem';


class StudentPayfeeCustomers extends React.Component {

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
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            startValue: null,
            endValue: null,
            endOpen: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项: 审核状态
        this.loadBizDictionary(['payee_type', 'order_status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }


    //table 输出列定义
    columns = [{
        title: '学生姓名',
        dataIndex: 'studentName',
        fixed: 'left', 
        width:'130'
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
        title: '大客户名称',
        dataIndex: 'partnerName',
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
        title: '订单缴费分期数',
        dataIndex: 'terms',
        render: text => <span>第{text}期</span>

    },
    {
        title: '订单状态',
        dataIndex: 'orderStatus',
        render: text => <span>{getDictionaryTitle(this.state.order_status, text)}</span>
    },
    {
        title: '缴费期数',
        dataIndex: 'term',
    },
    {
        title: '缴费金额(¥)',
        dataIndex: 'money',
        render: (text, record, index) => {
            return formatMoney(record.money);
        }
    },
    {   
        title: '缴费日期',
        width: 120,
        dataIndex: 'payDate',
        render: (text,record) => <span>{timestampToTime(record.payDate)}</span>
    },
    {
        title: '导入日期', 
        width: 120,
        dataIndex: 'importDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '操作',
        fixed: 'right',
        width: 120,
        render: (text, record) => (
            //编辑  缴费  废弃 查看
            //订单状态：0暂存;1审核中;2待缴费;3审核不通过;4部分缴费;5已完成;6废弃
            <DropDownButton> 
                <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
              </DropDownButton>
        )
    }

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
        this.props.getStudentPayfeeCustomersList(condition).payload.promise.then((response) => {
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

    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }
  
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }
    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }
  
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
  
    onStartChange = (value) => {
        this.onChange('startValue', value);
    }
  
    onEndChange = (value) => {
        this.onChange('endValue', value);
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
                case "Edit": //提交
                default:
                console.log(123)
                this.onSearch();
                this.onLookView("Manage", null);
                break;
            }
        }
    }

    render() {
        let block_content = <div></div>
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<FileDownloader
            apiUrl={'/edu/studentPayfeeCustomers/exportCustomers'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出'}
        >
        </FileDownloader>);
        switch (this.state.editMode) {
            case 'Edit':
              block_content = <CourseArrangeDetailEdit
                id={this.state.currentDataModel.courseArrangeDetailId}
                editMode={this.state.editMode}
                viewCallback={this.onViewCallback}
                {...this.state}
              />
              break;
            case 'ViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.studentId}
                    orderId={this.state.currentDataModel.orderId}
                    tab={3}
                />
                break;
            default:
                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                          
                        {!this.state.seachOptionsCollapsed &&
                            <Form className="search-form" >
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="订单区域">
                                            {getFieldDecorator('benefitRegionId', {
                                                initialValue: '',
                                            })(
                                                <SelectArea scope={'my'} hideAll={false} />
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
                                            {getFieldDecorator('orderStatus', {
                                                initialValue: ''
                                            })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.order_status.map((item, index) => {
                                                        if (item.value == 4 || item.value == 5) {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        }

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
                                                <Input placeholder='请输入学生姓名'/>
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="订单号">
                                            {getFieldDecorator('orderSn', {
                                                initialValue: ''
                                            })(
                                                <Input placeholder='请输入订单号'/>
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="导入日期">
                                            {getFieldDecorator('importStart', { initialValue:this.state.pagingSearch.importStart?[moment(this.state.pagingSearch.importStart,dateFormat),moment(this.state.pagingSearch.importEnd,dateFormat)]:[]})(
                                                <RangePicker
                                                disabledDate={this.disabledStartDate}
                                                format={dateFormat}
                                                onChange={this.onStartChange}
                                                onOpenChange={this.handleStartOpenChange}
                                                style={{width:220}}  
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        }
                        </ContentBox>
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.data_list}//数据
                                bordered
                                rowKey={record => record.orderId}//主键
                                scroll={{ x: 1300 }}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={10}>

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
const WrappedManage = Form.create()(StudentPayfeeCustomers);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getStudentPayfeeCustomersList: bindActionCreators(getStudentPayfeeCustomersList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
