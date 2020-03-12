
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, DatePicker, Modal } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { timestampToTime,formatMoment } from '@/utils';

//业务接口方法引入  
import { BrochureReleaseDesk,EditAndDeleteInterfaces } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import FileDownloader from '@/components/FileDownloader';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

import ListView from './list';
import Detail from './view.js';
import Newly from './Newly';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';


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
      visDelete:false,
      UserSelecteds:[],
      teacherInfo:[],
      currentDataModel: null,
      editMode: '', 
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        teachCenter:'',  
        branchId: '',
        realName: '',
        materialName:'',
        orderSn: '',
        materialType:'', 
        teacher: '',
        itemId: '',
        courseCategoryId: '',
        receiveStartDate:null
      },
      data: [],
      totalRecord: 0,
      loading: false,

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode', 'study_status']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    this.onSearch();
  }
  componentWillUnMount() {
  }
  ImportFiles = () => {
    this.onLookView('ImportFile')
  }

  //table 输出列定义
  columns = [
    {
      title: '教学点',
      width: 120,
      fixed:'left',
      dataIndex: 'teachCenter'
    },
    {
      title: '学生姓名',
      width: 100,
      dataIndex: 'realName',
      render: (text, record, index) => {
        return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
            </span>
      }
    },
    {
      title: '手机号',
      width: 100,
      dataIndex: 'mobile',
    },
    {
      title: '资料名称',
      width: 120,
      dataIndex: 'materialName',
    },
    {
      title: '打包资料',
      width: 100,
      dataIndex: 'isPack',
    },
    {
      title: '资料类型',
      width: 100,
      dataIndex: 'materialType',
    },
    {
        title: '订单号',
        width: 150,
        dataIndex: 'orderSn',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
      title: '主要商品',
      width: 330,
      dataIndex: 'productNames'
    },
    {
      title: '教师',
      width: 100,
      dataIndex: 'teacher',
    },
    {
      title: '领取方式',
      width: 100,
      dataIndex: 'receiveWay',
    },
    {
      title: '领取人',
      width: 100,
      dataIndex: 'receiver',
    },
    {
      title: '领取日期',
      width: 100,
      dataIndex: 'receiveDate',
      render: (text, record, index) => {
        return timestampToTime(record.receiveDate)
      }
    },
    {
      title: '地址', 
      dataIndex: 'sendAddress',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => {
        return <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
      },
    }];


  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let onOff = false;
    if(Array.isArray(condition.teacherArr)&&condition.teacherArr[0]){
      condition.teacher =  condition.teacherArr[0].id
      onOff = true;
    }else{
      condition.teacher = ''
    }
    let receiveDate = condition.receiveStartDate;
    if(Array.isArray(receiveDate)){
      condition.receiveStartDate = formatMoment(receiveDate[0])
      condition.receiveEndDate = formatMoment(receiveDate[1])
    } 
    this.props.BrochureReleaseDesk(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        
        var teacherInfo = []; 
        if(onOff){
          teacherInfo.push({
              id: condition.teacher,
              name: condition.teacherArr[0].name
          }) 
        }  
        this.setState({
          pagingSearch: condition,
          data: data.data,
          totalRecord: data.totalRecord,
          loading: false,
          teacherInfo:teacherInfo
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
      this.onSearch();  
  }
  //点击删除按钮
  deleteInfo = () => { 
    this.setState({
      visDelete:true
    }) 
  }
  //确认删除
  DeleteOk = () => {
    let condition = {};
    condition.delFlag = 1;
    let arr	 = [];
    this.state.sureList.map(item=>{
        arr.push(item.studentMaterialId)
    })
    condition.studentMaterialId = arr.join(',')  
    this.props.EditAndDeleteInterfaces(condition).payload.promise.then((response)=>{
      let data = response.payload.data; 
      if(data.state=='success'){
        this.setState({
          UserSelecteds:[],
          sureList:[]
        })
        this.onSearch()
      }else{
        message.error(data.msg)
      }
      this.setState({
        visDelete:false
      })
    })
  }
  //取消删除
  handleCancel = () => {
    this.setState({
      visDelete:false
    })
  }
  //新增领取
  NewlyReceived = () => {
    this.onLookView('Newly')
  }
  //渲染，根据模式不同控制不同输出
  render() { 
    const { getFieldDecorator } = this.props.form;

    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Newly':
        block_content = <Newly viewCallback={this.onViewCallback} />
      break;
      case 'ImportFile':
        block_content = <ListView viewCallback={this.onViewCallback} />
        break;
      case 'ViewStudentDetail':
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
      case "Edit":
        block_content = <Detail viewCallback={this.onViewCallback}
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
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys,sureList:selectedRows })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
        extendButtons.push(<Button onClick={()=>this.NewlyReceived()}>新增领取</Button>)
        extendButtons.push(
          <FileDownloader
            apiUrl={'/edu/materialReceive/exportDoubleMaterials'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出重复领取'}
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
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                    {getFieldDecorator('teachCenter', { initialValue: this.state.pagingSearch.teachCenter })(

                      <SelectTeachCenterByUser />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '资料类型'
                    >
                    {
                        getFieldDecorator('materialType',{ initialValue:this.state.pagingSearch.materialType})(
                        <Select>
                            <Option value = ''>全部</Option>
                            <Option value = '1'>讲义</Option>
                            <Option value = '2'>学习资料</Option>
                            <Option value = '3'>工具</Option>
                        </Select>
                        )
                    }
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"资料名称"}
                  >
                    {getFieldDecorator('materialName', { initialValue: this.state.pagingSearch.materialName })(
                      <Input placeholder='请输入资料名称'/>
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
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '科目'
                    >
                    {
                        getFieldDecorator('courseCategoryId',{ initialValue:this.state.pagingSearch.courseCategoryId})(
                        <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                        )
                    }
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="学生姓名"
                  >
                    {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                      <Input placeholder='请输入学生姓名'/>
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
                <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="领取日期">
                            {getFieldDecorator('receiveStartDate', { initialValue:this.state.pagingSearch.receiveStartDate?[moment(this.state.pagingSearch.receiveStartDate,dateFormat),moment(this.state.pagingSearch.receiveEndDate,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                  </Col>
                  
                <Col span={12} >
                  <FormItem {...searchFormItemLayout} label={'教师'} >
                    {getFieldDecorator('teacherArr', { 
                        initialValue: 
                        (!this.state.teacherInfo.length ? [] : [{
                            id: this.state.teacherInfo[0].id,
                            name: this.state.teacherInfo[0].name
                          }]) 
                          })(
                      <EditableTeacher  maxTags={1} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          <Modal  
              title='删除'
              visible={this.state.visDelete}
              onOk={this.DeleteOk}
              onCancel={this.handleCancel}
              okButtonProps={{ disabled: true }}
              cancelButtonProps={{ disabled: true }}  
              >
              <p>已使用的资料不能被删除，可以做停用处理，信息删除后将不能恢复，是否确定删除选定资料信息吗？</p>
          </Modal>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 2000 }}
                   rowSelection={rowSelection}
            />
            <div className="space-default"></div>
            <div className="search-paging">
              <Row justify="space-between" align="middle" type="flex">
                <Col span={24} style={{paddingBottom:'20px'}}> 
                  <Button onClick = {this.ImportFiles} icon="save">导入</Button>
                  <div className='split_button' style={{ width: 10 }}></div>
                  {
                      this.state.UserSelecteds.length>0?<Button onClick={this.deleteInfo} icon="delete">删除</Button>:<Button disabled icon="delete">删除</Button>
                  } 
                  <div className='split_button' style={{ width: 10 }}></div>
                  <FileDownloader
                    apiUrl={'/edu/materialReceive/exportMaterialReceives'}//api下载地址
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
const WrappedCourseManage = Form.create()(TeachingStudentQuery);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    //列表
    BrochureReleaseDesk: bindActionCreators(BrochureReleaseDesk, dispatch),
    //删除
    EditAndDeleteInterfaces: bindActionCreators(EditAndDeleteInterfaces, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
