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
import { selectRegisterList } from '@/actions/enrolStudent';
import ContentBox from '@/components/ContentBox';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import FileDownloader from '@/components/FileDownloader';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
const dateFormat = 'YYYY-MM-DD';
class FailOrderMoneyQueryManage extends React.Component {
  state = {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      recruitBatchId: '',
      payeeType: '',
      benefitBranchId: '',
      startDate: '',
      endDate: '',
    },
    data: [],
    totalRecord: 0,
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
    this.loadBizDictionary(['payee_type']);
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '招生季',
      dataIndex: 'recruitBatchName',
      fixed: 'left',
      width: 120
    },
    {
      title: '收费方',
      dataIndex: 'payeeTypeName',
    },
    {
      title: '订单分部',
      dataIndex: 'benefitBranchName',
    },
    {
      title: '订单号',
      dataIndex: 'orderSn',
      render: (text, record, index) => {
        return <span>
            <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
        </span>
    }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '班型',
      dataIndex: 'classTypeName',
    },
    {
      title: '订单类型',
      dataIndex: 'orderTypeName',
    },
    {
      title: '挂单金额',
      dataIndex: 'registerMoney',
      render: (text, record, index) => {
        return formatMoney(record.registerMoney);
    }
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatusName',
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return formatMoney(record.totalAmount);
    }
    },
    {
      title: '缴费日期',
      dataIndex: 'paidDate',
      fixed: 'right',
      width: 150,
      render: (text, record, index) => (`${timestampToTime(record.paidDate)}`)
    },
  ];

  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    //condition.startDate = formatMoment(condition.startDate);//日期控件处理
    let startDate;
    let endDate;
    let askDate = condition.startDate;
    if (askDate) {
      condition.startDate = formatMoment(askDate[0]);
      condition.endDate = formatMoment(askDate[1]);
    }
    this.props.selectRegisterList(condition).payload.promise.then((response) => {
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
  onStudentView = (record) => {
    this.onLookView("View", record)
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
      case "View":
      block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
      break;
      case 'ViewOrderDetail':
      block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          tab={3}
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
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/order/exportRegisterList '}//api下载地址
          method={'get'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'招生季'} >
                        {getFieldDecorator('recruitBatchId', { initialValue: this.state.pagingSearch.recruitBatchId })(
                          <SelectRecruitBatch scope='all' hideAll={false} showCheckBox={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'收费方'} >
                        {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                         <Select>
                         <Option value="">全部</Option>
                         {this.state.payee_type.map((item, index) => {
                           return <Option value={item.value} key={index}>{item.title}</Option>
                         })}
                        </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'订单分部'} >
                        {getFieldDecorator('benefitBranchId', { initialValue: this.state.pagingSearch.benefitBranchId })(
                          <SelectFBOrg scope='my' hideAll={false} showCheckBox={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="缴费日期"
                      >
                        {getFieldDecorator('startDate', { initialValue: '' })(
                          <RangePicker style={{width:200}}/>
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
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">

                </Row>
                { <Row justify="end" align="right" type="flex">
                  <Col span={18} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row> }
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
const WrappedManage = Form.create()(FailOrderMoneyQueryManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    selectRegisterList: bindActionCreators(selectRegisterList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
