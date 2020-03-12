/*
课表管理 冲突查询
2018-05-16
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { courseArrangeByIdQuery, courseArrangeDetailUpdate
  , courseArrangeDetailCreate, courseArrangeDetailDelete,courseArrangeDetailAddConflick } from '@/actions/course';

import CourseArrangeDetailEdit from '../CourseArrangeManage/view';

class CourseArrangeDetail extends React.Component {
  constructor(props){
    super(props);
    this.state= {
      editMode: '',
      data_list: [],
      totalRecord: 0,
      loading: false,
      detail: props.currentDataModel,//数据模型
      UserSelecteds: [],
    };
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
    (this: any).onAdd = this.onAdd.bind(this);
    (this: any).onDelete = this.onDelete.bind(this);
    (this: any).onLookView = this.onLookView.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo']);
    this.fetch();
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  onAdd = () => {
    this.onLookView('Add', {})
  }
  onDelete = () => {
    Modal.confirm({
        title: '是否删除所选课表明细?',
        content: '点击确认删除所选课表明细!否则点击取消！',
        onOk: () => {
            this.props.courseArrangeDetailDelete(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else {
                    this.setState({ UserSelecteds: [] })
                    this.fetch();
                }
            })
        },
        onCancel: () => {
            console.log('Cancel');
        },
    });
  }


  columns = [
    {
        title: '科目',
        dataIndex: 'courseCategoryName',
        width:120,
        fixed:'left',
    },
    {
        title: '上课日期',
        dataIndex: 'courseDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '上课时段',
        dataIndex: 'timeQuantum'
    },
    {
        title: '课时',
        dataIndex: 'hour'
    },
    {
        title: '讲师',
        dataIndex: 'teacherName',
    },
    {
        title: '英文名',
        dataIndex: 'englishName',
    },
    {
        title: '讲师所在城市',
        dataIndex: 'areaName',
    },
    {
        title: '班型备注',
        dataIndex: 'classTypeRemark',
    },
    {
        title: '课程阶段',
        dataIndex: 'periodRemark',
    },
    {
        title: '授课科目备注',
        dataIndex: 'courseRemark',
    },
    {
        title: '最后修改日期',
        dataIndex: 'modifyDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '操作',
        width: 120,
        fixed: 'right',
        key: 'action',
        render: (text, record) => (
          <div>
            {
              record.chek ? <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button> : '--'
            }
          </div>
        ),
    }
  ];
  //检索数据
  fetch(){
      this.setState({ loading: true });
      this.props.courseArrangeByIdQuery(this.state.detail.courseArrangeId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = [];
            data.data.listResult.map(i => {
              i.key = i.courseArrangeDetailId;
              list.push(i);
            })
            this.setState({
              data_list: list,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false, data_list: [] })
              message.error(data.message);
          }
      })
  }
  timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes();
    return Y+M+D+h+m
}
  onViewCallback = (dataModel) => {
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Edit':
          //delete dataModel.parentOrgid;
          this.props.courseArrangeDetailUpdate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  this.fetch();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })
          break;
        case 'Add':
          dataModel.courseArrangeId = this.state.detail.courseArrangeId;
          this.props.courseArrangeDetailAddConflick(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if(data.state=='success'){
                  if(data.data.listConflick){
                    Modal.confirm({
                      title: '课程有冲突是否继续添加?',
                      content: '该讲师在当前时间段已经有课程安排，您确定要添加吗？',
                      onOk: () => {
                        this.props.courseArrangeDetailCreate(dataModel).payload.promise.then((response) => {
                          let data = response.payload.data;
                            if (data.state === 'error') {
                                message.error(data.message);
                            }
                            else {
                                message.success('添加成功！');
                                this.fetch();
                                //进入管理页
                                this.onLookView("Manage", null);
                            }
                        })
                      }
                    })
                  }else{
                    Modal.confirm({
                      title: '是否添加?',
                      content: '点击确认添加!否则点击取消！',
                      onOk: () => {
                        this.props.courseArrangeDetailCreate(dataModel).payload.promise.then((response) => {
                          let data = response.payload.data;
                            if (data.state === 'error') {
                                message.error(data.message);
                            }
                            else {
                                message.success('添加成功！');
                                this.fetch();
                                //进入管理页
                                this.onLookView("Manage", null);
                            }
                        })
                      }
                    })
                  }
            }else{
              message.error(data.msg);
            }
          })
        
          break;
      }
    }
  }
  onLookView = (op, item) => {
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item,//编辑对象
    });
  };
  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Edit':
      case 'Add':
        block_content = <CourseArrangeDetailEdit
          courseArrangeId={this.state.detail.courseArrangeId}
          id={this.state.currentDataModel.courseArrangeDetailId}
          editMode={this.state.editMode}
          viewCallback={this.onViewCallback}
          coursePlanBatchId={this.props.pagingSearch.coursePlanBatchId}
          itemId={this.props.pagingSearch.itemId}
        />
        break;
      case 'Manage':
        default:
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
              disabled: record.chek ? false : true,
            }),
        }
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              form_item_list={[
                {type:'text', value: this.props.pagingSearch.itemName, title: '项目'},
                {type:'text', value: this.props.pagingSearch.coursePlanBatchName, title: '开课批次'},
                {type: 'text', value: this.state.detail.courseCategoryName, title: '科目'},
                {type: ''},
                {type:'text', value: this.state.detail.branchUniversityName, title: '分部'},
                {type:'text', value: this.state.detail.teachCentername, title: '教学点'},
                {type:'text', value: this.state.detail.courseplanName, title: '课程班'},
                {type:'text', value: this.state.detail.teachClassTypeName, title: '课程班类型'},
              ]}
              //fetch2={(params) =>this.fetch2(params)}
              hideTopButtons={true}
              hideBottomButtons={true}
            />
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                rowSelection={rowSelection}
                scroll={{x:1600}}
              />
              <div className="space-default"></div>
            </div>
            <div className="dv_split">
              <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onAdd}>新增课表</Button>
              <span className="split_button"></span>
              {
                this.state.UserSelecteds.length ?
                  <Button type="primary" loading={this.state.loading} icon="delete" onClick={this.onDelete}>删除课表</Button>
                :
                  <Button type="primary" disabled loading={this.state.loading} icon="delete" onClick={this.onDelete}>删除课表</Button>
              }
              <span className="split_button"></span>
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseArrangeDetail);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseArrangeByIdQuery: bindActionCreators(courseArrangeByIdQuery, dispatch),
        courseArrangeDetailUpdate: bindActionCreators(courseArrangeDetailUpdate, dispatch),
        courseArrangeDetailCreate: bindActionCreators(courseArrangeDetailCreate, dispatch),
        courseArrangeDetailDelete: bindActionCreators(courseArrangeDetailDelete, dispatch),
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        courseArrangeDetailAddConflick:bindActionCreators(courseArrangeDetailAddConflick,dispatch)

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
