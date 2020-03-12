 
//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button,DatePicker, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item; 

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { timestampToTime } from '@/utils';

//业务接口方法引入 
import { AttendanceRate, ExaminationClass } from '@/actions/base'; 
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';  


class ZStudentStudyView  extends React.Component {

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
      tableWidth:1300,
      OpenData:[],
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        operationType:1,//operationType	true	普通参数	Integer		1、总部操作 2、分部操作
        teachCenterId: '',
        itemId: '',
        courseCategoryId:'',
        teachMode: '',
        state:'',//state	false	普通参数	Integer		学习情况 1、通过;2、学习中;3、终止;5、未学习'
        realName:'',//false	普通参数	String		学生姓名
        courseplanBatchId: '',
        courseName: '',
        finishStatus: '',
        startDate:null,
        endDate:null,
        branchId:'',
        branchName: '',//分部
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
    this.onSearch(); 
  }
  componentWillUnMount() {
  }
 
  //总课时和已上课时
  totalColumns = [
    {
      title: '序号', 
      fixed: 'left',
      width: 120,
      render:(text,record,index)=>{
        return index+1
      }
    },
    {
      title: '科目', 
      dataIndex: 'courseCategoryName'
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
      width: 150,
      dataIndex: 'arrangeDateDetail'
    },
    {
      title: '课时',
      width: 120,
      dataIndex: 'classHour',
    },
    {
      title: '讲师',
      width: 120,
      dataIndex: 'teacherName',
    },
    {
      title: '班型备注',
      width: 120,
      dataIndex: 'classTypeRemark',
    },
    {
      title: '课程阶段',
      width: 120,
      dataIndex: 'periodRemark',
    },
    {
      title: '授课科目备注',
      width: 120,
      dataIndex: 'courseRemark', 
    },
    {
      title: '上课情况',
      width: 120,
      fixed:'right',
      dataIndex: 'currStats'
    }];
    //出勤率
    attendColumns = [
      {
        title: '学生分部',
        dataIndex: 'branchName',
        fixed: 'left',
        width: 120
      },
      {
        title: '学生姓名', 
        dataIndex: '1'
      },
      {
        title: '手机号',
        width: 120,
        dataIndex: '2'
      },
      {
        title: '2018',
        width: 150,
        dataIndex: '3'
      },
      {
        title: '课时',
        width: 120,
        dataIndex: '4',
      },
      {
        title: '讲师',
        width: 120,
        dataIndex: '5',
      },
      {
        title: '班型备注',
        width: 120,
        dataIndex: '6',
      },
      {
        title: '课程阶段',
        width: 120,
        dataIndex: '7',
      },
      {
        title: '授课科目备注',
        width: 120,
        dataIndex: 'studentName', 
      },
      {
        title: '出勤率',
        width: 120,
        fixed:'right',
        dataIndex: 'mobile'
      }];
  

  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    if(this.props.viewSatate == 'total'){
      condition.courseArrangeDetailType = 0;
    }else if(this.props.viewSatate == 'uploaded'){
      condition.courseArrangeDetailType = 1;
    }
    condition.courseArrangeId = this.props.currentDataModel.courseArrangeId;
    if(this.props.viewSatate == 'total' || this.props.viewSatate == 'uploaded'){
      this.props.ExaminationClass(condition).payload.promise.then((response) => {
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
      this.props.AttendanceRate(condition).payload.promise.then((response) => {
        let data = response.payload.data.data;
        console.log(data) 
        let arr = []; 
        data.mapColumn.forEach(item=>{
          arr.push({'title':item.title,'dataIndex':item.value})
        })
        this.attendColumns = arr;
        this.attendColumns[0].fixed = 'left';
        this.attendColumns[0].width = '150';
        this.attendColumns[this.attendColumns.length-1].fixed = 'right';
        this.attendColumns[this.attendColumns.length-1].width = '150'; 
        if (response.payload.data.state === 'success') {
          if(arr.length>5){
            this.setState({
              tableWidth:1800
            })
          }
          this.setState({
            pagingSearch: condition,
            data: data.attendList,
            totalRecord: response.payload.data.totalRecord,
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
      case 'total':
      case 'uploaded':
        return this.totalColumns; 
      case 'attend':
        return  this.attendColumns;
    }
  }
  //渲染，根据模式不同控制不同输出
  render() {
    console.log(this.attendColumns,this.state.data)
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
          {(this.props.viewSatate == 'total'||this.props.viewSatate == 'uploaded')?<ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'l','t')}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}> 
                    {
                      this.props.currentDataModel.teachCenterName
                    }
                  </FormItem>
                </Col>
                <Col span={12}>
                   <FormItem {...searchFormItemLayout} label={'开课批次'}>
                    {
                      this.props.currentDataModel.teachCenterName
                    }
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="科目"
                  >
                  {
                    this.props.currentDataModel.courseCategoryName
                  }
                  </FormItem>
                </Col>
                 <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
                      {
                        this.props.currentDataModel.branchName
                      }
                      </FormItem>
                    </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                  {
                    this.props.currentDataModel.teachCenterName
                  }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="课程班"> 
                  {
                    this.props.currentDataModel.courseplanName
                  }
                  </FormItem>
                </Col>   
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="课程班类型"
                  > 
                  {
                    this.props.currentDataModel.teachClassTypeName 
                  }
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>:this.props.viewSatate == 'attend'?<ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                  {
                    this.props.currentDataModel.itemName   
                  }
                  </FormItem>
                </Col>
                <Col span={12}>
                   <FormItem {...searchFormItemLayout} label={'开课批次'}>
                    {
                      this.props.currentDataModel.courseplanBatchName  
                    }
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="科目"
                  >
                  {
                    this.props.currentDataModel.courseCategoryName 
                  }
                  </FormItem>
                </Col>
                 <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
                      {
                        this.props.currentDataModel.branchName 
                      }
                      </FormItem>
                    </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                  {
                    this.props.currentDataModel.teachCenterName 
                  }
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="课程班">
                  {
                    this.props.currentDataModel.courseplanName 
                  }
                  </FormItem>
                </Col>   
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="讲师"
                  >
                  {
                    this.props.currentDataModel.teacherNames 
                  }
                  </FormItem>
                </Col>
                 <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="总课次"
                  >
                  {
                    this.props.currentDataModel.generalLesson 
                  }
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="总课时"
                  >
                  {
                    this.props.currentDataModel.classHour 
                  }
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="课程班出勤率"
                  >
                  {
                    this.props.currentDataModel.attenceRate 
                  }
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
                   scroll={{ x: this.state.tableWidth }}
            />
            <div className="space-default"></div> 
            <Button onClick={this.onCancel} icon="rollback">返回</Button>
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex"> 
                <Col span={24} className='search-paging-control'>
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
const WrappedCourseManage = Form.create()(ZStudentStudyView);

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
    AttendanceRate: bindActionCreators(AttendanceRate, dispatch), 
    //总课次和已上课次查询
    ExaminationClass: bindActionCreators(ExaminationClass, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
