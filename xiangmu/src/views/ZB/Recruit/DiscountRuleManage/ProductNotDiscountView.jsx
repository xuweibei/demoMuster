import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, formatMoney } from '@/utils';
import { loadBizDictionary, onSearch, searchFormItemLayout,searchFormItemLayout24, renderSearchTopButtons, renderSearchBottomButtons, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import { discountRuleNotProductQuery } from '@/actions/recruit';



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
class ProductNotDiscountView extends React.Component {
  constructor(props) {
    super(props)
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      dataModel: props.currentDataModel,//数据模型
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        productDiscountId: props.currentDataModel.productDiscountId,
        ids: props.currentDataModel.ids,
        classTypeId: "",
        productType: "",
        productName: "",

      },
      UserSelecteds: [],
      itemlist: [],
    };
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
   
    var a=split(this.state.dataModel.itemNames);
    var b=split(this.state.dataModel.ids);
      a.map((title,i) => {
      this.state.itemlist.push({ value: b[i], title: title })
    })
   
    this.setState({itemlist:this.state.itemlist})

    this.onSearch()
  }
  onSubmit = () => {

    var postData = {
      productDiscountId: this.state.dataModel.productDiscountId,
      ids: this.state.UserSelecteds.join(","),
      productDiscountName:this.state.dataModel.productDiscountName,
      fitScope:this.state.dataModel.fitScope
    }
    this.props.viewCallback({ ...postData });

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
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let arr = condition.ids;
    if(Array.isArray(arr)){
      condition.ids = arr.toString();
    }
    this.props.discountRuleNotProductQuery(condition).payload.promise.then((response) => {
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
      op = '新增排除商品'
      return `${op}`
    }

  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = '确定'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{button_title}</Button>
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
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    let extendButtons = [];
   extendButtons.push(<Button icon="rollback" onClick={this.onCancel} >取消</Button>)
    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "AddFit":
        block_content = (
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
              <Form
                className="search-form"
              >
                <Row justify="center" gutter={24} align="middle" type="flex">
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'班型'} >
                      {getFieldDecorator('classTypeId', { initialValue: this.state.pagingSearch.classTypeId })(
                        <SelectClassType hideAll={false} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'商品属性'} >
                      {getFieldDecorator('productType', { initialValue: dataBind(this.state.pagingSearch.productType) })(
                        <Select>
                          <Option value=''>全部</Option>
                          {this.props.producttype.map((item, index) => {
                            return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>

                  <Col span={24} >
                    <FormItem
                      {...searchFormItemLayout24}
                      style={{ paddingRight: 18 }}
                      label="商品名称"
                    >
                      {getFieldDecorator('productName', { initialValue: this.state.pagingSearch.productName })(
                        <Input placeholder='请输入商品名称'/>
                      )}
                    </FormItem>
                  </Col>

                  <Col span={24} >
                    <FormItem
                      {...searchFormItemLayout24}
                      style={{ paddingRight: 18 }}
                      label="相关项目"
                    >
                      {getFieldDecorator('ids', { initialValue: dataBind(split(this.state.pagingSearch.ids)) })(
                        <CheckboxGroup>
                          {
                            this.state.itemlist.map((item, index) => {
                              return <Checkbox value={item.value} key={index}>{item.title}</Checkbox>
                            })
                          }
                        </CheckboxGroup>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            }
          </ContentBox>
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
        <div className="search-result-list">
          <Table columns={this.columns} //列定义
            loading={this.state.loading}
            rowSelection={rowSelection}
            rowKey={'productId'}
            pagination={false}
            dataSource={this.state.data}//数据
            bordered
          />
          <div className="space-default"></div>
          <div className="search-paging">
            <Row justify="space-between" align="middle" type="flex">
              <Col span={6}>{this.renderBtnControl()}</Col>
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
        {block_editModeView}
        <div className="dv_split"></div>
        {block_tableView}
      </div>

    );
  }
}

const WrappedProductNotDiscountView = Form.create()(ProductNotDiscountView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    discountRuleNotProductQuery: bindActionCreators(discountRuleNotProductQuery, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductNotDiscountView);
