/*
教师管理 列表
wangwenjun
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Route, Redirect} from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider,Avatar
} from 'antd';
const FormItem = Form.Item;

import FileDownloader from '@/components/FileDownloader';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';
import TeacherInfoView from './view';
import { env } from '@/api/env';
//基本字典接口方法引入
import {loadDictionary} from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import {getDictionaryTitle, timestampToTime, split, formatMoney} from '@/utils';

import {
  getZBTeacherSelectList
} from '@/actions/teaching';

class TeacherManage extends React.Component {
  constructor() {
    super();
    (this:any).fetch = this.fetch.bind(this);
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
        englishName: "",
        itemId: "",
        itemIds: "",
        teachingMode: "",
        teacherCategoryName: "",
        teacherNo: "",
        teachingStatus:'',
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }

  componentWillMount() {
    //载入需要的字典项:
    this.loadBizDictionary(['dic_Status', 'teaching_status', 'teacher_teaching_mode']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    this.onSearch();
  }

  componentWillUnMount() {

  }

  //姓名	教师号	用户名	授课方式	状态	授课项目	授课科目  照片  操作
  columns = [
    {
      title: '英文名',
      fixed: 'left',
      width: 120,
      dataIndex: 'englishName',
    },
    
    // {
    //   title: '用户名',
    //   dataIndex: 'loginName',
    //   width: 90,
    // },
    {
      title: '城市',
      dataIndex: 'areaName',
      width: 100,
    },
    {
      title: '手机',
      dataIndex: 'mobile',
      width: 120,
    },
    {
      title: '授课方式',
      dataIndex: 'teachingMode',
      width: 90,
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.teacher_teaching_mode, record.teachingMode);
      }
    },
    {
      title: '状态',
      dataIndex: 'teachingStatus',
      width: 90,
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.teaching_status, record.teachingStatus);
      }
    },
    {
      title: '授课项目',
      width: 180,
      dataIndex: 'itemNames',
      render: (text, record, index) => {
        return record.itemNames
      }
    },
    {
      title: '授课科目',
      dataIndex: 'categoryNames',
      render: (text, record, index) => {
        return record.categoryNames
      }
    },
    {
      title: '教师号',
      dataIndex: 'teacherNo',
      width: 120,
    },
    {
      title: '入职年份',
      dataIndex: 'entryYear',
      width: 90,
    },
    {
      title: '照片',
      dataIndex: 'avatar',
      render:(text, record, index) =>{
        return<div>
        <span style={{ marginRight: 24 }}>
          <Avatar shape="square" icon="user" src={env.serverURL+record.avatar} />
        </span>
      </div>
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => {
        return <DropDownButton>
          <Button onClick={() => {
            this.onLookView('View', record);
          }}>查看</Button>
        </DropDownButton>
      }
    }
  ];

  //检索数据
  fetch(params = {}) {
    this.setState({loading: true});
    var condition = params || this.state.pagingSearch;
    this.props.getZBTeacherSelectList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false
        })
      }
      else {
        this.setState({loading: false})
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
      this.setState({currentDataModel: null, editMode: 'Manage'})
    } else {
      switch (this.state.editMode) {
      }
    }
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'View':
        block_content = <TeacherInfoView
          viewCallback={this.onViewCallback}
          {...this.state}/>
        break;
      default:
        const {getFieldDecorator} = this.props.form;
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/teacher/exportTeacher'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
      >
      </FileDownloader>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)}
                        bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
              <Form className="search-form">
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'英文名'}>
                      {getFieldDecorator('englishName', {initialValue: this.state.pagingSearch.englishName})(
                        <Input placeholder="英文名"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label="项目">
                      {getFieldDecorator('itemId', {initialValue: this.state.pagingSearch.itemId})(
                        <SelectItem scope='my' hideAll={false}/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label="授课方式">
                      {getFieldDecorator('teachingMode', {initialValue: this.state.pagingSearch.teachingMode})(
                        <Select>
                          <Option value="">全部</Option>
                          {this.state.teacher_teaching_mode.map((item, index) => {
                            return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'授课科目'}>
                      {getFieldDecorator('teacherCategoryName', {initialValue: this.state.pagingSearch.teacherCategoryName})(
                        <Input placeholder="授课科目"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'教师号'}>
                      {getFieldDecorator('teacherNo', {initialValue: this.state.pagingSearch.teacherNo})(
                        <Input placeholder="教师号"/>
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
                     rowKey={record => record.teacherId}//主键
                     bordered
                     scroll={{x: 1600}}
                    //  rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={10}>
                    <div className='flex-row'>
                      {/*{(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?*/}
                      {/*<Button onClick={this.onBatchPublish} icon='rocket'>发布定价</Button> :*/}
                      {/*<Button disabled icon='rocket'>发布定价</Button>*/}
                      {/*}*/}
                    </div>
                  </Col>
                  <Col span={14} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                                current={this.state.pagingSearch.currentPage}
                                defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                pageSize={this.state.pagingSearch.pageSize}
                                onShowSizeChange={this.onShowSizeChange}
                                onChange={this.onPageIndexChange}
                                showTotal={(total) => {
                                  return `共${total}条数据`;
                                }}
                                total={this.state.totalRecord}/>
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
const WrappedManage = Form.create()(TeacherManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let {Dictionarys} = state.dic;
  return {Dictionarys};
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getZBTeacherSelectList: bindActionCreators(getZBTeacherSelectList, dispatch),
  };
}

//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
