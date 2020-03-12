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
import { getUserByAreaList, deleteUserByUsersId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';

import {
    queryMaterialVoList,
    addOrRemoveChildMaterials
} from '@/actions/material';


class MaterialVoSetUserView extends React.Component {
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
            title: '资料名称',
            width: 220,
            fixed: 'left',
            dataIndex: 'materialName'
        },
        {
            title: '项目',
            dataIndex: 'itemName',
            width:100,
        },
        {
            title: '科目',
            dataIndex: 'courseCategoryName',
            width:100,
        },
        {
            title: '课程',
            dataIndex: 'courseName',
        },
        {
            title: '资料类型',
            width: 100,
            dataIndex: 'materialType',
        },
        {
            title: '状态',
            width: 80,
            dataIndex: 'materialStatus',
        },
        {
            title: '外购',
            width: 80,
            dataIndex: 'isOutside',
        },
        {
            title: '创建人',
            width:120,
            dataIndex: 'founder',
        },
        {
            title: '最新修改人',
            width:120,
            dataIndex: 'modifier',
        },
        {
            title: '最新修改日期',
            fixed: 'right',
            width:120,
            dataIndex: 'modifyDate',
            render: (text, record, index) => {
                return timestampToTime(record.modifyDate);
            }
        },
      ];


    onSubmit = () => {
        this.props.viewCallback(this.state.dataModel);
    }
    onCancel = () => {
        this.props.viewCallback({ cancel: true });
    }

    onBatchDelete = () => {
        Modal.confirm({
            title: '已使用的资料不能被删除，可以做停用处理，信息删除后将不能恢复，是否确定删除选定资料信息?',
            content: '点击确认删除所选资料!否则点击取消！',
            onOk: () => {
                this.props.addOrRemoveChildMaterials({ materialId: this.state.dataModel.materialId, childMaterialIds: this.state.UserSelecteds.join(','), delFlag: 1 }).payload.promise.then((response) => {
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

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.materialId = this.state.dataModel.materialId;
        this.props.queryMaterialVoList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
            if(data.data.childMaterials){
                this.setState({
                    ...data.data.childMaterials,
                    loading: false,
                    pagingSearch: condition
                })
            }else{
                this.setState({
                    data: [],
                    totalRecord: 0,
                    loading: false,
                    pagingSearch: condition,
                })
                
            }
            
        }
        else {
            this.setState({ loading: false })
            message.error(data.message);
        }
        })
    }
    


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        //除查询外，其他扩展按钮数组
        let extendButtons = [];
        extendButtons.push(
            <Button onClick={this.onSubmit} icon="plus" className="button_dark" >增加</Button>,
            <Button onClick={this.onCancel} icon="rollback" className="button_dark" > 返回</Button>

        );
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
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'',true)}>
                {!this.state.seachOptionsCollapsed &&
                    <Form
                        className="search-form"
                    >
                        <Row justify="center" gutter={24} align="middle" type="flex">
                             <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="资料名称"
                                >
                                    {this.state.dataModel.materialName}
                                </FormItem>
                                </Col>
                                <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {this.state.dataModel.materialStatus}
                                </FormItem>
                                </Col>
                                <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属项目"
                                >
                                    {this.state.dataModel.itemName}
                                </FormItem>
                                </Col>
                                <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属科目"
                                >
                                    {this.state.dataModel.courseCategoryName}
                                </FormItem>
                                </Col>
                                <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="所属课程"
                                >
                                    {this.state.dataModel.courseName}
                                </FormItem>
                                </Col>
                                <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="打包资料"
                                >
                                    {this.state.dataModel.isPack}
                                </FormItem>
                                </Col>
                                <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="教师"
                                >
                                    {this.state.dataModel.teacher}
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
                <p style={{paddingBottom:20}}>包含子资料信息：</p>
                <Table columns={this.columns} //列定义
                    loading={this.state.loading}
                    rowKey={'materialId'}
                    rowSelection={rowSelection}
                    pagination={false}
                    dataSource={this.state.data}//数据
                    bordered
                    scroll={{ x: 1400 }}
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


        return block_content;
    }
}
//表单组件 封装
const WrappedMaterialVoSetUserView = Form.create()(MaterialVoSetUserView);

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
        getUserByAreaList: bindActionCreators(getUserByAreaList, dispatch),
        deleteUserByUsersId: bindActionCreators(deleteUserByUsersId, dispatch),
        queryMaterialVoList: bindActionCreators(queryMaterialVoList, dispatch),
        addOrRemoveChildMaterials: bindActionCreators(addOrRemoveChildMaterials, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMaterialVoSetUserView);
