//大客户-项目管理
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
import { getPartnerItemList, updatePartnerItemList } from '@/actions/partner';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind } from '@/utils';

//业务数据视图（增、删、改、查)
import PartnerView from './view';
//import OrgUniversityManage from '../OrgUniversityManage';
import ContentBox from '@/components/ContentBox';

class ItemManage extends React.Component {
  select_timeout: null;
  select_current_value: '';
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,
      editMode: '',//Edit,Create,View,Delete
      data_list: [],
      totalRecord: 0,
      loading: false,
      signstate: props.signstate,   //签约情况 列表
      dic_Status: props.dic_Status, //招生状态 列表
      submit_list: [],
      is_changed: false
    };
    //扩展方法用于本组件实例
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    (this: any).onSubmit = this.onSubmit.bind(this);
    (this: any).onRecruitStateChange = this.onRecruitStateChange.bind(this);
    (this: any).onSignStateChange = this.onSignStateChange.bind(this);
  }
  componentWillMount() {
    //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
    if (this.props.currentDataModel.partnerId) {
      this.props.getPartnerItemList(this.props.currentDataModel.partnerId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          var list = [];
          data.data.itemLst.map(item => {
            item.key = item.partnerItemId;
            list.push(item);
          })
          this.setState({
            data_list: list
          });
          this.initSubmitList();
        }
      });
    }
  }
  componentWillUnMount() {
  }

  //table 输出列定义
  columns = [
    {
      title: '合作项目',
      width: 150,//可预知的数据长度，请设定固定宽度
      dataIndex: 'itemName',
    },
    {
      title: '签约情况',
      width: 150,//可预知的数据长度，请设定固定宽度
      dataIndex: 'signState',
      render: (text, record, index) => {
        return <Select
          defaultValue={dataBind(record.signState)}
          onChange={(value) => this.onSignStateChange(value, record.partnerItemId)}
        >
          <Option value="">请选择</Option>
          {
            this.state.signstate.map((item, index) => {
              return <Option value={item.value} key={index}>{item.title}</Option>
            })}
        </Select>
      }
    },
    {
      title: '招生状态',
      width: 150,
      dataIndex: 'recruitState',
      render: (text, record, index) => {
        return <Select
          defaultValue={dataBind(record.recruitState)}
          onChange={(value) => this.onRecruitStateChange(value, record.partnerItemId)}
        >
          <Option value="">请选择</Option>
          {
            this.state.dic_Status.map((item, index) => {
              return <Option value={item.value} key={index}>{item.title}</Option>
            })}
        </Select>
      }
    },
  ];
  onCancel = () => {
    this.props.viewCallback();
  }
  initSubmitList() {
    var list = this.state.submit_list;
    this.state.data_list.map(item => {
      var isExist = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i].partnerItemId == item.partnerItemId) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        list.push({
          partnerItemId: item.partnerItemId,
          signState: item.signState,
          recruitState: item.recruitState
        });
      }
    });
    /*[
      {"partnerItemId":"a140f2b7483211e89aa5f8bc129b92ad","signState":3,"recruitState":0},
      {"partnerItemId":"a0f66fc7483211e89aa5f8bc129b92ad","signState":3,"recruitState":0},
      {"partnerItemId":"a0a62799483211e89aa5f8bc129b92ad","signState":2,"recruitState":1}
    ]
    */
  }
  onSignStateChange(value, partnerItemId) {
    var list = this.state.submit_list
    list.map(item => {
      if (item.partnerItemId == partnerItemId) {
        item.signState = value;
      }
    })
    this.setState({
      submit_list: list,
      is_changed: true
    })
  }
  onRecruitStateChange(value, partnerItemId) {
    var list = this.state.submit_list
    list.map(item => {
      if (item.partnerItemId == partnerItemId) {
        item.recruitState = value;
      }
    })
    this.setState({
      submit_list: list,
      is_changed: true
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
      if (!item.signState) {
        message.error("签约情况必须选一个");
        return;
      }
      if (item.recruitState != "0" && item.recruitState != "1") {
        message.error("招生状态必须选一个");
        return;
      }
    }
    that.setState({ loading: true });
    setTimeout(() => {
      that.setState({ loading: false });
    }, 3000);//合并保存数据
    that.props.viewCallback({
      partnerId: this.state.dataModel.partnerId,
      partnerItems: JSON.stringify(this.state.submit_list)
    });//合并保存数据
  }
  //渲染，根据模式不同控制不同输出
  render() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    let extendButtons = [];
    extendButtons.push(
      <Button onClick={this.onSubmit} icon="save" className="button_dark">保存</Button>
    );
    extendButtons.push(
      <Button onClick={this.onCancel} icon="rollback">取消</Button>
    );
    block_content = (
      <div>
        {/* 搜索表单 */}
        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,'',true)}>
          {!this.state.seachOptionsCollapsed &&
            <Form className="search-form" >
              <Row gutter={24} justify="center" align="middle" type="flex">
                <Col span={12}>
                  <FormItem {...searchFormItemLayout}
                    label="所属分部" style={{ marginBottom: 0 }}
                  >
                    <span>{this.state.dataModel.branchName}</span>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout}
                    label={'大客户名称'} style={{ marginBottom: 0 }}
                  >
                    <span>{this.state.dataModel.partnerName}</span>
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24} justify="center" align="middle" type="flex">
                <Col span={12}>
                  <FormItem {...searchFormItemLayout}
                    label="合作项目" style={{ marginBottom: 0 }}
                  >
                    <span>{this.state.dataModel.itemNames}</span>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout}
                    label={'开发负责人'} style={{ marginBottom: 0 }}
                  >
                    <span>{this.state.dataModel.devChargeName}</span>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          }
        </ContentBox>
        {/* 内容分割线 */}
        <div className="space-default"></div>
        <div className="search-result-list">
          <Table columns={this.columns} //列定义
            loading={this.state.loading}
            pagination={false}
            dataSource={this.state.data_list}//数据
            bordered
          />
          <div className="space-default"></div>
        </div>
      </div>
    );
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(ItemManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getPartnerItemList: bindActionCreators(getPartnerItemList, dispatch),
    updatePartnerItemList: bindActionCreators(updatePartnerItemList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
