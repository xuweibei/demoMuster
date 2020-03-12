//（总部） 转班财务确认 查询审核列表 
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
import moment from 'moment';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

//import ChangeDetailInfo from './changeDetailInfoIndex'
//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney,formatMoment } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getCourseStudentMoveAuditList, getCheckStudentChange, courseStudentMoveAudit } from '@/actions/course';
import SelectItem from '@/components/BizSelect/SelectItem';
//操作按钮
import DropDownButton from '@/components/DropDownButton';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

//业务数据视图（增、删、改、查)
import CourseStudentMoveAuditManageView from './view'

class CourseStudentMoveAuditManage extends React.Component {

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
                status:'',
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
        this.loadBizDictionary(['student_change_status']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
    }


    //table 输出列定义
    columns = [{
        title: '转班日期',
        dataIndex: 'createDate',
        fixed: 'left',
        width: 120,
        render: text => <span>{timestampToTime(text)}</span>
    },

    {
        title: '转出订单学生',
        dataIndex: 'oldStudentName',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('oldViewStudentDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '转出订单号',
        dataIndex: 'oldOrderSn',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('oldViewOrderDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '转入订单学生',
        dataIndex: 'newStudentName',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('newViewStudentDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '转入订单号',
        dataIndex: 'newOrderSn',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('newViewOrderDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '转出费用（¥）',
        dataIndex: 'changeAmount',
        render: (text, record, index) => {
            return formatMoney(record.changeAmount);
        }
    },
    {
        title: '审核状态',
        dataIndex: 'statusName',
    },
    {
        title: '审核人',
        dataIndex: 'auditUserName',
    },
    {
        title: '审核日期',
        dataIndex: 'auditDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '操作',
        width: 120,//可预知的数据长度，请设定固定宽度
        fixed: 'right',
        key: 'action',
        render: (text, record) => {
            return <DropDownButton>
                {record.status != 1 && <Button onClick={() => {
                    this.onLookView('View', record)
                }}>查看</Button>
                }
                {record.status == 1 && <Button onClick={() => {
                    this.props.getCheckStudentChange({ studentChangeId: record.studentChangeId }).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error('此转班申请发生了费用变更，系统自动审核不通过。');
                            this.onSearch();
                        }
                        else {
                            this.onLookView('Audit', record);
                        }
                    })

                }}>审核</Button>

                }
            </DropDownButton>
        }
    }];
    //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let timeStart = condition.timeStart;
        if(timeStart){
            condition.timeStart = formatMoment(timeStart[0])
            condition.timeEnd = formatMoment(timeStart[1])
        }
        this.props.getCourseStudentMoveAuditList(condition).payload.promise.then((response) => {
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
                case "Audit": //提交
                    this.props.courseStudentMoveAudit(dataModel).payload.promise.then((response) => {
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

    onDelete = (studentChangeId) => {
        Modal.confirm({
            title: '是否删除所选转班申请数据吗?',
            content: '请确认',
            onOk: () => {
                this.props.deleteCourseStudentMoveManager({ studentChangeId: studentChangeId }).payload.promise.then((response) => {
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
            case 'oldViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.oldStudentId} />
                break;
            case 'newViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.newStudentId} />
                break;
            case 'oldViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.oldStudentId}
                    orderId={this.state.currentDataModel.oldOrderId}
                    tab={3}
                />
                break;
            case 'newViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.newStudentId}
                    orderId={this.state.currentDataModel.newOrderId}
                    tab={3}
                />
                break;
            case "Audit":
            case "View":
                block_content = <CourseStudentMoveAuditManageView viewCallback={this.onViewCallback}
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
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="审核状态">
                                                {getFieldDecorator('status', {
                                                    initialValue: this.state.pagingSearch.status,
                                                })(
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.student_change_status.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="转班日期">
                                                {getFieldDecorator('timeStart', { initialValue: this.state.pagingSearch.timeStart?[moment(this.state.pagingSearch.timeStart,dateFormat),moment(this.state.pagingSearch.timeEnd,dateFormat)]:[] })(
                                                    <RangePicker style={{width:220}}/>
                                                )}
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="转出订单学生姓名">
                                                {getFieldDecorator('studentName', {
                                                    initialValue: this.state.pagingSearch.studentName,
                                                })(
                                                    <Input />
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout24} label="审核人">
                                                {getFieldDecorator('auditUserName', {
                                                    initialValue: this.state.pagingSearch.auditUserName,
                                                })(
                                                    <Input />
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
                                rowKey={record => record.partnerContractId}//主键
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
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseStudentMoveAuditManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getCourseStudentMoveAuditList: bindActionCreators(getCourseStudentMoveAuditList, dispatch),
        getCheckStudentChange: bindActionCreators(getCheckStudentChange, dispatch),
        courseStudentMoveAudit: bindActionCreators(courseStudentMoveAudit, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
