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
const confirm  = Modal.confirm ;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
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
import { updateOrderAchievementUser } from '@/actions/enrolStudent';
import { getStudentInviteList } from '@/actions/enrolStudent';
import { OutCallTaskStudentNum,OutCallTaskStudentNumDelete } from '@/actions/base';
import { updateArea } from '@/actions/enrolStudent';
import { editUser} from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import FileDownloader from '@/components/FileDownloader';
import StudentManage from './student';
// import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    isShowChooseProduct:false,
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      callcenterTaskId:'',
      studentName: '',
      mobile:'',
      grade:'',
      orderStatus:'',
      changeOrNot:'',
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
    deletaArr:[]
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
    this.loadBizDictionary(['discount_type','visit_status','callcenter_task_status']);
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
  showConfirm=()=>{
    const that = this
    confirm({
      // title: 'Do you Want to delete these items?',
      content: '您确定删除所选数据吗?',
      onOk() {
        let arr = [];
        that.state.deletaArr.forEach((e)=>{
          arr.push(e.studentId);
        });
        let studentIds = arr.join(',');
        that.props.OutCallTaskStudentNumDelete({studentIds}).payload.promise.then((response) => {
          let data = response.payload.data;
          if(data.state=='success'){
            message.success('成功删除！');
            that.onSearch();
            that.setState({
              deletaArr:[],
              UserSelecteds:[]
            })
          }else{
            message.error('删除失败！')
          }
        })
      },
      // onCancel() {
      //   console.log('Cancel');
      // },
    })
  }

  columns = [
    
    {
      title: '学生姓名',
      fixed: 'left',
      width:150,
      dataIndex: 'realName',
    },
    {
      title: '手机',
      dataIndex: 'mobile',
    },
    {
      title: '产生机会',
      dataIndex: 'changeOrNotName',
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
      title: '学生意向等级',
      dataIndex: 'gradeName',
    },
    {
      title: '学生订单情况',
      dataIndex: 'orderStatusName',
    },
    {
      title: '目前情况',
      dataIndex: 'isStudyName',
    },
    {
      title: '在读高校',
      dataIndex: 'universityName'
    },
    {
      title: '入学年份',
      dataIndex: 'enterYear',
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
      dataIndex: 'certificateNo'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width:120,
      fixed:'right'
    }
  ];

  
  onCancel = () => {
    this.props.viewCallback();
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
    let askDate = condition.startInviteDate;
    if(Array.isArray(askDate)){
        condition.startInviteDate = formatMoment(askDate[0]);
        condition.endInviteDate = formatMoment(askDate[1]);
    }
    condition.callcenterTaskId = this.props.currentDataModel.callcenterTaskId;
    this.props.OutCallTaskStudentNum(condition).payload.promise.then((response) => {
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

  onStudentView = () => {
    this.setState({
      isShowChooseProduct:true
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "Student":
        block_content = <StudentManage viewCallbackNum={this.onViewCallback} onOffNum={true} {...this.props} />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys,deletaArr:selectedRows })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
       { this.props.currentDataModel.status!=1&&extendButtons.push(<Button onClick={() => { this.onLookView('Student', { recruitBatchId: this.state.pagingSearch.recruitBatchId }) }
        } icon="plus" className="button_dark" > 上传学生</Button>);}
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/callcenterTaskStudent/exportStudentList'}//api下载地址
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
                              this.props.currentDataModel.regionName
                            }
                        </FormItem>
                    </Col>
                    <Col span={12}>
                       <FormItem {...searchFormItemLayout} label={'任务名称'} >
                            {
                                 this.props.currentDataModel.callcenterTaskName
                            }
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={'状态'} >
                           { getDictionaryTitle(this.state.callcenter_task_status,this.props.currentDataModel.status)}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.realName })(
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
                      <FormItem {...searchFormItemLayout} label={'学生意向等级'} >
                        {getFieldDecorator('grade', { initialValue: this.state.pagingSearch.grade })(
                            <Select>
                            <Option value="">全部</Option>
                            {this.state.grade.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem {...searchFormItemLayout} label="学生订单情况" >
                            {getFieldDecorator('orderStatus', { initialValue: '' })(
                                <Select>
                                    <Option value="">全部</Option>
                                    <Option value="1" key="1">无订单</Option>
                                    <Option value="2" key="2">已下单未缴费</Option>
                                    <Option value="3" key="3">已下单已缴费</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'是否产生机会'} >
                              {getFieldDecorator('changeOrNot', { initialValue: '' })(
                                  <Select>
                                     <Option value=''>全部</Option>
                                     <Option value='1'>是</Option>
                                     <Option value='2'>否</Option>
                                  </Select>
                              )}
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
                rowSelection={this.props.currentDataModel.status==1?'':rowSelection}
                rowKey={'studentAskId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1800 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                    <Col span={12}>
                            {
                                this.state.UserSelecteds.length ?
                                <Button loading={this.state.loading} icon="save" onClick={this.showConfirm}>删除</Button>
                                :
                                <Button loading={this.state.loading} icon="save" disabled>删除</Button>
                            }
                            <div className='split_button'></div>
                            <Button onClick={this.onCancel} icon="rollback">返回</Button>
                    </Col>
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
    updateArea: bindActionCreators(updateArea, dispatch),
    updateOrderAchievementUser: bindActionCreators(updateOrderAchievementUser, dispatch),
    editUser: bindActionCreators(editUser, dispatch),
    OutCallTaskStudentNum: bindActionCreators(OutCallTaskStudentNum, dispatch),//查询列表
    OutCallTaskStudentNumDelete: bindActionCreators(OutCallTaskStudentNumDelete, dispatch),//查询列表删除
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
