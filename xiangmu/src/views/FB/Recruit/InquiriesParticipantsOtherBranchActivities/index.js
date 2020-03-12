/*
  参加其它分部活动学生查询
*/

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const { RangePicker } = DatePicker;
const { Option, OptGroup } = Select;
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
 
import { InquiriesForParticipantsList } from '@/actions/recruit'; 
import { queryAllBranch } from '@/actions/base'; 
import ContentBox from '@/components/ContentBox'; 
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import FileDownloader from '@/components/FileDownloader';
import EditableActive from '@/components/EditableActive';
import SelectArea from '@/components/BizSelect/SelectArea';

const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  constructor(props) {
    super(props);
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);  
    let timeArr = timestampToTime(new Date().getTime()).split('-');
    let nowYear = timeArr[0];
    let studyUniversityEnterYear = [];
    for(var i=0; i<20; i++){
        studyUniversityEnterYear.push({ title: (nowYear-i), value: (nowYear-i) })
    }
     
    let startTimeYear = timeArr[0];
    let startTimeMonth = timeArr[1];
    let startTimeDay = timeArr[2]; 
    
    this.state = {
      all_org_list:[],
      showHide:false,
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        // askType: '1',
        regionId: '',
        activityBranch: '',
        assignType: '',  //
        regSource: '',   //\
        orderState: '',
        universityName: '',
        activityType: '',
        isStudy: '',  
        activityName: '',        //开始时间
        grade:'',
        startDateS:props.state.zs.ll == 'menu81'?this.getDay(-14):'',
        startDateE:props.state.zs.ll == 'menu81'?startTimeYear+'-'+startTimeMonth+'-'+startTimeDay:'', 
      }, 
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
      activeIdData: [],
    };
  }
  getDay = (day) => {
      var today = new Date(); 
      var targetday_milliseconds=today.getTime() + 1000*60*60*24*day; 
      today.setTime(targetday_milliseconds); //注意，这行是关键代码
      var tYear = today.getFullYear();
      var tMonth = today.getMonth();
      var tDate = today.getDate();
      tMonth = this.doHandleMonth(tMonth + 1);
      tDate = this.doHandleMonth(tDate);
      return tYear+"-"+tMonth+"-"+tDate;
  }
  doHandleMonth = (month) => {
      var m = month;
      if(month.toString().length == 1){
       m = "0" + month;
      }
      return m;
  }
  componentWillMount() {
    this.loadBizDictionary(['reg_source','dic_YesNo','activity_type','is_study']);
    this.loadBizDictionary(['grade']);
    this.getBranck();
    // this.onSearch()
  }
  compoentDidMount() { 
  }
  getBranck = () =>{
    this.props.queryAllBranch().payload.promise.then((response) => {
      let data = response.payload.data; 
      data.data.filter(item=>{
        if(item.organizationList.length){
         var ppp = item.organizationList.filter(pp=>{
            return pp.orgId != this.props.currentUser.userType.orgId
          }) 
            item.organizationList = ppp
            return item 
        }
      })
      let abc = data.data.filter(item=>item.organizationList.length > 0 ) 
      
      let all_org_list = [];
      let orderDQList = abc.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
      //循环
      orderDQList.map((a) => {
        //没有分部
        if (a.organizationList.length == 0) {
          return;
        }

        let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序

        let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
        orderFBList.map((fb) => {
          dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
        })
        all_org_list = [...all_org_list, dqItem];
      });
      this.setState({
        all_org_list
      })
    })
  }
  columns = [
    {
      title:'学生区域',
      dataIndex:'regionName',
      fixed: 'left',
      width: 100, 
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName', 
      width: 100,
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.studentName}</a>;
        
      }
    },
    {
      title: '学生来源',
      width: 100,
      dataIndex: 'regSource',
      render: (text, record, index) => {
          return getDictionaryTitle(this.state.reg_source, record.regSource);
      }
    },
    {
      title: '学生意向等级',
      width: 120,
      dataIndex: 'grade',
    },
    {
      title: '学生订单情况',
      width: 120,
      dataIndex: 'orderState',
    },
    {
      title: '目前情况',
      width: 120,
      dataIndex: 'isStudy',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.is_study,record.isStudy)
      }
    },
    {
      title: '在读高校',
      width: 160,
      dataIndex: 'universityName',
    },
    {
      title: '手机号',
      width: 120,
      dataIndex: 'mobile',
    },
    {
      title: '微信号',
      width: 120,
      dataIndex: 'weixin',
    }, 
    {
      title: 'qq',
      width: 120,
      dataIndex: 'qq',
    },
    {
      title: '活动分部', 
      width: 120,
      dataIndex: 'activityBranch', 
    },
    {
      title: '活动名称', 
      dataIndex: 'activityName', 
    },
    {
      title: '活动类型',
      width: 120,
      dataIndex: 'activityType',
    },
    {
      title: '活动开始日期',
      width: 100,
      fixed: 'right', 
      dataIndex: 'startDate',
      render: (text, record, index) => {
        return timestampToTime(record.startDate)
      }
    }, 
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    //日期 
    let startDateS = condition.startDateS;
    if(startDateS){
        condition.startDateS = formatMoment(startDateS[0]);
        condition.startDateE = formatMoment(startDateS[1]);
    }  
  
    this.props.InquiriesForParticipantsList(condition).payload.promise.then((response) => {
      let data = response.payload.data; 
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition,data:data.data.pageResult,totalRecord:data.data.totalRecord, loading: false })
      }
    })
  }

  onViewCallback = () => {
    this.setState({
      editMode:'Manage'
    })
  }
  onStudentView = (record) => {
    this.onLookView("View", record)
  } 
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  }; 

  showHideFN = () =>{ 
    let { showHide } = this.state;
    this.setState({ 
        showHide:!showHide
    })
  }
  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "View":
      block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
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
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/studentAct/exportActivityStudentList'}//api下载地址
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
                        <FormItem {...searchFormItemLayout} label={'学生区域'} >
                            {getFieldDecorator('regionId', { initialValue: this.state.pagingSearch.regionId })(
                                <SelectArea scope='my' hideAll={false} showCheckBox={false} />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem {...searchFormItemLayout} label="学生来源" >
                            {getFieldDecorator('regSource', { initialValue: this.state.pagingSearch.regSource })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.reg_source.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生意向等级'} >
                        {getFieldDecorator('grade', { initialValue: this.state.pagingSearch.grade })(
                            <Select>
                            <Option value="">全部</Option>
                            {this.state.grade.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生目前情况'} >
                        {getFieldDecorator('isStudy', { initialValue: this.state.pagingSearch.grade })(
                          <Select>
                            <Option value="">全部</Option> 
                            {
                              this.state.is_study.map(item=>{
                                return <Option value={item.value}>{item.title}</Option>
                              })
                            } 
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'在读高校'} >
                        {getFieldDecorator('universityName', { initialValue: this.state.pagingSearch.universityName })(
                            <Input placeholder="在读高校" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生订单情况'} >
                        {getFieldDecorator('orderState', { initialValue: this.state.pagingSearch.orderState })(
                          <Select>
                            <Option value="">全部</Option> 
                            <Option value="1">无订单</Option> 
                            <Option value="2">已下单未缴费</Option> 
                            <Option value="3">已下单已缴费</Option> 
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'其他分部活动类型'} >
                        {getFieldDecorator('activityType', { initialValue: this.state.pagingSearch.activityType })(
                            <Select>
                            <Option value="">全部</Option>
                            {this.state.activity_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col> 
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="活动开始日期"
                      >
                        {getFieldDecorator('startDateS', { initialValue: this.state.pagingSearch.startDateS?[moment(this.state.pagingSearch.startDateS,dateFormat),moment(this.state.pagingSearch.startDateE,dateFormat)]:[] })(
                          
                              <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col> 
                    <Col span={12} >
                          <FormItem {...searchFormItemLayout}
                              label="活动分部">
                              {getFieldDecorator('activityBranch', { initialValue: ''})(  
                                  <Select
                                    showSearch={true}
                                    filterOption={(inputValue, option) => {
                                      var result = false;
                                      for(var i = 0; i < option.props.children.length; i++){
                                        if(option.props.children[i].indexOf(inputValue) != -1){
                                          result = true;
                                          break;
                                        }
                                      }
                                      return result;
                                      //return (option.props.children.indexOf(inputValue) != -1);
                                    }}
                                  > 
                                      <Option value=''>全部</Option>
                                      {  this.state.all_org_list.map((dqItem) => { 
                                          return <OptGroup label={dqItem.orgName}>
                                          { dqItem.children.map((fbItem, index) => {
                                              return <Option title={fbItem.state === 0?fbItem.orgName+'【停用】':fbItem.orgName} value={fbItem.orgId} key={index}>{fbItem.orgName}{fbItem.state === 0 ? '【停用】' : ''}</Option>
                                            })
                                            }
                                          </OptGroup>
                                        })}
                                  </Select> 
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12} >
                          <FormItem {...searchFormItemLayout}
                              label="活动名称">
                              {getFieldDecorator('activityName', { initialValue: this.state.pagingSearch.activityName })(
                                  <Input placeholder='请输入活动名称' />
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
                  <Col span={24} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      
                      pageSizeOptions = {['10','20','30','50','100','200']}
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
  let { currentUser } = state.auth;
  return { Dictionarys, currentUser,state };
};

function mapDispatchToProps(dispatch) {
  return { 
    loadDictionary: bindActionCreators(loadDictionary, dispatch),    
    queryAllBranch: bindActionCreators(queryAllBranch, dispatch),   
    InquiriesForParticipantsList: bindActionCreators(InquiriesForParticipantsList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
