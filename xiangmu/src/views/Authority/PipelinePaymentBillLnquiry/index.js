/*
未匹配订单快捷支付查询 列表
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, DatePicker
} from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;
import ContentBox from '@/components/ContentBox'; 
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'; 
import ProductView from '@/views/ZB/Product/ProductView/view'
import {
  LargeAreaDepartmentalDropDown
} from '@/actions/partner';

const Option = Select.Option;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, 
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind, formatMoment } from '@/utils';
import moment from 'moment';
import {
  PipelineReconciliationQueryList, 
} from '@/actions/recruit';

const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const searchFormItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
}
class OrderOtherPayList extends React.Component {
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
      BranchArr:[],
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        zbPayeeType:'', //公司
        branchId: '',//分部ID
        pushResult:'',
        payType:'',
        serialNumber:'',
        payDateStart:'',
        payDateEnd:'',
        payType:''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      startValue: null,
      endValue: null,
      endOpen: false,
      isShowDelete: false,
      studentOtherPayId: ''
    };
  }
  componentWillMount() { 
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'product_branch_price_status', 'producttype', 'dic_Allow', 'payee_type','pay_Type']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    this.onSearch();
    // this.GetBranchNew()
  }
  GetBranchNew = (parentId) =>{
    let condition = {};
    condition.parentId = this.props.currentUser.userType.orgId;
    this.props.LargeAreaDepartmentalDropDown(condition).payload.promise.then((response) => {
        let data = response.payload.data; 
            if(data.state == 'success'){
              this.setState({
                BranchArr:data.data
              })
            }else{
              message.error(data.msg);
            }
        }
    )
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '公司',
      fixed: 'left',
      width: 120,
      dataIndex: 'zbPayeeType',
      render: text => <span>{getDictionaryTitle(this.state.payee_type, text)}</span>
    },
    {
      title: '分部',
      width: 120,
      dataIndex: 'branchName',
    },
    {
      title: '支付方式',
      width: 120,
      dataIndex: 'payType',
    },
    {
      title: '支付流水号',
      width: 200,
      dataIndex: 'serialNumber',
    },
    {
      title: '是否已推送',
      width: 140,
      dataIndex: 'pushResult',
    },
    {
      title: '金额',
      width: 140,
      dataIndex: 'money',
      render: (text, record, index) => (`${formatMoney(record.money)}`)
    },
    {
      title: '缴费日期',
      width: 120,
      dataIndex: 'payDate',
      render: (text, record, index) => (`${timestampToTime(record.payDate)}`)
    },
    {
      title: 'POS编号',
      dataIndex: 'pos',
    }, 
    {
      title: '员工编号',
      width: 120,
      dataIndex: 'loginName',
    },
    {
      title: '员工姓名',
      dataIndex: 'realName',
      width: 120,
      fixed: 'right',
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let payDateStart = condition.payDateStart;
    if(payDateStart){
      condition.payDateStart = payDateStart[0] ? formatMoment(payDateStart[0])+' 00:00:00':'';
      condition.payDateEnd = payDateStart[1] ? formatMoment(payDateStart[1])+' 23:59:59':'';
    }
    this.props.PipelineReconciliationQueryList(condition).payload.promise.then((response) => {
      let data = response.payload.data; 
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          data:JSON.parse(data.data.result),
          loading: false,
          totalRecord:data.data.count
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }  

  disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({ endOpen: true });
      }
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
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
        // extendButtons.push(<FileDownloader
        //   apiUrl={'/edu/studentOtherPay/exportOtherPayList'}//api下载地址
        //   method={'get'}//提交方式
        //   options={this.state.pagingSearch}//提交参数
        //   title={'导出'}
        // >
        // </FileDownloader>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'公司'} >
                        {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.payee_type.filter((a)=>a.title!='全部').filter((a)=>a.title!='大客户收费').filter((a)=>a.title!='共管账户').map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="分部" >
                          {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                            <SelectFBOrg scope='my' hideAll={false} />
                          )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'支付流水号'} >
                        {getFieldDecorator('serialNumber', { initialValue: this.state.pagingSearch.serialNumber })(
                          <Input placeholder="请输入流水号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                          {...searchFormItemLayout}
                          label={'是否已推送'}
                        >
                          {getFieldDecorator("pushResult",{initialValue:this.state.pagingSearch.pushResult})(
                            <Select>
                              <Option value=''>全部</Option>
                              <Option value='1'>是</Option>
                              <Option value='0'>否</Option>
                            </Select>
                          )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                          {...searchFormItemLayout}
                          label={'支付方式'}
                        >
                          {getFieldDecorator("payType",{initialValue:this.state.pagingSearch.payType})(
                            <Select>
                              <Option value=''>全部</Option>
                              <Option value='10'>pos机</Option>
                              <Option value='20'>支付宝</Option>
                              <Option value='30'>微信</Option>
                            </Select>
                          )}
                        </FormItem>
                    </Col> 
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="缴费日期">
                            {getFieldDecorator('payDateStart', { initialValue: (this.state.pagingSearch.payDateStart&&this.state.pagingSearch.payDateStart.indexOf('n')==-1)?[moment(this.state.pagingSearch.payDateStart,dateFormat),moment(this.state.pagingSearch.payDateEnd,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
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
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                rowKey={record => record.productPriceId}//主键
                bordered
                scroll={{ x: 1400 }}
              //rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
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
const WrappedManage = Form.create()(OrderOtherPayList);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { currentUser } = state.auth; 
  return { Dictionarys,currentUser};
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    PipelineReconciliationQueryList: bindActionCreators(PipelineReconciliationQueryList, dispatch),  
    LargeAreaDepartmentalDropDown: bindActionCreators(LargeAreaDepartmentalDropDown, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);


'就是他'