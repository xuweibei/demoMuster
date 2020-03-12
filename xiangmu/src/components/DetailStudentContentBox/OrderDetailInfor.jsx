//标准组件环境  订单信息 
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
import { getDictionaryTitle, timestampToTime, convertTextToHtml, formatMoney } from '@/utils';

//业务接口方法引入
import { getOrderDetailInforList } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';

//操作按钮
import DropDownButton from '@/components/DropDownButton';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';


class OrderDetailInfor extends React.Component {

    columns = [
        {
            title: '订单区域',
            dataIndex: 'benefitRegionName',
            width:120,
            fixed:'left'
        }, {
            title: '创建人',
            dataIndex: 'createName',
        },
        {
            title: '创建日期',
            dataIndex: 'createDateStr',
        },
        {
            title: '订单号',
            dataIndex: 'orderSn',
        },
        {
            title: '大客户名称',
            dataIndex: 'orgName',
        },
        {
            title: '收费方',
            dataIndex: 'payeeTypeStr',
        },
        {
            title: '订单金额(¥)',
            dataIndex: 'totalAmount',
            render: (text, record, index) => {
                return formatMoney(text);
            }
        },

        {
            title: '已缴金额(¥)',
            dataIndex: 'paidAmount',
            render: (text, record, index) => {
                return formatMoney(text);
            }
        },
        {
            title: '订单状态',
            dataIndex: 'orderStatusStr',
        },
        {
            title: '电子签',
            dataIndex: 'esignStatusStr',
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                    <Button onClick={() => { this.onLookView('ViewOrderDetail', record) }}>查看</Button>
                </DropDownButton>
            }
        }
    ]
    constructor(props) {
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
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };
    }

    //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getOrderDetailInforList(this.props.studentId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    };

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
                case "Edit": //提交
            }
        }
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    componentWillUnMount() {
    }

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            default:
                block_content = (
                    <ContentBox titleName='订单信息' hideBottomBorder={false}>
                        <div className="dv_split"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                scroll={{x:1300}}
                                dataSource={this.state.data_list}//数据
                                bordered
                            /></div>
                        <div className="dv_split"></div>
                        {this.state.editMode == 'ViewOrderDetail' && <Modal className='playResource' width={'80%'}
                            title="查看订单详情"
                            wrapClassName="vertical-center-modal"
                            visible={true}
                            onCancel={() => { this.onLookView('Manage', null) }}
                            footer={null}
                        >
                            <OrderDetailView viewCallback={this.onViewCallback}
                                studentId={this.props.studentId}
                                orderId={this.state.currentDataModel.orderId}
                                tab={3}
                                isModal={true}
                            />
                        </Modal>
                        }
                    </ContentBox >
                );
                break;

        }

        return block_content;
    }
}
//表单组件 封装
const WrappedOrderDetailInfor = Form.create()(OrderDetailInfor);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getOrderDetailInforList: bindActionCreators(getOrderDetailInforList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderDetailInfor);
