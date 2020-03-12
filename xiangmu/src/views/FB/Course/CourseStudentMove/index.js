/*
学生异动管理
2018-05-15
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney } from '@/utils';

import SearchForm from '@/components/SearchForm';
import { courseStudentOutOrderQuery } from '@/actions/course';

import { getCoursePlanAddList, createCoursePlanAdd, createCoursePlanAdditional } from '@/actions/course';

import CourseStudentMoveChoose from './choose';

//操作按钮
import DropDownButton from '@/components/DropDownButton';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

class CourseStudentMove extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      orderSn: '',
      realName: '',
    },
    data_list: [],
    loading: false,
  };
  constructor(){
    super();
    (this: any).fetch2 = this.fetch2.bind(this);
  }

  columns = [
    {
        title: '订单号',
        dataIndex: 'orderSn',
        width:150,
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
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => {
            return <DropDownButton>
                <Button onClick={() => { this.onLookView('Move', record); }}>异动</Button>
            </DropDownButton>
        }
    }
  ];
  //检索数据
  fetch2(params){
      if(!params || !params.orderSn || !params.realName){
        return;
      }
      this.setState({ loading: true });
      var condition = params || this.state.pagingSearch;
      this.props.courseStudentOutOrderQuery(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = [];
            if(data.data){
              list.push(data.data);
            }
            this.setState({
              pagingSearch: condition,
              data_list: list,
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

  render(){
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
      case 'Move':
        block_content = <CourseStudentMoveChoose viewCallback={this.onViewCallback}
          {...this.state}
          //editMode={'Move'}
        />
        break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <SearchForm
              form_item_list={[
                {type:'input', name: 'orderSn', title: '订单编号', value: this.state.pagingSearch.orderSn, required: true},
                {type:'input', name: 'realName', title: '学生姓名', value: this.state.pagingSearch.realName, required: true},
              ]}
              fetch2={(params) =>this.fetch2(params)}
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
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseStudentMove);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseStudentOutOrderQuery: bindActionCreators(courseStudentOutOrderQuery, dispatch),
        //基本字典接口
        //loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getCoursePlanAddList: bindActionCreators(getCoursePlanAddList, dispatch),
        createCoursePlanAdd: bindActionCreators(createCoursePlanAdd, dispatch),
        createCoursePlanAdditional: bindActionCreators(createCoursePlanAdditional, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
