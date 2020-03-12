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

import { env } from '@/api/env';
import {searchFormItemLayout, searchFormItemLayout24, loadBizDictionary,renderSearchTopButtons,renderSearchBottomButtons } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { orgBranchList, allUniversityList, getUserList } from '@/actions/admin';
import { getPartnerDetails,getCompanyAccount } from '@/actions/partner';

const btnformItemLayout = {
  wrapperCol: { span: 24 },
};
const that = this;
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
      accountList:[],
      disabled:false,
      dataModel: props.currentDataModel,//数据模型
      areas: [],  //省市列表
      dic_YesNo: [],
      dic_university_list: [],
      dic_branch_list: [],
      pagingSearch: {
        partnerName: '',  //大客户名称
        signState: '',    //签约情况
        recruitState: '', //招生状态
        partnerType: '',  //大客户类型
        itemIds: '',      //合作项目
        branchId: '',     //分部
        currentPage: 1,
        pageSize: env.defaultPageSize,
        restudyOrNot: ''
        //sortField: '',
        //sortOrder: '',
      },
    };
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    (this: any).onSubmit = this.onSubmit.bind(this);

    //(this: any).onSignStateChange = this.onSignStateChange.bind(this);
  }
  componentWillMount() {
    //  是否考虑退费1-是0-否
    //  配合度1-非常好2-较好3-中4-较差5-非常差
    this.loadBizDictionary(['dic_YesNo', 'cooperate_status', 'university_level','payee_type','pos_account_type','partner_class_type']);
    console.log(this.props.currentDataModel)
    let {payeeType,zbPayeeType,partnerId} = this.state.dataModel;
    if( payeeType == 1 || payeeType == 2 ){
      this.setState({
        disabled:true
      })
      if(partnerId&&payeeType&&zbPayeeType){
        this.getAccount(partnerId,payeeType,zbPayeeType)
      }
    }else if( payeeType == 4 || payeeType == 3 ){
      this.state.dataModel.zbPayeeType = '';
    }
  }


  onCancel = () => {
    this.props.viewCallback();
  }
  onSubmit = () => {
      var that = this;
      //表单验证后，合并数据提交
      this.props.form.validateFields((err, values) => {
        console.log(values)
        if (!err) {
          that.setState({ loading: true });
          setTimeout(() => {
            that.setState({ loading: false });
          }, 3000);//合并保存数据
          if( values.payeeType == 3 && !this.state.accountList[0] ){
            message.error('请与财务人员联系，创建此大客户共管账户公司账户，保存失败')
            return
          }
          if( values.payeeType&&values.zbPayeeType&&this.state.dataModel.partnerPayeeTypeId && this.state.dataModel.partnerId && this.state.dataModel.itemId && this.state.dataModel.partnerClassType){
            values.partnerPayeeTypeId = this.state.dataModel.partnerPayeeTypeId;
            values.partnerId = this.state.dataModel.partnerId;           
            values.itemId = this.state.dataModel.itemId;
            values.partnerClassType = this.state.dataModel.partnerClassType;
            that.props.viewCallback({
              ...values,
            });
          }else{
            message.error('参数有误！')
          }
        }
      });
    
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
  onChangeMoney(value){
    let partner = this.state.dataModel.zbPayeeType;
    let party = this.state.dataModel.payeeType = value;
    if(value==3||value==4){
      let second = this.state.dataModel.zbPayeeType = '';
      this.props.form.setFieldsValue({
        zbPayeeType: '',
      });
      this.setState({
        disabled:false,
        party,
        second
      })
    }
    if(value==1||value==2){
      partner = value;
      let second = this.state.dataModel.zbPayeeType = value;
      this.props.form.setFieldsValue({
        zbPayeeType: value,
      });
      this.setState({
        disabled:true,
        second,
        party
      })
    }
    console.log(partner)
    if(partner){
      this.getAccount(this.state.dataModel.partnerId,value,partner)
    }
  }
  getAccount(par,pay,zbp){
    let Subitem = {};
    Subitem.partnerId = par;
    Subitem.payeeType = pay;
    Subitem.zbPayeeType = zbp;
    this.props.getCompanyAccount(Subitem).payload.promise.then((response) => {
      let data = response.payload.data;
      if(data.state=='success'){
       if(data.data[0]){
          this.setState({
            accountList:data.data
          })
       }else if(!data.data[0]&&pay==3){
          message.error('请与财务人员联系，创建此大客户共管账户公司账户，保存失败')
          this.setState({
            accountList:[]
          })
       }
      }
    })
  }
  onChangeCompany(value){
    let zbp = this.state.dataModel.zbPayeeType = value;
    this.setState({
        zbp
    })
    
    this.getAccount(this.state.dataModel.partnerId,this.state.dataModel.payeeType,value)
  }
  //多种模式视图处理
  renderEditModeOfView() {
    const { getFieldDecorator } = this.props.form;
    console.log(this.state.dataModel)
    let block_content = (
      
      <Form className="search-form" >
      <Row gutter={24}>
          <Col span={12}>
              <FormItem {...searchFormItemLayout} label="大客户">
                {this.state.dataModel.partnerName}
              </FormItem>
          </Col>
          <Col span={12}>
              <FormItem {...searchFormItemLayout} label={'项目'} >
                {this.state.dataModel.itemName}
              </FormItem>
          </Col>
          <Col span={12}>
              <FormItem {...searchFormItemLayout} label="合作方式" >
                {getDictionaryTitle(this.state.partner_class_type, this.state.dataModel.partnerClassType)}
              </FormItem>
          </Col>
          <Col span={12}>
              <FormItem {...searchFormItemLayout} label="收费方" >
                  {getFieldDecorator('payeeType', { initialValue:dataBind(this.state.dataModel.payeeType)})(
                      <Select
                      onChange = {(value,e)=>this.onChangeMoney(value)}
                      >
                          {this.state.payee_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                      </Select>
                  )}
              </FormItem>
          </Col>
          <Col span={12}>
              <FormItem {...searchFormItemLayout} label="签约公司" >
                  {
                    Number(this.state.dataModel.payeeType) <= 2
                      ?
                    <span>{getDictionaryTitle(this.state.payee_type, this.state.dataModel.payeeType)}</span>
                    :
                    getFieldDecorator('zbPayeeType', { initialValue: dataBind(this.state.dataModel.zbPayeeType) ,
                  
                      rules: [
                        {
                            required: true, message: '请选择签约公司!',
                        }],  
                })(
                      <Select
                        disabled={this.state.disabled}
                        onChange={(value,e)=>{this.onChangeCompany(value)}}
                      >
                          <Option value="">请选择</Option>
                          {this.state.pos_account_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                      </Select>
                  )}
              </FormItem>
          </Col>
          {/* <Col span={12}> */}
              {/* <FormItem {...searchFormItemLayout} label="公司账户" >
                  {getFieldDecorator('bankAccountId', { 
                    initialValue: '',
                    rules: [{ required: true, message: '请选择公司账户!' }],
                  })(
                      <Select>
                          <Option value="">全部</Option>
                          {this.state.accountList.map((item, index) => {
                              return <Option value={item.zbPayeeType} key={index}>{item.bankAccountName}</Option>
                          })}
                      </Select>
                  )}
              </FormItem> */}
              {
                    this.state.dataModel.payeeType == '3' ?
                      <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="公司账户">
                          {
                            getFieldDecorator('bankAccountId', {
                              initialValue: '',
                              rules: [{ required: true, message: '请选择公司账户!' }],
                            })(
                              <Select style={{width:"150px"}}>
                                  <Option value="">请选择</Option>
                                  {
                                    this.state.accountList.map((item, index) => {
                                      return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                              </Select>
                            )
                          }
                        </FormItem>
                      </Col>
                    : ''
                  }
          {/* </Col> */}
      </Row>
  </Form>)
       
    
    return block_content;
  }

  render() {
    console.log(this.state.dataModel)
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
    getPartnerDetails: bindActionCreators(getPartnerDetails, dispatch),
    getCompanyAccount: bindActionCreators(getCompanyAccount, dispatch),

  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
