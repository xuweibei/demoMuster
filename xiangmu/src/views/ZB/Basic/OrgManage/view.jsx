import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Card, Radio, message, InputNumber, Checkbox
} from 'antd';
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
import './view.less'
import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class OrgView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      dic_FBTypes: [{ title: '官网分部', value: '2' }, { title: '线下分部', value: '1' }],
    };
    (this: any).onSubmit = this.onSubmit.bind(this);
  }
  componentWillMount() {
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据
        let { orgId, orgType } = this.state.dataModel;
        this.props.viewCallback({ orgId, orgType, ...values });//合并保存数据
      }
    });
  }
  //标题
  getTitle() {
    let op = getViewEditModeTitle(this.props.editMode);
    return `${op}${this.getOrgTypeTitle()}信息`;
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      return <FormItem
        className='btnControl'
        {...btnformItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
        <span className="split_button"></span>
        <Button icon="rollback" onClick={this.onCancel} >取消</Button>
      </FormItem>
    }
    else {
      return <FormItem
        className='btnControl'
        {...btnformItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
    }
  }

  getOrgTypeTitle = () => {
    return getDictionaryTitle(this.props.dic_OrgType, this.state.dataModel.orgType);
  }
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    //let filterMenus = this.props.menus.filter(A => A.name != "首页");
    switch (this.props.editMode) {
      case "Create":
      case "Edit":
        block_content = (
          <Form>
            <Row gutter={24}>
              {this.state.dataModel.orgType == 3 && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所在大区">
                  {getFieldDecorator('parentOrgid', {
                    initialValue: dataBind(this.state.dataModel.parentOrgid),
                    rules: [{ required: true, message: `请选择所在大区!` }]
                  })(
                    <Select
                      showSearch={true}
                      filterOption={(inputValue, option) => {
                        return (option.props.children.indexOf(inputValue) != -1);
                      }}
                    >
                      {this.props.last_depth_list.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
              }
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label={`${this.getOrgTypeTitle()}名称`}>
                  {getFieldDecorator('orgName', {
                    initialValue: this.state.dataModel.orgName,
                    rules: [{ required: true, message: `请输入${this.getOrgTypeTitle()}名称!` }],
                  })(
                    <Input placeholder={`${this.getOrgTypeTitle()}名称`} />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label={`${this.getOrgTypeTitle()}代码`}>
                  {getFieldDecorator('orgCode', {
                    initialValue: this.state.dataModel.orgCode,
                    rules: [{ required: true, message: `请输入${this.getOrgTypeTitle()}代码!` }],
                  })(
                    <Input placeholder={`${this.getOrgTypeTitle()}代码`} />
                    )}
                </FormItem>
              </Col>
              {/* 分部类型 */}
              {this.state.dataModel.orgType == 3 && <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部类型"
                >
                  {getFieldDecorator('branchType', {
                    initialValue: dataBind(this.state.dataModel.branchType),
                    rules: [{
                      required: true, message: '请选择负责分部类型!',
                    }],
                  })(
                    <Select>
                      {
                        this.state.dic_FBTypes.map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })
                      }
                    </Select>
                    )}
                </FormItem>
              </Col>
              }
              {
                this.state.dataModel.orgType == 3 &&
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="所在行政区号">
                    {getFieldDecorator('areaCode', {
                      initialValue: this.state.dataModel.areaCode,
                      rules: [{ required: true, message: '请输入行政区号!' }],
                    })(
                      <Input placeholder="所在行政区号" />
                      )}
                  </FormItem>
                </Col>
              }
              
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="负责人">
                  {getFieldDecorator('chargeMan', {
                    initialValue: this.state.dataModel.chargeMan,
                    // rules: [{ required: true, message: '请输入负责人!' }],
                  })(
                    <Input placeholder="负责人" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="移动电话">
                  {getFieldDecorator('mobile', {
                    initialValue: this.state.dataModel.mobile,
                    // rules: [
                    //   { required: true, message: '请输入移动电话!' },
                    //   {
                    //     validator: (rule, value, callback) => {
                    //       //const form = this.props.form;
                    //       var regex = /^[1][3,4,5,7,8][0-9]{9}$/;
                    //       if (!regex.test(value)) {
                    //         callback('不是有效的手机号！')
                    //       } else {
                    //         callback();
                    //       }
                    //     }
                    //   }]
                  })(
                    <Input placeholder="移动电话" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="电子信箱">
                  {getFieldDecorator('email', {
                    initialValue: this.state.dataModel.email,
                    rules: [{ type: 'email', message: '请输入有效邮箱!' }]
                  })(
                    <Input placeholder="邮箱" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="联系地址">
                  {getFieldDecorator('address', {
                    initialValue: this.state.dataModel.address,
                  })(
                    <Input placeholder="联系地址" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="邮政编码">
                  {getFieldDecorator('zipcode', {
                    initialValue: this.state.dataModel.zipcode,
                  })(
                    <Input placeholder="邮政编码" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="联系电话">
                  {getFieldDecorator('contactPhone', {
                    initialValue: this.state.dataModel.contactPhone,
                  })(
                    <Input placeholder="联系电话" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="传真电话">
                  {getFieldDecorator('faxPhone', {
                    initialValue: this.state.dataModel.faxPhone,
                  })(
                    <Input placeholder="传真电话" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="排序号">
                  {getFieldDecorator('orderNo', {
                    initialValue: this.state.dataModel.orderNo,
                    // rules: [{
                    //   validator: (rule, value, callback) => {
                    //     var regex = /^[0-9]*$/;
                    //     if (!regex.test(value)) {
                    //       callback('请输入数字！')
                    //     } else {
                    //       callback();
                    //     }
                    //   }
                    // }]
                  })(
                    <InputNumber placeholder="排序号" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="状态">
                  {getFieldDecorator('state', {
                    initialValue: this.state.dataModel.state,
                  })(
                    <RadioGroup value={this.state.dataModel.state} hasFeedback>
                      {this.props.dic_Status.map((item, index) => {
                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                      })}
                    </RadioGroup>
                    )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "View":
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label={`${this.getOrgTypeTitle()}名称`}>
                  {this.state.dataModel.orgName}
                </FormItem>
              </Col>
              {this.state.dataModel.orgType == 3 && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所在大区">
                  {getDictionaryTitle(this.props.last_depth_list, this.state.dataModel.parentOrgid)}
                </FormItem>
              </Col>
              }
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label={`${this.getOrgTypeTitle()}代码`}>
                  {this.state.dataModel.orgCode}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="状态">
                  {getDictionaryTitle(this.props.dic_Status, this.state.dataModel.state)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所在行政区号">
                  {this.state.dataModel.areaCode}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="负责人">
                  {this.state.dataModel.chargeMan}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="移动电话">
                  {this.state.dataModel.mobile}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="排序号">
                  {this.state.dataModel.orderNo}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="电子信箱">
                  {this.state.dataModel.email}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="联系地址">
                  {this.state.dataModel.address}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="邮政编码">
                  {this.state.dataModel.zipcode}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="联系电话">
                  {this.state.dataModel.contactPhone}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="传真电话">
                  {this.state.dataModel.faxPhone}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
      case "Delete":
        break;
    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        <div className="dv_split"></div>
        {block_editModeView}
        <div className="dv_split"></div>
      </ContentBox>

    );
  }
}

const WrappedView = Form.create()(OrgView);

const mapStateToProps = (state) => {
  return {
    //menus: state.menu.items
  }
};

function mapDispatchToProps(dispatch) {
  return {
    //getRoleFunList: bindActionCreators(getRoleFunList, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
