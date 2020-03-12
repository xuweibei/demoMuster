/*
大客户签约信息
2019-04-18
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

import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';
import TeacherCreateView from './view';
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

import { partnerSignInsert, partnerSignSelectList, partnerSignUpdate } from '@/actions/partner';

import './index.less';

class PartnerSignInfo extends React.Component {
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
        periodizationType: "",
        itemId: "",
        zbPayeeType: "",
        cooperationStatus:'',
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentDidMount(){
    document.addEventListener("keydown",this.handleEnterKey);
  }

  componentWillMount() {
    //载入需要的字典项:
    this.loadBizDictionary(['dic_YesNo', 'cooperation_status','pos_account_type', 'contract_type','payee_type','periodization_type', 'teacher_teaching_mode']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    // this.onSearch();
  }

  componentWillUnMount() {
    document.removeEventListener("keydown",this.handleEenterKey);
  }
  handleEnterKey = (e) => {
      if(e.keyCode === 13){
        this.onSearch();
      }
  }

  columns = [
    {
      title: '合同编号',
      fixed: 'left',
      width: 150,
      dataIndex: 'contactNo',
    },
    {
      title: '所属分公司',
      dataIndex: 'branchName',
      width: 90,
    },
    {
      title: '落款签章',
      dataIndex: 'signature',
      width: 100,
    },
    {
      title: '高校名称',
      dataIndex: 'universityName',
      width: 100,
    },
    {
      title: '学院名称',
      dataIndex: 'departmentName',
      width: 120,
    },
    {
      title: '签约主体',
      dataIndex: 'zbPayeeType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.pos_account_type, record.zbPayeeType);
      },
      width: 90,
    },
    {
      title: '状态',
      dataIndex: 'cooperationStatuName',
      width: 90,
    },
    {
      title: '签约项目',
      dataIndex: 'itemNames',
      width: 180,
      render: (text, record, index) => {
        return record.itemNames
      }
    },
    {
      title: '合同类型',
      dataIndex: 'contractTypeName',
    },
    {
      title: '签约日期',
      dataIndex: 'signDate',
      width: 120,
      render: (text, record, index) => {
        return timestampToTime(record.signDate);
      },
    },
    {
      title: '合同有效期',
      dataIndex: 'contactDateStr',
      width: 170,
    },
    {
      title: '收费方',
      dataIndex: 'payeeTypeName',
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => {
        return <DropDownButton>
          <Button onClick={() => {
            this.onLookView('Edit', record);
          }}>编辑</Button>
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
    this.props.partnerSignSelectList(condition).payload.promise.then((response) => {
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
        case 'Create':
          this.props.partnerSignInsert(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", dataModel);
            }
          })
          break;
        case 'Edit':
          this.props.partnerSignUpdate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message, 5);
            }
            else {
              message.success('修改成功')
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", dataModel);
            }
          })
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
        block_content = <TeacherCreateView
          viewCallback={this.onViewCallback}
          {...this.state}/>
        break;
      default:
        const {getFieldDecorator} = this.props.form;
        let extendButtons = [];
        extendButtons.push(<Button onClick={() => {
          this.onLookView('Create', {...this.state.dataModel})
        }} icon="plus" className="button_dark">新增</Button>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)}
                        bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
              <Form className="search-form">
                <Row gutter={24}>
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="所属分部">
                          {getFieldDecorator('branchId', {
                              initialValue: this.state.pagingSearch.branchId
                          })(
                              <SelectFBOrg scope={'my'} hideAll={false} />
                              )}
                      </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'高校名称'}>
                      {getFieldDecorator('universityName', {initialValue: this.state.pagingSearch.universityName})(
                        <Input placeholder="高校名称"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="签约主体" >
                          {getFieldDecorator('zbPayeeType', { initialValue: this.state.pagingSearch.zbPayeeType })(
                              <Select>
                                  <Option value="">全部</Option>
                                  {this.state.pos_account_type.filter(a => a.value == 1 || a.value == 2).map((item, index) => {
                                      return <Option value={item.value} key={index}>{item.title}</Option>
                                  })}
                              </Select>
                          )}
                      </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label="合作状态">
                      {getFieldDecorator('cooperationStatus', {initialValue: this.state.pagingSearch.cooperationStatus})(
                        <Select>
                          <Option value="">全部</Option>
                          {this.state.cooperation_status.map((item, index) => {
                            return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="签约项目" >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                          <SelectItem scope='all' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label="分期情况">
                      {getFieldDecorator('periodizationType', {
                          initialValue: this.state.pagingSearch.periodizationType,
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {
                              this.state.periodization_type.map((item, index) => {
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
            <div className="search-result-list teacher-table-list">
              <Table columns={this.columns} //列定义
                     loading={this.state.loading}
                     pagination={false}
                     dataSource={this.state.data}//数据
                     rowKey={record => record.teacherId}//主键
                     bordered
                     scroll={{x: 1800}}
                    //  rowSelection={rowSelection}
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
const WrappedManage = Form.create()(PartnerSignInfo);

const mapStateToProps = (state) => {
  //基本字典数据
  let {Dictionarys} = state.dic;
  return {Dictionarys};
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    partnerSignSelectList: bindActionCreators(partnerSignSelectList, dispatch),
    partnerSignInsert: bindActionCreators(partnerSignInsert, dispatch),
    partnerSignUpdate: bindActionCreators(partnerSignUpdate, dispatch),
  };
}

//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
