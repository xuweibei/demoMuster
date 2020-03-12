//标准组件环境  订单信息,根据内部订单数据导向到方向班或非方向班详情页面
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import TopUserName from './TopUserName'
import OrderInfor from './OrderInfor';
import OrderInforDesc from './OrderInforDesc';

import { getOrderById } from '@/actions/recruit';

class OrderDetail extends React.Component {
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
        (this: any).getOrderDetail = this.getOrderDetail.bind(this);

        this.state = {
            currentDataModel: null,
            loading: false,
            data: {},
            isDirection: false,
        };
    }
    componentWillMount() {
        //加载订单明细信息
        this.getOrderDetail();
    }
    componentWillUnMount() {
    }


    getOrderDetail(){
      this.props.getOrderById(this.props.orderId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          this.setState({
            currentDataModel: data.data,
            isDirection: data.data.orderType == 2 && data.data.partnerClassType && data.data.partnerClassType == 1
          })
          let orderData = data.data;
          this.props.ongetOrderData(orderData);
          if( (orderData.orderType == 2 && orderData.partnerClassType && orderData.partnerClassType == 1) || !orderData.auditFinalOrgType){

            this.props.onTabHideAudit(true);

          }else{
            if(orderData.auditOrgTypeList && orderData.auditOrgTypeList.length == 0){
              this.props.onTabHideAudit(false,true);
            }else{
              this.props.onTabHideAudit(false);
            }

          }
        }
        else {
            this.setState({ loading: false })
            message.error(data.message);
        }
      })
      /*if(this.props.isDirection){
        this.props.getDirectionOrderById(this.props.orderId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              currentDataModel: data.data,
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
        })
      }else {
        this.props.getNotDirectionOrderById(this.props.orderId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              currentDataModel: data.data,
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
        })
      }*/

    }

    //渲染，根据模式不同控制不同输出
    render() {
//测试用
//return <OrderInfor orderInfo={this.state.currentDataModel} />
        if (this.state.isDirection) {
            // 订单信息(方向班)
            return <OrderInfor orderInfo={this.state.currentDataModel} />
        }
        else {
            // 订单信息(非方向班)
            return <OrderInforDesc orderInfo={this.state.currentDataModel} />
        }
    }
}
//表单组件 封装
const WrappedOrderInfor = Form.create()(OrderDetail);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //getDirectionOrderById: bindActionCreators(getDirectionOrderById, dispatch),
        //getNotDirectionOrderById: bindActionCreators(getNotDirectionOrderById, dispatch),
        getOrderById: bindActionCreators(getOrderById, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderInfor);
