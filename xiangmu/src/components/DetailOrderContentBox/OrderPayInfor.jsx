//标准组件环境  缴费情况
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
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import TopUserName from './TopUserName'

import { getOrderFeeById } from '@/actions/recruit';

class OrderPayInfor extends React.Component {
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
        (this: any).fetchOrderFeeById = this.fetchOrderFeeById.bind(this);

        this.state = {
            dataModel: {},
            loading: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        this.fetchOrderFeeById();
    }
    componentWillUnMount() {
    }
    fetchOrderFeeById(){
      if(this.props.orderId){
        this.props.getOrderFeeById(this.props.orderId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              var _office = data.data.studentPayfeeFormalList;
              var _temp = data.data.studentPayfeeTemporaryList;
              _office.push({});
              _temp.push({});
              this.setState({
                dataModel: data.data,
                fee_office_list: _office,
                fee_temp_list: _temp,
                is_order_close: data.data.orderStatus == 7
              });
            }
            else {
                message.error(data.message);
            }
        })
      }
    }

    renderContent = (value, row, index) => {
        /*const obj = {
            children: value,
            props: {},
        };
        if (index === this.state.fee_office_list.length - 1) {
            obj.props.colSpan = 0;
        }
        return obj;*/

        if(index < this.state.fee_office_list.length - 1){
            return value;
        }
        return {
          children: '', props: { colSpan: 1}
        }
    };
    renderContent_1 = (value, row, index) => {
        /*const obj = {
            children: value,
            props: {},
        };
        if (index === this.state.fee_temp_list.length - 1) {
            obj.props.colSpan = 0;
        }
        return obj;*/
        if(index < this.state.fee_temp_list.length - 1){
            return value;
        }
        return {
          children: '', props: { colSpan: 1}
        }
    };
    columns = [
        {
            title: '缴费日期',
            dataIndex: 'payDateStr',
            render: (value, record, index) => {
              if(index < this.state.fee_office_list.length - 1){
                return value;
              }
              return {
                children: <Row justify='end' type='flex'><span className='fontBold' style={{ marginRight: 10, }}>合计 ：</span></Row>,
                props: { colSpan: 1 },
              }
            },
        }, {
            title: '缴费金额（¥）',
            dataIndex: 'money',
            render: (value, record, index) => {
              if(index < this.state.fee_office_list.length - 1){
                return value;
              }
              var _amount = 0;
              this.state.fee_office_list.map(f => {
                _amount += parseFloat(f.money || 0);
              })
              return {
                children: <Row justify='center' type='flex'><span className='fontBold'>{formatMoney(_amount)}</span></Row>,
                props: { colSpan: 1 },
              }
            }
        },
        {
            title: '支付方式',
            dataIndex: 'paymentWayStr',
            render: this.renderContent
        },
        {
            title: '收费方',
            dataIndex: 'payeeType',
            render: this.renderContent
        },
        {
            title: '业绩分部',
            dataIndex: 'benefitBranchName',
            render: this.renderContent
        },
        {
            title: '缴费分部',
            dataIndex: 'branchName',
            render: this.renderContent
        },
        {
            title: '员工工号',
            dataIndex: 'userNumber',
            render: this.renderContent
        },
    ]
    columns_1 = [
        {
            title: '缴费日期',
            dataIndex: 'payDateStr',
            render: (value, record, index) => {
              if(index < this.state.fee_temp_list.length - 1){
                return value;
              }
              return {
                children: <Row justify='end' type='flex'><span className='fontBold' style={{ marginRight: 10, }}>合计 ：</span></Row>,
                props: { colSpan: 1 },
              }
            },
        }, {
            title: '缴费金额（¥）',
            dataIndex: 'money',
            render: (value, record, index) => {
              if(index < this.state.fee_temp_list.length - 1){
                return value;
              }
              var _amount = 0;
              this.state.fee_temp_list.map(f => {
                _amount += parseFloat(f.money || 0);
              })
              return {
                children: <Row justify='center' type='flex'><span className='fontBold'>{formatMoney(_amount)}</span></Row>,
                props: { colSpan: 1 },
              }
            }
        },
        {
            title: '支付方式',
            dataIndex: 'paymentWayStr',
            render: this.renderContent_1
        },
        {
            title: '收费方',
            dataIndex: 'payeeType',
            render: this.renderContent_1
        },
        {
            title: '业绩分部',
            dataIndex: 'benefitBranchName',
            render: this.renderContent_1
        },
        {
            title: '缴费分部',
            dataIndex: 'branchName',
            render: this.renderContent_1
        },
        {
            title: '员工工号',
            dataIndex: 'userNumber',
            render: this.renderContent_1
        },
    ]

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;

        let block_content_office = <ContentBox titleName='正式缴费信息：' hideBottomBorder={true}>
            <div className="dv_split"></div>
            <div className="search-result-list">
                <Table columns={this.columns} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.fee_office_list}//数据
                    bordered
                />
            </div>
            <div className="dv_split"></div>
        </ContentBox>
        var _title = this.state.is_order_close ? "临时缴费信息（因退学已进行退费）：" : "临时缴费信息";
        let block_content_temp = <ContentBox titleName={_title} hideBottomBorder={true}>
            <div className="dv_split"></div>
            <div className="search-result-list">
                <Table columns={this.columns_1} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.fee_temp_list}//数据
                    bordered
                />
            </div>
            <div className="dv_split"></div>
        </ContentBox>

        let block_content = <div>
            {block_content_office}
            {block_content_temp}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedOrderPayInfor = Form.create()(OrderPayInfor);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getOrderFeeById: bindActionCreators(getOrderFeeById, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderPayInfor);
