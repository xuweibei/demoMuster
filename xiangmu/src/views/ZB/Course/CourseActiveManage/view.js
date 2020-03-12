/**
 * 总部-学服学务-网络课程管理-激活管理-修改记录 
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

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getCourseActiveOperationSelectLogList } from '@/actions/course';
import SelectItem from '@/components/BizSelect/SelectItem';

class CourseActiveManageView extends React.Component {
    constructor(props) {
        super(props)
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
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: {
                currentPage: 1,
                pageSize: env.defaultPageSize,
                courseActiveId:props.currentDataModel.courseActiveId
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };
        this.index_last = 0;
    }
    componentWillMount() {
        //载入需要的字典项: 审核状态
        this.loadBizDictionary(['dic_YesNo', 'payee_type']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [{
        title: '序号',
        dataIndex: '',
        width: 50,
        render: (text, record, index) => {
            return <span>{index+1}</span>
        }
    },
    {
        title: '操作人',
        width: 80,
        dataIndex: 'createUName',

    },
    {
        title: '操作时间',
        width: 100,
        dataIndex: 'createDate',
        render: this.renderContent,
        render: text => <span>{timestampToTime(text)}</span>

    },
    {
        title: '操作类型',
        width: 100,
        dataIndex: 'logTypeName',

    },
    {
        title: '备注',
        dataIndex: 'text',
    },

    ];
    //获取条件列表
    fetch(params) {
        console.log(this.props.currentDataModel);
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getCourseActiveOperationSelectLogList(condition).payload.promise.then((response) => {
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

        block_content = (
            <div>
                <div>
                    <Form className="" >
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="项目">
                                    <span>{this.props.currentDataModel.orderSn}</span>
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="商品名称">
                                    <span>{this.props.currentDataModel.courseProductName}</span>
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="课程名称">
                                    <span>{this.props.currentDataModel.courseName}</span>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>

                </div>
               
                <div className="search-result-list">
                    <Table columns={this.columns} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data_list}//数据
                        bordered
                        rowKey={record => record.studentChangeId}//主键
                        scroll={{ x: 130 }}
                    />
                    <div className="space-default"></div>
                    <div className="search-paging">
                        <Row justify="space-between" align="middle" type="flex">
                            <Col span={10}>
                                <div className='flex-row'>
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
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseActiveManageView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getCourseActiveOperationSelectLogList: bindActionCreators(getCourseActiveOperationSelectLogList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
