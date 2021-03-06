//大客户-收费方管理
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon, Table,
  Pagination, Divider, Modal, Card,
  Checkbox,
} from 'antd';
const FormItem = Form.Item;
const { Option } = Select;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getItemList } from '@/actions/base';
import { getPartnerPayeeList, deletePartnerPayee, queryPartnerAccount,
  addPartnerPayeeType,getCompanyAccount
} from '@/actions/partner';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind } from '@/utils';
import EditablePowerPartnerTagGroup from '@/components/EditablePowerPartnerTagGroup';

//业务数据视图（增、删、改、查)
import PartnerView from './view';
//import OrgUniversityManage from '../OrgUniversityManage';
import ContentBox from '@/components/ContentBox';

class PayeeManage extends React.Component {
  select_timeout: null;
  select_current_value: '';
  constructor(props) {
    super(props)
    this.state = {
      partnerId:'',
      pagingSearch: {},
      dataModel: props.currentDataModel,
      editMode: '',//Create
      data_list: [],
      totalRecord: 0,
      loading: false,
      signstate: props.signstate,   //签约情况 列表
      dic_Status: props.dic_Status, //招生状态 列表
      partner_class_type: props.partner_class_type, //项目合作方式
      submit_list: [],  //批量修改提交
      is_changed: false,

      add_account_list: [],
      add_info: {},
    };
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    (this: any).onSubmit = this.onSubmit.bind(this);
    (this: any).onPayeeTypeChange = this.onPayeeTypeChange.bind(this);
    (this: any).onSearch = onSearch.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    (this: any).onZbPayeeTypeChange = this.onZbPayeeTypeChange.bind(this);
    (this: any).onBankAccountChange = this.onBankAccountChange.bind(this);
    (this: any).fetchAccount = this.fetchAccount.bind(this);
    (this: any).queryBankAccount = this.queryBankAccount.bind(this);
    (this: any).onSave = this.onSave.bind(this);
  }
  componentWillMount() {
    //载入需要的字典项: 收费方
    this.loadBizDictionary(['payee_type']);
    // this.fetch();
    // let {payeeType,zbPayeeType,partnerId} = this.state.dataModel;
    // if( payeeType == 1 || payeeType == 2 ){
    //   if(partnerId&&payeeType&&zbPayeeType){
    //     this.getAccount(partnerId,payeeType,zbPayeeType)
    //   }
    // }else if( payeeType == 4 || payeeType == 3 ){
    //   this.state.dataModel.zbPayeeType = '';
    // }
  }
  componentWillUnMount() { }
  fetch(id) {
    var that = this;
      this.props.getPartnerPayeeList(id).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          var list = [];
          // data.data.payeeTypeLst.map(item => {
          //   item.key = item.partnerPayeeTypeId;
          //   item.bank_account_list = [];
          //   list.push(item);
          // })
          this.setState({
            dataModel: data.data
          });
          this.initSubmitList();
          setTimeout(function(){
            that.fetchAccount();
          }, 200);
        }
      });
    
  }
  onCancel = () => {
    if(this.state.editMode == 'Create'){
      this.setState({
        editMode: ''
      })
      this.fetch();
    }else {
      this.props.viewCallback();
    }
  }
  initSubmitList() {
    var list = this.state.submit_list;
    this.state.data_list.map(item => {
      var isExist = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i].partnerPayeeTypeId == item.partnerPayeeTypeId) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        list.push({
          partnerPayeeTypeId: item.partnerPayeeTypeId,
          payeeType: item.payeeType,
          zbPayeeType: item.zbPayeeType,
          bankAccountId: item.bankAccountId
        });
      }
    });
  }
  //收费方选择
  onPayeeTypeChange(value, partnerPayeeTypeId) {
    var list = this.state.submit_list;
    list.map(item => {
      if (item.partnerPayeeTypeId == partnerPayeeTypeId) {
        item.payeeType = value;
        if(value == 1 || value == 2 || value == 5){
          item.zbPayeeType = value;
        }
      }
    })
    this.state.data_list.map(item => {
      if(item.partnerPayeeTypeId == partnerPayeeTypeId){
        item.payeeType = value;
      }
    });
    this.setState({
      submit_list: list,
      is_changed: true,
      data_list: this.state.data_list
    })
  }
  queryBankAccount(zbPayeeType, callback){
    this.props.queryPartnerAccount(this.state.partnerId, zbPayeeType).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var _list = [];
        data.data.map(item => {
          _list.push({
            value: item.bankAccountId,
            title: item.bankAccountName
          });
        })
        this.setState({
          add_account_list: _list
        })
        if(callback){
          callback(_list);
        }

      }
    });
  }
  //公司选择
  onZbPayeeTypeChange(value, partnerPayeeTypeId) {
    var submit_list = this.state.submit_list;
    for(var i = 0; i < submit_list.length; i++){
      if (submit_list[i].partnerPayeeTypeId == partnerPayeeTypeId) {
        submit_list[i].zbPayeeType = value;
        record = submit_list[i];
        break;
      }
    }
    var data_list = this.state.data_list;
    var record = null;
    for(var i = 0; i < data_list.length; i++){
      if(data_list[i].partnerPayeeTypeId == partnerPayeeTypeId){
        record = data_list[i];
        break;
      }
    }
    if(record.payeeType == 3){
      //共管账户
      //this.props.currentDataModel.partnerId
      //value
      var that = this;
      this.queryBankAccount(value, function(_list){
        if(record){
          record.bank_account_list = _list;
        }
        that.setState({
          submit_list: submit_list,
        });
      });
    }else {
      this.setState({
        submit_list: submit_list,
        is_changed: true
      })
    }
  }
  //账户选择
  onBankAccountChange(value, partnerPayeeTypeId) {
    //var index = -1;
    var list = this.state.submit_list;
    for(var i = 0; i < list.length; i++){
      if (list[i].partnerPayeeTypeId == partnerPayeeTypeId) {
        //list[i].zbPayeeType = value;
        //record = list[i];
        list[i].bankAccountId = value;
        //index = i;
        this.setState({
          submit_list: list
        })
        break;
      }
    }
  }
  fetchAccount(){
    var that = this;
    this.state.data_list.map(record => {
      if(record.payeeType == 3 && record.zbPayeeType){
        //共管账户
        that.onZbPayeeTypeChange(record.zbPayeeType, record.partnerPayeeTypeId);
      }
    })
  }
  onSubmit = () => {
    if (!this.state.is_changed) {
      this.onCancel();
      return;
    }
    var that = this;
    //表单验证后，合并数据提交
    for (var i = 0; i < this.state.submit_list.length; i++) {
      var item = this.state.submit_list[i];
      if (!item.payeeType) {
        message.error("收费方必须选一个");
        return;
      }
      if(!item.zbPayeeType){
        message.error("签约公司必须选一个");
        return;
      }
      if(item.payeeType == 3){
        if(!item.bankAccountId){
          message.error("共管账户下请选择一个账户");
          return;
        }
      }
    }
    that.setState({ loading: true });
    setTimeout(() => {
      that.setState({ loading: false });
    }, 3000);//合并保存数据
    that.props.viewCallback({
      partnerId: this.state.dataModel.partnerId,
      partnerPayeeTypes: JSON.stringify(this.state.submit_list)
    });//合并保存数据
  }
  //===================================新增时
  onLookView = (op) => {
    this.setState({
        editMode: op,//编辑模式
    });
  };
  //收费方选择
  onAddPayeeTypeChange(value) {
    var _info = this.state.add_info;
    _info.payeeType = value;
    if(value == 1 || value == 2 || value == 5){
      _info.zbPayeeType = value;
    }
    let id = this.state.partnerId;
    this.props.form.setFieldsValue({
      bankAccountId: '',
    });
    this.setState({
      add_info: _info
    });
  }
  //签约公司
  onAddZbPayeeTypeChange(value) {
    var _info = this.state.add_info;
    _info.zbPayeeType = value;
    this.props.form.setFieldsValue({
      bankAccountId: '',
    });
    this.setState({
      add_info: _info
    });
    if(_info.payeeType == '3'){
      this.queryBankAccount(value);
    }
  }
  onSave = () => {
    var that = this;
    this.props.form.validateFields((err, values) => {
      delete values.partnerName
       if (!err) {
        that.setState({ loading: true });
        setTimeout(() => {
          that.setState({ loading: false });
        }, 3000);//合并保存数据
        values.partnerId = this.state.partnerId
        //调用api
        this.props.addPartnerPayeeType(values).payload.promise.then((response) => {
          let data = response.payload.data;
          console.log(data)
          if (data.state === 'success') {
            message.success("保存成功！");
            this.onCancel();
          }else {
            message.error(data.msg || data.message);
          }
        });
      }
    });
  }
  //=======================================
  changepart(value){
    if(value[0]){
      this.setState({
        partnerId:value[0].id
      })
      this.fetch(value[0].id)
    }else{
      this.setState({
        dataModel:undefined
      })
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
  //渲染，根据模式不同控制不同输出
  render() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    let extendButtons = [];
    console.log(this.state.add_info.payeeType)
        //新增 收费方式
        extendButtons.push( <Button onClick={this.onSave} icon="save" loading={this.state.loading}>保存</Button> );
        extendButtons.push( <span className="split_button"></span> )
        extendButtons.push( <Button icon="rollback" onClick={this.onCancel}>取消</Button> );
        block_content = (
          <div>
            <ContentBox bottomButton={extendButtons}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24} justify="center" align="middle" type="flex">
                  <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="大客户">
                        {getFieldDecorator('partnerName',
                          {
                            initialValue: '',
                            rules: [{ required: true, message: '请选择一个大客户!' }],
                          }
                        )(
                            <EditablePowerPartnerTagGroup maxTags={1} onChange={(value)=>{this.changepart(value)}} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}></Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="项目">
                        {getFieldDecorator('itemId',
                          {
                            initialValue: '',
                            rules: [{ required: true, message: '请选择一个项目!' }],
                          }
                        )(
                          <Select>
                            <Option value="">请选择</Option>
                            {this.state.dataModel?this.state.dataModel.itemIds.split(',').map((id, index) => {
                              return <Option value={id} key={index}>{this.state.dataModel.itemNames.split(',')[index]}</Option>
                            }):[]}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'合作方式'}>
                        {getFieldDecorator('partnerClassType', {
                            initialValue: '',
                            rules: [{ required: true, message: '请选择合作方向!' }],
                          })(
                            <Select>
                              <Option value="">请选择</Option>
                              {this.props.partner_class_type.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={24} justify="center" align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="收费方">
                        {getFieldDecorator('payeeType', {
                            initialValue: '',
                            rules: [{ required: true, message: '请选择收费方!' }],
                          })(
                            <Select style={{width:"130px"}} onChange={(value) => this.onAddPayeeTypeChange(value)}>
                              <Option value="">请选择</Option>
                              {
                                this.state.payee_type.map((item, index) => {
                                  return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="签约公司">
                        {
                           (this.state.add_info.payeeType == 1 || this.state.add_info.payeeType == 2 || this.state.add_info.payeeType == 5)
                          ?
                          <span>{getDictionaryTitle(this.state.payee_type, this.state.add_info.payeeType)}</span>
                          :
                          getFieldDecorator('zbPayeeType', {
                              initialValue: '',
                              rules: [{ required: true, message: '请选择签约公司!' }],
                            })(
                              <Select style={{width:"130px"}} onChange={(value) => this.onAddZbPayeeTypeChange(value)}>
                                <Option value="">请选择</Option>
                                {
                                  this.state.payee_type.filter(i => i.value == 1 || i.value == 2 || i.value == 5).map((item, index) => {
                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                  })}
                              </Select>
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  {
                    this.state.add_info.payeeType == '3' ?
                    <Row gutter={24} justify="center" align="middle" type="flex">
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
                                    this.state.add_account_list.map((item, index) => {
                                      return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                              </Select>
                            )
                          }
                        </FormItem>
                      </Col>
                      <Col span={12}></Col>
                    </Row>
                    : ''
                  }

                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
          </div>
        )
     
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(PayeeManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getPartnerPayeeList: bindActionCreators(getPartnerPayeeList, dispatch),
    deletePartnerPayee: bindActionCreators(deletePartnerPayee, dispatch),
    queryPartnerAccount: bindActionCreators(queryPartnerAccount, dispatch),
    addPartnerPayeeType: bindActionCreators(addPartnerPayeeType, dispatch),
    getCompanyAccount: bindActionCreators(getCompanyAccount, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
