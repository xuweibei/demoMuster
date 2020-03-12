/*
考勤管理 列表查询
2018-05-31
王强
*/
//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, DatePicker, TimePicker } from 'antd';
const FormItem = Form.Item; 

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime,formatMoment } from '@/utils';

//业务接口方法引入
import { selectAttendanceList } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import AttendStudentManage from '../AttendStudentManage';
import ImportAttendView from '../ImportAttendView';
import DropDownButton from '@/components/DropDownButton';

import CourseArrangeStudentManage from '../CourseArrangeStudentManage'; //#endregion
import Teacher from './Teacher';


const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class AttendManage extends React.Component {

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
                startDate:null,
                endDate:null,

            },
            data: [],
            totalRecord: 0,
            loading: false,
            courseplanName:'',

        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['teach_class_type','attend_status']);//课程班类型
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
            dataIndex: 'teacheCenterName'
        },
        {
            title: '课程班',
            dataIndex: 'courseplanName'
        },
        {
            title: '课程班类型',
            dataIndex: 'teachClassType',
            render: (text, record, index) => {
                var teachClassType = record.teachClassType == 0 ? 1 : record.teachClassType
                return getDictionaryTitle(this.state.teach_class_type, teachClassType);
            }
        },
        {
            title: '科目',
            dataIndex: 'courseCategoryName',
        },
        {
            title: '上课日期',
            dataIndex: 'courseDate',
            render: (text, record, index) => {
                return timestampToTime(record.courseDate);
            }
        },
        {
            title: '上课时段',
            dataIndex: 'classTime',
            render: (text, record, index) => {
                return timestampToTime(record.classTime);
            }
        },
        {
            title: '课时',
            dataIndex: 'classHour',
        },
        {
            title: '讲师',
            dataIndex: 'teacherName',
        },
        {
            title: '讲师考勤',
            dataIndex: 'attendStatus',
            render:(text,record)=>{
                return getDictionaryTitle(this.state.attend_status,record.attendStatus)
            }
        },
        
        {
            title: '学生数',
            dataIndex: 'studentNum',
            render: (text, record, index) => {
                return <a onClick={() => {
                    this.onStudentView(record)
                }}>{record.studentNum}</a>;
            }
        },
        {
            title: '班型备注',
            dataIndex: 'classTypeRemark',
        },
        {
            title: '阶段备注',
            dataIndex: 'periodRemark',
        },
        {
            title: '授课科目备注',
            dataIndex: 'courseRemark',
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => (
                <DropDownButton> 
                    {<Button onClick={() => { this.onLookView('Import', record) }}>导入考勤</Button>}
                    {<Button onClick={() => { this.onStudentView(record) }}>学生考勤</Button>}
                    {<Button onClick={() => { this.onLookView('Teacher', record) }}>讲师考勤</Button>} 
                </DropDownButton>
               
            ),
        }];


    //检索数据
    fetch = (params = {}) => {
        if (!params || !params.itemId || !params.courseplanBatchId) {
            this.setState({
                data: []
            })
            return;
          }

        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.startDateStr = formatMoment(condition.startDateStr,'YYYY-MM-DD HH:mm:ss');
        condition.endDateStr = formatMoment(condition.endDateStr,'YYYY-MM-DD HH:mm:ss');
        this.props.selectAttendanceList(condition).payload.promise.then((response) => {
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
                this.onSearch();
                this.onLookView("Manage", null);  
        }
    }

    onChangeForStart = (time) => {
        // this.setState({ pagingSearch: time });
        this.state.pagingSearch.startDate = time;
    }

    onStudentView = (record) => {
        this.onLookView("View", record)
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case 'Teacher':
                block_content = <Teacher viewCallback={this.onViewCallback} {...this.state} />
            break;
            case "Import":
                block_content = <ImportAttendView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Student":
                block_content = <CourseArrangeStudentManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Create":
            case "Edit":
            case "View":
            block_content = <AttendStudentManage viewCallback={this.onViewCallback} {...this.state} />
                break;
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
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'项目'}>
                                            {getFieldDecorator('itemId', {
                                                initialValue: this.state.pagingSearch.itemId
                                            })(
                                                <SelectItem
                                                    scope={'my'}
                                                    hideAll={true}
                                                    // isFirstSelected={true}
                                                    onSelectChange={(value) => {
                                                        this.state.pagingSearch.courseplanBatchId = '';
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        setTimeout(() => {
                                                            {/* 重新重置才能绑定这个科目值 */ }
                                                            this.props.form.resetFields(['courseplanBatchId']);
                                                        }, 1000);
                                                    }} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'开课批次'} >
                                            {getFieldDecorator('courseplanBatchId', {
                                                initialValue: this.state.pagingSearch.courseplanBatchId
                                            })(
                                                <SelectItemCoursePlanBatch hideAll={true} isFirstSelected={true}
                                                    itemId={this.state.pagingSearch.itemId}
                                                    onSelectChange={(value, selectedOptions) => {

                                                        this.state.pagingSearch.courseplanBatchId = value;
                                                        let currentCoursePlanBatch = selectedOptions;
                                                        this.setState({ pagingSearch: this.state.pagingSearch, currentCoursePlanBatch });
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
                                                <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} isMain={true}/>
                                            )}
                                        </FormItem>
                                    </Col>
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
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="课程班"
                                        >
                                            {getFieldDecorator('courseplanName', { initialValue: this.state.pagingSearch.courseplanName })(
                                                <Input placeholder='请输入课程班' />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="上课日期"
                                        >
                                            {getFieldDecorator('courseDate', { initialValue: this.state.pagingSearch.courseDate })(
                                                <DatePicker placeholder="上课日期" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="上课时段">
                                            {getFieldDecorator('startDateStr', { initialValue: '' })(
                                                <TimePicker style={{width:100}} placeholder='开始时段' value={this.state.pagingSearch.startDateStr} onChange={this.onChangeForStart} />
                                            )}
                                           <span style={{marginLeft:8,marginRight:8}}> 至</span>
                                            {getFieldDecorator('endDateStr', { initialValue: '' })(
                                                <TimePicker style={{width:100}} placeholder='结束时段' value={this.state.pagingSearch.endDateStr} onChange={this.onChangeforEnd} />
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
const WrappedCourseManage = Form.create()(AttendManage);

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
        selectAttendanceList: bindActionCreators(selectAttendanceList, dispatch),//列表查询接口
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
