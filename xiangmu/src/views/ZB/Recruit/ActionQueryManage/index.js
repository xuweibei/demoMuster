/*
3.1.01 招生管理－市场与咨询－活动查询
陈正威
2018-05-14
*/

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { getUniversityByBranchId } from '@/actions/base';
import { getZBActivityList, postRecruitBatchList } from '@/actions/recruit';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectUniversity from '@/components/BizSelect/SelectUniversity';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ContentBox from '@/components/ContentBox';
import View from './view';
import StudentView from './StudentView';
import ZBEditableAllUniversityTagGroup from '@/components/ZBEditableAllUniversityTagGroup';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
class ActionQueryManage extends React.Component {

  constructor() {
    super();
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
        recruitBatchId: '',
        branchId: '',
        isUniversity: 1,
        activityName: '',
        activityType: '',
        universityId: '',
        startTime: '',
        endTime: '',
      },
      bz_recruit_batch_list: [],
      dic_University_list: [],
      isUniversity: true,
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
      startValue: null,
      endValue: null,
      endOpen: false,
    };
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount");
    this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'activity_type']);
    //this.fetchUniversity()
    //  this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '分部区域',
      dataIndex: 'regionName',
      width: 120,
      fixed: 'left'
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      render: (text, record, index) => {
        return <div className='textleft'><a onClick={() => { this.onLookView('View', { ...record, activityTypeName: getDictionaryTitle(this.state.activity_type, record.activityType) }) }}>{record.activityName}</a></div>
      }
    },

    {
      title: '相关高校',
      dataIndex: 'universityName',
      render: (text, record, index) => {
        return <div className='textleft'>{text}</div>
      }

    },
    {
      title: '活动类型',
      dataIndex: 'activityType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.activity_type, record.activityType);
      }
    },
    {
      title: '实际费用(¥)',
      dataIndex: 'costAmount',
      render: (text, record, index) => {
        return formatMoney(record.costAmount)
      }
    },
    {
      title: '负责人',
      dataIndex: 'chargeUserName',
    },
    {
      title: '主讲教师',
      dataIndex: 'teacherName',
      render: (text, record, index) => {
        return <div>{ record.teacherName }  { record.englishName ? `(${record.englishName})` : '' }</div>
      }
    },
    {
      title: '参加学员',
      dataIndex: 'studentCount',
    },
    {
      title: '活动开始时间',
      dataIndex: 'startTimeStr',
    },
    {
      title: '活动结束时间',
      dataIndex: 'endTimeStr',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => (
        <Row justify="center" type="flex">
          <Button onClick={() => { this.onLookView('Edit', { ...record, activityTypeName: getDictionaryTitle(this.state.activity_type, record.activityType) }); }}>学员</Button>
        </Row>
      ),
    }
  ];
  //检索数据



  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let startTime = condition.startTime;
    if(startTime){
      condition.startTime = startTime[0]
      condition.endTime = startTime[1];
    }
    this.props.getZBActivityList(condition).payload.promise.then((response) => {
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
  // fetchUniversity = () => {
  //   var that = this;
  //   let condition = {};


  //   this.props.getUniversityByBranchId(condition).payload.promise.then((response) => {
  //     let data = response.payload.data;
  //     if (data.state === 'success') {
  //       var list = [];
  //       data.data.map(item => {
  //         list.push({
  //           universityId: item.universityId,
  //           universityName: item.universityName
  //         });
  //       })
  //       that.setState({ dic_University_list: list })

  //     }
  //     else {
  //       message.error(data.message);
  //     }
  //   })
  // }
  disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({ endOpen: true });
      }
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    }
  }

  onUniversityChoose(value, name) {

    var p = this.state.pagingSearch;

    if (value && value.length && value[0].id) {
        if (name == "universityId") {
            p[name] = value[0].id;
        }

    } else {
        p[name] = '';
    }
    this.setState({
        pagingSearch: p
    })
}

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Edit':
        block_content = <StudentView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'View':
      case 'Create':
        block_content = <View
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Manage':
      default:

        let extendButtons = [];

        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form">
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'招生季'} >
                        {getFieldDecorator('recruitBatchId', { initialValue: dataBind(this.state.pagingSearch.recruitBatchId) })(
                          <SelectRecruitBatch hideAll={true} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                            this.setState({ recruitBatchId: value })
                            //变更时自动加载数据

                          }} />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'分部'} >
                        {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                          <SelectFBOrg scope='my' hideAll={false} />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'活动类型'} >
                        {getFieldDecorator('activityType', { initialValue: dataBind(this.state.pagingSearch.activityType) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.activity_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="高校活动"
                      >
                        <div className='dv_col1' style={{ width: 60 }}>{getFieldDecorator('isUniversity', { initialValue: dataBind(this.state.pagingSearch.isUniversity) })(
                          <Select onChange={(value) => {
                            if (value == 1) {
                              this.setState({ isUniversity: true })
                            } else {
                              this.setState({ isUniversity: false })
                            }
                          }}>
                            {this.state.dic_YesNo.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}</div>
                        <div className='dv_col2'>
                          {this.state.isUniversity &&  <ZBEditableAllUniversityTagGroup maxTags={1}
                              onChange={(value) => this.onUniversityChoose(value, 'universityId')}
                          />
                          }</div>
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem {...searchFormItemLayout}
                        label="活动名称">
                        {getFieldDecorator('activityName', { initialValue: this.state.pagingSearch.activityName })(
                          <Input placeholder='请输入活动名称' />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem
                          {...searchFormItemLayout}
                          label="活动开始日期">
                          {getFieldDecorator('startTime', { initialValue:this.state.pagingSearch.startTime?[moment(this.state.pagingSearch.startTime,dateFormat),moment(this.state.pagingSearch.endTime,dateFormat)]:[] })(
                              <RangePicker style={{width:220}}/>
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
const WrappedManage = Form.create()(ActionQueryManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getZBActivityList: bindActionCreators(getZBActivityList, dispatch),
    postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
    getUniversityByBranchId: bindActionCreators(getUniversityByBranchId, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
