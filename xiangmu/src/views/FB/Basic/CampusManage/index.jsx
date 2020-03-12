//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Checkbox, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getUniversityList, editUniversity, addUniversity, deleteUniversity, getUniversityByBranchId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import CampusView from '../CampusView';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';

const CheckboxGroup = Checkbox.Group;

class CampusManage extends React.Component {
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
                campusName: '',
                universityArr: ''
            },
            universityId: '',
            data: [],
            UserSelecteds: [],//项目字典
            dic_University_list: [],//高校字典
            totalRecord: 0,
            loading: false
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status',]);
        // this.fetchUniversity()
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
        title: '高校',
        dataIndex: 'universityName',
    },
    {
        title: '校区',
        dataIndex: 'campusName'
    },
    {
        title: '状态',
        dataIndex: 'state',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.state);
        }
    },
    {
        title: '地址',
        dataIndex: 'address',
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


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });

        var condition = params || this.state.pagingSearch;

        condition.itemIds = this.state.pagingSearch.itemIds;

        if(condition.universityId && condition.universityId.length){
            this.setState({ universityArr: condition.universityId });
            condition.universityId = condition.universityId[0].id;
        }else{
            condition.universityId = '';
            this.setState({ universityArr: '' });
        }

        this.props.getUniversityList(condition).payload.promise.then((response) => {
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
    onBatchDelete = () => {
        Modal.confirm({
            title: '是否删除所选记录?',
            content: '点击确认删除所选记录!否则点击取消！',
            onOk: () => {
                this.props.deleteUniversity({ campusIds: this.state.UserSelecteds.join(',') }).payload.promise.then((response) => {
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
                    this.props.addUniversity(dataModel).payload.promise.then((response) => {
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
                    this.props.editUniversity(dataModel).payload.promise.then((response) => {
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
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <CampusView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
            console.log(this.state.pagingSearch.universityArr)
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { universityId: '', state: 1, campusName: '', address: '', remark: "" }) }} icon="plus" className="button_dark">高校校区</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'高校'} >
                                            {getFieldDecorator('universityId', { initialValue:  !this.state.universityArr?[]:[{
                                                id:this.state.universityArr[0].id,
                                                name:this.state.universityArr[0].name
                                            }], })(
                                                // <Select>
                                                //     <Option value="">全部</Option>
                                                //     {this.state.dic_University_list.map((item, index) => {
                                                //         return <Option value={item.universityId} key={index}>{item.universityName}</Option>
                                                //     })}
                                                // </Select>
                                                <EditableUniversityTagGroup maxTags={1}
                                                    onChange={(value) => this.onUniversityChoose(value, 'universityId')}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={8} >
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
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="校区名称"
                                        >
                                            {getFieldDecorator('campusName', { initialValue: this.state.pagingSearch.campusName })(
                                                <Input placeholder="请输入校区名称" />
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
                            rowKey={'campusId'}
                            rowSelection={rowSelection}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={4}>
                                    <div className='flex-row'>
                                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchDelete} icon="delete">批量删除</Button> : <Button disabled icon="delete">批量删除</Button>}
                                    </div>
                                </Col>
                                <Col span={20} className='search-paging-control'>
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
const WrappedCampusManage = Form.create()(CampusManage);

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
        getUniversityList: bindActionCreators(getUniversityList, dispatch),
        editUniversity: bindActionCreators(editUniversity, dispatch),
        addUniversity: bindActionCreators(addUniversity, dispatch),
        deleteUniversity: bindActionCreators(deleteUniversity, dispatch),
        getUniversityByBranchId: bindActionCreators(getUniversityByBranchId, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCampusManage);
