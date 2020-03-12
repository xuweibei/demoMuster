 

import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const { RangePicker } = DatePicker; 
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic'; 
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory'; 
import { ManagementOfCollectionList } from '@/actions/base' ;
import ContentBox from '@/components/ContentBox'; 
import SelectItem from '@/components/BizSelect/SelectItem'; 
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser'; 
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
import EditableCourseName from '@/components/EditableCourseName'; 
import Batch from './Batch';
import DetailView from './DetailView';
const dateFormat = 'YYYY-MM-DD';
class StudentInviteManage extends React.Component {
  state = {
    isShowChooseProduct:false, 
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
      feedbackRemark: '',
      sendStatus: '',
      studyMsg: '2',
      itemId: '',
      courseCategoryId: '',
      rehearMsg: '',
      giveMsg: '',
      activeState: '',
      courseSourceType: '',
      orderSource: '',
      classTypeType:'',
      techCenterName:''
    }, 
    data: [],
    totalRecord: 0,
    UserSelecteds: [],
    loading: false,
    taskMan:[], 
    courseIdData: [],
  };
  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this); 
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
  }
  componentWillMount() { 
    this.loadBizDictionary([ 'class_type_type','active_state','coursesource','study_status','dic_YesNo','course_source_type','order_source','receive_way']);   
    // this.onSearch()
  } 
  columns = [
    
    {
      title: '教学点',
      fixed: 'left',
      width:150,
      dataIndex: 'techCenterName',
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
      title: '手机号',
      width:150,
      dataIndex: 'mobile',
    },
    {
      title: '课程名称', 
      dataIndex: 'courseName',
    },
    {
      title: '订单号',
      width:170,
      dataIndex: 'orderSn',
    },
    {
      title: '所属商品名称',
      dataIndex: 'productName',
    },
    {
      title: '赠送',
      width:80,
      dataIndex: 'giveMsg', 
    },
    {
      title: '允许重修',
      width:80,
      dataIndex: 'rehearMsg',
    },
    {
      title: '学籍情况',
      width:100,
      dataIndex: 'studyMsg',
    },
    {
      title: '激活状态',
      width:100,
      dataIndex: 'activeMsg',
    },
    {
      title: '激活时间',
      width:150,
      dataIndex: 'activeTime',
      render:(text,record)=>{
        return timestampToTime(record.activeTime)
      }
    },
    {
      title: '讲义领取',
      width:100,
      dataIndex: 'receiveMsg', 
    },
    {
      title: '快递编号',
      width:150,
      dataIndex: 'expressNum',
    }, 
    {
      title: '操作',
      fixed: 'right',
      width:120,
      render: (text, record) => {
        return <DropDownButton> 
            <Button onClick={() => { this.onLookView('ViewEdit', record); }}>编辑</Button> 
        </DropDownButton>
      }
    }
  ];  
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    let date = condition.activeStartTime;
    if(Array.isArray(date)){
      condition.activeStartTime = formatMoment(date[0])
      condition.activeEndTime = formatMoment(date[1])
    } 
    let onOff = false; 
    let Id = '';
    let all = condition.courseName
    if(Array.isArray(all) && all[0]){ 
      condition.courseName = all[0].name; 
      Id = all[0].id;
      onOff = true; 
    }else if(Array.isArray(all)){ 
      condition.courseName = '' 
    }  
    condition.branchId = this.props.branchId;
    this.props.ManagementOfCollectionList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        let { courseIdData } = this.state;
        if(onOff){
          courseIdData.push({
              id:Id,
              name: condition.courseName
          }) 
        }
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
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }
  //批量设置
  BatchSetup = () => {
    let params = { ids: this.state.UserSelecteds,taskMan:this.state.taskMan,type:3 }
    this.onLookView("editpUser", params)
  } 
  //批量导入
  BatchImport = () => {
    this.setState({
      editMode:'batchImport',
      role:'Import'
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true,taskMan:[],UserSelecteds:[] })
      this.onSearch() 
  }

  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'editpUser':
      case 'batchImport':
        block_content = <Batch  viewCallback={this.onViewCallback} {...this.state}/>
        break;
        
      case 'ViewEdit': 
        block_content = <DetailView
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
        };
          const prefixSelector = getFieldDecorator('textKey', {
            initialValue: dataBind(this.state.pagingSearch.textKey || 'loginName'),
          })(
            <Select style={{ width: 86 }} onChange={this.onCountryChange}>
              <Option value='loginName'>用户名</Option>
              <Option value='realName'>姓名</Option>
              <Option value='mobile'>手机号</Option>
              <Option value='qq'>QQ</Option>
              <Option value='orderSn'>订单号</Option>
            </Select>
            );
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
             
             
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
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
                          <FormItem
                          {...searchFormItemLayout}
                          label='学籍情况'
                          >
                            {getFieldDecorator('studyMsg',{ initialValue:this.state.pagingSearch.studyMsg })(
                                <Select>
                                  <Option value="">全部</Option>
                                  {this.state.study_status.filter(item=>item.value!=1).map((item, index) => {
                                    return <Option value={item.value} key={index}>{item.title}</Option>
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
                          {getFieldDecorator('techCenterName', { initialValue: this.state.pagingSearch.techCenterName })(

                            <SelectTeachCenterByUser />
                          )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                        {...searchFormItemLayout}
                        label='订单来源'
                        >
                         {getFieldDecorator('orderSource', {
                          initialValue: this.state.pagingSearch.orderSource,
                          })(
                            <Select >
                              <Option value="">全部</Option>
                              {this.state.order_source.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                          )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'项目'}>
                              {getFieldDecorator('itemId', {
                                  initialValue: this.state.pagingSearch.itemId
                              })( 
                                  <SelectItem
                                      scope={'all'}
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
                        label="科目"
                      >
                        {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                          <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="班型类型"
                        >
                            {getFieldDecorator('classTypeType', { initialValue: this.state.pagingSearch.classTypeType })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.class_type_type.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'是否允许重修'} >
                              {getFieldDecorator('rehearMsg', { initialValue: this.state.pagingSearch.rehearMsg })(
                                  <Select >
                                    <Option value="">全部</Option>
                                    {this.state.dic_YesNo.map((item, index) => {
                                      return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                  </Select>
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="是否赠送"
                      >
                        {getFieldDecorator('giveMsg', { initialValue: this.state.pagingSearch.giveMsg })(
                              <Select >
                                <Option value="">全部</Option>
                                {this.state.dic_YesNo.map((item, index) => {
                                  return <Option value={item.value} key={index}>{item.title}</Option>
                                })}
                              </Select>
                        )}
                      </FormItem>
                      </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'激活状态'} >
                      {getFieldDecorator('activeState', { initialValue: dataBind(this.state.pagingSearch.activeState) })(
                              <Select>
                                    <Option value=''>全部</Option>
                                    {
                                      this.state.active_state.filter(item=>item.value!=0).map(item=>{
                                        return <Option value={item.value}>{item.title}</Option>
                                      })
                                    }
                              </Select> 
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'课程来源'} >
                          {getFieldDecorator('courseSourceType', {
                            initialValue: this.state.pagingSearch.courseSourceType,
                          })(
                            <Select >
                              <Option value="">全部</Option>
                              {this.state.course_source_type.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                              })}
                            </Select>
                            )}
                      </FormItem>
                    </Col> 
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="讲义领取"
                      > 
                        {getFieldDecorator('receiveWay', { initialValue: dataBind(this.state.pagingSearch.receiveWay) })(
                             <Select >
                                <Option value="">全部</Option>
                                {this.state.receive_way.map((item, index) => {
                                  return <Option value={item.value} key={index}>{item.title}</Option>
                                })}
                              </Select>
                        )}
                      </FormItem>
                      </Col> 
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="所属商品名称"
                      >
                        {getFieldDecorator('productName', { initialValue: dataBind(this.state.pagingSearch.productName) })(
                            <Input placeholder='所属商品名称'/>
                        )}
                      </FormItem>
                      </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="课程名称"
                      >
                        {getFieldDecorator('courseName', { initialValue: (!this.state.courseIdData.length ? [] : [{
                            id: this.state.courseIdData[0].id,
                            name: this.state.courseIdData[0].name
                        }]) })(
                            <EditableCourseName  maxTags={1} />
                        )}
                      </FormItem>
                      </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="激活日期"
                      >
                         {getFieldDecorator('activeStartTime', { initialValue: this.state.pagingSearch.activeStartTime?[moment(this.state.pagingSearch.activeStartTime,dateFormat),moment(this.state.pagingSearch.activeEndTime,dateFormat)]:[] })(
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
                      <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel?this.state.currentDataModel.studentId:''} goBack={true} />
                    </Modal>
              }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'studentCourseApplyId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 2000 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24}> 
                    {
                      this.state.UserSelecteds.length?<Button loading={this.state.loading} icon="setting" onClick={this.BatchSetup}>批量设置</Button> :<Button loading={this.state.loading} icon="setting" disabled>批量设置</Button>
                    } 
                    <div className='split_button' style={{ width: 10 }}></div>
                    <Button loading={this.state.loading} icon="appstore" onClick={this.BatchImport}>批量导入</Button> 
                    <div className='split_button' style={{ width: 10 }}></div>
                    <FileDownloader
                        apiUrl={'/edu/materialOnlineCourseApply/exportMaterialOnlineVos'}//api下载地址
                        method={'post'}//提交方式
                        options={this.state.pagingSearch}//提交参数
                        title={'导出'}
                      >
                    </FileDownloader> 
                  </Col>
                </Row>
                <Row justify="end" align="right" type="flex">  
                  <Col span={24} className={'search-paging-control'} align="right">
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
  let branchId = state.auth.currentUser.userType.orgId
  return { Dictionarys,branchId };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),     
    ManagementOfCollectionList: bindActionCreators(ManagementOfCollectionList, dispatch),//查询列表   
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
