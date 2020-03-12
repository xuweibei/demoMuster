
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';

import { canAddClassStudent, classStudentAdd } from '@/actions/teaching';

import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
const dateFormat = 'YYYY-MM-DD';
class AppointmentDetail extends React.Component {
  constructor(props) {
    super(props);
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      dataModel: props.currentDataModel,
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
      }, 
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      MobileSelecteds: [],
      loading: false,
    };

  }
  
  
  componentWillMount() {
    this.onSearch();
  }
  compoentDidMount() {
    
  }
  
  columns = [
    {
      title: '姓名',
      width: 120,
      fixed: 'left',
      dataIndex: 'studentName',
    },
    
    {
      title: '用户名',
      width:120,
      dataIndex: 'loginName',
    },
    {
      title: '手机号',
      width:120,
      dataIndex: 'mobile',
    },
    {
      title: '邮箱',
      width:150,
      dataIndex: 'email',
    },
    {
      title: '学号',
      dataIndex: 'studentNo',
    },
    {
      title: '所在分部',
      width:120,
      dataIndex: 'branchName',
    },
    {
      title: '所在班级',
      dataIndex: 'orderedClass',
      render: (text, record, index) => {
        if(record.orderedClass){
          return record.orderedClass.map((item) => {
            return <div>{item.className}({item.classStatusName})</div>
          })
        }else{
          return '无';
        }
      }
    },
    {
      title: '是否重修',
      width:80,
      dataIndex: 'isAppend',
      render: (text, record, index) => {
        if(record.isAppend == 1){
          return '是'
        }else{
          return '否'
        }
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onclassStudentAdd(record); }}>添加</Button>
        </DropDownButton>
      ),
    }

  ];
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    condition.classId = this.state.dataModel.classId;
    
    this.props.canAddClassStudent(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false });

      }
    })
  }

  onclassStudentAdd = (record) => {
    Modal.confirm({
      title: '确认添加所选学生到当前班级吗?',
      content: '请确认',
      onOk: () => {
        var params = {};
        var json = [];
       
        if(record.studentId){
          json.push({
            studentId: record.studentId,
            studentCourseCategoryDetailId: record.studentCourseCategoryDetailId
          })
        }else{
          this.state.MobileSelecteds.map((item)=>{
            json.push({
              studentId: item.studentId,
              studentCourseCategoryDetailId: item.studentCourseCategoryDetailId
            })
          })
        }

        params = {
          classId:this.state.dataModel.classId,
          json: JSON.stringify(json),
        }

        this.props.classStudentAdd(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('添加成功！');
            this.setState({ UserSelecteds: [],MobileSelecteds: [] })
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  onCancel = () => {
    this.props.viewCallback(this.state.pagingSearch);
  }

  //视图回调
  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:

      var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            this.setState({ UserSelecteds: selectedRowKeys })
            this.setState({ MobileSelecteds: selectedRows })
          },
          getCheckboxProps: record => ({
            disabled: false, // Column configuration not to be checked            
          }),
        }

      let extendButtons = [];
      
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="班级名称"
                        >
                          { this.state.dataModel.className }

                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="项目"
                        >
                         { this.state.dataModel.itemName }
                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="科目"
                        >
                            { this.state.dataModel.courseCategoryName }
                        </FormItem>
                    </Col>
                  
                   
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                         <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'手机'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                         <Input placeholder="手机" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'邮箱'} >
                        {getFieldDecorator('email', { initialValue: this.state.pagingSearch.email })(
                         <Input placeholder="邮箱" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="是否重修"
                      >
                        {getFieldDecorator('isAppend', { initialValue: dataBind(this.state.pagingSearch.isAppend) })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value='0'>否</Option>
                            <Option value='1'>是</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      
                    </Col>
                    <Col span={8}>
                      
                    </Col>
                    <Col span={8}>
                      
                    </Col>
                  </Row>
                </Form>
              }
              
            </ContentBox>
            
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={record => record.studentCourseCategoryDetailId}//主键
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1300 }}
                rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                    <Col span={8}>
                        {
                          this.state.UserSelecteds.length > 0 ?
                          <Button onClick={this.onclassStudentAdd} icon="save" type="primary">批量添加</Button>
                          :
                          <Button disabled icon="save" type="primary">批量添加</Button>
                        }
                        <div className='split_button' style={{ width: 10 }}></div>
                        
                        <Button onClick={this.onCancel} icon="rollback">返回</Button>
                    </Col>
                </Row>
                <Row justify="end" align="middle" type="flex">
                  <Col span={16} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(AppointmentDetail);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    canAddClassStudent: bindActionCreators(canAddClassStudent, dispatch),//查询列表
    classStudentAdd: bindActionCreators(classStudentAdd, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
