/*
退费退学申请
2018-06-01
suicaijiao
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider
} from 'antd';
const FormItem = Form.Item;
import { formatMoney } from '@/utils';

import SearchForm from '@/components/SearchForm';
import { getCourseStudentRefundSelectOrderOut, courseStudentRefundApplication } from '@/actions/course';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';

import CourseStudentRefundView from './view';
import Edit from './edit';

//操作按钮
import DropDownButton from '@/components/DropDownButton';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

class CourseStudentRefund extends React.Component {
  state = {
    editMode: '',
    pagingSearch: {
      orderSn: '',
      realName: '',
      mobile:''
    },
    data_list: [],
    loading: false,
  };
  constructor() {
    super();

    (this: any).fetch2 = this.fetch2.bind(this);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);


  }

  componentWillMount() {
    //载入需要的字典项: 审核状态
    this.loadBizDictionary(['student_change_status', 'student_change_type']);
    this.fetch2();
  }

  columns = [
    {
      title: '订单号',
      dataIndex: 'orderSn',
      width:120,
      fixed:'left',
      render: (text, record, index) => {
        return <span>
          <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
        </span>
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'realName',
      render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
      title: '证件号码',
      dataIndex: 'certificateNo'
    },
    {
      title: '收费方',
      dataIndex: 'payeeTypeName'
    },
    {
      title: '订单金额(￥)',
      dataIndex: 'totalAmount',
      render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
      title: '正式缴费金额(￥)',
      dataIndex: 'paidAmount',
      render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
      title: '临时缴费金额(¥)',
      dataIndex: 'paidTempAmount',
      render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
      title: '已退费金额(¥)',
      dataIndex: 'refundAmount',
      render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
      title: '已扣费金额(￥)',
      dataIndex: 'deductAmount',
      render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
      title: '可退费金缴(¥)',
      dataIndex: 'maxRefundAmount',
      render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
      title: '操作',
      key: 'action',
      fixed:'right',
      width:120,
      render: (text, record) => {
        if(record.status == 2){
          return '已申请'
        }else if(record.confirmStatus == 2){
          return '--'
        }
        return <DropDownButton>
          <Button onClick={() => { this.onLookView('MoveS', record); }}>退费</Button>
          <Button onClick={() => { this.onLookView('Move', record); }}>退学</Button>
        </DropDownButton>
      }
    }
  ];
  //检索数据
  fetch2(params) {
    if (!params) {
      return;
    }
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.getCourseStudentRefundSelectOrderOut(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') { 
        this.setState({
          pagingSearch: condition,
          data_list: data.data,
          //totalRecord: data.totalRecord,
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
    } else {
      //studentRefundApplication
      this.props.courseStudentRefundApplication(dataModel).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'error') {
          message.error(data.message);
        }
        else {
          message.success("操作成功！")
          this.fetch2();
          this.setState({
            data_list:[]
          })
          //进入管理页
          this.onLookView("Manage", null);
        }
      })
    }
  }

  render() { 
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                break;
      case 'ViewOrderDetail':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          tab={3}
        />
        break;
      case 'MoveS':
          block_content = <Edit 
            viewCallback={this.onViewCallback}
            endViewCallback={this.onViewCallback}
            {...this.state}
          //editMode={'Move'}
          />
          break;
      case 'Move':
        block_content = <CourseStudentRefundView viewCallback={this.onViewCallback}
          {...this.state}
        //editMode={'Move'}
        />
        break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <SearchForm
              num_column={3}
              form_item_list={[
                { type: 'input', name: 'orderSn', title: '订单编号',value: this.state.pagingSearch.orderSn, required:true},
                { type: 'input', name: 'realName', title: '学生姓名',value: this.state.pagingSearch.realName, required:true },
                { type: 'input', name: 'mobile', title: '手机号',value: this.state.pagingSearch.mobile , required:true },
              ]} 
              fetch2={(params) => this.fetch2(params)}
              pagingSearch={this.state.pagingSearch}
            />
            <div className="space-default">
            </div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                scroll={{x:1300}}
                bordered
              />
              <div className="space-default"></div>
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseStudentRefund);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getCourseStudentRefundSelectOrderOut: bindActionCreators(getCourseStudentRefundSelectOrderOut, dispatch),
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    courseStudentRefundApplication: bindActionCreators(courseStudentRefundApplication, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
