
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
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { getUniversityByBranchId, participateStudentList, addActivity, updateActivity, deleteById, deleteByActivityStudentIds } from '@/actions/base';
import { postRecruitBatchList } from '@/actions/recruit';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectUniversity from '@/components/BizSelect/SelectUniversity';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import AddStudentManage from './addStudent';
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';
import ImportStudent from './importStudent';

const dateFormat = 'YYYY-MM-DD';
class StudentManage extends React.Component {

    constructor(props) {
        super(props);
        (this: any).fetch = this.fetch.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.onSearch = onSearch.bind(this);

        this.state = {
            editMode: '',
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                activityId: props.currentDataModel.activityId,
                regionOrNot: '',
                regSource: '',
                grade: '',
                orderTypes:'',
            },
            bz_recruit_batch_list: [],
            dic_University_list: [],
            isUniversity: true,
            totalRecord: 0,
            UserSelecteds: [],
            loading: false,
        };
    }
    componentWillMount() {
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'activity_type', 'reg_source', 'grade', 'is_study']);
        this.getRecruitBatchs()
        this.fetchUniversity()
        this.onSearch()
    }
    compoentDidMount() {

    }

    columns = [
        {
            title: '所属区域',
            width: 150,
            fixed: 'left',
            dataIndex: 'regionName',
        },
        {
            title: '分部',
            dataIndex: 'branchName',
        },
        {
            title: '市场人员',
            dataIndex: 'marketName',
        },

        {
            title: '学生姓名',
            dataIndex: 'studentName',
        },
        {
            title: '性别',
            dataIndex: 'sexName',
        },
        {
            title: '学生意向等级',
            dataIndex: 'gradeName',
        },
        {
            title: '学生来源',
            dataIndex: 'regSourceName',
        },
        {
            title: '目前情况',
            dataIndex: 'isStudy',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.is_study, record.isStudy);
            }
        },
        {
            title: '在读高校',
            dataIndex: 'universityName',
        },
        {
            title: '入学年份',
            dataIndex: 'studyUniversityEnterYear',
        },
        {
            title: '手机',
            dataIndex: 'phone',
        },
        {
            title: '微信',
            dataIndex: 'weixin',
        },
        {
            title: 'QQ',
            dataIndex: 'qq',
        },
        {
            title: '证件号',
            dataIndex: 'certificateNo',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
        },
        {
            title: '订单状态',
            width: 120,
            fixed: 'right',
            dataIndex: 'orderTypesName',
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

        this.props.participateStudentList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = []
                data.data = data.data || []
                data.data.map(item => {
                    item.key = item.activityStudentId;
                    list.push(item);
                })
                this.setState({
                    data_list: list,
                    totalRecord: data.totalRecord,
                    loading: false,
                    pagingSearch: condition
                })
            }
            else {
                this.setState({ loading: false, data_list: [] })
                message.error(data.message);
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
        } else {
            switch (this.state.editMode) {
                case "Create":
                    this.props.addActivity(dataModel).payload.promise.then((response) => {
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
                case 'Edit':
                    this.props.updateActivity(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'AddStudent':
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

    onBack = () => {
        this.props.viewCallback({});
    }

    //批量删除学生
    onBatchDelete = () => {
        //获取学生ids数组
        var studentIdslist = [];
        this.state.UserSelecteds.map(activityStudentId => {
            studentIdslist.push(activityStudentId)
        })

        Modal.confirm({
            title: '是否删除所选学生?',
            content: '点击确认删除所选学生!否则点击取消！',
            onOk: () => {
                this.props.deleteByActivityStudentIds({ activityStudentIds: studentIdslist.join(",") }).payload.promise.then((response) => {
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

    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Import":
                block_content = <ImportStudent viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'AddStudent':
                block_content = <AddStudentManage viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'Edit':
            case 'Create':
            case 'Manage':
            default:

                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('AddStudent', { regionName: this.props.currentDataModel.regionName, activityName: this.props.currentDataModel.activityName, activityTypeStr: this.props.currentDataModel.activityTypeStr, activityId: this.props.currentDataModel.activityId }) }
                } icon="plus" className="button_dark" > 新增学生</Button>);
                extendButtons.push(<Button onClick={() => { this.onLookView('Import', { activityName: this.props.currentDataModel.activityName, activityId: this.props.currentDataModel.activityId }) }
                } icon="upload" className="button_dark" > 上传学生</Button>);
                extendButtons.push(<FileDownloader
                    apiUrl={'/edu/activity/student/exportActivityStudentInfo'}//api下载地址
                    method={'post'}//提交方式
                    options={this.state.pagingSearch}//提交参数
                    title={'导出活动学生'}
                >
                </FileDownloader>);
                extendButtons.push(<Button onClick={this.onBack} icon='rollback' className="button_dark" >返回</Button>);
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false,    // Column configuration not to be checked
                    }),
                };

                block_content = (
                    <div>
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form">
                                    <Row justify="center" gutter={24} align="middle" type="flex">
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'区域'} >
                                                {this.props.currentDataModel.regionName}
                                            </FormItem>
                                        </Col>
                                        <Col span={12} >
                                            <FormItem {...searchFormItemLayout}
                                                label="活动名称">
                                                {this.props.currentDataModel.activityName}
                                            </FormItem>
                                        </Col>
                                        <Col span={12} >
                                            <FormItem {...searchFormItemLayout}
                                                label="活动类型">
                                                {this.props.currentDataModel.activityTypeStr}
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                                {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                    <Input placeholder='请输入学生姓名' />
                                                )}
                                            </FormItem>
                                        </Col>

                                        <Col span={12} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="本区域学生"
                                            >
                                                {getFieldDecorator('regionOrNot', { initialValue: this.state.pagingSearch.regionOrNot })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        <Option value='1' key='1'>是</Option>
                                                        <Option value='0' key='0'>否</Option>
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'市场人员'} >
                                                {getFieldDecorator('marketName', { initialValue: this.state.pagingSearch.marketName })(
                                                    <Input placeholder='请输入市场人员' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12} >
                                            <FormItem {...searchFormItemLayout} label={'学生来源'} >
                                                {getFieldDecorator('regSource', { initialValue: this.state.pagingSearch.regSource })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.reg_source.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'学生意向等级'} >
                                                {getFieldDecorator('grade', { initialValue: this.state.pagingSearch.grade })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.grade.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'学生订单情况'} >
                                                {getFieldDecorator('orderTypes', { initialValue: this.state.pagingSearch.orderTypes })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        <Option value="0" key="0">无订单</Option>
                                                        <Option value="1" key="1">已下单已缴费</Option>
                                                        <Option value="2" key="2">已下单未缴费</Option>
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12} >

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
                                dataSource={this.state.data_list}//数据
                                bordered
                                scroll={{ x: 1900 }}
                                rowSelection={rowSelection}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="end" align="middle" type="flex">
                                    <Col span={12}>
                                        <div className='flex-row'>
                                            {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchDelete} icon="delete">批量删除</Button> : <Button disabled icon="delete">批量删除</Button>}
                                        </div>
                                    </Col>
                                    <Col span={12} className={'search-paging-control'}>
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
                    </div>
                )
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        participateStudentList: bindActionCreators(participateStudentList, dispatch),//活动管理-学生-列表查询接口
        deleteByActivityStudentIds: bindActionCreators(deleteByActivityStudentIds, dispatch),//批量删除接口
        postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
        getUniversityByBranchId: bindActionCreators(getUniversityByBranchId, dispatch),
        // addActivity: bindActionCreators(addActivity, dispatch),//新增接口
        // updateActivity: bindActionCreators(updateActivity, dispatch),//修改接口
        // deleteById: bindActionCreators(deleteById, dispatch),//删除接口

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
