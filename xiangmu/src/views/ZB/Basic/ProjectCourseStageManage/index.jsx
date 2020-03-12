//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { queryItemStageVosList, addOrEditItemStage, delItemStage } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';


import ProjectCourseStageView from '../ProjectCourseStageView';

class ProjectCourseStageManage extends React.Component {
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
            title: '项目名称',
            dataIndex: 'itemName',
        },
        {
            title: '课程阶段',
            dataIndex: 'itemStageName'
        },
        {
            title: '是否为结课阶段',
            dataIndex: 'finalMsg'
        },
        {
            title: '状态',
            dataIndex: 'stateMsg'
        },
        {
            title: '创建日期',
            dataIndex: 'createDate',
            render: (text, record, index) => {
                return timestampToTime(record.createDate, false);
            }
        },
        {
            title: '创建人',
            dataIndex: 'creator'
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                     <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                     <Button onClick={() => { this.onDeltet(record.itemStageId,record.itemId) }}>删除</Button>
                </DropDownButton>
            }
        },

    ];

    onDeltet = (itemStageId,itemId) => {
        Modal.confirm({
            title: '是否删除所选项目课程阶段?',
            content: '点击确认删除所选项目课程阶段!否则点击取消！',
            onOk: () => {
                let params = { itemStageId: itemStageId,itemId:itemId }
                this.props.delItemStage(params).payload.promise.then((response) => {
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
        this.props.queryItemStageVosList(condition).payload.promise.then((response) => {
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
                case "Edit":
                    this.props.addOrEditItemStage(dataModel).payload.promise.then((response) => {
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
                block_content = <ProjectCourseStageView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];

                extendButtons.push(<Button onClick={() => { this.onLookView('Create', {}) }
                } icon="plus" className="button_dark" > 新增</Button>);

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'项目'} >
                                            {getFieldDecorator('itemId', { initialValue:this.state.pagingSearch.itemId?this.state.pagingSearch.itemId:'' })(
                                                <SelectItem scope={'my'} hideAll={false}
                                                    isFirstSelected={false}
                                                    onSelectChange={(value, selectOptions) => {
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ pagingSearch: this.state.pagingSearch, currentItem: selectOptions }, () => {
                                                            //变更时自动加载数据
                                                            this.onSearch();
                                                        })
                                                    }} />
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
const WrappedProjectCourseStageManage = Form.create()(ProjectCourseStageManage);

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
        queryItemStageVosList: bindActionCreators(queryItemStageVosList, dispatch),
        delItemStage: bindActionCreators(delItemStage, dispatch),
        addOrEditItemStage: bindActionCreators(addOrEditItemStage, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProjectCourseStageManage);
