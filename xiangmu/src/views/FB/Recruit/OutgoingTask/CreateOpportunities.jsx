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
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import {
  discountRuleQuery, discountRuleCreate, discountRuleUpdate,
  discountRuleExpiryDateBatchUpdate,
  discountRuleProductQuery, discountRuleNotProductQuery,
  discountRuleProductAdd, discountRuleProductDelete,
  discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';
//getStudentAskBenefitList
import { getStudentAskBenefitList } from '@/actions/enrolStudent';
import { OutCallTaskCreateChange } from '@/actions/base';
import { updateOrderAchievementUser } from '@/actions/enrolStudent';
import { OutGoingConsultationViewList } from '@/actions/enrolStudent';
import { updateArea } from '@/actions/enrolStudent';
import { editUser} from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import OutCall from '@/components/BizSelect/OutCall';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
const dateFormat = 'YYYY-MM-DD';

const searchFormItemLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
  };
class StudentInviteManage extends React.Component {
  state = {
    areaId:'',
    isShowChooseProduct:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      taskId: '',
      regRegionId: '',
      studentName: '',
      askDateStart:'',
      askDateEnd:'',
      mobile:''
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
  };
  constructor() {
    super();
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
    this.loadBizDictionary(['discount_type','visit_status']);
    this.loadBizDictionary(['order_type']);
    this.loadBizDictionary(['order_status']);
    this.loadBizDictionary(['payee_type']);
    this.loadBizDictionary(['reg_source']);
    this.loadBizDictionary(['grade']);
    this.onSearch()
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }
  
  columns = [
    {
      title: '预约时间',
      fixed:'left',
      width:120,
      dataIndex: 'inviteDate',
      render: (text, record, index) => {
        return timestampToTime(record.inviteDate)
      },
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
      title: '在读高校校区',
      dataIndex: 'studyCampusName',
    },
    {
      title: '手机',
      dataIndex: 'mobile',
    },
    {
      title: '项目',
      dataIndex: 'itemName',
    },
    {
      title: '商品',
      dataIndex: 'productName',
    },
    {
      title: '备注',
      dataIndex: 'visitRemark',
    },
    {
      title: '是否到访',
      dataIndex: 'visitStatus',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.visit_status,record.visitStatus)
      },
    },
    {
      title: '到访时间',
      dataIndex: 'visitDate',
      render: (text, record, index) => {
        return timestampToTime(record.visitDate)
      },
    },
    {
      title: '反馈人',
      dataIndex: 'replyName',
    },
    {
      title: '反馈日期',
      fixed:'right',
      width:120,
      dataIndex: 'replyDate',
      render: (text, record, index) => {
        return timestampToTime(record.replyDate)
      },
    }

  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.regionId = this.props.currentDataModel.regionId;
    condition.callcenterTaskId = this.props.currentDataModel.callcenterTaskId;
    this.props.OutCallTaskCreateChange(condition).payload.promise.then((response) => {
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
  onStudentView = (record) => {
    this.onLookView("Manage", record)
    this.setState({
      isShowChooseProduct: true
    })
  }

  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  oneditpUser = () => {
    let params = { ids: this.state.UserSelecteds,type:3 }
    this.onLookView("editpUser", params)
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
    } else {
      switch (this.state.editMode) {
        case "EditDate":
          this.props.discountRuleExpiryDateBatchUpdate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Edit':
          this.props.updateOrderAchievementUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Create':
          this.props.discountRuleCreate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
          case 'editArea':
          this.props.updateArea(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        default:
          this.props.editUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({UserSelecteds:[]});
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }
  onCancel = () => {
      this.props.viewCallback();
  }
  changArea=(value)=>{
    this.setState({
      areaId:value
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "View":
      block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
      break;
      case 'Create':
      case 'Audit':
        // block_content = <DiscountView
        //   viewCallback={this.onViewCallback}
        //   {...this.state}
        // />
        // break;
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/callcenterTaskStudent/exportStudentChangeList'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
         extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>)
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons,1,true)}>
                {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'区域'} >
                        {this.props.currentDataModel.regionName}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'任务名称'} >
                         {this.props.currentDataModel.callcenterTaskName}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
                }
              
            </ContentBox>
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
               <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} onOff={true}/>
                 </Modal>
              }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                //rowSelection={rowSelection}
                rowKey={'studentAskId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                
                </Row>
                <Row justify="end" align="right" type="flex">
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
          </div>
        )
        break;
    }
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
    getStudentAskBenefitList: bindActionCreators(getStudentAskBenefitList, dispatch),
    updateArea: bindActionCreators(updateArea, dispatch),
    updateOrderAchievementUser: bindActionCreators(updateOrderAchievementUser, dispatch),
    editUser: bindActionCreators(editUser, dispatch),
    OutCallTaskCreateChange: bindActionCreators(OutCallTaskCreateChange, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
