/*
订单金额及分期特殊调整
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
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import { loadDictionary } from '@/actions/dic';
import { queryBySpecialList, queryBySpecialUpdate } from '@/actions/recruit';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import ContentBox from '@/components/ContentBox';
import OrderAdjustView from './adjust';
import DropDownButton from '@/components/DropDownButton';

const dateFormat = 'YYYY-MM-DD';
class OrderMoneyTermAdjust extends React.Component {

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

    this.state = {
      editMode: '',
      pagingSearch: {
        orderSn: '',
        studentName: '',  //
      },
      data_list: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
    };
  }
  componentWillMount() {
    
  }
  compoentDidMount() {
    
  }

  columns = [
    {
      title: '订单分部',
      dataIndex: 'benefitBranchName',
      width: 120,
      fixed: 'left',
    },
    {
      title: '订单区域',
      dataIndex: 'benefitRegionName',
      width: 120, 
    },
    {
      title: '订单号',
      dataIndex: 'orderSn',
      render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
            </span>
        },
    },
    {
      title: '学生姓名',
      width: 100,
      dataIndex: 'realName',
    },
    {
      title: '证件号',
      dataIndex: 'certificateNo',
    },
    {
      title: '收费方',
      width: 120,
      dataIndex: 'payeeTypeStr',
    },
    {
      title: '订单金额(¥)',
      width: 100,
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return  formatMoney(record.totalAmount);
      }
    },
    {
      title: '分期',
      width: 80,
      dataIndex: 'terms',
    },
    {
      title: '当期应缴金额(¥)',
      width: 120,
      dataIndex: 'currentPayableAmount',
      render: (text, record, index) => {
        return  formatMoney(record.currentPayableAmount);
      }
    },
    {
      title: '订单状态',
      width: 120,
      dataIndex: 'orderStatusStr',
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      key: 'action',
      render: (text, record) => {
        return <DropDownButton>
          <Button onClick={() => { this.onLookView('View', record); }}>调整</Button>
         </DropDownButton>
      }

    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    if(condition.orderSn || condition.studentName){
      this.props.queryBySpecialList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          this.setState({ loading: false })
          message.error(data.message);
        }
        else {
          this.setState({ pagingSearch: condition, ...data, loading: false })
        }
      })
    }else{
      this.setState({ loading: false })
      message.error('请至少输入一项进行查询！');
    }
    
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
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    }else {
      switch (this.state.editMode) {
        case 'View':
        //case 'CreateByStudentManage'
          this.props.queryBySpecialUpdate(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  message.success("订单调整成功！");
                  //进入管理页
                  this.onLookView("Manage", null);
                  this.fetch(this.state.pagingSearch)
              }
          })
          break;
      }
    }
    
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Edit':
      case 'View':
        block_content = <OrderAdjustView
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode}
          currentDataModel={this.state.currentDataModel}
          orderId={this.state.currentDataModel.orderId}
          {...this.state}
        />
        break;
      case 'ViewOrderDetail':
            block_content = <OrderDetailView viewCallback={this.onViewCallback}
             studentId={this.state.currentDataModel.studentId}
              orderId={this.state.currentDataModel.orderId}
              tab={3}
            />
        break;
      case 'Manage':
      default:
        let extendButtons = [];
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'订单号'} >
                        {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                          <Input placeholder="请输入订单号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                          <Input placeholder="请输入学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={'productDiscountId'}
                pagination={false}
                scroll={{ x: 1300 }}
                dataSource={this.state.data}//数据
                bordered
              />
              <div className="space-default"></div>
             {/* <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>*/}
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OrderMoneyTermAdjust);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    queryBySpecialList: bindActionCreators(queryBySpecialList, dispatch),
    queryBySpecialUpdate: bindActionCreators(queryBySpecialUpdate, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
