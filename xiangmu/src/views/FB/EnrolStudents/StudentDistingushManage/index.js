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
  Table, Pagination, Modal, DatePicker,InputNumber
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import {
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';
//getStudentAskBenefitList
import { getStudentDistingushList } from '@/actions/enrolStudent';

import ContentBox from '@/components/ContentBox';

const dateFormat = 'YYYY-MM-DD';
class StudentDistingushManage extends React.Component {

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
        currentPage: 1,
        pageSize: 10,
        studentName: '',
        weixin: '',
        certificateNo: '',  
        qq: '',   
        mobile: '',
      },
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
    };
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount");
    // this.onSearch()
  }
  componentDidMount(){
      document.addEventListener("keydown",this.handleEnterKey);
  }
  componentWillUnmount() {
      document.removeEventListener("keydown",this.handleEnterKey);
  }
  handleEnterKey = (e) => {
      if(e.keyCode === 13){
          this.onSearch();
      }
  }

  columns = [
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      fixed: 'left',
      width: 150
    },
    {
      title: '所属分部',
      dataIndex: 'branchName',
    },
    {
      title: '所属区域',
      dataIndex: 'areaName',
    },
    {
      title: '负责人',
      dataIndex: 'chargeMan',
    },
    {
      title: '手机',
      dataIndex: 'mobile',
    },
    {
        title: '呼叫中心咨询人员',
        dataIndex: 'callCenterUserName'
    },
    {
      title: '市场保护剩余天数 ',
      dataIndex: 'lastDay',
    },
    {
      title: '订单情况',
      dataIndex: 'orderStatus',
      render: (text, record, index) => {
        switch (record.orderStatus) {
          case 0:
            return "无订单";
          case 1:
            return "已下单未缴费";
          case 2:
            return "已下单已缴费";
          default:
            return "全部";
        }
      },
      fixed: 'right',
      width: 120,
    },
  //检索数据
  ]
  fetch = (params = {}) => {
      var condition = params || this.state.pagingSearch;
      let arr = [];
      for(let a in condition){
        if(a!='currentPage'&&a!='pageSize'){
          arr.push(condition[a])
        }
      };
      arr.length = 5;
      let b = arr.every((e)=>{
        return e =='';
      });
      if(!b){
        this.setState({ loading: true });
        condition.startDate = formatMoment(condition.startDate);//日期控件处理
        this.props.getStudentDistingushList(condition).payload.promise.then((response) => {
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
        message.error('查询内容不能为空');
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
  

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
        // extendButtons.push(<Button onClick={() => { this.onLookView('Create', { itemNames: '', startDate: '', endDate: '', remark: '', productDiscountType: '', productDiscountName: '', validDate: '', productDiscountPrice: '' }) }
        // } icon="plus" className="button_dark" > 优惠</Button>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">

                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                       <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                  
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'微信'} >
                        {getFieldDecorator('weixin', { initialValue: this.state.pagingSearch.weixin })(
                       <Input placeholder="微信" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'证件号'} >
                        {getFieldDecorator('certificateNo', { initialValue: this.state.pagingSearch.certificateNo })(
                       <Input placeholder="证件号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'QQ'} >
                        {getFieldDecorator('qq', { initialValue: this.state.pagingSearch.qq })(
                       <Input placeholder="QQ" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'手机号'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                       <Input placeholder="手机号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'studentId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="end" align="right" type="flex">
                  <Col span={18} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      currentPage={this.state.pagingSearch.currentPage}
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
const WrappedManage = Form.create()(StudentDistingushManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getStudentDistingushList: bindActionCreators(getStudentDistingushList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
