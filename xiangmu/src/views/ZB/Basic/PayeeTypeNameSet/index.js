/*
快捷支付订单匹配
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
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import { env } from '@/api/env';
const FormItem = Form.Item;
const Option = Select.Option;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import {
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';

import { payeeTypeNameList } from '@/actions/finance';
import { payeeTypeNameUpd } from '@/actions/finance';
import ContentBox from '@/components/ContentBox';

import PayeeTypeNameSetView from '../PayeeTypeNameSetView';

const dateFormat = 'YYYY-MM-DD';


class PayeeTypeNameSet extends React.Component {
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
        branchName: '',//分部
        zbPayeeType: '',//收费方账户类型：1中博教育;2中博诚通;3共管账户;4大客户
      },
      data: [],
      UserSelecteds: [],
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['discount_type']);
    this.loadBizDictionary(['payee_type']);
    this.onSearch()
  }
  compoentDidMount() {
  }

  columns = [
    {
      title: '分部',
      dataIndex: 'branchName',
      fixed: 'left',
      width: 160
    },
    {
      title: '收费方',
      dataIndex: 'zbPayeeType',
      render: text => <span>{getDictionaryTitle(this.state.payee_type, text)?getDictionaryTitle(this.state.payee_type, text):'未设置'}</span>
    },
    {
      title: '最后修改人',
      dataIndex: 'createUserName',
    },
    {
      title: '最后修改日期',
      dataIndex: 'createDate',
      fixed: 'right',
      width: 160,
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.branchName = condition.branchName.replace(/(^\s+)|(\s+$)/g,'');
    this.props.payeeTypeNameList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state != 'success') {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  }
  oneditPayeeType = () => {

    let params = this.state.UserSelecteds;
    this.onLookView('Edit', params);

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
          this.props.payeeTypeNameUpd(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({ UserSelecteds: [] });
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        default:
          
          break;
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Edit':
        block_content = <PayeeTypeNameSetView
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
                        {getFieldDecorator('branchName', { initialValue: this.state.pagingSearch.branchName })(
                          <Input placeholder="请输入分部名称"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'收费方'} >
                        {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="0">未设置</Option>
                            {this.state.payee_type.filter((a)=>a.title!='全部').filter((a)=>a.title!='大客户收费').filter((a)=>a.title!='共管账户').map((item, index) => {
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
                rowSelection={rowSelection}
                rowKey={'branchId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditPayeeType} icon='edit'>批量修改</Button> :
                      <Button disabled icon='edit'>批量修改</Button>
                    }
                  </Col>
                  <Col span={18} className={'search-paging-control'} align="right">
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
const WrappedPayeeTypeNameSet = Form.create()(PayeeTypeNameSet);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    payeeTypeNameList: bindActionCreators(payeeTypeNameList, dispatch),
    payeeTypeNameUpd: bindActionCreators(payeeTypeNameUpd, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPayeeTypeNameSet);
