 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd'; 
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment, openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';

import { ListOfPrepaidRefundOrder} from '@/actions/base';
import ContentBox from '@/components/ContentBox'; 

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

class RefundAmount extends React.Component {
  
  state = {
    editMode: '',
    pagingSearch: {
      groupId: '',
      type: '',
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
    this.loadBizDictionary(['pos_account_type','order_type','payee_type','zb_payee_type']);
    this.onSearch()
    console.log(this.props)

  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");

  }
  setTimeStr(str) {
    let timeStr = str.split('-');
    return `${timeStr[0]}年${timeStr[1]}月`
  }

  columnsRefund = [
    {
      title: '项目',
      dataIndex: 'items',
      fixed: 'left',
      width: 150
    },
    {
      title: '订单号',
      dataIndex: 'orderSn',
      render:(text,record)=>{
        return   <div>
              <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
          </div>
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
    },
    {
      title: '大客户名称',
      dataIndex: 'partnerName',
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '退费金额(¥)',
      dataIndex: 'money',
    },
    {
      title: '退费审核日期',
      fixed: 'right',
      width: 160,
      dataIndex:'refundsDate',
      render:(text,record)=>{
        return timestampToTime(record.refundsDate)
      }
    }
  ];


  //按大客户
  columnsBigRefund = [
    {
      title:'分部',
      fixed: 'left',
      width: 150,
      dataIndex:'barchName'
    },
    {
      title: '项目',
      dataIndex: 'items', 
    },
    {
      title: '订单号',
      dataIndex: 'orderSn', 
      render:(text,record)=>{
        return   <div>
              <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
          </div>
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '退费金额(¥)',
      dataIndex: 'money',
    },
    {
      title: '退费审核日期',
      fixed: 'right',
      width: 160,
      dataIndex:'refundsDate',
      render:(text,record)=>{
        return timestampToTime(record.refundsDate)
      }
    }
  ];

  //按高校
  columnsHighRefund = [
    {
      title:'分部',
      fixed: 'left',
      width: 150,
      dataIndex:'barchName'
    },
    {
      title: '项目',
      dataIndex: 'items', 
    },
    {
      title: '订单号',
      dataIndex: 'orderSn', 
      render:(text,record)=>{
        return   <div>
              <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
          </div>
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
    },
    {
      title: '大客户名称',
      dataIndex: 'partnerName',
    },
    {
      title: '校区',
      dataIndex: 'campusName',
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '退费金额(¥)',
      dataIndex: 'money',
    },
    {
      title: '退费审核日期',
      fixed: 'right',
      width: 160,
      dataIndex:'refundsDate',
      render:(text,record)=>{
        return timestampToTime(record.refundsDate)
      }
    }
  ];
  
  //按高校校区
  columnsCampusRefund = [
    {
      title:'分部',
      fixed: 'left',
      width: 150,
      dataIndex:'barchName'
    },
    {
      title: '项目',
      dataIndex: 'items', 
    },
    {
      title: '订单号',
      dataIndex: 'orderSn', 
      render:(text,record)=>{
        return   <div>
              <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
          </div>
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
    },
    {
      title: '大客户名称',
      dataIndex: 'partnerName',
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      },
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '退费金额(¥)',
      dataIndex: 'money',
    },
    {
      title: '退费审核日期',
      fixed: 'right',
      width: 160,
      dataIndex:'refundsDate',
      render:(text,record)=>{
        return timestampToTime(record.refundsDate)
      }
    }
  ];
  
  //按项目
  columnsProjectRefund = [
    {
      title:'分部',
      fixed: 'left',
      width: 150,
      dataIndex:'barchName'
    },
    {
      title: '订单号',
      dataIndex: 'orderSn', 
      render:(text,record)=>{
        return   <div>
              <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
          </div>
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
    },
    {
      title: '大客户名称',
      dataIndex: 'partnerName',
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '退费金额(¥)',
      dataIndex: 'money',
    },
    {
      title: '退费审核日期',
      fixed: 'right',
      width: 160,
      dataIndex:'refundsDate',
      render:(text,record)=>{
        return timestampToTime(record.refundsDate)
      }
    }
  ];
  
  //按班型
  columnsClassTypeRefund = [
    {
      title:'分部',
      fixed: 'left',
      width: 150,
      dataIndex:'barchName'
    },
    {
      title: '项目',
      dataIndex: 'items', 
    },
    {
      title: '订单号',
      dataIndex: 'orderSn',
      render:(text,record)=>{
        return   <div>
              <a onClick={() => { this.onLookView('ViewOrder', record); }}>{record.orderSn}</a>
          </div>
      } 
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
    },
    {
      title: '大客户名称',
      dataIndex: 'partnerName',
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.payee_type,record.payeeType)
      }
    },
    {
      title: '签约公司',
      dataIndex: 'zbPayeeType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
    },
    {
      title: '退费金额(¥)',
      dataIndex: 'money',
    },
    {
      title: '退费审核日期',
      fixed: 'right',
      width: 160,
      dataIndex:'refundsDate',
      render:(text,record)=>{
        return timestampToTime(record.refundsDate)
      }
    }
  ];
  onCancel = () => {
    this.props.viewCallback();
  }
  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.type = 3;
    condition.groupId = this.props.currentDataModel.groupId;
    condition.startDate = this.props.pagingSearch.startDate;
    condition.endDate = this.props.pagingSearch.endDate;
    condition.zbPayeeType = this.props.pagingSearch.zbPayeeType;
    this.props.ListOfPrepaidRefundOrder(condition).payload.promise.then((response) => {
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
  
  typeNum = (value)=>{
    switch(value){
        case 'columns':
            return 1;
        case 'customerColumns':
            return 3;
        case 'universitiesColumns':
            return 4;
        case 'campusColumns':
            return 5;
        case 'projectColumns':
            return 6;
        case 'typeColumns':
            return 7
    }
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
      this.setState({ editMode: 'Manage' })
 
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    if(this.state.editMode == 'ViewOrder'){
        return  block_content = <OrderDetailView viewCallback={this.onViewCallback}
        studentId={this.state.currentDataModel.studentId}
        orderId={this.state.currentDataModel.orderId}
        //isDirection={this.state.currentDataModel.orderType == 1 && this.state.currentDataModel.partnerClassType == 1}
        tab={3}
      />
    }
    switch (this.props.editMode) {
      case "Refund":
      
      let extendButtons = []; 
      extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
                block_content = (
                    <div>
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'r','l')}>
                        {!this.state.seachOptionsCollapsed &&
                        <Form
                            className="search-form"
                        >
                            <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'分部'} >
                                {getFieldDecorator('year', { initialValue: this.state.pagingSearch.year })(
                                   <div>{this.props.currentDataModel.groupName}</div>
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'退费时间'} >
                                {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                                    <div>
                                        {
                                            this.props.pagingSearch.startDate?
                                            this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                        }
                                    </div>
                                )}
                                </FormItem>
                            </Col>
                            </Row>
                        </Form>
                        }

                    </ContentBox>

                    <div className="space-default"></div>
                    <div className="search-result-list">
                        <Table columns={this.columnsRefund} //列定义
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
                        <Row justify="end" align="right" type="flex">
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
      case 'BigRefund':
            extendButtons = []; 
            extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
                block_content = (
                    <div>
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'r','l')}>
                        {!this.state.seachOptionsCollapsed &&
                        <Form
                            className="search-form"
                        >
                            <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'大客户'} >
                                {getFieldDecorator('year', { initialValue: this.state.pagingSearch.year })(
                                     <div>{this.props.currentDataModel.groupName}</div>
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'退费时间'} >
                                {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                                    <div>
                                        {
                                            this.props.pagingSearch.startDate?
                                            this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                        }
                                    </div>
                                )}
                                </FormItem>
                            </Col>
                            </Row>
                        </Form>
                        }

                    </ContentBox>

                    <div className="space-default"></div>
                    <div className="search-result-list">
                        <Table columns={this.columnsBigRefund} //列定义
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
                        <Row justify="end" align="right" type="flex">
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
      case 'CampusRefund':
      case 'HighRefund':
            extendButtons = []; 
            extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
                block_content = (
                    <div>
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'r','l')}>
                        {!this.state.seachOptionsCollapsed &&
                        <Form
                            className="search-form"
                        >
                            <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                            {
                              this.props.editMode =='HighRefund'?
                              <FormItem {...searchFormItemLayout} label={'高校'} >
                              {getFieldDecorator('year', { initialValue: this.state.pagingSearch.year })(
                                  <div>{this.props.currentDataModel.groupName}</div>
                              )}
                              </FormItem>:<FormItem {...searchFormItemLayout} label={'高校校区'} >
                                {getFieldDecorator('year', { initialValue: this.state.pagingSearch.year })(
                                    <div>{this.props.currentDataModel.groupName}</div>
                                )}
                                </FormItem>
                            }
                                
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'退费时间'} >
                                {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                                    <div>
                                        {
                                            this.props.pagingSearch.startDate?
                                            this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                        }
                                    </div>
                                )}
                                </FormItem>
                            </Col>
                            </Row>
                        </Form>
                        }

