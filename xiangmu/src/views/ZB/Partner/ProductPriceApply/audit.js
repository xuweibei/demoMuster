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
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg';
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
import EditablePowerPartnerTagGroup from '@/components/EditablePowerPartnerTagGroup';


import {
  partnerProductPriceApplyList, partnerProductPriceApplyAudit, partnerProductPriceApplyBatchAudit
} from '@/actions/partner';
class ProductPriceAuditManage extends React.Component {
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
        recruitBatchId: '',
        itemId: '',
        auditStatus: '1',
        productName: '',
        partnerId: '',
        state: '1'
      },
      data: [],
      partnerData: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'product_partner_price_status', 'producttype', 'partner_class_type']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    //this.onSearch();
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '大客户名称',
      fixed: 'left',
      width: 200,
      dataIndex: 'orgName',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      //自定义显示
      render: (text, record, index) => {
        return <a onClick={() => { this.onLookView('ProductView', record) }}>{record.productName}</a>
      }
    },
    {
      title: '商品属性',
      dataIndex: 'productTypeName',
    },
    {
      title: '合作方式',
      dataIndex: 'classTypeName',
    },
    {
      title: '商品标价(¥)',
      dataIndex: 'productTotalPriceApply',
      //自定义显示
      render: (text, record, index) => (`${formatMoney(record.productTotalPriceApply)}`)
    },
    {
      title: '第三方结算价格(¥)',
      dataIndex: 'partnerBalancePrice',
      //自定义显示
      render: (text, record, index) => (`${formatMoney(record.partnerBalancePrice)}`)
    },
    {
      title: '缴费分期数	',
      dataIndex: 'term',
    },
    {
      title: '提交审核日期',
      dataIndex: 'createDate',
      //自定义显示
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    },

    {
      title: '审核日期',
      //自定义显示
      render: (text, record, index) => (`${timestampToTime(record.auditDate)}`)
    },
    {
      title: '状态',
      dataIndex: 'auditStatusName',
      render: (text, record, index) => (`${getDictionaryTitle(this.state.product_partner_price_status, record.auditStatus)}`)
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
     <DropDownButton>
          {/* 暂存或审核不通过时可以修改 */}
          {(record.auditStatus == 1) &&
            <Button onClick={() => { this.onLookView('Audit', record); }}>审核</Button>
          }
          {/* 待审核或审核通过后时可以查看 */}
          {(record.auditStatus !== 1) &&
            <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
          }
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.productName = condition.productName && condition.productName.replace(/(^\s+)|(\s+$)/g,'');
    
    this.setState({ partnerData: condition.partnerId })
    
    condition.partnerId = condition.partnerId.length ? condition.partnerId[0].id : '';

    this.props.partnerProductPriceApplyList(condition).payload.promise.then((response) => {
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
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Audit':
          this.props.partnerProductPriceApplyAudit(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
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
        case 'BatchAudit':
          this.props.partnerProductPriceApplyBatchAudit(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
              message.error(data.message);
            }
            else {
              message.success('提交审核成功');
              this.setState({ UserSelecteds: [] })
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


        
      case 'View':
      case 'Audit':
      case 'BatchAudit':
        block_content = <ProductPriceApplyView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: !(record.auditStatus == 1), // 暂存或审核未通过的可以提交审核            
          }),
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
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
                            this.onSearch();
                          }} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目" >
                        {getFieldDecorator('itemId', { initialValue: '' })(
                          <SelectItem scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="大客户名称" >
                        {getFieldDecorator('partnerId', { initialValue: (!this.state.partnerData.length ? [] : [{
                            id: this.state.partnerData[0].id,
                            name: this.state.partnerData[0].name
                          }]) })(
                          <EditablePowerPartnerTagGroup maxTags={1} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="状态" >
                        {getFieldDecorator('auditStatus', { initialValue: this.state.pagingSearch.auditStatus })(
                          <Select>
                            {this.state.product_partner_price_status.filter(a => parseInt(a.value) > 0).map((item, index) => {
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
                      <FormItem {...searchFormItemLayout} label={'商品启用状态'} >
                        {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                          <Select>
                              <Option value='1' key='1'>启用</Option>
                              <Option value='0' key='0'>停用</Option>
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
                rowKey={record => record.productPriceApplyId}//主键
                bordered
                scroll={{ x: 1300 }}
                rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={10}>
                    <div className='flex-row'>
                      {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                        <Button onClick={() => {
                          this.onLookView('BatchAudit', this.state.UserSelecteds)
                        }} icon='rocket'>批量审核</Button> :
                        <Button disabled icon='rocket'>批量审核</Button>
                      }
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
const WrappedManage = Form.create()(ProductPriceAuditManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    partnerProductPriceApplyList: bindActionCreators(partnerProductPriceApplyList, dispatch),
    partnerProductPriceApplyAudit: bindActionCreators(partnerProductPriceApplyAudit, dispatch),
    partnerProductPriceApplyBatchAudit: bindActionCreators(partnerProductPriceApplyBatchAudit, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
