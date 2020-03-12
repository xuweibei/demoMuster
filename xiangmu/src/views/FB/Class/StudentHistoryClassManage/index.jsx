/*
学生报班管理 列表查询
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
import { getCourseArrangeList, updateFinishStatus } from '@/actions/base';
import { getHistoryCourseArrangeList } from '@/actions/enrolStudent';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import ImportStudentView from '../ImportStudentView';
import StudentHistoryManage from './StudentHistoryManage';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import CourseArrangeStudentManage from '../CourseArrangeStudentManage';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';



class StudentHistoryClassManage extends React.Component {

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
             //   courseName: '',
                teachCenterId: '',
           //     finishStatus: '',
                courseArrangeName: '',

            },
            data: [],
            totalRecord: 0,
            loading: false,

        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['teach_class_type']);//课程班类型
        //首次进入搜索，加载服务端字典项内容
     //   this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '教学点',
            width: 180,
            fixed: 'left',
            dataIndex: 'teachCentername'
        },
        {
            title: '课程班',
            dataIndex: 'courseplanName'
        },
        {
            title: '课程班类型',
            dataIndex: 'teachClassTypeName',
            // render: (text, record, index) => {
            //     var teachClassType = record.teachClassType == 0 ? 1 : record.teachClassType
            //     return getDictionaryTitle(this.state.teach_class_type, teachClassType);
            // }
        },
        {
            title: '科目',
            dataIndex: 'courseCategoryName',
        },
        {
            title: '开课时段',
            dataIndex: 'timeQuantumStr',
            // render: (text, record, index) => {
            //     return timestampToTime(record.classTime);
            // }
        },

        {
            title: '课次',
            dataIndex: 'courseNum',
        },

        {
            title: '排课课时',
            dataIndex: 'hour',
        },

        {
            title: '班级新平台学生数',
            dataIndex: 'newStudentNum',
        },
        {
            title: '班级历史学生数',
            dataIndex: 'oldStudentNum',
        },
     
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                   //编辑   适用商品 互斥设置(2)
                 return  <Button onClick={() => { this.onLookView('StudentView', record); }}>学生</Button>
            },
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
        this.props.getHistoryCourseArrangeList(condition).payload.promise.then((response) => {
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
            case "Import":              
                block_content = <ImportStudentView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "StudentView":
                block_content = <StudentHistoryManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => {
                    if (!this.state.pagingSearch.itemId) {
                        message.error('请选择项目！')
                    } else if (!this.state.pagingSearch.courseplanBatchId) {
                        message.error('请选择开课批次！')
                    } else {
                        this.onLookView('Import', {
                            courseplanBatchId:this.state.pagingSearch.courseplanBatchId,
                            itemId:this.state.pagingSearch.itemId
                        })
                    }
                }
                } className="button_dark" icon='download' > 导入学生</Button>);

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
                                                initialValue: this.state.pagingSearch.itemId
                                            })(
                                                
                                                <SelectItem
                                                    scope={'my'}
                                                    hideAll={true}
                                                    isFirstSelected={true}
                                                    onSelectChange={(value) => {
                                                        this.state.pagingSearch.courseplanBatchId = '';
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        // this.onSearch();
                                                        setTimeout(() => {
                                                            {/* 重新重置才能绑定这个开课批次值 */ }
                                                            this.props.form.resetFields(['courseplanBatchId']);
                                                        }, 1000);
                                                    }} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
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
                                                        // this.onSearch();

                                                    }}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="科目"
                                        >
                                            {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                                                <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} isMain={true}/>
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
                                            label="课程班"
                                        >
                                            {getFieldDecorator('courseArrangeName', { initialValue: this.state.pagingSearch.courseplanName })(
                                                <Input placeholder='请输入课程班' />
                                            )}
                                        </FormItem>
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
const WrappedCourseManage = Form.create()(StudentHistoryClassManage);

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
        getHistoryCourseArrangeList: bindActionCreators(getHistoryCourseArrangeList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
