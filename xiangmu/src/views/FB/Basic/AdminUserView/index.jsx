//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Layout, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getUniversitiesByUser, delUserUniversity } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';



class AdminUserView extends React.Component {


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
                userId: props.currentDataModel.userId,
            },
            data: [],
            totalRecord: 0,
            loading: false,

        };
        console.log(JSON.stringify(props.currentDataModel))
    }
    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '高校名称',
　　　　　　 width:280,
            dataIndex: 'universityName'
        },
        {
            title: '高校级别',
            dataIndex: 'universityLevelName',
        },

        {
            title: '所在省市',
            dataIndex: 'areaName'
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (text, record) => (
                <Button onClick={() => { this.onDeltet(record.universityId) }}>删除</Button>
            ),
        }

    ];


    onAdd = () => {
        this.props.viewCallback({ userIds: [this.state.dataModel.userId], universityIds: [], });//合并保存数据
    }
    onCancel = () => {
        this.props.viewCallback({ userIds: '', universityIds: '', cancel: true });//合并保存数据
    }
    onDeltet = (universityId) => {
        let params = { userId: this.state.dataModel.userId, universityId: universityId }
        this.props.delUserUniversity(params).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.onSearch();
            }
        })
    }

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getUniversitiesByUser(condition).payload.promise.then((response) => {

            let data = response.payload.data.data.universities;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, data: data, loading: false })
            }
        })
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        //除查询外，其他扩展按钮数组
        let extendButtons = [];

        block_content = (<div>
            <ContentBox titleName='用户信息'>
                <Form
                    className="search-form"
                >
                    <Row justify="center" gutter={24} align="middle" type="flex">
                        <Col span={8}>
                            <FormItem {...searchFormItemLayout} label={'姓名'} style={{ marginBottom: 0 }}>
                                {this.state.dataModel.user.realName}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...searchFormItemLayout} label={'工号'} style={{ marginBottom: 0 }}>
                                {this.state.dataModel.user.loginName}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...searchFormItemLayout} label={'所属部门'} style={{ marginBottom: 0 }}>
                                {this.state.dataModel.department}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>

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
                <div className="space-default"></div>
                <div className="search-paging">
                    <Row justify="center" align="middle" type="flex">
                        <Button onClick={this.onAdd} icon="plus">新增负责高校</Button>
                        <div className="split_button"></div>
                        <Button onClick={this.onCancel} icon="rollback">返回</Button>
                    </Row>
                </div>
            </div>
        </div>);


        return block_content;
    }
}
//表单组件 封装
const WrappedAdminUserView = Form.create()(AdminUserView);

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
        getUniversitiesByUser: bindActionCreators(getUniversitiesByUser, dispatch),
        delUserUniversity: bindActionCreators(delUserUniversity, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserView);
