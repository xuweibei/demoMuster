//标准组件环境  缴费信息 
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
import { getDictionaryTitle, timestampToTime, convertTextToHtml,formatMoney } from '@/utils';

//业务接口方法引入
import { getStudentFeeRecordByStudentIdList } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';


class Payment extends React.Component {
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
            loading: false,
            data_payment_list: [],
            data_refund_list: []
        };
        
    }

    columns_payment = [
        {
            title: '缴费日期',
            dataIndex: 'payfeeDate',
        }, {
            title: '缴费金额（¥）',
            dataIndex: 'money',
            render: (text, record, index) => {
                return formatMoney(record.money);
            }
        },
        {
            title: '支付方式',
            dataIndex: 'payTypeStr',
        },
        {
            title: '缴费分部',
            dataIndex: 'branchName',
        },
        {
            title: '员工工号',
            dataIndex: 'userNumber',
        },

    ]
    columns_refund = [
        {
            title: '退费申请日期',
            dataIndex: 'payfeeDate',
        }, {
            title: '退费金额（¥）',
            dataIndex: 'money',
            render: (text, record, index) => {
                return formatMoney(record.money);
            }
        },
        {
            title: '退费原因',
            dataIndex: 'changeTypeStr',
        },
    ]

     //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getStudentFeeRecordByStudentIdList(this.props.studentId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    data_payment_list: data.data.payment,
                    data_refund_list:data.data.refund,
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
    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.fetch();
    }

    componentWillUnMount() {
    }

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content_1 =
            <ContentBox titleName='订单已缴金额' hideBottomBorder={true}>
                <div className="dv_split"></div>
                <div className="search-result-list">
                    <Table columns={this.columns_payment} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data_payment_list}//数据
                        bordered
                    /></div>
                <div className="dv_split"></div>
            </ContentBox>

        let block_content_2 =
            <ContentBox titleName='订单退费金额' hideBottomBorder={false}>
                <div className="dv_split"></div>
                <div className="search-result-list">
                    <Table columns={this.columns_refund} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data_refund_list}//数据
                        bordered
                    /></div>
                <div className="dv_split"></div>
            </ContentBox>

        let block_content = <div>
            {block_content_1}
            {block_content_2}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedPayment = Form.create()(Payment);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getStudentFeeRecordByStudentIdList:bindActionCreators(getStudentFeeRecordByStudentIdList,dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPayment);
