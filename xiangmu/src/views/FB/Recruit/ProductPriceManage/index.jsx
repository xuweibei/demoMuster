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

import DropDownButton from '@/components/DropDownButton';
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ProductView from '@/views/ZB/Product/ProductView/view'
import ProductPriceApplyView from '../ProductPriceApply/view';
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
  recruitProductPriceListFB, addFProductPricePriceApply
} from '@/actions/recruit';
class ProductPriceList extends React.Component {
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
        recruitBatchId: '',
        itemId: '',
        classTypeId: '',
        productType: '',
        classTypeType:''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      submitLoading: false
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'producttype', 'dic_Allow','teachMode','class_type_type','category_scope']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    //this.onSearch();
  }
  componentWillUnMount() {
  }

  columns = [
    {
      title: '班型',
      fixed: 'left',
      width: 120,
      dataIndex: 'classTypeName',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      width: 200,
      //自定义显示
      render: (text, record, index) => {
        return <div className='textleft'><a onClick={() => { this.onLookView('ProductView', record) }}>{record.productName}</a></div>
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
      dataIndex: 'productTypeName',
      width: 120,

    },
    {
      title: '重听',
      width: 120,
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.dic_Allow, record.isRehear.toString());
      }
    },
    {
      title: '商品状态',
      width: 120,
      dataIndex: 'state',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.dic_Status, record.state);
      }
    },
    {
      title: '商品定价(¥)',
      width: 120,
      dataIndex: 'productTotalPrice',
      //自定义显示
      render: (text, record, index) => (`${formatMoney(record.productTotalPrice)}`)
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          {/* 待初审可以修改 */}
          {(record.applyStatus == 0) &&
            <Button onClick={() => { this.onLookView('QuickApply', record); }}>特价申请</Button>
          }
          {/* 若此招生季下存在“待初审”或“待终审”的特价申请，则显示文字“申请中” */}
          {(record.applyStatus == 1) && <span>申请中</span>
          }
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.branchPriceOpenFlag = 1;
    this.props.recruitProductPriceListFB(condition).payload.promise.then((response) => {
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
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  setSubmitLoading = (flag) => {
     this.setState({ submitLoading: flag })
  }
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setSubmitLoading(false);
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case 'QuickApply':
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
      }
    }
  }
  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'QuickApply':
        block_content = <ProductPriceApplyView
          viewCallback={this.onViewCallback}
          setSubmitLoading={this.setSubmitLoading}
          {...this.state}
        />
        break;
      case 'ProductView':
        block_content = <ProductView
          viewCallback={this.onViewCallback}
          editMode={'View'}
          currentDataModel={{ productId: this.state.currentDataModel.productId, productType: this.state.currentDataModel.productType }} />
        break;
      case 'Manage':
      default:
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/productPrice/exportProductPriceDorF'}//api下载地址
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
                    <Col span={24}>
                      <Row>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout}
                            style={{ paddingRight: 12 }}
                            label="招生季">
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
                      </Row>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目" >
                        {getFieldDecorator('itemId', { initialValue: '' })(
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
                        {getFieldDecorator('classTypeId', { initialValue: '' })(
                          <SelectClassType hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="商品属性" >
                        {getFieldDecorator('productType', { initialValue: '' })(
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
                rowKey={record => record.productPriceId}//主键
                bordered
                scroll={{ x: 1800 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={10}>
                    <div className='flex-row'>

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
const WrappedManage = Form.create()(ProductPriceList);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    addFProductPricePriceApply: bindActionCreators(addFProductPricePriceApply, dispatch),
    recruitProductPriceListFB: bindActionCreators(recruitProductPriceListFB, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
