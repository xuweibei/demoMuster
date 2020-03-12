 
//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col,DatePicker, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime,formatMoment } from '@/utils';
 
import { DataApplicationManagementList,SubmissionOfInformation,SubmissionOfDelete } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem'; 
import ChangeDetailInfoIndex from './changeDetailInfoIndex';
import CourseStudentMoveAuditManageView from './view'; 
//学生详情 
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';



class StudentStudyInfo  extends React.Component {

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
      visCommit:false,
      visDelete:false,
      currentDataModel: null,
      editMode: '', 
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        materialApplyName:'', 
        auditStatus: '',
        itemId: '',
        sendStatus:'',
        receiver: '',
        createDateStart:'', 
        createDateEnd:'', 
        sendDateStart: '',
        sendDateEnd: '',
        receiveDateStart: '',
        receiveDateEnd:'', 
        submitStartDate:'',
        submitEndDate:''
      },
      data: [],
      totalRecord: 0, 
      loading: false, 

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode', 'category_state','audit_status']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    this.onSearch();
  }
  componentWillUnMount() {
  }  
  //table 输出列定义
  columns = [
    {
      title: '申请名称',
      width: 120,
      fixed: 'left',
      dataIndex: 'materialApplyName'
    },
    {
      title: '相关项目',
      dataIndex: 'itemNames', 
    },
    {
      title: '资料总数量',
      width: 100,
      dataIndex: 'totalCount'
    },
    {
      title: '收件人',
      width: 100,
      dataIndex: 'receiver',
    },
    {
      title: '手机',
      width: 120,
      dataIndex: 'mobile',
    },
    {
      title: '地址',
      dataIndex: 'sendAddress', 
    },
    {
      title: '申请人',
      width: 100,
      dataIndex: 'applicant', 
    },
    {
      title: '创建日期',
      width: 120,
      dataIndex: 'createDate', 
      render:(text,record)=>{
        return timestampToTime(record.createDate)
      }
    },
    {
      title: '提交日期',
      width: 120,
      dataIndex: 'submitDate', 
      render:(text,record)=>{
        return timestampToTime(record.submitDate)
      }
    },
    {
      title: '状态',
      width: 100,
      dataIndex: 'auditStatus', 
    },
    {
      title: '寄件情况',
      width: 100,
      dataIndex: 'sendStatus' 
    },
    {
      title: '快递单号',
      width: 120,
      dataIndex: 'expressNum', 
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => {
        //编辑   适用商品 互斥设置(2)
        return <DropDownButton>
          {record.auditStatus != '暂存'?<Button onClick={() => { this.onLookView('View', record); }}>查看</Button>:''}
          {(record.auditStatus == '暂存' || record.auditStatus == '审核未通过')?<Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>:''}
          {record.auditStatus == '暂存'?<Button onClick={() => { this.openCommit(record.materialApplyId); }}>提交</Button>:''}
          {record.auditStatus == '暂存'?<Button onClick={() => { this.openDelete(record.materialApplyId); }}>删除</Button>:''}
          {(record.sendStatusFlag == '2' || record.sendStatusFlag == '3')?<Button onClick={() => { this.onLookView('Receipt', record); }}>收件反馈</Button>:''}
        </DropDownButton>
      },
    }];
  openCommit = (value) =>{
    this.setState({
      visCommit:true,
      vismaterialApplyId:value
    })
  }
  openDelete = (value) =>{ 
    this.setState({
      visDelete:true,
      visDelteteId:value
    })
  }
  onBatchAdd = () =>{
    this.onLookView('Create')
  }

  //检索数据
  fetch = (params = {}) => {
   
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.branchId = this.props.branchId; 
    let submitDate = condition.submitStartDate;
    let createDate = condition.createDateStart;
    let sendDate = condition.sendDateStart;
    let receiveDate = condition.receiveDateStart;
    if(Array.isArray(submitDate)){
      condition.submitStartDate = formatMoment(submitDate[0])
      condition.submitEndDate = formatMoment(submitDate[1])
    }		
    if(Array.isArray(createDate)){
      condition.createDateStart = formatMoment(createDate[0])
      condition.createDateEnd = formatMoment(createDate[1])
    }		
    if(Array.isArray(sendDate)){
      condition.sendDateStart = formatMoment(sendDate[0])
      condition.sendDateEnd = formatMoment(sendDate[1])
    }		
    if(Array.isArray(receiveDate)){
      condition.receiveDateStart = formatMoment(receiveDate[0])
      condition.receiveDateEnd = formatMoment(receiveDate[1])
    }		
    this.props.DataApplicationManagementList(condition).payload.promise.then((response) => {
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
      this.setState({ currentDataModel: null, editMode: 'Manage' })
      this.onSearch() 
  }
  CommitOk = () => { 
    this.props.SubmissionOfInformation({materialApplyId:this.state.vismaterialApplyId}).payload.promise.then((response) => {
      let data = response.payload.data; 
      if(data.state == 'success'){
        this.onSearch();
      }else{
        message.error(data.msg)
      }
      this.setState({
        visCommit:false
      })
    })
  }
  DeleteOk = () => { 
    this.props.SubmissionOfDelete({materialApplyId:this.state.visDelteteId}).payload.promise.then((response) => {
      let data = response.payload.data; 
      if(data.state == 'success'){
        this.onSearch();
      }else{
        message.error(data.msg)
      }
      this.setState({
        visDelete:false
      })
    })
  }
  handleCancel = () =>{ 
    this.setState({
      visCommit:false,
      visDelete:false
    })
  }
  //渲染，根据模式不同控制不同输出
  render() {

    const { getFieldDecorator } = this.props.form;

    let block_content = <div></div>
    switch (this.state.editMode) {  
      case "Edit":
      case "View":
        block_content = <CourseStudentMoveAuditManageView 
                            viewCallback={this.onViewCallback}
                            {...this.state}
                        />
        break;
      case "Create":
      case "Receipt":
        block_content = <ChangeDetailInfoIndex 
                            viewCallback={this.onViewCallback} 
                            {...this.state} 
                        />
        break;
      case "Delete":
      case "Manage":
      default:
        //除查询外，其他扩展按钮数组
        let extendButtons = [];

        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    {getFieldDecorator('itemId', {
                      initialValue: this.state.pagingSearch.itemId
                    })(

                      <SelectItem
                          scope={'my'}
                          hideAll={false} 
                          // isFirstSelected={true}
                          onSelectChange={(value) => {
                            this.state.pagingSearch.itemId = value;
                            this.state.pagingSearch.courseCategoryId = '';
                            this.setState({ pagingSearch: this.state.pagingSearch });
                            setTimeout(() => {
                                {/* 重新重置科目项 */ }
                                this.props.form.resetFields(['courseCategoryId']);
                                this.onSearch();
                            }, 500);
                          }}
                        />
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"申请名称"}
                  >
                    {getFieldDecorator('materialApplyName', { initialValue: this.state.pagingSearch.courseCategoryId })(
                      <Input placeholder='申请名称'/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"状态"}
                  >
                    {getFieldDecorator('auditStatus', { initialValue: this.state.pagingSearch.auditStatus })(
                      <Select >
                          <Option value="">全部</Option>
                          {this.state.audit_status.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                      </Select>
                    )}
                  </FormItem>
                </Col> 
                <Col span={12}>
                      <FormItem
                      {...searchFormItemLayout}
                      label = {"寄件情况"}
                      >
                        {
                          getFieldDecorator('sendStatus',{ initialValue:this.state.pagingSearch.sendStatus})(
                            <Select>
                              <Option value=''>全部</Option>
                              <Option value='1'>待寄</Option>
                              <Option value='2'>已寄</Option>
                              <Option value='3'>已收</Option>
                            </Select>
                          )
                        }
                      </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"创建日期"}
                  >
                    {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateEnd,dateFormat),moment(this.state.pagingSearch.submitEndDate,dateFormat)]:[]})(
                      <RangePicker 
                          style={{width:220}}  
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"提交日期"}
                  >
                    {getFieldDecorator('submitStartDate', { initialValue: this.state.pagingSearch.submitStartDate?[moment(this.state.pagingSearch.submitStartDate,dateFormat),moment(this.state.pagingSearch.submitEndDate,dateFormat)]:[]})(
                      <RangePicker 
                          style={{width:220}}  
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"寄件日期"}
                  >
                    {getFieldDecorator('sendDateStart', { initialValue: this.state.pagingSearch.sendDateStart?[moment(this.state.pagingSearch.submitStartDate,dateFormat),moment(this.state.pagingSearch.sendDateEnd,dateFormat)]:[]})(
                      <RangePicker 
                          style={{width:220}}  
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"收件日期"}
                  >
                    {getFieldDecorator('receiveDateStart', { initialValue: this.state.pagingSearch.receiveDateStart?[moment(this.state.pagingSearch.receiveDateStart,dateFormat),moment(this.state.pagingSearch.receiveDateEnd,dateFormat)]:[]})(
                      <RangePicker 
                          style={{width:220}}  
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                      <FormItem
                      {...searchFormItemLayout}
                      label = {'申请人'}
                      >
                        {
                          getFieldDecorator('applicant',{ initialValue:''})(
                            <Input placeholder = '请输入申请人'/>
                          )
                        }
                      </FormItem>
                </Col>
                <Col span={12}>
                      <FormItem
                      {...searchFormItemLayout}
                      label = {'收件人'}
                      >
                      {
                        getFieldDecorator('receiver',{ initialValue:''})(
                          <Input placeholder ='请输入收件人姓名' />
                        )
                      }
                      </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          <Modal  
              visible={this.state.visCommit}
              onOk={this.CommitOk}
              onCancel={this.handleCancel}
              okButtonProps={{ disabled: true }}
              cancelButtonProps={{ disabled: true }}  
              >
              <p>提交审核后，将不能修改，您确定提交审核吗？</p>
          </Modal>
          <Modal  
              visible={this.state.visDelete}
              onOk={this.DeleteOk}
              onCancel={this.handleCancel}
              okButtonProps={{ disabled: true }}
              cancelButtonProps={{ disabled: true }}  
              >
              <p>您确定删除此申请信息吗？</p>
          </Modal>
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
              <Row justify="space-between" align="middle" type="flex">
                  <Col span={24}>
                    <Button onClick={this.onBatchAdd} icon="plus">增加</Button>
                    <div className='split_button' style={{ width: 10 }}></div>
                    <FileDownloader
                        apiUrl={'/edu/materialApply/exportMaterialApplyVos'}//api下载地址
                        method={'post'}//提交方式
                        options={this.state.pagingSearch}//提交参数
                        title={'导出'}
                      >
                    </FileDownloader> 
                  </Col>
              </Row>
              <Row justify="end" align="middle" type="flex"> 
                <Col span={24} className='search-paging-control'>
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
        </div>);
        break;
        
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(StudentStudyInfo);

const mapStateToProps = (state) => { 
  //基本字典数据
  let { Dictionarys } = state.dic;
  let branchId = state.auth.currentUser.userType.orgId; 
  return { Dictionarys,branchId };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    DataApplicationManagementList: bindActionCreators(DataApplicationManagementList, dispatch),
    //提交
    SubmissionOfInformation: bindActionCreators(SubmissionOfInformation, dispatch), 
    //删除
    SubmissionOfDelete: bindActionCreators(SubmissionOfDelete, dispatch), 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
