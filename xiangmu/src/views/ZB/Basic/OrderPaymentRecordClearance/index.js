/*
订单查看
2018-06-02
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import { env } from '@/api/env';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary,onToggleSearchOption, onSearch, onPageIndexChange, onShowSizeChange , renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout} from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { studentQuery, studentCreate, studentUpdate } from '@/actions/recruit';
import { postRecruitBatchList } from '@/actions/recruit';
import { OrderPaymentRecordList,DeleteOrderPaymentRecord } from '@/actions/admin'

import ContentBox from '@/components/ContentBox';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import DropDownButton from '@/components/DropDownButton';

class OrderQuery extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      recruitBatchId: ''
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
  constructor(){
    super();
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
    this.loadBizDictionary(['dic_YesNo']);
    this.admissions()
  }

  columns = [
    {
        title: '学生姓名',
        width:120,
        fixed:'left',
        dataIndex: 'realName'
    },
    {
        title: '订单分部',
        width:"160",
        dataIndex: 'benefitBranchName'
    },
    {
        title: '订单号',
        width:"200",
        dataIndex: 'orderSn'
    },
    {
        title: '项目',
        width:"100",
        dataIndex: 'itemName'
    },
    {
        title: '大客户名称',
        width:"120",
        dataIndex: 'orgName',
        //render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '收费方',
        width:"120",
        dataIndex: 'payeeTypeStr',
    },
    {
        title: '主体',
        width:"120",
        dataIndex: 'zbPayeeTypeStr',
    },
    {
        title: '订单金额(¥)',
        width:"120",
        dataIndex: 'totalAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '已缴金额(¥)',
        width:"120",
        dataIndex: 'paidAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        //title: '挂单金额(¥)',
        //dataIndex: 'restingAmount',
        title: '临时缴费金额(¥)',
        width:"160",
        dataIndex: 'paidTempAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '创建日期',
        width:"180",
        dataIndex: 'createDateStr'
    },
    {
        title: '订单状态',
        width:"120",
        dataIndex: 'orderStatusStr',
    },
    {
        title: '订单类型',
        width:"160",
        dataIndex: 'orderStatusStr',
        render: (value, record, index) => {
          if(record.orderType == 1){
            return <span>个人订单</span>
          }else{
            if(record.partnerClassType == 1){
              return <span>大客户方向班</span>
            }else{
              return <span>大客户精英班</span>
            }
          }
        }
    },
    {
        title: '电子签',
        width:"100",
        dataIndex: 'esignStatusStr',
        //render: text => <span>{getDictionaryTitle(this.state.dic_YesNo, text)}</span>
    },
    {
        title: '订单来源',
        width:"120",
        dataIndex: 'orderSourceStr'
    },
    {
        title: '是否存在课程班',
        width:"160",
        dataIndex: 'isCourseArrange'
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          //编辑  缴费  废弃 查看
          //订单状态：0暂存;1审核中;2待缴费;3审核不通过;4部分缴费;5已完成;6废弃
          <DropDownButton>
              <Button onClick={() => { this.deleteData(record.orderId); }}>删除</Button>
          </DropDownButton>
        ),
    }
  ];


  admissions  = () =>{
    this.props.postRecruitBatchList().payload.promise.then((response) => {
      let data = response.payload.data;
      if(data.state == 'success'){
        this.setState({
          recruitList:data.data
        })
      }else{
        message.error(data.msg)
      }
    })
  }
  //弹出删除弹框
  deleteData = (id)=>{
    this.setState({
      isShowQrCodeModal:true,
      deleteId:id
    })
  }
  //确定删除
  sureDeleteData = () =>{
    this.setState({
      ButtonProps:true
    })
    this.props.DeleteOrderPaymentRecord({orderId:this.state.deleteId}).payload.promise.then((response)=>{
      let data = response.payload.data;
      if (data.state === 'success') {
        message.success('删除成功!');
      }else{
        message.error(data.message);
      }
      this.fetch()
      this.setState({
        isShowQrCodeModal:false,
        ButtonProps:false
      })
    })
  }
  //检索数据
  fetch(params){
      var condition = params || this.state.pagingSearch;
      if(!condition.mobile &&!condition.orderSn && !condition.realName){
        message.warning('请至少输入一个查询条件!')
        return 
      }
      this.setState({ loading: true, pagingSearch: condition });
      this.props.OrderPaymentRecordList(condition).payload.promise.then((response) => {
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

  render(){
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
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
                                        <FormItem {...searchFormItemLayout} label={'招生季'} >
                                            {getFieldDecorator('recruitBatchId', { initialValue: this.state.pagingSearch.recruitBatchId })(
                                                 <Select>
                                                   <Option value="">全部</Option>
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
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('realName', { initialValue: '' })(
                                                <Input placeholder="请输入学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'订单号'} >
                                            {getFieldDecorator('orderSn', { initialValue: '' })(
                                                <Input placeholder="请输入订单号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'手机号'} >
                                            {getFieldDecorator('mobile', { initialValue: '' })(
                                                <Input placeholder="请输入手机号" />
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
                scroll={{x:2200}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                  </Col>
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
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
        OrderPaymentRecordList: bindActionCreators(OrderPaymentRecordList, dispatch),
        DeleteOrderPaymentRecord: bindActionCreators(DeleteOrderPaymentRecord, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
