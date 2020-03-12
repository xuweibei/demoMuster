/*
3.1.01 分期付款规则
2018-05-19
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
import { timestampToTime, getDictionaryTitle, formatMoney } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { getSpecialDiscountRuletManageList } from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';

class SpecialRuleManage extends React.Component {
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
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
      },
      totalRecord: 0,
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_Allow']);
    this.onSearch()
  }
  compoentDidMount() {

  }

  columns = [
    {
      title: '项目',
      dataIndex: 'itemName',
    },
    {
      title: '特殊优惠限额',
      dataIndex: 'discountPrice',
    },
    {
      title: '最后设定人',
      dataIndex: 'modifyUserName',
    },
    {
      title: '最后修改日期',
      dataIndex: 'modifyDate',
      render: (text, record, index) => {
        return timestampToTime(record.modifyDate);
      }
    }
  ];




  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.getSpecialDiscountRuletManageList(condition).payload.promise.then((response) => {
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
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Create':
        case 'Edit':
          break;
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:
        let extendButtons = [];
        block_content = (
          <div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
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
const WrappedManage = Form.create()(SpecialRuleManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getSpecialDiscountRuletManageList: bindActionCreators(getSpecialDiscountRuletManageList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
