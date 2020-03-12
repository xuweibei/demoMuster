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
import { NewActivationCourseList,getCourseCategoryList } from '@/actions/base';
import ContentBox from '@/components/ContentBox'; 
import SelectItem from '@/components/BizSelect/SelectItem'; 
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'; 
import FileDownloader from '@/components/FileDownloader';   
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  constructor(props) {
    super(props);
    
  this.state = {
    isShowChooseProduct:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      // itemId:'',
      loginName:'',
      realName:'',
      mobile:'',
      qq:'',
      courseType:'',
      courseSourceType:'',
      courseSourceId:'',
      orderSource:'',
      orderType:'',
      courseCategoryId:'',
      branchId:'',
      isGive:'',
      isRehear:'',
      activeStartTime:props.pagingSearch.startDate,
      activeEndTime:props.pagingSearch.endDate,
      examinationStartDate:'',
      examinationEndDate:'',
      itemId:'',
    },  
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
    taskMan:[], 
    subjectList:[]
  };
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
    this.loadBizDictionary(['order_type','dic_YesNo']);
    this.loadBizDictionary(['order_source','courseType']);
    this.onSearch();
    console.log(this.props)
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount","student_course_apply_audit_status");
  }
  
  columns = [
    
    {
      title: '学生姓名',
      fixed: 'left',
      width:120,
      dataIndex: 'realName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.realName}</a>;
        
      }
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '用户名',
      dataIndex: 'loginName',
    },
    {
      title: '授课类型',
      dataIndex: 'courseType',
    },
    {
      title: '订单号',
      dataIndex: 'courseSourceId',
    },
    {
      title: '赠送',
      dataIndex: 'isGive',
    },
    {
      title: '允许重修',
      dataIndex: 'isRehear',
    },
    {
      title: '分部/区域',
      dataIndex: 'orgName',
    },
    {
      title: '学籍情况',
      dataIndex: 'studyEndDate',
      render:(text,record)=>{
        let nowTime = new Date().getTime();
        if(record.studyEndDate){
          return nowTime<record.studyEndDate?'正常':'到期'
        }else{
          return record.studyEndDate
        }
      }
    },
    {
      title: '激活状态',
      dataIndex: 'other',
      render:(text,record)=>{
        return <span>激活未过期</span>
      }
    },
    {
      title: '激活时间',
      dataIndex: 'activeTime',
      render: (text, record, index) => {
        return timestampToTime(record.activeTime)
      },
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      render: (text, record, index) => {
        return timestampToTime(record.endTime)
      },
    },
    {
      title: '考试时间',
      fixed: 'right',
      width:120,
      dataIndex: 'examinationDate',
      render: (text, record, index) => {
        return timestampToTime(record.examinationDate)
      },
    },

  ];
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let activeTime = condition.activeStartTime;
    let ecamTime = condition.examinationStartDate;
    if(this.props.editMode == 'webCast'){
      condition.courseType = 3
    }
    if(Array.isArray(activeTime)){
      condition.activeStartTime = formatMoment(activeTime[0]);
      condition.activeEndTime = formatMoment(activeTime[1]);
    }
    if(Array.isArray(ecamTime)){
      condition.examinationStartDate = formatMoment(ecamTime[0]);
      condition.examinationEndDate = formatMoment(ecamTime[1]);
    }
    condition.itemId = this.props.currentDataModel.itemId;
    this.props.NewActivationCourseList(condition).payload.promise.then((response) => {
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
  onCancel = () => {
    this.props.viewCallback();
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
  }

  selectChagne = (value) =>{
    var condition = { currentPage: 1, pageSize: 99, courseCategoryStatus: 1, itemId: value, name: '' }
    if(this.props.isMain){
      condition.isMain = 1; //核心科目
    }
    this.props.getCourseCategoryList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if(data.state=='success'){
        this.setState({
          subjectList:data.data
        })
      }else{
        message.error(data.msg)
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
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
              <Option value='courseSourceId'>订单号</Option>
            </Select>
            );
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/statistics/exportActiveCourses'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        extendButtons.push(
          <Button onClick={this.onCancel} icon="rollback">
            返回
          </Button>
        )
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
             
             
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                  <Col span={12}><FormItem
                      {...searchFormItemLayout}
                      label="多条件查询"
                    >
                      {getFieldDecorator('textValue', {
                        initialValue: this.state.pagingSearch.textValue,
                      })(
                        <Input style={{width:270}} addonBefore={prefixSelector}
                        />
                        )}
                    </FormItem>
                    </Col>
                    <Col span={12}></Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'课程来源'}>
                              {getFieldDecorator('courseSourceType', {
                                  initialValue: this.state.pagingSearch.courseSourceType
                              })(
                                <Select>
                                    <Option value=''>全部</Option>
                                    <Option value='1'>订单</Option>
                                    <Option value='2'>公开课</Option>
                                    <Option value='3'>历史数据</Option>
                                  </Select>
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'订单分部'} >
                              {getFieldDecorator('branchId', { initialValue: dataBind(this.state.pagingSearch.branchId) })(
                                <SelectFBOrg scope={'my'} hideAll={false} />
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="订单来源"
                      >
                        {getFieldDecorator('orderSource', { initialValue: dataBind(this.state.pagingSearch.orderSource) })(
                           <Select >
                              <Option value="">全部</Option>
                              {this.state.order_source.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                        )}
                      </FormItem>
                      </Col>
                      <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'订单类型'} >
                              {getFieldDecorator('orderType', { initialValue: dataBind(this.state.pagingSearch.orderType) })(
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
                      <FormItem {...searchFormItemLayout} label={'项目'} >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                          <SelectItem
                            scope={'all'}
                            hideAll={false}
                            onChange={this.selectChagne}
                            onSelectChange={(value) => {
                              this.state.pagingSearch.courseCategoryId = '';
                              this.state.pagingSearch.itemId = value;
                              this.setState({ pagingSearch: this.state.pagingSearch });
                              setTimeout(() => {
                                {/* 重新重置才能绑定这个科目值 */ }
                                this.props.form.resetFields(['courseCategoryId']);
                              }, 500);
                            }} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'科目'} >
                        {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                            // <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} />
                            <Select>
                              {
                                this.state.subjectList.map((item,index)=>{
                                  return<Option value={item.courseCategoryId}>{item.name}</Option>
                                })
                              }
                            </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'是否允许重修'} >
                        {getFieldDecorator('isRehear', { initialValue: this.state.pagingSearch.isRehear })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.dic_YesNo.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'是否赠送'} >
                        {getFieldDecorator('isGive', { initialValue: this.state.pagingSearch.isGive })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.dic_YesNo.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="激活时间">
                            {getFieldDecorator('activeStartTime', { initialValue:[moment(this.state.pagingSearch.activeStartTime,dateFormat),moment(this.state.pagingSearch.activeEndTime,dateFormat)]})(
                                <RangePicker
                                format={dateFormat}
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                                // disabledDate={this.disabledBeginDate}
                                style={{width:200}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="考试时间">
                            {getFieldDecorator('examinationStartDate', { initialValue:''})(
                                <RangePicker
                                format={dateFormat}
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                                // disabledDate={this.disabledBeginDate}
                                style={{width:200}}/>
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
               <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} goBack={true} />
                 </Modal>
              }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
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
    NewActivationCourseList: bindActionCreators(NewActivationCourseList, dispatch),//查询列表 
    getCourseCategoryList: bindActionCreators(getCourseCategoryList, dispatch),//核心科目
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
