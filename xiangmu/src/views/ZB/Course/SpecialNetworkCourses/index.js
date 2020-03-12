/*
订单业绩相关调整
*/

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import { env } from '@/api/env';
const FormItem = Form.Item;
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { getDictionaryTitle } from '@/utils';
import { loadDictionary, systemCommonChild } from '@/actions/dic';
import SelectItem from '@/components/BizSelect/SelectItem'; 
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory'; 
//getStudentAskBenefitList
import { NewNetClassList } from '@/actions/course';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import Import from './Import';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      itemId:'',
      studentId:'',
      courseCategoryId:'',
      courseName:''
    }, 
    data: [],
    totalRecord:0,
    loading: false,
    coursetype: []
  };
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() {

    //授课类型改为查二级字典
    this.props.systemCommonChild(['coursetype']).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
            message.error(data.message);
        }
        else {
            this.setState({ coursetype: data.data.coursetype })
        }
    })

    // this.onSearch()
  }
  compoentDidMount() {
    
  }
  
  columns = [
    
    {
      title: '课程名称',
      fixed: 'left',
      width:230,
      dataIndex: 'courseName',
    },
    {
      title: '授课类型',
      dataIndex: 'coursetype',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.coursetype, record.courseType);
      }
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryFullname',
    },
    {
      title: '操作',
      fixed: 'right',
      width:200,
      render: (text, record) => {
        return <DropDownButton>
            <Button onClick={() => { this.onLookView('import', record); }}>导入学生</Button>
        </DropDownButton>
      }
    }


  ];
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.NewNetClassList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false })
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "import":
        block_content = <Import
          viewCallback={this.onViewCallback}
          {...this.state}
        />
       break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                  <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'项目'}>
                              {getFieldDecorator('itemId', {
                                  initialValue: this.state.pagingSearch.itemId
                              })(
                                    <SelectItem
                                      scope={'my'}
                                      hideAll={false}
                                      // isFirstSelected={true}
                                      onSelectChange={(value) => {
                                        this.state.pagingSearch.itemId = value;
                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                      }}
                                      />
                              )}
                          </FormItem>
                    </Col>
                    
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'科目'}>
                              {getFieldDecorator('courseCategoryId', {
                                  initialValue: this.state.pagingSearch.courseCategoryId
                              })(
                                <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label='课程名称'>
                          {getFieldDecorator('courseName', {
                            initialValue: this.state.pagingSearch.courseName,
                          })(
                              <Input />
                            )}
                        </FormItem>
                      </Col>
                      <Col span={12}></Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={'studentCourseApplyId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                // scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={24} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentInviteManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    systemCommonChild: bindActionCreators(systemCommonChild, dispatch),
    NewNetClassList: bindActionCreators(NewNetClassList, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
