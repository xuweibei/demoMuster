/*
课表管理 按日历显示
2018-05-16
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider,
  Calendar
 } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle, getCurrentTimeStamp,
  dateFormat
} from '@/utils';
import { env } from '@/api/env';
//import PanelBox from '@/components/PanelBox';
import ContentBox from '@/components/ContentBox';

import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import moment from 'moment';
const dateFormat2 = 'YYYY-MM-DD';

import { loadDictionary } from '@/actions/dic';
import { courseArrangeByCalendarMonth, courseArrangeByCalendarYear } from '@/actions/course';

class CourseArrangeCalendar extends React.Component {
  chooseMode: string;
  lastChooseYearMonth: string;
  constructor(props){
    super(props);
    var p = props.pagingSearch;
    p.dateStart = props.pagingSearch.dateStart ? props.pagingSearch.dateStart : timestampToTime(getCurrentTimeStamp());
    this.state = {
      pagingSearch: p,
      data_date_obj: {},
      data_month_list: [],
    }
    this.chooseMode = "month";
    this.lastChooseYearMonth = "";
    this.loadBizDictionary = loadBizDictionary.bind(this);
    //(this: any).getListData = this.getListData.bind(this);
    (this: any).dateCellRender = this.dateCellRender.bind(this);
    //(this: any).getMonthData = this.getMonthData.bind(this);
    (this: any).monthCellRender = this.monthCellRender.bind(this);

    (this: any).onSelectDate = this.onSelectDate.bind(this);
    (this: any).onPanelChange = this.onPanelChange.bind(this);

    (this: any).fetchData = this.fetchData.bind(this);
  }
  componentWillMount(){
    this.fetchData();
  }

  fetchData(){
    var _c = this.state.pagingSearch;
    if (!_c || !_c.itemId || !_c.courseplanBatchId) {
      this.setState({
        data_Date_obj: [],
        data_month_list: []
      })
      return;
    }
    var _date = this.state.pagingSearch.dateStart;
    if(this.lastChooseYearMonth){
      if(_date.indexOf(this.lastChooseYearMonth) == 0){
        return;
      }
    }
    if(typeof(_date) == "string"){
      this.lastChooseYearMonth = _date.substr(0, 7);
    }else if(typeof(_date) == "object"){
      var dd = dateFormat(_date._d, dateFormat2);
      this.lastChooseYearMonth = dd.substr(0, 7);
    }
    if(this.chooseMode == "month"){
      this.state.pagingSearch.publishStatus = this.state.pagingSearch.status;
      this.props.courseArrangeByCalendarMonth(this.state.pagingSearch).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state != 'success') {
              message.error(data.message);
              this.setState({ data_date_obj: {} })
          }
          else {
              this.setState({ data_date_obj: data.data.result })
          }
      })
    }else if(this.chooseMode == "year"){
      this.state.pagingSearch.publishStatus = this.state.pagingSearch.status;
      this.props.courseArrangeByCalendarYear(this.state.pagingSearch).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state != 'success') {
              message.error(data.message);
              this.setState({ data_month_list: [] })
          }
          else {
              this.setState({ data_month_list: data.data.result })
          }
      })
    }
  }

  /*getListData(value) {
    let listData;
    switch (value.date()) {
      case 8:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'normal', content: 'This is usual event.' },
        ]; break;
      case 10:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'normal', content: 'This is usual event.' },
          { type: 'error', content: 'This is error event.' },
        ]; break;
      case 15:
        listData = [
          { type: 'warning', content: 'This is warning event' },
          { type: 'normal', content: 'This is very long usual event。。....' },
          { type: 'error', content: 'This is error event 1.' },
          { type: 'error', content: 'This is error event 2.' },
          { type: 'error', content: 'This is error event 3.' },
          { type: 'error', content: 'This is error event 4.' },
        ]; break;
      default:
    }
    return listData || [];
  }*/
  dateCellRender(value) {
    this.chooseMode = "month";
    //const listData = this.getListData(value);
    for(var _date in this.state.data_date_obj){
      var dd = dateFormat(value._d, dateFormat2);
      if(dd == _date){
        var _list = this.state.data_date_obj[_date];
        return (
          <ul className="events">
            {
              _list.map(item => (
                <li key={item}>
                  {item}
                </li>
              ))
            }
          </ul>
        );
      }
    }
  }


  /*getMonthData(value) {
    if (value.month() === 8) {
      return 1394;
    }
  }*/
  monthCellRender(value) {
    this.chooseMode = "year";
    var dd = value.month() + 1;
    var num = "";
    this.state.data_month_list.forEach(function(val, index){
      for(var _month in val){
        if(_month.indexOf(dd) == 0){
          num = val[_month];
          return;
        }
      }
    });

    //const num = this.getMonthData(value);
    return num ? <div className="notes-month">
      <section>{num}</section>
      <span>个课表</span>
    </div> : null;
  }

  onSelectDate(value){
    if(value){
      var dd = dateFormat(value._d, dateFormat2);
      var p = this.state.pagingSearch;
      p.dateStart = dd;
      this.setState({
        pagingSearch: p
      })

      this.fetchData();
    }
  }
  onPanelChange(value: moment, mode: string){
    if(this.chooseMode != mode){
      this.chooseMode = mode;
      this.lastChooseYearMonth = "";
    }
    //this.fetchData();
    this.onSelectDate(value)
  }

  render(){
    /*return (
      <PanelBox title="Calendar Page">
        <Calendar dateCellRender={this.dateCellRender} monthCellRender={this.monthCellRender} />
      </PanelBox>
    )*/
    return (
      <ContentBox titleName={"课表明细"} bottomButton={
        //this.renderBtnControl()
        <Button onClick={() => this.props.viewCallback()} icon="rollback">返回</Button>
      }>
        <Calendar
          dateCellRender={this.dateCellRender}
          monthCellRender={this.monthCellRender}
          defaultValue={moment(this.state.pagingSearch.dateStart, dateFormat2)}
          onPanelChange={this.onPanelChange}
          onSelect={this.onSelectDate}
        />
      </ContentBox>
    )
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseArrangeCalendar);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseArrangeByCalendarMonth: bindActionCreators(courseArrangeByCalendarMonth, dispatch),
        courseArrangeByCalendarYear: bindActionCreators(courseArrangeByCalendarYear, dispatch),
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
