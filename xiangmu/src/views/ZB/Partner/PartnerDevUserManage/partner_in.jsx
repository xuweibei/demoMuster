//用户负责大客户-已添加
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Button, Table, Pagination, Card, Icon, Modal
} from 'antd';
import { env } from '@/api/env';

import { getDictionaryTitle, timestampToTime } from '@/utils';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import SearchForm from '@/components/SearchForm';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getItemList } from '@/actions/base';
//业务接口方法引入
import {
  getPartnerInUserList, getPartnerNotInUserList,
  deletePartnerInUser, addPartnerNotInUser
} from '@/actions/partner';

class PartnerDevUserIn extends React.Component {
  flag: 'partner_index';
  constructor(props) {
    super(props)
    this.state = {
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        userId: this.props.userId,
        branchId: '',
        partnerName: '',
        currentPage: 1,
        pageSize: env.defaultPageSize,
      },
      partner_in_list: [],
      partner_not_in_list: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).getConditionData = this.getConditionData.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() {
    this.fetch();
    this.loadBizDictionary(['dic_Status', 'signstate', 'partner_class_type']);
    this.getConditionData();
  }
  componentWillUnMount() {
  }

  //获取条件列表
  getConditionData() {
    var condition = { currentPage: 1, pageSize: 99, state: 1, itemName: '' }
    this.props.getItemList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var list = [];
        data.data.map(item => {
          list.push({
            value: item.itemId,
            title: item.itemName
          });
        })
        this.setState({ dic_item_list: list })
      }
      else {
        message.error(data.message);
      }
    })
  };

  onCancel = () => {
    var that = this;
    if (this.state.editMode == 'AddPartners') {
      this.setState({
        editMode: 'Manage'
      })

      setTimeout(function () {
        that.fetch();
      }, 100);
    } else {
      this.props.viewCallback();
    }
  }
  //table 输出列定义
  columns = [
    {
      title: '大客户名称',
      width: 200,//可预知的数据长度，请设定固定宽度
      fixed:'left',
      dataIndex: 'partnerName',
    },
    {
      title: '所属分部',
      dataIndex: 'branchName',
    },
    {
      title: '签约情况',
      dataIndex: 'signState',
      render: (text, record) => {
        return getDictionaryTitle(this.state.signstate, record.signState)
      }
    },
    {
      title: '招生状态',
      dataIndex: 'recruitState',
      render: (text, record) => {
        return getDictionaryTitle(this.state.dic_Status, record.recruitState)
      }
    },
    {
      title: '合作项目',
      dataIndex: 'itemIds',
      render: (text, record) => {
        return getDictionaryTitle(this.state.dic_item_list, record.itemIds)
      }
    },
    {
      title: '合作方式',
      dataIndex: 'partnerClassType',
      render: (text, record) => {
        return getDictionaryTitle(this.state.partner_class_type, record.partnerClassType)
      }
    },
    {
      title: '开发负责人',
      dataIndex: 'devChargeName',
    },
    {
      title: '创建人',
      dataIndex: 'createUName',
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      fixed:'right',
      width:120,
      render: (text, record) => {
        return timestampToTime(record.createDate);
      }
    }
  ];

  //检索数据
  fetch(params) {
    this.setState({ loading: true });
    params = params || this.state.pagingSearch;
    params.userId = this.props.userId;
    if (this.state.editMode == 'AddPartners') {
      params.branchId = this.state.branchId2;
      this.props.getPartnerNotInUserList(params).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          //condition.currentPage = data.currentPage;
          var list = [];
          data.data.map(a => {
            a.key = a.partnerId;
            list.push(a);
          });
          this.setState({
            partner_not_in_list: list,
            totalRecord: data.totalRecord,
            loading: false
          })
        }
        else {
          this.setState({ loading: false })
          message.error(data.message);
        }
      })
    } else {
      params.branchId = this.state.branchId;
      this.props.getPartnerInUserList(params).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          //condition.currentPage = data.currentPage;
          var list = [];
          data.data.map(a => {
            a.key = a.partnerId;
            list.push(a);
          });
          this.setState({
            partner_in_list: list,
            totalRecord: data.totalRecord,
            loading: false
          })
        }
        else {
          this.setState({ loading: false })
          message.error(data.message);
        }
      })
    }
  }

  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      //currentDataModel: item,//编辑对象
    });
    if (op == 'AddPartners') {
      var that = this;
      setTimeout(function () {
        that.fetch();
      }, 100);
    }
  };
  //视图回调
  // 无用 ？？？？？
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case "Create":
        case "Edit": //提交
          if (dataModel.orgType == 2) {
            delete dataModel.parentOrgid;
          }
          this.props.saveOrgInfo(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              if (dataModel.orgType == 2) {
                this.getConditionData();
              }
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          //提交
          break;
        case "Delete":
          //提交
          this.props.deleteOrgInfo(this.state.currentDataModel.orgId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              if (dataModel.orgType == 2) {
                this.getConditionData();
              }
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }
  onBatchAdd = () => {
    this.props.addPartnerNotInUser(this.props.userId, this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        this.setState({ UserSelecteds: [] })
        this.fetch();
      }
    })
  }
  onBatchDelete = () => {
    Modal.confirm({
      title: '是否删除用户负责大客户?',
      content: '点击确认删除用户大客户!否则点击取消！',
      onOk: () => {
        this.props.deletePartnerInUser(this.props.userId, this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            this.setState({ UserSelecteds: [] })
            this.fetch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });

  }
  //渲染，根据模式不同控制不同输出
  render() {
    var that = this;
    let block_content = <div></div>
    var rowSelection = {
      selectedRowKeys: this.state.UserSelecteds,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ UserSelecteds: selectedRowKeys })
      },
      getCheckboxProps: record => ({
        name: record.partnerName,
      }),
    }
    switch (this.state.editMode) {
      case "AddPartners":
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              isBranchUser={true}
              choosedUserId={this.props.userId}
              form_item_list={[
                //{ type: 'search_input', data: 'branch', name: 'branchId', title: '所属分部' },
                { type: 'org', name: 'branchId2', title: '所属分部', is_all: true },
                { type: 'input', name: 'partnerName', title: '大客户姓名' },
              ]}
              fetch2={(params) => this.fetch(params)}
              onCallback={(value, name) => {
                var branchId = null;
                if(name == "branchId2"){
                  if(value){
                    branchId = value;
                  }
                }
                this.setState({branchId2: branchId});
              }}
            />
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.partner_not_in_list}//数据
                scroll={{x:1300}}
                bordered
                rowSelection={rowSelection}
              />
               <div className="space-default"></div>
              {<div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                    {this.state.UserSelecteds.length > 0 ?
                      <Button onClick={this.onBatchAdd} icon="plus">添加</Button> :
                      <Button disabled icon="plus">添加</Button>
                    }
                  </Col>
                  <Col span={18} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>}
            </div>
          </div>
        );
        break;
      case "Manage":
      default:
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              isBranchUser={true}
              choosedUserId={this.props.userId}
              form_item_list={[
                //{ type: 'search_input', data: 'branch', name: 'branchId', title: '所属分部', is_all: true },
                { type: 'org', name: 'branchId', title: '所属分部', is_all: true },
                { type: 'input', name: 'partnerName', title: '大客户姓名' },
              ]}
              fetch2={(params) => this.fetch(params)}
              extendButtons={[
                {
                  title: '负责大客户',
                  callback: function () { that.onLookView('AddPartners') }
                }
              ]}
              onCallback={(value, name) => {
                var branchId = null;
                if(name == "branchId"){
                  if(value){
                    branchId = value;
                  }
                }
                this.setState({branchId: branchId});
              }}
            />
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.partner_in_list}//数据
                bordered
                scroll={{x:1300}}
                rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              {<div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={6}>
                    {this.state.UserSelecteds.length > 0 ?
                      <Button onClick={this.onBatchDelete} icon="delete">删除</Button> :
                      <Button disabled icon="delete">删除</Button>
                    }
                  </Col>
                  <Col span={18} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>}
            </div>
          </div>
        );
        break;
    }
    //return block_content;

    return (
      <Card title="添加大客户" extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
        {block_content}
      </Card>
    )
  }
}
//表单组件 封装
const WrappedManage = Form.create()(PartnerDevUserIn);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getItemList: bindActionCreators(getItemList, dispatch),
    getPartnerInUserList: bindActionCreators(getPartnerInUserList, dispatch),
    getPartnerNotInUserList: bindActionCreators(getPartnerNotInUserList, dispatch),
    deletePartnerInUser: bindActionCreators(deletePartnerInUser, dispatch),
    addPartnerNotInUser: bindActionCreators(addPartnerNotInUser, dispatch)
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
