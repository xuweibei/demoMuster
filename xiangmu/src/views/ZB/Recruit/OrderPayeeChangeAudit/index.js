/*
订单收费方变更审批
2018-10-16
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
import { formatMoney, timestampToTime, getDictionaryTitle, formatMoment } from '@/utils';
import { env } from '@/api/env';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { orderPayeeChangeList, OrderPayeeChangeDelete, auditPayeeChangeApplyByBatch } from '@/actions/recruit';

import PayeeChangeDetailView from './view';
import AuditEdit from './auditEdit';
import DropDownButton from '@/components/DropDownButton';

class OrderPayeeChangeAudit extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
    },
    data_list: [],
    loading: false,
    totalRecord: 0,
    UserSelecteds: [],
    currentDataModel: {},
    branchId: ''
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
        title: '订单分部',
        width:150,
        fixed:'left',
        dataIndex: 'branchName'
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
        title: '申请日期',
        dataIndex: 'applyDate'
    },
    {
        title: '审核情况',
        dataIndex: 'auditStatusName',
    },
    {
        title: '审核人',
        dataIndex: 'auditUserName',
    },
    {
        title: '审核日期',
        dataIndex: 'auditDate'
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
                <Button onClick={() => { this.onLookView('Audit', record); }}>审核</Button>
                : <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
              }
          </DropDownButton>
        ),
    }
  ];
  //检索数据
  fetch(params){
      
      var condition = params || this.state.pagingSearch;
      let applyStartDate = condition.applyStartDate;
      if(applyStartDate){
        condition.applyStartDate = formatMoment(applyStartDate[0])
        condition.applyEndDate = formatMoment(applyStartDate[1])
      }
      let auditStartDate = condition.auditStartDate;
      if(auditStartDate){
        condition.auditStartDate = formatMoment(auditStartDate[0])
        condition.auditEndDate = formatMoment(auditStartDate[1])
      }
      condition.branchId = this.state.branchId;
      this.setState({ loading: true });
      this.props.orderPayeeChangeList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data;
            //list.push(data.data);
            this.setState({
              data_list: list,
              totalRecord: data.totalRecord,
              loading: false,
              pagingSearch: condition,
              UserSelecteds: []
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }

  onAuditEdit = () => {
      this.onLookView("AuditEdit", { ids: this.state.UserSelecteds })
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
    else {
        switch (this.state.editMode) {
            
          case "AuditEdit": //提交
              
            this.props.auditPayeeChangeApplyByBatch(dataModel).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else {
                    this.onSearch();
                    message.success("订单收费方变更审核成功！");
                    //进入管理页
                    this.onLookView("Manage", null);
                }
            })
            //提交
            break;

      }
    }
  }

  render(){
    let block_content = <div></div>
    var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
              this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
              disabled: record.auditStatus == 1 ? false : true,    // Column configuration not to be checked
          }),
      };
    switch (this.state.editMode) {
      case 'View':
      case 'Audit':
        block_content = <PayeeChangeDetailView viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          currentDataModel={this.state.currentDataModel}
        />
        break;
      case 'AuditEdit':
        block_content = <AuditEdit
            viewCallback={this.onViewCallback}
            {...this.state} 
        />
        break;
      case 'Manage':
      default:
        var list = [
                {type:'org', name: 'branchId', title: '订单分部', is_all: true},
                {type:'select', name: 'auditStatus', title: '审核情况', data: 'order_payee_change_status', is_all: true},
                {type:'input', name: 'orderSn', title: '订单号'},
                {type:'input', name: 'studentName', title: '学生姓名'},
                {type:'datePicker', name: 'applyStartDate', title: '变更申请日期',placeholder:'开始日期'},
                {type:'datePicker', name: 'auditStartDate', title: '审核日期',placeholder:'开始日期'},
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
              onCallback={(value, name) => {
                var branchId = null;
                if(name == "branchId"){
                  if(value){
                    branchId = value;
                  }
                }
                this.setState({branchId: branchId});
              }}
            />
            <div className="space-default">
            </div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                rowKey={'orderPayeeChangeId'}
                rowSelection={rowSelection}
                bordered
                scroll={{x:1800}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={4}>
                      {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onAuditEdit} icon="edit">批量审核</Button> : <Button disabled icon="edit">批量审核</Button>}
                  </Col>
                  <Col span={20} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(OrderPayeeChangeAudit);

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
        auditPayeeChangeApplyByBatch: bindActionCreators(auditPayeeChangeApplyByBatch, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
