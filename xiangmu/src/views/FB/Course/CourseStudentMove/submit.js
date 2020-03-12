/*
学生异动管理 第四步 转入订单费用提交
2018-05-28
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
import { formatMoney, timestampToTime, getDictionaryTitle } from '@/utils';
import { loadBizDictionary } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import { courseStudentInOrderDetailQuery, courseStudentMoveSubmit } from '@/actions/course';
import { loadDictionary } from '@/actions/dic';

class CourseStudentMoveSubmit extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      editMode: '',
      //currentDataModel: props.currentDataModel,
      dataModel: {},
      loading: false,
      UserSelecteds: []
    };
    (this: any).fetch2 = this.fetch2.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).onSubmit = this.onSubmit.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(["dic_YesNo"]);
    this.fetch2();
  }

  //检索数据
  fetch2(){
      this.props.courseStudentInOrderDetailQuery(this.props.currentDataModel.inOrderId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              dataModel: data.data,
              loading: false
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  };
  onSubmit(){
    var params = {
      outOrderId: this.props.currentDataModel.outOrderId,
      inOrderId: this.props.currentDataModel.inOrderId,
      outAmount: this.props.currentDataModel.outAmount,
      //filePath: this.props.currentDataModel.filePath
      //json: JSON.stringify(this.props.currentDataModel.json)
    }
    if(this.props.currentDataModel.json.length){
      params.json = JSON.stringify(this.props.currentDataModel.json);
    }
    this.props.courseStudentMoveSubmit(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              //dataModel: data.data,
              loading: false
            })
            message.success('异动成功！');
            this.onCancel(true)
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }

  onCancel = (isToFirst) => {
    this.props.viewCallback(null, isToFirst);
  }

  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:
        var form_list = [
                  {type:'text', value: this.state.dataModel.orderSn, title: '转入新订单订单号'},
                  {type:'text', value: this.state.dataModel.realName, title: '学生姓名'},
                  {type:'text', value: this.state.dataModel.orderBranchName, title: '订单归属'},
                  {type:'text', value: this.state.dataModel.studentBranchName, title: '学生归属'},
                  {type:'text', value: this.state.dataModel.createUName, title: '创建人'},
                  {type:'text', value: timestampToTime(this.state.dataModel.createDate), title: '创建日期'},
                  {type:'text', value: this.state.dataModel.partnerName, title: '大客户'},
                  {type:'text', value: this.state.dataModel.teachCenterName, title: '教学点'},
                  {type:'text', value: this.state.dataModel.payeeTypeName, title: '订单收费方'},
                  {type: ''},
                  {type: 'text', value: formatMoney(this.state.dataModel.originalAmount), title: '订单标准金额(¥)'},
                  {type: 'text', value: formatMoney(this.state.dataModel.totalDiscountAmount), title: '优惠金额(¥)'},
                  {type: 'text', value: formatMoney(this.state.dataModel.totalAmount), title: '订单实际金额(¥)'},
                  {type: 'text', value: formatMoney(this.state.dataModel.paidAmount), title: '已缴金额(¥)'},
                ];
        if(this.state.dataModel.stageList && this.state.dataModel.stageList.length){
          this.state.dataModel.stageList.map((item,index) => {
            var title1 = '第' + (index+1) + '期应缴金额(¥)';
            var title2 = (index+1) + '期欠缴金额(¥)';
            form_list.push({ type: 'text', value: formatMoney(item.payableAmount), title: title1 });
            form_list.push({ type: 'text', value: formatMoney(item.arrearageAmount), title: title2 });
          });
        }
        form_list.push({
          type: 'text', value: formatMoney(this.props.currentDataModel.outAmount), title: '转入新订单缴费金额(¥)'
        })
        form_list.push({});
        block_content = (
          <ContentBox titleName="异动" bottomButton={
              <div>
                <Button onClick={this.onSubmit} icon="save">确定异动</Button>
                <span className="split_button"></span>
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
              </div>
            }
          >
          <div className="dv_split"></div>
          <div style={{width:'90%'}}>
              <SearchForm
                num_column={2}
                form_item_list={form_list}
                hideTopButtons={true}
                hideBottomButtons={true}
              />
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
const WrappedManage = Form.create()(CourseStudentMoveSubmit);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseStudentInOrderDetailQuery: bindActionCreators(courseStudentInOrderDetailQuery, dispatch),
        courseStudentMoveSubmit: bindActionCreators(courseStudentMoveSubmit, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
