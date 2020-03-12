import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd'; 
import ContentBox from '@/components/ContentBox'; 
import { queryUserByBranchId,PerformanceTeachersList,PerformanceTeachersDelete } from '@/actions/enrolStudent'; 
import { searchFormItemLayout } from '@/utils/componentExt';
import Add from './add';
const FormItem = Form.Item; 

   
class OrderAchievementView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      UserSelecteds: [],
      dataModel: props.currentDataModel,//数据模型
      user_list: [],
      user_listTwo:[],
      areaId:'',
      startValue: null,
      endValue: null,
      endOpen: false,
      loading:false,
      data:[],
      editMode:props.state.editMode,
      mainNew:{
        orderSn:'',
        realName:'',
        totalAmount:''
      }
     
    };
  }
  columns = [
    {
      title: '教师姓名',
      dataIndex: 'teacherName',
      width: 200,
      fixed:'left'
    },
    {
      title: '英文名',
      dataIndex: 'englishName', 
    },
    {
      title: '城市',
      dataIndex: 'cityName',
      width: 200,
      fixed:'right'
    },
  ]
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() { 
   this.fetch()
  }
  fetch = () => {
    this.setState({
        loading:true
    })
    this.props.PerformanceTeachersList({orderId:this.props.orderId}).payload.promise.then((response) => {
        let data = response.payload.data; 
            if(data.state == 'success'){
                this.setState({
                    data:data.data.orderActivityTeacherVoList,
                    mainNew:data.data
                })
            }else{
                message.error(data.msg)
            }
            this.setState({
                loading:false
            })
        }
    )
  } 
  deleteTeacher = ( ) => { 
    let that = this;
    let arr = [];
    this.state.teacherArr.forEach(item=>{
        arr.push(item.orderActivityTeacherId)
    })
    Modal.confirm({
        title: '您确定删除所选的此订单业绩教师吗?',
        content: '',
        onOk() {
            that.props.PerformanceTeachersDelete({orderActivityTeacherIds:arr.join(',')}).payload.promise.then((response) => {
                let data = response.payload.data; 
                    if(data.state == 'success'){
                        message.success('删除成功！');
                        that.setState({
                            teacherArr:[],
                            UserSelecteds:[]
                        })
                        that.fetch();
                    }else{
                        message.error(data.msg)
                    } 
                }
            ) 
        }, 
    }
    )
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
    if(dataModel){
        this.fetch();
    }
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true }); 
  }
  //多种模式视图处理
  renderEditModeOfView() { 
    let block_content = <div></div> 

    switch (this.state.editMode) {      
      case 'add':
      block_content = <Add 
            editMode={"add"}
            viewCallback={this.onViewCallback}
            orderId = {this.props.orderId} 
            />
      break;
      case 'achievement':
      case "Manage":
      default:
        block_content = (
          <Form className="search-form">
            <Row gutter={24} type="flex" justify="center">
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单号"
                > 
                <div>{this.state.mainNew.orderSn}</div>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学生姓名"
                > 
                <div>{this.state.mainNew.realName}</div>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单金额"
                > 
                <div>{this.state.mainNew.totalAmount}</div>
                </FormItem>
              </Col>
              <Col span={12}></Col>
            </Row>
          </Form>
        );
        break; 

    }
    return block_content;
  }

  render() { 
    let block_editModeView = this.renderEditModeOfView();
    var rowSelection = {
      selectedRowKeys: this.state.UserSelecteds,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ UserSelecteds: selectedRowKeys,teacherArr:selectedRows })
      },
      getCheckboxProps: record => ({
        disabled: false,    // Column configuration not to be checked
      }),
    };
    return (
        <div>
            {
                this.state.editMode == 'add'?block_editModeView:
                <div>
                    <ContentBox titleName={'订单业绩教师'} >
                        <div className="dv_split"></div>
                        {block_editModeView}
                        <div className="dv_split"></div>
                    </ContentBox>
                    <div className="space-default"></div>
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}  
                            pagination={false}
                            rowSelection={rowSelection}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1100 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                        <Row justify="space-between" align="middle" type="flex">
                        <Col span={24} style={{paddingBottom:'20px'}}> 
                            <Button onClick={()=>{ this.onLookView('add') }} icon='add'>新增</Button>
                            <div className='split_button' style={{ width: 10 }}></div>
                            {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                            <Button onClick={this.deleteTeacher} icon='delete'>删除</Button> :
                            <Button disabled icon='delete'>删除</Button>
                            } 
                            <div className='split_button' style={{ width: 10 }}></div>
                            <Button onClick={this.onCancel} icon='rollback'>返回</Button>
                        </Col>
                        </Row>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
  }
}

const WrappedOrderAchievementView = Form.create()(OrderAchievementView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    queryUserByBranchId: bindActionCreators(queryUserByBranchId, dispatch),
    //列表
    PerformanceTeachersList: bindActionCreators(PerformanceTeachersList, dispatch),
    //删除
    PerformanceTeachersDelete: bindActionCreators(PerformanceTeachersDelete, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderAchievementView);
