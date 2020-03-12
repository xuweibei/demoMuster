/*
订单业绩相关调整
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
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';

import { getStudentAskBenefitList } from '@/actions/enrolStudent';
import { updateOrderAchievementUser } from '@/actions/enrolStudent';
import { getStudentInviteList } from '@/actions/enrolStudent';
import { updateArea } from '@/actions/enrolStudent';
import { editUser} from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';
import StudentAskfaceView from './view';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import FileDownloader from '@/components/FileDownloader';
import EditableActive from '@/components/EditableActive';

const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    showHide:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      // askType: '1',
      regRegionId: '',
      realName: '',
      assignType: '',  //
      regSource: '',   //\
      grade: '',
      orderTypes: '',
      benefitMarketUserName: '',
      benefitPconsultUserName: '',  
      notAskDate: '',        //开始时间
      studyUniversityName:'',
      createDateStart:'',
      createDateEnd:'',
      studentCreateDateStart:'',
      studentCreateDateEnd:'',
      isPublic: ''
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
    activeIdData: [],
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
    this.loadBizDictionary(['reg_source','dic_YesNo']);
    this.loadBizDictionary(['grade']);
    // this.onSearch()
  }
  componentDidMount(){
      document.addEventListener("keydown",this.handleEnterKey);
  }
  componentWillUnmount() {
      document.removeEventListener("keydown",this.handleEnterKey);
  }
  handleEnterKey = (e) => {
      if(e.keyCode === 13){
          this.onSearch();
      }
  }
  
  columns = [
    {
      title: '学生姓名',
      dataIndex: 'realName',
      fixed: 'left',
      width: 100,
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.realName}</a>;
        
      }
    },
    {
      title: '在读高校',
      dataIndex: 'studyUniversityName',
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
      title: '学生来源',
      width: 100,
      dataIndex: 'regSource',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.reg_source, record.regSource);
    }
    },
    {
      title: '邀约创建日期',
      width: 100,
      dataIndex: 'createDate',
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    },
    {
      title: '邀约日期',
      width: 100,
      dataIndex: 'inviteDate',
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    },
    {
      title: '学生创建时间',
      width: 100,
      dataIndex: 'studentCreateDate',
      render: (text, record, index) => {
        return timestampToTime(record.studentCreateDate)
      }
    },
    {
      title: '备注',
      width: 180,
      dataIndex: 'remark',
    },
    {
      title: '创建人',
      dataIndex: 'createUserName',
      fixed: 'right',
      width: 120,
    },

  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    //日期
    let createDateStart;
    let createDateEnd;
    let askDate = condition.createDateStart;
    if(askDate){
        condition.createDateStart = formatMoment(askDate[0]);
        condition.createDateEnd = formatMoment(askDate[1]);
    }
    let inviteDateStart;
    let inviteDateEnd;
    let askDate2 = condition.inviteDateStart;
    if(askDate2){
        condition.inviteDateStart = formatMoment(askDate2[0]);
        condition.inviteDateEnd = formatMoment(askDate2[1]);
    }
    let studentCreateDateStart;
    let studentCreateDateEnd;
    let studentCreateDate = condition.studentCreateDateStart;
    if(studentCreateDate){
      condition.studentCreateDateStart = formatMoment(studentCreateDate[0]);
      condition.studentCreateDateEnd = formatMoment(studentCreateDate[1]);
    }

    if (condition.activeId && condition.activeId.length > 0) {
        this.setState({ activeIdData: condition.activeId })
        condition.activeId = condition.activeId[0].id
    }

    condition.startDate = formatMoment(condition.startDate);//日期控件处理
    this.props.getStudentInviteList(condition).payload.promise.then((response) => {
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

  onStudentView = (record) => {
    this.onLookView("View", record)
  }

  oneditpUser = () => {
    let params = { ids: this.state.UserSelecteds,type:3 }
    this.onLookView("editpUser", params)
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {
      switch (this.state.editMode) {
        case "EditDate":
          this.props.discountRuleExpiryDateBatchUpdate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Edit':
          this.props.updateOrderAchievementUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Create':
          this.props.discountRuleCreate(dataModel).payload.promise.then((response) => {
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
          case 'editArea':
          this.props.updateArea(dataModel).payload.promise.then((response) => {
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
        default:
          this.props.editUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({UserSelecteds:[]});
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }

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
      case 'EditDate':
      case 'Edit':
      case 'editmUser':
      case 'editpUser':
      case 'editfUser':
      case 'editArea':
        block_content = <StudentAskfaceView
          viewCallback={this.onViewCallback}
          {...this.state}

        />
        break;
      case 'Create':
      case 'Audit':
        // block_content = <DiscountView
        //   viewCallback={this.onViewCallback}
        //   {...this.state}
        // />
        // break;
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
          apiUrl={'/edu/studentAsk/exportInvite'}//api下载地址
          method={'get'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        extendButtons.push(<Button onClick={() => { this.showHideFN() }
        } icon={this.state.showHide?'caret-up':'caret-down'} className="button_dark" > 搜索条件{this.state.showHide?'收起':'展开'}</Button>);

        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
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
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生来源'} >
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
                      <FormItem {...searchFormItemLayout} label={'在读高校'} >
                        {getFieldDecorator('studyUniversityName', { initialValue: this.state.pagingSearch.studyUniversityName })(
                            <Input placeholder="在读高校" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem {...searchFormItemLayout}
                            label="首次活动名称">
                            {getFieldDecorator('activeId', { initialValue: (!this.state.activeIdData.length ? [] : [{
                                id: this.state.activeIdData[0].id,
                                name: this.state.activeIdData[0].name
                              }]) })(
                                <EditableActive  maxTags={1}/>
                            )}
                        </FormItem>
                    </Col>
                    {
                      this.state.showHide && <div>
                      <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'微信号'} >
                          {getFieldDecorator('weixin', { initialValue: this.state.pagingSearch.weixin })(
                              <Input placeholder="微信号" />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'QQ'} >
                          {getFieldDecorator('qq', { initialValue: this.state.pagingSearch.qq })(
                           <Input placeholder="QQ" />
                          )}
                        </FormItem>
                      </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="邀约创建日期"
                      >
                        {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[] })(
                          
                              <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="邀约日期"
                      >
                        {getFieldDecorator('inviteDateStart', { initialValue: this.state.pagingSearch.inviteDateStart?[moment(this.state.pagingSearch.inviteDateStart,dateFormat),moment(this.state.pagingSearch.inviteDateEnd,dateFormat)]:[] })(
                        
                              <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="学生创建日期"
                      >
                        {getFieldDecorator('studentCreateDateStart', { initialValue: this.state.pagingSearch.studentCreateDateStart?[moment(this.state.pagingSearch.studentCreateDateStart,dateFormat),moment(this.state.pagingSearch.studentCreateDateEnd,dateFormat)]:[] })(
                        
                              <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col>
                    {//线下分部
                      (this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) ? <Col span={12} >
                          <FormItem {...searchFormItemLayout}
                              label="是否公海">
                              {getFieldDecorator('isPublic', { initialValue: this.state.pagingSearch.isPublic })(
                                  <Select>
                                      <Option value="">全部</Option>
                                      {this.state.dic_YesNo.map((item, index) => {
                                          return <Option value={item.value} key={index}>{item.title}</Option>
                                      })}
                                  </Select>
                              )}
                          </FormItem>
                      </Col>
                      : <Col span={12} ></Col>
                    }</div>
                  }
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
                scroll={{ x: 1400 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                
                </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={24} className={'search-paging-control'} align="right">
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
  let { currentUser } = state.auth;
  return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getStudentAskBenefitList: bindActionCreators(getStudentAskBenefitList, dispatch),
    updateArea: bindActionCreators(updateArea, dispatch),
    updateOrderAchievementUser: bindActionCreators(updateOrderAchievementUser, dispatch),
    editUser: bindActionCreators(editUser, dispatch),
    getStudentInviteList: bindActionCreators(getStudentInviteList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
