/*
学生异动管理 第二步 选择转入订单
2018-05-15
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination } from 'antd';
const FormItem = Form.Item;
import { formatMoney } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import { courseStudentInOrderQuery } from '@/actions/course';
import CourseStudentMoveFee from './fee';

class CourseStudentMoveChoose extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentDataModel: props.currentDataModel,
      editMode: '',
      pagingSearch: {
        outOrderId: props.currentDataModel.orderId,
        orderSn: '',
        realName: props.currentDataModel.realName,
      },
      data_list: [],
      loading: false,
      UserSelecteds: []
    };
    (this: any).fetch2 = this.fetch2.bind(this);
  }

  columns = [
    {
        title: '订单号',
        dataIndex: 'orderSn',
        width:120,
        fixed:'left',
    },
    {
        title: '学生姓名',
        dataIndex: 'realName'
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
        title: '临时缴费金额(￥)',
        dataIndex: 'paidTempAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '已扣费金额(￥)',
        dataIndex: 'deductAmount',
        render: text => <span>{formatMoney(text, 2)}</span>
    },
    {
        title: '订单状态',
        dataIndex: 'orderStatusName',
        width:120,
        fixed:'right'
    }
  ];
  //检索数据
  fetch2(params){
      if(!params || !params.orderSn || !params.realName || !params.outOrderId){
        return;
      }
      var condition = params || this.state.pagingSearch;
      this.setState({ loading: true, pagingSearch: condition, UserSelecteds: [] });
      this.props.courseStudentInOrderQuery(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            data.data.key = data.data.orderId;
            var list = [];
            list.push(data.data);
            this.setState({
              data_list: list,
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
  onLookView = (op) => {
    if(this.state.UserSelecteds && this.state.UserSelecteds.length){
      if(op != this.state.editMode){
        this.setState({
            editMode: op,//编辑模式
        });
      }
    }else {
      message.error("请选择一个缴费记录");
    }
  };
  //视图回调
  onViewCallback = (dataModel, isToFirst) => {
    if(isToFirst){
      this.props.viewCallback(null, isToFirst);
      return;
    }
    if(!dataModel){
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Add':
          //delete dataModel.parentOrgid;
          this.props.createCoursePlanAdd(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  this.fetch2();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })

          break;
        case 'Additional':
          //delete dataModel.parentOrgid;
          this.props.createCoursePlanAdditional(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  this.fetch2();
                  //进入管理页
                  this.onLookView("Manage", null);
              }
          })
          break;
      }
    }
  }

  onCancel = () => {
    this.props.viewCallback();
  }

  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Fee':
        block_content = <CourseStudentMoveFee viewCallback={this.onViewCallback}
          inOrderId={this.state.UserSelecteds[0]}
          outOrderId={this.props.currentDataModel.orderId}
        />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            //name: record.orgName,
          }),
          type: 'radio'
        }
        block_content = (
          <ContentBox titleName="异动" bottomButton={<Button onClick={this.onCancel} icon="rollback">返回</Button>}>
            <div className="dv_split"></div>
          <div style={{width:'90%'}}>
            <SearchForm
              num_column={2}
              form_item_list={[
                {type:'text', value: this.props.currentDataModel.orderSn, title: '转出订单号'},
                {type:'text', value: this.props.currentDataModel.realName, title: '转出订单学生姓名'},
                {type:'input', name: 'realName', title: '转入订单学生姓名'},
                {type:'input', name: 'orderSn', title: '订单编号'},
              ]}
              fetch2={(params) =>this.fetch2(params)}
              pagingSearch={this.state.pagingSearch}
              extendButtons={[
                {title: '下一步>转出订单费用处理', icon:"arrow-right", callback: () =>this.onLookView('Fee')},
              ]}
            />
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                rowSelection={rowSelection}
                scroll={{x:1300}}
              />
              <div className="space-default"></div>
            </div>
          </div>
            <div className="dv_split"></div>
        </ContentBox>
        )
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseStudentMoveChoose);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseStudentInOrderQuery: bindActionCreators(courseStudentInOrderQuery, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
