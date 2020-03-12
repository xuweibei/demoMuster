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
import { StudentsWhoStartTheProgram,DeferredAuditBatchApply,AlreadyTeachingPointDropdown,DeferredAuditApply } from '@/actions/base';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import FileDownloader from '@/components/FileDownloader';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    TeachingArr:[],
    isShowChooseProduct:false,
    NVisiting:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      faceClassType:'',
      categoryState:'',
      isRestudy:'',
      isAppend:''
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
    this.loadBizDictionary(['dic_YesNo','zb_payee_type','course_category_study_status']); 
    this.onSearch()
    this.DropdownBox()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount","student_course_apply_audit_status");
  }
  
  columns = [
    
    {
      title: '学生教学点',
      fixed: 'left',
      width:150,
      dataIndex: 'teachCenterIdForStudentName',
    },
    {
      title: '学生姓名',
      dataIndex: 'realName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.realName}</a>;
        
      }
    },
    {
      title: '在读高校',
      dataIndex: 'universityName',
    },
    {
      title: '证件号',
      dataIndex: 'certificateNo',
    },
    {
      title: '面授班类型',
      dataIndex: 'faceClassTypeName',
    },
    {
      title: '科目学习状态',
      dataIndex: 'studyStatusName',
    },
    {
      title: '是否首次上课',
      dataIndex: 'isAppend',
    },
    {
      title: '是否重修',
      dataIndex: 'isRestudyName',
    },
    {
      title: '面授总标准学时',
      dataIndex: 'classHour',
    },
    {
      title: '已参加面授课时',
      dataIndex:'attendClassHour',
      fixed: 'right',
      width:120,
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
  DropdownBox = ()=>{
    let condition = {};
    condition.courseplanId = this.props.dataModel.courseplanId;
    this.props.AlreadyTeachingPointDropdown(condition).payload.promise.then((response)=>{
      let data = response.payload.data;
      if(data.state =='success'){
        this.setState({
          TeachingArr:data.data
        })
      }else{
        message.error(data.msg)
      }
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.courseplanId = this.props.dataModel.courseplanId;
    let schoolId = condition.studyUniversityId;
    if(Array.isArray(schoolId) && schoolId[0]){
        condition.studyUniversityId = schoolId[0].id
    }
    this.props.StudentsWhoStartTheProgram(condition).payload.promise.then((response) => {
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
  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:
      let extendButtons = [];
      extendButtons.push(<FileDownloader
        apiUrl={'/edu/courseplan/exportSelectCourseArrangeStudentNewAndOldFor'}//api下载地址
        method={'post'}//提交方式
        options={this.state.pagingSearch}//提交参数
        title={'导出'}
      >
      </FileDownloader>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="课程班名称"
                        >
                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                             <span>
                               {
                                 this.props.dataModel.courseplanName
                               }
                             </span>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="高校:"
                            >
                                    {getFieldDecorator('studyUniversityId', { initialValue: ''})(
                                        <EditableUniversityTagGroup maxTags={1} 
                                        // onChange={(value) => {
                                        //     if (value.length > 0) {
                                        //         let id = value[0].id
                                        //         this.fetchCampusList(id);
                                        //     }
                                        //     else {
                                        //         this.setState({ dic_Campus: [] })
                                        //     }
                                        //     setTimeout(() => {
                                        //         this.props.form.resetFields(['studyCampusId']);
                                        //     }, 500);
                                        // }} 
                                        />
                                    )}
                            </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="学生所属教学点"
                      >
                        {getFieldDecorator('teachCenterIdForStudent', { initialValue: dataBind(this.state.pagingSearch.teachCenterIdForStudentz) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.TeachingArr.map((item, index) => {
                              return <Option value={item.orgId} key={index}>{item.orgName}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                      </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="面授班类型"
                      >
                        {getFieldDecorator('faceClassType', { initialValue: dataBind(this.state.pagingSearch.faceClassType) })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value='1'>大客户方向班</Option>
                            <Option value='2'>大客户精英班</Option>
                            <Option value='3'>中博精英班</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'科目学习状态'} >
                        {getFieldDecorator('categoryState', { initialValue: this.state.pagingSearch.categoryState })(
                          <Select>
                            <Option value="">全部</Option>
                            {
                              this.state.course_category_study_status.map(item=>{
                                return <Option value={item.value}>{item.title}</Option>
                              })
                            }
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'是否重修'} >
                        {getFieldDecorator('isRestudy', { initialValue: this.state.pagingSearch.isRestudy })(
                          <Select>
                            <Option value=''>全部</Option>
                            <Option value='1'>是</Option>
                            <Option value='0'>否</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                         <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'是否首次上课'} >
                        {getFieldDecorator('isAppend', { initialValue: this.state.pagingSearch.isAppend })(
                          <Select>
                            <Option value=''>全部</Option>
                            <Option value='1'>是</Option>
                            <Option value='0'>否</Option>
                          </Select>
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
               <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} goBack={true}  onOff={true}/>
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
    StudentsWhoStartTheProgram: bindActionCreators(StudentsWhoStartTheProgram, dispatch),//查询列表
    AlreadyTeachingPointDropdown: bindActionCreators(AlreadyTeachingPointDropdown, dispatch),//所属教学点下拉框
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
