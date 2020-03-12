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
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import {
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';
import { ShareOpportunityList } from '@/actions/base';
import ContentBox from '@/components/ContentBox';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    isShowChooseProduct:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      regionId: '',
      studentName: '',
      visitStatus:'',
      mobile:'',
    //   inviteDateStart:'',
    //   inviteDateEnd:'',
      benefitFconsultUserName:''
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
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
    this.loadBizDictionary(['discount_type','visit_status','order_type','order_status','payee_type','reg_source','grade']);
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }
  
  columns = [
    
    {
      title: '区域',
      fixed: 'left',
      width:120,
      dataIndex: 'regionName',
    },
    {
      title: '面咨人员',
      width:120,
      dataIndex: 'benefitFconsultUserName',
    },
    {
      title: '预约时间',
      width:120,
      dataIndex: 'inviteDate',
      render: (text, record, index) => {
        return timestampToTime(record.inviteDate)
      },
    },
    {
      title: '学生姓名',
      width:120,
      dataIndex: 'studentName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.studentName}</a>;
        
      }
    },
    {
        title:'学生归属',
        width:120,
        dataIndex:'belongBranchName'
    },
    {
      title: '在读高校校区',
      width:120,
      dataIndex: 'studyCampusName',
    },
    {
      title: '手机',
      width:120,
      dataIndex: 'mobile',
    },
    {
      title: '项目',
      width:120,
      dataIndex: 'itemName',
    },
    {
      title: '商品',
      dataIndex: 'productName',
    },
    {
        title:'备注',
        width:120,
        dataIndex:'visitRemark'
    },
    {
      title: '是否到访',
      width:100,
      dataIndex: 'visitStatus',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.visit_status,record.visitStatus)
      },
    },
    {
      title: '到访时间',
      width:120,
      dataIndex: 'visitDate',
      render: (text, record, index) => {
        return timestampToTime(record.visitDate)
      },
    },
    {
      title: '反馈人',
      width:120,
      dataIndex: 'replyUserName',
    },
    {
      title: '修改次数',
      width:100,
      dataIndex: 'version'
    },
    {
      title: '反馈日期',
      fixed:'right',
      width:120,
      dataIndex: 'replyDate',
      render: (text, record, index) => {
        return timestampToTime(record.replyDate)
      },
    }

  ];
  //关闭弹窗
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let askDate = condition.inviteDateStart;
    if(Array.isArray(askDate)){
        condition.inviteDateStart = formatMoment(askDate[0]);
        condition.inviteDateEnd = formatMoment(askDate[1]);
    }
    this.props.ShareOpportunityList(condition).payload.promise.then((response) => {
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
  //点击学生姓名、弹出弹框
  onStudentView = (record) => {
    this.onLookView("Manage", record)
    this.setState({
      isShowChooseProduct:true
    })
  }

  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
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
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/StudentInvite/exportStudentInviteList'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
             
             
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'区域'} >
                            {
                                getFieldDecorator('regionId', {
                                    initialValue: ''
                                })
                                    (
                                    <SelectArea scope='my' showCheckBox={false} />
                                    )
                            }
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.realName })(
                         <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'手机号'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                            <Input placeholder="手机号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="预约日期"
                      >
                        {getFieldDecorator('inviteDateStart', { initialValue: '' })(
                        
                              <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'是否到访'} >
                              {getFieldDecorator('visitStatus', { initialValue: dataBind(this.state.pagingSearch.activityType) })(
                                  <Select>
                                      <Option value=''>全部</Option>
                                      {this.state.visit_status.map((item,i)=>{
                                        return <Option value={item.value}>{item.title}</Option>
                                      })}
                                      
                                  </Select>
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                         <FormItem {...searchFormItemLayout} label={'面咨人员'} >
                              {getFieldDecorator('benefitFconsultUserName', { initialValue:this.state.pagingSearch.benefitFconsultUserName })(
                                  <Input/>
                              )}
                          </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            {
                 this.state.isShowChooseProduct &&
                 <Modal
                 title="订单商品选择"
                 visible={this.state.isShowChooseProduct}
                 //onOk={this.onChangeDate}
                 onCancel={this.onHideModal}
                 //okText="确认"
                 //cancelText="取消"
                 footer={null}
                 width={1000}
               >
               <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} onOff={true}  goBack={true}/>
                 </Modal>
              }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                //rowSelection={rowSelection}
                rowKey={'studentAskId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1800 }}
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
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentInviteManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    ShareOpportunityList: bindActionCreators(ShareOpportunityList, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
