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

import { getincomeList} from '@/actions/enrolStudent';
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'YYYY年MM月';

let yearList = [];

let initYear = 2018;

let nowYear = new Date().getFullYear();

let year = nowYear - initYear;

if(year){
  for(let i=0; i<=year; i++){
    yearList.push(initYear+i)
  }
}else{
  yearList.push(initYear)
}
//时间降序
yearList.sort(function(a,b){
  return b-a;
})

class StudentIncomeDetailsManage extends React.Component {
  
  state = {
    editMode: '',
    pagingSearch: {
      year: yearList[0],
      month: '',
    },
    data: [],
    totalRecord: 0,
    loading: false,
    yearList: yearList
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
    this.loadBizDictionary(['pos_account_type']);
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");

  }
  setTimeStr(str) {
    let timeStr = str.split('-');
    return `${timeStr[0]}年${timeStr[1]}月`
  }

  columns = [
    {
      title: '签约公司',
      dataIndex: 'zbPayeeTypeName',
      /*render: (text, record, index) => {
        var zbPayeeType = record.zbPayeeType == 0 ? 1 : record.zbPayeeType
        return getDictionaryTitle(this.state.pos_account_type, zbPayeeType);
      },*/
      fixed: 'left',
      width: 150
    },
    {
      title: '月份',
      dataIndex: 'monthDate',
      render: (text, record, index) => {
        return this.setTimeStr(timestampToTime(record.monthDate));
      }
    },
    {
      title: '订单数',
      dataIndex: 'orderNum',
    },
    {
      title: '本月课程商品确认收入（¥）',
      dataIndex: 'monthCourseIncomeAmount',
      render: (text, record, index) => {
        return formatMoney(record.monthCourseIncomeAmount);
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (text, record) => {
        //编辑   适用商品 互斥设置(2)
        return <FileDownloader
          apiUrl={'/edu/fee/income/exportCourseIncome'}//api下载地址
          method={'post'}//提交方式//
          options={{ monthDate: timestampToTime(record.monthDate), zbPayeeType: record.zbPayeeType}}//提交参数
          title={"导出明细"}
        >
        </FileDownloader>

      }
    }
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
    this.props.getincomeList(condition).payload.promise.then((response) => {
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
  //浏览视图e
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
      case "exit":

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
                      <FormItem {...searchFormItemLayout} label={'年份'} >
                        {getFieldDecorator('year', { initialValue: this.state.pagingSearch.year })(
                          <Select>
                            {
                              this.state.yearList.map((value,index)=>{
                                return <Option value={value}>{value}</Option>
                              })
                            }
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'签约公司'} >
                        {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                          <Select>
                          <Option value="">全部</Option>
                          {this.state.pos_account_type.map((item, index) => {
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
                {/* { <Row justify="end" align="right" type="flex">
                  <Col span={18} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row> } */}
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
const WrappedManage = Form.create()(StudentIncomeDetailsManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getincomeList: bindActionCreators(getincomeList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
