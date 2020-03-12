/*
收入月报计算日期设置
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

import { feePayMonthTimeList, feePayMonthUpdateTime } from '@/actions/course';
import ContentBox from '@/components/ContentBox';

import IncomeStatementView from './view';
const dateFormat = 'YYYY-MM-DD';

let yearList = [];

let initYear = 2018;

let nowYear = new Date().getFullYear();
let nowMonth = new Date().getMonth();

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

class IncomeStatementDate extends React.Component {
  
  state = {
    editMode: '',
    pagingSearch: {
      year: yearList[0],
      month: '',
    },
    data: [],
    totalRecord: 0,
    loading: false,
    yearList: yearList,
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
    
    this.onSearch()
  }
  compoentDidMount() {

  }

  columns = [
    {
      title: '月份',
      fixed: 'left',
      width: 150,
      dataIndex: 'month',
      render: (text, record, index) => (`${text}月`),
    },
    {
      title: '自动计算日期',
      dataIndex: 'date',
      render: (text,record,index) => (`${text}`)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (text, record, index) => {
        if(index >= nowMonth-1){
          return <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
        }else{
          return '---'
        }
      }
    }
  ];
  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    
    this.props.feePayMonthTimeList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        var list = [];
        for(var i=0;i<data.data.length;i++){
          list.push({month:i+1,date:timestampToTime(data.data[i]),year:condition.year})
        }
        this.setState({ pagingSearch: condition, data:list, loading: false })
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

          this.props.feePayMonthUpdateTime(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  message.success("日期修改成功！");
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
      case "Edit":
        block_content = (
          <IncomeStatementView 
            viewCallback={this.onViewCallback}
            {...this.state}
          />
        )
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
                  </Row>
                </Form>
              }

            </ContentBox>

            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
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
const WrappedManage = Form.create()(IncomeStatementDate);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { currentUser } = state.auth;
  return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    feePayMonthTimeList: bindActionCreators(feePayMonthTimeList, dispatch),
    feePayMonthUpdateTime: bindActionCreators(feePayMonthUpdateTime, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
