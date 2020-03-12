/*
学生报班管理---学生---列表查询
2018-05-31
王强
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
import { selectCourseArrangeStudentList, deleteByPrimaryKeyForBatch,TeachingPointDropdown } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import SelectUniversity from '@/components/BizSelect/SelectUniversity';
import AddCourseArrangeStudentManage from '@/views/FB/Class/AddCourseArrangeStudentManage'

const searchFormItemLayoutOwn = {
    labelCol: { span: 10 },
    wrapperCol: { span: 12 },
  };

class CourseArrangeStudentManage extends React.Component {


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
            studentList:[],
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                teachCenterId: this.props.currentDataModel.teachCenterId,
                courseArrangeId: this.props.currentDataModel.courseArrangeId,
                courseCategoryId: this.props.currentDataModel.courseCategoryId,
                faceClassType: '',
                studyStatus: '',
                isRestudy: '',
                teachCenterIdForStudent: '',

            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            showAdd:false
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['teach_class_type']);//课程班类型
        this.loadBizDictionary(['category_detail_study_status']);//科目学习状态
        //首次进入搜索，加载服务端字典项内容
        this.Dropdown();
        this.onSearch();
    }
    Dropdown = () =>{
        this.props.TeachingPointDropdown({
            courseArrangeId:this.props.currentDataModel.courseArrangeId,
            courseCategoryId:this.props.currentDataModel.courseCategoryId,
            teachCenterId:this.props.currentDataModel.teachCenterId,
        }).payload.promise.then((response)=>{
            let data = response.payload.data;
            if(data.state == 'success'){
                this.setState({
                    studentList:data.data
                })
            }else{
                message.error(data.msg)
            }
        })
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '学生姓名',
            fixed: 'left',
            width:120,
            dataIndex: 'realName'
        },
        {
            title: '学生教学点',
            width: 180,
            dataIndex: 'teachCenterIdForStudentName'
        },
        {
            title: '证件号',
            dataIndex: 'certificateNo'
        },
        {
            title: '学号',
            dataIndex: 'studentNo'
        },
        {
            title: '面授班类型',
            dataIndex: 'faceClassType',
            render: (text, record, index) => {
                var faceClassType = record.faceClassType == 0 ? 1 : record.faceClassType
                return getDictionaryTitle(this.state.teach_class_type, faceClassType);
            }
        },
        {
            title: '科目学习状态',
            dataIndex: 'studyStatusName',
        },
        {
            title: '是否重修',
            dataIndex: 'isRestudyName',
        },

        {
            title: '面授总标准学时',
            dataIndex: 'classHour',
        },

        {
            title: '已参加面授课时',
            width: 120,
            fixed: 'right',
            dataIndex: 'attendClassHour',
        }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.selectCourseArrangeStudentList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = []
                data.data.page.pageResult = data.data.page.pageResult || []
                data.data.page.pageResult.map(item => {
                    item.key = item.courseArrangeStudentId;
                    list.push(item);
                })
                this.setState({
                    data_list: list,
                    totalRecord: data.data.page.totalRecord,
                    loading: false,
                    showAdd:data.data.showAddBut
                })
            }
            else {
                this.setState({ loading: false, data_list: [] })
                message.error(data.message);
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
                case "AddStudent":
                    this.onSearch();
                    this.onLookView("Manage", null);
                    break;
                case "Create":
                case "Edit": //提交
                    this.onSearch();
                    this.onLookView("Manage", null);
                    break;

            }
        }
    }

    //批量删除学生
    onBatchDelete = () => {
        //获取学生ids数组
        var studentIdslist = [];
        this.state.UserSelecteds.map(courseArrangeStudentId => {
            studentIdslist.push(courseArrangeStudentId)
        })

        Modal.confirm({
            title: '是否删除所选学生?',
            content: '点击确认删除所选学生!否则点击取消！',
            onOk: () => {
                this.props.deleteByPrimaryKeyForBatch({ ids: studentIdslist.join(",") }).payload.promise.then((response) => {
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
        this.props.viewCallback({});
    }

    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "AddStudent":
                block_content = <AddCourseArrangeStudentManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                this.state.showAdd? extendButtons.push(<Button onClick={() => { this.onLookView('AddStudent', { courseplanName: this.props.currentDataModel.courseplanName, teachCenterId: this.props.currentDataModel.teachCenterId, teachCenterName: this.props.currentDataModel.teachCenterName, courseCategoryId: this.props.currentDataModel.courseCategoryId, courseCategoryName: this.props.currentDataModel.courseCategoryName, itemId: this.props.currentDataModel.itemId, courseArrangeId: this.props.currentDataModel.courseArrangeId }) }
                } icon="plus" className="button_dark" > 学生</Button>):''
               
                extendButtons.push(<Button onClick={this.onBack} icon="rollback" className="button_dark" >返回</Button>);
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: !record.deleteCheck,    // Column configuration not to be checked
                    }),
                };

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="课程班名称"
                                        >
                                            {this.props.currentDataModel.courseplanName}

                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="教学点"
                                        >
                                            {this.props.currentDataModel.teachCenterName}

                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="科目"
                                        >
                                            {this.props.currentDataModel.courseCategoryName}

                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="高校"
                                        >
                                            {getFieldDecorator('studyUniversityId', { initialValue: this.state.pagingSearch.studyUniversityId })(
                                                <SelectUniversity />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="学生所属教学点"
                                        >
                                            {getFieldDecorator('teachCenterIdForStudent', { initialValue: this.state.pagingSearch.teachCenterIdForStudent })(
                                                <Select>
                                                    <Option value=''>全部</Option>
                                                    {
                                                        this.state.studentList.map((item)=>{
                                                            return <Option value={item.orgId}>{item.orgName}</Option>
                                                        })
                                                    }
                                                </Select>

                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="面授班类型"
                                        >
                                            {getFieldDecorator('faceClassType', { initialValue: this.state.pagingSearch.faceClassType })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.teach_class_type.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="科目学习状态"
                                        >
                                            {getFieldDecorator('studyStatus', { initialValue: this.state.pagingSearch.studyStatus })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.category_detail_study_status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="是否重修"
                                        >
                                            {getFieldDecorator('isRestudy', { initialValue: this.state.pagingSearch.isRestudy })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    <Option value='1' key='1'>是</Option>
                                                    <Option value='0' key='0'>否</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayoutOwn}
                                            label="学生姓名"
                                        >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder='请输入学生姓名' />
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
                            dataSource={this.state.data_list}//数据
                            bordered
                            scroll={{ x: 1300 }}
                            rowSelection={rowSelection}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={4}>
                                    <div className='flex-row'>
                                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchDelete} icon="delete">批量删除</Button> : <Button disabled icon="delete">批量删除</Button>}
                                    </div>
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
const WrappedCourseManage = Form.create()(CourseArrangeStudentManage);

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
        selectCourseArrangeStudentList: bindActionCreators(selectCourseArrangeStudentList, dispatch),//查询列表接口
        deleteByPrimaryKeyForBatch: bindActionCreators(deleteByPrimaryKeyForBatch, dispatch),//批量删除接口
        TeachingPointDropdown: bindActionCreators(TeachingPointDropdown, dispatch),//下拉列表
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
