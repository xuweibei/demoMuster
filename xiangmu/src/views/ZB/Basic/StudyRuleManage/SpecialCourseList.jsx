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
import { specialCourseList, specialCourseUpd, specialCourseAdd, studyRuleDel } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';

import SpecialCourseUpd from './specialCourseUpd';
import SpecialCourseAdd from './specialCourseAdd';

const formItemLayout24 = {
    labelCol: { span: 12 },
    wrapperCol: { span: 6 }
};
class SpecialCourseList extends React.Component {
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
            pagingSearch: props.pagingSearch,
            data: [],
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
            dataIndex: 'courseName',
        }, 
        {
            title: '年籍长度（年）',
            dataIndex: 'studyPeriod',
            render: (text, record, index) => {
                return `${record.studyPeriod / 12}`
            }
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (text, record) => {
                return <DropDownButton>
                     <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                    <Button onClick={() => { this.onDeltet(record.studyRoleId) }}>删除</Button>
                </DropDownButton>
            }
        },

    ];

    onDeltet = (studyRoleId) => {
        Modal.confirm({
            title: '是否删除所选科目?',
            content: '点击确认删除所选科目!否则点击取消！',
            onOk: () => {
                let params = { studyRuleId: studyRoleId }
                this.props.studyRuleDel(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        this.onSearch();
                    }
                })
            }
        })
    };
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = this.props.pagingSearch;
        this.props.specialCourseList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                if (this._isMounted) {
                    this.setState({ pagingSearch: condition, ...data, loading: false })
                }
            }
        })
    }
    //浏览视图
    onLookView = (op, item) => {
        if(item){
            item.title = this.props.currentItem.title;
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
                case "Delete":
                    break;
                case "Create":
                    this.props.specialCourseAdd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            // 进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Edit":
                    this.props.specialCourseUpd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error(data.message);
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
        console.log(this.state,this.props)
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
                block_content = <SpecialCourseAdd viewCallback={this.onViewCallback} {...this.state} batch = {this.props}/>
                break;
            case "Edit":
                block_content = <SpecialCourseUpd viewCallback={this.onViewCallback} {...this.state} batch = {this.props}/>
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];

                extendButtons.push(<Button onClick={() => { this.onLookView('Create', {}) }
                } icon="plus" type="primary" >新增特殊科目</Button>);

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
                                            {...searchFormItemLayout}
                                            label="批次">
                                            {this.props.batchArrNext.batchName?this.props.batchArrNext.batchName:this.props.batchArrNext.props?this.props.batchArrNext.props.children:''}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="项目">
                                            {this.props.currentItem.title}
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
                        />
                        
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedSpecialCourseList = Form.create()(SpecialCourseList);

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
        specialCourseList: bindActionCreators(specialCourseList, dispatch),
        studyRuleDel: bindActionCreators(studyRuleDel, dispatch),
        specialCourseUpd: bindActionCreators(specialCourseUpd, dispatch),
        specialCourseAdd: bindActionCreators(specialCourseAdd, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSpecialCourseList);
