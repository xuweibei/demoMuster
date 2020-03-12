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
import ContentBox from '@/components/ContentBox';
//业务接口方法引入
import { branchStudentStudyCheckList } from '@/actions/enrolStudent';


class StudentStudyManageView extends React.Component {

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
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {

            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []

        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['teach_class_type']);//课程班类型
        this.loadBizDictionary(['category_detail_study_status']);//科目学习状态
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }


    //table 输出列定义
    networkColumns = [{
        title: '开课批次',
        dataIndex: 'courseplanBatchName',
    },
    {
        title: '教学点',
        dataIndex: 'teachCentername'
    },
    {
        title: '课程班',
        dataIndex: 'courseplanName'
    },
    {
        title: '课程班类型',
        dataIndex: 'teachClassTypeName'
    },
    {
        title: '开课时段',
        dataIndex: 'timeQuantumStr'
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
        title: '预估考季',
        dataIndex: 'examDate',
    },
    {
        title: '学习情况',
        dataIndex: 'studyState',
    },
    ];

    faceTeachColumns = [{
        title: '课程名称',
        dataIndex: 'courseName',
    },
    {
        title: '所属项目',
        dataIndex: 'productName'
    },
    {
        title: '是否赠送',
        dataIndex: 'giveOrNotName'
    },
    {
        title: '激活状态',
        dataIndex: 'activeStateName'
    },
    {
        title: '激活时间',
        dataIndex: 'activeTime',
        render: text => <span>{timestampToTime(text)}</span>
    },

    {
        title: '结束时间',
        dataIndex: 'endTime',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '考试时间',
        dataIndex: 'examTime',
        render: text => <span>{timestampToTime(text)}</span>
    }
    ];

    //检索数据
    fetch = () => {
        this.props.branchStudentStudyCheckList(this.props.currentDataModel.studentCourseCategoryId).payload.promise.then((response) => {
            let data = response.payload.data;
            console.log(data.data);
            if (data.state === 'success') {
                var list = []
                if (data.data) {
                    list.push(data.data);
                }
                this.setState({
                    data: data.data,
                    loading: false
                })

            }
            else {
                this.setState({ loading: false, data: [] })
                message.error(data.message);
            }

            console.log("state: " + JSON.stringify(this.state.data.network));

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
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
    }

    onBack = () => {
        this.props.viewCallback();
    }

    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={this.onBack} icon="rollback" >返回</Button>);


                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox bottomButton={extendButtons}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="学生姓名"
                                        >
                                            {this.props.currentDataModel.studentName}

                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="性别"
                                        >
                                            {this.props.currentDataModel.sexName}

                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="证件号"
                                        >
                                            {this.props.currentDataModel.certificateNo}

                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="手机号"
                                        >
                                            {this.props.currentDataModel.mobile}
                                        </FormItem>
                                    </Col>

                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="项目"
                                        >
                                            {this.props.currentDataModel.itemName}
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
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="学习情况"
                                        >
                                            {this.props.currentDataModel.studyStateName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="是否重修"
                                        >
                                            {this.props.currentDataModel.isRestudyName}
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

                        {this.state.data.faceTeach != null && this.state.data.faceTeach != '' &&
                            <div>
                                <span>参加面授班情况</span>
                                <br />
                                <br/>
                                <Table columns={this.networkColumns} //列定义
                                    loading={this.state.loading}
                                    pagination={false}
                                    dataSource={this.state.data.faceTeach}//数据
                                    bordered
                                />
                            </div>
                        }
                        <div className="search-paging">

                        </div>

                        {this.state.data.network != null && this.state.data.network != '' &&
                            <div>
                                <span>网课学习情况</span>
                                <br/>
                                <br/>
                                <Table columns={this.faceTeachColumns} //列定义
                                    loading={this.state.loading}
                                    pagination={false}
                                    dataSource={this.state.data.network}//数据
                                    bordered
                                />
                            </div>
                        }
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(StudentStudyManageView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        branchStudentStudyCheckList: bindActionCreators(branchStudentStudyCheckList, dispatch),//查询列表接口
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
