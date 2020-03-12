
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

import { getLivesAppointmentList, batchCancelBook } from '@/actions/live';

import FileDownloader from '@/components/FileDownloader';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import EditableLiveName from '@/components/EditableLiveName';
import LiveStudentImport from './import';
import Reservation from './reservation';

const dateFormat = 'YYYY-MM-DD';
class AppointmentCreate extends React.Component {
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
    };

  }
  
  
  componentWillMount() {
    this.loadBizDictionary([]); 
    this.onSearch();
  }
  compoentDidMount() {
    
  }
  
  columns = [
    {
      title: '直播名称',
      width: 150,
      fixed: 'left',
      dataIndex: 'liveName',
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName'
    },
    {
      title: '讲师',
      dataIndex: 'teacher',
    },
    {
      title: '预约开始时间',
      dataIndex: 'bookStartTime',
      render: (text, record, index) => {
        return timestampToTime(record.bookStartTime);
      }
    },
    {
      title: '预约截止时间',
      dataIndex: 'bookEndTime',
      render: (text, record, index) => {
        return timestampToTime(record.bookEndTime);
      }
    },
    {
      title: '开始时间',
      dataIndex: 'liveStartTime',
      render: (text, record, index) => {
        return timestampToTime(record.liveStartTime);
      }
    },
    {
      title: '结束时间',
      dataIndex: 'liveEndTime',
      render: (text, record, index) => {
        return timestampToTime(record.liveEndTime);
      }
    },
    {
      title: '本班人数',
      width:100,
      dataIndex: 'studentCount',
    },
    {
      title: '剩余名额',
      width:100,
      dataIndex: 'remainBookStudentCount',
    },
    {
      title: '允许学生预约',
      dataIndex: 'isPublic'
    },
    {
      title: '状态',
      dataIndex: 'liveStatus'
    },
    {
      title: '资料下载',
      width:120,
      dataIndex: 'studyFile',
      render: (text, record, index) => {
        return record.studyFile ? <FileDownloader
                    apiUrl={'/edu/file/getFile'}//api下载地址
                    method={'post'}//提交方式
                    options={{ filePath: record.studyFile }}
                    title={'下载'}
                  >
                  </FileDownloader> : '--'
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onLookView('Reservation', record); }}>预约</Button>
          <Button onClick={() => { this.onLookView('Import', record); }}>导入名单</Button>
        </DropDownButton>
      ),
    }

  ];
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    condition.courseArrangeId = this.state.dataModel.courseArrangeId;  //课程班id
    
    this.props.getLivesAppointmentList(condition).payload.promise.then((response) => {
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
            liveNames: record.liveName
          }
        }else{

          this.state.MobileSelecteds.map((item)=>{
            mobiles.push(item.mobile);
            liveNames.push(item.liveName);
          })
          params = {
            liveStudentIds:this.state.UserSelecteds.join(','),
            mobiles:mobiles.join(','),
            liveNames: liveNames.join(',')
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

  //视图回调
  onViewCallback = (dataModel) => {

    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' });
      this.onSearch();
    } else {
      switch (this.state.editMode) {
        case 'Create':
        case 'Edit':
          
          break;
          case 'Manage':
          case 'Reservation':
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
    item.coursePlanName = this.state.dataModel.coursePlanName;
    item.courseArrangeId = this.state.dataModel.courseArrangeId;
    item.teachCenterName = this.state.dataModel.teachCenterName;
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
     
      case 'Import':
        block_content = <LiveStudentImport
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />
        break; 
      case 'Reservation':
        block_content = <Reservation
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />
        break; 
        
      case 'Manage':
      default:

      let extendButtons = [];
      
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                   
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'直播名称'} >
                        {getFieldDecorator('liveName', { initialValue: this.state.pagingSearch.liveName })(
                         <Input placeholder="请输入直播名称" />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'讲师'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                         <Input placeholder="请输入讲师名称" />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            
            <div className="space-default"></div>
            <p style={{paddingBottom:15}}>您将为<b style={{padding:'0 5px'}}>{this.state.dataModel.coursePlanName}</b>学员预约直播：</p>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={record => record.liveStudentId}//主键
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1700 }}
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
const WrappedManage = Form.create()(AppointmentCreate);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getLivesAppointmentList: bindActionCreators(getLivesAppointmentList, dispatch),//查询列表
    batchCancelBook: bindActionCreators(batchCancelBook, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
