/*
课程班成绩管理
2019-1-22
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
const confirm = Modal.confirm;

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
 

import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
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
 
import { queryCourseArrangeScoreVosList,CloseAllCourse } from '@/actions/course';

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
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        itemId: '',
        courseCategoryId:'',
        courseplanBatchId: '',
        liveStatus: '',
        branchId: props.orgId,
        teachCenterId: ''
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
      title: '开课批次',
      dataIndex: 'courseplanBatchName',
      fixed: 'left',
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
      title: '班级总人数',
      dataIndex: 'totalStudents'
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
      title: '通过人数',
      dataIndex: 'totalPass',
    },
    {
      title: '参考率',
      dataIndex: 'totalEnterExamRate',
    },
    {
      title: '通过率',
      dataIndex: 'totalPassRate',
    },
    {
      title: '结束情况',
      dataIndex: 'finishStatus', 
    },
    {
      title: '结束日期',
      dataIndex: 'finishDate',
      render:(text,record)=>{
        return timestampToTime(record.finishDate)
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => ( 
           <Button onClick={() => { this.onLookView('View', record); }}>成绩明细</Button> 
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.queryCourseArrangeScoreVosList(condition).payload.promise.then((response) => {
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
  CloseTheCourse = () =>{
    let that = this; 
    confirm({
      title: '结束课程班后，课程班的参考率及通过率不再根据当前学生报考及成绩进行计算并记录，以后不再随学生成绩的录入而变更，您确定进行此操作吗？',
      content: '',
      onOk() { 
        that.props.CloseAllCourse({courseArrangeIds:that.state.UserSelecteds.join(',')}).payload.promise.then((response) => {
          let data = response.payload.data; 
            if(data.state == 'success'){
              message.success('操作成功!');
              that.setState({
                UserSelecteds:[]
              })
              that.onSearch();
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
            disabled: record.finishStatus == '已结束'?true:false,    // Column configuration not to be checked
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
                                <SelectTeachCenterByUser />
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
                rowKey={record => record.liveId}//主键
                bordered
                rowKey = {'courseArrangeId'}
                scroll={{ x: 1600 }}
                rowSelection = {rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={2}> 
                  {
                      this.state.UserSelecteds.length>0?<Button onClick={this.CloseTheCourse} icon="delete">结束课程班</Button>:<Button disabled icon="delete">结束课程班</Button>
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
    //列表
    queryCourseArrangeScoreVosList: bindActionCreators(queryCourseArrangeScoreVosList, dispatch), 
    //结束课程班
    CloseAllCourse: bindActionCreators(CloseAllCourse, dispatch),
    
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
