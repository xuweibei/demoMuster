/*
资料申请查询
2018-12-8
zhujunying
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, DatePicker } from 'antd';
const FormItem = Form.Item;
const {  RangePicker } = DatePicker;
import { formatMoney, timestampToTime, getDictionaryTitle, formatMoment } from '@/utils';
import { env } from '@/api/env';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import { loadDictionary } from '@/actions/dic';
import { queryMaterialApplyVosList } from '@/actions/material';

import AuditView from './view';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';

class MaterialApplyQuery extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      auditStatus: '',
      sendStatus: '',
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
    this.loadBizDictionary(['dic_YesNo','product_partner_price_status','send_status']);
    this.onSearch();
  }

  columns = [
    {
        title: '分部',
        width:150,
        fixed:'left',
        dataIndex: 'branchName'
    },
    {
        title: '申请名称',
        dataIndex: 'materialApplyName'
    },
    {
        title: '相关项目',
        width: 120,
        dataIndex: 'itemNames'
    },
    {
        title: '资料总数量',
        width: 80,
        dataIndex: 'totalCount',
    },
    {
        title: '收件人',
        width: 100,
        dataIndex: 'receiver',
    },
    {
        title: '手机',
        width: 120,
        dataIndex: 'mobile',
    },
    {
        title: '申请人',
        width: 120,
        dataIndex: 'applicant',
    },
    {
        title: '申请日期',
        width: 120,
        dataIndex: 'submitDate',
        render: (text, record, index) => {
          return timestampToTime(record.submitDate);
        }
    },
    {
        title: '状态',
        width: 120,
        dataIndex: 'auditStatus',
    },
    {
        title: '审核人',
        width: 120,
        dataIndex: 'auditUser',
    },
    {
        title: '审核日期',
        width: 120,
        dataIndex: 'auditDate',
        render: (text, record, index) => {
          return timestampToTime(record.auditDate);
        }
    },
    {
        title: '寄件状态',
        width: 120,
        dataIndex: 'sendStatus',
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          //编辑  缴费  废弃 查看
          //订单状态：0暂存;1审核中;2待缴费;3审核不通过;4部分缴费;5已完成;6废弃
          <DropDownButton>
              <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
          </DropDownButton>
        ),
    }
  ];
  //检索数据
  fetch(params){
      
      var condition = params || this.state.pagingSearch;
      let submitStartDate = condition.submitStartDate;
      if(submitStartDate){
        condition.submitStartDate = formatMoment(submitStartDate[0])
        condition.submitEndDate = formatMoment(submitStartDate[1])
      }
      
      condition.branchId = this.state.branchId;
      this.setState({ loading: true });
      this.props.queryMaterialApplyVosList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data;
            //list.push(data.data);
            this.setState({
              data: list,
              totalRecord: data.totalRecord,
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
        extendButtons.push(
          <FileDownloader
            apiUrl={'/edu/materialApply/exportMaterialApplyVos'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出'}
          >
          </FileDownloader>);
        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
                
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
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="申请名称"
                  >
                    {getFieldDecorator('materialApplyName', { initialValue: this.state.pagingSearch.materialApplyName })(
                      <Input placeholder='请输入申请名称'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="状态" >
                    {getFieldDecorator('auditStatus', { initialValue: this.state.pagingSearch.auditStatus })(
                      <Select>
                        <Option value=''>全部</Option>
                        {this.state.product_partner_price_status.filter(a => parseInt(a.value) > 0).map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="申请日期"
                  >
                    {getFieldDecorator('submitStartDate', { initialValue: this.state.pagingSearch.submitStartDate?[moment(this.state.pagingSearch.submitStartDate,dateFormat),moment(this.state.pagingSearch.submitEndDate,dateFormat)]:[]  })(
                     <RangePicker style={{width:220}}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="申请人"
                  >
                    {getFieldDecorator('applicant', { initialValue: this.state.pagingSearch.applicant })(
                      <Input placeholder='请输入申请人'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="寄件情况" >
                    {getFieldDecorator('sendStatus', { initialValue: this.state.pagingSearch.sendStatus })(
                      <Select>
                        <Option value=''>全部</Option>
                        {this.state.send_status.filter(a => parseInt(a.value) > 0).map((item, index) => {
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
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 1600 }}
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
const WrappedManage = Form.create()(MaterialApplyQuery);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        queryMaterialApplyVosList: bindActionCreators(queryMaterialApplyVosList, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
