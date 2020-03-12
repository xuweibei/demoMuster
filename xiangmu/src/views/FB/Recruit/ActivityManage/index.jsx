
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Modal, DatePicker
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { getUniversityByBranchId, queryPage, addActivity, updateActivity, deleteById } from '@/actions/base';
import { postRecruitBatchList } from '@/actions/recruit';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectUniversity from '@/components/BizSelect/SelectUniversity';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import AddActivityView from './addActivityView';
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';
import StudentManage from './student';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
const { RangePicker } = DatePicker;

const searchFormItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
import { getCampusByUniversityId } from '@/actions/base';
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
        (this: any).getCampus = this.getCampus.bind(this);  //校区
        this.state = {
            editMode: '',
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                recruitBatchId: '',
                isUniversity: '',
                activityName: '',
                activityType: '',
                universityId: '',
                startTime: '',
                endTime: '',
                regionId: '',
            },
            bz_recruit_batch_list: [],
            dic_University_list: [],
            isUniversity: false,
            bz_campus_list: [], //校区
            totalRecord: 0,
            UserSelecteds: [],
            loading: false,
            startValue: null,
            endValue: null,
            endOpen: false,
            submitLoading: false
        };
    }
    componentDidMount(){
        document.addEventListener("keydown",this.handleEnterKey);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown",this.handleEnterKey);
    }
    handleEnterKey = (e) => {
        if(e.keyCode === 13){
            this.onSearch();
        }
    }
    
    componentWillMount() {
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'activity_type']);
        this.getRecruitBatchs()
        // this.fetchUniversity()
        // this.onSearch()
    }
    

    columns = [
        {
            title: '区域',
            dataIndex: 'regionName',
            width: 120,
            fixed: 'left',
        },
        {
            title: '活动名称',
            dataIndex: 'activityName',
        },

        {
            title: '相关高校',
            dataIndex: 'universityName',
        },
        {
            title: '活动类型',
            dataIndex: 'activityType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.activity_type, record.activityType);
            }
        },
        {
            title: '实际费用(¥)',
            dataIndex: 'costAmount',
            render: (text, record, index) => {
                return formatMoney(record.costAmount)
            }
        },
        {
            title: '负责人',
            dataIndex: 'chargeUserName',
        },
        {
            title: '主讲教师',
            dataIndex: 'teacherName',
            render: (text, record, index) => {
              return <div>{ record.teacherName } { record.englishName ? `(${record.englishName})` : '' }</div>
            }
        },
        {
            title: '参加学生',
            dataIndex: 'studentCount',
        },
        {
            title: '活动开始时间',
            dataIndex: 'startTimeStr',
        },
        {
            title: '活动结束时间',
            dataIndex: 'endTimeStr',
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>

                    <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
                    {record.studentCount == 0 &&
                        <Button onClick={() => { this.delActivity(record); }}>删除</Button>
                    }
                    <Button onClick={() => { this.onLookView('Student', record); }}>学生</Button>

                </DropDownButton>
            },
        }
    ];
    //检索数据

    getRecruitBatchs = () => {
        var that = this;
        var list = [];
        this.props.postRecruitBatchList().payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                if (list.length == 0) {
                    this.onSearchCheckedNum += 1;
                }
                data.data.map(item => {
                    list.push({
                        value: item.recruitBatchId,
                        title: item.recruitBatchName
                    });
                })
                that.setState({ bz_recruit_batch_list: list })
            }
            else {
                message.error(data.message);
            }
        })
    }

    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let startTime = condition.startTime;
        if(Array.isArray(startTime)){
            condition.startTime = startTime[0]
            condition.endTime = startTime[1]
        }
        this.props.queryPage(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            console.log(data)
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
    }
    fetchUniversity = () => {
        var that = this;
        let condition = {};

        this.props.getUniversityByBranchId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(item => {
                    list.push({
                        universityId: item.universityId,
                        universityName: item.universityName
                    });
                })
                that.setState({ dic_University_list: list })

            }
            else {
                message.error(data.message);
            }
        })
    }

    //删除
    delActivity = (record) => {
        this.props.deleteById({ activityId: record.activityId }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.onSearch();
                //进入管理页
                this.onLookView("Manage", null);
            }
        })
    }

    setSubmitLoading = (flag) => {
       this.setState({ submitLoading: flag })
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
            this.setSubmitLoading(false);
            this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
        } else {
            switch (this.state.editMode) {
                case "Create":
                    this.props.addActivity(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        this.setSubmitLoading(false);
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
                case 'Edit':
                    this.props.updateActivity(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        this.setSubmitLoading(false);
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
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

    onUniversityChoose(value, name) {

        var p = this.state.pagingSearch;

        if (value && value.length && value[0].id) {
            if (name == "universityId") {
                p[name] = value[0].id;
            }

        } else {
            p[name] = '';
        }
        this.setState({
            pagingSearch: p
        })
    }

    getCampus(universityId) {
        if (!universityId) {
            return;
        }
        let condition = { currentPage: 1, pageSize: 999, universityId: universityId };
        this.props.getCampusByUniversityId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(item => {
                    list.push({
                        title: item.campusName,
                        value: item.campusId.toString()
                    })
                })
                this.setState({ bz_campus_list: list })
            } else {
                message.error(data.message);
            }
        })
    }

    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }

    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }

    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }

    onStartChange = (value) => {
        this.onChange('startValue', value);
    }

    onEndChange = (value) => {
        this.onChange('endValue', value);
    }

    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }

    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
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
                    setSubmitLoading={this.setSubmitLoading}
                    {...this.state}
                />
                break;
            case 'Manage':
            default:

                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { recruitBatchId: this.state.pagingSearch.recruitBatchId }) }
                } icon="plus" className="button_dark" > 新增活动</Button>);
                extendButtons.push(<FileDownloader
                    apiUrl={'/edu/activity/exportActivity'}//api下载地址
                    method={'post'}//提交方式
                    options={this.state.pagingSearch}//提交参数
                    title={'导出活动'}
                >
                </FileDownloader>);

                block_content = (
                    <div>
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form">
                                    <Row justify="center" gutter={24} align="middle" type="flex">
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout}
                                                style={{ paddingRight: 12 }}
                                                label="招生季">
                                                {getFieldDecorator('recruitBatchId', {
                                                    initialValue: this.state.pagingSearch.recruitBatchId
                                                })(
                                                    <SelectRecruitBatch scope='current' hideAll={true} isFirstSelected={true} onSelectChange={(value, selectedOptions) => {
                                                        this.state.pagingSearch.recruitBatchId = value;
                                                        let currentRecruitBatch = selectedOptions;
                                                        this.setState({ pagingSearch: this.state.pagingSearch, currentRecruitBatch });
                                                        //变更时自动加载数据
                                                        this.onSearch();
                                                    }} />
                                                )}
                                            </FormItem>
                                        </Col>

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
                                            <FormItem {...searchFormItemLayout} label={'活动类型'} >
                                                {getFieldDecorator('activityType', { initialValue: dataBind(this.state.pagingSearch.activityType) })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.activity_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>

                                        <Col span={12} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="高校活动"
                                            >
                                                <div className='dv_col1'>{
                                                    getFieldDecorator('isUniversity', {
                                                        initialValue: dataBind(this.state.pagingSearch.isUniversity)
                                                    })(
                                                        <Select onChange={(value) => {
                                                            if (value == 1) {
                                                                this.setState({ isUniversity: true })
                                                            } else {
                                                                this.setState({ isUniversity: false })
                                                            }
                                                        }}>
                                                        <Option value='' key='0'>全部</Option>
                                                        <Option value='1' key='1'>是</Option>
                                                        <Option value='0' key='2'>否</Option>
                                                            {/* {this.state.dic_YesNo.map((item, index) => {
                                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                                            })} */}
                                                        </Select>
                                                    )}</div>
                                                <div className='dv_col2'>
                                                    {this.state.isUniversity && <EditableUniversityTagGroup maxTags={1}
                                                        onChange={(value) => this.onUniversityChoose(value, 'universityId')}
                                                    />
                                                    }
                                                </div>
                                            </FormItem>
                                        </Col>

                                        <Col span={12} >
                                            <FormItem {...searchFormItemLayout}
                                                label="活动名称">
                                                {getFieldDecorator('activityName', { initialValue: this.state.pagingSearch.activityName })(
                                                    <Input placeholder='请输入活动名称' />
                                                )}
                                            </FormItem>
                                        </Col>


                                        <Col span={12} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="活动日期">
                                                {getFieldDecorator('startTime', { initialValue:this.state.pagingSearch.startTime?[moment(this.state.pagingSearch.startTime,dateFormat),moment(this.state.pagingSearch.endTime,dateFormat)]:[]})(
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
        queryPage: bindActionCreators(queryPage, dispatch),//查询列表接口
        postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
        getUniversityByBranchId: bindActionCreators(getUniversityByBranchId, dispatch),
        addActivity: bindActionCreators(addActivity, dispatch),//新增接口
        updateActivity: bindActionCreators(updateActivity, dispatch),//修改接口
        deleteById: bindActionCreators(deleteById, dispatch),//删除接口
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),//删除接口

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
