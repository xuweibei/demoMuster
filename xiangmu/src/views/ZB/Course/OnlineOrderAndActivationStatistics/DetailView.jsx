/*
订单业绩相关调整
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
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
//getStudentAskBenefitList
import { NewActivationStudentList } from '@/actions/course';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import FileDownloader from '@/components/FileDownloader';
// import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  constructor(props) {
    super(props);
    
      this.state = { 
        vationId:'',
        dataModal:[], 
        NVisiting:false,
        activation:false,
        editMode: '',
        pagingSearch: {
          currentPage: 1,
          pageSize: 10,
          itemId:props.currentDataModel.itemId,
          startDate:props.pagingSearch.startDate,
          endDate:props.pagingSearch.endDate,
        }, 
        UserSelecteds: [],
        loading: false,
        taskMan:[],
        applyNew:[]
      };
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() {
    console.log("CoursePlanAudit componentWillMount"); 
    this.loadBizDictionary(['reg_source','active_state']);  
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount","student_course_apply_audit_status");
  }
  
  columns = [
    
    {
      title: '分部/区域',
      fixed: 'left',
      width:150,
      dataIndex: 'orgName',
    },
    {
      title: '学生姓名',
      dataIndex: 'realName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.realName}</a>;
        
      }
    },
    {
      title: '性别',
      dataIndex: 'gender',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '学生来源',
      dataIndex: 'regSource',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.reg_source,record.regSource)
      }
    },
    {
      title: '目前情况',
      dataIndex: 'isStudy',
    },
    {
      title: '就读高校',
      dataIndex: 'universityName',
    },
    {
      title: '入学年份',
      dataIndex: 'studyUniversityEnterYear',
    },
    {
      title: '微信号',
      dataIndex: 'weixin',
    },
    {
      title: 'QQ号',
      dataIndex: 'qq',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      fixed:'right',
      width:100
    }


  ];

  onStudentView = (record) => {
    this.onLookView("Manage", record)
    this.setState({
      isShowChooseProduct:true
    })
  }
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.NewActivationStudentList(condition).payload.promise.then((response) => {
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
            block_content = (
              <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={'studentCourseApplyId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                </Row>
                {
                  this.state.isShowChooseProduct &&
                  <Modal
                  title="订单商品选择"
                  visible={this.state.isShowChooseProduct}
                  //onOk={this.onChangeDate}
                  onCancel={this.onHideModal}
                  //okText="确认"
                  //cancelText="取消"
                  footer={null}
                  width={1000}
                >
                <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} goBack={true} />
                  </Modal>
                }
                <Row justify="end" align="right" type="flex">
                  <Col span={3}>
                    <FileDownloader
                      apiUrl={'/edu/statistics/exportActiveStudents'}//api下载地址
                      method={'post'}//提交方式
                      options={this.state.pagingSearch}//提交参数
                      title={'导出'}
                    >
                    </FileDownloader>
                  </Col>
                  <Col span={3}>
                  
                  <Button loading={this.state.loading} icon="rollback" onClick={this.onCancel}  style={{marginLeft:'2%'}}>返回</Button>
                  </Col>
                  <Col span={18} className={'search-paging-control'} align="right">
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
            )
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(StudentInviteManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    NewActivationStudentList: bindActionCreators(NewActivationStudentList, dispatch),//查询列表 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
