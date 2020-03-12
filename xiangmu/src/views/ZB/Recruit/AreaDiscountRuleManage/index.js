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
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { getAreaDiscountManageList, editReginDiscount, BatchByItemEditDiscount, BatchEditDiscount, editByItemOrg } from '@/actions/recruit';
import SelectRegion from '@/components/BizSelect/SelectRegion';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import AreaDiscountRuleView from './view';
import EditByOrgView from './EditByOrgView';
import DropDownButton from '@/components/DropDownButton';
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';
class AreaDiscountRuleManage extends React.Component {

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
        itemId: '',
        endDate: '',
        startDate: '',
        discountType: '',
      },

      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
      startValue: null,
      endValue: null,
      endOpen: false,
    };
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount");
    this.loadBizDictionary(['discount_type', 'dic_Status', 'producttype', 'dic_Allow', 'discount_fit_scope']);
    // this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '大区',
      dataIndex: 'orgName',
      fixed: 'left',
      width: 120,
    },
    {
      title: '项目',
      dataIndex: 'itemName',
      render: (text, record, index) => {
        return record.itemName
      }
    },
    {
      title: '特殊优惠限额',
      dataIndex: 'discountPrice',
      render: (text, record, index) => {
        return formatMoney(record.discountPrice);
      }
    },
    {
      title: '最后修改日期',
      dataIndex: 'modifyDate',
      render: (text, record, index) => {
        return timestampToTime(record.modifyDate);
      }
    },

    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (text, record) => {
        return <DropDownButton>
          <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
        </DropDownButton>
      }
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let startDate = condition.startDate;
    if(startDate){
      condition.startDate = formatMoment(startDate[0])
      condition.endDate = formatMoment(startDate[1])
    }
    this.props.getAreaDiscountManageList(condition).payload.promise.then((response) => {
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
    this.onLookView("BatchAudit", params)
  }
  disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({ endOpen: true });
      }
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
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
        case 'Edit':
          this.props.editReginDiscount(dataModel).payload.promise.then((response) => {
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
        case 'BatchEdit':
          this.props.BatchByItemEditDiscount(dataModel).payload.promise.then((response) => {
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
        case 'BatchAudit':
          this.props.BatchEditDiscount(dataModel).payload.promise.then((response) => {
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
        case "EditByOrgItem":
          this.props.editByItemOrg(dataModel).payload.promise.then((response) => {
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
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'EditByOrgItem':
        block_content = <EditByOrgView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break
      case 'BatchAudit':
      case 'BatchEdit':
      case 'Edit':
      case 'Create':
        block_content = <AreaDiscountRuleView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
        extendButtons.push(<Button onClick={() => { this.onLookView('EditByOrgItem') }
        } icon="plus" className="button_dark" > 新增大区限额</Button>);
        extendButtons.push(<Button onClick={() => { this.onLookView('BatchEdit', { discountPrice: 0 }) }
        } icon="tool" className="button_dark" > 按项目统一设置</Button>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'大区'} >
                        {getFieldDecorator('orgId', { initialValue: this.state.pagingSearch.orgId })(
                          <SelectRegion />
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
                    {/* <Col span={12}>
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
                        {getFieldDecorator('discountName', { initialValue: this.state.pagingSearch.discountName })(
                          <Input placeholder='优惠名称' />
                        )}
                      </FormItem>
                    </Col> */}
                    
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="最后修改日期">
                            {getFieldDecorator('startDate', { initialValue: this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'discountRuleId'}
                pagination={false}
                dataSource={this.state.data}//数据
                scroll={{ x: 1300 }}
                bordered
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                    {this.state.UserSelecteds.length > 0 ?
                      <Button onClick={this.onBatchEdit} icon="edit">批量修改限额</Button> :
                      <Button disabled icon="edit">批量修改限额</Button>
                    }
                  </Col>
                  <Col span={18} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(AreaDiscountRuleManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getAreaDiscountManageList: bindActionCreators(getAreaDiscountManageList, dispatch),
    editReginDiscount: bindActionCreators(editReginDiscount, dispatch),
    BatchByItemEditDiscount: bindActionCreators(BatchByItemEditDiscount, dispatch),
    BatchEditDiscount: bindActionCreators(BatchEditDiscount, dispatch),
    editByItemOrg: bindActionCreators(editByItemOrg, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
