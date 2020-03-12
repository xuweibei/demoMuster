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

//业务接口方法引入
import { getTeachCenterByBranchIdList, addTeachCenter, editTeachCenter, deleteTeachCenter, addUserByTeachCenterId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import TeachAddCenterView from '../TeachAddCenterView';
import TeacherCenterSetUserView from '../TeacherCenterSetUserView';
import TeacherCenterAddUserView from '../TeacherCenterAddUserView';
import DropDownButton from '@/components/DropDownButton';
import ContentBox from '@/components/ContentBox';



class TeachCenterManage extends React.Component {

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
                teachCenterType: '',
                teachCenterName: '',
                state: "",
            },

            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'teach_center_type']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '教学点名称',
            width: 180,
            fixed: 'left',
            dataIndex: 'teachCenterName'
        },
        {
            title: '类型',
            dataIndex: 'teachCenterType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.teach_center_type, record.teachCenterType);
            }
        },
        {
            title: '高校',
            dataIndex: 'universityName',
        },
        {
            title: '校区',
            dataIndex: 'campusName',
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
            title: '用户人数',
            dataIndex: 'count',
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                    <Button onClick={() => { this.onLookView('EditTeachCenter', { ...record }) }}>编辑</Button>
                    <Button onClick={() => { this.onLookView('EditUser', { ...record }) }}>设置用户</Button>
                </DropDownButton>
            }

        }];




    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getTeachCenterByBranchIdList(condition).payload.promise.then((response) => {
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
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Delete":
                    break;
                case "EditTeachCenter":
                    this.props.editTeachCenter(dataModel).payload.promise.then((response) => {
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
                case "AddTeachCenter":
                    this.props.addTeachCenter(dataModel).payload.promise.then((response) => {
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
                case "AddUser":
                    if (!dataModel.cancel) {
                        this.props.addUserByTeachCenterId(dataModel).payload.promise.then((response) => {
                            let data = response.payload.data;
                            if (data.result === false) {
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
                case "EditUser":
                    if (!dataModel.cancel) {
                        this.onLookView("AddUser", dataModel);
                    } else {
                        this.onSearch();
                        this.onLookView("Manage", null);
                    }
                    //提交
                    break;

            }
        }
    }

    onBatchDelete = () => {
        Modal.confirm({
            title: '是否删除所选教学点?',
            content: '点击确认删除所选教学点!否则点击取消！',
            onOk: () => {
                this.props.deleteTeachCenter({ teachCenterIds: this.state.UserSelecteds.join(',') }).payload.promise.then((response) => {
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
    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "EditTeachCenter":
            case "AddTeachCenter":
                block_content = <TeachAddCenterView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "EditUser":
            case "Delete":
                block_content = <TeacherCenterSetUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "AddUser":
                block_content = <TeacherCenterAddUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:

                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('AddTeachCenter', { teachCenterName: '', state: '', teachCenterType: '1', universityId: '', campusId: '', mobile: '', address: '', faxPhone: '', beizu: '', teachCenterId: '' }) }
                } icon="plus" className="button_dark" > 教学点</Button>);
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: record.state == 1,    // Column configuration not to be checked 
                    }),
                };

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'类    型'} >
                                            {getFieldDecorator('teachCenterType', { initialValue: this.state.pagingSearch.teachCenterType })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.teach_center_type.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'状态'} >
                                            {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                                                < Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'教学点名称'} >
                                            {getFieldDecorator('teachCenterName', { initialValue: this.state.pagingSearch.teachCenterName })(
                                                <Input placeholder="请输入教学点名称" />
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
                            rowKey={record => record.orgId}//主键
                            rowSelection={rowSelection}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1300 }}
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
const WrappedTeachCenterManage = Form.create()(TeachCenterManage);

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
        getTeachCenterByBranchIdList: bindActionCreators(getTeachCenterByBranchIdList, dispatch),
        addTeachCenter: bindActionCreators(addTeachCenter, dispatch),
        editTeachCenter: bindActionCreators(editTeachCenter, dispatch),
        deleteTeachCenter: bindActionCreators(deleteTeachCenter, dispatch),
        addUserByTeachCenterId: bindActionCreators(addUserByTeachCenterId, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachCenterManage);
