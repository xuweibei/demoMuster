/**
 * （分部）退学查看
 * 2018-06-03
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
import FileDownloader from '@/components/FileDownloader';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
//操作按钮
import DropDownButton from '@/components/DropDownButton';

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney,formatMoment } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

import moment from 'moment';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { RefundAndWithdrawalEnquiry, deleteCourseStudentRefundManager } from '@/actions/course';
import SelectItem from '@/components/BizSelect/SelectItem';
import ChangeDetailInfo from '../CourseStudentRefundManager/changeDetailInfoIndex'
//业务数据视图（增、删、改、查)
import CourseStudentRefundManagerView from '../CourseStudentRefundManager/view'
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
class CourseStudentLeaveManager extends React.Component {

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
                financeStatus: '',//财务确认状态
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
        this.loadBizDictionary(['student_change_refund_status_front', 'student_change_type','confirm_status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }


    //table 输出列定义
    columns = [{
        title: '区域',
        dataIndex: 'regionIdName',
        fixed: 'left',
        width: 150
    },

    {
        title: '申请类型',
        dataIndex: 'createDate',
        render: (text,record)=>{
            return record.changeType == 3?'退费':record.changeType == 2?'退学':''
        }
    },
    {
        title: '申请日期',
        dataIndex: 'createDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '学生姓名',
        dataIndex: 'oldStudentName',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '订单号',
        dataIndex: 'oldOrderSn',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '订单实际金额（¥）',
        dataIndex: 'oldOrderActualMoney',
        render: (text, record, index) => {
            return formatMoney(record.oldOrderActualMoney);
        }
    },
    {
        title: '已缴费金额（¥）',
        dataIndex: 'oldAlreadyPaid',
        render: (text, record, index) => {
            return formatMoney(record.oldAlreadyPaid);
        }
    }, 
    {
        title: '申请退费金额（¥）',
        dataIndex: 'changeAmount',
        render: (text, record, index) => {
            return formatMoney(record.changeAmount);
        }
    },
    {
        title: '审核状态',
        dataIndex: 'auditStatusName',
    },
    {
        title: '创建人',
        dataIndex: 'createName',
    },
    {
        title: '审核日期',
        dataIndex: 'auditDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '财务确认',
        dataIndex: 'financeStatus',
        render: (text,record)=>{ 
            console.log(text)
            return record.auditStatusName == '审核通过'? getDictionaryTitle(this.state.confirm_status,text):'--'
        } 
    },
    {
        title: '确认日期',
        dataIndex: 'confirmDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '操作',
        width: 120,//可预知的数据长度，请设定固定宽度
        fixed: 'right',
        key: 'action',
        render: (text, record) => {
            return <DropDownButton>
                <Button onClick={() => {
                    this.onLookView('View', record)
                }}>查看</Button>
                {record.status == 1 && <Button onClick={() => {
                    this.onDelete(record.studentChangeId)
                }}>删除</Button>

                }
            </DropDownButton>
        }
    }];
    //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let timeStart = condition.timeStart;
        let confirmDateStart = condition.confirmDateStart;
        if(timeStart){
            condition.timeStart = formatMoment(timeStart[0])
            condition.timeEnd = formatMoment(timeStart[1])
        }
        if(confirmDateStart){
            condition.confirmDateStart = formatMoment(confirmDateStart[0])
            condition.confirmDateEnd = formatMoment(confirmDateStart[1])
        }
        this.props.RefundAndWithdrawalEnquiry(condition).payload.promise.then((response) => {
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
        console.log(endValue)
        console.log(startValue)
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
            }
        }
    }

    onDelete = (studentChangeId) => {
        Modal.confirm({
            title: '是否删除所选退费退学数据吗?',
            content: '请确认',
            onOk: () => {
                this.props.deleteCourseStudentRefundManager({ studentChangeId: studentChangeId }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        message.success('删除成功');
                        this.setState({ UserSelecteds: [] })
                        this.onSearch();
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        })
    }

    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case 'ViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.oldStudentId} />
                break;
            case 'ViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.oldStudentId}
                    orderId={this.state.currentDataModel.oldOrderId}
                    tab={3}
                />
                break;
            case "Create":
            case "Edit":
            case "View":
                block_content = <CourseStudentRefundManagerView viewCallback={this.onViewCallback}

                    {...this.state}
                />
                break;
            case "Manage":
            default:
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                }
                const { getFieldDecorator } = this.props.form;
                let extendButtons = [];

                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form" >
                                    <Row justify="center" gutter={24} align="middle" type="flex">
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="区域">
                                                {getFieldDecorator('regionId', {
                                                    initialValue: '',
                                                })(
                                                    <SelectArea scope={'my'} hideAll={false} />
                                                    )}
                                            </FormItem>
                                        </Col>

                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="申请类型">
                                                {getFieldDecorator('changeType', {
                                                    initialValue: ''
                                                })(
                                                    <Select >
                                                        <Option value="">全部</Option> 
                                                        <Option value="3">退费</Option> 
                                                        <Option value="2">退学</Option> 
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="审核状态">
                                                {getFieldDecorator('status', {
                                                    initialValue: ''
                                                })(
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.student_change_refund_status_front.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="学生姓名">
                                                {getFieldDecorator('studentName', {
                                                    initialValue: ''
                                                })(
                                                    <Input placeholder='请输入学生姓名' />
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="学生手机号">
                                                {getFieldDecorator('mobile', {
                                                    initialValue: this.state.pagingSearch.mobile,
                                                })(
                                                    <Input placeholder='学生手机号'/>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="订单编号">
                                                {getFieldDecorator('orderSn', {
                                                    initialValue: this.state.pagingSearch.orderSn,
                                                })(
                                                    <Input  placeholder='订单编号'/>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="财务确认">
                                                {getFieldDecorator('financeStatus', {
                                                    initialValue: this.state.pagingSearch.financeStatus,
                                                })(
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.confirm_status.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="申请日期">
                                                {getFieldDecorator('timeStart', { initialValue:this.state.pagingSearch.timeStart?[moment(this.state.pagingSearch.timeStart,dateFormat),moment(this.state.pagingSearch.timeEnd,dateFormat)]:[]})(
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
                                        <Col span={8}></Col>
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="财务确认日期">
                                                {getFieldDecorator('confirmDateStart', { initialValue:this.state.pagingSearch.confirmDateStart?[moment(this.state.pagingSearch.confirmDateStart,dateFormat),moment(this.state.pagingSearch.confirmDateEnd,dateFormat)]:[]})(
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
                                        <Col span={8}></Col>
                                        <Col span={8}></Col>
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
                                rowKey={record => record.partnerContractId}//主键
                                scroll={{ x: 1500 }}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={10}>

                                    </Col>
                                    <Col span={14} className={'search-paging-control'}>
                                        <Pagination showSizeChanger
                                            current={this.state.pagingSearch.currentPage}
                                            defaultPageSize={this.state.pagingSearch.pageSize}      
                                            pageSizeOptions = {['10','20','30','50','100','200']}
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
const WrappedManage = Form.create()(CourseStudentLeaveManager);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        RefundAndWithdrawalEnquiry: bindActionCreators(RefundAndWithdrawalEnquiry, dispatch),
        deleteCourseStudentRefundManager: bindActionCreators(deleteCourseStudentRefundManager, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
