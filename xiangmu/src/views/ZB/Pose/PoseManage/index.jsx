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
import { getDictionaryTitle, timestampToTime, dataBind } from '@/utils';

//业务接口方法引入
import { getPosList, editPos, addPos, getPosAccountTypeList, updateBranchBatch, importPos } from '@/actions/base';
//业务数据视图（增、删、改、查)
import PoseView from '../PoseView';
import DownloadView from '../PoseView/Download';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import DropDownButton from '@/components/DropDownButton';


class PoseManage extends React.Component {

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
                posCode: '',
                posName: '',
                posAccountType: '',
                branchId: '',
                status: '',

            },
            data: [],
            UserSelecteds: [],
            postAccount_type: [],
            totalRecord: 0,
            loading: false,
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        this.fetchPayfee()
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [{
        title: '终端编号',
        width: 120,
        fixed: 'left',
        dataIndex: 'posCode',
    },{
        title: '设备编号',
        dataIndex: 'posNum',
    },
    ,{
        title: '商户号',
        dataIndex: 'shopNum',
    },
    {
        title: '名称',
        dataIndex: 'posName'
    },
   
    {
        title: '所属分部',
        dataIndex: 'branchName',
    },
    {
        title: '发行机构',
        dataIndex: 'institution',
    },
    {
        title: '状态',
        dataIndex: 'status',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.status);
        }
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (text, record) => {
            return <DropDownButton>
                <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
            </DropDownButton>
        }

    }];

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getPosList(condition).payload.promise.then((response) => {
            let data = response.payload.data.data;
            let PosVolist = data[0].posVoList
            this.setState({ mouldUrl: data[0].mouldUrl })
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, data: PosVolist, loading: false,totalRecord:response.payload.data.totalRecord })
                console.log(JSON.stringify(this.state.data[0]))

            }
        })
    }

    //检索收费方数据
    fetchPayfee = () => {
        var that = this;
        let condition = {};

        this.props.getPosAccountTypeList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(item => {
                    list.push({
                        value: item.value,
                        title: item.title
                    });
                })
                that.setState({ postAccount_type: list })

            }
            else {
                message.error(data.message);
            }
        })
    }
    onBtchEdit = () => {
        this.onLookView('SetPatch', { posIds: this.state.UserSelecteds })
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
                    this.props.addPos(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Edit":
                    this.props.editPos(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {

                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;

                case "SetPatch":
                    this.props.updateBranchBatch(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Import":
                    this.onSearch();
                    this.onLookView("Manage", null);
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
            case "Import":
                block_content = <DownloadView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "SetPatch":
            case "Create":
            case "Edit":
            case "View":
            case 'Create':
            case "Delete":
                block_content = <PoseView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:

                //表格选择删除后处理
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false,    // Column configuration not to be checked
                    }),
                };

                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(
                    <Button onClick={() => { this.onLookView('Create', { posCode: '', posName: '', posAccountType: '', branchId: '', institution: '', remark: '', status: '' }) }
                    } icon="plus" className="button_dark" > POS机</Button>,
                );
                extendButtons.push(<Button onClick={() => { this.onLookView('Import', { mouldUrl: this.state.mouldUrl }) }
                } icon="enter" className="button_dark" > 导入</Button>, )
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                 
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'所属分部'} >
                                            {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                                                <SelectFBOrg scope={'my'} hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'状态'} >
                                            {getFieldDecorator('status', { initialValue: this.state.pagingSearch.status })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'终端名称'} >
                                            {getFieldDecorator('posName', { initialValue: this.state.pagingSearch.posName })(
                                                <Input placeholder="请输入终端名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'终端编号'} >
                                            {getFieldDecorator('posCode', { initialValue: this.state.pagingSearch.posCode })(
                                                <Input placeholder="请输入终端编号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'设备编号'} >
                                            {getFieldDecorator('posNum', { initialValue: this.state.pagingSearch.posNum })(
                                                <Input placeholder="请输入设备编号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
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
                            rowKey={'posId'}
                            rowSelection={rowSelection}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={12}>
                                    <div className='flex-row'>
                                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBtchEdit} icon="plus">批量设置分部</Button> : <Button disabled icon="plus">批量设置分部</Button>}
                                    </div>
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
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedBankAccountManage = Form.create()(PoseManage);

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
        getPosList: bindActionCreators(getPosList, dispatch),
        editPos: bindActionCreators(editPos, dispatch),
        addPos: bindActionCreators(addPos, dispatch),
        getPosAccountTypeList: bindActionCreators(getPosAccountTypeList, dispatch),
        updateBranchBatch: bindActionCreators(updateBranchBatch, dispatch),
        importPos: bindActionCreators(importPos, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedBankAccountManage);
