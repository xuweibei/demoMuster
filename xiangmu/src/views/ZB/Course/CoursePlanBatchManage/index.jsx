/*
开课计划管理
*/
import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Table, Col, Row, Button, Form, message } from 'antd';

import { onPageIndexChange, onShowSizeChange, loadBizDictionary } from '@/utils/componentExt';
import { timestampToTime, getDictionaryTitle } from '@/utils';

import { getCoursePlanBatchList, saveCoursePlanBatch } from '@/actions/course';
import { loadDictionary } from '@/actions/dic';
import { getItemListByUser } from '@/actions/base';
//import RecruitBatchView from '../RecruitBatchView';
import CoursePlanBatchView from './view';

class CoursePlanBatchManage extends React.Component {

  constructor() {
    super()
    //this.onSearch = onSearch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).getConditionData = this.getConditionData.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',
      data_list: [],
      data_list_total: 0,
      loading: false,
      dic_item_list: [],
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_YesNo']);
    this.onSearch();
    this.getConditionData();
  }
  //获取条件列表
  getConditionData() {
    //1. 合作项目
    this.props.getItemListByUser(this.props.userId).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var list = [];
        data.data.map(i => {
          list.push({
            itemId: i.itemId,
            itemName: i.itemName
          })
        })
        this.setState({ dic_item_list: list })
      }
      else {
        message.error(data.message);
      }
    })

  };
  //招生季	当前招生季	起止日期	创建日期	创建人	操作
  columns = [
    {
      title: '批次',
      width: 120,
      fixed: 'left',
      dataIndex: 'courseplanBatchName',
    },
    {
      title: '当前批次',
      dataIndex: 'state',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.dic_YesNo, record.isCurrent);
      }
    },
    {
      title: '项目',
      dataIndex: 'itemName',
    },
    {
      title: '开课计划起止日期',
      dataIndex: 'startDate',
      render: (text, record, index) => {
        return timestampToTime(record.startDate) + " 至" + timestampToTime(record.endDate);
      }
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      render: (text, record, index) => {
        return timestampToTime(record.createDate);
      }
    },
    {
      title: '创建人',
      dataIndex: 'createUname',
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
        </span>
      )
    }
  ];
  //处理搜索事件
  onSearch = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState({ loading: true })
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      this.props.getCoursePlanBatchList().payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          data.data = data.data || []
          data.data.map(a => {
            a.startDate = timestampToTime(a.startDate);
            a.endDate = timestampToTime(a.endDate);
          });
          this.setState({ data_list: data.data, loading: false })
        }
        else {
          this.setState({ loading: false })
          message.error(data.message);
        }
      })
    });
  };
  onLookView = (op, item) => {
    this.setState({
      editMode: op,
      currentDataModel: item
    })
  }
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' });
    } else {
      switch (this.state.editMode) {
        case 'Create':
        case 'Edit':
          this.props.saveCoursePlanBatch(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              message.success("批次保存成功！");
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
            else {
              message.error(data.message);
            }
          })
          //提交
          break;
      }
    }
  }
  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Create':
      case 'Edit':
        block_content = <CoursePlanBatchView viewCallback={this.onViewCallback} {...this.state} />
        break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                footer={() => (
                  <div>
                    <Row type="flex" justify="center" align="middle">
                      <Button onClick={() => { this.onLookView('Create', { ApplicationID: this.state.defaultApplicationID }) }} icon="plus">新增开课批次</Button>
                    </Row>
                  </div>)
                }
              />
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}

//表单组件 封装
const WrappedManage = Form.create()(CoursePlanBatchManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { userId } = state.auth.currentUser.user
  return { Dictionarys, userId };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    getCoursePlanBatchList: bindActionCreators(getCoursePlanBatchList, dispatch),
    saveCoursePlanBatch: bindActionCreators(saveCoursePlanBatch, dispatch),
    getItemListByUser: bindActionCreators(getItemListByUser, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
