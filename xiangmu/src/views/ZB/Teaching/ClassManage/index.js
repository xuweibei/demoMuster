/*
班级管理管理
2019-03-06
*/
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Radio
} from 'antd';
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import ClassCreate from './view';
import ClassCourse from './course';
import AppointmentDetail from './detail';
import ClassInfo from './class';
import DropDownButton from '@/components/DropDownButton';

import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

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

import { batchReleaseLives } from '@/actions/live';
import { classBatchPageList, classPageList, classPageCreate, classPageUpdate, classPageDelete, classCourseCreateOrUpdate } from '@/actions/teaching';


class ClassManage extends React.Component {
  constructor() {
    super();
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
        classStatus: '',
        noCourse: '',
        noStudent: ''
      },
      data: [],
      classBatchList: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      submitLoading: false
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.onSearch();
    //获取批次列表
    this.getClassBatch();
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '班级名称',
      dataIndex: 'className',
      fixed: 'left',
      width: 200,
      render: (text, record, index) => {
          return <span>
              <a href="javascript:;" onClick={() => { this.onLookView('Class', record); }}>{text}</a>
          </span>
      },
    },
    {
      title: '项目',
      dataIndex: 'itemName',
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName'
    },
    {
      title: '课程',
      dataIndex: 'courseName',
    },
    {
      title: '有效期',
      dataIndex: 'starTime',
      width: 180,
      render: (text, record, index) => {
        return timestampToTime(record.starTime)+' 至 '+ timestampToTime(record.endTime);
      }
    },
    {
      title: '批次',
      dataIndex: 'classBatchName',
    },
    {
      title: '周数',
      dataIndex: 'weeks',
      width: 80,
    },
    {
      title: '学员数',
      dataIndex: 'studentNum',
      width: 100,
    },
    {
      title: '状态',
      width: 100,
      dataIndex: 'classStatusName'
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onLookView('Course', record); }}>设置课程</Button>
          <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
          { (record.studentNum == 0) && <Button onClick={() => { this.onDeltet(record.classId); }}>删除</Button> }
          <Button onClick={() => { this.onLookView('View', record); }}>添加学员</Button>
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.classPageList(condition).payload.promise.then((response) => {
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
  getClassBatch = () => {
    this.props.classBatchPageList({itemId:this.state.pagingSearch.itemId}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          classBatchList:data.data,
        })
      }
      else {
        message.error(data.message);
      }
    })
  }
  setSubmitLoading = (flag) => {
    this.setState({ submitLoading: flag })
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
      this.setSubmitLoading(false);
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Create':
          this.props.classPageCreate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              this.setSubmitLoading(false);
              message.error(data.message, 5);
            }
            else {
              message.success('操作成功！');
              this.setSubmitLoading(false);
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
        
        break;
        case 'Edit':
          this.props.classPageUpdate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                this.setSubmitLoading(false);
                message.error(data.message, 5);
              }
              else {
                message.success('操作成功！');
                this.setSubmitLoading(false);
                this.onSearch();
                //进入管理页
                this.onLookView("Manage", null);
              }
            })
          
          break;
          case 'Course':
          this.props.classCourseCreateOrUpdate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                this.setSubmitLoading(false);
                message.error(data.message, 5);
              }
              else {
                message.success('操作成功！');
                this.setSubmitLoading(false);
                this.onSearch();
                //进入管理页
                this.onLookView("Manage", null);
              }
            })
          
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
  
  setSubmitLoading = (flag) => {
    this.setState({ submitLoading: flag })
  }

  onDeltet = (classId) => {
        Modal.confirm({
            title: '是否删除所选班级?',
            content: '点击确认删除所选班级!否则点击取消！',
            onOk: () => {
                let params = { classId: classId }
                this.props.classPageDelete(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        message.success('删除成功！');
                        this.onSearch();
                    }
                })
            }
        })
    };

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Create':
      case 'Edit':
        block_content = <ClassCreate
          viewCallback={this.onViewCallback}
          setSubmitLoading={this.setSubmitLoading}
          submitLoading={this.state.submitLoading}
          editMode={this.state.editMode} 
          {...this.state}
          />
        break;
      case 'Course':
        block_content = <ClassCourse
          viewCallback={this.onViewCallback}
          setSubmitLoading={this.setSubmitLoading}
          submitLoading={this.state.submitLoading}
          editMode={this.state.editMode} 
          {...this.state}
          />
        break;
      case 'View':
        block_content = <AppointmentDetail
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />

        break;  
      case 'Class':
        block_content = <ClassInfo
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />

        break;  
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        
        extendButtons.push(<Button onClick={() => { this.onLookView('Create') }} icon="plus" className="button_dark">创建班级</Button>);
        
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
                            hideAll={false}
                            hidePleaseSelect={true}
                            onSelectChange={(value) => {
                              this.state.pagingSearch.itemId = value;
                              this.setState({ pagingSearch: this.state.pagingSearch });
                              setTimeout(() =>{
                                this.props.form.resetFields(['courseCategoryId','classBatchId']);
                                this.getClassBatch();
                              },300)
                              
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
                      <FormItem {...searchFormItemLayout} label="批次">
                        {getFieldDecorator('classBatchId', {
                          initialValue: dataBind(this.state.pagingSearch.classBatchId)
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.classBatchList.map((item, index) => {
                              return <Option value={item.classBatchId} key={index}>{item.classBatchName}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="状态" >
                        {getFieldDecorator('classStatus', { initialValue: this.state.pagingSearch.classStatus })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="未开始" key='1'>未开始</Option>
                            <Option value="进行中" key='2'>进行中</Option>
                            <Option value="已结束" key='3'>已结束</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="有无学员" >
                        {getFieldDecorator('noStudent', { initialValue: this.state.pagingSearch.noStudent })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="0" key='0'>无</Option>
                            <Option value="1" key='1'>有</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="有无课程" >
                        {getFieldDecorator('noCourse', { initialValue: this.state.pagingSearch.noCourse })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="0" key='0'>无</Option>
                            <Option value="1" key='1'>有</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'班级名称'} >
                        {getFieldDecorator('className', { initialValue: this.state.pagingSearch.className })(
                          <Input placeholder="班级名称" />
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
                bordered
                scroll={{ x: 1500 }}
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
const WrappedManage = Form.create()(ClassManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    classBatchPageList: bindActionCreators(classBatchPageList, dispatch),
    classPageList: bindActionCreators(classPageList, dispatch),
    classPageCreate: bindActionCreators(classPageCreate, dispatch),
    classPageUpdate: bindActionCreators(classPageUpdate, dispatch),
    classPageDelete: bindActionCreators(classPageDelete, dispatch),
    classCourseCreateOrUpdate: bindActionCreators(classCourseCreateOrUpdate, dispatch),
    batchReleaseLives: bindActionCreators(batchReleaseLives, dispatch),
    
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
