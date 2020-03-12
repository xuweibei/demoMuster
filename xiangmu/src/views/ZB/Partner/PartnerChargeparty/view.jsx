import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Card, Radio, message, Checkbox, Cascader
} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
import ContentBox from '@/components/ContentBox';
import SearchInput from '@/components/SearchInput';
import EditableOrgTagGroup from '@/components/EditableOrgTagGroup';
import EditableAllUniversityTagGroup from '@/components/EditableAllUniversityTagGroup';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import AreasSelect from '@/components/AreasSelect';
import SelectItem from '@/components/BizSelect/SelectItem';
import './view.less'

import {searchFormItemLayout, searchFormItemLayout24, loadBizDictionary } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { orgBranchList, allUniversityList, getUserList } from '@/actions/admin';
import { getPartnerById } from '@/actions/partner';

const btnformItemLayout = {
  wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class PartnerView extends React.Component {
  select_timeout: null;
  select_current_value: '';
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      areas: [],  //省市列表
      dic_YesNo: [],
      dic_university_list: [],
      dic_branch_list: [],
    };
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).onSubmit = this.onSubmit.bind(this);

    //(this: any).onSignStateChange = this.onSignStateChange.bind(this);
  }
  componentWillMount() {
    //  是否考虑退费1-是0-否
    //  配合度1-非常好2-较好3-中4-较差5-非常差

    this.loadBizDictionary(['dic_YesNo', 'cooperate_status', 'university_level']);

    if (this.props.currentDataModel.partnerId) {
      this.props.getPartnerById(this.props.currentDataModel.partnerId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          this.setState({
            dataModel: data.data
          })
        }
      });
    }
  }

  //----------------- end
  onChangePartnerType(e) {
    if (e.target.value) {
      var d = this.state.dataModel;
      d.partnerType = e.target.value;
      this.setState({
        dataModel: d
      })
    }
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  onSubmit = () => {
    var that = this;
    if (this.props.editMode == "Delete") {
      Modal.confirm({
        title: '你确认要删除该角色吗?',
        content: '角色删除后，相关用户权限将受限！',
        onOk: () => {
          this.props.viewCallback(this.state.dataModel);//保存数据
        },
        onCancel: () => {
          console.log('Cancel');
        },
      });
    }
    else {
      //表单验证后，合并数据提交
      this.props.form.validateFields((err, values) => {
        if (!err) {
          //values.orgType = values.orgType || that.state.orgType;
          //values.state = values.state || that.state.dataModel.state;
          //values.branchId = this.state.dataModel.branchId;
          that.setState({ loading: true });
          setTimeout(() => {
            that.setState({ loading: false });
          }, 3000);//合并保存数据
          //values.partnerClassType = values.partnerClassType.toString();
          values.itemIds = values.itemIds.toString();
          if (values.areaId) {
            values.areaId = values.areaId[values.areaId.length - 1];
          }
          values.devChargeUid = values.devChargeUid[0].id;
          if (this.state.dataModel.partnerType == 1) {
            values.universityId = values.universityId[0].id;
          }
          values.partnerType = this.state.dataModel.partnerType;

          values.branchId = values.branchId[0].id;

          that.props.viewCallback({
            //...that.state.dataModel,
            ...values,
            //isBalanceRefund: that.state.dataModel.isBalanceRefund,


            partnerId: that.state.dataModel.partnerId
          });//合并保存数据
        }
      });
    }
  }
  //标题
  getTitle() {
    let op = getViewEditModeTitle(this.props.editMode);
    return `${op}大客户`;
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
  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    switch (this.props.editMode) {
      case "Create":
      case "Edit":
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="大客户名称">
                  {getFieldDecorator('partnerName', {
                    initialValue: this.state.dataModel.partnerName,
                    rules: [{ required: true, message: '请输入大客户名称!' }],
                  })(
                    <Input placeholder="大客户名称" />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所属分部">
                  {getFieldDecorator('branchId', {
                    initialValue: (this.props.editMode == 'Create' || this.state.dataModel.branchId == null ? [] : [{ id: this.state.dataModel.branchId, name: this.state.dataModel.branchName }]),
                    rules: [{ required: true, message: '请选择一个分部!' }],
                  })(
                    <EditableOrgTagGroup maxTags={1} />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="签约情况">
                  {getFieldDecorator('signState', {
                    initialValue: dataBind(this.state.dataModel.signState),
                    rules: [{ required: true, message: '请选择签约情况!' }],
                  })(
                    <Select>
                      {this.props.signstate.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="开发负责人">
                  {getFieldDecorator('devChargeUid', {
                    initialValue: (this.props.editMode == 'Create' || this.state.dataModel.devChargeUid == null ? [] : [{ id: this.state.dataModel.devChargeUid, name: this.state.dataModel.devChargeName }]),//dataBind(this.state.dataModel.branchId)
                    rules: [{ required: true, message: '请选择一个负责人!' }],
                  })(
                    <EditableUserTagGroup maxTags={1} orgId={""} userType={1} />
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label='合作项目'>
                  {getFieldDecorator('itemIds', {
                    initialValue: dataBind(split(this.state.dataModel.itemIds)),
                    rules: [{ required: true, message: '请选择合作项目!' }],
                  })(
                    <SelectItem scope='all' hideAll={true} showCheckBox={true} />
                    )}
                </FormItem>
              </Col>
              {/*<Col span={12}>
                <FormItem {...searchFormItemLayout} label='合作方向'>
                  {getFieldDecorator('partnerClassType', {
                    initialValue: dataBind(split(this.state.dataModel.partnerClassType)),
                    rules: [{ required: true, message: '请选择合作方向!' }],
                  })(
                    <Checkbox.Group style={{ width: '100%', marginBottom: 0 }}>
                      {this.props.partner_class_type.map((item, index) => {
                        return <Checkbox value={item.value} key={index}>{item.title}</Checkbox>
                      })
                      }
                    </Checkbox.Group>
                    )}
                </FormItem>
              </Col>*/}
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="结算考虑退费">
                  {getFieldDecorator('isBalanceRefund', {
                    initialValue: dataBind(this.state.dataModel.isBalanceRefund),
                    rules: [{ required: true, message: '请选择结束考虑退费!' }],
                  })(
                    <RadioGroup value={dataBind(this.state.dataModel.isBalanceRefund)} hasFeedback>
                      {this.state.dic_YesNo.map((item, index) => {
                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                      })}
                    </RadioGroup>
                    )}
                </FormItem>
              </Col>
              {this.state.dataModel.partnerType == 1 &&
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="高校名称">
                    {getFieldDecorator('universityId', {
                      initialValue: (this.props.editMode == 'Create' || this.state.dataModel.universityId == null ? [] : [{
                        id: this.state.dataModel.universityId,
                        name: `${this.state.dataModel.universityName}${!this.state.dataModel.universityLevel ? '' : `(${getDictionaryTitle(this.state.university_level, this.state.dataModel.universityLevel)})`}`
                      }]),
                      rules: [{ required: true, message: '请选择一个高校!' }],
                    })(
                      <EditableAllUniversityTagGroup maxTags={1} />
                      )}
                  </FormItem>
                </Col>
              }
              {this.state.dataModel.partnerType == 1 && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="院系">
                  {getFieldDecorator('department', {
                    initialValue: this.state.dataModel.department,
                  })(
                    <Input placeholder="院系" />
                    )}
                </FormItem>
              </Col>
              }
              {/* {(this.state.dataModel.partnerType == 1 && this.props.editMode == 'Edit') && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="高校级别">
                  <span>{
                    this.state.dataModel.universityLevel && this.state.university_level.map(item => {
                      if (item.value == this.state.dataModel.universityLevel) {
                        return item.title;
                      }
                    })
                  }</span>
                </FormItem>
              </Col>
              } */}
              {this.state.dataModel.partnerType == 1 &&
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="有无财经类专业">
                    {getFieldDecorator('isFinanceDepartment', {
                      initialValue: dataBind(this.state.dataModel.isFinanceDepartment),
                    })(
                      <RadioGroup value={dataBind(this.state.dataModel.isFinanceDepartment)} hasFeedback>
                        {this.state.dic_YesNo.map((item, index) => {
                          return <Radio value={item.value} key={index}>{item.title}</Radio>
                        })}
                      </RadioGroup>

                      )}
                  </FormItem>
                </Col>
              }
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所在省市">
                  {getFieldDecorator('areaId', {
                    initialValue: this.state.dataModel.areaId,
                  })(
                    <AreasSelect
                      value={this.state.dataModel.areaId}
                      areaName={this.state.dataModel.areaName}
                    />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="配合度">
                  {getFieldDecorator('cooperateStatus', {
                    initialValue: dataBind(this.state.dataModel.cooperateStatus),
                  })(
                    <Select>
                      {this.state.cooperate_status.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
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
                <FormItem {...searchFormItemLayout} label="电子信箱">
                  {getFieldDecorator('email', {
                    initialValue: this.state.dataModel.email,
                    rules: [{ type: 'email', message: '请输入有效邮箱!' }]
                  })(
                    <Input placeholder="邮箱" />
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
                <FormItem {...searchFormItemLayout} label="大客户名称">
                  {this.state.dataModel.partnerName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所属分部">
                  {this.state.dataModel.branchName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="签约情况">
                  {getDictionaryTitle(this.props.signstate, this.state.dataModel.signState)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="开发负责人">
                  {this.state.dataModel.devChargeName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="合作项目">
                  {getDictionaryTitle(this.props.Dictionarys.AllDic_ItemList, this.state.dataModel.itemIds)}
                </FormItem>
              </Col>
              {/*<Col span={12}>
                <FormItem {...searchFormItemLayout} label="合作方向">
                  {getDictionaryTitle(this.props.partner_class_type, this.state.dataModel.partnerClassType)}
                </FormItem>
              </Col>*/}
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="大客户类型">
                  {getDictionaryTitle(this.props.partnertype, this.state.dataModel.partnerType)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="结算考虑退费">
                  {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isBalanceRefund)}
                </FormItem>
              </Col>
              {this.state.dataModel.partnerType == 1 && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="高校名称">
                  {this.state.dataModel.universityName}{!this.state.dataModel.universityLevel ? '' : `(${getDictionaryTitle(this.state.university_level, this.state.dataModel.universityLevel)})`}
                </FormItem>
              </Col>
              }
              {/* {this.state.dataModel.partnerType == 1 && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="高校级别"><span>{
                  this.state.dataModel.universityLevel && this.state.university_level.map(item => {
                    if (item.value == this.state.dataModel.universityLevel) {
                      return item.title;
                    }
                  })
                }</span>
                </FormItem>
              </Col>
              } */}
              {this.state.dataModel.partnerType == 1 && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="院系">
                  {this.state.dataModel.department}
                </FormItem>
              </Col>
              }
              {this.state.dataModel.partnerType == 1 && <Col span={12}>
                <FormItem {...searchFormItemLayout} label="有无财经类专业">
                  {getDictionaryTitle(this.state.dic_YesNo, this.state.dataModel.isFinanceDepartment)}
                </FormItem>
              </Col>
              }
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="配合度">
                  {getDictionaryTitle(this.state.cooperate_status, this.state.dataModel.cooperateStatus)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="所在省市">
                  {this.state.dataModel.areaName}
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
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="电子信箱">
                  {this.state.dataModel.email}
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

const WrappedView = Form.create()(PartnerView);

const mapStateToProps = (state) => {
  //用于 loadBizDictionary 存储数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //getRoleFunList: bindActionCreators(getRoleFunList, dispatch),
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    orgBranchList: bindActionCreators(orgBranchList, dispatch),
    allUniversityList: bindActionCreators(allUniversityList, dispatch),
    getUserList: bindActionCreators(getUserList, dispatch),
    getPartnerById: bindActionCreators(getPartnerById, dispatch),

  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
