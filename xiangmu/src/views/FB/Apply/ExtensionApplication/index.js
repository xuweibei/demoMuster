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
import { DelayManagementList,OutGoingTaskBatchArrive,DeferredAuditDelete,ShareOpportunityPreservation } from '@/actions/base';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import DropDownButton from '@/components/DropDownButton';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    isShowChooseProduct:false,
    NVisiting:false,
    editMode: '',
    applyNew:'',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      courseName:'',
      isSpecialApply:'',
      auditStatus:'',
      teachCenterId:'',
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
    taskMan:[]
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
    this.loadBizDictionary(['order_type']);
    this.loadBizDictionary(['order_status']);
    this.loadBizDictionary(['payee_type']);
    this.loadBizDictionary(['reg_source']);
    this.loadBizDictionary(['grade']);
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount","student_course_apply_audit_status");
  }
  
  columns = [
    
    {
      title: '教学点',
      fixed: 'left',
      width:150,
      dataIndex: 'teacherCenterName',
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.studentName}</a>;
        
      }
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
    },
    {
      title: '延期天数',
      dataIndex: 'applyDays',
    },
    {
      title: '特殊申请',
      dataIndex: 'isSpecialApply',
      render:(text,record)=>{
        return record.isSpecialApply==1?'是':'否'
      }
    },
    {
      title: '状态',
      dataIndex: 'statusName',
    },
    {
      title: '申请日期',
      dataIndex: 'createDate',
      render: (text, record, index) => {
        return timestampToTime(record.createDate)
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width:120,
      render: (text, record) => {
        return <DropDownButton>
            <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
        </DropDownButton>
      }
    }


  ];
  //关闭 学生姓名弹框 
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  //关闭删除弹框
  onNVisiting=()=> {
    this.setState({
      NVisiting: false
    })
  }
  //确认删除
  onSuerNVisiting=()=>{
    let arr = [];
    this.state.taskMan.forEach((item)=>{
      arr.push(item.studentCourseApplyId)
    })
    this.props.DeferredAuditDelete({studentCourseApplyIds:arr.join(',')}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        // message.success('删除成功！')
        this.setState({
          UserSelecteds:[],
          taskMan:[],
          NVisiting: false,
          applyNew:data.data
        });
        this.countDown();
        this.onSearch();
        this.onLookView("Manage", null);
      }
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.DelayManagementList(condition).payload.promise.then((response) => {
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
  //点击学生姓名
  onStudentView = (record) => {
    this.onLookView("Manage", record)
    this.setState({
      isShowChooseProduct:true
    })
  }
  //删除弹框
  deleteNew=()=>{
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
  //弹框提示
  countDown = () => {
    let cont = this.state.applyNew.errorMsg.map(e=><p>{e}</p>);
    let success = this.state.applyNew.successCount
    Modal.warning({
      title:'成功删除数据'+ success+'条',
      content: cont,
    });
  }
  //视图回调
  onViewCallback = () => {
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "View":
        block_content = <DetailView
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
              //record.auditStatus==1代表审核record.isFinalAudit==0代表初审record.isFinalAudit==1代表终审
              disabled: ((record.isSpecialApply==0&&record.auditStatus==1&&record.isFinalAudit==1)||(record.isSpecialApply==1&&record.auditStatus==1&&record.isFinalAudit==0))? false:true,    // Column configuration not to be checked
            })
          },
        };
          const prefixSelector = getFieldDecorator('textKey', {
            initialValue: dataBind(this.state.pagingSearch.textKey || 'loginName'),
          })(
            <Select style={{ width: 86 }} onChange={this.onCountryChange}>
              <Option value='loginName'>用户名</Option>
              <Option value='realName'>姓名</Option>
              <Option value='mobile'>手机号</Option>
              <Option value='qq'>QQ</Option>
              <Option value='orderSn'>订单号</Option>
            </Select>
            );
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
             
             
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="教学点"
                        >
                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                <SelectTeachCenterByUser />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'项目'}>
                              {getFieldDecorator('itemId', {
                                  initialValue: this.state.pagingSearch.itemId
                              })(
                                  
                                  <SelectItem
                                      scope={'my'}
                                      hideAll={true}
                                      isFirstSelected={true}
                                      />
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="状态"
                      >
                        {getFieldDecorator('auditStatus', { initialValue: dataBind(this.state.pagingSearch.auditStatus) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.student_course_apply_audit_status.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                      </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'是否特殊申请'} >
                              {getFieldDecorator('isSpecialApply', { initialValue: dataBind(this.state.pagingSearch.isSpecialApply) })(
                                  <Select>
                                    <Option value=''>全部</Option>
                                    <Option value='1'>是</Option>
                                    <Option value='0'>否</Option>
                                  </Select>
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}><FormItem
                      {...searchFormItemLayout}
                      label="多条件查询"
                    >
                      {getFieldDecorator('textValue', {
                        initialValue: this.state.pagingSearch.textValue,
                      })(
                        <Input addonBefore={prefixSelector}
                        />
                        )}
                    </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'课程名称'} >
                        {getFieldDecorator('courseName', { initialValue: this.state.pagingSearch.realName })(
                         <Input placeholder="课程名称" />
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
                     <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} goBack={true}/>
                 </Modal>
              }
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
                 <p style={{fontSize:16}}>确定删除所选数据?</p>
                 </Modal>
                 
              }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'studentInviteId'}
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
                
                
                  <Col span={10}>
                         {
                            this.state.UserSelecteds.length ?
                            <Button loading={this.state.loading} icon="delete" onClick={this.deleteNew}>删除</Button>
                            :
                            <Button loading={this.state.loading} icon="delete" disabled>删除</Button>
                          }
                  </Col>
                  <Col span={14} className={'search-paging-control'} align="right">
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
    DelayManagementList: bindActionCreators(DelayManagementList, dispatch),//查询列表
    DeferredAuditDelete: bindActionCreators(DeferredAuditDelete, dispatch),//确认删除
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
