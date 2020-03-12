/*
课程班成绩管理
2019-1-22
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom'
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Radio,DatePicker
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
const confirm = Modal.confirm;
const { RangePicker } = DatePicker; 

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
 

import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import { TeachingPointCourseFB } from '@/actions/base'; 
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney,formatMoment, dataBind } from '@/utils';
 
import { TwoDimensionalBatchExport,TwoDimensionalList } from '@/actions/base';

import LookDetail from './detail'; 

class CourseClassGradeManage extends React.Component {
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

    this.state = {
      CourseClass:[],
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        itemId: '',
        courseCategoryId:'',
        courseplanBatchId: '',
        courseArrangeName: '',
        teacher: '',
        teachCenterId: '',
        dateStart:'',
        dateEnd:''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['teach_class_type', 'courseplan_status','finish_status']);

  }
  componentWillUnMount() {
  }

  columns = [
    {
      title: '教学点',
      dataIndex: 'teachCentername',
      fixed: 'left',
      width: 200,
    }, 
    {
      title: '课程班',
      dataIndex: 'courseplanName',
      width: 200,
    },
    {
      title: '课程班类型',
      dataIndex: 'teachClassTypeName',
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName',
    }, 
    {
      title: '上课日期',
      dataIndex: 'courseDate',
      render:(text,record)=>{
        return timestampToTime(record.courseDate)
      }
    },
    {
      title: '上课时段',
      dataIndex: 'startDate', 
      render:(text,record)=>{
        return timestampToTime(record.startDate) + '至' + timestampToTime(record.endDate)
      }
    },
    {
      title: '课时',
      dataIndex: 'hour',
    },
    
    {
      title: '讲师',
      dataIndex: 'teacherName',
    }, 
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => ( 
           <Button onClick={() => { this.onLookView('View', record); }}>二维码</Button> 
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    let dateStart = condition.dateStart;
    if(Array.isArray(dateStart)){
      condition.dateStart = formatMoment(dateStart[0]);
      condition.dateEnd = formatMoment(dateStart[1]);
    }
    this.props.TwoDimensionalList(condition).payload.promise.then((response) => {
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
  //导出
  download = (option) => { 
    let apiUrl  = '/edu/file/getFile';
    let options = option ? option : this.props.options || [];//获取参数
    let { serverURL, getToken } = env;
    var divElement = document.getElementById("downloadDiv");
    var downloadUrl = `${serverURL}${apiUrl}`;
    var params = {
      token: getToken(),
      ...options
    }
    
    ReactDOM.render(
      <form action={downloadUrl} method={'post'}>
        {Object.keys(params).map((key, index) => {
          if(moment.isMoment(params[key])){//针对日期格式进行转换
            params[key] = formatMoment(params[key])
          }
          return <input name={key} type="hidden" value={params[key]} />
        })
        }
      </form>,
      divElement
    )
    ReactDOM.findDOMNode(divElement).querySelector('form').submit();
    ReactDOM.unmountComponentAtNode(divElement);
  }
  //批量导出
  CloseTheCourse = () =>{    
    let that = this; 
    confirm({
      title: '是否批量打印已选中的学生考勤二维码?',
      content: '',
      onOk() { 
        that.props.TwoDimensionalBatchExport({detailIds:that.state.UserSelecteds.join(',')}).payload.promise.then((response) => {
          let data = response.payload.data;  
            if(data.state == 'success'){
              that.download({ filePath: data.data })
              that.setState({
                UserSelecteds:[]
              }) 
            }else{
              message.error(data.msg)
            }
          }
        )
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  
  //教学点改变课程班变化
  onSelectChangeT = (value) =>{  
    let condition = {};
    condition.teachCenterId = value || ''
    this.props.TeachingPointCourseFB(condition).payload.promise.then((response) => {
        let data = response.payload.data; 
        if(data.state=='success'){
          let { pagingSearch } = this.state;
          pagingSearch.courseArrangeName = ''
            this.setState({
                CourseClass:data.data,
                pagingSearch  
          })
          this.props.form.resetFields(['courseArrangeName']); 
        }else{
            message.error(data.msg)
        }
    })
  }


  render() {
    let block_content = <div></div>
    switch (this.state.editMode) { 
      case 'View':
        block_content = <LookDetail
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />
        break;   
      case 'Manage':
      default: 
        const { getFieldDecorator } = this.props.form;
        let extendButtons = []; 
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys,sureList:selectedRows })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
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
                              this.state.pagingSearch.courseplanBatchId = '';
                              this.state.pagingSearch.courseCategoryId = '';
                              this.state.pagingSearch.itemId = value;
                              this.setState({ pagingSearch: this.state.pagingSearch });
                              setTimeout(() => {
                                  {/* 重新重置才能绑定这个科目值 */ }
                                  this.props.form.resetFields(['courseplanBatchId']);
                                  this.props.form.resetFields(['courseCategoryId']);
                              }, 100);
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
                                <SelectTeachCenterByUser 
                                onSelectChange = {this.onSelectChangeT}
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="课程班">
                            {getFieldDecorator('courseArrangeName', { initialValue: this.state.pagingSearch.courseArrangeName })(
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
                      <FormItem {...searchFormItemLayout} label="讲师">
                        {getFieldDecorator('teacher', {
                          initialValue: dataBind(this.state.pagingSearch.teacher)
                        })(
                          <Input placeholder='请输入讲师姓名' />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="上课日期">
                      {getFieldDecorator('dateStart', { initialValue:this.state.pagingSearch.dateStart?[moment(this.state.pagingSearch.dateStart,dateFormat),moment(this.state.pagingSearch.dateEnd,dateFormat)]:[]})(
                            <RangePicker
                                disabledDate={this.disabledStartDate}
                                format={dateFormat}
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                                style={{width:220}}  
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
            <div id='downloadDiv' style={{ display: 'none' }}></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                rowKey={record => record.liveId}//主键
                bordered
                rowKey = {'courseArrangeDetailId'}
                scroll={{ x: 1600 }}
                rowSelection = {rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={2}> 
                  {
                      this.state.UserSelecteds.length>0?<Button onClick={this.CloseTheCourse} icon="qrcode">批量打印二维码</Button>:<Button disabled icon="qrcode">批量打印二维码</Button>
                  } 
                  </Col>
                  <Col span={22} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(CourseClassGradeManage);

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
    TwoDimensionalList: bindActionCreators(TwoDimensionalList, dispatch),
    TwoDimensionalBatchExport: bindActionCreators(TwoDimensionalBatchExport, dispatch),
    TeachingPointCourseFB: bindActionCreators(TeachingPointCourseFB, dispatch), 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
