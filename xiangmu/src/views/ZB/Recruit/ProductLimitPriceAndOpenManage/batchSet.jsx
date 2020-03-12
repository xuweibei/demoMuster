import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber, message } from 'antd';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';

import {
  batchLimitPrice
} from '@/actions/recruit';
const FormItem = Form.Item;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class View extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      regRegions: [],
      limitPriceType: 0
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {

  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'BatchSet') {
      op = '商品限价及特价申请开放情况'
      return `${op}`
    }

  }
  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据

        let productPriceLimits = [];

        this.props.UserSelectedsRows.map((item) => {
          productPriceLimits.push({
            productPriceLimitId : item.productPriceLimitId,
            productId : item.productId,
          })
        })

        values.flag = 1;
        values.productPriceLimits = JSON.stringify(productPriceLimits);

        this.props.batchLimitPrice(values).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({ loading: false });
            if (data.state === 'error') {
                message.error(data.msg, 5);
            }
            else {
                message.success('批量设置成功');
                this.props.viewCallback();
            }
        })
      }
    });



  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode == 'BatchSet') {
      var button_title = '确定'
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

    switch (this.props.editMode) {
      case "BatchSet":
        let lable = '您批量选择了' + `${this.state.dataModel.ids.length}` + '个商品进行限价设置:';
        block_content = (
          <Form className="search-form">
            <div style={{marginBottom:20}}>{lable}</div>
            <Row gutter={24}>
              <Col span={12} >
                    <FormItem
                        {...searchFormItemLayout}
                        label="商品限价情况"
                    >
                        {getFieldDecorator('productLimitType', { 
                            initialValue: '',
                            rules: [{
                                required: true, message: '请选择限价情况!',
                            }],
                          })(
                            <Select onChange={(value) => {
                                    this.setState({
                                        limitPriceType: value
                                    })
                            }}>
                                <Option value=''>--请选择--</Option>
                                {this.props.price_limit.filter(a => a.value != 0).map((item, index) => {
                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                })}
                            </Select>
                        )}
                    </FormItem>
                </Col>
                <Col span={12} >
                </Col>
                {
                    this.state.limitPriceType == 2 ? <div>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="限价金额"
                        >
                            {getFieldDecorator('productLimitPrice', { 
                                initialValue: '',
                                rules: [{
                                    required: true, message: '请输入限价金额!',
                                }],
                            })(
                                <InputNumber min={1} step={1} style={{width:150}} placeholder='请输入限价金额' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12} >
                    </Col>
                    </div>
                    :
                    ''
                }
                {
                    this.state.limitPriceType == 1 ? <div>
                        <Col span={12} >
                            <FormItem
                                {...searchFormItemLayout}
                                label="限价比例"
                            >
                                {getFieldDecorator('productLimitPrice', { 
                                    initialValue: '',
                                    rules: [{
                                        required: true, message: '请输入限价比例!',
                                    }],
                                })(
                                    <InputNumber min={1} max={100} step={1} style={{width:150}} placeholder='请输入限价比例' />
                                )}
                                &nbsp;%
                            </FormItem>
                        </Col>
                        <Col span={12} >
                        </Col>
                    </div>
                    :
                    ''
                }
            </Row>
          </Form>
        )
        break;


    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        {block_editModeView}
      </ContentBox>
    );
  }
}

const WrappedView = Form.create()(View);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    batchLimitPrice: bindActionCreators(batchLimitPrice, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
