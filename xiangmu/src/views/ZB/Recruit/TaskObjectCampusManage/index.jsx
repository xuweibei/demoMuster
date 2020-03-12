//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, InputNumber } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoney } from '@/utils';

//业务接口方法引入
import { taskObjectCampusList, taskObjectDQManageAddOrUpdate } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import TaskObjectCampusView from '../TaskObjectCampusView';
import ContentBox from '@/components/ContentBox';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';

class TaskObjectDQManage extends React.Component {

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
                recruitBatchId: '',
                moneyMin: '',
                moneyMax: '',
            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            selectedRows: [],
        };

    }
    componentWillMount() {
        
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
        title: '招生季',
        dataIndex: 'recruitBatchName',
    },
    {
        title: '高校',
        dataIndex: 'universityName'
    },
     {
        title: '任务目标(¥)',
        dataIndex: 'money',
        render: (text, record, index) => (`${formatMoney(record.money)}`)
    },
    {
        title: '最新修改人',
        dataIndex: 'modifyUserName'
    },
    {
        title: '最新修改时间',
        dataIndex: 'modifyDate',
        render: (text, record, index) => {
            return timestampToTime(record.modifyDate);
        }
    },

    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (text, record) => {
            return <div>
                {
                    record.canModify ? <Button onClick={() => { this.onLookView('Edit', record) }}>设置</Button> : '--'
                }
               </div>
        }
    }];




    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;

        if(condition.moneyMin > condition.moneyMax){
            message.error('开始目标金额不能大于截止目标金额！');
            this.setState({ loading: false });
            return;
        }
        this.props.taskObjectCampusList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false });
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false });
                this.setState({ UserSelecteds: [], selectedRows: [] });
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
                case "Edit":
                case "BtchEdit":
                
                    this.props.taskObjectDQManageAddOrUpdate(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.setState({ UserSelecteds: [], selectedRows: [] });
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;

            }
        }
    }
    onBtchEdit = () => {
        this.onLookView('BtchEdit', this.state.selectedRows )
    }

    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "BtchEdit":
            case "View":
                block_content = <TaskObjectCampusView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //表格选择删除后处理
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys });
                        this.setState({ selectedRows: selectedRows });
                    },
                    getCheckboxProps: record => ({
                        disabled: !record.canModify,    // Column configuration not to be checked
                    }),
                };

                //除查询外，其他扩展按钮数组
                let extendButtons = [];

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="招生季">
                                            {getFieldDecorator('recruitBatchId', {
                                            initialValue: this.state.pagingSearch.recruitBatchId
                                            })(
                                            <SelectRecruitBatch hideAll={false} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                                                this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value })
                                                //变更时自动加载数据
                                                this.onSearch();
                                            }} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'高校名称'} >
                                            {getFieldDecorator('universityName', { initialValue: this.state.pagingSearch.universityName })(
                                                <Input placeholder="请输入高校名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="任务目标">
                                            {getFieldDecorator('moneyMin', { initialValue: '' })(
                                                <InputNumber min={0} step={1} style={{width:80}} placeholder='' value={this.state.pagingSearch.moneyMin} />
                                            )}
                                            <span style={{marginLeft:4,marginRight:4}}> 至 </span>
                                            {getFieldDecorator('moneyMax', { initialValue: '' })(
                                                <InputNumber min={0} step={1} style={{width:80}} placeholder='' value={this.state.pagingSearch.moneyMax} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}></Col>
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
                            rowKey={'adminUserId'}
                            rowSelection={rowSelection}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={4}>
                                    {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBtchEdit} icon="tool">批量设置</Button> : <Button disabled icon="tool">批量设置</Button>}
                                </Col>
                                <Col span={20} className='search-paging-control'>
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
const WrappedTaskObjectDQManage = Form.create()(TaskObjectDQManage);

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
        taskObjectCampusList: bindActionCreators(taskObjectCampusList, dispatch),
        taskObjectDQManageAddOrUpdate: bindActionCreators(taskObjectDQManageAddOrUpdate, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTaskObjectDQManage);
