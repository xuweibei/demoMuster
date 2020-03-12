/*
学生回访管理
2019-1-24
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
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

import DropDownButton from '@/components/DropDownButton';

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

import { returnVisitGetByPageInBranch } from '@/actions/stuService';

import VisitImport from './import';
import VisitManage from './manage';

class StudentReturnVisitManage extends React.Component {
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
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary([]);

  }
  componentWillUnMount() {
  }

  columns = [
    {
      title: '项目',
      dataIndex: 'itemName',
      fixed: 'left',
      width: 120,
    },
    {
      title: '任务名称',
      dataIndex: 'returnVisitTaskName',
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
      title: '截止日期',
      width: 120,
      dataIndex: 'endTime',
      render:(text,record)=>{
        return timestampToTime(record.endTime)
      }
    },
    {
      title: '负责学生总数',
      width: 120,
      dataIndex: 'stuCount',
    },
    {
      title: '已回访数',
      width: 120,
      dataIndex: 'visitStuCount',
      render: (text, record, index) => {
        return <a  onClick={() => { this.onLookView('Edit', record, 1); }}>{record.visitStuCount}</a>;
        
      }
    },
    {
      title: '未回访数',
      width: 120,
      dataIndex: 'notVisitStuCount',
      render: (text, record, index) => {
        return <a  onClick={() => { this.onLookView('Edit', record, 0); }}>{record.notVisitStuCount}</a>;
        
      }
    },
    {
      title: '回访信息总数',
      width: 120,
      dataIndex: 'visitCount',
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onLookView('Edit', record); }}>回访管理</Button>
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let startTime = condition.startTime;
    if(Array.isArray(startTime)){
      condition.startTime = formatMoment(startTime[0])
      condition.endTime = formatMoment(startTime[1])
    }		
    this.props.returnVisitGetByPageInBranch(condition).payload.promise.then((response) => {
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

    if(item){
      if(type == 1 || type == 0){
        item.visitInfo = type;
      }else{
        item.visitInfo = '';
      }
      
    }
    
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
        block_content = <VisitManage
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode} 
          {...this.state}
          />
        break;
      
      case 'Import':
        block_content = <VisitImport
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />
        break; 
        
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<Button className="button_dark" icon='download' onClick={() => { this.onLookView('Import'); }}>导入回访</Button>)

        
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
                            {getFieldDecorator('startTime', { initialValue: this.state.pagingSearch.startTime?[moment(this.state.pagingSearch.startTime,dateFormat),moment(this.state.pagingSearch.endTime,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
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
const WrappedManage = Form.create()(StudentReturnVisitManage);

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
    returnVisitGetByPageInBranch: bindActionCreators(returnVisitGetByPageInBranch, dispatch),
    
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
