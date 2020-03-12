// /*
// 分部预收款确认汇总表
// */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, DatePicker
} from 'antd';
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ProductView from '@/views/ZB/Product/ProductView/view'

const Option = Select.Option;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind, formatMoment } from '@/utils';

import {
  fbAdvanceReceiveList,
  fbAdvanceReceiveDetailed
} from '@/actions/finance';

const dateFormat = 'YYYY-MM-DD';

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

class fbAdvanceReceive extends React.Component {
  constructor() {
    super();
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        payeeType: '', //收费方
        zbPayeeType: 1,//签约公司
        year: yearList[0],
        month: '',
        operationType: 1,
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      yearList: yearList,
      searchByDetail: false, //是否按明细查询
      data_list: []
    };
    this.index_last = 0;
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'product_branch_price_status', 'producttype', 'dic_Allow', 'payee_type', 'pos_account_type']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    this.onSearch();
  }
  componentWillUnMount() {
  }

  renderContent = (value, row, index) => {
      const obj = {
          children: value,
          props: {},
      };
      if(this.state.searchByDetail){//明细
        if (row.isCut) {
            obj.props.colSpan = 0;
        }
      }else{
        if (index == this.index_last) {//汇总
            obj.props.colSpan = 0;
        }
      }
      return obj;
  };

  renderTd = (val,row,index) => {

    var amount = 0;
    
    if( row.sort && this.state.searchByDetail){
      if(row.isCut && this.state.data_list.length ){
        this.state.data_list[row.key].data.map(item => {
            amount += parseFloat(item[val] || 0);
        })
      }else{
        return <span>{row[val]==null ? 0 : formatMoney(row[val])}</span>
      }
    }else{
      if (index < this.index_last) {
          return <span>{row[val]==null ? 0 : formatMoney(row[val])}</span>
      }else{
        this.state.data.map(item => {
            amount += parseFloat(item[val] || 0);
        })
      }
    }

    return <span>{formatMoney(amount)}</span>
  }

  columns = [
    {
      title: '序号',
      width: 50,
      fixed: 'left',
      render: (text, record, index) => {
          if (index < this.index_last) {
              return <span>{index+1}</span>
          }
          return {
              children: <span>合计：</span>,
              props: {
                  colSpan: 3,
              },
          }
      }
    },
    {
      title: '分部类型',
      width: 80,
      fixed: 'left',
      dataIndex: 'branchType',
      render: (text, record, index) => {return this.renderContent(record.branchType == 1 ? '线下分部' : '官网分部',record, index)}
    },
    {
      title: '分部',
      width: 150,
      fixed: 'left',
      dataIndex: 'branchName',
      render: this.renderContent,
    },{
      title: '大客户订单',
      children: [{
        title: 'ACCA项目',
        width: 100,
        dataIndex: 'partnerAccaAmount',
        render: (text, record, index) => {
            return this.renderTd('partnerAccaAmount', record, index)
        }
      },{
        title: 'CMA项目',
        width: 100,
        dataIndex: 'partnerAmaAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerAmaAmount', record, index)
        }
      },{
        title: 'CFA项目',
        width: 100,
        dataIndex: 'partnerCfaAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerCfaAmount', record, index)
        }
      },{
        width: 100,
        title: 'FRM项目',
        dataIndex: 'partnerFrmAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerFrmAmount', record, index)
        }
      },{
        width: 100,
        title: 'CPA项目',
        dataIndex: 'partnerCfaAmount2',
        render: (text, record, index) => {
          return this.renderTd('partnerCfaAmount2', record, index)
        }
      },{
        width: 100,
        title: 'CIMA项目',
        dataIndex: 'partnerCimaAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerCimaAmount', record, index)
        }
      },{
        width: 100,
        title: '名企直通',
        dataIndex: 'partnerMqztAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerMqztAmount', record, index)
        }
      }]
    },{
      title: 'ACCA项目个人订单',
      children: [{
        title: '面授',
        children: [{
        width: 100,
          title: '签约通关',
          width: 100,
          dataIndex: 'zbAccaFaceRestudyAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaFaceRestudyAmount', record, index)
          }
        },{
          title: '标准班',
          width: 100,
          dataIndex: 'zbAccaFaceStdAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaFaceStdAmount', record, index)
          }
        }]
      },{
        title: '财萃网络',
        children: [{
          title: 'U+课程',
          width: 100,
          dataIndex: 'zbAccaNetRestudyAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaNetRestudyAmount', record, index)
          }
        },{
          title: '标准班',
          width: 100,
          dataIndex: 'zbAccaNetStdAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaNetStdAmount', record, index)
          }
        }]
      }]
    },
    {
      title: 'CMA项目个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCmaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCmaFaceAmount', record, index)
        }
      },{
        title: '网络',
        width: 100,
        dataIndex: 'zbCmaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCmaNetAmount', record, index)
        }
      }]
    },
    {
      title: 'CFA个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCfaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCfaFaceAmount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbCfaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCfaNetAmount', record, index)
        }
      }]
    },
    {
      title: 'FRM个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbFrmFaceamount',
        render: (text, record, index) => {
          return this.renderTd('zbFrmFaceamount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbFrmNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbFrmNetAmount', record, index)
        }
      }]
    },
    {
      title: 'CPA个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCicpaaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCicpaaFaceAmount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbCicpaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCicpaNetAmount', record, index)
        }
      }]
    },
    {
      title: 'CIMA个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCimaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCimaFaceAmount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbCimaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCimaNetAmount', record, index)
        }
      }]
    },
    {
      title: '名企直通个人订单',
      width: 100,
      dataIndex: 'zbMqztAmount',
      render: (text, record, index) => {
        return this.renderTd('zbMqztAmount', record, index)
      }
    },
    {
      title: '留学个人订单',
      width: 100,
      dataIndex: 'zbLxAmount',
      render: (text, record, index) => {
        return this.renderTd('zbLxAmount', record, index)
      }
    },
    {
      title: '游学个人订单',
      width: 100,
      dataIndex: 'zbYxAmount',
      render: (text, record, index) => {
        return this.renderTd('zbYxAmount', record, index)
      }
    },
    {
      title: '收款合计',
      width: 120,
      fixed: 'right',
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return this.renderTd('totalAmount', record, index)
      }
    }
  ];

  columnsByDetail = [
    {
      title: '序号',
      width: 50,
      fixed: 'left',
      render: (text, record, index) => {
          if (!record.isCut) {
              return <span>{record.sort}</span>
          }
          return {
              children: <span>合计：</span>,
              props: {
                  colSpan: 4,
              },
          }
      }
    },
    {
      title: '分部类型',
      width: 80,
      fixed: 'left',
      dataIndex: 'branchType',
      render: (text, record, index) => {return this.renderContent(record.branchType == 1 ? '线下分部' : '官网分部',record, index)}
    },
    {
      title: '分部',
      width: 150,
      fixed: 'left',
      dataIndex: 'branchName',
      render: this.renderContent,
    },
    {
      title: '月份',
      width: 50,
      fixed: 'left',
      dataIndex: 'month',
      render: (text, record, index) => {return this.renderContent(`${record.month}月`,record, index)}
    },{
      title: '大客户订单',
      children: [{
        title: 'ACCA项目',
        width: 100,
        dataIndex: 'partnerAccaAmount',
        render: (text, record, index) => {
            return this.renderTd('partnerAccaAmount', record, index)
        }
      },{
        title: 'CMA项目',
        width: 100,
        dataIndex: 'partnerAmaAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerAmaAmount', record, index)
        }
      },{
        title: 'CFA项目',
        width: 100,
        dataIndex: 'partnerCfaAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerCfaAmount', record, index)
        }
      },{
        width: 100,
        title: 'FRM项目',
        dataIndex: 'partnerFrmAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerFrmAmount', record, index)
        }
      },{
        width: 100,
        title: 'CPA项目',
        dataIndex: 'partnerCfaAmount2',
        render: (text, record, index) => {
          return this.renderTd('partnerCfaAmount2', record, index)
        }
      },{
        width: 100,
        title: 'CIMA项目',
        dataIndex: 'partnerCimaAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerCimaAmount', record, index)
        }
      },{
        width: 100,
        title: '名企直通',
        dataIndex: 'partnerMqztAmount',
        render: (text, record, index) => {
          return this.renderTd('partnerMqztAmount', record, index)
        }
      }]
    },{
      title: 'ACCA项目个人订单',
      children: [{
        title: '面授',
        children: [{
        width: 100,
          title: '签约通关',
          width: 100,
          dataIndex: 'zbAccaFaceRestudyAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaFaceRestudyAmount', record, index)
          }
        },{
          title: '标准班',
          width: 100,
          dataIndex: 'zbAccaFaceStdAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaFaceStdAmount', record, index)
          }
        }]
      },{
        title: '财萃网络',
        children: [{
          title: 'U+课程',
          width: 100,
          dataIndex: 'zbAccaNetRestudyAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaNetRestudyAmount', record, index)
          }
        },{
          title: '标准班',
          width: 100,
          dataIndex: 'zbAccaNetStdAmount',
          render: (text, record, index) => {
            return this.renderTd('zbAccaNetStdAmount', record, index)
          }
        }]
      }]
    },
    {
      title: 'CMA项目个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCmaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCmaFaceAmount', record, index)
        }
      },{
        title: '网络',
        width: 100,
        dataIndex: 'zbCmaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCmaNetAmount', record, index)
        }
      }]
    },
    {
      title: 'CFA个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCfaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCfaFaceAmount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbCfaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCfaNetAmount', record, index)
        }
      }]
    },
    {
      title: 'FRM个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbFrmFaceamount',
        render: (text, record, index) => {
          return this.renderTd('zbFrmFaceamount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbFrmNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbFrmNetAmount', record, index)
        }
      }]
    },
    {
      title: 'CPA个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCicpaaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCicpaaFaceAmount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbCicpaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCicpaNetAmount', record, index)
        }
      }]
    },
    {
      title: 'CIMA个人订单',
      children: [{
        title: '面授',
        width: 100,
        dataIndex: 'zbCimaFaceAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCimaFaceAmount', record, index)
        }
      },{
        title: '网课',
        width: 100,
        dataIndex: 'zbCimaNetAmount',
        render: (text, record, index) => {
          return this.renderTd('zbCimaNetAmount', record, index)
        }
      }]
    },
    {
      title: '名企直通个人订单',
      width: 100,
      dataIndex: 'zbMqztAmount',
      render: (text, record, index) => {
        return this.renderTd('zbMqztAmount', record, index)
      }
    },
    {
      title: '留学个人订单',
      width: 100,
      dataIndex: 'zbLxAmount',
      render: (text, record, index) => {
        return this.renderTd('zbLxAmount', record, index)
      }
    },
    {
      title: '游学个人订单',
      width: 100,
      dataIndex: 'zbYxAmount',
      render: (text, record, index) => {
        return this.renderTd('zbYxAmount', record, index)
      }
    },
    {
      title: '收款合计',
      width: 120,
      fixed: 'right',
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return this.renderTd('totalAmount', record, index)
      }
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({
      data_list: [],
      data: []
    })
    var that = this;
    var setData = function(data){
      //数据结构处理
      let dataList = [],sort = 0;
      data.map((item,index) => {
        var list = item.data;
        list.push({});
        let len = list.length - 1;
        list.map((obj,key) => {
          if(obj.branchId){
            sort += 1;
          }
          if(key == len){
            obj.isCut = true;
          }else{
            obj.isCut = false;
          }
          obj.key = index;
          obj.sort = sort;
          dataList.push(obj);
        })
      })

      that.index_last = dataList.length - 1;

      data.data = dataList;

      that.setState({
        pagingSearch: condition,
        data: dataList,
        loading: false
      })
    }

    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    if(condition.zbPayeeType=='中博教育') condition.zbPayeeType = 1;
    if(this.state.searchByDetail){
      this.props.fbAdvanceReceiveDetailed(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if(data.data.length){
            // document.querySelector('.ant-table-body').style.position = 'relative';
            // document.querySelector('.ant-table-placeholder').style.border = '1px solid #e8e8e8';
            // document.querySelector('.ant-table-placeholder').style.borderTop = 'none';

          }else{
            // document.querySelector('.ant-table-body').style.position = 'inherit';
            // document.querySelector('.ant-table-placeholder').style.border = '1px solid #e8e8e8';
            // document.querySelector('.ant-table-placeholder').style.borderTop = 'none';

          }
          this.setState({
            data_list: data.data
          })
          
          setData(data.data)

        }
        else {
          this.setState({ loading: false })
          message.error(data.message);
        }
      })
    }else{
      this.props.fbAdvanceReceiveList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          if(data.data.length){
            data.data.push({});
            this.index_last = data.data.length - 1;
            // document.querySelector('.ant-table-body').style.position = 'relative';
            // document.querySelector('.ant-table-placeholder').style.border = '1px solid #e8e8e8';
            // document.querySelector('.ant-table-placeholder').style.borderTop = 'none';

          }else{
            // document.querySelector('.ant-table-body').style.position = 'inherit';
            // document.querySelector('.ant-table-placeholder').style.border = '1px solid #e8e8e8';
            // document.querySelector('.ant-table-placeholder').style.borderTop = 'none';
            
          }
          this.setState({
            pagingSearch: condition,
            ...data,
            loading: false
          })
        }
        else {
          this.setState({ loading: false })
          message.error(data.message);
        }
      })
    }
    
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
    }
  }
  onLookAll = () => {
    
    this.setState({
      searchByDetail: false,
    })
    setTimeout(() => {
      this.onSearch();
    }, 200);
  }
  onLookDetail = () => {
    let pagingSearch = this.state.pagingSearch;
    pagingSearch.operationType = 1;
    this.setState({
      searchByDetail: true,
      pagingSearch: pagingSearch
    })
    setTimeout(() => {
      this.onSearch();
    }, 200);
  }
  onProduce = () => {
    message.success("此月份报表生成任务创建成功，请于明天进行报表浏览及导出！");
  }
  renderByByDetail = () => {
    return this.columnsByDetail;
  }
  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ProductView':
        block_content = <ProductView
          viewCallback={this.onViewCallback}
          currentDataModel={this.state.currentDataModel}
          editMode={'View'}
        />
        break;
      case 'Manage':
      default:
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];

        extendButtons.push(<Button onClick={() => { this.onLookAll() }} icon="search" type="primary">查询</Button>);

        extendButtons.push(<Button onClick={() => { this.onLookDetail() }} icon="search" className="button_dark">查看收款明细</Button>);
        
        if(this.state.pagingSearch.month == (new Date().getMonth()+1)){
          extendButtons.push(<Button onClick={() => { this.onProduce() }} icon="edit" className="button_dark">预生成</Button>);
        }

        extendButtons.push(<FileDownloader
          apiUrl={'/edu/feeBranchPayMonth/exportFeeBranchPayMonthList'}//api下载地址
          method={'get'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出汇总表'}
        ></FileDownloader>);

        extendButtons.push(<FileDownloader
          apiUrl={'/edu/feeBranchPayMonth/exportFeeBranchPayMonthDetailed'}//api下载地址
          method={'get'}//提交方式
          options={{...this.state.pagingSearch,operationType:2}}//提交参数
          title={'导出明细表'}
        ></FileDownloader>)
          
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'',true)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
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
                        {getFieldDecorator('zbPayeeType', { initialValue: dataBind(this.state.pagingSearch.zbPayeeType) })(
                          <Select>
                          {this.state.pos_account_type.map((item, index) => {
                            return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                        </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="月份" >
                        {getFieldDecorator('month', { initialValue: '' })(
                           <Select>
                             <Option value="">全部</Option>
                             <Option value="1">1</Option>
                             <Option value="2">2</Option>
                             <Option value="3">3</Option>
                             <Option value="4">4</Option>
                             <Option value="5">5</Option>
                             <Option value="6">6</Option>
                             <Option value="7">7</Option>
                             <Option value="8">8</Option>
                             <Option value="9">9</Option>
                             <Option value="10">10</Option>
                             <Option value="11">11</Option>
                             <Option value="12">12</Option>
                           </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'收费方'} >
                        {getFieldDecorator('payeeType', { initialValue: '' })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.payee_type.map((item, index) => {
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
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <h2 style={{textAlign: 'center'}}>
              {
                this.state.searchByDetail ? 
                this.state.pagingSearch.year + '年分部收款明细汇总表'
                :
                '分部收款汇总表'
              }
              （{this.state.pagingSearch.month?this.state.pagingSearch.month+'月':'全年'}）
              【<span style={{fontSize: 16}}>签约公司：{ this.state.pagingSearch.zbPayeeType==1?'中博教育':'中博城通' }<b style={{fontWeight: 'normal',paddingLeft: 30}}>收费方：{ this.state.pagingSearch.payeeType?getDictionaryTitle(this.state.payee_type,this.state.pagingSearch.payeeType): '全部' }</b></span>】
              </h2>
              <Table columns={this.state.searchByDetail ? this.columnsByDetail : this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={this.state.data.length ? { x: 2800, y: 400 } : { x: 2800 }}
              //rowSelection={rowSelection}
              />
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(fbAdvanceReceive);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    fbAdvanceReceiveList: bindActionCreators(fbAdvanceReceiveList, dispatch),
    fbAdvanceReceiveDetailed: bindActionCreators(fbAdvanceReceiveDetailed, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
