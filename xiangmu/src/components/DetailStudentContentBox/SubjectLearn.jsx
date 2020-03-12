//标准组件环境  科目学习情况 
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
import { getDictionaryTitle, timestampToTime, convertTextToHtml } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import Detail from './view'
import { queryCourseStudyStatus } from '@/actions/recruit';


class SubjectLearn extends React.Component {
    state = {
        currentDataModel: null,
        loading: false,
        data: [],
        dataModel: {},
        // pagingSearch: {
        //     studentId: this.props.currentDataModel.studentId,
        //     realName: '',
        // },
    };

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
    }
    columns = [
        {
            title: '项目',
            width: 120,
            fixed: 'left',
            dataIndex: 'itemName',
        }, {
            title: '科目',
            dataIndex: 'courseCategoryName',
        },
        {
            title: '授课方式',
            dataIndex: 'teachMode',
            render: (text, record, index) => {
                var teachMode=record.teachMode==0?1:record.teachMode
                return getDictionaryTitle(this.state.teachmode, teachMode);
            }
        },
        {
            title: '学习状态',
            dataIndex: 'studyStatus',
            render: (text, record, index) => {
                var studyStatus=record.studyStatus==0?1:record.studyStatus
                return getDictionaryTitle(this.state.category_detail_study_status, studyStatus);
            }
        },
        {
            title: '是否重修',
            dataIndex: 'isRestudy',
            render: (text, record, index) => {
                var isRestudy=record.isRestudy==1?'是':'否'
                return isRestudy;
            }
        },
        // {
        //     title: '成绩',
        //     dataIndex: 'examState',
        //     render: (text, record, index) => {
        //         var examState=record.examState==0?1:record.examState
        //         return getDictionaryTitle(this.state.category_exam_state, examState);
        //     }
        // },
        {
            title: '学习截止日期',
            dataIndex: 'endDate',
            render: (text, record, index) => (`${timestampToTime(record.endDate)}`)
        },
        {
            title: '最新面授批次',
            dataIndex: 'faceBatch',
        },
        {
            title: '最新课程阶段',
            dataIndex: 'itemStageName',
        },
        {
            title: '是否结课阶段',
            dataIndex: 'isFinal',
        },
        {
            title: '最新参考日期',
            dataIndex: 'examDate',
            render: (text, record, index) => {
                return timestampToTime(record.examDate);
            }
        },
        {
            title: '最新成绩',
            dataIndex: 'score',
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

    ]
    
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status','teachmode','category_detail_study_status','category_exam_state']);
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //检索数据
    fetch = () => {
        this.setState({ loading: true });
        var condition = this.props.studentId;

        this.props.queryCourseStudyStatus(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = []
                data.data = data.data || []
                data.data.map(item => {
                    item.key = item.studentCourseCategoryDetailId;
                    list.push(item);
                })
                this.setState({
                    data: list,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false, data: [] })
                message.error(data.message);
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
        let block_content_1 = <div></div>;
        switch (this.state.editMode) {
            case "View":
            block_content_1 = <Detail viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content_1 =
                <ContentBox titleName='科目学习情况' hideBottomBorder={false}>
                    <div className="dv_split"></div>
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1600 }}
                        /></div>
                    <div className="dv_split"></div>
                </ContentBox>
                break;
        }
        

        let block_content = <div>
            {block_content_1}

        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedSubjectLearn = Form.create()(SubjectLearn);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        queryCourseStudyStatus:bindActionCreators(queryCourseStudyStatus, dispatch),//根据学生id查询科目学习情况接口
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSubjectLearn);
