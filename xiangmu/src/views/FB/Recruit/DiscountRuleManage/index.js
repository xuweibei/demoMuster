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
import {
  getProductDiscountRuleList, discountRuleCreate, editproductDiscountRule,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';

import { getCoursePlanAuditList, auditCoursePlan } from '@/actions/course';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DiscountView from './view';
import DiscountMutexView from './DiscountMutexView';
import FitProductView from './FitProductView';
import DetailView from './DetailView';
import ProductNotDiscountView from './ProductNotDiscountView';
import DropDownButton from '@/components/DropDownButton';

const dateFormat = 'YYYY-MM-DD';
class DiscountRuleManage extends React.Component {

  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
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
        itemId: '',
        productDiscountType: '',  //
        discountName: '',   //
        type: '',
      },
      data_list: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['discount_type', 'dic_Status', 'producttype', 'dic_Allow', 'discount_fit_scope', 'product_discount_audit_status']);
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '商品优惠规则名称',
      dataIndex: 'productDiscountName',
      width: 220,
      fixed: 'left',
    },
    {
      title: '项目',
      dataIndex: 'itemNames',
      render: (text, record, index) => {
        return record.itemNames
      }
    },
    {
      title: '类型',
      dataIndex: 'productDiscountType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.discount_type, record.productDiscountType);
      }
    },
    {
      title: '满减条件（¥）',
      width: 120,
      dataIndex: 'fullPriceCondition',
      render: (text, record, index) => {
        return ((record.productDiscountType == 6||record.productDiscountType == 7) && formatMoney(record.fullPriceCondition))
      }
    },
    {
      title: '优惠金额（¥）',
      width: 120,
      dataIndex: 'productDiscountPrice',
      render: (text, record, index) => {
        return (record.productDiscountType == 2 || record.productDiscountType == 3 ||record.productDiscountType == 6||record.productDiscountType == 7) && formatMoney(record.productDiscountPrice);
      }
    },
    // {
    //   title: '折扣（%）',
    //   dataIndex: 'productDiscountPrice2',
    //   render: (text, record, index) => {
    //     return record.productDiscountType == 1 && record.productDiscountPrice;
    //   }
    // },
    // {
    //   title: '适用商品',
    //   dataIndex: 'fitScope',
    //   render: (text, record, index) => {
    //     return getDictionaryTitle(this.state.discount_fit_scope, record.fitScope);
    //   }
    // },
    {
      title: '有效期',
      width: 180,
      dataIndex: 'startDate',
      render: (text, record, index) => {
        return timestampToTime(record.startDate) + " 至 " + timestampToTime(record.endDate);
      }
    },
    {
      title: '状态',
      dataIndex: 'type',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.product_discount_audit_status, record.type);
      }
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      key: 'action',
      render: (text, record) => (
        //编辑   适用商品 互斥设置(2)
        < Row justify="space-around" type="flex" >
          {
            !record.canAudit ? <Button onClick={() => { this.onLookView('View', record); }}>查看</Button> :
              <DropDownButton>
                <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
                <Button onClick={() => { this.onLookView('Mutex', { ...record, discount_type_name: getDictionaryTitle(this.state.discount_type, record.productDiscountType) }); }}>互斥设置({record.mutexRuleNum})</Button>
              </DropDownButton>
          }
        </Row>
      ),
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.startDate = formatMoment(condition.startDate);//日期控件处理
    this.props.getProductDiscountRuleList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  }
  onBatchEdit = () => {
    let params = { ids: this.state.UserSelecteds }
    this.onLookView("EditDate", params)
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
        case 'AddFit':
          this.props.discountRuleProductAdd(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onLookView("Fit", { productDiscountId: dataModel.productDiscountId });
            }
          })
          break;
        case "Fit":
          this.onLookView("AddFit", dataModel);
          break;
        case "EditDate":
          this.props.discountRuleExpiryDateBatchUpdate(dataModel).payload.promise.then((response) => {
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
        case 'Edit':
          this.props.editproductDiscountRule(dataModel).payload.promise.then((response) => {
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
        case 'Create':
          this.props.discountRuleCreate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Mutex':
          this.props.discountRuleMutexSet(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'View':
        block_content = <DetailView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'AddFit':
        block_content = <ProductNotDiscountView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Fit':
        block_content = <FitProductView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Mutex':
        block_content = <DiscountMutexView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'EditDate':
      case 'Edit':
      case 'Create':
      case 'Audit':
        block_content = <DiscountView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Manage':
      default:
        let extendButtons = [];
        extendButtons.push(<Button onClick={() => { this.onLookView('Create', { itemNames: '', startDate: '', endDate: '', remark: '', productDiscountType: '', productDiscountName: '', validDate: '', productDiscountPrice: '' }) }
        } icon="plus" className="button_dark" > 新增优惠</Button>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'项目'} >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                          <SelectItem scope='my' hideAll={false} showCheckBox={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'类型'} >
                        {getFieldDecorator('productDiscountType', { initialValue: this.state.pagingSearch.productDiscountType })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.discount_type.filter(a => a.value != 1).map((item, index) => {
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
                        {getFieldDecorator('discountName', { initialValue: this.state.pagingSearch.discountName })(
                          <Input placeholder="请输入优惠名称"/>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="状态"
                      >
                        {getFieldDecorator('type', { initialValue: dataBind(this.state.pagingSearch.type) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.product_discount_audit_status.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
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
const WrappedManage = Form.create()(DiscountRuleManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    getProductDiscountRuleList: bindActionCreators(getProductDiscountRuleList, dispatch),
    discountRuleCreate: bindActionCreators(discountRuleCreate, dispatch),
    editproductDiscountRule: bindActionCreators(editproductDiscountRule, dispatch),
    discountRuleExpiryDateBatchUpdate: bindActionCreators(discountRuleExpiryDateBatchUpdate, dispatch),
    discountRuleProductQuery: bindActionCreators(discountRuleProductQuery, dispatch),
    discountRuleNotProductQuery: bindActionCreators(discountRuleNotProductQuery, dispatch),
    discountRuleProductAdd: bindActionCreators(discountRuleProductAdd, dispatch),
    discountRuleProductDelete: bindActionCreators(discountRuleProductDelete, dispatch),
    discountRuleMutexQuery: bindActionCreators(discountRuleMutexQuery, dispatch),
    discountRuleMutexSet: bindActionCreators(discountRuleMutexSet, dispatch),

    getCoursePlanAuditList: bindActionCreators(getCoursePlanAuditList, dispatch),
    auditCoursePlan: bindActionCreators(auditCoursePlan, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
