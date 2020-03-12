/*
限价及特价申请开放管理
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, InputNumber
} from 'antd';
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ProductView from '@/views/ZB/Product/ProductView/view'
import ProductPriceCreate from './create';
import ProductPriceView from './view';
import DropDownButton from '@/components/DropDownButton';

import BatchSet from './batchSet';

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
  queryProductPriceLimitVos, batchLimitPrice, recruitProductPriceCopy,
  recruitBindProductPriceInfoById,recruitProductPriceCancelPublish, recruitCourseProductPriceInfoById, recruitBindProductPriceInfoUpdate, recruitCourseProductPriceInfoUpdate
} from '@/actions/recruit';
class ProductLimitPriceAndOpenManage extends React.Component {
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
        publishState: '',
        recruitBatchId: '',
        itemId: '',
        classTypeId: '',
        classTypeType: '',
        productState: '',
        productType: '',
        branchPriceOpenFlag: '',
        productLimitType: ''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      UserSelectedsRows: [],
      isLimitPrice: '',
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'producttype','class_type_type','price_limit','price_open_flag']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    // this.onSearch();
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '班型',
      fixed: 'left',
      width: 120,
      dataIndex: 'classTypeName',
      render: (text, record, index) => {
        return <div className='textleft'>{text}</div>
      }
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      width: 250,
      //自定义显示
      render: (text, record, index) => {
        return <div className='textleft'><a onClick={() => { this.onLookView('ProductView', record) }}>{record.productName}</a></div>
      }
    },
    {
      title: '商品属性',
      dataIndex: 'productType'
    },
    {
      title: '商品状态',
      dataIndex: 'productState'
    },
    {
      title: '限价情况',
      dataIndex: 'productLimitType'
    },
    {
      title: '限价比例',
      dataIndex: 'productLimitPrice',
      render: (text, record, index) => (record.productLimitTypeFlag == 1 ? `${record.productLimitPrice}%` : '--')
    },
    {
      title: '限价(¥)',
      dataIndex: 'productLimitPrice2',
      //自定义显示
      render: (text, record, index) => (record.productLimitTypeFlag == 2 ? `${formatMoney(record.productLimitPrice)}` : '--')
    },
    {
      title: '特价申请',
      dataIndex: 'branchPriceOpenFlagMsg',
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
            <Button onClick={() => { this.onLookView('Edit', record); }}>修改</Button>
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.queryProductPriceLimitVos(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false,
          UserSelectedsRows: [],
          UserSelecteds: []
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
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.onSearch();
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Create':
          //进入管理页
          this.onSearch();
          this.onLookView("Manage", null);
          break;
      }
    }
  }

  onBatchCancelLimitPrice = () => {
    Modal.confirm({
      title: '您确定对所选的'+this.state.UserSelecteds.length+'个商品进行取消限价吗?',
      content: '请确认',
      onOk: () => {

        let productPriceLimitIds = [];
        this.state.UserSelectedsRows.map((item) => {
          productPriceLimitIds.push(item.productPriceLimitId)
        })

        let params = {
          flag: 2,
          productPriceLimitIds: productPriceLimitIds.join(','),
        }
        this.props.batchLimitPrice(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('批量操作成功！');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

  onBatchApplyOpen = () => {
    Modal.confirm({
      title: '您确定对所选的'+this.state.UserSelecteds.length+'个商品进行特价申请开放吗?',
      content: '请确认',
      onOk: () => {

        let params = {
          flag: 3,
          productIds: this.state.UserSelecteds.join(','),
        }
        this.props.batchLimitPrice(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('批量操作成功！');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

  onBatchApplyClose = () => {
    Modal.confirm({
      title: '您确定对所选的'+this.state.UserSelecteds.length+'个商品进行特价申请关闭吗?',
      content: '请确认',
      onOk: () => {

        let params = {
          flag: 4,
          productIds: this.state.UserSelecteds.join(','),
        }
        this.props.batchLimitPrice(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('批量操作成功！');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

  

  onBatchSetLimitPrice = () => {
      this.onLookView("BatchSet", { ids: this.state.UserSelecteds })
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ProductView':
        block_content = <ProductView
          viewCallback={this.onViewCallback}
          editMode={'View'}
          currentDataModel={{ productId: this.state.currentDataModel.productId, productType: this.state.currentDataModel.productType }} />
        break;
      case 'BatchSet':
        block_content = <BatchSet viewCallback={this.onViewCallback} {...this.state} />
        break;
      case 'Create':
        block_content = <ProductPriceCreate
          recruitBatchId={this.state.currentDataModel.recruitBatchId}//当前招生批次
          viewCallback={this.onViewCallback}
          editMode={'Manage'} />
        break;

      case 'Edit':
        block_content = <ProductPriceView
          viewCallback={this.onViewCallback}
          {...this.state}
          editMode={'Edit'}
        />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            this.setState({ UserSelecteds: selectedRowKeys });
            this.setState({ UserSelectedsRows: selectedRows });
          }
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/productPriceLimit/exportProductPriceLimitVos'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目" >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                          <SelectItem scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={24}></Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="班型" >
                        {getFieldDecorator('classTypeId', { initialValue: this.state.pagingSearch.classTypeId })(
                          <SelectClassType hideAll={false} />
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
                      <FormItem {...searchFormItemLayout} label="商品状态" >
                        {getFieldDecorator('productState', { initialValue: this.state.pagingSearch.productState })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_Status.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'商品名称'} >
                        {getFieldDecorator('productName', { initialValue: this.state.pagingSearch.productName })(
                          <Input placeholder="商品名称" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="特价申请"
                        >
                            {getFieldDecorator('branchPriceOpenFlag', { initialValue: this.state.pagingSearch.branchPriceOpenFlag })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.price_open_flag.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="限价情况"
                        >
                            {getFieldDecorator('productLimitType', { initialValue: this.state.pagingSearch.productLimitType })(
                                <Select onChange={(value) => {

                                    this.state.pagingSearch.productLimitPriceStart = '';
                                    this.state.pagingSearch.productLimitPriceEnd = '';

                                    this.setState({
                                        isLimitPrice: value,
                                        pagingSearch: this.state.pagingSearch
                                    })
                              }}>
                                    <Option value="">全部</Option>
                                    {this.state.price_limit.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    {
                      this.state.isLimitPrice == 2 && <Col span={12}>
                          <FormItem
                              {...searchFormItemLayout}
                              label="限价金额">
                              {getFieldDecorator('productLimitPriceStart', { initialValue: '' })(
                                  <InputNumber min={1} step={1} style={{width:80}} placeholder='' value={this.state.pagingSearch.productLimitPriceStart} />
                              )}
                              <span style={{marginLeft:4,marginRight:4}}> 至 </span>
                              {getFieldDecorator('productLimitPriceEnd', { initialValue: '' })(
                                  <InputNumber min={1} step={1} style={{width:80}} placeholder='' value={this.state.pagingSearch.productLimitPriceEnd} />
                              )}
                          </FormItem>
                      </Col>
                    }
                    {
                      this.state.isLimitPrice == 1 && <Col span={12}>
                          <FormItem
                              {...searchFormItemLayout}
                              label="限价比例">
                              {getFieldDecorator('productLimitPriceStart', { initialValue: '' })(
                                  <InputNumber min={1} max={100} step={1} style={{width:60}} placeholder='' value={this.state.pagingSearch.productLimitPriceStart} />
                              )}
                              %
                              <span style={{marginLeft:4,marginRight:4}}> 至 </span>
                              {getFieldDecorator('productLimitPriceEnd', { initialValue: '' })(
                                  <InputNumber min={1} max={100} step={1} style={{width:60}} placeholder='' value={this.state.pagingSearch.productLimitPriceEnd} />
                              )}
                              %
                          </FormItem>
                      </Col>
                    }
                    
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
                rowKey={record => record.productId}//主键
                bordered
                scroll={{ x: 1300 }}
                rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} style={{paddingBottom:'20px'}}>
                      {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                        <Button onClick={this.onBatchSetLimitPrice}>批量设置限价</Button> :
                        <Button disabled>批量设置限价</Button>
                      }
                      <div className='split_button' style={{ width: 10 }}></div>
                      {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                        <Button onClick={this.onBatchCancelLimitPrice}>批量取消限价</Button> :
                        <Button disabled>批量取消限价</Button>
                      }
                      <div className='split_button' style={{ width: 10 }}></div>
                      {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                        <Button onClick={this.onBatchApplyOpen}>特价申请开放</Button> :
                        <Button disabled>特价申请开放</Button>
                      }
                      <div className='split_button' style={{ width: 10 }}></div>
                      {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                        <Button onClick={this.onBatchApplyClose}>特价申请关闭</Button> :
                        <Button disabled>特价申请关闭</Button>
                      }
                  </Col>
                </Row>
                <Row justify="end" align="right" type="flex">
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
const WrappedManage = Form.create()(ProductLimitPriceAndOpenManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    queryProductPriceLimitVos: bindActionCreators(queryProductPriceLimitVos, dispatch),
    batchLimitPrice: bindActionCreators(batchLimitPrice, dispatch),
    recruitProductPriceCopy: bindActionCreators(recruitProductPriceCopy, dispatch),
    recruitProductPriceCancelPublish:bindActionCreators(recruitProductPriceCancelPublish,dispatch),
    recruitBindProductPriceInfoUpdate: bindActionCreators(recruitBindProductPriceInfoUpdate, dispatch),
    recruitCourseProductPriceInfoUpdate: bindActionCreators(recruitCourseProductPriceInfoUpdate, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
