
/**
 * 总部-学服学务-申请重听审核
 */
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
 
import {
  message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
  Pagination, Divider, Modal, Card,
  Checkbox, InputNumber
} from 'antd';
import { env } from '@/api/env';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import moment from 'moment'; 
//操作按钮
import DropDownButton from '@/components/DropDownButton';
import View from './view';
import Examine from './examine';

import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
const FormItem = Form.Item;
const { RangePicker } = DatePicker; 
const dateFormat = 'YYYY-MM-DD'; 

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout24, searchFormItemLayout,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { ApplicationAuditionAardHearing, courseActiveOperationCourseActive, courseActiveOperationCourseCancelActive, courseActiveOperationCourseUpdateEndTime } from '@/actions/course'; 

class CourseActiveManage extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this); 
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = {
      isShowChooseProduct:false, 
      //currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete 
      pagingSearch: {
        currentPage: 1,
        pageSize: env.defaultPageSize
      },
      data_list: [],
      totalRecord: 0,
      loading: false, 
    };
  }
  componentWillMount() {
    //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
    this.loadBizDictionary([ 'again_audit_status' ]);
    //首次进入搜索，加载服务端字典项内容
    this.onSearch();
  }


  //table 输出列定义
  columns = [{
    title: '科目',
    dataIndex: 'courseCategoryName',
    fixed: 'left',
    width: 160,
    render: (text, record, index) => {
      return <div>{text}</div>
    }
  },
  {
    title: '姓名',
    width: 120,
    dataIndex: 'studentName',
    render: (text, record, index) => {
      return <a onClick={() => {
        this.onStudentView(record)
      }}>{record.studentName}</a>;
      
    }
  },
  {
    title: '用户名',
    width: 120,
    dataIndex: 'loginName',
  },
  {
    title: '学生属性',
    width: 120,
    dataIndex: 'studentSourse',
    render:(text,record)=>{
      return record.studentSourse?record.studentSourse==1?'新生':'老生':''
    }
  },
  {
    title: '分数',
    width: 120,
    dataIndex: 'score', 
  },
  {
    title: '考试状态',
    width: 120,
    dataIndex: 'examState',
  },
  {
    title: '附件',
    width: 120,
    dataIndex: 'scoreFile',
    render: (text,record) => {
        if(record.scoreFile!=null && record.scoreFile != ''){
            return <FileDownloader
                apiUrl={'/edu/file/getFile'}//api下载地址
                method={'post'}//提交方式
                options={{ filePath: record.scoreFile }}//提交参数
                title={'附件'}
            >
            </FileDownloader>
        }else{
            return '';
        }
    }
  },
  {
    title: '考试时间',
    width: 120,
    dataIndex: 'examDate',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '下次考试时间',
    width: 120,
    dataIndex: 'examNextDate',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '课程名称', 
    dataIndex: 'courseName',
  },
  {
    title: '延长天数',
    width: 120,
    dataIndex: 'applyDays',
  },
  {
    title: '发送次数',
    width:80,
    dataIndex: 'sendNum'
  },
  {
    title: '申请日期',
    width: 120,
    dataIndex: 'createDate',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '审核日期',
    width: 120,
    dataIndex: 'auditDate',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '审核状态',
    width: 120,
    dataIndex: 'auditStatus',
    render:(text,record)=>{
      return getDictionaryTitle(this.state.again_audit_status,record.auditStatus)
    }
  },
  {
    title: '操作',
    width: 120,//可预知的数据长度，请设定固定宽度
    fixed: 'right',
    key: 'action',
    render: (text, record) => {
      return <DropDownButton>
        {(record.auditStatus == 2 || record.auditStatus == 3)&&
        <Button onClick={() => {
            this.onLookView('Send',record)
          }}>发送信息</Button>
        }
        {record.auditStatus == 1 &&
          <Button onClick={() => {
            this.onLookView('Examine',record)
          }}>审核</Button>
        } 
        <Button onClick={() => {
          this.onLookView('View',record)
        }}>查看</Button>
      </DropDownButton>
    }
  }];
  //获取条件列表
  fetch(params) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let applyDateStart = condition.applyDateStart;
    let auditDateStart = condition.auditDateStart;
    if(applyDateStart){
      condition.applyDateStart = formatMoment(applyDateStart[0]);
      condition.applyDateEnd = formatMoment(applyDateStart[1]);
    }
    if(auditDateStart){
      condition.auditDateStart = formatMoment(auditDateStart[0]);
      condition.auditDateEnd = formatMoment(auditDateStart[1]);
    }
    this.props.ApplicationAuditionAardHearing(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') { 
        this.setState({
          pagingSearch: condition,
          data_list: data.data.pageResult,
          totalRecord: data.data.totalRecord,
          loading: false,
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  };  
  
  onStudentView = (record) => {
    this.onLookView("Manage", record)
    this.setState({
      isShowChooseProduct:true
    })
  }
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
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
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case "Edit": //提交
          this.props.updateParterContractInfo(dataModel).payload.promise.then((response) => {
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
          //提交
          break;
          case 'Send':
          case 'Examine':
          this.onSearch();
          //进入管理页
          this.onLookView("Manage", null);

      }
    }
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Send':
      case 'View': 
        block_content = <View viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case "Examine":
        block_content = <Examine viewCallback={this.onViewCallback}
          {...this.state}
        /> 
        break;
      case "Manage":
      default:
        const { getFieldDecorator } = this.props.form;
        const prefixSelector = getFieldDecorator('qryKey', {
          initialValue: dataBind(this.state.pagingSearch.qryKey || 'cu.real_name'),
        })(
          <Select style={{ width: 86 }} onChange={this.onCountryChange}>
            <Option value='cu.real_name'>用户名</Option>
            <Option value='su.real_name'>姓名</Option>
            <Option value='su.mobile'>手机号</Option>
            <Option value='stu.qq'>QQ</Option>
            <Option value='stu.weixin'>微信号</Option>
          </Select>
          );
        let extendButtons = []; 
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}><FormItem
                      {...searchFormItemLayout}
                      label="多条件查询"
                    >
                      {getFieldDecorator('qryValue', {
                        initialValue: this.state.pagingSearch.qryValue,
                      })(
                        <Input addonBefore={prefixSelector}
                        />
                        )}
                    </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="审核状态">
                        {getFieldDecorator('state', {
                          initialValue: this.state.pagingSearch.state || ''
                        })(
                          <Select >
                            <Option value="">全部</Option> 
                            {
                              this.state.again_audit_status.map(item=>{
                                return <Option value={item.value}>{item.title}</Option>
                              })
                            } 
                          </Select>
                          )}
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="学生属性">
                        {getFieldDecorator('studentSourse', {
                          initialValue: this.state.pagingSearch.studentSourse || ''
                        })(
                          <Select >
                            <Option value="">全部</Option>  
                            <Option value="1">新生</Option>  
                            <Option value="2">老生</Option>  
                          </Select>
                          )}
                      </FormItem>
                    </Col> 
                    <Col span={12}>
                       <FormItem
                            {...searchFormItemLayout}
                            label="申请日期">
                            {getFieldDecorator('applyDateStart', { initialValue: this.state.pagingSearch.applyDateStart?[moment(this.state.pagingSearch.applyDateStart,dateFormat),moment(this.state.pagingSearch.applyDateEnd,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={12}>
                       <FormItem
                            {...searchFormItemLayout}
                            label="审核日期">
                            {getFieldDecorator('auditDateStart', { initialValue: this.state.pagingSearch.auditDateStart?[moment(this.state.pagingSearch.auditDateStart,dateFormat),moment(this.state.pagingSearch.auditDateEnd,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
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
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                rowKey={record => record.partnerContractId}//主键
                scroll={{ x: 2100 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      
                      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}

//表单组件 封装
const WrappedManage = Form.create()(CourseActiveManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    ApplicationAuditionAardHearing: bindActionCreators(ApplicationAuditionAardHearing, dispatch),
    courseActiveOperationCourseActive: bindActionCreators(courseActiveOperationCourseActive, dispatch),
    courseActiveOperationCourseCancelActive: bindActionCreators(courseActiveOperationCourseCancelActive, dispatch),
    courseActiveOperationCourseUpdateEndTime: bindActionCreators(courseActiveOperationCourseUpdateEndTime, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
