import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment ,formatMoney} from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import { loadDictionary } from '@/actions/dic';
import {message} from "antd/lib/index";

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

//业务接口方法引入
import { auditDiscountRuleDetail } from '@/actions/recruit';



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

    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      data_list: [],
      dicount_type: props.currentDataModel.productDiscountType,
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['discount_type']);
    this.fetch();
  }
  //检索数据
  fetch = () => {
    this.setState({ loading: true });
    let condition = { productDiscountId: this.state.dataModel.productDiscountId };

    this.props.auditDiscountRuleDetail(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ data_list: data.data, loading: false })

      }
    })
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
            productDiscountPrice: values.productDiscountPrice || this.state.dataModel.productDiscountPrice,
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
    let op = getViewEditModeTitle(this.props.editMode);
    console.log(this.props.editMode)
    return `${op}优惠规则详细信息`;
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
    console.log(this.state)
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    JSON.stringify(this.state.dataModel)
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
      case "View":
      case "Edit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="分部">
                  {this.state.data_list.divisionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所属大区">
                  {this.state.data_list.regionName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="优惠名称" >
                  {this.state.data_list.productDiscountName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="优惠类型">
                  {getDictionaryTitle(this.state.discount_type, this.state.data_list.productDiscountType)}
                </FormItem>
              </Col>
              {
                (this.state.dataModel.productDiscountType==6 || this.state.dataModel.productDiscountType==7) && <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={`${getDictionaryTitle(this.props.discount_type, this.state.dataModel.productDiscountType)}条件（¥）`}
                  >
                  {formatMoney(this.state.dataModel.fullPriceCondition)}
                  </FormItem>
                </Col>
              }
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="优惠金额（¥）" >
                  {formatMoney(this.state.data_list.productDiscountPrice)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="优惠有效期">
                  {timestampToTime(this.state.data_list.startDate)}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="适用项目"
                >
                  {this.state.data_list.itemNames}

                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="互斥规则"
                >
                  {this.state.data_list.discountMutexNames}

                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="适用商品"
                >
                  {this.state.data_list.fitProductNames}

                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="申请理由"
                >
                  {this.state.data_list.applyReason}

                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="申请人" >
                  {this.state.data_list.createUserName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="申请日期">
                  {timestampToTime(this.state.data_list.createDate)}
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
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    auditDiscountRuleDetail: bindActionCreators(auditDiscountRuleDetail, dispatch),//根据学生id查询学生信息接口
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDiscountView);
