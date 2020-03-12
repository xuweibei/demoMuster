//标准组件环境  退费情况
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

import { getOrderRefundById } from '@/actions/recruit';

class OrderRefundInfo extends React.Component {
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
        this.props.getOrderRefundById(this.props.orderId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              var _list = data.data.studentFeeRecordList;
              _list.push({});
              this.setState({
                dataModel: data.data,
                refund_list: _list
              });
            }
            else {
                message.error(data.message);
            }
        })
      }
    }

    renderContent = (value, row, index) => {
        if(index < this.state.refund_list.length - 1){
            return value;
        }
        return {
          children: '', props: { colSpan: 1}
        }
    };

    columns_refund = [
        {
            title: '退费申请日期',
            dataIndex: 'payfeeDate',
            render: (value, record, index) => {
              if(index < this.state.refund_list.length - 1){
                return value;
              }
              return {
                children: <Row justify='end' type='flex'><span className='fontBold' style={{ marginRight: 10, }}>合计 ：</span></Row>,
                props: { colSpan: 1 },
              }
            },
        }, {
            title: '退费金额（¥）',
            dataIndex: 'money',
            render: (value, record, index) => {
              if(index < this.state.refund_list.length - 1){
                return value;
              }
              var _amount = 0;
              this.state.refund_list.map(f => {
                _amount += parseFloat(f.money || 0);
              })
              return {
                children: <Row justify='center' type='flex'><span className='fontBold'>{formatMoney(_amount)}</span></Row>,
                props: { colSpan: 1 },
              }
            }
        },
        {
          title: '退费至',
          dataIndex: 'payeeTypeStr',
          render: this.renderContent
        },
        {
            title: '退费时间',
            dataIndex: 'operateDateStr',
            render: this.renderContent
        },
        {
          title: '审核人',
          dataIndex: 'confirmName',
          render: this.renderContent
        },
        {
            title: '退费原因',
            dataIndex: 'remark',
            render: this.renderContent
        },
    ]

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;

        let block_content_refund = <ContentBox titleName='订单退费金额' >
            <div className="dv_split"></div>
            <div className="search-result-list">
                <Table columns={this.columns_refund} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.refund_list}//数据
                    bordered

                />
            </div>
            <div className="dv_split"></div>
        </ContentBox>


        let block_content = <div>
            {block_content_refund}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedOrderPayInfor = Form.create()(OrderRefundInfo);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getOrderRefundById: bindActionCreators(getOrderRefundById, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderPayInfor);
