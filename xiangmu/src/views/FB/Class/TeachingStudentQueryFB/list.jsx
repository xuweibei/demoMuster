//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { teachingStudentTwoList } from '@/actions/course';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';

import Detail from './view'

const formItemLayout24 = {
    labelCol: { span: 12 },
    wrapperCol: { span: 6 }
};
class TeachingStudentList extends React.Component {
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
            currentDataModel: props.currentDataModel,
            dataModel: {},
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
            },
            data: [],
            totalRecord: 0,
            loading: false,
        };
    }
    componentWillMount() {
        this._isMounted = true;
        //载入需要的字典项
        //this.loadBizDictionary(['dic_Status', 'teach_center_type']);

        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
        
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    onCancel = () => {
        this.props.viewCallback();
    }

    //table 输出列定义
    columns = [{
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
            dataIndex: 'isRestudy',
            render: (text, record, index) => {
                var isRestudy=record.isRestudy==1?'是':'否'
                return isRestudy;
            }
        },
        {
            title: '最新面授批次',
            dataIndex: 'courseplanBatchName',
        },
        {
            title: '最新课程阶段',
            dataIndex: 'itemStageName',
        },
        {
            title: '是否结课阶段',
            dataIndex: 'isFinal',
            render: (text, record, index) => {
                var isFinal=record.isFinal==1?'是':'否'
                return isFinal;
            }
        },
        {
            title: '最新参考日期',
            dataIndex: 'nearestExamBatchStartTime',
            render: (text, record, index) => {
                return timestampToTime(record.nearestExamBatchStartTime);
            }
        },
        {
            title: '最新成绩',
            dataIndex: 'score',
            render: (text, record, index) => {
                var state=record.state==1?'通过':'未通过'
                return (record.score ? record.score : '0') +' / '+ state;
            }
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (text, record) => {
                return <DropDownButton>
                     <Button onClick={() => { this.onLookView('View', record) }}>查看</Button>
                </DropDownButton>
            }
        },

    ];

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.studentId = this.state.currentDataModel.studentId;
        condition.itemId = this.state.currentDataModel.itemId;
        condition.orderId = this.state.currentDataModel.orderId;
        this.props.teachingStudentTwoList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                if (this._isMounted) {
                    this.setState({ ...data, loading: false })
                }
            }
        })
    }
    //浏览视图
    onLookView = (op, item) => {
        
        this.setState({
            editMode: op,//编辑模式
            dataModel: item,//编辑对象
        });
    };

    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ dataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                
            }
        }
    }



    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "View":
                block_content = <Detail viewCallback={this.onViewCallback} {...this.state} />
                break;
           
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];

                extendButtons.push(<Button onClick={() => { this.onCancel() }
                }  icon="rollback" className="button_dark" >返回</Button>);

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'',true)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="教学点">
                                            {this.state.currentDataModel.teachCenterName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="项目">
                                            {this.state.currentDataModel.itemName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="学生姓名">
                                            {this.state.currentDataModel.studentName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="手机号">
                                            {this.state.currentDataModel.mobile}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="学号">
                                            {this.state.currentDataModel.studentNo}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="学籍时长（年）">
                                            {this.state.currentDataModel.studyPeriod}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="学籍状态">
                                            {this.state.currentDataModel.studyStatusName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="学籍开始日期">
                                            {this.state.currentDataModel.studyStartDate}
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
const WrappedTeachingStudentList = Form.create()(TeachingStudentList);

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
        teachingStudentTwoList: bindActionCreators(teachingStudentTwoList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachingStudentList);
