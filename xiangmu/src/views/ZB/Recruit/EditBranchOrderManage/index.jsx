//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind ,formatMoment,formatMoney} from '@/utils';

//业务接口方法引入
import { getCampusByUniversityId } from '@/actions/base';
import { getOrderList } from '@/actions/enrolStudent';
import { updateOrderBranchAndRegion } from '@/actions/enrolStudent';
import { getAscriptionList, editAdjustBranch } from '@/actions/recruit';

//业务数据视图（增、删、改、查)
import View from './View';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import ContentBox from '@/components/ContentBox';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';


class EditBranchOrderManage extends React.Component {

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
                studentName:'',
                orderSn:'',
            },
            data: [],
            totalRecord: 0,
            UserSelecteds: [],
            loading: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['order_type']);
        this.loadBizDictionary(['order_status']);
        this.loadBizDictionary(['payee_type']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
    }
    componentWillUnMount() {
        Console.log("fff")
    }
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getOrderList(condition).payload.promise.then((response) => {
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



    //table 输出列定义
    columns = [{
        title: '学生姓名',
        fixed: 'left',
        width: 120,
        dataIndex: 'realName',
    },
    {
        title: '证件号码',
        dataIndex: 'certificateNo',
        render: (text, record, index) => {
            return <div className='textleft'>{text}</div>
        }

    },
    {
        title: '订单号',
        dataIndex: 'orderSn',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
            </span>
        },
    },
    {
        title: '订单分部',
        dataIndex: 'orgName',
    },
    {
        title: '订单类型',
        dataIndex: 'orderType',
        render: (text, record, index) => {
            var orderType = record.orderType == 0 ? 1 : record.orderType
            return getDictionaryTitle(this.state.order_type, orderType);
          }
    
    },

    {
        title: '收费方',
        dataIndex: 'payeeType',
        render: (text, record, index) => {
            var payeeType = record.payeeType == 0 ? 1 : record.payeeType
            return getDictionaryTitle(this.state.payee_type, payeeType);
          }
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
        render: (text, record, index) => {
            return formatMoney(record.totalAmount);
        }
    },
    {
        title: '已缴费金额(¥)',
        dataIndex: 'paidAmount',
        render: (text, record, index) => {
            return formatMoney(record.totalAmount);
        }
    },
    {
        title: '订单审核状态',
        dataIndex: 'orderAuditStatusStr'
    },
    {
        title: '创建日期',
        width: 120,
        fixed: 'right',
        dataIndex: 'createDate',
        render: (text, record, index) => {
            return timestampToTime(record.createDate, false);
        }
    },
    ];

    handleTableChange = (pagination, filters, sorter) => {
        //const pager = this.state.pagingSearch;
        //pager.currentPage = pagination.current;
        //this.setState({ pagination: pager });
        this.fetch({
            results: pagination.pageSize,
            currentPage: pagination.currentPage,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
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
                
                case "Edit": //提交
                    if(!dataModel.regionId){
                        message.error('区域不能为空！');
                        return false;
                    }
                    this.props.updateOrderBranchAndRegion(dataModel).payload.promise.then((response) => {
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

    onBatchEdit = () => {
        this.onLookView("Edit", { ids: this.state.UserSelecteds })
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
                block_content = <View viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'ViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                 studentId={this.state.currentDataModel.studentId}
                  orderId={this.state.currentDataModel.orderId}
                  tab={3}
                />
            break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                <Input placeholder="请输入学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'证件号'} >
                                            {getFieldDecorator('certificateNo', { initialValue: this.state.pagingSearch.certificateNo })(
                                                <Input placeholder="请输入证件号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'订单号'} >
                                            {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                                <Input placeholder="请输入订单号" />
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
                            pagination={false}
                            rowKey={'orderId'}
                            rowSelection={rowSelection}
                            dataSource={this.state.data}//数据
                            onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={6}>
                                    {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchEdit} icon="tool">调整分部</Button> : <Button disabled icon="tool">调整分部</Button>}
                                </Col>
                                <Col span={18} className='search-paging-control'>
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
const WrappedEditBranchOrderManage = Form.create()(EditBranchOrderManage);

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
        getOrderList: bindActionCreators( getOrderList, dispatch),
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),
        editAdjustBranch: bindActionCreators(editAdjustBranch, dispatch),
        updateOrderBranchAndRegion: bindActionCreators(updateOrderBranchAndRegion, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedEditBranchOrderManage);
