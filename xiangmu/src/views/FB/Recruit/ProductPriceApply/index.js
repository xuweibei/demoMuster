/*
商品标准价格 列表
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider
} from 'antd';
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ProductView from '@/views/ZB/Product/ProductView/view'
import ProductPriceApplyView from './view';
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
import { getDictionaryTitle, timestampToTime, split, formatMoney } from '@/utils';

import {
  selectByFProductPricePriceApply, addFProductPricePriceApply, updateFProductPricePriceApply
} from '@/actions/recruit';
class ProductPriceApplyManage extends React.Component {
  constructor() {
    super();
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
        productName: '',
        queryAuditState: '',
        recruitBatchId: '',
        itemId: '',
        classTypeId: '',
        productType: '',
        state: '',
        classTypeType:''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      submitLoading: false
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'product_branch_price_status', 'producttype', 'dic_Allow','class_type_type','teachMode','dic_Status','category_scope']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    //this.onSearch();
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '班型',
      fixed: 'left',
      width: 260,
      dataIndex: 'classTypeName',
    },
    {
      title: '商品名称',
      width: 200,
      dataIndex: 'productName',
      //自定义显示
      render: (text, record, index) => {
        return  <div className='textleft'><a onClick={() => { this.onLookView('ProductView', record) }}>{record.productName}</a></div>
      }
    },
    {
        title: '班型类型',
        width: 120,
        dataIndex: 'classTypeType',
    },
    {
        title: '授课方式',
        width: 120,
        dataIndex: 'teachModeName', 
    },
    {
        title: '科目范围',
        dataIndex: 'courseCategoryName', 
    },
    {
      title: '商品属性',
      width: 120,
      dataIndex: 'productTypeName'
    },
    {
      title: '重听',
      width: 120,
      dataIndex: 'isRehearName',
      //自定义显示
      render: (text, record, index) => (getDictionaryTitle(this.state.dic_Allow, record.isRehear))
    },
    {
      title: '商品状态',
      dataIndex: 'state',
      width: 120,
      //自定义显示
      render: (text, record, index) => (getDictionaryTitle(this.state.dic_Status, record.state))
    },
    {
      title: '商品标价(¥)',
      width: 120,
      dataIndex: 'productTotalPrice',
      //自定义显示
      render: (text, record, index) => (`${formatMoney(record.productTotalPrice)}`)
    },
    {
      title: '申请特价(¥)',
      width: 120,
      dataIndex: 'applyProductPrice',
      //自定义显示
      render: (text, record, index) => (`${formatMoney(record.applyProductPrice)}`)
    },
    {
      title: '申请日期',
      width: 120,
      dataIndex: 'createDate',
      //自定义显示
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    },
    {
      title: '审核情况',
      dataIndex: 'auditStatusName',
      width: 120,
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          {/* 待初审可以修改 */}
          {(record.isFinalAudit == 0 && record.auditStatus == 1) &&
            <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
          }
          {/* 初审未通过或进入终审环节 */}
          {((record.isFinalAudit == 0 && record.auditStatus == 3) || record.isFinalAudit == 1) &&
            <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
          } {/* 初审未通过或进入终审环节 */}
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    var condition = params || this.state.pagingSearch;
    if(!condition.recruitBatchId)return;
    this.setState({ loading: true });
    this.props.selectByFProductPricePriceApply(condition).payload.promise.then((response) => {
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
  setSubmitLoading = (flag) => {
      this.setState({ submitLoading: flag })
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
      this.setSubmitLoading(false);
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Create':
          this.props.addFProductPricePriceApply(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setSubmitLoading(false); 
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          });
          break;
        case 'Edit':
          this.props.updateFProductPricePriceApply(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setSubmitLoading(false); 
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }
  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ProductView':
        block_content = <ProductView
          viewCallback={this.onViewCallback}
          currentDataModel={this.state.currentDataModel}
          editMode={'View'}
        />
        break;
        break;
      case 'Create':
      case 'Edit':
      case 'View':
        block_content = <ProductPriceApplyView
          viewCallback={this.onViewCallback}
          setSubmitLoading={this.setSubmitLoading}
          {...this.state}
        />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: record.auditStatus > 0, // Column configuration not to be checked            
          }),
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<Button onClick={() => { this.onLookView('Create', { ...this.state.pagingSearch }) }} icon="plus" className="button_dark">新增申请</Button>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="招生季">
                        {getFieldDecorator('recruitBatchId', {
                          initialValue: this.state.pagingSearch.recruitBatchId
                        })(
                          <SelectRecruitBatch hideAll={true} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                            this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value })
                            //变更时自动加载数据
                            // this.onSearch();
                          }} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="特价申请状态" >
                        {getFieldDecorator('queryAuditState', { initialValue: this.state.pagingSearch.queryAuditState })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.product_branch_price_status.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目" >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId})(
                          <SelectItem scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="班型类型"
                        >
                            {getFieldDecorator('classTypeType', { initialValue: this.state.pagingSearch.classTypeType })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.class_type_type.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="班型" >
                        {getFieldDecorator('classTypeId', { initialValue: this.state.pagingSearch.classTypeId })(
                          <SelectClassType hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="商品属性" >
                        {getFieldDecorator('productType', { initialValue: this.state.pagingSearch.productType })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.producttype.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'商品名称'} >
                        {getFieldDecorator('productName', { initialValue: this.state.pagingSearch.productName })(
                          <Input placeholder="请输入商品名称" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                        {...searchFormItemLayout}
                        label = '商品状态'
                        >
                        {
                            getFieldDecorator('state',{ initialValue:this.state.pagingSearch.state})(
                            <Select>
                                <Option value="">全部</Option>
                                {
                                this.state.dic_Status.map(item=>{
                                    return <Option value={item.value}>{item.title}</Option>
                                })
                                }
                            </Select>
                            )
                        }
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
                rowKey={record => record.productPriceApplyId}//主键
                bordered
                scroll={{ x: 1800 }}
              //rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={10}>
                    <div className='flex-row'>
                      {/* {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                        <Button onClick={this.onBatchPublish} icon='rocket'>发布定价</Button> :
                        <Button disabled icon='rocket'>发布定价</Button>
                      } */}
                    </div>
                  </Col>
                  <Col span={14} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(ProductPriceApplyManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    selectByFProductPricePriceApply: bindActionCreators(selectByFProductPricePriceApply, dispatch),
    addFProductPricePriceApply: bindActionCreators(addFProductPricePriceApply, dispatch),
    updateFProductPricePriceApply: bindActionCreators(updateFProductPricePriceApply, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
