/*
订单收费方变更申请管理
2018-10-15
zhujunying
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import { env } from '@/api/env';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { orderPayeeChangeList, OrderPayeeChangeDelete } from '@/actions/recruit';

import AddPayeeChange from './AddPayeeChange';
import PayeeChangeDetailView from './view';
import DropDownButton from '@/components/DropDownButton';

class OrderPayeeChangeApply extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
    },
    data_list: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {},
    isShowQrCodeModal: false,
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
        title: '订单区域',
        width:150,
        fixed:'left',
        dataIndex: 'regionName'
    },
    {
        title: '订单号',
        dataIndex: 'orderSn'
    },
    {
        title: '学生姓名',
        width: 100,
        dataIndex: 'studentName'
    },
    {
        title: '大客户名称',
        dataIndex: 'partnerName',
        //render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '原收费方',
        dataIndex: 'oldOrderPayeeTypeName',
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '变更收费方',
        dataIndex: 'newOrderPayeeTypeName',
    },
    {
        title: '创建人',
        dataIndex: 'applyUserName',
    },
    {
        title: '申请日期',
        dataIndex: 'applyDate'
    },
    {
        title: '审核情况',
        dataIndex: 'auditStatusName',
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          //编辑  缴费  废弃 查看
          //订单状态：0暂存;1审核中;2待缴费;3审核不通过;4部分缴费;5已完成;6废弃
          <DropDownButton>
              {
                (record.auditStatus == 1) ?
                <Button onClick={() => { this.onDeltet(record.orderPayeeChangeId); }}>删除</Button>
                : <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
              }
          </DropDownButton>
        ),
    }
  ];
  //检索数据
  fetch(params){
      if(!params){
        return;
      }
      var condition = params || this.state.pagingSearch;
      this.setState({ loading: true, pagingSearch: condition });
      this.props.orderPayeeChangeList(condition).payload.promise.then((response) => {
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

  //删除操作
  onDeltet = (orderPayeeChangeId) => {
      Modal.confirm({
          title: '是否删除当前变更申请?',
          content: '点击确认删除当前变更申请!否则点击取消！',
          onOk: () => {
              let params = { orderPayeeChangeId: orderPayeeChangeId }
              this.props.OrderPayeeChangeDelete(params).payload.promise.then((response) => {
                  let data = response.payload.data;
                  if (data.state != 'success') {
                      this.setState({ loading: false })
                      message.error(data.message);
                  }
                  else {
                      message.success('删除成功！');
                      this.onSearch();
                  }
              })
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
      case 'Create':
          block_content = <AddPayeeChange
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode}
            studentId={this.state.currentDataModel.studentId}
            onNextView={this.onNextView}
          />
        break;
      case 'View':
        block_content = <PayeeChangeDetailView viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          currentDataModel={this.state.currentDataModel}
        />
        break;
      case 'Manage':
      default:
        var list = [
                {type:'select', name: 'regionId', title: '订单区域', data: 'region', value: this.state.pagingSearch.regionId, is_all: true},
                {type:'select', name: 'auditStatus', title: '审核情况', data: 'order_payee_change_status', value: this.state.pagingSearch.auditStatus, is_all: true},
                {type:'input', name: 'orderSn', title: '订单号', value: this.state.pagingSearch.orderSn},
                {type:'input', name: 'studentName', title: '学生姓名', value: this.state.pagingSearch.studentName},
                {type:'date', name: 'applyStartDate', title: '变更申请日期起',placeholder:'开始日期', value: this.state.pagingSearch.applyStartDate},
                {type:'date', name: 'applyEndDate', title: '变更申请日期止',placeholder:'结束日期', value: this.state.pagingSearch.applyEndDate},
                {type: ''}
              ];
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              isRecruitBatch={true}
              isItemUser={true}
              isOrderType={true}
              //isRegion={true}
              isRegion={this.props.orgType == 3 ? true : false}
              isBranchDQ={this.props.orgType == 2 ? true : false}
              isBranchUser={this.props.orgType == 1 ? true : false}
              isOrderSource={true}
              isOrderPayeeChangeStatus={true}
              isPayeeType={true}
              isYesNo={true}
              form_item_list={list}
              fetch2={(params) =>this.fetch(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                {
                  title: '新增申请', needConditionBack: true, icon: 'plus', callback: (params) => {
                    this.setState({
                      pagingSearch: params
                    })
                    this.onLookView('Create')
                  }
                }
              ]}
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
                  <Col span={6}>
                  </Col>
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
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OrderPayeeChangeApply);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        orderPayeeChangeList: bindActionCreators(orderPayeeChangeList, dispatch),
        OrderPayeeChangeDelete: bindActionCreators(OrderPayeeChangeDelete, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
