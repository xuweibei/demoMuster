 
//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button,DatePicker, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { timestampToTime,formatMoment } from '@/utils';

//业务接口方法引入 
import { AttendanceDetailsList,getTeachCenterByBranchId,TeachingPointCourse } from '@/actions/base';
import { getCoursePlanBatchByItemId  } from '@/actions/course';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch'; 
import FileDownloader from '@/components/FileDownloader';
import EditableTeacher from '@/components/EditableTeacher'; 
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';



class ZStudentStudyInfo  extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      teacherInfo:[],
      CourseClass:[],
      teachArr:[], 
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10, 
        itemId: '',
        courseplanBatchId:'',
        courseCategoryId: '',
        branchId:'', 
        teachCenterId:'', 
        courseplanName: '',
        startDate: '',
        endDate: '',
        attendStatus:'',
        studentName:'',
        teacherName:'', 
        courseArrangeId:''
      }, 
      data: [],
      totalRecord: 0,
      loading: false,

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode','attend_status']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    // this.onSearch(); 
  }
  componentWillUnMount() {
  } 
  //table 输出列定义
  columns = [
    {
      title: '分部',
      dataIndex: 'branchName',
      fixed: 'left',
      width: 120
    },
    {
      title: '教学点', 
      dataIndex: 'teachCenterName'
    },
    {
      title: '课程班', 
      dataIndex: 'coursePlanName'
    },
    {
      title: '课程班类型',
      width: 150,
      dataIndex: 'classTypeName'
    },
    {
      title: '科目',
      width: 120,
      dataIndex: 'courseCategoryName',
    },
    {
      title: '上课日期',
      width: 120,
      dataIndex: 'courseDate',
      render:(text,record)=>{
        return timestampToTime(record.courseDate)
      }
    },
    {
      title: '上课时段',
      width: 120,
      dataIndex: 'classTime',
    },
    {
      title: '教师',
      width: 120,
      dataIndex: 'teacherName',
    },
    {
      title: '学生姓名',
      width: 120,
      dataIndex: 'studentName', 
    },
    {
      title: '手机号',
      width: 120,
      dataIndex: 'mobile'
    },  
    {
      title: '考勤情况',
      width: 120,
      fixed:'right',
      dataIndex: 'attendStutesName', 
    
    }];


  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let dataMode = condition.startDate;
    if(Array.isArray(dataMode)){
      condition.startDate = formatMoment(dataMode[0])
      condition.endDate = formatMoment(dataMode[1])
    }
    condition.isBranch = 1;
    condition.isExport = 1;
    if(this.state.CourseClass[0]){
      this.state.CourseClass.forEach(item=>{ 
        if(item.courseArrangeId == condition.courseplanName){
          condition.courseplanName = item.courseplanName;
        }
      })
    }  
    let onOff = false; 
    let Id = '';
    let all = condition.teacherId;
    if(Array.isArray(all) && all[0]){ 
      condition.teacherName = all[0].name; 
      Id = all[0].id;
      onOff = true; 
    }else if(Array.isArray(all)){ 
        condition.teacherName = '' 
    }
    this.props.AttendanceDetailsList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') { 
        let { teacherInfo } = this.state;
        if(onOff){
          teacherInfo.push({
              id:Id,
              name: condition.teacherName
          }) 
        } 
        this.setState({
          pagingSearch: condition,
          data: data.data,
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
  onSelectChange = (value)=>{ 
    this.props.getTeachCenterByBranchId({branchId:value}).payload.promise.then((response) => {
      let data = response.payload.data; 
      if(data.state == 'success'){
        this.setState({
          teachArr:data.data,
        })
        this.onSelectChangeT()
      }else{
        message.error(data.msg)
      } 
      this.setState({ 
        CourseClass:[]
      })
      this.props.form.resetFields(['teachCenterId']);
      this.props.form.resetFields(['courseplanName']);
    })
  } 
  Export = ()=>{
    this.state.pagingSearch.isExport = 2;
    return this.state.pagingSearch
  }


  //教学点=》课程班改变
  onSelectChangeT = (value) =>{  
    let condition = {};
    condition.teachCenterId = value || ''
    this.props.TeachingPointCourse(condition).payload.promise.then((response) => {
        let data = response.payload.data; 
        if(data.state=='success'){
          let { pagingSearch } = this.state;
          pagingSearch.courseplanName = ''
            this.setState({
                CourseClass:data.data,
                pagingSearch  
            })
            this.props.form.resetFields(['courseplanName']); 
        }else{
            message.error(data.msg)
        }
    })
  }




  //渲染，根据模式不同控制不同输出
  render() {

    const { getFieldDecorator } = this.props.form; 
    let block_content = <div></div>
    switch (this.state.editMode) { 
      case "Manage":
      default:
        //除查询外，其他扩展按钮数组
        let extendButtons = [];

        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    {getFieldDecorator('itemId', {
                      initialValue: this.state.pagingSearch.itemId
                    })(
                      <SelectItem
                        scope={'my'}
                        hideAll={true}
                        hidePleaseSelect={true}
                        isFirstSelected={true}
                        onSelectChange={(value) => {
                          this.state.pagingSearch.courseplanBatchId = '';
                          this.state.pagingSearch.itemId = value;
                          this.setState({ pagingSearch: this.state.pagingSearch });
                          setTimeout(() => {
                              {/* 重新重置才能绑定这个科目值 */ }
                              this.props.form.resetFields(['courseplanBatchId']);
                          }, 1000);
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'开课批次'} >
                        {getFieldDecorator('courseplanBatchId', {
                            initialValue: this.state.pagingSearch.courseplanBatchId
                        })(
                            <SelectItemCoursePlanBatch hideAll={true} isFirstSelected={true}
                                itemId={this.state.pagingSearch.itemId}
                                onSelectChange={(value, selectedOptions) => {

                                    this.state.pagingSearch.courseplanBatchId = value;
                                    let currentCoursePlanBatch = selectedOptions;
                                    this.setState({ pagingSearch: this.state.pagingSearch, currentCoursePlanBatch });
                                    // this.onSearch();

                                }}
                            />
                        )}
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="科目"
                  >
                    {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                      <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                    )}
                  </FormItem>
                </Col>
                 <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
                        {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.orgId })(
                          <SelectFBOrg onSelectChange = {this.onSelectChange} scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                   {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(

                     <Select
                       showSearch
                       onChange = {this.onSelectChangeT}
                       filterOption={(inputValue, option) => { 
                        var result = false;
                        for(var i = 0; i < option.props.children.length; i++){ 
                          if(option.props.children.indexOf(inputValue) != -1){ 
                            result = true;
                            break;
                          }
                        }
                        return result; 
                      }}
                     >
                        <Select.Option value=''>全部</Select.Option>
                        {
                          this.state.teachArr.map(item=>{
                            return <Select.Option value={item.orgId} key={item.orgId}>{item.orgName}</Select.Option>
                          })
                        }
                     </Select> 
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="课程班">
                    {getFieldDecorator('courseplanName', { initialValue: this.state.pagingSearch.courseplanName })(
                      <Select
                          showSearch
                          filterOption={(inputValue, option) => { 
                          var result = false;
                          for(var i = 0; i < option.props.children.length; i++){
                            if(option.props.children.indexOf(inputValue) != -1){
                              result = true;
                              break;
                            }
                          }
                          return result; 
                        }}
                      >
                        <Select.Option value="">全部</Select.Option>
                        {this.state.CourseClass.map((item, index) => {
                          return <Select.Option value={item.courseArrangeId} key={index}>{item.courseplanName}</Select.Option>
                        })} 
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="上课日期">
                            {getFieldDecorator('startDate', { initialValue:this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                  </Col>
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'考勤情况'} > 
                            {getFieldDecorator('attendStatus', { initialValue:this.state.pagingSearch.attendStatus})(
                                <Select>
                                    <Option value=''>全部</Option>
                                    {this.state.attend_status.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                      </FormItem>
                  </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="学生姓名"
                  >
                    {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                      <Input placeholder='请输入学生姓名'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'教师'} >
                    {getFieldDecorator('teacherId', { 
                        initialValue: 
                        (!this.state.teacherInfo.length ? [] : [{
                            id: this.state.teacherInfo[0].id,
                            name: this.state.teacherInfo[0].name
                          }]) 
                          })(
                      <EditableTeacher  maxTags={1} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 1500 }}
            />
            <div className="space-default"></div>
            
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={2}> 
                  <FileDownloader
                    apiUrl={'/edu/courseArrangeDetailAttendance/exportAttendDetail'}//api下载地址
                    method={'post'}//提交方式
                    options={this.Export()}//提交参数
                    title={'导出'}
                  >
                  </FileDownloader> 
                </Col>
                <Col span={22} className='search-paging-control'>
                  <Pagination showSizeChanger
                        current={this.state.pagingSearch.currentPage} 
                        onShowSizeChange = {this.onShowSizeChange} 
                        pageSizeOptions = {['10','20','30','50','100','200']}
                        onChange={this.onPageIndexChange}    
                        showTotal={(total) => { return `共${total}条数据`; }}
                        total={this.state.totalRecord} />
                </Col>
              </Row>
            </div>
          </div>
        </div>);
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(ZStudentStudyInfo);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    AttendanceDetailsList: bindActionCreators(AttendanceDetailsList, dispatch),
    //分部下教学点
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch), 
    //教学点下课程班
    TeachingPointCourse: bindActionCreators(TeachingPointCourse, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
