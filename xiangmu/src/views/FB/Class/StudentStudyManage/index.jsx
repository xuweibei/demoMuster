/*
学习情况查询
*/
//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getCourseArrangeList, updateFinishStatus } from '@/actions/base';
import { headquarterStudentStudyList } from '@/actions/enrolStudent';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import ImportStudentView from '../ImportStudentView';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import StudentStudyManageView from './view';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import CourseArrangeStudentManage from '../CourseArrangeStudentManage';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';



class StudentStudyManage extends React.Component {

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
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                branchId: '',
                teachCenterId: '',
                itemId: '',
                courseCategoryId: '',
                teachMode: '',
                studyState: '',
                restudyOrNot: '',
                studentName: '',
            },
            data: [],
            totalRecord: 0,
            loading: false,

        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['teach_class_type', 'teachmode', 'category_state']);//课程班类型
        //首次进入搜索，加载服务端字典项内容
        //this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '教学点',
            width: 180,
            fixed: 'left',
            dataIndex: 'teacherCenterName'
        },
        {
            title: '学生姓名',
            dataIndex: 'studentName',
            render: (text, record, index) => {
                return <a onClick={() => {
                  this.onStudentView(record)
                }}>{record.studentName}</a>;
              }
        },
        {
            title: '手机号',
            dataIndex: 'mobile',
        },
        {
            title: '项目',
            dataIndex: 'itemName',
        },
        {
            title: '科目',
            dataIndex: 'courseCategoryName',
        },

        {
            title: '授课方式',
            dataIndex: 'teachModeName',
        },

        {
            title: '学习情况',
            dataIndex: 'studyStateName',
        },

        {
            title: '是否重修',
            dataIndex: 'isRestudyName',
        },
        {
            title: '备注',
            dataIndex: 'remark',
        },

        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                //编辑   适用商品 互斥设置(2)
                return <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
            },
        }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.headquarterStudentStudyList(condition).payload.promise.then((response) => {
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
    //面授完成
    updateFinishStatus = (courseArrangeId) => {
        this.setState({ loading: true });
        var condition = { courseArrangeId: courseArrangeId };
        this.props.updateFinishStatus(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.onSearch();
                this.onLookView("Manage", null);
            }
        })
    }
    onStudentView = (record) => {
        this.onLookView("StudentViEW", record)
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
                case "StudentView":
                    this.onSearch();
                    this.onLookView("Manage", null);
                    break;
                case "Create":
                case "Edit": //提交
                    this.onSearch();
                    this.onLookView("Manage", null);
                    break;
                case "Import":
                    this.onSearch();
                    this.onLookView("Manage", null);
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
            case "View":
                block_content = <StudentStudyManageView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "StudentViEW":
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                break;
            case "Manage":
            default:
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
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="教学点"
                                        >
                                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                                <SelectTeachCenterByUser />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'项目'}>
                                            {getFieldDecorator('itemId', {
                                                initialValue: this.state.pagingSearch.itemId
                                            })(

                                                <SelectItem
                                                    scope={'my'}
                                                    hideAll={true}
                                                    isFirstSelected={true}
                                                onSelectChange={(value) => {
                                                    this.state.pagingSearch.itemId = value;
                                                    this.setState({ pagingSearch: this.state.pagingSearch });
                                                    this.onSearch();
                                                }} 
                                                />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="科目"
                                        >
                                            {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                                                <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="授课方式">
                                            {getFieldDecorator('teachMode', { initialValue: this.state.pagingSearch.teachMode })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.teachmode.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                    <Option value="3">网络+面授</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="学习情况">
                                            {getFieldDecorator('studyState', { initialValue: this.state.pagingSearch.studyState })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.category_state.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                  <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="是否重修">
                                            {getFieldDecorator('restudyOrNot', { initialValue: this.state.pagingSearch.restudyOrNot })(
                                                <Select>
                                                   <Option value="">全部</Option>
                                                   <Option value="1">是</Option>
                                                   <Option value="0">否</Option>
                                               </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="请输入学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                       
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
                            scroll={{ x: 1300 }}
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
const WrappedCourseManage = Form.create()(StudentStudyManage);

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
        updateFinishStatus: bindActionCreators(updateFinishStatus, dispatch),
        headquarterStudentStudyList: bindActionCreators(headquarterStudentStudyList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
