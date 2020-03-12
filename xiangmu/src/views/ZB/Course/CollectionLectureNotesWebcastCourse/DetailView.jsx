 

import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';  
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
 
import { loadDictionary } from '@/actions/dic';  
import { NumberOfHandoutsReceived,EditAndDeleteInterfaces } from '@/actions/base'; 
import ContentBox from '@/components/ContentBox';  
class StudentInviteManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      UserSelecteds:[],
      isShowChooseProduct:false, 
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10, 
      },
      taskMan:[],
      dataModel:props.currentDataModel
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
    this.loadBizDictionary([ 'class_type_type','active_state','coursesource','study_status','dic_YesNo','course_source_type','order_source','receive_way']);   
    this.onSearch()
  } 
  columns = [
    
    {
      title: '资料名称',
      fixed: 'left',
      width:150,
      dataIndex: 'materialName',
    },
    {
      title: '资料类型',
      dataIndex: 'materialType', 
    },
    {
      title: '打包资料',
      dataIndex: 'isPack',
    },
    {
      title: '教师',
      dataIndex: 'techer',
    },
    {
      title: '快递日期',
      dataIndex: 'sendDate',
      render:(text,record)=>{
        return timestampToTime(record.sendDate)
      }
    },
    {
      title: '快递名称',
      dataIndex: 'express',  
    },
    {
      title: '快递编号',
      dataIndex: 'expressNum', 
    },
    {
      title: '快递地址',
      dataIndex: 'sendAddress',
    },
    {
      title: '收件人',
      dataIndex: 'receiver',
    },
    {
      title: '收件人电话',
      dataIndex: 'receiverMobile',
    }, 
    {
      title: '快递备注',
      fixed: 'right',
      width:'120',
      dataIndex: 'receiveRemark'
    }
  ];  
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    condition.courseId= this.props.currentDataModel.courseId;
    condition.orderId= this.props.currentDataModel.orderId;
    this.props.NumberOfHandoutsReceived(condition).payload.promise.then((response) => {
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
  deleteThat = () => {   
    this.setState({
      isShowChooseProduct: true
    })
  }
  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  } 
  deleteIt = () => {
    let arr = []
    this.state.taskMan.map(item=>{
      return arr.push(item.studentMaterialId)
    })
    this.props.EditAndDeleteInterfaces({studentMaterialId:arr.join(','),delFlag:1}).payload.promise.then((response) => {
      let data = response.payload.data; 
      if(data.state=='success'){
        message.success('删除成功!');
        this.setState({
          UserSelecteds:[],
          taskMan:[],
          isShowChooseProduct:false
        })
        this.onSearch()
      }else{
        message.error(data.msg)
      }
    })
  }   

  onCancel = () => {
    this.props.viewCallback();
  }
  render() {  
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.props.editMode) {  
      case 'Number': 
      case 'Manage':
      default:
      
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys,taskMan:selectedRows })
          }
        }; 
        let extendButtons = []
        block_content = (
          <div>
            <ContentBox titleName={"优播网课讲义领取信息查看"} bottomButton={this.renderSearchBottomButtons(extendButtons,2,3)}> 
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
    
                    <Col span={12}>
                          <FormItem
                          {...searchFormItemLayout}
                          label='订单分部'
                          >
                          {
                            this.state.dataModel.orgName
                          }
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem
                          {...searchFormItemLayout}
                          label='教学点'
                          >
                          {
                            this.state.dataModel.techCenterName
                          }
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem
                          {...searchFormItemLayout}
                          label='学生姓名'
                          >
                          {
                            this.state.dataModel.realName
                          }
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem
                          {...searchFormItemLayout}
                          label='手机号'
                          >
                          {
                            this.state.dataModel.mobile
                          }
                          </FormItem>
                    </Col>
                    <Col span={12} >
                          <FormItem
                          {...searchFormItemLayout}
                          label='订单号'
                          >
                          {
                            this.state.dataModel.orderSn
                          }
                          </FormItem>
                    </Col>
                    <Col span={12} >
                          <FormItem
                          {...searchFormItemLayout}
                          label='项目'
                          >
                          {
                            this.state.dataModel.itemName
                          }
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem
                          {...searchFormItemLayout}
                          label='科目'
                          >
                          {
                            this.state.dataModel.courseCategoryName
                          }
                          </FormItem>
                    </Col> 
                    <Col span={12}>
                          <FormItem
                          {...searchFormItemLayout}
                          label='课程'
                          >
                          {
                            this.state.dataModel.courseName
                          }
                          </FormItem>
                    </Col>
                  </Row>
                </Form>
              } 
            </ContentBox>  
            {
              this.state.isShowChooseProduct?<Modal
                
              visible={this.state.isShowChooseProduct}
              onOk={this.deleteIt}
              onCancel={this.onHideModal}
              >
                <p>您确定删除所选的学生讲义领取信息吗？</p>
              </Modal>:''
            }
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading} 
                rowKey={'studentCourseApplyId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                rowSelection = {rowSelection}
                scroll={{ x: 1300 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24}>
                      {
                        this.state.UserSelecteds.length?<Button loading={this.state.loading} icon="delete" onClick={this.deleteThat}>删除</Button>:<Button loading={this.state.loading} icon="delete" disabled>删除</Button>  
                      }
                      <div className='split_button' style={{ width: 10 }}></div>
                      <Button icon="rollback" onClick={this.onCancel} >返回</Button>
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
    NumberOfHandoutsReceived: bindActionCreators(NumberOfHandoutsReceived, dispatch),//查询列表 
    EditAndDeleteInterfaces: bindActionCreators(EditAndDeleteInterfaces, dispatch),//删除
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
