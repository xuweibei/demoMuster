/*
订单业绩相关调整
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
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment, openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
//getStudentAskBenefitList
import { queryByOffsite } from '@/actions/enrolStudent';
import ContentBox from '@/components/ContentBox';
import FeeEdit from '../OrderCreate/fee';
import FileDownloader from '@/components/FileDownloader';
import view from '../../EnrolStudents/OrderAchievementManage/view';
const dateFormat = 'YYYY-MM-DD';
class OrderPaymentDiffentManage extends React.Component {
  state = {
    editMode: '',
    pagingSearch: {
      // currentPage: 1,
      // pageSize: 10,
      orderSn: '',
      realName: '',
      certificateNo: '',
    },
    data: [],
    //totalRecord: 0,
    loading: false,
  };
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
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount");
    //this.loadBizDictionary(['discount_type']);
    //this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '订单编号',
      dataIndex: 'orderSn',
      width:120,
      fixed:'left',
    },
    {
      title: '学生姓名',
      dataIndex: 'realName',
    },
    {
      title: '证件号码',
      dataIndex: 'certificateNo',
    },
    {
      title: '收费方',
      dataIndex: 'payeeTypeStr',
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
    },
    {
      title: '临时缴费金额',
      dataIndex: 'paidTempAmount',
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatusStr',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (text, record) => (
        //编辑   适用商品 互斥设置(2)
        <Row justify="space-around" type="flex">
          <Button onClick={() => { this.onLookView('FeeEdit', record); }}>缴费</Button>
        </Row>
      ),
    }

  ];

  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.queryByOffsite(condition).payload.promise.then((response) => {
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

  oneditpUser = () => {
    let params = { ids: this.state.UserSelecteds, type: 3 }
    this.onLookView("editpUser", params)
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
        default:
          this.props.editUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({ UserSelecteds: [] });
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
      case 'FeeEdit':
      block_content = <FeeEdit
        viewCallback={this.onViewCallback}
        editMode={this.state.editMode}
        orderId={this.state.currentDataModel.orderId}
        otherPlaceOrder={true}
      />
      break;
      case 'payment':
      block_content = <OrderPaymentDiffentView
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
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'订单号'} >
                        {getFieldDecorator('orderSn', {
                          initialValue: this.state.pagingSearch.orderSn,
                          rules: [{
                            required: true, message: '请输入订单号',
                          }]
                        })(
                          <Input />
                        )
                        }
                      </FormItem>

                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'证件号'} >
                        {getFieldDecorator('certificateNo', {
                          initialValue: this.state.pagingSearch.certificateNo,
                          rules: [{
                            required: true, message: '请输入证件号',
                          }]
                        })(
                          <Input />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', {
                          initialValue: this.state.pagingSearch.realName,
                          rules: [{
                            required: true, message: '请输入学生姓名',
                          }]
                        })(
                          <Input />
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
                //rowSelection={rowSelection}
                rowKey={'studentAskId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{x:1300}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">

                </Row>
                {/* <Row justify="end" align="right" type="flex">
                  <Col span={18} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row> */}
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
const WrappedManage = Form.create()(OrderPaymentDiffentManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    queryByOffsite: bindActionCreators(queryByOffsite, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
