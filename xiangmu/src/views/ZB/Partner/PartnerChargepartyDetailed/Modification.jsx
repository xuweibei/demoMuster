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
import { 
  addPartnerPayeeType,batchModification
} from '@/actions/partner';
//组件实例模板方法引入
import {
  loadBizDictionary, onShowSizeChange,
  searchFormItemLayout,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle} from '@/utils';

//import OrgUniversityManage from '../OrgUniversityManage';
import ContentBox from '@/components/ContentBox';
import './index.less'
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
    (this: any).onSave = this.onSave.bind(this);
  }
  componentWillMount() {
    //载入需要的字典项: 收费方
    this.loadBizDictionary(['payee_type']);
  }
  componentWillUnMount() { }
  onCancel = () => {
      this.props.viewCallback();
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
  }
  onSave = () => {
    var that = this;
    this.props.form.validateFields((err, values) => {
        if(values.payeeType == 1 || values.payeeType == 2 || values.payeeType == 5){
            values.zbPayeeType = values.payeeType
        }

        let partnerPayeeTypeId = [];
        this.props.UserSelecteds.forEach((e,i)=>{
            partnerPayeeTypeId.push(e.partnerPayeeTypeId)
        });
        let par = partnerPayeeTypeId.join(',')
        values.partnerPayeeTypeIds = par;
       if (!err) {
        that.setState({ loading: true });
        setTimeout(() => {
          that.setState({ loading: false });
        }, 3000);//合并保存数据
        //调用api
        this.props.batchModification(values).payload.promise.then((response) => {
          let data = response.payload.data;
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
  //渲染，根据模式不同控制不同输出
  render() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    let extendButtons = [];
        //新增 收费方式
        extendButtons.push( <Button onClick={this.onSave} icon="save" loading={this.state.loading}>保存</Button> );
        extendButtons.push( <span className="split_button"></span> )
        extendButtons.push( <Button icon="rollback" onClick={this.onCancel}>取消</Button> );
        block_content = (
          <div>
            <ContentBox bottomButton={extendButtons}>
                <strong className='batch'>您选择了<span>{this.props.UserSelecteds.length}</span>条大客户收费方信息进行批量修改：</strong>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                 
                  <Row gutter={24} justify="center" align="middle" type="flex">
                    <Col span={1}></Col>
                    <Col span={13}>
                      <FormItem {...searchFormItemLayout} label="收费方">
                        {getFieldDecorator('payeeType', {
                            initialValue: '',
                            rules: [{ required: true, message: '请选择收费方!' }],
                          })(
                            <Select style={{width:"130px"}} onChange={(value) => this.onAddPayeeTypeChange(value)}>
                              <Option value="">请选择</Option>
                              {
                                this.state.payee_type.filter(i=>i.value!=3).map((item, index) => {
                                  return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={10}>
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
    addPartnerPayeeType: bindActionCreators(addPartnerPayeeType, dispatch),
    batchModification: bindActionCreators(batchModification, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
