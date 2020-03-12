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
//getStudentAskBenefitList
import { NetOpenView,BatchTermination,ModifiedTimeLength,ModifiedTimeLengthBatch,NewNetClassSure,ReactivationInterface } from '@/actions/course';
import { NetAuditApply,getCourseCategoryList } from '@/actions/base'
import { editUser} from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem'; 
import StudentAskfaceView from './view'; 
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory'; 
import DropDownButton from '@/components/DropDownButton';
import History from './History' 
// import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = { 
    vationId:'',
    dataModal:[], 
    NVisiting:false,
    activation:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      itemId:'',
      courseCategoryId:'',
      courseName:'',
      courseState:'',
      activeState:'',
    }, 
    UserSelecteds: [],
    loading: false,
    taskMan:[],
    applyNew:[]
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
    this.loadBizDictionary(['discount_type','visit_status','student_course_apply_audit_status']);
    this.loadBizDictionary(['order_type','active_state']);
    this.loadBizDictionary(['order_status']);
    this.loadBizDictionary(['payee_type']);
    this.loadBizDictionary(['reg_source']);
    this.loadBizDictionary(['grade']);
    this.onSearch()
    console.log(this.props)
    this.setState({
      dataModal:this.props.currentDataModel
    })
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount","student_course_apply_audit_status");
  }
  
  columns = [
    
    {
      title: '课程名称',
      fixed: 'left',
      width:150,
      dataIndex: 'courseName',
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName',
    },
    {
      title: '激活日期',
      dataIndex: 'activeTime',
      render:(text,record)=>{
        return timestampToTime(record.activeTime)
      }
    },
    {
      title: '结束日期',
      dataIndex: 'endTime',
      render:(text,record)=>{
        return timestampToTime(record.endTime)
      }
    },
    {
      title: '开通天数',
      dataIndex: 'dayNum',
    },
    {
      title: '激活状态',
      dataIndex: 'acitveState',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.active_state, record.acitveState);
      }
    },
    {
      title: '网课情况',
      dataIndex: 'studyStatusName',
    },
    {
      title: '操作',
      fixed: 'right',
      width:120,
      render: (text, record) => {
        return <DropDownButton>
          {
            record.activeStateName=='未激活'?<Button onClick={()=>{this.Reactivation(record)}}>重新激活</Button>:
            <Button onClick={() => { this.onLookView('Time', record); }}>修改时长</Button>
          }
          <Button onClick={() => { this.onLookView('Record', record); }}>修改记录</Button>
        </DropDownButton>
      }
    }


  ];
  //重新激活
  Reactivation=(record)=>{
    this.setState({
      activation:true,
      vationId:record.courseActiveId
    })
  }
  activationSure=()=>{
    this.props.form.validateFields((err, values) => {
      let re = /^\d+$/;
      let condition = {};
      if(re.test(values.day)){
        condition.day = values.day;
      }else{
        message.error('输入的内容必须为大于零的整数！');
        return
      }
      condition.courseActiveId = this.state.vationId;
      this.props.ReactivationInterface(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if(data.state=='success'){
          message.success('重新激活成功！')
          this.onSearch();
          this.onLookView("Manage", null);
        }else{
          message.error(data.msg)
        }
        this.setState({
          activation:false,
        })
      })

    })
  }
  activationNo=()=>{
    this.setState({
      activation:false
    })
  }
  onNVisiting=()=> {
    this.setState({
      NVisiting: false
    })
  }
  //新开网课
  NewNet=()=>{
    this.onLookView("NewNet")
  }
  //终止学生
  onSuerNVisiting=()=>{
    let arr = [];
    this.state.taskMan.forEach((item)=>{
      arr.push(item.courseActiveId)
    })
    this.props.BatchTermination({courseActiveIds:arr.join(',')}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false,NVisiting: false, })
        message.error(data.message);
      }
      else {
       
        this.onSearch();
        this.setState({
          UserSelecteds:[],
          taskMan:[],
          NVisiting: false,
          applyNew:data.data,
        })
        this.countDownEnd();
        this.onLookView("Manage", null);
      }
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.studentId = this.props.currentDataModel.userId;
    this.props.NetOpenView(condition).payload.promise.then((response) => {
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

//批量修改时长
  Visiting = () => {
    let params = { ids: this.state.UserSelecteds,taskMan:this.state.taskMan,type:3 }
    this.onLookView("editpUser", params)
  }

  //弹出终止学生框
  Termination=()=>{
    // this.onLookView("Manage", record)
    this.setState({
      NVisiting:true
    })
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //弹框
  countDown = () => {
    let cont = this.state.applyNew.errorList.map(e=><p>{e}</p>);
    let success = this.state.applyNew.successCount
    Modal.warning({
      title:'成功修改数据 '+ success+' 条',
      content: cont,
    });
  }

//成功终止后的提示弹框
  countDownEnd = () => {
    let cont = this.state.applyNew.errorList.map(e=><p>{e}</p>);
    let success = this.state.applyNew.successCount
    Modal.warning({
      title:'成功修改数据 '+ success+' 条',
      content: cont,
    });
  }
  onCancelBack = () => {
    this.props.viewCallback();
  }
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {
      switch (this.state.editMode) {
        case 'editpUser':
          this.props.ModifiedTimeLengthBatch(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.setState({
                UserSelecteds:[],
                taskMan:[],
                applyNew:data.data
              })
              this.countDown();
              this.onLookView("Manage", null);
            }
          })
          break;
          case 'Time': 
             this.props.ModifiedTimeLength(dataModel).payload.promise.then((response) => {
                let data = response.payload.data;
                if(data.data){
                  message.success('修改成功！');
                  this.onSearch();
                  this.onLookView("Manage", null);
                }
             })
          break;
          case 'NewNet':
              this.props.NewNetClassSure(dataModel).payload.promise.then((response) => {
                      let data = response.payload.data;
                      if(data.state=='success'){
                          this.setState({
                            UserSelecteds:[],
                            taskMan:[],
                            applyNew:data.data,
                            isShowChooseProduct:false
                          })
                          this.onSearch();
                          this.countDown();
                          this.onLookView("Manage", null);
                      }else{
                        message.error(data.msg)
                      }
                })
          break;
          case 'ViewEdit':
          this.props.NetAuditApply(dataModel).payload.promise.then((res)=>{
            let data = res.payload.data;
            if(data.state == 'error'){
              message.error(data.message)
            }else{
              message.success('审核成功')
              this.onSearch();
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
  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "View":
      case 'Record':
      case 'Time':
        block_content = <History
          viewCallback={this.onViewCallback}
          {...this.state}
        />
       break;
      case 'editpUser':
      case 'NewNet':
        block_content = <StudentAskfaceView
          viewCallback={this.onViewCallback}
          {...this.state}

        />
        break;
      case 'Manage':
      default:
      
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys,taskMan:selectedRows })
          },
          getCheckboxProps: record => { 
            return ({
              disabled: record.acitveState==0? true:false,    // Column configuration not to be checked
            })
          },
        };
        let extendButtons = [];
        extendButtons.push(<Button onClick={ ()=>{this.onCancelBack()} } icon="rollback" >返回</Button>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
             
             
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label='姓名'>
                             {this.state.dataModal.realName}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...searchFormItemLayout} label='手机号'>
                              {this.state.dataModal.mobile}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...searchFormItemLayout} label='邮箱'>
                              {this.state.dataModal.email}
                        </FormItem>
                      </Col>
                      <Col span={12}></Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'项目'}>
                              {getFieldDecorator('itemId', {
                                  initialValue: this.state.pagingSearch.itemId
                              })(
                                    <SelectItem
                                      scope={'my'}
                                      hideAll={false}
                                      // isFirstSelected={true}
                                      onSelectChange={(value) => {
                                        this.state.pagingSearch.itemId = value;
                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                      }}
                                      />
                              )}
                          </FormItem>
                    </Col>
                    
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'科目'}>
                              {getFieldDecorator('courseCategoryId', {
                                  initialValue: this.state.pagingSearch.courseCategoryId
                              })(
                                <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label='课程名称'>
                          {getFieldDecorator('courseName', {
                            initialValue: this.state.pagingSearch.courseName,
                          })(
                              <Input />
                            )}
                        </FormItem>
                      </Col>
                    <Col span={12}></Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="激活状态"
                      >
                        {getFieldDecorator('activeState', { initialValue: this.state.pagingSearch.activeState })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.active_state.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                      </Col>
                      
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="网课情况"
                      >
                        {getFieldDecorator('courseStatus', { initialValue: this.state.pagingSearch.courseStatus})(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value='1'>正常</Option>
                            <Option value='2'>终止</Option>
                          </Select>
                        )}
                      </FormItem>
                      </Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
              {
                 this.state.NVisiting &&
                 <Modal
                      visible={this.state.NVisiting}
                      onOk={this.onSuerNVisiting}
                      onCancel={this.onNVisiting}
                      closable={false}
                      //okText="确认"
                      //cancelText="取消"
                >
                      <p style={{fontSize:16}}>您确定将用户所选的网课进行终止吗？</p>
                 </Modal>
                 
              }
               {
                 this.state.activation &&
                 <Modal
                      visible={this.state.activation}
                      onOk={this.activationSure}
                      onCancel={this.activationNo}
                      closable={false}
                      //okText="确认"
                      //cancelText="取消"
                >
                      <Form>
                        <Row>
                          <Col span={12} >
                          <FormItem
                            {...searchFormItemLayout}
                            label="开通天数"
                          >
                            {getFieldDecorator('day', { 
                              initialValue: ''
                          })(
                              <Input />
                            )}
                          </FormItem>
                          </Col>
                      </Row>
                    </Form>
                 </Modal>
                 
              }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'studentCourseApplyId'}
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
                
                
                  <Col span={3}>
                         {
                            this.state.UserSelecteds.length ?
                            <Button loading={this.state.loading} icon="rocket" onClick={this.Visiting}>修改时长</Button>
                            :
                            <Button loading={this.state.loading} icon="rocket" disabled>修改时长</Button>
                          }
                  </Col>
                  <Col span={3}>
                         {
                            this.state.UserSelecteds.length ?
                            <Button loading={this.state.loading} icon="warning" onClick={this.Termination}>终止</Button>
                            :
                            <Button loading={this.state.loading} icon="warning" disabled>终止</Button>
                          }
                  </Col>
                  <Col span={3}>
                          <Button loading={this.state.loading} icon="folder-add" onClick = {this.NewNet} >新开网课</Button>
                  </Col>
                  <Col span={15} className={'search-paging-control'} align="right">
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
    editUser: bindActionCreators(editUser, dispatch),
    NetOpenView: bindActionCreators(NetOpenView, dispatch),//查询列表
    ModifiedTimeLengthBatch: bindActionCreators(ModifiedTimeLengthBatch, dispatch),//批量修改时长
    BatchTermination: bindActionCreators(BatchTermination, dispatch),//批量终止
    NetAuditApply: bindActionCreators(NetAuditApply, dispatch),//审核
    ModifiedTimeLength: bindActionCreators(ModifiedTimeLength, dispatch),//修改时长
    NewNetClassSure: bindActionCreators(NewNetClassSure, dispatch),//新开网课
    ReactivationInterface: bindActionCreators(ReactivationInterface, dispatch),//重新激活
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
