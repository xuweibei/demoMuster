//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select,
    Button, Icon, Table, Pagination, Divider,
    InputNumber, DatePicker, Modal
} from 'antd';
const FormItem = Form.Item;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD hh:mm:ss';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoment } from '@/utils';

//业务接口方法引入
import { getStudentAskPList, qryByStudentId, delAsk, addAskP } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import AskFView from '../StudentAskFManage/askFView.jsx';
//import ItemView from '../ItemView';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';


class StudentAskFManage extends React.Component {

    constructor(props) {
        super(props)
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
                askType: 2,//面咨类型
                studentId: props.currentDataModel.studentId,
                studentAskId:'',
            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
        };
    }
    componentWillMount() {
        //载入需要的字典项
        //this.loadBizDictionary(['dic_Status', 'channel', 'sex', 'reg_source', 'grade', 'order_status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '学生姓名',
            fixed: 'left',
            width: 120,
            dataIndex: 'studentName',
        },
        {
            title: '咨询日期',
            dataIndex: 'askDate',
            render: (text, record, index) => {
                return timestampToTime(record.askDate)
            },
        },
        {
            title: '咨询内容',
            dataIndex: 'askContent'
        },
        {
            title: '下次邀约面咨日期',
            dataIndex: 'nextAskDate',
            render: (text, record, index) => {
                return timestampToTime(record.nextAskDate)
            },
        },
        {
            title: '下次邀约面咨内容',
            dataIndex: 'nextAskContent'
        },
        {
            title: '邀约面咨日期',
            dataIndex: 'inviteDate',
            render: (text, record, index) => {
                return timestampToTime(record.inviteDate)
            },
        },
        {
            title: '咨询人',
            fixed:'right',
            width:120,
            dataIndex: 'createUserName'
        }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        // condition.currentPage = condition.currentPage;//修正分页参数 
        // let askDateStart;
        // let askDateEnd;
        // let askDate = condition.askDateStart;
        // if (askDate) {
        //     condition.askDateStart = formatMoment(askDate[0]);
        //     condition.askDateEnd = formatMoment(askDate[1]);
        // }
        this.props.qryByStudentId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = []
                data.data = data.data || []
                data.data.map(item => {
                    item.key = item.studentAskId;
                    list.push(item);
                })
                this.setState({
                    data_list: list,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false, data_list: [] })
                message.error(data.message);
            }
        })
    }
    handleTableChange = (pagination, filters, sorter) => {
        //const pager = this.state.pagingSearch;
        //pager.currentPage = pagination.current;
        //this.setState({ pagination: pager });
        this.fetch({
            results: pagination.pageSize,
            currentPage: pagination.currentPage,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
    }
    //删除
    onBatchDelete = () => {
        //获取学生ids数组
        var studentIdslist = [];
        this.state.UserSelecteds.map(courseArrangeStudentId => {
            studentIdslist.push(courseArrangeStudentId)
        })

        Modal.confirm({
            title: '确认删除?',
            content: '点击确认删除!否则点击取消！',
            onOk: () => {
                this.props.delAsk({ ids: studentIdslist.join(",") }).payload.promise.then((response) => {
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
    onBack = () => {
        this.props.viewCallback();
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

                    dataModel.askDate = formatMoment(dataModel.askDate,dateFormat);
                    // dataModel.inviteDate = formatMoment(dataModel.inviteDate,dateFormat);
                    // dataModel.nextAskDate = formatMoment(dataModel.nextAskDate,dateFormat);
                    this.props.addAskP(dataModel).payload.promise.then((response) => {
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
                case "Edit": //提交
                    this.props.editItem(dataModel).payload.promise.then((response) => {
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
            case "Delete":
                block_content = <AskFView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "ByStudentId":
                block_content = <ByStudentId viewCallback={this.onViewCallback} {...this.state} />
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
                        disabled: record.auditStatus > 0, // Column configuration not to be checked            
                    }),
                }
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => {
                    this.onLookView('Create',
                        { ApplicationID: this.state.defaultApplicationID, Status: 1, itemName: '', Description: '' })
                }} className="button_dark">导入电咨信息</Button>);
                block_content = (<div>
                    {/* 数据表格 */}
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.data_list}//数据
                            onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: 1300 }}
                            rowSelection={rowSelection}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={24}>
                                    <div className='flex-row'>
                                        {this.state.UserSelecteds.length > 0 ?
                                            <Button onClick={this.onBatchDelete} icon='delete'>删除</Button> :
                                            <Button disabled icon='delete'>删除</Button>
                                        }
                                        &nbsp;&nbsp;&nbsp;
                                        <Button onClick={() => {
                                            this.onLookView('Create', { studentId: this.props.currentDataModel.studentId })
                                        }} icon="plus" className="button_dark">新增</Button>
                                        &nbsp;&nbsp;&nbsp;
                                        <Button onClick={this.onBack} icon='rollback'>返回</Button>
                                    </div>
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
const WrappedStudentAskFManage = Form.create()(StudentAskFManage);

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
        qryByStudentId: bindActionCreators(qryByStudentId, dispatch),
        delAsk: bindActionCreators(delAsk, dispatch),
        addAskP: bindActionCreators(addAskP, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentAskFManage);
