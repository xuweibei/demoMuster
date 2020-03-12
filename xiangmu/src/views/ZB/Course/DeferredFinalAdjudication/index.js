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
//getStudentAskBenefitList
import { DelayManagementList,NetAuditBatchApply,OutGoingTaskBatcNohArrive,NetAuditApply } from '@/actions/base'
import { getStudentAskBenefitList } from '@/actions/enrolStudent';
import { getOrderAchievementList } from '@/actions/enrolStudent';
import { updateOrderAchievementUser } from '@/actions/enrolStudent';
import { getStudentInviteList } from '@/actions/enrolStudent';
import { updateArea } from '@/actions/enrolStudent';
import { editUser} from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import SelectRegion from '@/components/BizSelect/SelectRegion';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg';
import StudentAskfaceView from './view';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    isShowChooseProduct:false,
    NVisiting:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      // itemId:'',
      courseName:'',
      isSpecialApply:'',
      auditStatus:'',
      teachCenterId:'',
      headquarterAuditStatus:'-1'
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
    taskMan:[],
    applyNew:''
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
      title: '分部',
      fixed: 'left',
      width:150,
      dataIndex: 'branchName',
    },
    {
      title: '教学点',
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
      title: '用户名',
      dataIndex: 'loginName',
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
      title: '是否特殊申请',
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
          {
            (record.auditStatus==1&&record.isFinalAudit==1)?<Button onClick={() => { this.onLookView('ViewEdit', record); }}>审核</Button>:
            <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
          }
        </DropDownButton>
      }
    }


  ];
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  onNVisiting=()=> {
    this.setState({
      NVisiting: false
    })
  }
  onSuerNVisiting=()=>{
    let arr = [];
    this.state.taskMan.forEach((item)=>{
      arr.push(item.studentInviteId)
    })
    this.props.OutGoingTaskBatcNohArrive({studentInviteIds:arr.join(',')}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        message.success('修改成功！')
        this.onSearch();
        this.setState({
          UserSelecteds:[],
          taskMan:[],
          NVisiting: false
        })
        this.onLookView("Manage", null);
      }
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    console.log(condition)
    condition.isSpecialApply=1;
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

  onStudentView = (record) => {
    this.onLookView("Manage", record)
    this.setState({
      isShowChooseProduct:true
    })
  }

  Visiting = () => {
    let params = { ids: this.state.UserSelecteds,taskMan:this.state.taskMan,type:3 }
    this.onLookView("editpUser", params)
  }
  NotVisiting=()=>{
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
    let cont = this.state.applyNew.errorMsg.map(e=><p>{e}</p>);
    let success = this.state.applyNew.successCount
    Modal.warning({
      title:'成功修改数据'+ success+'条',
      content: cont,
    });
  }
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {
      switch (this.state.editMode) {
        case 'editpUser':
          this.props.NetAuditBatchApply(dataModel).payload.promise.then((response) => {
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
      case 'ViewEdit':
      case "View":
        block_content = <DetailView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
       break;
      case 'editpUser':
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
            // console.log(record)
            return ({
              //record.auditStatus==1代表审核record.isFinalAudit==0代表初审record.isFinalAudit==1代表终审
              disabled: (record.auditStatus==1&&record.isFinalAudit==1)? false:true,    // Column configuration not to be checked
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
                
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label='分部'>
                        {getFieldDecorator('branchId', {
                          initialValue: '',
                        })(
                          <SelectFBOrg scope={'my'}
                            // hideAll={item.is_all ? false : true}
                            // onSelectChange={(value) => this.props.onCallback(value, item.name)}
                          />
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
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="状态"
                      >
                        {getFieldDecorator('headquarterAuditStatus', { initialValue: dataBind(this.state.pagingSearch.headquarterAuditStatus) })(
                          <Select>
                            <Option value="-1">全部</Option>
                            <Option value='1'>待终审</Option>
                            <Option value='2'>终审通过</Option>
                            <Option value='3'>终审未通过</Option>
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
                    <Col span={12}></Col>
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
               <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} goBack={true} />
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
                 <p style={{fontSize:16}}>您确定所选学生未到访？</p>
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
                
                
                  <Col span={10}>
                         {
                            this.state.UserSelecteds.length ?
                            <Button loading={this.state.loading} icon="rocket" onClick={this.Visiting}>批量审核</Button>
                            :
                            <Button loading={this.state.loading} icon="rocket" disabled>批量审核</Button>
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
    getStudentAskBenefitList: bindActionCreators(getStudentAskBenefitList, dispatch),
    updateArea: bindActionCreators(updateArea, dispatch),
    updateOrderAchievementUser: bindActionCreators(updateOrderAchievementUser, dispatch),
    editUser: bindActionCreators(editUser, dispatch),
    getStudentInviteList: bindActionCreators(getStudentInviteList, dispatch),
    DelayManagementList: bindActionCreators(DelayManagementList, dispatch),//查询列表
    NetAuditBatchApply: bindActionCreators(NetAuditBatchApply, dispatch),//批量审核
    OutGoingTaskBatcNohArrive: bindActionCreators(OutGoingTaskBatcNohArrive, dispatch),//批量未到访
    NetAuditApply: bindActionCreators(NetAuditApply, dispatch),//审核
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
