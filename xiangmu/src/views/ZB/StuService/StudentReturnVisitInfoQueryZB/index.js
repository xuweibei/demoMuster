/*
回访信息查询
2019-1-24
*/
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Radio, DatePicker
} from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind, formatMoment } from '@/utils';

import { returnVisitStudentselectSivitInZb } from '@/actions/stuService';

class StudentReturnVisitInfoQueryZB extends React.Component {
  constructor(props) {
    super(props);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    let timeArr = timestampToTime(new Date().getTime()).split('-');
    let startTimeYear = timeArr[0];
    let startTimeMonth = timeArr[1];
    let startTimeDay = timeArr[2];

    if(parseInt(startTimeMonth) - 2 > 0){
      startTimeMonth = parseInt(startTimeMonth) - 2;
    }else if(parseInt(startTimeMonth) - 2 == 0){
      startTimeMonth = 12;
      startTimeYear = parseInt(startTimeYear) - 1;
    }else{
      startTimeMonth = 11;
      startTimeYear = parseInt(startTimeYear) - 1;
    }

    let day = new Date(startTimeYear,startTimeMonth,0).getDate();
    if( day < parseInt(startTimeDay)){
      startTimeDay = day;
    }

    if(startTimeMonth < 10){
      startTimeMonth = '0'+startTimeMonth;
    }

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        itemId: '',
        startDate:startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
        endDate: ''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['return_visit_type']);

  }
  componentWillUnMount() {
  }

  columns = [
      {
        title: '分部',
        dataIndex: 'branchName',
        fixed: 'left',
        width: 150,
    },
    {
      title: '项目',
      dataIndex: 'itemName',
      width: 120,
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
    },
    {
      title: '回访要点',
      dataIndex: 'remark',
    },
    {
      title: '开始日期',
      width: 120,
      dataIndex: 'startTime',
      render:(text,record)=>{
        return timestampToTime(record.startTime)
      }
    },
    {
      title: '回访学生',
      width: 120,
      dataIndex: 'studentName',
      render: (text, record, index) => {
        return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
            </span>
      }
    },
    {
      title: '手机号',
      width: 120,
      dataIndex: 'mobile',
    },
    {
      title: '回访内容',
      dataIndex: 'returnVisitContent',
    },
    {
      title: '回访方式',
      width: 120,
      dataIndex: 'visitType',
    },
    {
      title: '回访日期',
      width: 120,
      dataIndex: 'returnVisitDate',
      render:(text,record)=>{
        return timestampToTime(record.returnVisitDate)
      }
    },
    {
      title: '回访人',
      fixed: 'right',
      width: 120,
      dataIndex: 'createUserName'
    },
    
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let taskStartTime = condition.taskStartTime;
    let startDate = condition.startDate;
    if(Array.isArray(taskStartTime)){
      condition.taskStartTime = formatMoment(taskStartTime[0])
      condition.taskEndTime = formatMoment(taskStartTime[1])
    }	
    if(Array.isArray(startDate)){
      condition.startDate = formatMoment(startDate[0])
      condition.endDate = formatMoment(startDate[1])
    }		
    this.props.returnVisitStudentselectSivitInZb(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }
  //浏览视图
  onLookView = (op, item, type) => {
    item.visitInfo = type;
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
       this.onSearch();
    } else {
      switch (this.state.editMode) {
        
          case 'Manage':
          default:
            //进入管理页
            this.onSearch();
            this.onLookView("Manage", null);
            break;
      }
    }
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {

      case 'ViewStudentDetail':
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
        
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];

        const prefixSelector = getFieldDecorator('textKey', {
          initialValue: dataBind(this.state.pagingSearch.textKey || 'realName'),
        })(
          <Select style={{ width: 98 }} onChange={this.onCountryChange}>
            <Option value='realName'>学生姓名</Option>
            <Option value='mobile'>手机号</Option>
            <Option value='weixin'>微信号</Option>
            <Option value='qq'>QQ号</Option>
            <Option value='certificateNo'>证件号</Option>
            
          </Select>
          );
        
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'分部'} >
                          {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                            <SelectFBOrg scope='my' hideAll={false} />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  <Row gutter={24}>
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
                              this.state.pagingSearch.itemId = value;
                              this.setState({ pagingSearch: this.state.pagingSearch });
                              setTimeout(() => {
                                  {/* 重新重置才能绑定这个开课批次值 */ }
                                  this.onSearch();
                              }, 500);
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="任务名称"
                        >
                            {getFieldDecorator('returnVisitTaskName', { initialValue: this.state.pagingSearch.returnVisitTaskName })(
                                <Input placeholder='任务名称' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label={'任务开始日期'}
                        >
                            {getFieldDecorator('taskStartTime', { initialValue: this.state.pagingSearch.taskStartTime?[moment(this.state.pagingSearch.taskStartTime,dateFormat),moment(this.state.pagingSearch.taskEndTime,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="回访方式">
                        {getFieldDecorator('visitType', {
                          initialValue: dataBind(this.state.pagingSearch.visitType),
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.return_visit_type.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label={'回访日期'}
                        >
                            {getFieldDecorator('startDate', { initialValue:this.state.pagingSearch.startDate?(this.state.pagingSearch.endDate?[moment(this.state.pagingSearch.startDate, dateFormat),moment(this.state.pagingSearch.endDate, dateFormat)]:[moment(this.state.pagingSearch.startDate, dateFormat)]):''})(
                                <RangePicker style={{width:220}}/>
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
                          <Input style={{width:250}} addonBefore={prefixSelector}
                          />
                          )}
                      </FormItem>
                    </Col>
                    
                  </Row>
                </Form>
              }
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                rowKey={record => record.liveId}//主键
                bordered
                scroll={{ x: 1600 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
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
const WrappedManage = Form.create()(StudentReturnVisitInfoQueryZB);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { orgId } = state.auth.currentUser.userType;
  return { Dictionarys, orgId };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    returnVisitStudentselectSivitInZb: bindActionCreators(returnVisitStudentselectSivitInZb, dispatch),
    
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
