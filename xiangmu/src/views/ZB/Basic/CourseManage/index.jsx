//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary, systemCommonChild } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getItemList, getCourseCategoryList, getCourseList, addCourse, editCourse, delCourseByIds, getCourseBycourseId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import CourseView from '../CourseView';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import DropDownButton from '@/components/DropDownButton';


class CourseManage extends React.Component {

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
                courseStatus: '',
                itemId: '',//下拉菜单非自定义字典的空值代表全部
                courseCategoryId: '',//下拉菜单非自定义字典的空值代表全部
                courseName: '',
                courseType: '',
                courseSource: '',

            },
            data: [],
            dic_Items: [],//项目字典
            dic_courseCategory: [],//科目字典
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            coursetype: []
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'coursesource', 'dic_YesNo']);

        //授课类型改为查二级字典
        this.props.systemCommonChild(['coursetype']).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ coursetype: data.data.coursetype })
            }
        })

        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
        title: '课程名称',
        width: 280,
        fixed: 'left',
        dataIndex: 'courseName',
        render: (text, record, index) => {
            return <div className='textleft'>{text}</div>
        }

    },
    {
        title: '项目名称',
        dataIndex: 'courseCategoryVo.item.itemName',
    },
    {
        title: '是否公开课',
        dataIndex: 'isPublic',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_YesNo, record.isPublic);
        }
    },
    {
        title: '所属科目',
        dataIndex: 'courseCategoryVo.name'
    },
    {
        title: '授课类型',
        dataIndex: 'courseType',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.coursetype, record.courseType);
        }
    },
    {
        title: '课程来源',
        dataIndex: 'courseSource',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.coursesource, record.courseSource);
        }
    },

    {
        title: '状态',
        dataIndex: 'courseStatus',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.courseStatus);
        }
    },

    {
        title: '创建日期',
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
                <Button onClick={() => { this.editCourse(record.courseId); }}>编辑</Button>
            </DropDownButton>
        }
    }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getCourseList(condition).payload.promise.then((response) => {
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

    //检索数据
    editCourse = (courseId) => {
       var params = { courseId: courseId }
        var condition = params || this.state.pagingSearch;
        this.props.getCourseBycourseId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.onLookView('Edit', data.data)
            }
        })
    }
    //浏览视图
    onLookView = (op, item) => {
        if (item) {
            //兼容下数据问题
            item.courseCategoryId = item.courseCategoryVo ? item.courseCategoryVo.courseCategoryId : item.courseCategoryId;
            item.itemId = item.courseCategoryVo ? item.courseCategoryVo.item.itemId : item.itemId;
        }
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
                    this.props.addCourse(dataModel).payload.promise.then((response) => {
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
                    this.props.editCourse(dataModel).payload.promise.then((response) => {
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

    onBatchDelete = () => {
        Modal.confirm({
            title: '是否删除所选课程?',
            content: '点击确认删除所选课程!否则点击取消！',
            onOk: () => {
                this.props.delCourseByIds({ ids: this.state.UserSelecteds.join(',') }).payload.promise.then((response) => {
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
    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <CourseView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //表格选择删除后处理
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false,    // Column configuration not to be checked
                    }),
                };

                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { courseCategoryId: '', itemId: '', courseType: '', courseSource: '', courseName: '', remark: '' }) }
                } icon="plus" className="button_dark" > 课程</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'课程名称'} >
                                            {getFieldDecorator('courseName', { initialValue: this.state.pagingSearch.courseName })(
                                                <Input placeholder="请输入课程名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'所属项目'} style={{ marginBottom: 20 }}>
                                            {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                                                <SelectItem
                                                    scope={'all'}
                                                    hideAll={false}
                                                    onSelectChange={(value) => {
                                                        this.state.pagingSearch.courseCategoryId = '';
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        setTimeout(() => {
                                                            {/* 重新重置才能绑定这个科目值 */ }
                                                            this.props.form.resetFields(['courseCategoryId']);
                                                        }, 500);
                                                    }} />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={8} >
                                        <FormItem
                                            style={{ marginBottom: 20 }}
                                            {...searchFormItemLayout}
                                            label="所属科目"
                                        >
                                            {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                                                <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={8} >
                                        <FormItem

                                            {...searchFormItemLayout}
                                            label="授课类型"
                                        >
                                            {getFieldDecorator('courseType', { initialValue: this.state.pagingSearch.courseType })(
                                                <Select>
                                                    <Option value=''>全部</Option>
                                                    {this.state.coursetype.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem

                                            {...searchFormItemLayout}
                                            label="课程来源"
                                        >
                                            {getFieldDecorator('courseSource', { initialValue: this.state.pagingSearch.courseSource })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.coursesource.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            style={{ marginBottom: 20 }}
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator('courseStatus', { initialValue: this.state.pagingSearch.courseStatus })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
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
                            rowKey={'courseId'}
                            rowSelection={rowSelection}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={6}>
                                    {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchDelete} icon="delete">删除</Button> : <Button disabled icon="delete">删除</Button>}
                                </Col>
                                <Col span={18} className='search-paging-control'>
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
const WrappedCourseManage = Form.create()(CourseManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        systemCommonChild: bindActionCreators(systemCommonChild, dispatch),
        //各业务接口
        getCourseList: bindActionCreators(getCourseList, dispatch),
        addCourse: bindActionCreators(addCourse, dispatch),
        editCourse: bindActionCreators(editCourse, dispatch),
        getItemList: bindActionCreators(getItemList, dispatch),
        getCourseCategoryList: bindActionCreators(getCourseCategoryList, dispatch),
        delCourseByIds: bindActionCreators(delCourseByIds, dispatch),
        getCourseBycourseId: bindActionCreators(getCourseBycourseId, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
