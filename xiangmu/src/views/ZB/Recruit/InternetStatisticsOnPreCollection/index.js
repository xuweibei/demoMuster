 
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
import { StatisticsInternetAdvances } from '@/actions/base';
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
      press:'columns',
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        confirmDateStart:'',
        confirmDateEnd:'',
        startDate:startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
        currentPage: 1,
        pageSize: 10,
        zbPayeeType:'',
        endDate:'',
        feeProperty:''
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
    // this.onSearch();
  }
  componentWillUnMount() {
  }
 
  //按分部
  columns = [ 
    {
      title: '缴费订单数',
      fixed: 'left',
      width: 120,
      dataIndex: 'orderCount', 
    },
    {
      title: '缴费总金额',
      dataIndex: 'allAmount', 
    },
    {
      title: '财务已确认缴费金额',
      dataIndex: 'sureAmount', 
    },
    {
      title: '财务待确认缴费金额',
      dataIndex: 'notSureAmount', 
    },
    {
      title: '中博待确认缴费金额',
      dataIndex: 'zbSureAmount', 
    },
    {
      title: '非中博待确认缴费金额',
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
      title: '临时缴费金额',
      dataIndex: 'interimAmount', 
    },
    {
      title: '退费金额',
      dataIndex: 'refundsAmount', 
    },
    {
      title: '大客户订单缴费金额',
      dataIndex: 'partnerAmount', 
    },
    {
      title: '个人订单缴费金额',
      fixed: 'right',
      dataIndex:'personAmount',
      width: 120, 
    }
  ]; 
  //检索数据
  fetch(params) {
    var condition = params || this.state.pagingSearch;  
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
        this.setState({ loading: true });
        this.props.StatisticsInternetAdvances(condition).payload.promise.then((response) => {
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
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };  
  componentDidMount(){ 
  } 
  render() { 
    let block_content = <div></div>
    switch (this.state.editMode) { 
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
        extendButtons.push(<Button className='ant-btn-primary changeButton'  onClick={() => { 
          this.onSearch(); 
        }} icon="search">统计</Button>); 
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
                                // disabledDate={this.disabledBeginDate}
                                style={{width:200}}/>
                            )}
                        </FormItem>
                    </Col>  
                    <Col span={12}>
                        <FormItem 
                            {...searchFormItemLayout}
                            label="费用属性"
                            >
                            {getFieldDecorator('feeProperty', { initialValue:this.state.pagingSearch.feeProperty })(
                              <Select>
                                  <Option value=''>全部</Option>
                                  <Option value='1'>真实</Option>
                                  <Option value='2'>虚拟</Option>
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
              <Table 
                columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据 
                bordered
                scroll={{ x: 1800 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                <Col span={24} style={{paddingBottom:'20px'}}>
                      <FileDownloader
                        apiUrl={'/edu/orderPreCharge/exportInternetList'}//api下载地址
                        method={'get'}//提交方式
                        options={this.state.pagingSearch}//提交参数
                        title={'导出明细'}
                      >
                      </FileDownloader>  
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
    StatisticsInternetAdvances: bindActionCreators(StatisticsInternetAdvances, dispatch),   
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
