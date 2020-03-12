/*
3.1.01 统一优惠规则 管理列表
陈正威
2018-05-14
*/

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { alreadyBenefit, auditDiscountRuleDetail, auditDiscountRulePass, getProductDiscountAuditStatus, getAuditProductDiscountAuditStatus } from '@/actions/recruit';
import { getCoursePlanAuditList, auditCoursePlan } from '@/actions/course';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectItem from '@/components/BizSelect/SelectItem';
import AuditDiscountView from './view';
import DropDownButton from '@/components/DropDownButton';
class ProductDiscountRuleManage extends React.Component {

  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        orgId: '',
        itemId: '',  //
        discountType: '',
        discountName: '',
        type: '3',
      },
      dic_discountStatus: [],
      dic_auditDiscountStatus: [],
      totalRecord: 0,
      loading: false,
    };
  }
  componentWillMount() {
      console.log(this.props)
    this.loadBizDictionary(['discount_type', 'product_discount_audit_status','payee_type','order_status','esign_status']);
    // this.onSearch();
         this.fetch()
    // this.fetchAuditType()
  }
  compoentDidMount() {

  }

  columns = [
    {
      title: '分部区域',
      fixed: 'left',
      width: 130,
      dataIndex: 'benefitBranchName',
      render:(text,record,index)=>{
          return record.benefitBranchName?record.benefitBranchName:''+record.benefitRegionName?record.benefitRegionName:''
      }
    },
    {
      title: '订单号',
      dataIndex: 'orderSn',
    },
    {
      title: '学生姓名',
      dataIndex: 'realName',
    
    },
    {
      title: '大客户姓名',
      dataIndex: 'partnerName',
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.payee_type, record.payeeType)
      }
    },
    {
      title: '订单金额（¥）',
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return formatMoney(record.totalAmount);
      }
    },
    {
      title: '已缴金额',
      dataIndex: 'paidAmount',
      render: (text, record, index) => {
        return formatMoney(record.paidAmount);
      }
    },
    {
      title: '临时缴费金额（¥）',
      dataIndex: 'paidTempAmount',
      render: (text, record, index) => {
        return formatMoney(record.paidTempAmount)
      }
    },
    {
        title: '创建日期',
        dataIndex: 'createDate',
        render: (text, record, index) => {
          return  timestampToTime(record.createDate)
        }
      },
      {
        title: '订单状态',
        dataIndex: 'orderStatus',
        render: (text, record, index) => {
          return getDictionaryTitle(this.state.order_status, record.orderStatus)
        }
      },
      {
        title: '电子签',
        dataIndex: 'esignStatus',
        render: (text, record, index) => {
          return getDictionaryTitle(this.state.esign_status, record.esignStatus)
        }
      },
    {
      title: '订单来源',
      fixed: 'right',
      width: 120,
      dataIndex: 'orderSource',
      render: (text, record, index) => {
          if(record.orderSource==1)return '线下订单'
          if(record.orderSource==2)return '网络订单'
      }
    }
  ];

  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.productDiscountId = this.props.currentDataModel.productDiscountId;
    this.props.alreadyBenefit(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ ...data, loading: false })
      }
    })
  }
  fetchAuditType = () => {
    let condition = {};
    this.props.getProductDiscountAuditStatus(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        var list = data.data.product_discount_audit_status.map((a) => { return ({ value: a.value, title: a.title }) })
        this.setState({ dic_discountStatus: list })
      }
    })
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {
      switch (this.state.editMode) {
        case 'Audit':
          this.props.auditDiscountRulePass(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'View':
          break;
      }
    }
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
         return <div>
            {/* <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              
            </ContentBox> */}
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                scroll={{ x: 1300 }}
                dataSource={this.state.data}//数据
                bordered
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="end" align="middle" type="flex">
                  <Col span={4}>
                    <Button onClick={this.onCancel} icon="rollback">返回</Button>
                  </Col>
                  <Col span={20} className={'search-paging-control'}>
                    <Pagination 
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
          </div>
  }
}
//表单组件 封装
const WrappedManage = Form.create()(ProductDiscountRuleManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getProductDiscountAuditStatus: bindActionCreators(getProductDiscountAuditStatus, dispatch),
    getAuditProductDiscountAuditStatus: bindActionCreators(getAuditProductDiscountAuditStatus, dispatch),
    alreadyBenefit: bindActionCreators(alreadyBenefit, dispatch),
    auditDiscountRuleDetail: bindActionCreators(auditDiscountRuleDetail, dispatch),
    auditDiscountRulePass: bindActionCreators(auditDiscountRulePass, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
