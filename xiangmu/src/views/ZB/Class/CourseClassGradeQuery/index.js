/*
课程班成绩查询
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Radio
} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';

import DropDownButton from '@/components/DropDownButton';

import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import FileDownloader from '@/components/FileDownloader';
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
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind } from '@/utils';

import { operateLive, batchReleaseLives } from '@/actions/live';
import { querySelectCourseArrangeScoreList } from '@/actions/course';
import { getTeachCenterByBranchId } from '@/actions/base'; 

import LookDetail from './detail';

class CourseClassGradeQuery extends React.Component {
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
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        branchId: '',
        itemId: '',
        courseCategoryId:'',
        courseplanBatchId: '',
        finishStatus: '',
        teachCenterId: ''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      teachArr:[],
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
      title: '分部',
      dataIndex: 'branchName',
      fixed: 'left',
      width: 150,
    },
    {
      title: '开课批次',
      dataIndex: 'courseplanBatchName',
      width: 200,
    },
    {
      title: '教学点',
      dataIndex: 'teachCenterName',
    },
    {
      title: '课程班',
      dataIndex: 'courseplanName',
      width: 200,
    },
    {
      title: '课程班类型',
      dataIndex: 'stateMsg',
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName',
    },
    {
      title: '结束情况',
      dataIndex: 'finishStatus',
    },
    {
      title: '班级总人数',
      dataIndex: 'totalStudents'
    },
    {
      title: '首次上课人数',
      dataIndex: 'totalAppend',
    },
    {
      title: '重修人数',
      dataIndex: 'totalReStudy',
    },
    
    {
      title: '报考人数',
      dataIndex: 'totalEnterExam',
    },
    {
      title: '录入成绩人数',
      dataIndex: 'totalEnterScore',
    },
    {
      title: '通过总人数',
      dataIndex: 'totalPass',
    },
    {
      title: '预估孝季通过人数',
      dataIndex: 'totalExamPatch',
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          
          <Button onClick={() => { this.onLookView('View', record); }}>成绩查看</Button>
          
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.querySelectCourseArrangeScoreList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false,
          UserSelecteds: []
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
      }else{
        message.error(data.msg)
      } 
      
      this.props.form.resetFields(['teachCenterId']);
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
        case 'Create':
        case 'Edit':
          
          break;
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
      case 'Create':
      case 'Edit':
       
     
      case 'View':
        block_content = <LookDetail
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />

        break;  
      case 'Import':
        
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: false,
          })
        }
        
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label='分部'>
                        {getFieldDecorator('branchId', {
                          initialValue: this.state.pagingSearch.branchId
                        })(
                          <SelectFBOrg scope={'my'}
                            onSelectChange = {this.onSelectChange}
                            // hideAll={item.is_all ? false : true}
                            // onSelectChange={(value) => this.props.onCallback(value, item.name)}
                          />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={24}></Col>
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
                              this.state.pagingSearch.courseCategoryId = '';
                              this.state.pagingSearch.courseplanBatchId = '';
                              this.setState({ pagingSearch: this.state.pagingSearch });
                              setTimeout(() => {
                                  {/* 重新重置才能绑定这个开课批次值 */ }
                                  this.props.form.resetFields(['courseplanBatchId','courseCategoryId']);
                                  this.onSearch();
                              }, 500);
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
                                <SelectItemCoursePlanBatch itemId={this.state.pagingSearch.itemId} />
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
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="课程班"
                        >
                            {getFieldDecorator('courseplanName', { initialValue: this.state.pagingSearch.courseplanName })(
                                <Input placeholder='课程班' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="结束情况">
                        {getFieldDecorator('finishStatus', {
                          initialValue: dataBind(this.state.pagingSearch.finishStatus)
                        })(
                          <Select onChange={(value) => {
                            this.setState({
                              finishStatus: value
                            })
                          }}>
                            <Option value="">全部</Option>
                            {this.state.finish_status.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
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
                rowKey={record => record.courseArrangeId}//主键
                rowSelection={rowSelection}
                bordered
                scroll={{ x: 1700 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  
                  <Col span={2}> 
                  {
                    this.state.UserSelecteds.length ? <FileDownloader
                        apiUrl={'/edu/courseArrange/exportScore'}//api下载地址
                        method={'post'}//提交方式
                        options={{courseArrangeIds:this.state.UserSelecteds.join(',')}}//提交参数
                        title={'导出成绩'}
                      >
                      </FileDownloader> 
                      : <Button icon="export" disabled>导出成绩</Button>
                  }
                    
                  </Col>
                  <Col span={22} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(CourseClassGradeQuery);

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
    querySelectCourseArrangeScoreList: bindActionCreators(querySelectCourseArrangeScoreList, dispatch),
    operateLive: bindActionCreators(operateLive, dispatch),
    batchReleaseLives: bindActionCreators(batchReleaseLives, dispatch),
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch), 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
