/*
外呼机会到访反馈
*/

import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const { RangePicker } = DatePicker;
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic'; 
//getStudentAskBenefitList
import { OutGoingTaskOppoList,OutGoingTaskBatchArrive,OutGoingTaskBatcNohArrive,ShareOpportunityPreservation } from '@/actions/base';
import { updateOrderAchievementUser } from '@/actions/enrolStudent'; 
import { updateArea } from '@/actions/enrolStudent';
import { editUser} from '@/actions/recruit';
import ContentBox from '@/components/ContentBox'; 
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    isShowChooseProduct:false,
    NVisiting:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      regionId: '',
      callcenterTaskId:'',
      realName: '',
      mobile:'',
      visitStatus:'',
      startInviteDate:'',
      endInviteDate:'',
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
    taskMan:[]
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
      title: '区域',
      fixed: 'left',
      width:120,
      dataIndex: 'regionName',
    },
    {
      title: '任务名称',
      width:120,
      dataIndex: 'callcenterTaskName', 
    },
    {
      title: '预约时间',
      width:120,
      dataIndex: 'inviteDate',
      render: (text, record, index) => {
        return timestampToTime(record.inviteDate)
      },
    },
    {
      title: '学生姓名',
      width:120,
      dataIndex: 'realName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.realName}</a>;
        
      }
    },
    {
      title: '在读高校校区',
      width:120,
      dataIndex: 'studyCampusName',
    },
    {
      title: '手机',
      width:120,
      dataIndex: 'mobile',
    },
    {
      title: '项目',
      width:120,
      dataIndex: 'itemName',
    },
    {
      title: '商品',
      dataIndex: 'productName',
    },
    {
      title: '是否到访',
      width:100,
      dataIndex: 'visitStatus',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.visit_status,record.visitStatus)
      },
    },
    {
      title: '到访时间',
      width:120,
      dataIndex: 'visitDate',
      render: (text, record, index) => {
        return timestampToTime(record.visitDate)
      },
    },
    {
      title: '反馈人',
      width:120,
      dataIndex: 'replyName',
    },
    {
      title: '反馈日期',
      width:120,
      dataIndex: 'replyDate',
      render: (text, record, index) => {
        return timestampToTime(record.replyDate)
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width:120,
      render: (text, record) => {
        return <DropDownButton>
            {
              record.visitStatus==0?'':<Button onClick={() => { this.onLookView('ViewEdit', record); }}>编辑</Button>
            }
            <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
        </DropDownButton>
      }
    }


  ];
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  onNVisiting=()=> {
    this.setState({
      NVisiting: false
    })
  }
  onSuerNVisiting=()=>{
    let arr = [];
    this.state.taskMan.forEach((item)=>{
      arr.push(item.studentInviteId)
    })
    this.props.OutGoingTaskBatcNohArrive({studentInviteIds:arr.join(',')}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        message.success('修改成功！')
        this.onSearch();
        this.setState({
          UserSelecteds:[],
          taskMan:[],
          NVisiting: false
        })
        this.onLookView("Manage", null);
      }
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    
    let askDate = condition.startInviteDate;
    if(Array.isArray(askDate)){
        condition.startInviteDate = formatMoment(askDate[0]);
        condition.endInviteDate = formatMoment(askDate[1]);
    }
    this.props.OutGoingTaskOppoList(condition).payload.promise.then((response) => {
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
      isShowChooseProduct:true
    })
  }

  Visiting = () => {
    let params = { ids: this.state.UserSelecteds,taskMan:this.state.taskMan,type:3 }
    this.onLookView("editpUser", params)
  }
  NotVisiting=()=>{
    // this.onLookView("Manage", record)
    this.setState({
      NVisiting:true
    })
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
        case 'editpUser':
          this.props.OutGoingTaskBatchArrive(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              message.success('修改成功！')
              this.onSearch();
              this.setState({
                UserSelecteds:[],
                taskMan:[]
              })
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
          case 'ViewEdit':
          this.props.ShareOpportunityPreservation(dataModel).payload.promise.then((res)=>{
            let data = res.payload.data;
            if(data.state == 'error'){
              message.error(data.message)
            }else{
              this.onSearch();
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

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ViewEdit':
      case "View":
        block_content = <DetailView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
       break;
      case 'EditDate':
      case 'Edit':
      case 'editmUser':
      case 'editpUser':
      case 'editfUser':
      case 'editArea':
        block_content = <StudentAskfaceView
          viewCallback={this.onViewCallback}
          {...this.state}

        />
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
            this.setState({ UserSelecteds: selectedRowKeys,taskMan:selectedRows })
          },
          getCheckboxProps: record => { 
            return ({
              disabled: record.visitStatus==0? false:true,    // Column configuration not to be checked
            })
          },
        };
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/StudentInvite/exportStudengtInviteTaskList'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出'}
        >
        </FileDownloader>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
             
             
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'区域'} >
                            {
                                getFieldDecorator('regionId', {
                                    initialValue: ''
                                })
                                    (
                                    <SelectArea scope='my' showCheckBox={false} />
                                    )
                            }
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                         <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'手机号'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                            <Input placeholder="手机号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'是否到访'} >
                              {getFieldDecorator('visitStatus', { initialValue: dataBind(this.state.pagingSearch.activityType) })(
                                  <Select>
                                    <Option value=''>全部</Option>
                                    {this.state.visit_status.map((item,i)=>{
                                      return <Option value={item.value}>{item.title}</Option>
                                    })}
                                  </Select>
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="预约日期"
                      >
                        {getFieldDecorator('startInviteDate', { initialValue: this.state.pagingSearch.startInviteDate?[moment(this.state.pagingSearch.startInviteDate,dateFormat),moment(this.state.pagingSearch.endInviteDate,dateFormat)]:[] })(
                        
                              <RangePicker style={{width:220}}/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}></Col>
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
               <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} onOff={true}  goBack={true}/>
                 </Modal>
              }
                {
                 this.state.NVisiting &&
                 <Modal
                 visible={this.state.NVisiting}
                 onOk={this.onSuerNVisiting}
                 onCancel={this.onNVisiting}
                 closable={false}
                 //okText="确认"
                 //cancelText="取消"
                 >
                 <p style={{fontSize:16}}>您确定所选学生未到访？</p>
                 </Modal>
                 
              }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'studentInviteId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1800 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                    <Col span={24}> 
                        {
                          this.state.UserSelecteds.length ?
                          <Button loading={this.state.loading} icon="environment" onClick={this.Visiting}>到访</Button>
                          :
                          <Button loading={this.state.loading} icon="environment" disabled>到访</Button>
                        }
                        <div className='split_button' style={{ width: 10 }}></div> 
                        {
                            this.state.UserSelecteds.length ?
                            <Button loading={this.state.loading} icon="eye" onClick={this.NotVisiting}>未到访</Button>
                            :
                            <Button loading={this.state.loading} icon="eye" disabled>未到访</Button>
                          }
                    </Col>
                </Row>
                <Row justify="end" align="right" type="flex"> 
                  <Col span={24} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}
                      pageSizeOptions = {['10','20','30','50','100','200']}
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
    updateArea: bindActionCreators(updateArea, dispatch),
    updateOrderAchievementUser: bindActionCreators(updateOrderAchievementUser, dispatch),
    editUser: bindActionCreators(editUser, dispatch), 
    OutGoingTaskOppoList: bindActionCreators(OutGoingTaskOppoList, dispatch),//查询列表
    OutGoingTaskBatchArrive: bindActionCreators(OutGoingTaskBatchArrive, dispatch),//批量到访
    OutGoingTaskBatcNohArrive: bindActionCreators(OutGoingTaskBatcNohArrive, dispatch),//批量未到访
    ShareOpportunityPreservation: bindActionCreators(ShareOpportunityPreservation, dispatch),//外呼机会编辑保存
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
