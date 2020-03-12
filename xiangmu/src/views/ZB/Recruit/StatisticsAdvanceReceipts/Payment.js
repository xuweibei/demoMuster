 
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle,formatMoment } from '@/utils'; 
import { loadBizDictionary,onToggleSearchOption, onSearch, onPageIndexChange, onShowSizeChange , renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout} from '@/utils/componentExt';
 
import ContentBox from '@/components/ContentBox'; 
import { loadDictionary } from '@/actions/dic'; 
import { ListOfPrepaidPaymentOrder } from '@/actions/base'; 
import FileDownloader from '@/components/FileDownloader';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents'; 

class OrderQuery extends React.Component {
 
  constructor(props){
    super(props);
    this.state= {
        editMode: '',
        pagingSearch: {
          currentPage: 1,
          pageSize: 10,
          groupId:'',
          type:'',
          zbPayeeType:'',
          startDate:props.pagingSearch.startDate,
          endDate:props.pagingSearch.endDate,
          orderType:'',
          payeeType:'',
          studentName:'',
          orderSn:''
        },
        data_list: [],
        loading: false,
        totalRecord: 0,
        currentDataModel: {},
        isShowQrCodeModal: false,
        deleteId:'',
        ButtonProps:false,
        recruitList:[],
        recruitBatchName:''
      };
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo','zb_payee_type','order_type','payee_type']);
    this.onSearch()
    console.log(this.props)
  }
//按分部
  columns = [
    {
        title: '项目',
        width:120,
        fixed:'left',
        dataIndex: 'items'
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
        dataIndex: 'studentName'
    },
    {
        title: '班型',
        dataIndex: 'classTypes'
    },
    {
        title: '订单类型',
        dataIndex: 'orderType',
        render:(text,record)=>{
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
        render: (text,record)=>{
            return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
        }
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount',
    },
    { 
        title: '累计缴费金额(¥)',
        dataIndex: 'paidAmount', 
    },
    {
        title: '缴费金额(¥)',
        fixed:'right',
        width:120,
        dataIndex: 'money'
    }
  ];
  //按大客户
  columnsBiGPayNum = [
    {
      title:'分部',
      width:120,
      fixed:'left',
      dataIndex:'barchName'
    },
    {
        title: '项目',
        dataIndex: 'items'
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
        dataIndex: 'studentName'
    },
    {
        title: '班型',
        dataIndex: 'classTypes'
    },
    {
        title: '订单类型',
        dataIndex: 'orderType', 
        render:(text,record)=>{
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
        render: (text,record)=>{
            return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
        }
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount', 
    },
    {
        //title: '挂单金额(¥)',
        //dataIndex: 'restingAmount',
        title: '累计缴费金额(¥)',
        dataIndex: 'paidAmount', 
    },
    {
        title: '缴费金额(¥)',
        fixed:'right',
        width:120,
        dataIndex: 'money'
    }
  ];

//按高校
  columnsHighPayNum = [
    {
      title:'分部',
      width:120,
      fixed:'left',
      dataIndex:'barchName'
    },
    {
        title: '项目',
        dataIndex: 'items'
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
        dataIndex: 'studentName'
    },
    {
        title: '班型',
        dataIndex: 'classTypes'
    },
    {
        title: '订单类型',
        dataIndex: 'orderType',
        render:(text,record)=>{
            return getDictionaryTitle(this.state.order_type,record.orderType)
        }
    },
    {
        title: '大客户名称',
        dataIndex: 'partnerName',
        //render: text => <span>{formatMoney(text, 2)}</span>
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
        render: (text,record)=>{
            return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
        }
    },
    {
        title: '订单金额(¥)',
        dataIndex: 'totalAmount', 
    },
    {
        //title: '挂单金额(¥)',
        //dataIndex: 'restingAmount',
        title: '累计缴费金额(¥)',
        dataIndex: 'paidAmount', 
    },
    {
        title: '缴费金额(¥)',
        fixed:'right',
        width:120,
        dataIndex: 'money'
    }
  ];
//按高校校区
columnsCampusPayNum = [
  {
    title:'分部',
    width:120,
    fixed:'left',
    dataIndex:'barchName'
  },
  {
      title: '项目',
      dataIndex: 'items'
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
      dataIndex: 'studentName'
  },
  {
      title: '班型',
      dataIndex: 'classTypes'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
          return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '大客户名称',
      dataIndex: 'partnerName',
      //render: text => <span>{formatMoney(text, 2)}</span>
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
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '累计缴费金额(¥)',
      dataIndex: 'paidAmount', 
  },
  {
      title: '缴费金额(¥)',
      fixed:'right',
      width:120,
      dataIndex: 'money'
  }
];


//按项目
columnsProjectPayNum = [
  {
    title:'分部',
    width:120,
    fixed:'left',
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
      dataIndex: 'studentName'
  },
  {
      title: '班型',
      dataIndex: 'classTypes'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '大客户名称',
      dataIndex: 'partnerName',
      //render: text => <span>{formatMoney(text, 2)}</span>
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
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '累计缴费金额(¥)',
      dataIndex: 'paidAmount', 
  },
  {
      title: '缴费金额(¥)',
      fixed:'right',
      width:120,
      dataIndex: 'money'
  }
];

//按班型
columnsClassTypePayNum = [
  {
    title:'分部',
    width:120,
    fixed:'left',
    dataIndex:'barchName'
  },
  {
      title: '项目',
      dataIndex: 'items'
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
      dataIndex: 'studentName'
  },
  {
      title: '班型',
      dataIndex: 'classTypes'
  },
  {
      title: '订单类型',
      dataIndex: 'orderType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.order_type,record.orderType)
      }
  },
  {
      title: '大客户名称',
      dataIndex: 'partnerName',
      //render: text => <span>{formatMoney(text, 2)}</span>
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
      render: (text,record)=>{
          return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
      }
  },
  {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount', 
  },
  {
      //title: '挂单金额(¥)',
      //dataIndex: 'restingAmount',
      title: '累计缴费金额(¥)',
      dataIndex: 'paidAmount', 
  },
  {
      title: '缴费金额(¥)',
      fixed:'right',
      width:120,
      dataIndex: 'money'
  }
];
  //检索数据
  fetch(params){
      var condition = params || this.state.pagingSearch;
      condition.type = 3;
      condition.groupId = this.props.currentDataModel.groupId;
      let time = this.state.pagingSearch.startDate;
      let endTime = this.state.pagingSearch.endDate;
      if(time){
        condition.startDate = time;
      }
      if(endTime){
        condition.endDate = endTime;
      }
      this.setState({ loading: true, pagingSearch: condition });
      this.props.ListOfPrepaidPaymentOrder(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data;
            //list.push(data.data);
            this.setState({
              data_list: list,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }

  onHideModal= () => {
    this.setState({
      isShowQrCodeModal: false,
    })
  }
  onCancel = () => {
    this.props.viewCallback();
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
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({  editMode: 'Manage' })
    } else {

    }
  }
  render(){ 
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
      case 'PayNum':
            let extendButtons = [];
            extendButtons.push(<FileDownloader
              apiUrl={'/edu/orderPreCharge/exportPreChargeListByOrder'}//api下载地址
              method={'post'}//提交方式
              options={this.state.pagingSearch}//提交参数
              title={'导出'}
            >
            </FileDownloader>);
            extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
            block_content = (
              <div>
                <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form
                                    className="search-form"
                                >
                                    <Row justify="center" gutter={24} align="middle" type="flex">
                                    
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'分部'} >
                                                {getFieldDecorator('recruitBatchId', { initialValue: this.state.recruitList[0]?this.state.recruitList[0].recruitBatchId:'' })(
                                                  <div>{this.props.currentDataModel.groupName}</div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'缴费时间'} >
                                                {getFieldDecorator('startDate', { initialValue: ''})(
                                                    <div>
                                                        {
                                                            this.props.pagingSearch.startDate?
                                                            this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                                        }
                                                    </div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'财务确认时间'} >
                                                {getFieldDecorator('confirmDateStart', { initialValue: ''})(
                                                    <div>
                                                        {
                                                            this.props.pagingSearch.confirmDateStart?
                                                            this.props.pagingSearch.confirmDateStart+(this.props.pagingSearch.confirmDateEnd?'至'+this.props.pagingSearch.confirmDateEnd:'至今'):'全部'
                                                        }
                                                    </div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'签约公司'} >
                                                {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                                                    <Select>
                                                        <Option value=''>全部</Option>
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
                                            <FormItem {...searchFormItemLayout} label={'订单类型'} >
                                                {getFieldDecorator('orderType', { initialValue: this.state.pagingSearch.orderType })(
                                                   <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.order_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'收费方'} >
                                                {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.payee_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'订单号'} >
                                                {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                                    <Input placeholder="请输入订单号" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                                {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                    <Input placeholder="请输入学生姓名" />
                                                )}
                                            </FormItem>
                                        </Col> 
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                <div className="space-default">
                </div>
                <div className="search-result-list">
                  <Table columns={this.columns} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.data_list}//数据
                    bordered
                    scroll={{x:1800}}
                  />
                  <div className="space-default"></div>
                  <div className="search-paging">
                    <Row justify="space-between" align="middle" type="flex">
                      <Col span={6}>
                      </Col>
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
                {
                  this.state.isShowQrCodeModal &&
                  <Modal
                    visible={this.state.isShowQrCodeModal}
                    onCancel={this.onHideModal}
                    width={370}
                    height={400}
                    onOk={this.sureDeleteData}
                    okButtonProps={{disabled:this.state.ButtonProps}}
                  >
                  <p style={{fontSize:18}}>确定删除本条数据吗?</p>
                    
                  </Modal>
                }
              </div>
            )
         break;
      case 'BiGPayNum':
            extendButtons = [];
            extendButtons.push(<FileDownloader
              apiUrl={'/edu/orderPreCharge/exportPreChargeListByOrder'}//api下载地址
              method={'post'}//提交方式
              options={this.state.pagingSearch}//提交参数
              title={'导出'}
            >
            </FileDownloader>);
            extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
           block_content = (
              <div>
                <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form
                                    className="search-form"
                                >
                                    <Row justify="center" gutter={24} align="middle" type="flex">
                                    
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'大客户'} >
                                                {getFieldDecorator('recruitBatchId', { initialValue: this.state.recruitList[0]?this.state.recruitList[0].recruitBatchId:'' })(
                                                   <div>{this.props.currentDataModel.groupName}</div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'缴费时间'} >
                                                {getFieldDecorator('startDate', { initialValue: '' })(
                                                     <div>
                                                        {
                                                            this.props.pagingSearch.startDate?
                                                            this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                                        }
                                                    </div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'财务确认时间'} >
                                                {getFieldDecorator('confirmDateStart', { initialValue: ''})(
                                                    <div>
                                                        {
                                                            this.props.pagingSearch.confirmDateStart?
                                                            this.props.pagingSearch.confirmDateStart+(this.props.pagingSearch.confirmDateEnd?'至'+this.props.pagingSearch.confirmDateEnd:'至今'):'全部'
                                                        }
                                                    </div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'签约公司'} >
                                                {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                                                     <Select>
                                                        <Option value=''>全部</Option>
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
                                            <FormItem {...searchFormItemLayout} label={'收费方'} >
                                                {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                                                     <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.payee_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'订单号'} >
                                                {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                                    <Input placeholder="请输入订单号" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                                {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                    <Input placeholder="请输入学生姓名" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}></Col>
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                <div className="space-default">
                </div>
                <div className="search-result-list">
                  <Table columns={this.columnsBiGPayNum} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.data_list}//数据
                    bordered
                    scroll={{x:1800}}
                  />
                  <div className="space-default"></div>
                  <div className="search-paging">
                    <Row justify="space-between" align="middle" type="flex">
                      <Col span={6}>
                      </Col>
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
                {
                  this.state.isShowQrCodeModal &&
                  <Modal
                    visible={this.state.isShowQrCodeModal}
                    onCancel={this.onHideModal}
                    width={370}
                    height={400}
                    onOk={this.sureDeleteData}
                    okButtonProps={{disabled:this.state.ButtonProps}}
                  >
                  <p style={{fontSize:18}}>确定删除本条数据吗?</p>
                    
                  </Modal>
                }
              </div>
            )
      break;
      case 'CampusPayNum':
      case 'HighPayNum':
              extendButtons = [];
              extendButtons.push(<FileDownloader
                apiUrl={'/edu/orderPreCharge/exportPreChargeListByOrder'}//api下载地址
                method={'post'}//提交方式
                options={this.state.pagingSearch}//提交参数
                title={'导出'}
              >
              </FileDownloader>);
              extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
              block_content = (
                  <div>
                    <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                                {!this.state.seachOptionsCollapsed &&
                                    <Form
                                        className="search-form"
                                    >
                                        <Row justify="center" gutter={24} align="middle" type="flex">

                                            {
                                              this.props.editMode == 'HighPayNum'?
                                                  <Col span={12}>
                                                      <FormItem {...searchFormItemLayout} label={'高校'} >
                                                          {getFieldDecorator('recruitBatchId', { initialValue: this.state.recruitList[0]?this.state.recruitList[0].recruitBatchId:'' })(
                                                           <div>{this.props.currentDataModel.groupName}</div>
                                                          )}
                                                      </FormItem>
                                                  </Col>:
                                                <Col span={12}>
                                                    <FormItem {...searchFormItemLayout} label={'高校校区'} >
                                                        {getFieldDecorator('recruitBatchId', { initialValue: this.state.recruitList[0]?this.state.recruitList[0].recruitBatchId:'' })(
                                                          <div>{this.props.currentDataModel.groupName}</div>
                                                        )}
                                                    </FormItem>
                                                </Col>
                                            }
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'缴费时间'} >
                                                    {getFieldDecorator('startDate', { initialValue: '' })(
                                                         <div>
                                                            {
                                                                this.props.pagingSearch.startDate?
                                                                this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                                            }
                                                        </div>
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'财务确认时间'} >
                                                    {getFieldDecorator('confirmDateStart', { initialValue: ''})(
                                                        <div>
                                                            {
                                                                this.props.pagingSearch.confirmDateStart?
                                                                this.props.pagingSearch.confirmDateStart+(this.props.pagingSearch.confirmDateEnd?'至'+this.props.pagingSearch.confirmDateEnd:'至今'):'全部'
                                                            }
                                                        </div>
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'签约公司'} >
                                                    {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                                                         <Select>
                                                            <Option value=''>全部</Option>
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
                                                <FormItem {...searchFormItemLayout} label={'订单类型'} >
                                                    {getFieldDecorator('orderType', { initialValue: this.state.pagingSearch.orderType })(
                                                       <Select >
                                                            <Option value="">全部</Option>
                                                            {this.state.order_type.map((item, index) => {
                                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                                            })}
                                                        </Select>
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'收费方'} >
                                                    {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                                                        <Select >
                                                            <Option value="">全部</Option>
                                                            {this.state.payee_type.map((item, index) => {
                                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                                            })}
                                                        </Select>
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'订单号'} >
                                                    {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                                        <Input placeholder="请输入订单号" />
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                                    {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                        <Input placeholder="请输入学生姓名" />
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={12}></Col>
                                        </Row>
                                    </Form>
                                }
                            </ContentBox>
                    <div className="space-default">
                    </div>
                    <div className="search-result-list">
                      <Table columns={
                        this.props.editMode == 'HighPayNum'?this.columnsHighPayNum:this.columnsCampusPayNum
                      } //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data_list}//数据
                        bordered
                        scroll={{x:1800}}
                      />
                      <div className="space-default"></div>
                      <div className="search-paging">
                        <Row justify="space-between" align="middle" type="flex">
                          <Col span={6}>
                          </Col>
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
                    {
                      this.state.isShowQrCodeModal &&
                      <Modal
                        visible={this.state.isShowQrCodeModal}
                        onCancel={this.onHideModal}
                        width={370}
                        height={400}
                        onOk={this.sureDeleteData}
                        okButtonProps={{disabled:this.state.ButtonProps}}
                      >
                      <p style={{fontSize:18}}>确定删除本条数据吗?</p>
                        
                      </Modal>
                    }
                  </div>
                )
          break;
      case 'ClassTypePayNum':
      case 'ProjectPayNum':
          extendButtons = [];
          extendButtons.push(<FileDownloader
            apiUrl={'/edu/orderPreCharge/exportPreChargeListByOrder'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出'}
          >
          </FileDownloader>);
          extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>);
          block_content = (
              <div>
                <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form
                                    className="search-form"
                                >
                                    <Row justify="center" gutter={24} align="middle" type="flex">

                                        {
                                          this.props.editMode == 'ProjectPayNum'?
                                              <Col span={12}>
                                                  <FormItem {...searchFormItemLayout} label={'项目'} >
                                                      {getFieldDecorator('recruitBatchId', { initialValue: this.state.recruitList[0]?this.state.recruitList[0].recruitBatchId:'' })(
                                                        <div>{this.props.currentDataModel.groupName}</div>
                                                      )}
                                                  </FormItem>
                                              </Col>:
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'班型'} >
                                                    {getFieldDecorator('recruitBatchId', { initialValue: this.state.recruitList[0]?this.state.recruitList[0].recruitBatchId:'' })(
                                                      <div>{this.props.currentDataModel.groupName}</div>
                                                    )}
                                                </FormItem>
                                            </Col>
                                        }
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'缴费时间'} >
                                                {getFieldDecorator('startDate', { initialValue: '' })(
                                                     <div>
                                                        {
                                                            this.props.pagingSearch.startDate?
                                                            this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?'至'+this.props.pagingSearch.endDate:'至今'):'全部'
                                                        }
                                                    </div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'财务确认时间'} >
                                                {getFieldDecorator('confirmDateStart', { initialValue: ''})(
                                                    <div>
                                                        {
                                                            this.props.pagingSearch.confirmDateStart?
                                                            this.props.pagingSearch.confirmDateStart+(this.props.pagingSearch.confirmDateEnd?'至'+this.props.pagingSearch.confirmDateEnd:'至今'):'全部'
                                                        }
                                                    </div>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'签约公司'} >
                                                {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                                                     <Select>
                                                        <Option value=''>全部</Option>
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
                                            <FormItem {...searchFormItemLayout} label={'订单类型'} >
                                                {getFieldDecorator('orderType', { initialValue: this.state.pagingSearch.orderType })(
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.order_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'收费方'} >
                                                {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.payee_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'订单号'} >
                                                {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                                    <Input placeholder="请输入订单号" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                                {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                    <Input placeholder="请输入学生姓名" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}></Col>
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                <div className="space-default">
                </div>
                <div className="search-result-list">
                  <Table columns={
                    this.props.editMode == 'ProjectPayNum'?this.columnsProjectPayNum:this.columnsClassTypePayNum
                  } //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.data_list}//数据
                    bordered
                    scroll={{x:1800}}
                  />
                  <div className="space-default"></div>
                  <div className="search-paging">
                    <Row justify="space-between" align="middle" type="flex">
                      <Col span={6}>
                      </Col>
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
                {
                  this.state.isShowQrCodeModal &&
                  <Modal
                    visible={this.state.isShowQrCodeModal}
                    onCancel={this.onHideModal}
                    width={370}
                    height={400}
                    onOk={this.sureDeleteData}
                    okButtonProps={{disabled:this.state.ButtonProps}}
                  >
                  <p style={{fontSize:18}}>确定删除本条数据吗?</p>
                    
                  </Modal>
                }
              </div>
            )
        break;
      case 'Manage':
      default:
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
                                            {getFieldDecorator('recruitBatchId', { initialValue: this.state.recruitList[0]?this.state.recruitList[0].recruitBatchId:'' })(
                                                 <Select>
                                                 {
                                                   this.state.recruitList.map((i, index) => {
                                                     return <Option value={i.recruitBatchId} >{i.recruitBatchName}</Option>
                                                   })
                                                 }
                                               </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'缴费时间'} >
                                            {getFieldDecorator('startDate', { initialValue: '' })(
                                                 <div>
                                                    {
                                                        this.props.pagingSearch.startDate?
                                                        this.props.pagingSearch.startDate+(this.props.pagingSearch.endDate?this.props.pagingSearch.endDate:'至今'):'全部'
                                                    }
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'财务确认时间'} >
                                            {getFieldDecorator('confirmDateStart', { initialValue: ''})(
                                                <div>
                                                    {
                                                        this.props.pagingSearch.confirmDateStart?
                                                        this.props.pagingSearch.confirmDateStart+(this.props.pagingSearch.confirmDateEnd?'至'+this.props.pagingSearch.confirmDateEnd:'至今'):'全部'
                                                    }
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'签约公司'} >
                                            {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                                                 <Select>
                                                    <Option value=''>全部</Option>
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
                                        <FormItem {...searchFormItemLayout} label={'订单类型'} >
                                            {getFieldDecorator('orderType', { initialValue: this.state.pagingSearch.orderType })(
                                                <Select >
                                                    <Option value="">全部</Option>
                                                    {this.state.order_type.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'收费方'} >
                                            {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })(
                                                 <Select >
                                                    <Option value="">全部</Option>
                                                    {this.state.payee_type.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'订单号'} >
                                            {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                                <Input placeholder="请输入订单号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                <Input placeholder="请输入学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}></Col>
                                </Row>
                            </Form>
                        }
                    </ContentBox>
            <div className="space-default">
            </div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{x:1800}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                  </Col>
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
            {
              this.state.isShowQrCodeModal &&
              <Modal
                visible={this.state.isShowQrCodeModal}
                onCancel={this.onHideModal}
                width={370}
                height={400}
                onOk={this.sureDeleteData}
                okButtonProps={{disabled:this.state.ButtonProps}}
              >
              <p style={{fontSize:18}}>确定删除本条数据吗?</p>
                
              </Modal>
            }
          </div>
        )
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OrderQuery);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        ListOfPrepaidPaymentOrder: bindActionCreators(ListOfPrepaidPaymentOrder, dispatch), 
        loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
