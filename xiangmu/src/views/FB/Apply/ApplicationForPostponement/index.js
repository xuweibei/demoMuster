/*
学生网课延期申请
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
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, renderSearchTopButtons, renderSearchBottomButtons,onToggleSearchOption } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { ApplicationForPostponementList,ApplicationForPostponementBachApply,OutGoingTaskBatcNohArrive,ShareOpportunityPreservation } from '@/actions/base';
import { getStudentInviteList } from '@/actions/enrolStudent';
import { editUser} from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import StudentAskfaceView from './BatchApplication';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import DropDownButton from '@/components/DropDownButton';
import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    isShowChooseProduct:false,
    NVisiting:false,
    editMode: '',
    applyNew:'',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      textKey: '',
      textValue	:'',
      courseName: '',
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
      title: '教学点',
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
      title: '用户名',
      dataIndex: 'loginName',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
    },
    {
      title: '所属商品名称',
      dataIndex: 'productName',
    },
    {
      title: '延期次数',
      dataIndex: 'applyCount',
    },
    {
      title: '操作',
      fixed: 'right',
      width:120,
      render: (text, record) => {
        return <DropDownButton>
            <Button onClick={() => { this.onLookView('View', record); }}>查看历史</Button>
        </DropDownButton>
      }
    }


  ];
  //关闭点击学生姓名时候的弹窗
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  //关闭有错误信息时候的弹窗
  onNVisiting=()=> {
    this.setState({
      NVisiting: false
    })
  }
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.ApplicationForPostponementList(condition).payload.promise.then((response) => {
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
  //点击学生姓名的弹框
  onStudentView = (record) => {
    this.onLookView("Manage", record)
    this.setState({
      isShowChooseProduct:true
    })
  }
  //进入批量申请页面
  Visiting = () => {
    let params = { ids: this.state.UserSelecteds,taskMan:this.state.taskMan,type:3 }
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
        case 'editpUser':
          this.props.ApplicationForPostponementBachApply(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              // message.success('修改成功！');
              // this.onSearch();
              this.setState({
                UserSelecteds:[],
                taskMan:[],
                NVisiting:true,
                applyNew:data.data
              })
              this.countDown();
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
  //确认修改成功的弹框
  countDown = () => {
    let cont = this.state.applyNew.errorMsg.map(e=><p>{e}</p>);
    let success = this.state.applyNew.successCount
    Modal.warning({
      title:'成功修改数据'+ success+'条',
      content: cont,
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "View":
        block_content = <DetailView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
       break;
      case 'editpUser':
        block_content = <StudentAskfaceView
          viewCallback={this.onViewCallback}
          {...this.state}

        />
        break;
      case 'Manage':
      default:
      
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys,taskMan:selectedRows })
          },
          getCheckboxProps: record => {
            // console.log(record)
            return ({
              disabled: '',    // Column configuration not to be checked
            })
          },
        };
        let extendButtons = [];
        // extendButtons.push(<FileDownloader
        //   apiUrl={'/edu/StudentInvite/exportStudengtInviteTaskList'}//api下载地址
        //   method={'post'}//提交方式
        //   options={this.state.pagingSearch}//提交参数
        //   title={'导出'}
        // >
        // </FileDownloader>);
         const prefixSelector = getFieldDecorator('textKey', {
          initialValue: dataBind(this.state.pagingSearch.textKey || 'loginName'),
        })(
          <Select style={{ width: 86 }} onChange={this.onCountryChange}>
            <Option value='loginName'>用户名</Option>
            <Option value='realName'>姓名</Option>
            <Option value='mobile'>手机号</Option>
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
                
                  <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'项目'}>
                              {getFieldDecorator('itemId', {
                                  initialValue: this.state.pagingSearch.itemId
                              })(
                                  
                                  <SelectItem
                                      scope={'my'}
                                      hideAll={true}
                                      isFirstSelected={true}
                                      />
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
                        <Input addonBefore={prefixSelector}
                        />
                        )}
                    </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'课程名称'} >
                        {getFieldDecorator('courseName', { initialValue: this.state.pagingSearch.realName })(
                         <Input placeholder="课程名称" />
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
                  <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} goBack={true}/>
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
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                </Row>
                <Row justify="end" align="right" type="flex">
                
                  <Col span={10}>
                         {
                            this.state.UserSelecteds.length ?
                            <Button loading={this.state.loading} icon="file-add" onClick={this.Visiting}>批量申请</Button>
                            :
                            <Button loading={this.state.loading} icon="file-add" disabled>批量申请</Button>
                          }
                  </Col>
                  <Col span={14} className={'search-paging-control'} align="right">
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
    editUser: bindActionCreators(editUser, dispatch),
    getStudentInviteList: bindActionCreators(getStudentInviteList, dispatch),
    ApplicationForPostponementList: bindActionCreators(ApplicationForPostponementList, dispatch),//查询列表
    ApplicationForPostponementBachApply: bindActionCreators(ApplicationForPostponementBachApply, dispatch),//批量申请
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
