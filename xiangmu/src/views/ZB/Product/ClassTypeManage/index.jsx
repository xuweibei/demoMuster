//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Checkbox } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getClassList, editClass, addClass, getAllStudyAgreement } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ClassTypeView from '../ClassTypeView';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';

const CheckboxGroup = Checkbox.Group;

class ClassTypeManage extends React.Component {

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
                state: "",
                classTypeName: '',
                studyAgreementId: '',
                classTypeType: ''

            },
            data: [],
            dic_StudyAgreement: [],//项目字典
            dic_item_list: [],
            totalRecord: 0,
            loading: false

        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status','class_type_type']);
        this.fetchStudyAgreementList();
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
        title: '班型',
        dataIndex: 'classTypeName',
    },
    {
        title: '班型类型',
        dataIndex: 'classTypeType',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.class_type_type, record.classTypeType);
        }
    },
    {
        title: '状态',
        width: 50,
        dataIndex: 'state',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.state);
        }
    },
    {
        title: '相关项目',
        dataIndex: 'itemName',
    },
    {
        title: '协议类型',
        dataIndex: 'studyAgreementName',
    },

    {
        title: '操作',
        key: 'action',
        render: (text, record) => {
            return <DropDownButton>
                <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
            </DropDownButton>
        }
    }];

    //检索项目列表数据
    fetchStudyAgreementList = () => {
        let condition = { currentPage: 1, pageSize: 999, state: '' };
        this.props.getAllStudyAgreement(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_StudyAgreement: data.data.map((a) => { return { title: a.studyAgreementName, value: a.studyAgreementId.toString() } }) });
            }
        })
    }
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });

        var condition = params || this.state.pagingSearch;

        // condition.itemIds = this.state.pagingSearch.itemIds

        this.props.getClassList(condition).payload.promise.then((response) => {
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

    // onChange = (checkedValues) => {
    //     this.state.pagingSearch.itemIds = checkedValues.join(',')
    // }

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
        else {
            switch (this.state.editMode) {
                case "Create":
                    this.props.addClass(dataModel).payload.promise.then((response) => {
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
                case "Edit": //提交
                    this.props.editClass(dataModel).payload.promise.then((response) => {
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
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <ClassTypeView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { studyAgreementId: '', state: 1, itemIds: '', classTypeName: '' }) }} icon="plus" className="button_dark">班型</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'班型'} >
                                            {getFieldDecorator('classTypeName', { initialValue: this.state.pagingSearch.classTypeName })(
                                                <Input placeholder="请输入班型" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem

                                            {...searchFormItemLayout}
                                            label="协议类型"
                                        >
                                            {getFieldDecorator('studyAgreementId', { initialValue: this.state.pagingSearch.studyAgreementId })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_StudyAgreement.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem

                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="班型类型"
                                        >
                                            {getFieldDecorator('classTypeType', { initialValue: this.state.pagingSearch.classTypeType })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.class_type_type.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={24} >
                                        <FormItem
                                            {...searchFormItemLayout24}
                                            style={{ paddingRight: 18 }}
                                            label="相关项目"
                                        >
                                            {getFieldDecorator('itemIds', { initialValue: this.state.pagingSearch.itemIds })(
                                                <SelectItem scope='all' hideAll={false} scope='my' showCheckBox={true} />
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
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: this.columns.length > 7 ? 1300 : 0 }}
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
const WrappedClassTypeManage = Form.create()(ClassTypeManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { userId } = state.auth.currentUser.user;
    return { Dictionarys, userId };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getClassList: bindActionCreators(getClassList, dispatch),
        editClass: bindActionCreators(editClass, dispatch),
        addClass: bindActionCreators(addClass, dispatch),
        getAllStudyAgreement: bindActionCreators(getAllStudyAgreement, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedClassTypeManage);
