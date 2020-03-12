/*
回访情况统计
2019-1-24
zhujunying
*/
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, DatePicker } from 'antd';
const FormItem = Form.Item;
const {  RangePicker } = DatePicker;
import { formatMoney, timestampToTime, getDictionaryTitle, formatMoment } from '@/utils';
import { env } from '@/api/env';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import { loadDictionary } from '@/actions/dic';
import { returnVisitStudentSelectReturnVisitTj } from '@/actions/stuService';

import AuditView from './view';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';

class ReturnVisitInfoCount extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
    },
    data: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {},
    branchId: ''
  };
  constructor(){
    super();
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
  }
  componentWillMount(){
    // this.onSearch();
  }

  columns = [
    {
        title: '项目',
        width: 120,
        fixed:'left',
        dataIndex: 'itemName'
    },
    {
        title: '分部',
        dataIndex: 'branchName'
    },
    {
        title: '回访任务数',
        width:120,
        dataIndex: 'taskCount'
    },
    
    {
        title: '学生总数',
        width: 100,
        dataIndex: 'studentCount',
    },
    {
        title: '学生任务总数',
        width: 120,
        dataIndex: 'studentTaskCount',
    },
    {
        title: '学生任务回访数',
        width: 120,
        dataIndex: 'returnVisitCount',
    },
    {
        title: '回访率',
        width: 100,
        dataIndex: 'hfl',
        render:(text,record)=>{
          return Math.round(record.hfl*100)/100 + '%';
        }
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
              <div>{ (record.taskCount == 0 || record.hfl == 0) ? '--' : <Button onClick={() => { this.onLookView('View', record); }}>明细</Button> }</div>
        ),
    }
  ];
  //检索数据
  fetch(params){
      
      var condition = params || this.state.pagingSearch;
      let startDate = condition.startDate;
      if(startDate){
        condition.startDate = formatMoment(startDate[0])
        condition.endDate = formatMoment(startDate[1])
      }
      
      this.setState({ loading: true });
      this.props.returnVisitStudentSelectReturnVisitTj(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data.page.pageResult;
            //list.push(data.data);
            this.setState({
              data: list,
              totalRecord: data.data.page.totalRecord,
              loading: false,
              pagingSearch: condition,
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
    if(item){
      item.startDate = this.state.pagingSearch.startDate;
      item.endDate = this.state.pagingSearch.endDate;
    }
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item || {},//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
      this.onSearch();
    }
  }

  render(){
    let block_content = <div></div>
    
    switch (this.state.editMode) {
      case 'View':
      case 'Audit':
        block_content = <AuditView 
            viewCallback={this.onViewCallback}
            {...this.state}
        />
        break;
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        //除查询外，其他扩展按钮数组
        let extendButtons = [];
        
        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    {getFieldDecorator('itemId', {
                      initialValue: this.state.pagingSearch.itemId
                    })(
                      <SelectItem
                        scope={'my'}
                        hideAll={false}
                        onSelectChange={(value) => {
                          this.state.pagingSearch.itemId = value;
                          this.setState({ pagingSearch: this.state.pagingSearch });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="分部">
                    {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                     <SelectFBOrg  scope='my'  hideAll={false}  onSelectChange={(value, name) => {
                      var branchId = null;
                      if(value){
                        branchId = value;
                      }
                      this.setState({branchId: branchId});
                    }}
                    />
                    )}
                  </FormItem>
                </Col>
                
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="时间段"
                  >
                    {getFieldDecorator('startDate', { initialValue: this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]:[]  })(
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
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 1000 }}
            />
            <div className="space-default"></div>
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={24} className='search-paging-control'>
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
        </div>);
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(ReturnVisitInfoCount);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        returnVisitStudentSelectReturnVisitTj: bindActionCreators(returnVisitStudentSelectReturnVisitTj, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
