//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Divider, Modal, DatePicker } from 'antd';
const FormItem = Form.Item;
const {  RangePicker } = DatePicker;
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoment } from '@/utils';

//业务接口方法引入
import { returnVisitGetByPage, returnVisitAdd, returnVisitUpd, returnVisitDel } from '@/actions/stuService';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';

import ReturnVisitTaskView from './view';

class ReturnVisitTaskManage extends React.Component {
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
                itemId: '',
                currentPage: 1,
                pageSize: 10,
                state: ''
            },
            data: [],
            loading: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status','dic_YesNo']);

        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
            title: '项目',
            width:150,
            fixed:'left',
            dataIndex: 'itemName',
        },
        {
            title: '任务名称',
            width:200,
            dataIndex: 'returnVisitTaskName'
        },
        {
            title: '回访要点',
            dataIndex: 'remark'
        },

        {
            title: '任务开始日期',
            width:120,
            dataIndex: 'startTime',
            render: (text, record, index) => {
                return timestampToTime(record.startTime, false);
            }
        },
        {
            title: '截止日期',
            width:120,
            dataIndex: 'endTime',
            render: (text, record, index) => {
                return timestampToTime(record.endTime, false);
            }
        },
        {
            title: '已回访数',
            width:100,
            dataIndex: 'visitCount'
        },
        {
            title: '状态',
            width:80,
            dataIndex: 'state',
            render: (text, record, index) => {
                return record.state == 1 ? '启用' : '停用';
            }
        },
        {
            title: '创建人',
            width:120,
            dataIndex: 'createUid'
        },
        {
            title: '创建日期',
            width:120,
            dataIndex: 'createDate',
            render: (text, record, index) => {
                return timestampToTime(record.createDate, false);
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                     <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                     {
                         record.visitCount == 0 && <Button onClick={() => { this.onDeltet(record.returnVisitTaskId) }}>删除</Button>
                     }
                </DropDownButton>
            }
        },

    ];

    onDeltet = (returnVisitTaskId) => {
        Modal.confirm({
            title: '是否删除所选回访任务?',
            content: '点击确认删除所选回访任务!否则点击取消！',
            onOk: () => {
                let params = { returnVisitTaskId: returnVisitTaskId }
                this.props.returnVisitDel(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        this.onSearch();
                    }
                })
            }
        })
    };
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let startTime = condition.startTime;
        if(startTime){
            condition.startTime = formatMoment(startTime[0])
            condition.endTime = formatMoment(startTime[1])
        }
        this.props.returnVisitGetByPage(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
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
                case "Delete":
                    break;
                case "Create":
                    this.props.returnVisitAdd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Edit":
                    this.props.returnVisitUpd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
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



    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
                block_content = <ReturnVisitTaskView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];

                extendButtons.push(<Button onClick={() => { this.onLookView('Create', {}) }
                } icon="plus" className="button_dark" >新增任务</Button>);
                extendButtons.push(
                    <FileDownloader
                      apiUrl={'/edu/returnVisit/export'}//api下载地址
                      method={'post'}//提交方式
                      options={this.state.pagingSearch}//提交参数
                      title={'导出任务'}
                    >
                    </FileDownloader>);

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'项目'} >
                                            {getFieldDecorator('itemId', { initialValue:this.state.pagingSearch.itemId?this.state.pagingSearch.itemId:'' })(
                                                <SelectItem scope={'my'} hideAll={false}
                                                    isFirstSelected={false}
                                                    onSelectChange={(value, selectOptions) => {
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ pagingSearch: this.state.pagingSearch, currentItem: selectOptions }, () => {
                                                            //变更时自动加载数据
                                                            // this.onSearch();
                                                        })
                                                    }} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'状态'} >
                                            {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="任务开始日期"
                                        >
                                            {getFieldDecorator('startTime', { initialValue: this.state.pagingSearch.startTime?[moment(this.state.pagingSearch.startTime,dateFormat),moment(this.state.pagingSearch.endTime,dateFormat)]:[]  })(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="任务名称"
                                        >
                                            {getFieldDecorator('returnVisitTaskName', { initialValue: this.state.pagingSearch.returnVisitTaskName })(
                                                <Input placeholder='请输入任务名称'/>
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
                            scroll={{ x: 1600 }}
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
const WrappedReturnVisitTaskManage = Form.create()(ReturnVisitTaskManage);

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
        returnVisitGetByPage: bindActionCreators(returnVisitGetByPage, dispatch),
        returnVisitAdd: bindActionCreators(returnVisitAdd, dispatch),
        returnVisitDel: bindActionCreators(returnVisitDel, dispatch),
        returnVisitUpd: bindActionCreators(returnVisitUpd, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedReturnVisitTaskManage);
