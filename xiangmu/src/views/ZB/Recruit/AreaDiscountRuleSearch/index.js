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
import { getAuditDiscountRuleSearch, auditDiscountRuleDetail, auditDiscountRulePass, getProductDiscountAuditStatus, getAuditProductDiscountAuditStatus } from '@/actions/recruit';
import { getCoursePlanAuditList, auditCoursePlan } from '@/actions/course';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectItem from '@/components/BizSelect/SelectItem';
import AuditDiscountView from './view';
import BenefitView from './BenefitView'
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
        discountName: ''
      },
      dic_discountStatus: [],
      dic_auditDiscountStatus: [],
      totalRecord: 0,
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['discount_type', 'product_discount_audit_status',]);
    // this.onSearch();
    this.fetchAuditType()
  }
  compoentDidMount() {

  }

  columns = [
    {
      title: '序号',
      fixed: 'left',
      width: 50,
      render: (text, record, index) => {
        return index+1
      }
    },
    {
      title: '分部',
      width:'120',
      dataIndex: 'divisionName',
    },
    {
      title: '优惠规则名称',
      dataIndex: 'productDiscountName',
    
    },
    {
      title: '项目',
      dataIndex: 'itemNames',
    },
    {
      title: '类型',
      dataIndex: 'productDiscountType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.discount_type, record.productDiscountType)
      }
    },
    {
      title: '优惠金额（¥）',
      dataIndex: 'productDiscountPrice',
      render: (text, record, index) => {
        return (record.productDiscountType == 2||3) && formatMoney(record.productDiscountPrice);
      }
    },
    {
      title: '有效期',
      dataIndex: 'startDate',
      render: (text, record, index) => {
        return timestampToTime(record.startDate) + " 至" + timestampToTime(record.endDate);
      }
    },
    {
      title: '已优惠学生数',
      dataIndex: 'discountNumber',
      render: (text, record, index) => {
        return <div><a onClick={() => { this.onLookView('BenefitView', record) }}>{record.discountNumber}</a></div>
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => {
        return <DropDownButton>
          <Button onClick={() => { this.onLookView('View', { productDiscountId: record.productDiscountId, productDiscountType: getDictionaryTitle(this.state.discount_type, record.productDiscountType) }); }}>查看</Button>
        </DropDownButton>
      }

    }
  ];

  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.getAuditDiscountRuleSearch(condition).payload.promise.then((response) => {
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

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'View':
      case 'Audit':
        block_content = <AuditDiscountView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'BenefitView':
      block_content =  <BenefitView  
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Manage':
      default:
        let extendButtons = [];
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
                        {getFieldDecorator('orgId', { initialValue: this.state.pagingSearch.orgId })(
                          <SelectFBOrg scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'项目'} >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                          <SelectItem scope='my' hideAll={false} showCheckBox={false} />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="类型"
                      >
                        {getFieldDecorator('discountType', { initialValue: dataBind(this.state.pagingSearch.discountType) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.discount_type.filter((e)=>e.value!=1).map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="优惠名称"
                      >
                        {getFieldDecorator('productDiscountName', { initialValue: this.state.pagingSearch.discountName })(
                          <Input placeholder='请输入优惠名称' />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
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
                  <Col span={24} className={'search-paging-control'}>
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
          </div>
        )
        break;
    }
    return block_content;
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
    getAuditDiscountRuleSearch: bindActionCreators(getAuditDiscountRuleSearch, dispatch),
    auditDiscountRuleDetail: bindActionCreators(auditDiscountRuleDetail, dispatch),
    auditDiscountRulePass: bindActionCreators(auditDiscountRulePass, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
