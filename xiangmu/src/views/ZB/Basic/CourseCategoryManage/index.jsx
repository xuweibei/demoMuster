//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getCourseCategoryList, addCourseCategory, editCourseCategory } from '@/actions/base';
//业务数据视图（增、删、改、查)
import CourseCategoryView from '../CourseCategoryView';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';
import './index.less';


class CourseCategoryManage extends React.Component {

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
                courseCategoryStatus: '',
                itemId: '',
                name: ''
            },
            data: [],
            dic_Items: [],//项目字典
            totalRecord: 0,
            loading: false
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status','dic_YesNo']);
        // this.fetchItemList()
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '科目标识',
            dataIndex: 'name',
            fixed: 'left',
            width: 180,
        },
        {
            title: '科目名称',
            width: 180,
            dataIndex: 'courseCategoryFullname',
        },

        {
            title: '所属项目',
            width: 150,
            dataIndex: 'item.itemName',
        },
        {
            title: '是否核心科目',
            width: 100,
            dataIndex: 'isMain',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_YesNo, record.isMain);
            }
        },
        {
            title: '科目描述',
            dataIndex: 'metaDescription',
           
        },
        {
            title: '科目关键词',
            dataIndex: 'metaKeywords'
        },

        {
            title: '状态',
            width: 80,
            dataIndex: 'courseCategoryStatus',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.courseCategoryStatus);
            }
        },

        {
            title: '创建日期',
            width: 100,
            dataIndex: 'createDate',
            render: (text, record, index) => {
                return timestampToTime(record.createDate, false);
            }

        },

        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (text, record) => {
                return <DropDownButton>
                    <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                </DropDownButton>
            }
        }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getCourseCategoryList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
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
                case "Create":
                    this.props.addCourseCategory(dataModel).payload.promise.then((response) => {
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
                    this.props.editCourseCategory(dataModel).payload.promise.then((response) => {
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
                block_content = <CourseCategoryView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                /*
                    //表格选择删除后处理
                    var rowSelection = {
                        selectedRowKeys: this.state.UserSelecteds,
                        onChange: (selectedRowKeys, selectedRows) => {
                            alert(selectedRowKeys.join(','))
                            this.setState({ UserSelecteds: selectedRowKeys })
                        },
                        getCheckboxProps: record => ({
                            disabled: false,    // Column configuration not to be checked
                        }),
                    };
                    */
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { item: { itemId: '' }, courseCategoryFullname: '', courseCategoryStatus: 1, name: '', metaDescription: '', metaKeywords: '' }) }
                } icon="plus" className="button_dark" > 科目</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'科目标识'} >
                                            {getFieldDecorator('name', { initialValue: this.state.pagingSearch.name })(
                                                <Input placeholder="请输入科目标识" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem

                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator('courseCategoryStatus', { initialValue: this.state.pagingSearch.courseCategoryStatus })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem

                                            {...searchFormItemLayout}
                                            label="所属项目"
                                        >
                                            {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                                                <SelectItem scope='all' hideAll={false} />
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
                    <div className="search-result-list table-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            //rowKey={'courseCategoryId'}
                            //rowSelection={rowSelection}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1500 }}
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
const WrappedCourseCategoryManage = Form.create()(CourseCategoryManage);

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
        getCourseCategoryList: bindActionCreators(getCourseCategoryList, dispatch),
        addCourseCategory: bindActionCreators(addCourseCategory, dispatch),
        editCourseCategory: bindActionCreators(editCourseCategory, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseCategoryManage);
