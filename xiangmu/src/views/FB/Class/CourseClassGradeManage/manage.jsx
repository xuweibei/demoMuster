
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';

import { queryCourseArrangeScoreVosManageList, getExamBatchByItem, addOrEditOrDelStudentScoreManage } from '@/actions/course';

import FileDownloader from '@/components/FileDownloader';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import EditableLiveName from '@/components/EditableLiveName';

import Edit from './gradeEidt';

const dateFormat = 'YYYY-MM-DD';
class GradeManage extends React.Component {
  constructor(props) {
    super(props);
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      dataModel: props.currentDataModel,
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
      }, 
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      MobileSelecteds: [],
      loading: false,
      dic_exam_batch: []
    };

  }
  
  
  componentWillMount() {
    this.loadBizDictionary(['pass_status','exam_status']); 
    if(this.state.dataModel.itemId){
      this.props.getExamBatchByItem(this.state.dataModel.itemId).payload.promise.then((response) => {
        let data = response.payload.data;
        if(data.state === 'success'){
          var list = [];
          data.data.map(item => {
            list.push({value: item.examBatchId, title: item.examBatchName});
          })
          this.setState({
            dic_exam_batch: list
          })
        }
      });
    }
    this.onSearch();
  }
  compoentDidMount() {
    
  }
  
  columns = [
    {
      title: '学生教学点',
      width:150,
      fixed: 'left',
      dataIndex: 'teachCenterName',
    },
    {
      title: '学生姓名',
      width: 100,
      dataIndex: 'realName',
    },
    {
      title: '证件号',
      dataIndex: 'certificateNo',
    },
    {
      title: '手机',
      width:120,
      dataIndex: 'mobile',
    },
    {
      title: '考季',
      dataIndex: 'examBatchName',
    },
    {
      title: '报考',
      width:120,
      dataIndex: 'scoreType',
    },
    {
      title: '分数',
      width:120,
      dataIndex: 'score',
    },
    {
      title: '通过情况',
      width:100,
      dataIndex: 'stateMsg',
    },
    {
      title: '成绩附件',
      width:150,
      dataIndex:'scoreFile',
      render: (text,record) => {
          if(record.scoreFile!=null && record.scoreFile != ''){
              return <FileDownloader
                  apiUrl={'/edu/file/getFile'}//api下载地址
                  method={'post'}//提交方式
                  options={{ filePath: record.scoreFile }}//提交参数
                  title={'附件'}
              >
              </FileDownloader>
          }else{
              return '';
          }
      }
    },
    {
      title: '考试日期',
      width:120,
      dataIndex:'examDate',
      render: (text, record, index) => {
          return timestampToTime(record.examDate);
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => {
        return <DropDownButton>
          {
            !record.studentScoreId && <Button onClick={() => { this.onExamination(record); }}>报考</Button>
          }
          {
            record.studentScoreId && <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
          }
          {
            record.studentScoreId && <Button onClick={() => { this.onExamDetal(record); }}>删除</Button>
          }
        </DropDownButton>
      },
    }

  ];
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    condition.courseArrangeId = this.state.dataModel.courseArrangeId;  //课程班id
    
    this.props.queryCourseArrangeScoreVosManageList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {

        this.setState({ pagingSearch: condition, ...data, loading: false });

      }
    })
  }

  //报考
  onExamination = (record) => {
    Modal.confirm({
      title: '您确定为此学生生成'+record.examBatchName+'【课程班预估考季】的报考信息吗?',
      content: '请确认',
      onOk: () => {
        var params = {};
        params.scoreType = 1;//报考标识 1报考
        params.courseArrangeId = record.courseArrangeId;
        params.studentId = record.studentId;
        params.examBatchId = record.examBatchId;
        params.courseCategoryId = record.courseCategoryId;
        
        this.props.addOrEditOrDelStudentScoreManage(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('报考成功！');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

  //删除
  onExamDetal = (record) => {
    Modal.confirm({
      title: '您确定删除此学生的报考及成绩信息吗？',
      content: '请确认',
      onOk: () => {
        var params = {};
        params.delFlag = 1; //删除标识:1为删除
        params.studentScoreId = record.studentScoreId;//成绩id

        this.props.addOrEditOrDelStudentScoreManage(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('报考成功！');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

  //视图回调
  onViewCallback = (dataModel) => {

    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' });
      this.onSearch();
    } else {
      switch (this.state.editMode) {
        case 'Create':
        case 'Edit':
          this.props.addOrEditOrDelStudentScoreManage(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message, 5);
            }
            else {
              message.success('操作成功！')
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
          case 'Manage':
          default:
            //进入管理页
            this.onSearch();
            this.onLookView("Manage", null);
            break;
      }
    }
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

  //视图回调
  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Edit':
        block_content = <Edit
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />
        break; 
        
      case 'Manage':
      default:

      let extendButtons = [];

      const prefixSelector = getFieldDecorator('textKey', {
        initialValue: dataBind(this.state.pagingSearch.textKey || 'realName'),
      })(
        <Select style={{ width: 98 }} onChange={this.onCountryChange}>
          <Option value='realName'>学生姓名</Option>
          <Option value='mobile'>手机号</Option>
          <Option value='certificateNo'>证件号</Option>
          <Option value='orderSn'>订单号</Option>
        </Select>
        );
      
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                  <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="课程班名称"
                        >
                          { this.state.dataModel.courseplanName }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="教学点"
                        >
                         { this.state.dataModel.teachCenterName }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="科目"
                        >
                            { this.state.dataModel.courseCategoryName }
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="预估考季">
                        {getFieldDecorator('examBatchId', {
                          initialValue: dataBind(this.state.pagingSearch.examBatchId),
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_exam_batch.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="报考情况">
                        {getFieldDecorator('scoreType', {
                          initialValue: dataBind(this.state.pagingSearch.scoreType),
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.exam_status.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="分数"
                      >
                        {getFieldDecorator('score', { initialValue: dataBind(this.state.pagingSearch.score) })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value='1'>有</Option>
                            <Option value='0'>无</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="通过情况">
                        {getFieldDecorator('state', {
                          initialValue: dataBind(this.state.pagingSearch.state),
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.pass_status.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}><FormItem
                        {...searchFormItemLayout}
                        label="多条件查询"
                      >
                        {getFieldDecorator('textValue', {
                          initialValue: this.state.pagingSearch.textValue,
                        })(
                          <Input style={{width:250}} addonBefore={prefixSelector}
                          />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="成绩附件"
                      >
                        {getFieldDecorator('scoreFile', { initialValue: dataBind(this.state.pagingSearch.scoreFile) })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value='1'>有</Option>
                            <Option value='0'>无</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      
                    </Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={record => record.liveStudentId}//主键
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1500 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                </Row>
                <Row justify="end" align="middle" type="flex">
                  <Col span={4}>
                    <Button onClick={this.onCancel} icon="rollback">返回</Button>
                  </Col>
                  <Col span={20} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(GradeManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    queryCourseArrangeScoreVosManageList: bindActionCreators(queryCourseArrangeScoreVosManageList, dispatch),//查询列表
    getExamBatchByItem: bindActionCreators(getExamBatchByItem, dispatch),
    addOrEditOrDelStudentScoreManage: bindActionCreators(addOrEditOrDelStudentScoreManage, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
