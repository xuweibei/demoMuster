import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, formatMoney } from '@/utils';
import { loadBizDictionary, searchFormItemLayout, onPageIndexChange, onShowSizeChange, } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { discountRuleProductQuery, discountRuleProductDelete } from '@/actions/recruit';



const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

const CheckboxGroup = Checkbox.Group;
const dateFormat = 'YYYY-MM-DD';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class FitProductView extends React.Component {
  constructor(props) {
    super(props)
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        productDiscountId: props.currentDataModel.productDiscountId,
      },
      UserSelecteds: [],
      totalRecord: 0,
    };
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.fetch();
  }
  onSubmit = () => {

    var postData = {
      productDiscountId: this.state.dataModel.productDiscountId,
      ids: this.state.dataModel.itemIds,
      itemNames: this.state.dataModel.itemNames,
    }
    this.props.viewCallback({ ...postData });
  }
  onBatchDelete = () => {
    Modal.confirm({
      title: '是否删除所选商品?',
      content: '点击确认删除所选商品!否则点击取消！',
      onOk: () => {
        this.props.discountRuleProductDelete({ ids: this.state.UserSelecteds.join(','), productDiscountId: this.state.dataModel.productDiscountId }).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            this.setState({ UserSelecteds: [] })
            this.fetch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });

  }
  columns = [
    {
      title: '班型',
      dataIndex: 'classTypeName',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
    },
    {
      title: '商品属性',
      dataIndex: 'productType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.props.producttype, record.productType);
      }
    },

    {
      title: '重听',
      dataIndex: 'isRehear',
      render: (text, record, index) => {
        return getDictionaryTitle(this.props.dic_Allow, record.isRehear);
      }
    },

    {
      title: '创建日期',
      dataIndex: 'createDate',
      render: (text, record, index) => {
        return timestampToTime(record.createDate)
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      render: (text, record, index) => {
        return getDictionaryTitle(this.props.dic_Status, record.state);
      },
    }
  ];

  //检索数据
  fetch = () => {
    this.setState({ loading: true });
    var condition = this.state.pagingSearch;
    this.props.discountRuleProductQuery(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ ...data, loading: false })
      }
    })
  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'Fit') {
      op = '适用商品'
      return `${op}`
    }

  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = '增加适用商品'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="plus" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
      </FormItem>
    }
    else {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
    }
  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "Fit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="优惠名称"
                >
                  {this.state.dataModel.productDiscountName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="适用范围"
                >
                  {getDictionaryTitle(this.props.discount_fit_scope, this.state.dataModel.fitScope)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;

    }
    return block_content;
  }

  renderTableView() {
    var rowSelection = {
      selectedRowKeys: this.state.UserSelecteds,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ UserSelecteds: selectedRowKeys })
      },
      getCheckboxProps: record => ({
        disabled: false,    // Column configuration not to be checked
      }),
    };
    let block_content =
      <div>
        <div className="space-default"></div>
        <div className="search-result-list">
          <Table columns={this.columns} //列定义
            loading={this.state.loading}
            rowSelection={rowSelection}
            rowKey={'productDiscountProductId'}
            pagination={false}
            dataSource={this.state.data}//数据
            bordered
          />
          <div className="space-default"></div>
          <div className="search-paging">
            <Row justify="space-between" align="middle" type="flex">
              <Col span={6}>
                {this.state.UserSelecteds.length > 0 ?
                  <Button onClick={this.onBatchDelete} icon="delete">删除</Button> :
                  <Button disabled icon="delete">删除</Button>
                }
              </Col>
              <Col span={18} className='search-paging-control'>
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
      </div>


    return (block_content)
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    let block_tableView = this.renderTableView();
    return (
      <div>
        <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
          {block_editModeView}
        </ContentBox>
        {block_tableView}
      </div>

    );
  }
}

const WrappedFitProductView = Form.create()(FitProductView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    discountRuleProductQuery: bindActionCreators(discountRuleProductQuery, dispatch),
    discountRuleProductDelete: bindActionCreators(discountRuleProductDelete, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedFitProductView);
