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
import ProductPriceView from './view';
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
  recruitProductPriceList, recruitProductPricePublish, recruitProductPriceCopy,
  recruitBindProductPriceInfoById,recruitProductPriceCancelPublish, recruitCourseProductPriceInfoById, recruitBindProductPriceInfoUpdate, recruitCourseProductPriceInfoUpdate
} from '@/actions/recruit';
class ProductPriceViewList extends React.Component {
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
        productType: '',
        state: '',
        classTypeType:''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项:
    this.loadBizDictionary(['dic_Status', 'publish_state', 'producttype','dic_Allow','class_type_type','teachMode','category_scope']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    // this.onSearch();
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '招生季',
      dataIndex: 'recruitBatchName',
      fixed: 'left',
      width: 160, 
    },
    {
      title: '商品名称',
      dataIndex: 'productName',  
      //自定义显示
      render: (text, record, index) => {
        return <div className='textleft'><a onClick={() => { this.onLookView('ProductView', record) }}>{record.productName}</a></div>
      }
    },
    {
        title: '班型类型',
        dataIndex: 'classTypeType',
    },
    {
        title: '授课方式',
        dataIndex: 'teachModeName'
    },
    {
        title: '科目范围',
        dataIndex: 'courseCategoryName',
    },
    {
      title: '商品状态',
      dataIndex: 'state',
      render: (text,record,index) => {
        return getDictionaryTitle(this.state.dic_Status,record.state)
      }
    },
    {
      title: '班型',
      dataIndex: 'classTypeName',
      render: (text, record, index) => {
        return <div>{text}</div>
      }
    },
    {
      title: '商品属性',
      dataIndex: 'productTypeName'
    },
    {
      title: '重听',
      dataIndex: 'isRehear',
      render:(text, record) =>{
        return getDictionaryTitle(this.state.dic_Allow, record.isRehear);
      }
    },
    {
      title: '商品定价(¥)',
      dataIndex: 'productTotalPrice',
      //自定义显示
      render: (text, record, index) => (`${formatMoney(record.productTotalPrice)}`)
    },
    {
      title: '商品限价(¥)',
      dataIndex: 'productLimitPrice',
      render: (text, record, index) => (`${formatMoney(record.productLimitPrice)}`)
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.publishState = 1;
    this.props.recruitProductPriceList(condition).payload.promise.then((response) => {
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
    console.log(item)
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
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
  onBatchCopy = () => {
    Modal.confirm({
      title: '是否复制上个招生季的商品价格数据吗?',
      content: '请确认',
      onOk: () => {
        //默认第一个招生季
        this.props.recruitProductPriceCopy(this.state.currentRecruitBatchId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message, 5);
          }
          else {
            message.success('复制成功');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
  onBatchPublish = () => {
    Modal.confirm({
      title: '是否发布所选商品吗?',
      content: '请确认',
      onOk: () => {
        this.props.recruitProductPricePublish(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('发布成功');
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

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ProductView':
        block_content = <ProductView
          viewCallback={this.onViewCallback}
          editMode={'View'}
          currentDataModel={{ productId: this.state.currentDataModel.productId, productType: this.state.currentDataModel.productType }} />
        break;
      case 'View': 
        block_content = <ProductPriceView
          viewCallback={this.onViewCallback}
          {...this.state}
          editMode={'View'}
        />
        break;
      case 'Manage':
      default:
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/productPrice/exportProductPriceZ'}//api下载地址
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
                      <FormItem {...searchFormItemLayout} label="招生季">
                        {getFieldDecorator('recruitBatchId', {
                          initialValue: this.state.pagingSearch.recruitBatchId
                        })(
                          <SelectRecruitBatch hideAll={false} isFirstSelected={true} onSelectChange={(value, selectOptions) => { 
                            this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value })
                            //变更时自动加载数据
                            // this.onSearch();
                          }} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目" >
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
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
                          <Input placeholder="商品名称" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="商品状态" >
                        {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_Status.map((item, index) => {
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
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                rowKey={record => record.productPriceId}//主键
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
const WrappedManage = Form.create()(ProductPriceViewList);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    recruitProductPriceList: bindActionCreators(recruitProductPriceList, dispatch),
    recruitProductPricePublish: bindActionCreators(recruitProductPricePublish, dispatch),
    recruitProductPriceCopy: bindActionCreators(recruitProductPriceCopy, dispatch),
    recruitProductPriceCancelPublish:bindActionCreators(recruitProductPriceCancelPublish,dispatch),
    recruitBindProductPriceInfoUpdate: bindActionCreators(recruitBindProductPriceInfoUpdate, dispatch),
    recruitCourseProductPriceInfoUpdate: bindActionCreators(recruitCourseProductPriceInfoUpdate, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
