
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Modal, DatePicker
} from 'antd';
const FormItem = Form.Item;
import { OutGoingTaskList } from '@/actions/enrolStudent';
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { getUniversityByBranchId, addOutGoingTask, updateOutGoingTask, deleteById,SubmissionNew,deleteOutGoingTask } from '@/actions/base';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import AddActivityView from './addActivityView';
import DropDownButton from '@/components/DropDownButton';
import StudentManage from './student';
import StudentNum from './studentsNum';
import CreateOpportunities from './CreateOpportunities';
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';
class ActivityManage extends React.Component {

    constructor() {
        super();
        (this: any).fetch = this.fetch.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = {
            id:'',
            isShowChooseProduct:false,
            delOutShow:false,
            editMode: '',
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                regionId: '',
                status: '',
                callcenterTaskName: '',
                startTime: '',
                endTime: '',
                subStartTime: '',
                subEndTime: '',
            },
            bz_campus_list: [], //校区
            totalRecord: 0,
            UserSelecteds: [],
            loading: false,
            startValue: null,
            endValue: null,
            endOpen: false,
        };
    }
    componentWillMount() {
        console.log("CoursePlanAudit componentWillMount");
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'activity_type']);
        this.onSearch()
    }
    compoentDidMount() {
        // console.log("CoursePlanAudit componentDidMount");
    }

    columns = [
        {
            title: '区域',
            dataIndex: 'regionName',
            width: 120,
            fixed: 'left',
        },
        {
            title: '任务名称',
            dataIndex: 'callcenterTaskName',
        },

        {
            title: '状态',
            dataIndex: 'statusName',
        },
        {
            title: '学生数',
            dataIndex: 'studentNum',
            render: (text, record, index) => {
                return <a onClick={() => {
                  this.onLookView('StudentNum',record)
                }}>{record.studentNum}</a>;
                
            }
        },
        {
            title: '产生机会',
            dataIndex: 'changeNum',
            render: (text, record, index) => {
                return <a onClick={() => {
                  this.onLookView('Opportunities',record)
                }}>{record.changeNum}</a>;
                
            }
            
        },
        {
            title: '计划开始日期',
            dataIndex: 'startTime',
            render: (text, record, index) => {
              return timestampToTime(record.startTime)
            },
        },
        {
            title: '计划完成日期',
            dataIndex: 'endTime',
            render: (text, record, index) => {
              return timestampToTime(record.endTime)
            },
        },
        {
            title: '创建人',
            dataIndex: 'createName',
        },
        {
            title: '创建日期',
            dataIndex: 'createDate',
            render: (text, record, index) => {
              return timestampToTime(record.createDate)
            },
        },
        {
            title: '提交人',
            dataIndex: 'sumbmitName',
        },
        {
            title: '提交日期',
            dataIndex: 'submitDate',
            render: (text, record, index) => {
              return timestampToTime(record.submitDate)
            },
        },
        {
            title: '完成日期',
            dataIndex: 'finishDate',
            render: (text, record, index) => {
              return timestampToTime(record.finishDate)
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                if(record.statusName == '暂存'){
                    return <DropDownButton>
                                {/* <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button> */}
                                <Button onClick={() => this.onLookView('Edit', { mainNew: record})}>编辑</Button>
                               {record.studentNum==0?'':<Button onClick={() => this.Submission(record)}>提交</Button>} 
                                <Button onClick={() =>  this.delOut(record)}>删除</Button>
                                <Button onClick={() => { this.onLookView('Student', record); }}>导入学生</Button>
                            </DropDownButton>
                }
            return ''
            },
        }
    ];
    //点击提交打开弹框
    Submission=(value)=>{
        this.setState({
            isShowChooseProduct: true,
            id:value.callcenterTaskId
        })
    }
    //点击提交
    onSubmission=(value)=>{
        if(!value)return
        this.props.SubmissionNew({callcenterTaskId:value}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                message.success('提交成功');
                this.onSearch();
            }
            else {
                message.error(data.message);
            }
            this.setState({
                isShowChooseProduct: false,
                id:''
            })
        })
    }

    //删除学生打开弹框
    delOut=(value)=>{
        this.setState({
            delOutShow: true,
            id:value.callcenterTaskId
        })
    }

    //确定删除外呼任务
    onChangeDelete=(value)=>{
        if(!value)return;
        this.props.deleteOutGoingTask({callcenterTaskId:value}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                message.success('删除成功');
                this.onSearch();
            }
            else {
                message.error(data.msg);
            }
            this.setState({
                delOutShow: false,
                id:''
            })
        })
    }
    //点击遮罩层或右上角叉或取消按钮关闭弹框
    onHideModal=()=> {
        this.setState({
          isShowChooseProduct: false
        })
      }
    //点击遮罩层或右上角叉或取消按钮关闭弹框
    onDelOutShow=()=> {
        this.setState({
            delOutShow: false
        })
    }
   

 //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let askDate = condition.startTime;
        if(Array.isArray(askDate)){
            condition.startTime = formatMoment(askDate[0]);
            condition.endTime = formatMoment(askDate[1]);
        }
        let askDate2 = condition.subStartTime;
        if(Array.isArray(askDate2)){
            condition.subStartTime = formatMoment(askDate2[0]);
            condition.subEndTime = formatMoment(askDate2[1]);
        }
        this.props.OutGoingTaskList(condition).payload.promise.then((response) => {
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
            this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
            this.onSearch();
        } else {
            switch (this.state.editMode) {
                case "Create":
                    this.props.addOutGoingTask(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            message.success('新增成功！')
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'Edit':
                    this.props.updateOutGoingTask(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            message.success('修改成功！')
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'Student':
                    this.onSearch();
                    this.onLookView("Manage", null);
                    break;

            }
        }
    }
    //排除不可以选择的日期
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }

    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
    //时间发生变化的回调
    onStartChange = (value) => {
        this.onChange('startValue', value);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Student":
                block_content = <StudentManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'Edit':
            case 'Create':
                block_content = <AddActivityView
                    viewCallback={this.onViewCallback}
                    {...this.state}
                />
                break;
            case 'StudentNum':
                block_content = <StudentNum
                    viewCallback={this.onViewCallback}
                    {...this.state}
                />;
                break;
            case 'Opportunities':
                    block_content = <CreateOpportunities
                    viewCallback={this.onViewCallback}
                    {...this.state}
                />;
                break;
            case 'Manage':
            default:

                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { recruitBatchId: this.state.pagingSearch.recruitBatchId }) }
                } icon="plus" className="button_dark" > 新增任务</Button>);
                block_content = (
                    <div>
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form">
                                    <Row justify="center" gutter={24} align="middle" type="flex">
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'区域'} >
                                                {
                                                    getFieldDecorator('regionId', {
                                                        initialValue: this.state.pagingSearch.regionId
                                                    })
                                                        (
                                                        <SelectArea scope='my' showCheckBox={false} />
                                                        )
                                                }
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'状态'} >
                                                {getFieldDecorator('status', { initialValue: dataBind(this.state.pagingSearch.activityType) })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        <Option value="0">暂存</Option>
                                                        <Option value="1">已提交</Option>
                                                        <Option value="2">完成</Option>
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12} >
                                            <FormItem {...searchFormItemLayout}
                                                label="任务名称">
                                                {getFieldDecorator('callcenterTaskName', { initialValue: this.state.pagingSearch.callcenterTaskName })(
                                                    <Input placeholder='请输入活动名称' />
                                                )}
                                            </FormItem>
                                        </Col>

                                        <Col span={12}></Col>
                                        <Col span={12} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="计划开始日期">
                                                {getFieldDecorator('startTime', { initialValue:''})(
                                                    <RangePicker
                                                        disabledDate={this.disabledStartDate}
                                                        format={dateFormat}
                                                        onChange={this.onStartChange}
                                                        style={{width:220}}  
                                                    />
                                                )}
                                            </FormItem>
                                        </Col>
                                        
                                        <Col span={12} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="提交日期">
                                                {getFieldDecorator('subStartTime', { initialValue:''})(
                                                    <RangePicker
                                                        disabledDate={this.disabledStartDate}
                                                        format={dateFormat}
                                                        onChange={this.onStartChange}
                                                        style={{width:220}}  
                                                    />
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                    {
                        this.state.isShowChooseProduct &&
                        <Modal
                        visible={this.state.isShowChooseProduct}
                        onOk={()=>{
                            this.onSubmission(this.state.id)
                        }}
                        onCancel={this.onHideModal}
                        closable={false}
                        //okText="确认"
                        //cancelText="取消"
                        >
                        <p style={{fontSize:16}}>提交后，只能进行查看，不能再做其它修改，您确定将此外呼任务正式提交呼叫中心吗？</p>
                        </Modal>
                        
                      }
                      
                    {
                        this.state.delOutShow &&
                        <Modal
                        visible={this.state.delOutShow}
                        onOk={()=>{
                            this.onChangeDelete(this.state.id)
                        }}
                        onCancel={this.onDelOutShow}
                        closable={false}
                        //okText="确认"
                        //cancelText="取消"
                        >
                        <p style={{fontSize:16}}>您确定删除此外呼任务吗？</p>
                        </Modal>
                        
                      }
                        <div className="space-default"></div>
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
                                    <Col span={24} className={'search-paging-control'}>
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
                )
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(ActivityManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        addOutGoingTask: bindActionCreators(addOutGoingTask, dispatch),//新增接口
        updateOutGoingTask: bindActionCreators(updateOutGoingTask, dispatch),//修改接口
        OutGoingTaskList: bindActionCreators(OutGoingTaskList, dispatch),//查询列表
        SubmissionNew: bindActionCreators(SubmissionNew, dispatch),//任务提交
        deleteOutGoingTask: bindActionCreators(deleteOutGoingTask, dispatch),//任务删除

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
