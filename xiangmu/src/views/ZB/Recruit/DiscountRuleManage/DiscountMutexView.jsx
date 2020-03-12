import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, formatMoney } from '@/utils';
import { loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { discountRuleMutexQuery } from '@/actions/recruit';



const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};
const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};


const CheckboxGroup = Checkbox.Group;


const dateFormat = 'YYYY-MM-DD';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class DiscountMutexView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      UserSelecteds: [],
    };
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.fetch();
  }
  onSubmit = () => {
    var postData={
      productDiscountId:this.state.dataModel.productDiscountId,
      ids:this.state.UserSelecteds.join(',')
    }
      this.props.viewCallback({...postData});
  }
  columns = [
    {
      title: '优惠规则名称',
      dataIndex: 'productDiscountName',
    },
    {
      title: '项目',
      dataIndex: 'itemNames',
      render: (text, record, index) => {
        return record.itemNames
      }
    },
    {
      title: '类型',
      dataIndex: 'productDiscountType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.props.discount_type, record.productDiscountType);
      }
    },
    {
      title: '优惠金额（¥）',
      dataIndex: 'productDiscountPrice',
      render: (text, record, index) => {
        return record.productDiscountType == 2 && formatMoney(record.productDiscountPrice);
      }
    },
    {
      title: '折扣（%）',
      dataIndex: 'productDiscountPrice2',
      render: (text, record, index) => {
        return record.productDiscountType == 1 && record.productDiscountPrice;
      }
    },

    {
      title: '有效期',
      dataIndex: 'startDate',
      render: (text, record, index) => {
        return timestampToTime(record.startDate) + " 至" + timestampToTime(record.endDate);
      }
    },

  ];

  //检索数据
  fetch = (params = { productDiscountId: this.state.dataModel.productDiscountId }) => {
    this.setState({ loading: true });
    var condition = params;
    this.props.discountRuleMutexQuery(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ ...data, loading: false })
      
        this.state.data.filter(a => { return a.fit == true }).map(a => {
          this.state.UserSelecteds.push(a.productDiscountId)
        })
        this.setState({UserSelecteds:this.state.UserSelecteds})
      }
    })
  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'Mutex') {
      op = '优惠互斥设置'
      return `${op}`
    }

  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = '确定互斥'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
      case "Mutex":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="项目"
                >
                  {this.state.dataModel.itemNames}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="类型"
                >
                  {this.state.dataModel.discount_type_name}
                </FormItem>
              </Col>
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
                  label="有效期开始日期"
                >
                  {timestampToTime(this.state.dataModel.startDate)} 至 {timestampToTime(this.state.dataModel.endDate)}
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
      <Row justify="center" gutter={24}>
        <Col span={24} className={'search-paging-control'}>
          <div className="space-default"></div>
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
              loading={this.state.loading}
              rowSelection={rowSelection}
              rowKey={record=>record.productDiscountId}
              pagination={false}
              dataSource={this.state.data}//数据
              bordered
            />
          </div>
        </Col>
      </Row>

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

const WrappedDiscountMutexView = Form.create()(DiscountMutexView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    discountRuleMutexQuery: bindActionCreators(discountRuleMutexQuery, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDiscountMutexView);
