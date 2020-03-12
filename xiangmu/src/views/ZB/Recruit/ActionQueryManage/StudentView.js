/*
3.1.01 招生管理－市场与咨询－活动查询-学员
陈正威
2018-05-14
*/

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import { loadDictionary } from '@/actions/dic';
import { getUniverstyByToken } from '@/actions/base';
import { getParticipateStudentList, postRecruitBatchList } from '@/actions/recruit';

import ContentBox from '@/components/ContentBox';

const dateFormat = 'YYYY-MM-DD';
class StudentView extends React.Component {

  constructor(props) {
    super(props);
    (this: any).fetch = this.fetch.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        activityId: '',
        regionOrNot: '',
        regSource: '',
      },
      dataModel: props.currentDataModel,//数据模型
      totalRecord: 0,
      loading: false,
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'activity_type', 'reg_source']);
    this.onSearch()
  }
  compoentDidMount() {
    
  }

  columns = [
    {
      title: '所属分部区域',
      dataIndex: 'regionName',
      width:120,
      fixed:'left'
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
    },

    {
      title: '性别',
      dataIndex: 'sexName',
    },
    {
      title: '学生来源',
      dataIndex: 'regSourceName',
    },
    {
      title: '目前情况',
      dataIndex: 'isStudyName',
    },
    {
      title: '在读高校',
      dataIndex: 'universityName',
    },
    {
      title: '入学年份',
      dataIndex: 'studyUniversityEnterYear',
    },
    {
      title: '手机',
      dataIndex: 'phone',
    },
    {
      title: '微信',
      dataIndex: 'weixin',
    },
    {
      title: 'QQ',
      dataIndex: 'qq',
    },
    {
      title: '证件号',
      dataIndex: 'certificateNo',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      fixed:'right',
      width:120,
    },

  ];

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.activityId = this.state.dataModel.activityId;
    this.props.getParticipateStudentList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  }

  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  onCancel = () => {
    this.props.viewCallback();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Edit':
      default:

        let extendButtons = [];
        extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>)
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} title={'活动学生列表'} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form">
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem  {...searchFormItemLayout} label={'区域'} >
                        {this.state.dataModel.regionName}
                      </FormItem>
                    </Col>
                    <Col span={12} {...searchFormItemLayout}></Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'活动名称'} >
                        {this.state.dataModel.activityName}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'活动类型'} >
                        {this.state.dataModel.activityTypeName}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="学生来源"
                      >
                        {getFieldDecorator('regSource', { initialValue: dataBind(this.state.pagingSearch.regSource) })(
                          <Select style={{width:175}}>
                            <Option value="">全部</Option>
                            {this.state.reg_source.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem {...searchFormItemLayout}
                        label="本区域学生">
                        {getFieldDecorator('regionOrNot', { initialValue: this.state.pagingSearch.regionOrNot })(
                          <Select style={{width:135}}>
                            {this.state.dic_YesNo.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                scroll={{ x: 1300 }}
                bordered
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="end" align="middle" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentView);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getParticipateStudentList: bindActionCreators(getParticipateStudentList, dispatch),
    postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
    getUniverstyByToken: bindActionCreators(getUniverstyByToken, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
