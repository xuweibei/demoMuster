import React from 'react'
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, Upload
} from 'antd';
const FormItem = Form.Item;
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { env } from '@/api/env';
import './index.less';
import { mainecharts,studentNum,orderForACertainTime,mainpie,mainLine } from '@/actions/admin';
import { change } from '@/actions/dic';

import BusinessFBWarn from '@/views/HomeModle/FB/BusinessFBWarn';//分部业务提醒
import BusinessZBWarn from '@/views/HomeModle/ZB/BusinessZBWarn';//总部业务提醒
import BusinessDQWarn from '@/views/HomeModle/DQ/BusinessDQWarn';//大区业务提醒
import RecruitPie from '@/views/HomeModle/ZB/RecruitPie';//总部饼图
import RecruitBar from '@/views/HomeModle/ZB/RecruitBar';//总部柱图
import RecruitFBBar from '@/views/HomeModle/FB/RecruitFBBar';//分部柱图
import BusinessZBgeneralWarn from '@/views/HomeModle/ZB/BusinessZBgeneralWarn';//总部普通用户业务提醒
import BusinessFBgeneralWarn from '@/views/HomeModle/FB/BusinessFBgeneralWarn';//分部普通用户业务提醒

import BusinessFlowDiagram from '@/views/HomeModle/ZB/BusinessFlowDiagram';//业务流程图

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      existence:false
    }
  
  }
  componentWillMount(){
    
  }
  changeExistence = () => {
    let existence = this.state.existence;
    this.setState({
      existence:!existence
    })
  }
  render() {
    const { auth, navpath, actions } = this.props;
    var currentUser = auth.currentUser;
    var moduleList = currentUser.moduleList;
    let block_content = '';
   
    if(moduleList && moduleList.length){
        
        block_content =
        //  <Form>
        <div style={{marginLeft:this.state.existence?0:'-65px',marginTop:this.state.existence?0:'-38px'}}>
            {moduleList.filter(a => a.moduleUrl.indexOf('BusinessFBgeneralWarn')>-1).length ? <BusinessFBgeneralWarn changeExistence={this.changeExistence}></BusinessFBgeneralWarn> : ''}
            {moduleList.filter(a => a.moduleUrl.indexOf('BusinessFBWarn')>-1).length ? <BusinessFBWarn changeExistence={this.changeExistence}></BusinessFBWarn> : ''}
            {moduleList.filter(a => a.moduleUrl.indexOf('BusinessZBWarn')>-1).length ? <BusinessZBWarn></BusinessZBWarn> : ''}
            {moduleList.filter(a => a.moduleUrl.indexOf('BusinessZBgeneralWarn')>-1).length ? <BusinessZBgeneralWarn></BusinessZBgeneralWarn> : ''}
            {moduleList.filter(a => a.moduleUrl.indexOf('BusinessDQWarn')>-1).length ? <BusinessDQWarn></BusinessDQWarn> : ''}
            {moduleList.filter(a => a.moduleUrl.indexOf('RecruitPie')>-1).length ? <RecruitPie></RecruitPie> : ''}
            {moduleList.filter(a => a.moduleUrl.indexOf('RecruitBar')>-1).length ? <RecruitBar></RecruitBar> : ''}
            {(moduleList.filter(a => a.moduleUrl.indexOf('RecruitFBBar')>-1).length && !this.state.existence) ? <RecruitFBBar></RecruitFBBar> : ''}
            {!this.state.existence && <BusinessFlowDiagram></BusinessFlowDiagram>}
        </div>
        // </Form>
        
    }else{
        block_content = 
          <div style={{marginLeft:'-65px',marginTop:'-38px'}}>
              <BusinessFlowDiagram></BusinessFlowDiagram>
          </div>
    }
    
    return block_content
    
  }
}

function mapStateToProps(state) {
    // console.log(state)
  const { auth,dic } = state;
  return {
    auth: auth ? auth : null,
    dic
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainecharts: bindActionCreators(mainecharts, dispatch),
    studentNum:bindActionCreators(studentNum,dispatch),
    orderForACertainTime:bindActionCreators(orderForACertainTime,dispatch),
    mainpie:bindActionCreators(mainpie,dispatch),
    change:bindActionCreators(change,dispatch),
    mainLine:bindActionCreators(mainLine,dispatch)
    // getAllMenu: bindActionCreators(getAllMenu, dispatch),
    // switchOrgContext: bindActionCreators(switchOrgContext, dispatch)
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home))