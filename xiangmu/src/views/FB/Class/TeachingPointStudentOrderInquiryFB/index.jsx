/*
教学点学生查询
*/
//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col,DatePicker, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

const { RangePicker } = DatePicker;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime,dataBind,formatMoment } from '@/utils';

//业务接口方法引入
//import { getCourseArrangeList, updateFinishStatus } from '@/actions/base';
import { teachingPointStudent } from '@/actions/course';
import { getTeachCenterByBranchId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import FileDownloader from '@/components/FileDownloader';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import moment from 'moment';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

const dateFormat = 'YYYY-MM-DD';
import ListView from './list'
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';


class TeachingStudentQuery  extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        recruitBatchId:'',//operationType	true	普通参数	Integer		1、总部操作 2、分部操作
        partnerId: '',
        itemId: '',
        itemNames:'',
        payeeType:'',
        orderType: '',
        orderSource:'',//false	普通参数	String		学生姓名
        orderStatus: '',
        studentName: '',
        orderSn: '',
        startDate:null,
        endDate:null,
        mobile:'', 
        teacherCenterId:''
      },
      data: [],
      totalRecord: 0,
      loading: false,

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode', 'study_status','order_type','order_source','order_status','payee_type']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    // this.onSearch();
  }
  componentWillUnMount() {
  }


  //table 输出列定义
  columns = [
    {
      title: '教学点',
      fixed: 'left', 
      width: 180,
      dataIndex: 'teacherCenterName'
    },
    {
      title: '项目',
      dataIndex: 'itemNames',
    },
    {
        title: '订单号',
        dataIndex: 'orderSn',
        // render: (text, record, index) => {
        //     return <span>
        //         <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
        //     </span>
        // }
    },
    {
      title: '学生姓名',
      width: 100,
      dataIndex: 'studentName',
      // render: (text, record, index) => {
      //   return <span>
      //           <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
      //       </span>
      // }
    },
    {
      title: '大客户名称',
      width: 120,
      dataIndex: 'partnerName'
    },
    {
      title: '收费方',
      dataIndex: 'payeeType',    
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.payee_type, record.payeeType);
      }
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
    },
    {
      title: '已缴金额', 
      dataIndex: 'paidAmount',
    },
    {
      title: '创建日期',
      width: 100,
      dataIndex: 'createDate',
      render:(text,record)=>{
        return timestampToTime(record.createDate)
      }
      // render: (text, record, index) => {
      //   return getDictionaryTitle(this.state.study_status, record.studyStatus);
      // }
    },
    {
      title: '订单状态',
      width: 120,
      dataIndex: 'studyStartDate',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_status, record.orderStatus);
      }
    },
    {
      title: '订单来源',
      width: 120,
      dataIndex: 'orderSource',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.order_source, record.orderSource);
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => {
        return <Button onClick={() => { this.onLookView('ViewOrderDetail', record); }}>查看</Button>
      },
    }
  ];


  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let createTime = condition.startDate;
    if(Array.isArray(createTime)){
      condition.startDate = formatMoment(createTime[0]);
      condition.endDate = formatMoment(createTime[1]);
    }
    condition.barchId  = this.props.barchId;
    this.props.teachingPointStudent(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          data: data.data,
          totalRecord: data.totalRecord,
          loading: false
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
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
  //视图回调
  onViewCallback = (dataModel) => { 
    if (!dataModel) { 
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case "Student":
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Create":
        case "Edit": //提交
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Import":
          this.onSearch();
          this.onLookView("Manage", null);
          //提交
          break;

      }
    }
  }


  //渲染，根据模式不同控制不同输出
  render() { 
    const { getFieldDecorator } = this.props.form;

    let block_content = <div></div>
    switch (this.state.editMode) {

      case 'ViewStudentDetail':
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
      case "View":
        block_content = <ListView viewCallback={this.onViewCallback}
             {...this.state}
        />
        break;
      case 'ViewOrderDetail':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
            studentId={this.state.currentDataModel.studentId}
            orderId={this.state.currentDataModel.orderId}
            tab={3}
        />
        break;
      case "Delete":
      case "Manage":
      default:
        //除查询外，其他扩展按钮数组
        let extendButtons = [];
        extendButtons.push(
          <FileDownloader
            apiUrl={'/edu/orderTeacherCenter/exportOrderListByTeacherCenter'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出'}
          >
          </FileDownloader>);
        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
                <Col span={12} >
                  <FormItem {...searchFormItemLayout} label='招生季'>
                     {getFieldDecorator('recruitBatchId', { initialValue: dataBind(this.state.pagingSearch.recruitBatchId) })(
                        <SelectRecruitBatch hideAll={true} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                          this.setState({ recruitBatchId: value })
                          //变更时自动加载数据
                            this.onSearch();

                        }} />
                      )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    {getFieldDecorator('itemId', {
                      initialValue: this.state.pagingSearch.itemId
                    })(
                      <SelectItem
                        scope={'my'}
                        hideAll={false}
                        onSelectChange={(value) => {
                          this.state.pagingSearch.itemId = value;
                          this.setState({ pagingSearch: this.state.pagingSearch });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单类型"
                  >
                    {getFieldDecorator('orderType', { initialValue: this.state.pagingSearch.orderType })(

                      <Select>
                        <Option value="">全部</Option>
                        {this.state.order_type.map((i, index) => {
                          return <Option value={i.value.toString()} key={i.value}>{i.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                     <FormItem
                          {...searchFormItemLayout}
                          label="教学点"
                      >
                          {getFieldDecorator('teacherCenterId', { initialValue: this.state.pagingSearch.teacherCenterId })(
                              <SelectTeachCenterByUser />
                          )}
                      </FormItem> 
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单来源"
                  >
                    {getFieldDecorator('orderSource', { initialValue: this.state.pagingSearch.orderSource })(
                      <Select> 
                        <Option value="">全部</Option>
                        {this.state.order_source.map((i, index) => {
                          return <Option value={i.value.toString()} key={i.value}>{i.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单状态"
                  >
                    {getFieldDecorator('orderStatus', { initialValue: this.state.pagingSearch.orderStatus })(
                      <Select> 
                        <Option value="">全部</Option>
                        {this.state.order_status.filter(e=>e.value==4||e.value==5).map((i, index) => { 
                          return <Option value={i.value.toString()} key={i.value}>{i.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="大客户"
                  >
                    {getFieldDecorator('partnerId', { initialValue: this.state.pagingSearch.partnerId })(  
                          <SelectPartnerOrg scope={'my'} hideAll={false} /> 
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="收费方"
                  >
                    {getFieldDecorator('payeeType', { initialValue: this.state.pagingSearch.payeeType })( 
                     <Select> 
                        <Option value="">全部</Option>
                        {this.state.payee_type.map((i, index) => {
                          return <Option value={i.value.toString()} key={i.value}>{i.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="学生姓名"
                  >
                    {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                      <Input placeholder='请输入学生姓名'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="手机号"
                  >
                    {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                      <Input placeholder='请输入手机号'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="创建日期"
                  >
                    {getFieldDecorator('startDate', { initialValue:this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]:[] })(
                     <RangePicker style={{width:220}}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="订单号"
                  >
                    {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                      <Input placeholder='请输入订单号'/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 1600 }}
            />
            <div className="space-default"></div>
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={24} className='search-paging-control'>
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
        </div>);
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(TeachingStudentQuery);

const mapStateToProps = (state) => {
  //基本字典数据 
  let { Dictionarys } = state.dic;
  let barchId = state.auth.currentUser.userType.orgId;

  return { Dictionarys,barchId  };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    teachingPointStudent: bindActionCreators(teachingPointStudent, dispatch),
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