                    </ContentBox>

                    <div className="space-default"></div>
                    <div className="search-result-list">
                        <Table columns={
                          this.props.editMode =='HighRefund'?
                          this.columnsHighRefund:this.columnsCampusRefund
                        } //列定义
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
                        <Row justify="end" align="right" type="flex">
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
      
      case 'ClassTypeRefund':
      case 'ProjectRefund':
            extendButtons = []; 
            extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
                block_content = (
                    <div>
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'r','l')}>
                        {!this.state.seachOptionsCollapsed &&
                        <Form
                            className="search-form"
                        >
                            <Row justify="center" gutter={24} align="middle" type="flex">
                            <Col span={12}>
                            {
                              this.props.editMode =='ProjectRefund'?
                              <FormItem {...searchFormItemLayout} label={'项目'} >
                              {getFieldDecorator('year', { initialValue: this.state.pagingSearch.year })(
                                   <div>{this.props.currentDataModel.groupName}</div>
                              )}
                              </FormItem>:<FormItem {...searchFormItemLayout} label={'班型'} >
                                {getFieldDecorator('year', { initialValue: this.state.pagingSearch.year })(
                                    <div>{this.props.currentDataModel.groupName}</div>
                                )}
                                </FormItem>
                            }
                                
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'退费时间'} >
                                {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                                     <div>
                                        {
                                            this.props.pagingSearch.startDate?
                                            this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                        }
                                    </div>
                                )}
                                </FormItem>
                            </Col>
                            </Row>
                        </Form>
                        }

                    </ContentBox>

                    <div className="space-default"></div>
                    <div className="search-result-list">
                        <Table columns={
                          this.props.editMode =='ProjectRefund'?
                          this.columnsProjectRefund:this.columnsClassTypeRefund
                        } //列定义
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
                        <Row justify="end" align="right" type="flex">
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

        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
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
                      <FormItem {...searchFormItemLayout} label={'退费时间'} >
                        {getFieldDecorator('zbPayeeType', { initialValue: '' })(
                          <div>
                              {
                                  this.props.pagingSearch.startDate?
                                  this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                              }
                          </div>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }

            </ContentBox>

            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columnsRefund} //列定义
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
const WrappedManage = Form.create()(RefundAmount);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    ListOfPrepaidRefundOrder: bindActionCreators(ListOfPrepaidRefundOrder, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
