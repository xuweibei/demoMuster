 

import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd'; 
const FormItem = Form.Item; 
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt'; 
import { loadDictionary } from '@/actions/dic'; 
import { getOrderAchievementList } from '@/actions/enrolStudent';
import { updateOrderAchievementUser } from '@/actions/enrolStudent';
import { updateArea } from '@/actions/enrolStudent';
import { getZBTeacherSelectList } from '@/actions/teaching';
import ContentBox from '@/components/ContentBox';
import { PerformanceTeachersAdd } from '@/actions/enrolStudent';  
class OrderAchievementManage extends React.Component {

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

    this.state = {
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        realName: '',  
      },
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
    };
  }
  componentWillMount() {  
  }
  compoentDidMount() {
    console.log("CoursePlanAudit componentDidMount");
  }

  columns = [
    {
      title: '教师姓名',
      dataIndex: 'realName',
      width: 200,
      fixed:'left'
    }, 
    {
      title: '英文名',
      dataIndex: 'englishName',
    },  
    {
      title: '城市', 
      dataIndex:'areaName',
      fixed: 'right',
      width: 200, 
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    this.props.getZBTeacherSelectList(condition).payload.promise.then((response) => {
      let data = response.payload.data;

      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ UserSelecteds: [] })
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  } 
  onCancel = () => {
    this.props.viewCallback();
  }
  addTeahcer = () => {  
      let that = this;
      let condition = {};
      let arr = [];
      condition.orderId = this.props.orderId;
      this.state.teacherArr.forEach(item=>{
          arr.push(item.teacherId)
      })
      condition.teacherIds = arr.join(',')
      Modal.confirm({
        title: '您确定将所选的教师加入此订单业绩教师吗?',
        content: '',
        onOk() {
            that.props.PerformanceTeachersAdd(condition).payload.promise.then((response) => {
                let data = response.payload.data;
                if(data.state == 'success'){;
                    that.setState({
                        teacherArr:[],
                        UserSelecteds:[]
                    })
                    that.props.viewCallback(true)
                }else{
                    message.error(data.msg);
                }
              }
            ) 
        },
        onCancel() {
          console.log('Cancel');
        },
      });
      
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.props.editMode) { 
      case 'add':
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys,teacherArr:selectedRows })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = []; 
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'教师姓名'} >
                        {getFieldDecorator('realName', { initialValue: '' })(
                         <Input placeholder='请输入教师姓名' />
                        )}
                      </FormItem>
                    </Col> 
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'orderId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1100 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} style={{paddingBottom:'20px'}}> 
                    <div className='split_button' style={{ width: 10 }}></div>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.addTeahcer} icon='editmUser2'>新增</Button> :
                      <Button disabled icon='editmUser2'>新增</Button>
                    }

                    <div className='split_button' style={{ width: 10 }}></div>
                    <Button onClick={this.onCancel} icon='rollback'>返回</Button>

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
const WrappedManage = Form.create()(OrderAchievementManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    getZBTeacherSelectList: bindActionCreators(getZBTeacherSelectList, dispatch),   
    //新增
    PerformanceTeachersAdd: bindActionCreators(PerformanceTeachersAdd, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
