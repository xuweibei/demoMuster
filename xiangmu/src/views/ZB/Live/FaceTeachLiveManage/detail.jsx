
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

import { queryBookDetail, batchCancelBook } from '@/actions/live';

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import FileDownloader from '@/components/FileDownloader';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
import DropDownButton from '@/components/DropDownButton';
const dateFormat = 'YYYY-MM-DD';
class AppointmentDetail extends React.Component {
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
      branchList: [],
      teacherList: []
    };

  }
  
  
  componentWillMount() {
    this.loadBizDictionary(['student_source','book_source']);
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
      title: '学生分部',
      width:150,
      dataIndex: 'branchName',
    },
    {
      title: '学生教学点',
      width:150,
      dataIndex: 'teachCenterName',
    },
    {
      title: '课程班名称',
      width:120,
      dataIndex: 'coursePlanName',
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
      title: '来源',
      width:120,
      dataIndex: 'studentSource',
    },
    {
      title: '面授班类型',
      width:120,
      dataIndex: 'teachClassTypeMsg',
    },
    {
      title: '预约方式',
      width:100,
      dataIndex: 'bookSource',
    },
    {
      title: '科目学习状态',
      width:120,
      dataIndex: 'studyStatus',
    },
    {
      title: '是否重修',
      width:100,
      dataIndex: 'rehear',
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
      title: '签到状态',
      width:100,
      dataIndex: 'signStatusMsg',
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          { record.signStatusMsg == '未签到' && <Button onClick={() => { this.onBatchCancelBook(record); }}>取消预约</Button> }
          { record.signStatusMsg == '已签到' && '--' }
        </DropDownButton>
      ),
    }

  ];
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    condition.liveId = this.state.dataModel.liveId;
    condition.itemId = this.state.dataModel.itemId;
    condition.courseCategoryId = this.state.dataModel.courseCategoryId;
    
    this.props.queryBookDetail(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {

        if(data.data.length){

          var branchMap = data.data[0].branchMap;
          var teacheCenterMap = data.data[0].teacheCenterMap;
          var branchList = [],teacherList = [];

          for(var i in branchMap){
            branchList.push({orgId:i,orgName:branchMap[i]})
          }
          for(var i in teacheCenterMap){
            teacherList.push({teacherId:i,teacherName:teacheCenterMap[i]})
          }

          this.setState({
            branchList: branchList,
            teacherList: teacherList
          })

        }


        this.setState({ pagingSearch: condition, ...data, loading: false });

      }
    })
  }

  onBatchCancelBook = (record) => {
    Modal.confirm({
      title: '确认取消所选预约吗?',
      content: '请确认',
      onOk: () => {
        var params = {};
        var mobiles = [], liveNames = [];
        
        if(record.liveStudentId){
          params = {
            liveStudentIds:record.liveStudentId,
            mobiles:record.mobile,
            liveNames: this.state.dataModel.liveName
          }
        }else{

          this.state.MobileSelecteds.map((item)=>{
            mobiles.push(item.mobile);
            liveNames.push(this.state.dataModel.liveName)
          })
          params = {
            liveStudentIds:this.state.UserSelecteds.join(','),
            mobiles:mobiles.join(','),
            liveNames: liveNames.join(','),
          }
        }

        this.props.batchCancelBook(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('成功取消预约！');
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
            disabled: record.signStatusMsg == '已签到', // Column configuration not to be checked            
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
                            label="直播名称"
                        >
                          { this.state.dataModel.liveName }

                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="项目"
                        >
                         { this.state.dataModel.itemName }
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
                        label="学生分部"
                      >
                        {getFieldDecorator('branchId', { initialValue: dataBind(this.state.pagingSearch.branchId) })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.branchList.map((item, index) => {
                              return <Option title={item.orgName} value={item.orgId} key={index}>{item.orgName}</Option>
                            })}
                          </Select>
                        )}
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
                              return <Option title={item.teacherName} value={item.teacherId} key={index}>{item.teacherName}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="面授班类型"
                      >
                        {getFieldDecorator('teachClassType', { initialValue: dataBind(this.state.pagingSearch.teachClassType) })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option title="大客户方向班" value='1'>大客户方向班</Option>
                            <Option title="大客户精英班" value='2'>大客户精英班</Option>
                            <Option title="中博精英班" value='3'>中博精英班</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  
                   
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                         <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'手机'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                         <Input placeholder="手机" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="签到状态"
                      >
                        {getFieldDecorator('signStatus', { initialValue: dataBind(this.state.pagingSearch.signStatus) })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value='0'>未签到</Option>
                            <Option value='1'>已签到</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                          {...searchFormItemLayout}
                          label="来源"
                        >
                          {getFieldDecorator('studentSource', { initialValue: dataBind(this.state.pagingSearch.studentSource) })(
                            <Select>
                              <Option value="">全部</Option>
                              {this.state.student_source.map((item, index) => {
                                return <Option title={item.title} value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                          )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                          {...searchFormItemLayout}
                          label="预约方式"
                        >
                          {getFieldDecorator('bookSource', { initialValue: dataBind(this.state.pagingSearch.bookSource) })(
                            <Select>
                              <Option value="">全部</Option>
                              {this.state.book_source.map((item, index) => {
                                return <Option title={item.title} value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                          )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'课程班名称'} >
                        {getFieldDecorator('coursePlanName', { initialValue: this.state.pagingSearch.coursePlanName })(
                         <Input placeholder="课程班名称" />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            
            <div className="space-default"></div>
            <p style={{paddingBottom:15}}>已预约<b style={{padding:'0 5px'}}>{this.state.dataModel.liveName}</b>的学员为：</p>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={record => record.liveStudentId}//主键
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1900 }}
                rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                    <Col span={8}>
                        {
                          this.state.UserSelecteds.length > 0 ?
                          <Button onClick={this.onBatchCancelBook} icon="save" type="primary">批量取消</Button>
                          :
                          <Button disabled icon="save" type="primary">批量取消</Button>
                        }
                        
                        <div className='split_button' style={{ width: 10 }}></div>
                        <FileDownloader
                            apiUrl={'/edu/live/exportBookDetail'}//api下载地址
                            method={'post'}//提交方式
                            options={this.state.pagingSearch}//提交参数
                            title={'导出'}
                          >
                        </FileDownloader>
                        <div className='split_button' style={{ width: 10 }}></div>
                        <Button onClick={this.onCancel} icon="rollback">返回</Button>
                    </Col>
                </Row>
                <Row justify="end" align="middle" type="flex">
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
const WrappedManage = Form.create()(AppointmentDetail);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    queryBookDetail: bindActionCreators(queryBookDetail, dispatch),//查询列表
    batchCancelBook: bindActionCreators(batchCancelBook, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
