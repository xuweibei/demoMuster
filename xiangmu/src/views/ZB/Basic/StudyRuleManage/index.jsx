/*
学服学务>基础管理>学籍规则管理
*/

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
import { getStudyRuleList, studyRuleUpd, studyRuleDel, specialCourseList,BatchDropDown} from '@/actions/base';
//业务数据视图（增、删、改、查)

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';

import StudyRuleView from '../StudyRuleView';
import SpecialCourseList from './SpecialCourseList';

class StudyRuleManage extends React.Component {
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
            batchArrNext:[],
            batchArr:[],
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                itemId: '',
                batchId:''
            },
            data: [],
            loading: false,
            specialCourseList: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        //this.loadBizDictionary(['dic_Status', 'teach_center_type']);

        //首次进入搜索，加载服务端字典项内容
        //this.onSearch();
        this.BatchList()
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '批次',
            dataIndex: 'batchName', 
        },
        {
            title: '科目数(包含)',
            dataIndex: 'courseCategoryBeginNum',
            render: (text, record, index) => {
                if (!record.courseCategoryEndNum) {
                    return `${record.courseCategoryBeginNum}科及以上`
                }
                else {
                    return `${record.courseCategoryBeginNum}-${record.courseCategoryEndNum}`
                }
            }
        },
        {
            title: '学籍长度(年)',
            dataIndex: 'studyPeriod',
            render: (text, record, index) => {
                return `${record.studyPeriod / 12}`
            }
        },
        // {
        //     title: '操作',
        //     key: 'action',
        //     // fixed: 'right',
        //     width: 200,
        //     render: (text, record) => (
        //         <Row justify="space-around" type="flex">
        //             <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
        //             <Button onClick={() => { this.onDeltet(record.studyRuleId) }}>删除</Button>
        //         </Row>
        //     ),
        // },

    ];
    BatchList= () => {
        this.props.BatchDropDown({}).payload.promise.then((response) => {
            let data = response.payload.data; 
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                if(data.data.length){
                    this.state.pagingSearch.batchId = data.data[0].studyRuleBatchId;
                    this.setState({
                        pagingSearch:this.state.pagingSearch,
                        batchArrNext:data.data[0]
                    })
                }
                this.setState({ batchArr: data.data, loading: false })
            }
        })
    }
    //检索数据
    fetch = (params = {}) => {
        var condition = params || this.state.pagingSearch;
        if(!condition.batchId)return message.warning('批次为必填项！')
        this.setState({ loading: true });
        this.props.getStudyRuleList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
        this.props.specialCourseList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                data = data.data;
                this.setState({ pagingSearch: condition, specialCourseList: data, loading: false })
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
        var condition = this.state.pagingSearch;
        this.props.specialCourseList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                data = data.data;
                this.setState({ specialCourseList: data, loading: false })
            }
        })

        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            if(dataModel.del){
                let params = { studyRuleId: dataModel.studyRuleId }
                this.props.studyRuleDel(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        this.onSearch();
                        this.onLookView("Manage", null);
                    }
                })
                return;
            }

            switch (this.state.editMode) {
                case "Delete":
                    break;
                case "Add":
                    break;
                case "Edit":
                    this.props.studyRuleUpd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error('修改的各科目数不能重叠,且不能两条规则的前一条结束和后一条结束不能存在跳跃的科目数');
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })

                    break;
                case "SpecialItem":
                    if (!dataModel.cancel) {
                        this.props.addUserByAreaId(dataModel).payload.promise.then((response) => {
                            let data = response.payload.data;
                            if (data.state != 'success') {
                                message.error(data.message);
                            }
                            else {
                                //进入设置用户页
                                this.onLookView("EditUser", dataModel);
                            }
                        })
                    } else {

                        this.onLookView("EditUser", dataModel);
                    }
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
           
            break;
            case "Edit":
                block_content = <StudyRuleView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "SpecialItem":
                 block_content = <SpecialCourseList viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
               
                extendButtons.push(<Button onClick={() => { this.onLookView('Edit', this.state.data) }} icon="edit" className="button_dark">编辑</Button>);

                extendButtons.push(<Button onClick={() => {
                    this.onLookView('SpecialItem', this.state.specialCourseList) }} icon="exclamation-circle-o" className="button_dark">特殊科目({ this.state.specialCourseList.length })</Button>);

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'批次'} > 
                                            {getFieldDecorator('batchId', { initialValue: this.state.pagingSearch.batchId })(
                                                <Select
                                                    onChange={(value, selectOptions) => {
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ batchArrNext: selectOptions }, () => {
                                                            //变更时自动加载数据
                                                            // this.onSearch();
                                                        })
                                                    }} 
                                                > 
                                                    {
                                                        this.state.batchArr.map(item=>{
                                                            return <Option value={item.studyRuleBatchId}>{item.batchName}</Option>
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'项目'} >
                                            {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                                                <SelectItem scope={'my'} hideAll={true}
                                                    isFirstSelected={true}
                                                    hidePleaseSelect={true}
                                                    onSelectChange={(value, selectOptions) => {
                                                        this.state.pagingSearch.itemId = value;
                                                        this.setState({ pagingSearch: this.state.pagingSearch, currentItem: selectOptions }, () => {
                                                            //变更时自动加载数据
                                                            // this.onSearch();
                                                        })
                                                    }} />
                                            )}
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
                            rowKey={'studyRuleId'}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                        />
                        <div className="space-default"></div>
                        {/* <div className="search-paging">
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
                        </div> */}
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedStudyRuleManage = Form.create()(StudyRuleManage);

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
        getStudyRuleList: bindActionCreators(getStudyRuleList, dispatch),
        studyRuleDel: bindActionCreators(studyRuleDel, dispatch),
        studyRuleUpd: bindActionCreators(studyRuleUpd, dispatch),
        specialCourseList: bindActionCreators(specialCourseList, dispatch),
        BatchDropDown: bindActionCreators(BatchDropDown, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudyRuleManage);
