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
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getUserByNotTeachList } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';



class TeacherCenterAddUserView extends React.Component {
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
            dataModel: props.currentDataModel,//数据模型
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                realName: '',
                department: '',
                teachCenterId: props.currentDataModel.teachCenterId,

            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '姓名',
            width: 120,
            fixed:'left',
            dataIndex: 'realName'
        },
        {
            title: '工号',
            dataIndex: 'loginName',
        },

        {
            title: '部门',
            dataIndex: 'department'
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.state);
            }
        },
        {
            title: '电话',
            dataIndex: 'mobile'
        },
        {
            title: '邮箱',
            width: 120,
            dataIndex: 'email',
            fixed:'right',
        },


    ];


    onSubmit = () => {
        this.props.viewCallback({ teachCenterId: this.state.dataModel.teachCenterId,teachCenterName:this.state.dataModel.teachCenterName,orgId: this.state.dataModel.teachCenterId, userIds: this.state.UserSelecteds.join(',') });
    }
    onCancel = () => {
        this.props.viewCallback({ orgId: this.state.dataModel.teachCenterId,teachCenterName:this.state.dataModel.teachCenterName,cancel:true});
    }


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getUserByNotTeachList(condition).payload.promise.then((response) => {
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


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        //除查询外，其他扩展按钮数组
        let extendButtons = [];

        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
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

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="姓　　名"
                                >
                                    {getFieldDecorator('realName', {
                                        initialValue: this.state.pagingSearch.realName,
                                    })(
                                        <Input placeholder='请输入姓名'/>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="部   门"
                                >
                                    {getFieldDecorator('department', {
                                        initialValue: this.state.pagingSearch.department,
                                    })(
                                        <Input placeholder='请输入部门'/>
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
                    rowKey={'userId'}
                    rowSelection={rowSelection}
                    pagination={false}
                    dataSource={this.state.data}//数据
                    bordered
                    scroll={{ x: 1300 }}
                />
                <div className="space-default"></div>
                <div className="search-paging">
                    <Row justify="space-between" align="middle" type="flex">
                         <Col span={6}>
                            <Button onClick={this.onSubmit} icon="enter">确定</Button>
                            <div className="split_button"></div>
                            <Button onClick={this.onCancel} icon="rollback">返回</Button>
                        </Col>
                        <Col span={12} className='search-paging-control'>
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


        return block_content;
    }
}
//表单组件 封装
const WrappedTeacherCenterAddUserView = Form.create()(TeacherCenterAddUserView);

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
        getUserByNotTeachList: bindActionCreators(getUserByNotTeachList, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeacherCenterAddUserView);
