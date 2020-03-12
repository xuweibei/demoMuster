import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber, message } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';

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
class DiscountView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      dataModel: props.currentDataModel,//数据模型
      partner_list: [],
      dicount_type: props.currentDataModel.productDiscountType,
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {

  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      let startDate = values.startDate;
      if(startDate){
        values.startDate = startDate[0];
        values.endDate = startDate[1];
      }
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据
        if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {

          var postData = {
            productDiscountId: this.state.dataModel.productDiscountId,
            startDate: formatMoment(values.startDate),
            endDate: formatMoment(values.endDate),
            productDiscountName: values.productDiscountName || this.state.dataModel.productDiscountName,
            productDiscountType: values.productDiscountType || this.state.dataModel.productDiscountType,
            productDiscountPrice: values.productDiscountPrice,
          }
          if(this.state.dataModel.discountNumber > 0 && (this.state.dataModel.productDiscountType != 4 || this.state.dataModel.productDiscountType != 5)){
            postData.productDiscountPrice = this.state.dataModel.productDiscountPrice;
          }
          if(values.fullPriceCondition){
            if(values.fullPriceCondition < postData.productDiscountPrice){
              message.error('优惠金额不能大于优惠条件！');
              return;
            }
          }
        }
        if (this.props.editMode == 'EditDate') {
          var postData = {
            ids: this.state.dataModel.ids.join(','),
            startDate: formatMoment(values.startDate),
            endDate: formatMoment(values.endDate),
          }
        }
        this.props.viewCallback({ ...values, ...postData, ids: Array.isArray(values.ids) ? values.ids.join(',') : values.ids });//合并保存数据
      }
    });
  }
  timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    return Y+M+D
  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'EditDate') {
      op = '批量修改'
      return `${op}有效期`
    }

    if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
      op = getViewEditModeTitle(this.props.editMode);
      return `${op}优惠规则`;
    }
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = this.props.editMode == 'EditDate' ? getViewEditModeTitle('Edit') : getViewEditModeTitle(this.props.editMode)
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
    let data = this.state.dataModel;
    data.startDate = this.timestampToTime(data.startDate);
    data.endDate = this.timestampToTime(data.endDate);
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    switch (this.props.editMode) {
      case "EditDate":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={24}>
                  <FormItem
                      {...searchFormItemLayout}
                      label="有效期">
                      {getFieldDecorator('startDate', { 
                        initialValue: (this.state.dataModel.startDate.indexOf('N')==-1)?[moment(this.state.dataModel.startDate,dateFormat),moment(this.state.dataModel.endDate,dateFormat)]:[],
                        rules: [{
                          required: true, message: '请选择优惠日期!',
                        }],
                    })(
                          <RangePicker style={{width:220}}/>
                      )}
                  </FormItem>
              </Col>

            </Row>

          </Form>
        );
        break;
      case "Create":
      case "Edit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={18}>
                {this.state.dataModel.discountNumber > 0 ?
                  <FormItem
                    {...searchFormItemLayout}
                    label="优惠名称"
                  >
                    {this.state.dataModel.productDiscountName}
                  </FormItem>
                  :
                  <FormItem
                    {...searchFormItemLayout}
                    label="优惠名称"
                  >
                    {getFieldDecorator('productDiscountName', {
                      initialValue: dataBind(this.state.dataModel.productDiscountName),
                      rules: [{
                        required: true, message: '请输入优惠名称!',
                      }],
                    })(
                      <Input placeholder='请输入优惠名称' />
                      )}
                  </FormItem>
                }
              </Col>
              <Col span={18}>
                {this.state.dataModel.discountNumber > 0 ?
                  <FormItem
                    {...searchFormItemLayout}
                    label="优惠类型"
                  >
                    {this.props.discount_type.filter(a => a.value == this.state.dataModel.productDiscountType).map((item) => { return (item.title) })}
                  </FormItem>
                  :
                  <FormItem
                    {...searchFormItemLayout}
                    label="优惠类型"
                  >
                    {getFieldDecorator('productDiscountType', {
                      initialValue: dataBind(this.state.dataModel.productDiscountType),
                      rules: [{
                        required: true, message: '请选择优惠类型!',
                      }],
                    })(
                      <Select style={{width:180}} onChange={(value, option) => {
                        this.setState({ dicount_type: value })
                      }}>
                        <Option value=''>--请选择优惠类型--</Option>
                        {this.props.discount_type.map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                      </Select>

                      )}
                  </FormItem>
                }
              </Col>
              {(this.state.dataModel.discountNumber > 0  && (this.state.dicount_type != 6 && this.state.dicount_type != 7)) ?
                <Col span={18}>
                  <FormItem
                    {...searchFormItemLayout}
                    label={this.state.dicount_type == 1 ? "折扣(%)" : '优惠金额'}
                  >
                    {this.state.dataModel.productDiscountPrice}{this.state.dicount_type == 1? '': '（¥）'}
                  </FormItem>
                </Col>
                :
                (this.state.dicount_type == 1 || this.state.dicount_type == 2 || this.state.dicount_type == 3) && <Col span={18}>
                  <FormItem
                    {...searchFormItemLayout}
                    label={this.state.dicount_type == 1 ? "折扣(%)" : '优惠金额'}
                  >
                    {getFieldDecorator('productDiscountPrice', {
                      initialValue: this.state.dataModel.productDiscountPrice,
                      rules: [{
                        required: true, message: this.state.dicount_type == 1 ? '请选择折扣!' : '请选择优惠金额!',
                      }],
                    })(
                      <InputNumber min={1} max={this.state.dicount_type == 1 ? 100 : Infinity} />
                      )}
                      &nbsp;{this.state.dicount_type == 1 ? '' : '（¥）'}
                  </FormItem>
                </Col>
              }
              {
                (this.state.dataModel.discountNumber > 0 && (this.state.dicount_type == 6 || this.state.dicount_type == 7)) ? <div>
                  <Col span={18}>
                    <FormItem
                      {...searchFormItemLayout}
                      label={'优惠条件'}
                    >
                    {getFieldDecorator('fullPriceCondition', {
                        initialValue: this.state.dataModel.fullPriceCondition,
                      })(
                        <div>{this.state.dicount_type == 6 ? '满' : '每满'}{this.state.dataModel.fullPriceCondition}元</div>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={18}>
                    <FormItem
                      {...searchFormItemLayout}
                      label={'优惠金额'}
                    >
                      减{this.state.dataModel.productDiscountPrice}元
                    </FormItem>
                  </Col>
                </div>
                :
                (this.state.dicount_type == 6 || this.state.dicount_type == 7) && <div>
                  <Col span={18}>
                    <FormItem
                      {...searchFormItemLayout}
                      label={'优惠条件'}
                    >
                      {getFieldDecorator('fullPriceCondition', {
                        initialValue: this.state.dataModel.fullPriceCondition,
                        rules: [{
                          required: true, message: '请选择优惠条件!',
                        }],
                      })(
                        <InputNumber min={1} max={Infinity} />
                        )}
                        &nbsp;{this.state.dicount_type == 6 ? '满' : '每满'}？元
                    </FormItem>
                  </Col>
                  <Col span={18}>
                    <FormItem
                      {...searchFormItemLayout}
                      label={'优惠金额'}
                    >
                      {getFieldDecorator('productDiscountPrice', {
                        initialValue: this.state.dataModel.productDiscountPrice,
                        rules: [{
                          required: true, message: '请选择优惠金额!',
                        }],
                      })(
                        <InputNumber min={1} max={Infinity} />
                        )}
                        &nbsp;减？元
                    </FormItem>
                  </Col>
                </div>
              }
              <Col span={18} >
                {this.state.dataModel.discountNumber > 0 ?
                  <FormItem
                    {...searchFormItemLayout}
                    label="适用项目"
                  >  {
                       getFieldDecorator('ids', { initialValue: this.state.dataModel.itemIds })
                     }
                    {this.state.dataModel.itemNames}
                  </FormItem> :
                  <FormItem
                    {...searchFormItemLayout}
                    label="适用项目"
                  >
                    {getFieldDecorator('ids',
                      {
                        initialValue: this.state.dataModel.itemIds ? dataBind(split(this.state.dataModel.itemIds)) : '',
                        rules: [{
                          required: true, message: '请选择优适用项目!',
                        }],
                      })(
                      <SelectItem scope='my' hideAll={false} showCheckBox={true} />
                      )}
                  </FormItem>
                }
              </Col>
              <Col span={18}>
                 <FormItem
                      {...searchFormItemLayout}
                      label="有效期">
                      {getFieldDecorator('startDate', { 
                        initialValue: (this.state.dataModel.startDate.indexOf('N')==-1)?([moment(this.state.dataModel.startDate,dateFormat),moment(this.state.dataModel.endDate,dateFormat)]):[],
                        rules: [{
                          required: true, message: '请选择优惠日期!',
                        }],
                      })(
                          <RangePicker style={{width:220}}/>
                      )}
                  </FormItem>
              </Col>


            </Row>

          </Form>
        );
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

const WrappedDiscountView = Form.create()(DiscountView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDiscountView);
