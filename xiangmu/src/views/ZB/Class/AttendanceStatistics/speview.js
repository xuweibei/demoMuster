 
//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
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
import { timestampToTime,dataBind,formatMoment } from '@/utils';

//业务接口方法引入 
import { AttendanceNumber,StudentAttendance } from '@/actions/base'; 
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox'; 
import FileDownloader from '@/components/FileDownloader'; 



class speStudentStudyView  extends React.Component {

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
      OpenData:[],
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        attendStatus:'',//operationType	true	普通参数	Integer		1、总部操作 2、分部操作
        studentName: '',
        teacherName: '',
        startDate:'',
        endDate: '',
        finishStatus:''
      }, 
      data: [],
      totalRecord: 0,
      loading: false,

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode','attend_status','attend_status']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
   
    
    if(this.props.viewSatate == 'students' ||this.props.viewSatate == 'delay' ||this.props.viewSatate == 'termination' ||this.props.viewSatate == 'normal'  ){
      this.studentNumber();
    }else{
      this.CheckWork();
    }
     
  } 
 
  //学生总数	延期学生数	中止学生数	正常上课学生数
  stundetColumns = [
    {
      title: '分部',
      dataIndex: 'branchName',
      fixed: 'left',
      width: 120
    },
    {
      title: '教学点', 
      width:120,
      dataIndex: 'teachCenterName'
    },
    {
      title: '课程班',
      width: 120,
      dataIndex: 'courseplanName'
    },
    {
      title: '科目',
      width: 150,
      dataIndex: 'courseCategoryName'
    },
    {
      title: '开课时段', 
      dataIndex: 'arrangeDateDetail',
    },
    {
      title: '总课次',
      width: 120,
      dataIndex: 'courseNum',
    },
    {
      title: '学生姓名',
      width: 120,
      dataIndex: 'studentName',
    },
    {
      title: '手机号',
      width: 120,
      dataIndex: 'mobile',
    },
    {
      title: '班型',
      width: 120,
      dataIndex: 'classTypeName', 
    },
    {
      title: '已上课次数',
      width: 120,
      dataIndex: 'lessoned'
    },
    {
      title: '已面授课时',
      width: 120,
      dataIndex: 'classHoured'
    },
    {
      title: '状态',
      width: 120,
      fixed:'right',
      dataIndex: 'finishStatusName'
    }
  ];
  //正常出勤数	请假数	旷课数	迟到数	未录入考勤数	
    thingColumns = [
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
        width: 120,
        dataIndex: 'courseplanName'
      },
      {
        title: '课程班类型',
        width: 150,
        dataIndex: 'teachClassTypeName'
      },
      {
        title: '科目',
        width: 120,
        dataIndex: 'courseCategoryName',
      },
      {
        title: '上课日期',
        width: 120,
        dataIndex: 'arrangeDate',
        render:(text,record)=>{
          return timestampToTime(record.arrangeDate)
        }
      },
      {
        title: '上课时段', 
        dataIndex: 'arrangeDateDetail',
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
        dataIndex: 'attendStatusName'
      }
    ];
  //一开始进来时的考勤类查询
  CheckWork = (value) => {
    var condition = value || {};
    switch(this.props.viewSatate){
      case 'attendance':
        condition.attendStatus = 1;
        break;
      case 'leave':
        condition.attendStatus = 2;
        break;
      case 'truancy':
        condition.attendStatus = 3;
        break; 
      case 'late':
      condition.attendStatus = 4;
      break;
      case 'entry':
      condition.attendStatus = 5;
      break;
    } 
    this.setState({ loading: true });
    condition.courseArrangeId = this.props.currentDataModel.courseArrangeId;
    this.props.StudentAttendance(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
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

  //一开始进来时的学生数类查询
  studentNumber = () => {
    var condition = {};
    switch(this.props.viewSatate){
      case 'delay':
        condition.finishStatus = 2;
        break;
      case 'termination':
        condition.finishStatus = 3;
        break;
      case 'normal':
        condition.finishStatus = 1;
        break;
      default:
      condition.finishStatus = '';
    }
    this.setState({ loading: true });
    condition.courseArrangeId = this.props.currentDataModel.courseArrangeId;
    this.props.AttendanceNumber(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
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
  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    let sDate = condition.startDate;
    if(Array.isArray(sDate)){
      condition.startDate = formatMoment(sDate[0])
      condition.endDate = formatMoment(sDate[1])
    }
    console.log(condition)
    if(this.props.viewSatate == 'students' ||this.props.viewSatate == 'delay' ||this.props.viewSatate == 'termination' ||this.props.viewSatate == 'normal'  ){
      condition.courseArrangeId = this.props.currentDataModel.courseArrangeId;
      this.props.AttendanceNumber(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
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
    }else{ 
      condition.courseArrangeId = this.props.currentDataModel.courseArrangeId;
      this.props.StudentAttendance(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
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
  } 

  onCancel = () => {
      this.props.viewCallback();
  }
  columnsChoose = () => {
    switch(this.props.viewSatate){
      case 'students':
      case 'delay':
      case 'termination':
      case 'normal': 
        return this.stundetColumns; 
      case 'attendance':
      case 'leave':
      case 'truancy':
      case 'late':
      case 'entry': 
        return  this.thingColumns;
    }
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
          {/*总课次*/}
          {(this.props.viewSatate == 'students'||this.props.viewSatate == 'delay'||this.props.viewSatate == 'termination'||this.props.viewSatate == 'normal')?<ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons()}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}> 
                    { this.props.currentDataModel.itemName }
                  </FormItem>
                </Col>
                <Col span={12}>
                   <FormItem {...searchFormItemLayout} label={'开课批次'}>
                    { this.props.currentDataModel.courseplanBatchName  }
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="科目"
                  >
                  { this.props.currentDataModel.courseCategoryName }
                  </FormItem>
                </Col>
                 <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
                       { this.props.currentDataModel.branchName }
                      </FormItem>
                    </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                    { this.props.currentDataModel.teachCenterName }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="课程班">
                    { this.props.currentDataModel.courseplanName }
                  </FormItem>
                </Col>   
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="状态">
                    {getFieldDecorator('finishStatus', { initialValue:dataBind(this.state.pagingSearch.finishStatus) })(
                      <Select> 
                        <Option value="">全部</Option> 
                        <Option value="1">正常</Option> 
                        <Option value="2">延期</Option> 
                        <Option value="3">终止</Option> 
                      </Select>
                    )}
                  </FormItem>
                </Col>   
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="学生姓名">
                    {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                      <Input />
                    )}
                  </FormItem>
                </Col>   
              </Row>
            </Form>
            }
          </ContentBox>:(this.props.viewSatate == 'attendance'||this.props.viewSatate == 'leave'||this.props.viewSatate == 'truancy'||this.props.viewSatate == 'entry'||this.props.viewSatate == 'late')?<ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    { this.props.currentDataModel.itemName }
                  </FormItem>
                </Col>
                <Col span={12}>
                   <FormItem {...searchFormItemLayout} label={'开课批次'}>
                    { this.props.currentDataModel.courseplanBatchName  }
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="科目"
                  >
                  { this.props.currentDataModel.courseCategoryName }
                  </FormItem>
                </Col>
                 <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
                         { this.props.currentDataModel.branchName }
                      </FormItem>
                    </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                  { this.props.currentDataModel.teachCenterName }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="课程班">
                    { this.props.currentDataModel.courseplanName }
                  </FormItem>
                </Col>   
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="上课日期"
                  >  
                    {getFieldDecorator('startDate', { initialValue: this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]:[] })(
                        <RangePicker style={{width:220}}/>
                    )}
                  </FormItem>
                </Col>
                 <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="考勤情况"
                  >
                  {getFieldDecorator('attendStatus', { initialValue: dataBind(this.state.pagingSearch.attendStatus) })(
                      <Select>
                        <Option value="">全部</Option>
                        {this.state.attend_status.map((item, index) => { 
                          if(item.title == '未考勤')item.title = '未录入'
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
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教师"
                  >
                  {getFieldDecorator('teacherName', { initialValue: this.state.pagingSearch.teacherNames })(
                     <Input placeholder='请输入学生姓名'/>
                   )}
                  </FormItem>
                </Col> 
              </Row>
            </Form>
            }
          </ContentBox>:''}
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columnsChoose()} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 1600 }}
            />
            <div className="space-default"></div> 
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex"> 
                <Col span={3}>
                    <Button onClick={this.onCancel} icon="rollback" style={{marginRight:'16px'}}>返回</Button>
                </Col> 
                <Col span={2}>
                  {
                    (this.props.viewSatate == 'attendance'||this.props.viewSatate == 'leave'||this.props.viewSatate == 'truancy'||this.props.viewSatate == 'entry'||this.props.viewSatate == 'late')?
                    <FileDownloader
                            apiUrl={'/edu/courseAttendReport/exportCourseArrangeAttendById'}//api下载地址
                            method={'post'}//提交方式
                            options={this.state.pagingSearch}//提交参数
                            title={'导出'}
                          >
                    </FileDownloader> :''
                  }
                </Col>
                <Col span={19} className='search-paging-control'>
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
const WrappedCourseManage = Form.create()(speStudentStudyView);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //学生数
    AttendanceNumber: bindActionCreators(AttendanceNumber, dispatch), 
    //考勤
    StudentAttendance: bindActionCreators(StudentAttendance, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
