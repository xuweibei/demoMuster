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
  getDiscountRuleBranchList,
} from '@/actions/recruit';

import { getCoursePlanAuditList, auditCoursePlan } from '@/actions/course';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DetailView from './DetailView';
import BenefitView from './BenefitView'


class ViewDiscountRuleManage extends React.Component {

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
        discountType: '',
        discountName: '',
        orgType: '',
      },
      data_list: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['discount_type', 'dic_Status', 'producttype', 'dic_Allow', 'product_discount_source', 'discount_fit_scope', 'product_discount_audit_status']);
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '来源',
      dataIndex: 'orgType',
      fixed: 'left',
      width: 100,
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.product_discount_source, record.orgType)
      }
    },
    {
      title: '优惠规则名称',
      dataIndex: 'productDiscountName',
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
      width: 90,
      dataIndex: 'productDiscountType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.discount_type, record.productDiscountType);
      }
    },
    {
      title: '满减条件(¥)',
      width: 120,
      dataIndex: 'fullPriceCondition',
      render: (text, record, index) => {
        return ((record.productDiscountType == 6||record.productDiscountType == 7) && formatMoney(record.fullPriceCondition))
      }
    },
    {
      title: '优惠金额(¥)',
      width: 120,
      dataIndex: 'productDiscountPrice',
      render: (text, record, index) => {
        if(record.productDiscountType==1){
          return (formatMoney(record.productDiscountPrice)/10).toFixed(1)+'折'
        }
        return formatMoney(record.productDiscountPrice);
      }
    },
    {
      title: '已优惠学员数',
      width: 120,
      dataIndex: 'discountNumber',
      render: (text, record, index) => {
        return <div><a onClick={() => { this.onLookView('BenefitView', record) }}>{record.discountNumber}</a></div>
      }
    },

    {
      title: '操作',
      width: 120,
      fixed: 'right',
      key: 'action',
      render: (text, record) => (

        <Row justify="center" type="flex" >
          <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
        </Row>
      ),
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.startDate = formatMoment(condition.startDate);//日期控件处理
    this.props.getDiscountRuleBranchList(condition).payload.promise.then((response) => {
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
        block_content = <DetailView
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
                      <FormItem {...searchFormItemLayout} label={'来源'} >
                        {getFieldDecorator('orgType', { initialValue: this.state.pagingSearch.orgType })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.product_discount_source.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
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
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'类型'} >
                        {getFieldDecorator('discountType', { initialValue: this.state.pagingSearch.discountType })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.discount_type.map((item, index) => {
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
                        {getFieldDecorator('productDiscountName', { initialValue: this.state.pagingSearch.productDiscountName })(
                          <Input placeholder="请输入优惠名称"/>
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
const WrappedManage = Form.create()(ViewDiscountRuleManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getDiscountRuleBranchList: bindActionCreators(getDiscountRuleBranchList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
