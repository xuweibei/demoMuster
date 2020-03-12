/*
订单分部调整
*/

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
const Option = Select.Option;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';


import { queryOrderPageByRegionList, updateBranchByOrderIds } from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';

import PayeeTypeNameSetView from './view';

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
        title: '学生姓名',
        fixed:'left',
        width:120,
        dataIndex: 'studentName'
    },
    {
        title: '证件号码',
        dataIndex: 'certificateNo',
    },
    {
        title: '订单号',
        dataIndex: 'orderSn',
        width:180, 
    },
    {
        title: '订单分部',
        dataIndex: 'branchName',
        width:160, 
    },
    
    {
        title: '订单类型',
        dataIndex: 'orderTypeStr',
    },
    {
        title: '收费方',
        dataIndex: 'payeeTypeStr',
    },

    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '已缴费金额(¥)',
        dataIndex: 'paidAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '订单状态',
        dataIndex: 'orderStatusStr',
    },
    {
        title: '创建日期',
        width:120,
        fixed:'right',
        dataIndex: 'createDateStr'
    },
  ]

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    
    this.props.queryOrderPageByRegionList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state != 'success') {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false,UserSelecteds:[] })
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
          this.props.updateBranchByOrderIds(dataModel).payload.promise.then((response) => {
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
                      <FormItem {...searchFormItemLayout} label={'订单号'} >
                        {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                          <Input placeholder="请输入订单号"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                          <Input placeholder="请输入学生姓名"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生证件号'} >
                        {getFieldDecorator('certificateNo', { initialValue: this.state.pagingSearch.certificateNo })(
                          <Input placeholder="请输入学生证件号"/>
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
                rowKey={record => record.orderId}//主键
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{x: 1600}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={4}>
                    {this.state.UserSelecteds.length > 0 ?
                      <Button onClick={this.oneditPayeeType} icon='edit'>调整分部</Button> :
                      <Button disabled icon='edit'>调整分部</Button>
                    }
                  </Col>
                  <Col span={20} className={'search-paging-control'} align="right">
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
    queryOrderPageByRegionList: bindActionCreators(queryOrderPageByRegionList, dispatch),
    updateBranchByOrderIds: bindActionCreators(updateBranchByOrderIds, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPayeeTypeNameSet);
