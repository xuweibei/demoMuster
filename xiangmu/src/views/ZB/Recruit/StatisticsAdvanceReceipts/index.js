 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, DatePicker
} from 'antd';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader'; 
import ProductView from '@/views/ZB/Product/ProductView/view';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import RefundAmount from './Refund';
import DivisionalAmount from './Branch';
import PaymentOrderNumber from './Payment'; 
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney,formatMoment } from '@/utils';
import { ListOfPrepaidStatistics } from '@/actions/base';
import {
  partnerProductPriceApplyAdd, partnerProductPriceApplyUpdate, partnerProductPriceApplyBatchCopy, partnerProductPriceApplyDelete, partnerProductPriceApplyAudit, partnerProductPriceApplyBatchSubmit
} from '@/actions/partner'; 

class ProductPriceApplyManage extends React.Component {
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

    let timeArr = timestampToTime(new Date().getTime()).split('-');
    let startTimeYear = timeArr[0];
    let startTimeMonth = timeArr[1];
    let startTimeDay = '1';
    this.state = {
      press:'customerColumns',
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        confirmDateStart:'',
        confirmDateEnd:'',
        startDate:startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
        currentPage: 1,
        pageSize: 10,
        zbPayeeType:'',
        endDate:''
      },
      data: [],
      partnerData: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['zb_payee_type']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    this.onSearch();
  }
  componentWillUnMount() {
  }

  columnsTry = [
    
    {
      title: '分部',
      fixed: 'left',
      width:150,
      dataIndex: 'branchName',
    },
    {
      title: '缴费订单数',
      dataIndex: 'teacherCenterName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('PayNum',record)
        }}>{record.studentName}</a>;
      }
    },
    {
      title: '缴费总金额',
      dataIndex: 'studentName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('TotalPay',record)
        }}>{record.studentName}</a>;
      }
    },
    {
      title: '财务已确认缴费',
      dataIndex: 'loginName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('surePay',record)
        }}>{record.sureAmount}</a>;
      }
    },
    {
      title: '财务待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('toBePay',record)
        }}>{record.notSureAmount}</a>;
      }
    },
    {
      title: '中博待确认缴费',
      dataIndex: 'zbSureAmount',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('zbToBePay',record)
        }}>{record.zbSureAmount}</a>;
      }
    },
    {
      title: '非中博待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => { 
        let tp = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;
        if(record.notSureAmount && record.zbSureAmount){
          if(record.notSureAmount- record.zbSureAmount == 0) return 0;
          if(index == this.state.data.length-1)return record.notSureAmount?tp.test(record.notSureAmount- record.zbSureAmount)? (record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount:0;
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a>;
        }else if( record.notSureAmount - record.zbSureAmount == 0 ){
          return 0;
        }else{
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a> || 0 ;
        } 
      }
    },
    {
      title: '临时缴费',
      dataIndex: 'interimAmount',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('shortPay',record)
        }}>{record.interimAmount}</a>;
      }
    },
    {
      title: '退费',
      dataIndex: 'productName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('Refund',record)
        }}>{record.studentName}</a>;
      }
    },
    {
      title: '大客户订单缴费',
      dataIndex: 'partnerAmount',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('bigOrder',record)
        }}>{record.partnerAmount}</a>;
      }
    },
    {
      title: '个人订单缴费',
      dataIndex: 'personAmount',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onLookView('perOrder',record)
        }}>{record.personAmount}</a>;
      }
    }
  ]
  //按分部
  columns = [
    {
      title: '分部',
      fixed: 'left',
      width: 120,
      dataIndex: 'groupName',
    },
    {
      title: '缴费订单数',
      dataIndex: 'orderCount',
      //自定义显示
      render: (text, record, index) => { 
        if(record.orderCount==0)return 0;
        if(index == this.state.data.length-1)return record.orderCount;
        return <a onClick={() => {
          this.onLookView('PayNum',record)
        }}>{record.orderCount}</a>;
      }
    },
    {
      title: '缴费总金额',
      dataIndex: 'allAmount',
      render: (text, record, index) => {
        if(record.allAmount==0)return 0;
        if(index == this.state.data.length-1)return record.allAmount;
        return <a onClick={() => {
          this.onLookView('TotalPay',record)
        }}>{record.allAmount}</a>;
      }
    },
    {
      title: '财务已确认缴费',
      dataIndex: 'sureAmount',
      render: (text, record, index) => {
        if(record.sureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.sureAmount;
        return <a onClick={() => {
          this.onLookView('surePay',record)
        }}>{record.sureAmount}</a>;
      }
    },
    {
      title: '财务待确认缴费',
      dataIndex: 'notSureAmount',
      render: (text, record, index) => {
        if(record.notSureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.notSureAmount;
        return <a onClick={() => {
          this.onLookView('toBePay',record)
        }}>{record.notSureAmount}</a>;
      }
    },
    {
      title: '中博待确认缴费',
      dataIndex: 'zbSureAmount',
      render: (text, record, index) => {
        if(record.zbSureAmount == 0 ) return 0;
        if(index == this.state.data.length-1)return record.zbSureAmount;
        return <a onClick={() => {
          this.onLookView('zbToBePay',record)
        }}>{record.zbSureAmount}</a>;
      }
    },
    {
      title: '非中博待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => {   
        let tp = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;
        if(record.notSureAmount && record.zbSureAmount){
          if(record.notSureAmount- record.zbSureAmount == 0) return 0;
          if(index == this.state.data.length-1)return record.notSureAmount?tp.test(record.notSureAmount- record.zbSureAmount)? (record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount:0;
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a>;
        }else if( record.notSureAmount - record.zbSureAmount == 0 ){
          return 0;
        }else{
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a> || 0 ;
        } 
      }
    },
    {
      title: '临时缴费',
      dataIndex: 'interimAmount',
      render: (text, record, index) => {
        if(record.interimAmount==0)return 0;
        if(index == this.state.data.length-1)return record.interimAmount;
        return <a onClick={() => {
          this.onLookView('shortPay',record)
        }}>{record.interimAmount}</a>;
      }
    },
    {
      title: '退费',
      dataIndex: 'refundsAmount',
      render: (text, record, index) => {
        if(record.refundsAmount==0)return 0;
        if(index == this.state.data.length-1)return record.refundsAmount;
        return <a onClick={() => {
          this.onLookView('Refund',record)
        }}>{record.refundsAmount}</a>;
      }
    },
    {
      title: '大客户订单缴费',
      dataIndex: 'partnerAmount',
      render: (text, record, index) => {
        if(record.partnerAmount==0)return 0;
        if(index == this.state.data.length-1)return record.partnerAmount;
        return <a onClick={() => {
          this.onLookView('bigOrder',record)
        }}>{record.partnerAmount}</a>;
      }
    },
    {
      title: '个人订单缴费',
      fixed: 'right',
      dataIndex:'personAmount',
      width: 120,
      render: (text, record, index) => {
        if(record.personAmount==0)return 0;
        if(index == this.state.data.length-1)return record.personAmount;
        return <a onClick={() => {
          this.onLookView('perOrder',record)
        }}>{record.personAmount}</a>;
      }
    }
  ];
  //按大客户
  customerColumns = [
    {
      title: '大客户',
      fixed: 'left',
      width: 150,
      dataIndex: 'groupName',
    },
    {
      title: '分部',
      dataIndex: 'otherName',
    },
    {
      title: '缴费订单数',
      dataIndex: 'orderCount',
      render: (text, record, index) => {
        if(record.orderCount==0)return 0;
        if(index == this.state.data.length-1)return record.orderCount;
        return <a onClick={() => {
          this.onLookView('BiGPayNum',record)
        }}>{record.orderCount}</a>;
      }
    },
    {
      title: '缴费总金额',
      dataIndex: 'allAmount',
      render: (text, record, index) => {
        if(record.allAmount==0)return 0;
        if(index == this.state.data.length-1)return record.allAmount;
        return <a onClick={() => {
          this.onLookView('TotalPay',record)
        }}>{record.allAmount}</a>;
      }
    },
    {
      title: '财务已确认缴费',
      dataIndex: 'sureAmount',
      render: (text, record, index) => {
        if(record.sureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.sureAmount;
        return <a onClick={() => {
          this.onLookView('surePay',record)
        }}>{record.sureAmount}</a>;
      }
    },
    {
      title: '财务待确认缴费',
      dataIndex: 'notSureAmount',
      render: (text, record, index) => {
        if(record.notSureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.notSureAmount;
        return <a onClick={() => {
          this.onLookView('toBePay',record)
        }}>{record.notSureAmount}</a>;
      }
    },
    {
      title: '中博待确认缴费',
      dataIndex: 'zbSureAmount',
      render: (text, record, index) => {
        if(record.zbSureAmount == 0 ) return 0;
        if(index == this.state.data.length-1)return record.zbSureAmount;
        return <a onClick={() => {
          this.onLookView('zbToBePay',record)
        }}>{record.zbSureAmount}</a>;
      }
    },
    {
      title: '非中博待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => {   
        let tp = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;
        if(record.notSureAmount && record.zbSureAmount){
          if(record.notSureAmount- record.zbSureAmount == 0) return 0;
          if(index == this.state.data.length-1)return record.notSureAmount?tp.test(record.notSureAmount- record.zbSureAmount)? (record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount:0;
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a>;
        }else if( record.notSureAmount - record.zbSureAmount == 0 ){
          return 0;
        }else{
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a> || 0 ;
        } 
      }
    },
    {
      title: '临时缴费',
      dataIndex: 'interimAmount',
      render: (text, record, index) => {
        if(record.interimAmount==0)return 0;
        if(index == this.state.data.length-1)return record.interimAmount;
        return <a onClick={() => {
          this.onLookView('shortPay',record)
        }}>{record.interimAmount}</a>;
      }
    },
    {
      title: '退费',
      dataIndex: 'refundsAmount',
      fixed:'right',
      width: 120,
      render: (text, record, index) => {
        if(record.refundsAmount==0)return 0;
        if(index == this.state.data.length-1)return record.refundsAmount;
        return <a onClick={() => {
          this.onLookView('BigRefund',record)
        }}>{record.refundsAmount}</a>;
      }
    },
  ];

  //按高校
  universitiesColumns = [
    {
      title: '高校',
      fixed: 'left',
      width: 120,
      dataIndex: 'groupName',
    },
    {
      title: '缴费订单数',
      dataIndex: 'orderCount',
      render: (text, record, index) => {
        if(record.orderCount==0)return 0;
        if(index == this.state.data.length-1)return record.orderCount;
        return <a onClick={() => {
          this.onLookView('HighPayNum',record)
        }}>{record.orderCount}</a>;
      }
    },
    {
      title: '缴费总金额',
      dataIndex: 'allAmount',
      render: (text, record, index) => {
        if(record.allAmount==0)return 0;
        if(index == this.state.data.length-1)return record.allAmount;
        return <a onClick={() => {
          this.onLookView('TotalPay',record)
        }}>{record.allAmount}</a>;
      }
    },
    {
      title: '财务已确认缴费',
      dataIndex: 'sureAmount',
      render: (text, record, index) => {
        if(record.sureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.sureAmount;
        return <a onClick={() => {
          this.onLookView('surePay',record)
        }}>{record.sureAmount}</a>;
      }
    },
    {
      title: '财务待确认缴费',
      dataIndex: 'notSureAmount',
      render: (text, record, index) => {
        if(record.notSureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.notSureAmount;
        return <a onClick={() => {
          this.onLookView('toBePay',record)
        }}>{record.notSureAmount}</a>;
      }
    },
    {
      title: '中博待确认缴费',
      dataIndex: 'zbSureAmount',
      render: (text, record, index) => {
        if(record.zbSureAmount == 0 ) return 0;
        if(index == this.state.data.length-1)return record.zbSureAmount;
        return <a onClick={() => {
          this.onLookView('zbToBePay',record)
        }}>{record.zbSureAmount}</a>;
      }
    },
    {
      title: '非中博待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => {   
        let tp = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;
        if(record.notSureAmount && record.zbSureAmount){
          if(record.notSureAmount- record.zbSureAmount == 0) return 0;
          if(index == this.state.data.length-1)return record.notSureAmount?tp.test(record.notSureAmount- record.zbSureAmount)? (record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount:0;
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a>;
        }else if( record.notSureAmount - record.zbSureAmount == 0 ){
          return 0;
        }else{
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a> || 0 ;
        } 
      }
    },
    {
      title: '临时缴费',
      dataIndex: 'interimAmount',
      render: (text, record, index) => {
        if(record.interimAmount==0)return 0;
        if(index == this.state.data.length-1)return record.interimAmount;
        return <a onClick={() => {
          this.onLookView('shortPay',record)
        }}>{record.interimAmount}</a>;
      }
    },
    {
      title: '退费',
      dataIndex: 'refundsAmount',
      render: (text, record, index) => {
        if(record.refundsAmount==0)return 0;
        if(index == this.state.data.length-1)return record.refundsAmount;
        return <a onClick={() => {
          this.onLookView('HighRefund',record)
        }}>{record.refundsAmount}</a>;
      }
    },
    {
      title: '大客户订单缴费',
      dataIndex: 'partnerAmount',
      render: (text, record, index) => {
        if(record.partnerAmount==0)return 0;
        if(index == this.state.data.length-1)return record.partnerAmount;
        return <a onClick={() => {
          this.onLookView('bigOrder',record)
        }}>{record.partnerAmount}</a>;
      }
    },
    {
      title: '个人订单缴费',
      dataIndex: 'personAmount',
      fixed:'right',
      width: 120,
      render: (text, record, index) => {
        if(record.personAmount==0)return 0;
        if(index == this.state.data.length-1)return record.personAmount;
        return <a onClick={() => {
          this.onLookView('perOrder',record)
        }}>{record.personAmount}</a>;
      }
    },
  ];
  
  //按高校校区
  campusColumns = [
    {
      title: '高校校区',
      fixed: 'left',
      width: 120,
      dataIndex: 'groupName',
    },
    {
      title: '缴费订单数',
      dataIndex: 'orderCount',
      render: (text, record, index) => {
        if(record.orderCount==0)return 0;
        if(index == this.state.data.length-1)return record.orderCount;
        return <a onClick={() => {
          this.onLookView('CampusPayNum',record)
        }}>{record.orderCount}</a>;
      }
    },
    {
      title: '缴费总金额',
      dataIndex: 'allAmount',
      render: (text, record, index) => {
        if(record.allAmount==0)return 0;
        if(index == this.state.data.length-1)return record.allAmount;
        return <a onClick={() => {
          this.onLookView('TotalPay',record)
        }}>{record.allAmount}</a>;
      }
    },
    {
      title: '财务已确认缴费',
      dataIndex: 'sureAmount',
      render: (text, record, index) => {
        if(record.sureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.sureAmount;
        return <a onClick={() => {
          this.onLookView('surePay',record)
        }}>{record.sureAmount}</a>;
      }
    },
    {
      title: '财务待确认缴费',
      dataIndex: 'notSureAmount',
      render: (text, record, index) => {
        if(record.notSureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.notSureAmount;
        return <a onClick={() => {
          this.onLookView('toBePay',record)
        }}>{record.notSureAmount}</a>;
      }
    },
    {
      title: '中博待确认缴费',
      dataIndex: 'zbSureAmount',
      render: (text, record, index) => {
        if(record.zbSureAmount == 0 ) return 0;
        if(index == this.state.data.length-1)return record.zbSureAmount;
        return <a onClick={() => {
          this.onLookView('zbToBePay',record)
        }}>{record.zbSureAmount}</a>;
      }
    },
    {
      title: '非中博待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => {   
        let tp = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;
        if(record.notSureAmount && record.zbSureAmount){
          if(record.notSureAmount- record.zbSureAmount == 0) return 0;
          if(index == this.state.data.length-1)return record.notSureAmount?tp.test(record.notSureAmount- record.zbSureAmount)? (record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount:0;
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a>;
        }else if( record.notSureAmount - record.zbSureAmount == 0 ){
          return 0;
        }else{
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a> || 0 ;
        } 
      }
    },
    {
      title: '临时缴费',
      dataIndex: 'interimAmount',
      render: (text, record, index) => {
        if(record.interimAmount==0)return 0;
        if(index == this.state.data.length-1)return record.interimAmount;
        return <a onClick={() => {
          this.onLookView('shortPay',record)
        }}>{record.interimAmount}</a>;
      }
    },
    {
      title: '退费',
      dataIndex: 'refundsAmount',
      render: (text, record, index) => {
        if(record.refundsAmount==0)return 0;
        if(index == this.state.data.length-1)return record.refundsAmount;
        return <a onClick={() => {
          this.onLookView('CampusRefund',record)
        }}>{record.refundsAmount}</a>;
      }
    },
    {
      title: '大客户订单缴费',
      dataIndex: 'partnerAmount',
      render: (text, record, index) => {
        if(record.partnerAmount==0)return 0;
        if(index == this.state.data.length-1)return record.partnerAmount;
        return <a onClick={() => {
          this.onLookView('bigOrder',record)
        }}>{record.partnerAmount}</a>;
      }
    },
    {
      title: '个人订单缴费',
      dataIndex: 'personAmount',
      fixed:'right',
      width: 120,
      render: (text, record, index) => {
        if(record.personAmount==0)return 0;
        if(index == this.state.data.length-1)return record.personAmount;
        return <a onClick={() => {
          this.onLookView('perOrder',record)
        }}>{record.personAmount}</a>;
      }
    },
  ];
  
  //按项目
  projectColumns = [
    {
      title: '项目',
      fixed: 'left',
      width: 120,
      dataIndex: 'groupName',
    },
    {
      title: '缴费订单数',
      dataIndex: 'orderCount',
      render: (text, record, index) => {
        if(record.orderCount==0)return 0;
        if(index == this.state.data.length-1)return record.orderCount;
        return <a onClick={() => {
          this.onLookView('ProjectPayNum',record)
        }}>{record.orderCount}</a>;
      }
    },
    {
      title: '缴费总金额',
      dataIndex: 'allAmount',
      render: (text, record, index) => {
        if(record.allAmount==0)return 0;
        if(index == this.state.data.length-1)return record.allAmount;
        return <a onClick={() => {
          this.onLookView('TotalPay',record)
        }}>{record.allAmount}</a>;
      }
    },
    {
      title: '财务已确认缴费',
      dataIndex: 'sureAmount',
      render: (text, record, index) => {
        if(record.sureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.sureAmount;
        return <a onClick={() => {
          this.onLookView('surePay',record)
        }}>{record.sureAmount}</a>;
      }
      //自定义显示
    },
    {
      title: '财务待确认缴费',
      dataIndex: 'notSureAmount',
      render: (text, record, index) => {
        if(record.notSureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.notSureAmount;
        return <a onClick={() => {
          this.onLookView('toBePay',record)
        }}>{record.notSureAmount}</a>;
      }
    },
    {
      title: '中博待确认缴费',
      dataIndex: 'zbSureAmount',
      render: (text, record, index) => {
        if(record.zbSureAmount == 0 ) return 0;
        if(index == this.state.data.length-1)return record.zbSureAmount;
        return <a onClick={() => {
          this.onLookView('zbToBePay',record)
        }}>{record.zbSureAmount}</a>;
      }
    },
    {
      title: '非中博待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => {   
        let tp = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;
        if(record.notSureAmount && record.zbSureAmount){
          if(record.notSureAmount- record.zbSureAmount == 0) return 0;
          if(index == this.state.data.length-1)return record.notSureAmount?tp.test(record.notSureAmount- record.zbSureAmount)? (record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount:0;
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a>;
        }else if( record.notSureAmount - record.zbSureAmount == 0 ){
          return 0;
        }else{
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a> || 0 ;
        } 
      }
    },
    {
      title: '退费',
      dataIndex: 'refundsAmount',
      render: (text, record, index) => {
        if(record.refundsAmount==0)return 0;
        if(index == this.state.data.length-1)return record.refundsAmount;
        return <a onClick={() => {
          this.onLookView('ProjectRefund',record)
        }}>{record.refundsAmount}</a>;
      }
    },
    {
      title: '大客户订单缴费',
      dataIndex: 'partnerAmount',
      render: (text, record, index) => {
        if(record.partnerAmount==0)return 0;
        if(index == this.state.data.length-1)return record.partnerAmount;
        return <a onClick={() => {
          this.onLookView('bigOrder',record)
        }}>{record.partnerAmount}</a>;
      }
    },
    {
      title: '个人订单缴费',
      dataIndex: 'personAmount',
      fixed:'right',
      width: 120,
      render: (text, record, index) => {
        if(record.personAmount==0)return 0;
        if(index == this.state.data.length-1)return record.personAmount;
        return <a onClick={() => {
          this.onLookView('perOrder',record)
        }}>{record.personAmount}</a>;
      }
    },
  ];


  
  //按班型
  typeColumns = [
    {
      title: '班型',
      fixed: 'left',
      width: 120,
      dataIndex: 'groupName',
    },
    {
      title: '相关项目',
      dataIndex: 'otherName',
    },
    {
      title: '缴费订单数',
      dataIndex: 'orderCount',
      render: (text, record, index) => {
        if(record.orderCount==0)return 0;  
        if(index == this.state.data.length-1)return record.orderCount;
        return <a onClick={() => {
          this.onLookView('ClassTypePayNum',record)
        }}>{record.orderCount}</a>;
      }
    },
    {
      title: '缴费总金额',
      dataIndex: 'allAmount',
      render: (text, record, index) => {
        if(record.allAmount==0)return 0;
        if(index == this.state.data.length-1)return record.allAmount;
        return <a onClick={() => {
          this.onLookView('TotalPay',record)
        }}>{record.allAmount}</a>;
      }
    },
    {
      title: '财务已确认缴费',
      dataIndex: 'sureAmount',
      render: (text, record, index) => {
        if(record.sureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.sureAmount;
        return <a onClick={() => {
          this.onLookView('surePay',record)
        }}>{record.sureAmount}</a>;
      }
    },
    {
      title: '财务待确认缴费',
      dataIndex: 'notSureAmount',
      render: (text, record, index) => {
        if(record.notSureAmount==0)return 0;
        if(index == this.state.data.length-1)return record.notSureAmount;
        return <a onClick={() => {
          this.onLookView('toBePay',record)
        }}>{record.notSureAmount}</a>;
      }
    },
    {
      title: '中博待确认缴费',
      dataIndex: 'zbSureAmount',
      render: (text, record, index) => {
        if(record.zbSureAmount == 0 ) return 0;
        if(index == this.state.data.length-1)return record.zbSureAmount;
        return <a onClick={() => {
          this.onLookView('zbToBePay',record)
        }}>{record.zbSureAmount}</a>;
      }
    },
    {
      title: '非中博待确认缴费',
      dataIndex: 'mobile',
      render: (text, record, index) => {   
        let tp = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;
        if(record.notSureAmount && record.zbSureAmount){
          if(record.notSureAmount- record.zbSureAmount == 0) return 0;
          if(index == this.state.data.length-1)return record.notSureAmount?tp.test(record.notSureAmount- record.zbSureAmount)? (record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount:0;
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a>;
        }else if( record.notSureAmount - record.zbSureAmount == 0 ){
          return 0;
        }else{
          return <a onClick={() => {
            this.onLookView('notToBePay',record)
          }}>{ tp.test(record.notSureAmount- record.zbSureAmount)?(record.notSureAmount- record.zbSureAmount).toFixed(2):record.notSureAmount- record.zbSureAmount }</a> || 0 ;
        } 
      }
    },
    {
      title: '退费',
      dataIndex: 'refundsAmount',
      render: (text, record, index) => {
        if(record.refundsAmount==0)return 0;
        if(index == this.state.data.length-1)return record.refundsAmount;
        return <a onClick={() => {
          this.onLookView('ClassTypeRefund',record)
        }}>{record.refundsAmount}</a>;
      }
    },
    {
      title: '大客户订单缴费',
      dataIndex: 'partnerAmount',
      render: (text, record, index) => {
        if(record.partnerAmount==0)return 0;
        if(index == this.state.data.length-1)return record.partnerAmount;
        return <a onClick={() => {
          this.onLookView('bigOrder',record)
        }}>{record.partnerAmount}</a>;
      }
    },
    {
      title: '个人订单缴费',
      dataIndex: 'personAmount',
      fixed:'right',
      width: 120,
      render: (text, record, index) => {
        if(record.personAmount==0)return 0;
        if(index == this.state.data.length-1)return record.personAmount;
        return <a onClick={() => {
          this.onLookView('perOrder',record)
        }}>{record.personAmount}</a>;
      }
    },
  ];
  //检索数据
  fetch(params) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    setTimeout((e=>{ 
        condition.type = 3;
        let dataTime = condition.startDate;
        let confirmTime = condition.confirmDateStart;
        if(Array.isArray(dataTime)){
          condition.startDate = formatMoment(dataTime[0])
          condition.endDate = formatMoment(dataTime[1])
        } 
        if(Array.isArray(confirmTime)){
          condition.confirmDateStart = formatMoment(confirmTime[0])
          condition.confirmDateEnd = formatMoment(confirmTime[1])
        } 
        this.props.ListOfPrepaidStatistics(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
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
    
    }),100)
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
      this.setState({  editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case "Copy":
          this.props.partnerProductPriceApplyBatchCopy(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              message.success('复制完成!');
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          });
          break;
        case 'Create':
          this.props.partnerProductPriceApplyAdd(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          });
          break;
        case 'Edit':
          this.props.partnerProductPriceApplyUpdate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Delete':
          this.props.partnerProductPriceApplyDelete(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }
  showCoump=()=>{
    var block_columns = '';
    switch(this.state.press){
      //分部
      case 'columns':
         block_columns = this.columns;
      break;
      //大客户
      case 'customerColumns':
         block_columns = this.customerColumns;
      break;
      //高校
      case 'universitiesColumns':
         block_columns = this.universitiesColumns;
      break;
      //高校校区
      case 'campusColumns':
         block_columns = this.campusColumns;
      break;
      //项目
      case 'projectColumns':
         block_columns = this.projectColumns;
      break;
      //班型
      case 'typeColumns':
         block_columns = this.typeColumns;
      break;
      default:
         block_columns = ''
    }
    return block_columns;
  }
  componentDidMount(){ 
  }
  componentDidUpdate(){
    // this.buttonChange();
  }
  buttonChange=()=>{ 
    let buttons = document.getElementsByClassName('changeButton')  
    if(buttons.length){ 
    for(let i = 0;i<buttons.length;i++){ 
            buttons[i].classList.remove("ant-btn-primary")
      }
      switch(this.state.press){
        //分部
        case 'columns':
            buttons[0].classList.add("ant-btn-primary")
        break;
        //大客户
        case 'customerColumns':
            buttons[1].classList.add("ant-btn-primary")
        break;
        //高校
        case 'universitiesColumns':
            buttons[2].classList.add("ant-btn-primary")
        break;
        //高校校区
        case 'campusColumns':
            buttons[3].classList.add("ant-btn-primary")
        break;
        //项目
        case 'projectColumns':
              buttons[4].classList.add("ant-btn-primary")
        break;
        //班型
        case 'typeColumns':
              buttons[5].classList.add("ant-btn-primary")
        break;
        default:
          block_columns = ''
      }  
    }
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
      
      case 'ProjectTotalPay':
      case 'CampusTotalPay':
      case 'HighTotalPay':
      case 'BigTotalPay':
      case 'TotalPay':
      case 'TotalPaySure':


      case 'surePay':
      case 'toBePay':
      case 'shortPay':
      case 'bigOrder':
      case 'perOrder':
      case 'zbToBePay':
      case 'notToBePay':
        block_content = <DivisionalAmount
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'ClassTypePayNum':
      case 'ProjectPayNum':
      case 'CampusPayNum':
      case 'HighPayNum':
      case 'BiGPayNum':
      case 'PayNum': 
       block_content = <PaymentOrderNumber
          viewCallback={this.onViewCallback}
          {...this.state}
        />
    break; 
      case 'ClassTypeRefund':
      case 'ProjectRefund':
      case 'CampusRefund':
      case 'HighRefund':
      case 'BigRefund':
      case 'Refund':
        block_content = <RefundAmount
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
            disabled: !(record.auditStatus == 0 || record.auditStatus == 3), // 暂存或审核未通过的可以提交审核            
          }),
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = []; 
        extendButtons.push(<Button  className='changeButton' onClick={() => {
          this.onShowSizeChange('l',10)
          // this.onSearch();
          this.setState({press:'customerColumns'});
        }} icon="search">查询</Button>); 
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons,'l','r')}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'签约公司'} >
                        {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                          <Select>
                              <Option value='' key='3'>全部</Option>
                              {
                                this.state.zb_payee_type.map(item=>{
                                  return <Option value={item.value}>{item.title}</Option>
                                })
                              }
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="缴费/退费日期">
                            {getFieldDecorator('startDate', { initialValue:this.state.pagingSearch.startDate?(this.state.pagingSearch.endDate?[moment(this.state.pagingSearch.startDate, dateFormat),moment(this.state.pagingSearch.endDate, dateFormat)]:[moment(this.state.pagingSearch.startDate, dateFormat)]):''})(
                                <RangePicker
                                format={dateFormat}
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                                // disabledDate={this.disabledBeginDate}
                                style={{width:200}}/>
                            )}
                        </FormItem>
                    </Col>  
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="财务确认日期">
                            {getFieldDecorator('confirmDateStart', { initialValue:this.state.pagingSearch.confirmDateStart?(this.state.pagingSearch.confirmDateEnd?[moment(this.state.pagingSearch.confirmDateStart, dateFormat),moment(this.state.pagingSearch.confirmDateEnd, dateFormat)]:[moment(this.state.pagingSearch.confirmDateStart, dateFormat)]):''})(
                                <RangePicker
                                format={dateFormat}
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                                // disabledDate={this.disabledBeginDate}
                                style={{width:200}}/>
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
              <Table columns={ 
                this.customerColumns
              } //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                rowKey={record => record.productPriceApplyId}//主键
                bordered
                scroll={{ x: 1000 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                <Col span={24} style={{paddingBottom:'20px'}}>
                      <FileDownloader
                        apiUrl={'/edu/orderPreCharge/exportPreChargeList'}//api下载地址
                        method={'get'}//提交方式
                        options={this.state.pagingSearch}//提交参数
                        title={'导出汇总表'}
                      >
                      </FileDownloader> 
                      <div className='split_button' style={{ width: 10 }}></div>  
                  </Col>
                  </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      
                      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(ProductPriceApplyManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    ListOfPrepaidStatistics: bindActionCreators(ListOfPrepaidStatistics, dispatch),
    partnerProductPriceApplyAdd: bindActionCreators(partnerProductPriceApplyAdd, dispatch),
    partnerProductPriceApplyUpdate: bindActionCreators(partnerProductPriceApplyUpdate, dispatch),
    partnerProductPriceApplyDelete: bindActionCreators(partnerProductPriceApplyDelete, dispatch),
    partnerProductPriceApplyBatchCopy: bindActionCreators(partnerProductPriceApplyBatchCopy, dispatch), 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
