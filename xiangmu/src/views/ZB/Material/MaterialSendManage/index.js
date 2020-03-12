/*
资料寄件管理
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
import { queryMaterialApplyVosList, updSendState } from '@/actions/material';

import AuditView from './view';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';

class MaterialSendManage extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      feedbackRemark: '',
      sendStatus: ''
    },
    data: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {},
    UserSelecteds: [],
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
    this.loadBizDictionary(['dic_YesNo','product_partner_price_status','send_status','feedback_remark']);
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
        title: '申请日期',
        width: 120,
        dataIndex: 'submitDate',
        render: (text, record, index) => {
          return timestampToTime(record.submitDate);
        }
    },
    {
        title: '寄件情况',
        width: 120,
        dataIndex: 'sendStatus',
    },
    {
        title: '快递单号',
        width: 150,
        dataIndex: 'expressNum',
    },
    {
        title: '寄件日期',
        width: 120,
        dataIndex: 'sendDate',
        render: (text, record, index) => {
          return timestampToTime(record.sendDate);
        }
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          <DropDownButton>
              {
                (record.sendStatusFlag == 1 || record.sendStatusFlag == 2) && <Button onClick={() => { this.onLookView('Audit', record); }}>寄件信息</Button>
              }
              <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
          </DropDownButton>
        ),
    }
  ];
  //检索数据
  fetch(params){
      
      var condition = params || this.state.pagingSearch;
      let submitStartDate = condition.submitStartDate;
      let sendDateStart = condition.sendDateStart;
      if(submitStartDate){
        condition.submitStartDate = formatMoment(submitStartDate[0])
        condition.submitEndDate = formatMoment(submitStartDate[1])
      }
      if(sendDateStart){
        condition.sendDateStart = formatMoment(sendDateStart[0])
        condition.sendDateEnd = formatMoment(sendDateStart[1])
      }
      condition.auditStatus = 2
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
              UserSelecteds: []
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }

  onBatchSend = () => {
      Modal.confirm({
          title: '',
          content: '您确定对所选的'+this.state.UserSelecteds.length+'个申请进行已寄出处理吗?',
          onOk: () => {
              this.props.updSendState({ materialApplyIds: this.state.UserSelecteds.join(',') }).payload.promise.then((response) => {
                  let data = response.payload.data;
                  if (data.result === false) {
                      message.error(data.message);
                  }
                  else {
                      message.success('操作成功！');
                      this.setState({ UserSelecteds: [] })
                      this.onSearch();
                  }
              })
          },
          onCancel: () => {
              console.log('Cancel');
          },
      });

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
            apiUrl={'/edu/materialApply/exportInfomationSheet'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出资料单'}
          >
          </FileDownloader>);

        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
              this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
              disabled: record.sendStatusFlag == 1 ? false : true,    // Column configuration not to be checked
          }),
        };

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
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="收件反馈" >
                    {getFieldDecorator('feedbackRemark', { initialValue: this.state.pagingSearch.feedbackRemark })(
                      <Select>
                        <Option value=''>全部</Option>
                        {this.state.feedback_remark.filter(a => parseInt(a.value) > 0).map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}></Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="申请时间"
                  >
                    {getFieldDecorator('submitStartDate', { initialValue: this.state.pagingSearch.submitStartDate?[moment(this.state.pagingSearch.submitStartDate,dateFormat),moment(this.state.pagingSearch.submitEndDate,dateFormat)]:[]  })(
                     <RangePicker style={{width:220}}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="收件人"
                  >
                    {getFieldDecorator('receiver', { initialValue: this.state.pagingSearch.receiver })(
                      <Input placeholder='请输入收件人'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="寄件时间"
                  >
                    {getFieldDecorator('sendDateStart', { initialValue: this.state.pagingSearch.sendDateStart?[moment(this.state.pagingSearch.sendDateStart,dateFormat),moment(this.state.pagingSearch.sendDateEnd,dateFormat)]:[]  })(
                     <RangePicker style={{width:220}}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="寄件人"
                  >
                    {getFieldDecorator('sender', { initialValue: this.state.pagingSearch.sender })(
                      <Input placeholder='请输入寄件人'/>
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
                   rowKey={'materialApplyId'}
                   dataSource={this.state.data}//数据
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ x: 1600 }}
            />
            <div className="space-default"></div>
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={4}>
                    <div className='flex-row'>
                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchSend} icon="rocket">批量寄出</Button> : <Button disabled icon="rocket">批量寄出</Button>}
                    </div>
                </Col>
                <Col span={20} className='search-paging-control'>
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
const WrappedManage = Form.create()(MaterialSendManage);

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
        updSendState: bindActionCreators(updSendState, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
