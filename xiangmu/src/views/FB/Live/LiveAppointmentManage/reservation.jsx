
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker, Tooltip
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';

import { getNotLiveStudents, batchLiveBook } from '@/actions/live';

import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';

const dateFormat = 'YYYY-MM-DD';
class ReservationList extends React.Component {
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
        studyStatus: '',
        isRestudy: ''
      }, 
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      MobileSelecteds: [],
      loading: false,
      branchList: [],
      teacherList: []
    };

  }
  
  
  componentWillMount() {
    this.loadBizDictionary(['category_detail_study_status']); 
    this.onSearch();
  }
  compoentDidMount() {
    
  }
  
  columns = [
    {
      title: '学生姓名',
      width: 100,
      fixed: 'left',
      dataIndex: 'realName',
    },
    {
      title: '学生教学点',
      width:150,
      dataIndex: 'teachCenterName',
    },
    {
      title: '证件号',
      width:180,
      dataIndex: 'certificateNo',
    },
    {
      title: '学号',
      width:180,
      dataIndex: 'studentNo',
    },
    {
      title: '手机',
      width:120,
      dataIndex: 'mobile',
    },
    {
      title: '面授班类型',
      width:120,
      dataIndex: 'teachClassType',
    },
    {
      title: '科目学习状态',
      width:120,
      dataIndex: 'studyStatus',
    },
    {
      title: '是否重修',
      width:100,
      dataIndex: 'isRestudy',
    },
    {
      title: '面授总标准学时',
      width:150,
      dataIndex:'classHour',
    },
    {
      title: '已参加面授课时',
      width:150,
      dataIndex:'attendClassHour',
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <div>
          { !record.isDisabled && <Button onClick={() => { this.onBatchLiveBook(record); }}>预约</Button> }
          { record.isDisabled && <Tooltip title={record.gainExplain}>
                                    <a href="javascript:;">查看原因</a>
                                  </Tooltip> }
        </div>
      ),
    }

  ];
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    condition.liveId = this.state.dataModel.liveId;
    condition.courseArrangeId = this.state.dataModel.courseArrangeId;  //课程班id
    condition.courseCategoryId = this.state.dataModel.courseCategoryId;  //科目id
    
    this.props.getNotLiveStudents(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {

          //获取学生教学点列表
          let teacherList = [];

          data.data.list.map((item) => {
            item && teacherList.push(item)
          })

          this.setState({
            teacherList: teacherList
          })

        this.setState({ pagingSearch: condition, data:data.data.page.pageResult,totalRecord:data.data.page.totalRecord, loading: false });

      }
    })
  }

  onBatchLiveBook = (record) => {
    Modal.confirm({
      title: '确认要预约该直播吗?',
      content: '请确认',
      onOk: () => {
        var params = {};
        var mobiles = [], studentNames = [];
        
        if(record.studentId){
          params = {
            studentIds:record.studentId,
            mobiles:record.mobile,
            studentNames: record.realName
          }
        }else{

          this.state.MobileSelecteds.map((item)=>{
            mobiles.push(item.mobile);
            studentNames.push(item.realName);
          })
          params = {
            studentIds:this.state.UserSelecteds.join(','),
            mobiles:mobiles.join(','),
            studentNames: studentNames.join(',')
          }
        }

        params.liveId = this.state.dataModel.liveId;
        params.courseArrangeId = this.state.dataModel.courseArrangeId;

        this.props.batchLiveBook(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('预约成功！');
            this.setState({ UserSelecteds: [],MobileSelecteds: [] })
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
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
      case 'Manage':
      default:

      var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            this.setState({ UserSelecteds: selectedRowKeys })
            this.setState({ MobileSelecteds: selectedRows })
          },
          getCheckboxProps: record => ({
            disabled: record.isDisabled, // Column configuration not to be checked            
          }),
        }

      let extendButtons = [];
      
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="课程班名称"
                        >
                          { this.state.dataModel.coursePlanName }

                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="教学点"
                        >
                         { this.state.dataModel.teachCenterName }
                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="科目"
                        >
                            { this.state.dataModel.courseCategoryName }
                        </FormItem>
                    </Col>
                    <Col span={8} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="学生教学点"
                      >
                        {getFieldDecorator('teachCenterId', { initialValue: dataBind(this.state.pagingSearch.teachCenterId) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.teacherList.map((item, index) => {
                              return <Option title={item.orgName} value={item.orgId} key={index}>{item.orgName}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                   
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="科目学习状态"
                        >
                            {getFieldDecorator('studyStatus', { initialValue: this.state.pagingSearch.studyStatus })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.category_detail_study_status.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="是否重修"
                        >
                            {getFieldDecorator('isRestudy', { initialValue: this.state.pagingSearch.isRestudy })(
                                <Select>
                                    <Option value="">全部</Option>
                                    <Option value='1' key='1'>是</Option>
                                    <Option value='0' key='0'>否</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    
                    <Col span={8}>
                      
                    </Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            
            <div className="space-default"></div>
            <p style={{paddingBottom:15}}>您将为<b style={{padding:'0 5px'}}>{this.state.dataModel.coursePlanName}</b>预约直播的学员为：</p>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={record => record.studentId}//主键
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1500 }}
                rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                </Row>
                <Row justify="end" align="middle" type="flex">
                  <Col span={8}>
                    {
                      this.state.UserSelecteds.length > 0 ?
                      <Button onClick={this.onBatchLiveBook} icon="save" type="primary">批量预约</Button>
                      :
                      <Button disabled icon="save" type="primary">批量预约</Button>
                    }
                    
                    <span className="split_button"></span>
                    <Button onClick={this.onCancel} icon="rollback">返回</Button>
                  </Col>
                  <Col span={16} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(ReservationList);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getNotLiveStudents: bindActionCreators(getNotLiveStudents, dispatch),//查询列表
    batchLiveBook: bindActionCreators(batchLiveBook, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
