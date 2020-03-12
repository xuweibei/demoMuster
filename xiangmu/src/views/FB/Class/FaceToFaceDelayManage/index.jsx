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
import { getFaceToFaceDelayList, editFinishStatusByPrimaryKey } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';



class FaceToFaceDelayManage extends React.Component {
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
                itemId: '',
                courseplanBatchId: '',
                courseCategoryId: '',
                courseName: '',
                teachCenterId: '',
                finishStatus: '',
                studentName: '',

            },
            data: [],
            totalRecord: 0,
            loading: false,

        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['course_arrange_student_status']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
        title: '分部',
        width: 120,
        fixed: 'left',
        dataIndex: 'branchName',
    },
    {
        title: '教学点',
        dataIndex: 'teachCenterName'
    },
    {
        title: '课程班',
        dataIndex: 'courseplanName'
    },
    {
        title: '科目',
        dataIndex: 'courseCategoryName',
    },
    {
        title: '开课时段',
        dataIndex: 'startDate',
        render: (text, record, index) => {
            return (timestampToTime(record.startDate) + '至' + timestampToTime(record.endDate));
        }
    },

    {
        title: '课次',
        dataIndex: 'courseNum',
    },

    {
        title: '学生姓名',
        dataIndex: 'studentName',
    },

    {
        title: '证件号',
        dataIndex: 'certificateNo',
    },
    {
        title: '班型',
        dataIndex: 'classTypeName',
    },
    {
        title: '已上课次数',
        dataIndex: 'attendNum',
    },
    {
        title: '状态',
        dataIndex: 'finishStatus',
        render: (text, record, index) => {
            var finishStatus = record.finishStatus == 0 ? 1 : record.finishStatus
            return getDictionaryTitle(this.state.course_arrange_student_status, finishStatus);
        }
    },
    {
        title: '已面授课时',
        dataIndex: 'attendClassHour',
    },
    {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (text, record) => (
            <Row justify="space-around" type="flex">
                {record.show && <Button onClick={() => { this.editFinishState(record.courseArrangeStudentId, 2) }}>延期</Button>}
                {/*暂时屏蔽此按钮*/}
                {/*record.isRehear && <Button onClick={() => { this.editFinishState(record.courseArrangeStudentId, 3) }}>中止</Button>*/}
                {(!record.isAppend || record.isDelay == 1) && '--'}
            </Row>
        ),
    }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getFaceToFaceDelayList(condition).payload.promise.then((response) => {
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
    editFinishState = (id, state) => {

        Modal.confirm({
            title: '您确定要延期吗?',
            content: '点击确认完成延期!否则点击取消！',
            onOk: () => {
                this.setState({ loading: true });
                var condition = { courseArrangeStudentId: id, finishStatus: state };
                this.props.editFinishStatusByPrimaryKey(condition).payload.promise.then((response) => {
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
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
        
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
                case "Edit": //提交
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
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'项目'}>
                                            {getFieldDecorator('itemId', {
                                                initialValue: this.state.pagingSearch.itemId,
                                                rules: [{
                                                    required: true, message: '请选择项目!',
                                                }],
                                            })(
                                                <SelectItem
                                                    scope={'my'}
                                                    hideAll={true}
                                                    onSelectChange={(value) => {
                                                        this.state.pagingSearch.courseCategoryId = '';
                                                        this.state.pagingSearch.courseplanBatchId = '';
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        setTimeout(() => {
                                                            {/* 重新重置才能绑定这个科目值 */ }
                                                            this.props.form.resetFields(['courseCategoryId']);
                                                            this.props.form.resetFields(['courseplanBatchId']);
                                                        }, 500);
                                                    }} />
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="所属科目"
                                        >
                                            {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                                                <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} isMain={true}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'开课批次'} >
                                            {getFieldDecorator('courseplanBatchId', {
                                                initialValue: this.state.pagingSearch.courseplanBatchId,
                                                rules: [{
                                                    required: true, message: '请选择开课批次!',
                                                }],
                                            })(
                                                <SelectItemCoursePlanBatch itemId={this.state.pagingSearch.itemId} />
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="教学点"
                                        >
                                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                                <SelectTeachCenterByUser />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator('finishStatus', { initialValue: this.state.pagingSearch.finishStatus })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.course_arrange_student_status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="课程班"
                                        >
                                            {getFieldDecorator('courseplanName', { initialValue: this.state.pagingSearch.courseplanName })(
                                                <Input placeholder='课程班' />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="学生姓名"
                                        >
                                            {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                <Input placeholder='学生姓名' />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                    </Col>
                                    <Col span={8} >
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
const WrappedCourseManage = Form.create()(FaceToFaceDelayManage);

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
        editFinishStatusByPrimaryKey: bindActionCreators(editFinishStatusByPrimaryKey, dispatch),
        getFaceToFaceDelayList: bindActionCreators(getFaceToFaceDelayList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
