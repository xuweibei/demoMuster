/*
历史订单缴费确认
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import { env } from '@/api/env';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { studentQuery, studentCreate, studentUpdate } from '@/actions/recruit';
import { queryOrder } from '@/actions/recruit';
import { queryPageByHistory } from '@/actions/admin';

import DropDownButton from '@/components/DropDownButton';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import FeeEdit from './fee';

class HistoryOrderManage extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
    },
    data_list: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {}
  };
  constructor(){
    super();
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo']);
  }

  columns = [
    {
        title: '学生姓名',
        width:80,
        fixed:'left',
        dataIndex: 'realName'
    },
    {
        title: '订单分部',
        width:120,
        dataIndex: 'benefitBranchName'
    },
    {
        title: '订单号',
        width:200,
        dataIndex: 'orderSn'
    },
    {
        title: '项目',
        width:160,
        dataIndex: 'itemName'
    },
    {
        title: '大客户名称',
        width:120,
        dataIndex: 'orgName',
        //render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '收费方',
        width:120,
        dataIndex: 'payeeTypeStr',
    },
    {
        title: '主体',
        width:120,
        dataIndex: 'zbPayeeTypeStr',
    },
    {
        title: '订单金额(¥)',
        width:120,
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '已缴金额(¥)',
        width:120,
        dataIndex: 'paidAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        //title: '挂单金额(¥)',
        //dataIndex: 'restingAmount',
        title: '临时缴费金额(¥)',
        width:120,
        dataIndex: 'paidTempAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '创建日期',
        width:160,
        dataIndex: 'createDateStr'
    },
    {
        title: '订单状态',
        width:120,
        dataIndex: 'orderStatusStr',
    },
    {
        title: '订单类型',
        width:120,
        dataIndex: 'orderStatusStr',
        render: (value, record, index) => {
          if(record.orderType == 1){
            return <span>个人订单</span>
          }else{
            if(record.partnerClassType == 1){
              return <span>大客户方向班</span>
            }else{
              return <span>大客户精英班</span>
            }
          }
        }
    },
    // {
    //     title: '订单来源',
    //     dataIndex: 'orderSourceStr'
    // },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => {
          //编辑  缴费  废弃 查看
          //订单状态：0暂存;1审核中;2待缴费;3审核不通过;4部分缴费;5已完成;6废弃
          //<div>
          //    <Button onClick={() => { this.onLookView('ViewOrder', record); }}>查看</Button>
          //</div>
          return <DropDownButton>
                {
                  (((record.orderStatus == 2 || record.orderStatus == 4) && (record.payeeType == 1 || record.payeeType == 2))) && 
                  <Button onClick={() => { this.onLookView('FeeEdit', record) }}>缴费确认</Button>
                }
                
                <Button onClick={() => { this.onLookView('ViewOrder', record); }}>查看</Button>
            </DropDownButton>
        },
    }
  ];
  //检索数据
  fetch(params){
      if(!params){
        return;
      }
      var condition = params || this.state.pagingSearch;
      this.setState({ loading: true, pagingSearch: condition });
      this.props.queryPageByHistory(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data;
            //list.push(data.data);
            this.setState({
              data_list: list,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item || {},//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
  }

  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ViewOrder':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          //isDirection={this.state.currentDataModel.orderType == 1 && this.state.currentDataModel.partnerClassType == 1}
          tab={3}
        />
        break;
      case 'Manage':
      default:
        var list = [
                {type:'select', name: 'itemId', title: '项目', data: 'item', is_all: true},
                {type:'select', name: 'orderType', title: '订单类型', data: 'order_type', is_all: true},
                {type:'select', name: 'orderStatus', title: '订单状态', data: 'order_status', is_all: true},
                {type:'select', name: 'partnerId', title: '大客户', data: 'partner', is_all: true},
                {type:'select', name: 'payeeType', title: '收费方', data: 'payee_type', is_all: true},
                {type:'input', name: 'orderSn', title: '订单号'},
                {type:'input', name: 'realName', title: '学生姓名'},
                {type:'input', name: 'certificateNo', title: '证件号'},
                {type:'date', name: 'createDateStart', title: '创建日期起',placeholder:'开始日期'},
                {type:'date', name: 'createDateEnd', title: '创建日期止',placeholder:'结束日期'},
                {type: 'select', name: 'isTempOrder', title: '是否存在临时缴费', data: 'dic_YesNo', is_all: true},
                {type: ''}
              ];
        if(this.props.orgType != 3){
          list.splice(3, 1, {type:'org', name: 'benefitBranchId', title: '订单分部', is_all: true})
        }
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              isRecruitBatch={true}
              isItemUser={true}
              isOrderType={true}
              //isRegion={true}
              isRegion={this.props.orgType == 3 ? true : false}
              isBranchDQ={false}
              isBranchUser={false}
              isBranchAll={false}
              isOrderSource={true}
              isOrderStatus={true}
              //isBranchPartners={true}
              isOrderParnters={true}
              isPayeeType={true}
              isEsignStatus={true}
              isYesNo={true}
              form_item_list={list}
              fetch2={(params) =>this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
            />
            <div className="space-default">
            </div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{x:1800}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        )
        break;
        case 'FeeEdit':
        block_content = <FeeEdit
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          orderId={this.state.currentDataModel.orderId}
        />
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(HistoryOrderManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        queryOrder: bindActionCreators(queryOrder, dispatch),
        queryPageByHistory: bindActionCreators(queryPageByHistory, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
