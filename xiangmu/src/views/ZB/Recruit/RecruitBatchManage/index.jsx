/*
招生季管理
*/
import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Table, Col, Row, Button, Form, message,Pagination } from 'antd';
import { onPageIndexChange, onShowSizeChange, loadBizDictionary } from '@/utils/componentExt';
import { timestampToTime, getDictionaryTitle } from '@/utils';
import { env } from '@/api/env';

import { postRecruitBatchPageList, postRecruitBatchSave } from '@/actions/recruit';
import { loadDictionary } from '@/actions/dic';
//import RecruitBatchView from '../RecruitBatchView';

import RecruitBatchView from './view';

class RecruitBatchManage extends React.Component {

  constructor() {
    super()
    //this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',
      data_list: [],
      data_list_total: 0,
      loading: false,
      pagingSearch: {
        currentPage: 1,
        pageSize: env.defaultPageSize,
      },
    };

  }
  componentWillMount() {
    this.loadBizDictionary(['dic_Status']);
    this.onSearch();
  }
  //招生季	当前招生季	起止日期	创建日期	创建人	操作
  columns = [
    {
      title: '招生季',
      width: 200,
      fixed: 'left',
      dataIndex: 'recruitBatchName',
    },
    {
      title: '当前招生季',

      dataIndex: 'state',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.dic_Status, record.state);
      }
    },
    {
      title: '起止日期',
       width: 200,
      dataIndex: 'beginDate',
      render: (text, record, index) => {
        return timestampToTime(record.beginDate) + " 至 " + timestampToTime(record.endDate);
        //return record.beginDateStr + " 至" + record.endDateStr;
      }
    },
    {
      title: '适用定价时间',
       width: 200,
      dataIndex: 'priceBeginDate',
      render: (text, record, index) => {
        return timestampToTime(record.priceBeginDate) + " 至 " + timestampToTime(record.priceEndDate);
        //return record.beginDateStr + " 至" + record.endDateStr;
      }
    },
    {
      title: '创建人',
      width: 120,
      dataIndex: 'createName',
    },
    {
      title: '创建日期',
      width: 120,
      dataIndex: 'createDate',
      render: (text, record, index) => {
        return timestampToTime(record.createDate);
      }
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
      this.props.postRecruitBatchPageList(this.state.pagingSearch).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          data.data.map(a => {
            a.beginDate = timestampToTime(a.beginDate);
            a.endDate = timestampToTime(a.endDate);
          });
          this.setState({ data_list: data.data, loading: false,totalRecord:data.totalRecord })
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
          this.props.postRecruitBatchSave(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
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
        block_content = <RecruitBatchView viewCallback={this.onViewCallback} {...this.state} />
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
                scroll={{ x: 1100 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={10}>
                    <div className='flex-row'>
                      <Button onClick={() => { this.onLookView('Create', { ApplicationID: this.state.defaultApplicationID }) }} icon="plus">新增招生季</Button>
                    </div>
                  </Col>
                  <Col span={14} className={'search-paging-control'}>
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
              </div>
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}

//表单组件 封装
const WrappedManage = Form.create()(RecruitBatchManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    postRecruitBatchPageList: bindActionCreators(postRecruitBatchPageList, dispatch),
    postRecruitBatchSave: bindActionCreators(postRecruitBatchSave, dispatch)
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
