/*
考勤管理-学生数 列表查询
2018-05-31
王强
*/
//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, DatePicker, TimePicker } from 'antd';
const FormItem = Form.Item;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import moment from 'moment';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoment } from '@/utils';

//业务接口方法引入
import { selectCourseArrangeStudentListForAttend, updateAttendStatus,DeleteAttendance } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import ImportAttendView from '../ImportAttendView';
import EditView from '../AttendStudentManage/editView';
import DropDownButton from '@/components/DropDownButton';

import CourseArrangeStudentManage from '../CourseArrangeStudentManage';
import FileDownloader from '@/components/FileDownloader';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';




class AttendStudentManage extends React.Component {

    constructor(props) {
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
            UserSelecteds:[],
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                attendStatus: '',
                courseplanName: props.courseplanName,
                teacheCenterName: props.teacheCenterName,
                courseCategoryName: props.courseCategoryName,
                courseDate: props.courseDate,
                teacherName: props.teacherName,
                classTime: props.classTime,
                classHour: props.classHour,

            },
            data: [],
            totalRecord: 0,
            loading: false,

        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['teach_class_type', 'attend_status']);//课程班类型
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    } 
    deleteaAttendance = (value) => { 
        let arr = [];
        this.state.AttendanceArr.forEach(item=>{
            if(item.courseArrangeStudentAttendId){
                arr.push(item.courseArrangeStudentAttendId)
            }
        }) 
        if(!arr.length)return;
        Modal.confirm({
          title: '未扣费的考勤信息可以删除，您确定删除所选的未扣费的学生考勤信息吗?',
          content: '',
          onOk: () => { 
                this.props.DeleteAttendance({attendIds:arr.join(',')}).payload.promise.then((response) => {
                    let data = response.payload.data; 
                    if(data.state == 'success'){
                        this.onSearch();
                    }else{
                        message.error(data.msg);
                    }
                }
            )
          },
          onCancel: () => {
            console.log('Cancel');
          },
        });
      }
    //table 输出列定义
    columns = [
        {
            title: '学生姓名',
            width: 100,
            fixed: 'left',
            dataIndex: 'realName'
        },
        {
            title: '证件号',
            dataIndex: 'certificateNo'
        },
        {
            title: '订单号',
            dataIndex: 'orderSn',
            render: (text, record, index) => {
                return <a onClick={() => {
                    this.onOrderInfo(record)
                }}>{record.orderSn}</a>;
            }
        },
        {
            title: '班型',
            dataIndex: 'classTypeName',
        },
        {
            title: '所属教学点',
            dataIndex: 'teachCenterIdForStudentName',
        }, 
        {
            title: '是否重修',
            dataIndex: 'isRestudyName', 
        },
        {
            title: '考勤情况',
            dataIndex: 'attendStatusStr',
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                    {record.finishStatus != 2 &&
                        <Button onClick={() => {this.onEditView(record)}}>编辑</Button>
                    }
                </DropDownButton>
            },
        }];


    //检索数据
    fetch = (params = {}) => {

        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.courseArrangeDetailId = this.props.currentDataModel.courseArrangeDetailId;
        this.props.selectCourseArrangeStudentListForAttend(condition).payload.promise.then((response) => {
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
            switch (this.state.editMode) {
                case "Student":
                    break;
                case "Create":
                case "Edit": //提交
                    this.props.updateAttendStatus(dataModel).payload.promise.then((response) => {
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
                case "Import":
                    this.onSearch();
                    this.onLookView("Manage", null);
                    //提交
                    break;
                case "OrderInfo":
                    this.onSearch();
                    this.onLookView("Manage", null);
                    //提交
                    break;

            }
        }
    }

    onChangeForStart = (time) => {
        // this.setState({ pagingSearch: time });
        this.state.pagingSearch.startDate = time;
    }

    onOrderInfo = (record) => {
        this.onLookView('OrderInfo', record)
    }

    onBack = () => {
        this.props.viewCallback();
    }

    onEditView = (record) => {

        this.onLookView("Edit", { ...this.props.currentDataModel, ...record })
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Import":
                block_content = <ImportAttendView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Student":
                block_content = <CourseArrangeStudentManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "OrderInfo":
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.studentId}
                    orderId={this.state.currentDataModel.orderId}
                    tab={3}
                />
                break;
            case "Create":
            case "Edit":
                block_content = <EditView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "View":
            case "Delete":
            case "Manage":
            default:
            var rowSelection = {
              selectedRowKeys: this.state.UserSelecteds,
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys,AttendanceArr:selectedRows })
              },
              getCheckboxProps: record => 
                {
                  return{
                disabled: (record.isDeduct==0 && record.courseArrangeStudentAttendId)?false:true, 
              }
            }
              ,
            }
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={this.onBack} icon='rollback' className="button_dark" >返回</Button>);

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label='课程班名称'>
                                            {this.props.currentDataModel.courseplanName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label='教学点' >
                                            {this.props.currentDataModel.teacheCenterName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="科目"
                                        >
                                            {this.props.currentDataModel.courseCategoryName}
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="上课日期"
                                        >
                                            {timestampToTime(this.props.currentDataModel.courseDate)}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="讲师"
                                        >
                                            {this.props.currentDataModel.teacherName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="上课时段">
                                            {this.props.currentDataModel.classTime}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="课时"
                                        >
                                            {this.props.currentDataModel.classHour}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="考勤情况"
                                        >
                                            {getFieldDecorator('attendStatus', { initialValue: this.state.pagingSearch.attendStatus })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.attend_status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="学生姓名"
                                        >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder='请输入学生姓名'/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >

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
                            rowSelection={rowSelection}
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={2}>
                                    {
                                    this.state.UserSelecteds.length ?
                                    <Button loading={this.state.loading} icon="delete" onClick={this.deleteaAttendance}>删除考勤</Button>
                                    :
                                    <Button loading={this.state.loading} icon="delete" disabled>删除考勤</Button>
                                    }
                                </Col>
                                <Col span={22} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      
                                        pageSizeOptions = {['10','20','30','50','100','200']}
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
const WrappedCourseManage = Form.create()(AttendStudentManage);

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
        selectCourseArrangeStudentListForAttend: bindActionCreators(selectCourseArrangeStudentListForAttend, dispatch),//列表查询接口
        updateAttendStatus: bindActionCreators(updateAttendStatus, dispatch),//编辑接口
        //删除考勤
        DeleteAttendance: bindActionCreators(DeleteAttendance, dispatch),//编辑接口
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
