 
//标准组件环境
import React from 'react'; <span className="ai-anchor"></span>
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button,DatePicker, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item; 

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
 

//业务接口方法引入 
import { AttendanceStatisticsList,getTeachCenterByBranchId,TeachingPointCourseFB } from '@/actions/base'; 
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch'; 
import FileDownloader from '@/components/FileDownloader';
import EditableTeacher from '@/components/EditableTeacher';  
import StudentStudyView from './speview';
import ZStudentStudyView from './view'; 



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
      teachArr:[],
      CourseClass:[],
      viewSatate:'', 
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10, 
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
        courseplanName: '',
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
    this.onSelectChange()
  }
  componentWillUnMount() {
  }
 
  //table 输出列定义
  columns = [
    {
      title: '教学点',
      dataIndex: 'teachCenterName',
      fixed: 'left',
      width: 120
    },
    {
      title: '课程班', 
      dataIndex: 'courseplanName'
    },
    {
      title: '科目',
      width: 100,
      dataIndex: 'courseCategoryName'
    },
    {
      title: '教师',
      width: 150,
      dataIndex: 'teacherNames'
    },
    {
      title: '总课次',
      width: 100,
      dataIndex: 'generalLesson',  
      render: (text, record, index) => {
        if(record.generalLesson == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('View', record,'total')
        }}>{record.generalLesson}</a>;
      }
    },
    {
      title: '学生总数',
      width: 100,
      dataIndex: 'generalStudent',
      render: (text, record, index) => {
        if(record.generalStudent == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'students')
        }}>{record.generalStudent}</a>;
      }
    },
    {
      title: '延期学生数',
      width: 100,
      dataIndex: 'delayStudent',
      render: (text, record, index) => {
        if(record.delayStudent == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'delay')
        }}>{record.delayStudent}</a>;
      }
    },
    {
      title: '终止学生数',
      width: 100,
      dataIndex: 'stopStudent',
      render: (text, record, index) => {
        if(record.stopStudent == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'termination')
        }}>{record.stopStudent}</a>;
      }
    },
    {
      title: '正常上课学生数',
      width: 100,
      dataIndex: 'normalStudent', 
      render: (text, record, index) => {
        if(record.normalStudent == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'normal')
        }}>{record.normalStudent}</a>;
      }
    },
    {
      title: '已上课次',
      width: 100,
      dataIndex: 'lessoned',
      render: (text, record, index) => {
        if(record.lessoned == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('View', record,'uploaded')
        }}>{record.lessoned}</a>;
      }
    },  
    {
      title: '正常出勤数',
      width: 100,
      dataIndex: 'normalAttence',
      render: (text, record, index) => {
        if(record.normalAttence == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'attendance')
        }}>{record.normalAttence}</a>;
      }
    },  
    {
      title: '请假数',
      width: 100,
      dataIndex: 'leaveAttence',
      render: (text, record, index) => {
        if(record.leaveAttence == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'leave')
        }}>{record.leaveAttence}</a>;
      }
    },  
    {
      title: '旷课数',
      width: 100,
      dataIndex: 'absentAttence',
      render: (text, record, index) => {
        if(record.absentAttence == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'truancy')
        }}>{record.absentAttence}</a>;
      }
    },  
    {
      title: '迟到数',
      width: 100,
      dataIndex: 'lateAttence',
      render: (text, record, index) => {
        if(record.lateAttence == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'late')
        }}>{record.lateAttence}</a>;
      }
    },  
    {
      title: '未录入考勤数',
      width: 100,
      dataIndex: 'notAttence',
      render: (text, record, index) => {
        if(record.notAttence == 0 )return 0;
        return <a onClick={() => {
          this.onLookView('SpeView', record,'entry')
        }}>{record.notAttence}</a>;
      }
    },  
    {
      title: '出勤率',
      width: 100,
      fixed:'right',
      dataIndex: 'attenceRate',
      render: (text, record, index) => {
        let zheng = /^[0-9]+(.[0]{2})?$/
        if(record.attenceRate && zheng.test(record.attenceRate) && record.attenceRate != '0.00'  )
        {return<a onClick={() => {
          this.onLookView('View', record,'attend')
        }}>{record.attenceRate.replace('.00','%')}</a>}else if(record.attenceRate == '0.00'){
          return '0%'
        } else{
          return <a onClick={() => {
            this.onLookView('View', record,'attend')
          }}>{record.attenceRate}%</a>;
        }
      }
    
    }];


  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    let onOff = false;
    if(Array.isArray(condition.teacherId)&&condition.teacherId[0]){
      condition.teacherName =  condition.teacherId[0].name;
      condition.teacherId = condition.teacherId[0].id
      onOff = true;
    }else{
      condition.teacherName = ''
    }
    condition.branchId = this.props.branchId;
    this.props.AttendanceStatisticsList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var teacherInfo = []; 
        if(onOff){
          teacherInfo.push({
              id: condition.teacherId,
              name: condition.teacherName
          }) 
        }
        this.setState({
          pagingSearch: condition,
          data: data.data,
          totalRecord: data.totalRecord,
          loading: false,
          teacherInfo
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  } 

  onLookView = (op, item,view) => { 
      this.setState({
          editMode: op,//编辑模式
          currentDataModel: item,//编辑对象
          viewSatate:view
      });
  };
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case "Student":
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Create":
        case "Edit": //提交
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Import":
          this.onSearch();
          this.onLookView("Manage", null);
          //提交
          break;

      }
    }
  }
  
  onSelectChange = (value)=>{ 
    this.props.getTeachCenterByBranchId({branchId:this.props.branchId}).payload.promise.then((response) => {
      let data = response.payload.data; 
      if(data.state == 'success'){
        this.setState({
          teachArr:data.data,
        })
        // this.onSelectChangeT()
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
  //教学点变化
  onSelectChangeT = (value) =>{  
    let condition = {};
    condition.teachCenterId = value || ''
    this.props.TeachingPointCourseFB(condition).payload.promise.then((response) => {
        let data = response.payload.data; 
        if(data.state=='success'){
          let { pagingSearch } = this.state;
          pagingSearch.courseArrangeId = ''
            this.setState({
                CourseClass:data.data,
                pagingSearch  
            })
            this.props.form.resetFields(['courseArrangeId']); 
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
      case 'View':
        block_content = <ZStudentStudyView viewCallback={this.onViewCallback} {...this.state}/>
        break;
      case 'SpeView':
        block_content = <StudentStudyView viewCallback={this.onViewCallback} {...this.state}/>
        break;
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
                                    this.onSearch();

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
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                   {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(

                     <Select
                       onChange = {this.onSelectChangeT}
                     >
                        <Select.Option value=''>全部</Select.Option>
                        {
                          this.state.teachArr.map(item=>{
                            return <Select.Option value={item.orgId} key={item.orgId}>{item.orgName}</Select.Option>
                          })
                        }
                     </Select>
                      //  <SelectTeachCenterByUser onSelectChange = {this.onSelectChangeT}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="课程班">
                    {getFieldDecorator('courseArrangeId', { initialValue: this.state.pagingSearch.courseArrangeId })(
                      <Select>
                        <Select.Option value="">全部</Select.Option>
                        {this.state.CourseClass.map((item, index) => {
                          return <Select.Option value={item.courseArrangeId} key={index}>{item.courseplanName}</Select.Option>
                        })} 
                      </Select>
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
                   scroll={{ x: 1800 }}
            />
            <div className="space-default"></div>
            
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={2}> 
                  <FileDownloader
                    apiUrl={'/edu/courseAttendReport/exportCourseAttendReport'}//api下载地址
                    method={'post'}//提交方式
                    options={this.state.pagingSearch}//提交参数
                    title={'导出'}
                  >
                  </FileDownloader> 
                </Col>
                <Col span={22} className='search-paging-control'>
                  <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage} 
                      onShowSizeChange = {this.onShowSizeChange} 
                      showTotal={(total) => { return `共${total}条数据`; }} 
                      pageSizeOptions = {['10','20','30','50','100','200']}
                      onChange={this.onPageIndexChange} 
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
  let branchId = state.auth.currentUser.userType.orgId
  return { Dictionarys,branchId };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    AttendanceStatisticsList: bindActionCreators(AttendanceStatisticsList, dispatch),
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch), 
    //教学点下课程班
    TeachingPointCourseFB: bindActionCreators(TeachingPointCourseFB, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
