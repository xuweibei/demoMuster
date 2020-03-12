/*
订单审核
2018-06-11
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
import DropDownButton from '@/components/DropDownButton';

import { loadDictionary } from '@/actions/dic';
import { queryOrderForAudit, auditOrder
 } from '@/actions/recruit';

import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';

class OrderAudit extends React.Component {
  state= {
    ratchId:true,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      recruitBatchId: '',
      orderAuditStatus: '5'
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
    var pagingSearch = this.state.pagingSearch;
    if(this.props.orgType == 3){
      this.columns.splice(5, 1);
      pagingSearch.orderAuditStatus = '1';//待分部审核
    } else if(this.props.orgType == 2){
      this.columns.splice(3, 2);
      pagingSearch.orderAuditStatus = '3';//待大区审核
    }

    this.setState({ pagingSearch: pagingSearch });

  }

  columns = [
    {
        title: '招生季',
        dataIndex: 'recruitBatchName',
        width:160,
        fixed:'left',
    },
    {
        title: '订单分部',
        dataIndex: 'benefitBranchName',
        width:160, 
    },
    {
        title: '订单号',
        dataIndex: 'orderSn',
        width:180, 
    },
    {
        title: '学生姓名',
        dataIndex: 'realName'
    },
    {
        title: '证件号码',
        dataIndex: 'certificateNo',
    },
    {
        title: '订单区域',
        dataIndex: 'benefitRegionName',
    },
    {
        title: '收费方',
        dataIndex: 'payeeTypeStr',
    },
    {
        title: '所属分部',
        dataIndex: 'benefitBranchName',
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '特殊优惠金额(¥)',
        dataIndex: 'stafflDiscountAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '付款分期',
        dataIndex: 'terms',
    },
    {
        title: '订单审核状态',
        dataIndex: 'orderAuditStatusStr',
    },
    {
        title: '订单类型',
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
    {
        title: '创建时间',
        width:150,
        dataIndex: 'createDateStr'
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          //待分部审核的学生订单可能进行审核
          <DropDownButton>
            {
              (this.props.orgType == 3 && record.orderAuditStatus == 1)
              || (this.props.orgType == 2 && record.orderAuditStatus == 3)
              || (this.props.orgType == 1 && record.orderAuditStatus == 5)
              ?
                <Button onClick={() => { this.onLookView('AuditOrder', record); }}>审核</Button>
              :
                <Button onClick={() => { this.onLookView('ViewOrder', record); }}>查看</Button>
            }
          </DropDownButton>
        ),
    }
  ]
  //检索数据
  fetch(params){
    if(params && !params.recruitBatchId && this.state.ratchId){
      this.setState({
        ratchId:false
      })
      return;
    }
      var condition = params || this.state.pagingSearch;
      this.setState({ loading: true, pagingSearch: condition });
      this.props.queryOrderForAudit(condition).payload.promise.then((response) => {
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
    } else {
      switch (this.state.editMode) {
        case 'Audit':
          this.props.auditOrder(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  message.success("订单保存成功");
                  //this.fetch();
              }
          })
          break;
        case 'Fee':
          message.error("缴费逻辑")
          break;
      }
    }
  }

  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ViewOrder':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          tab={4}
        />
        break;
      case 'AuditOrder':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          isAudit={true}
          tab={4}
        />
        break;
      case 'Manage':
      default:
        var _list = [
          {type:'select', name: 'recruitBatchId', title: '招生季', data: 'recruit_batch', value: this.state.pagingSearch.recruitBatchId, is_all: true},
          {type:'select', name: 'orderAuditStatus', title: '订单审核状态', data: 'order_audit_status', value: this.state.pagingSearch.orderAuditStatus, is_all: true},
        ];
        if(this.props.orgType == 3){
          _list.push(
            {type:'select', name: 'benefitRegionId', title: '订单区域', data: 'region', value: this.state.pagingSearch.benefitRegionId, is_all: true},
          );
        }else if(this.props.orgType == 2 || this.props.orgType == 1){
          _list.push(
            //{type:'select', data: 'branch', name: 'branchId', title: '学生所属分部', is_all: true },
            {type:'org', name: 'branchId', title: '所属分部', value: this.state.pagingSearch.branchId, is_all: true}
          )
        }
        _list.push({type:'input', name: 'orderSn', title: '订单号' , value: this.state.pagingSearch.orderSn});
        _list.push({type:'input', name: 'realName', title: '学生姓名' , value: this.state.pagingSearch.realName});
        _list.push({type:'input', name: 'certificateNo', title: '证件号' , value: this.state.pagingSearch.certificateNo});
        _list.push({type:'input', name: 'mobile', title: '手机号' , value: this.state.pagingSearch.mobile});
        _list.push({type:'', name: '', title: ''});
        block_content = (
          <div>
            <SearchForm
              Special = {true}
              num_column={2}
              isRecruitBatch={true}
              isOrderAuditStatus={true}
              isRegion={this.props.orgType == 3 ? true : false}
              isBranchDQ={this.props.orgType == 2 ? true : false}
              isBranchAll={false}
              form_item_list={_list}
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
                scroll={{x:1600}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                  </Col>
                  <Col span={18} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={total => `共${total}条数据`}
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
const WrappedManage = Form.create()(OrderAudit);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //let branchId = state.auth.currentUser.userType.orgId;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        queryOrderForAudit: bindActionCreators(queryOrderForAudit, dispatch),
        auditOrder: bindActionCreators(auditOrder, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
