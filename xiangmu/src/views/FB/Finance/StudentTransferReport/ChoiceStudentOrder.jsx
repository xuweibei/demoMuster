/*
选择订单
wangwenjun
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Route, Redirect} from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider,DatePicker
} from 'antd';
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';

import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import StudentTransferReportView from './view';
//基本字典接口方法引入
import {loadDictionary} from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import {getDictionaryTitle, timestampToTime, split, formatMoney} from '@/utils';

import {
  getStudentTransferByStudentName,studentPayfeePaymentByTransfer
} from '@/actions/finance';
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
class ChoiceStudentOrder extends React.Component {
  constructor() {
    super();
    (this:any).fetch = this.fetch.bind(this);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 9999,
        realName:'',
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      UserSelectedRows:[],
    };
  }

  componentWillMount() {
    //载入需要的字典项:
    this.loadBizDictionary(['dic_Status', 'payee_type']);
  }

  componentWillUnMount() {

  }

  //学生姓名	所属区域	学号	证件号	转账缴费总金额(¥)	附件		状态  转账日期  操作
  columns = [
    {
      title: '招生季',
      fixed: 'left',
      width: 140,
      dataIndex: 'recruitBatchName',
    },{
      title: '学生姓名',
      dataIndex: 'realName',
    },
    {
      title: '学号',
      dataIndex: 'studentNo'
    },
    {
      title: '订单号',
      dataIndex: 'orderSn',
      render: (text, record, index) => {
        return record.orderSn;
      }
    },
    {
      title: '订单类型',
      dataIndex: 'orderTypeStr'
    },
    {
      title: '收费方',
      dataIndex: 'payeType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.payee_type, record.payeeType);
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return record.totalAmount;
      }
    },
    {
      title: '当期欠缴金额(¥)',
      dataIndex: 'currentPayableAmount',
      render: (text, record, index) => {
        return record.currentPayableAmount;
      }
    },
    {
      title: '欠缴总金额(¥)',
      dataIndex: 'totalCurrentPayableAmount',
      render: (text, record, index) => {
        return record.totalCurrentPayableAmount;
      }
    },
    // {
    //   title: '订单状态',
    //   dataIndex: 'xxx',
    //   render: (text, record, index) => {
    //     return getDictionaryTitle(this.state.payee_type, record.xxx);
    //   }
    // },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => {
        return <DropDownButton>
            <Button onClick={() => {
              this.onLookView('ViewOrder', record);
            }}>查看</Button>
          </DropDownButton>
      }
    }
  ];

  //检索数据
  fetch(params = {}) {
    this.setState({loading: true});
    var condition = params || this.state.pagingSearch;
    // this.state.realName = params.realName;
    this.props.getStudentTransferByStudentName(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false,
          UserSelecteds: [],
          UserSelectedRows: []
        })
      }
      else {
        this.setState({loading: false})
        message.error(data.message);
      }
    })
  }

  onCancel = () => {
    this.props.viewCallback();
  }

  choiceOrder = () =>{
    if (this.state.UserSelectedRows.length == 0){
      message.error('请选择订单');
      return;
    }
    let params = this.state.UserSelectedRows
    this.onLookView("Create", params)
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
      this.setState({currentDataModel: null, editMode: 'Manage'})
    } else {
      switch (this.state.editMode) {
        case 'Create': 
          this.props.studentPayfeePaymentByTransfer(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              message.success('新增成功！')
              //进入管理页
              this.onLookView("Manage", dataModel);
            }
          })
          break;
        case 'Edit':
          this.props.updateTeacher(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message, 5);
            }
            else {
              message.success('修改成功')
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", dataModel);
            }
          })
          break;
      }
    }
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Create':
        block_content = <StudentTransferReportView
          viewCallback={this.onViewCallback}
          {...this.state}/>
        break;
      case 'ViewOrder':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          //isDirection={this.state.currentDataModel.orderType == 1 && this.state.currentDataModel.partnerClassType == 1}
          tab={3}
        />
        break;
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({UserSelecteds: selectedRowKeys,UserSelectedRows:selectedRows})
          },
          getCheckboxProps: record => ({
            disabled: record.publishState === 1, // Column configuration not to be checked
          }),
        }
        const {getFieldDecorator} = this.props.form;
        let extendButtons = [];
        if(this.state.data.length){
          extendButtons.push(<Button onClick={this.choiceOrder} icon="right" className="button_dark">下一步</Button>);
        }
        // extendButtons.push(<Button onClick={this.onCancel} icon="rollback" className="rollback">返回</Button>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)}
                        bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
              <Form className="search-form">
                <Row gutter={24} type="flex" justify="center">
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'学生姓名'}>
                      {getFieldDecorator('realName',{
                         rules: [{
                          required: true, message: '请输入学生姓名!',
                        }],initialValue: this.state.pagingSearch.realName,
                      })(
                        <Input placeholder="学生姓名"/>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
              }
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                     loading={this.state.loading}
                     pagination={false}
                     dataSource={this.state.data}//数据
                     rowKey={record => record.orderId}//主键
                     bordered
                     scroll={{x: 1300}}
                     rowSelection={rowSelection}
              />
              <div className="space-default"></div>
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}

//表单组件 封装
const WrappedChoiceStudentOrder = Form.create()(ChoiceStudentOrder);

const mapStateToProps = (state) => {
  //基本字典数据
  let {Dictionarys} = state.dic;
  return {Dictionarys};
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getStudentTransferByStudentName: bindActionCreators(getStudentTransferByStudentName, dispatch),
    studentPayfeePaymentByTransfer:bindActionCreators(studentPayfeePaymentByTransfer, dispatch),
  };
}

//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedChoiceStudentOrder);
