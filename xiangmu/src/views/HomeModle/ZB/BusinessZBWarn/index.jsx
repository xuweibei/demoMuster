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
import { getParmForZB, getUnapprovedOrderCount } from '@/actions/admin';
import { change } from '@/actions/dic';

import ContentBox from '@/components/ContentBox';

class BusinessWarn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        more:true,
        loadName:'加载更多',
        caretIcon:'caret-down',
        url:'',
        val:'',
        option: {},
        indexData: {}
    }
  
  }
  componentWillMount(){

        //请求查询未审批订单数
        this.props.getUnapprovedOrderCount().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){
                this.props.change('headquarters')
                let data1 = this.state.option;
                data1.examinationOrderCount = data.data.examinationOrderCount;//需要审批订单的数量
                data1.discountCount = data.data.discountCount;//需要审批优惠规则的数量
                this.setState({
                    data1
                })
           }
        });

        //请求页面所需参数
        this.props.getParmForZB().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){
                this.setState({
                    indexData: data.data
                })
           }
        });

        this.setState({
            url:window.location.href.split('/')[window.location.href.split('/').length-1]
        })
  }

  //跳转到订单审批
  orderAudit(){ 
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '订单管理');
      if(two){ 
        let three = two.child.find(item=>item.name == '订单审批');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.audit.setAttribute('href','/#/FB/Recruit/OrderAudit/'+url);
      this.props.change('menu29','menu29-48-49');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  } 
  //跳转到分部优惠规则申请审批
  TrialOfPartial (){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '优惠管理');
      if(two){ 
        let three = two.child.find(item=>item.name == '分部优惠规则申请审批');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.trial.setAttribute('href','/#/ZB/Recruit/ProductDiscountRuleManage/'+url);
      this.props.change('menu29','menu29-44-46');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到商品协议价审核
  commodity(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '大客户');
    if(one){ 
      let two = one.child.find(item=>item.name == '大客户商品协议价格');
      if(two){ 
        let three = two.child.find(item=>item.name == '商品协议价审核');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.price.setAttribute('href','/#/ZB/Partner/ProductPriceAudit/'+url);
      this.props.change('menu20','menu20-26-28');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
   //跳转到分部特殊价格初审
  specialTrial(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '商品标准价格');
      if(two){ 
        let three = two.child.find(item=>item.name == '分部特殊价格初审');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.special.setAttribute('href','/#/ZB/Recruit/ProductPriceApply/BaseAuditManage/'+url);
      this.props.change('menu29','menu29-38-40');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到分部特殊价格终审
  partialTrial(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '商品标准价格');
      if(two){ 
        let three = two.child.find(item=>item.name == '分部特殊价格终审');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.partial.setAttribute('href','/#/ZB/Recruit/ProductPriceApply/FinalAuditManage/'+url);
      this.props.change('menu29','menu29-38-41');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到开课计划审核
  coursePlan(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '学服学务');
    if(one){ 
      let two = one.child.find(item=>item.name == '面授开课计划及排课');
      if(two){ 
        let three = two.child.find(item=>item.name == '开课计划审核');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.plan.setAttribute('href','/#/ZB/Course/CoursePlanAudit/'+url);
      this.props.change('menu54','menu54-55-57');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到考勤统计管理
  Attendance(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '学服学务');
    if(one){ 
      let two = one.child.find(item=>item.name == '班级管理');
      if(two){ 
        let three = two.child.find(item=>item.name == '考勤情况统计');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.Atten.setAttribute('href','/#/FB/Class/AttendanceStatisticsFB/'+url);
      this.props.change('menu54','menu54-211-281');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  componentDidMount(){
    this.setHeight()
  }
  setHeight = ()=>{
    let remindList = document.querySelector('.main-list');     
    let laodHeight = remindList.clientHeight
    if(laodHeight>112){
      remindList.style.height = '112px'
    }else{ 
      remindList.style.height = laodHeight;
      this.setState({
        more:false
      })
      return
    }
    this.setState({
      reminding:laodHeight
    })
  }
  loadMore = () =>{
    var timer = null,timer2 = null
    let remindList = document.querySelector('.main-list');
    let caret = document.querySelector('.caret'); 
    let ownHeight = remindList.clientHeight; 
    let changeHeight = this.state.reminding;  
    clearInterval(timer);
    clearInterval(timer2);
    if(this.state.loadName =='加载更多'){ 
      timer = setInterval(function(){
        ownHeight += 3;
        if(ownHeight >= changeHeight) {
          ownHeight = changeHeight;
            clearInterval(timer);
        }
        remindList.style.height = ownHeight + 'px';
      },10);
      caret.style.top = '4px'
      this.setState({
        loadName:'点击收起',
        caretIcon:'caret-up'
      })
    }else{ 
      timer2 = setInterval(function(){
        ownHeight -= 5;
          if(ownHeight <= 112) {
            ownHeight = 112;
              clearInterval(timer2);
          }
          remindList.style.height = ownHeight + 'px';
         },10);
         caret.style.top = '2px'
         this.setState({
           loadName:'加载更多',
           caretIcon:'caret-down'
         })
      } 
  }
  render() { 
    let block_content = '';
    
    block_content = (
        <Form> 
        {/* <ContentBox titleName="" hideTopBorder={true}> */}
              <div className='kong'></div>
              <div className='diagram-main'>
                    <header className="diagram-header">
                        <span>业务提醒</span>  
                    </header>
                    <ul className='main-list'> 
                      <li>
                          <i className='point'></i>
                          <p>
                             您有 <span><a ref='audit' onClick={()=>this.orderAudit()} href='javascript:;'>{ this.state.option.examinationOrderCount?this.state.option.examinationOrderCount:"0" }</a></span> 个订单需审核。
                          </p>
                      </li>
                      <li>
                          <i className='point'></i>
                          <p> 
                             您有 <span><a ref='trial' onClick={()=>this.TrialOfPartial()} href='javascript:;'>{ this.state.option.discountCount?this.state.option.discountCount:"0" }</a></span> 分部优惠规则申需审核。
                          </p>
                      </li>
                      <li>
                          <i className='point'></i>
                          <p> 
                             您有 <span><a ref='price' onClick={()=>this.commodity()} href='javascript:;'>{ this.state.indexData.searchPriceCount?this.state.indexData.searchPriceCount:"0" }</a></span> 个商品协议价需审核。
                          </p>
                      </li>
                      <li>
                          <i className='point'></i>
                          <p> 
                             您有 <span><a ref='special' onClick={()=>this.specialTrial()} href='javascript:;'>{ this.state.indexData.firstTrialCount?this.state.indexData.firstTrialCount:"0" }</a></span> 分部特殊价格需初审。
                          </p>
                      </li>
                      <li>
                          <i className='point'></i>
                          <p> 
                             您有 <span><a ref='partial' onClick={()=>this.partialTrial()} href='javascript:;'>{ this.state.indexData.endTrialCount?this.state.indexData.endTrialCount:"0" }</a></span> 分部特殊价格需终审。
                          </p>
                      </li>
                      {/* <li>
                          <i className='point'></i>
                          <p> 
                              您有 <span><a ref='plan' onClick={()=>this.coursePlan()} href='javascript:;'>{ this.state.indexData.coursePlanCount?this.state.indexData.coursePlanCount:"0" }</a></span> 开课计划须需审核。
                          </p>
                      </li> 
                      <li>
                          <i className='point'></i>
                          <p> 
                             存在 <span style={{color:'red'}}>{ this.state.indexData.branchCount?this.state.indexData.branchCount:"0" }</span> 分部共计<span style={{color:'red'}}>{ this.state.indexData.noAttendStudentCount?this.state.indexData.noAttendStudentCount:"0" }</span> 个 学生考勤信息未导入，请督促各分部导入考勤，以便及时对学生面授扣费，可通过<a ref='Atten' onClick={()=>this.Attendance()} href='javascript:;'>“考勤情况统计”</a>功能查看。
                          </p>
                      </li>  */}
                  </ul>
                  {
                    this.state.more?<div className='load'><span onClick={this.loadMore}>{this.state.loadName}<Icon className='caret' type={this.state.caretIcon} /></span> </div>:''
                  }
                  <div className='kong'></div>
                </div> 
          {/* </ContentBox> */}
        </Form>
      )
  
    return block_content
     
  }
}

function mapStateToProps(state) { 
  const { auth,dic,menu } = state; 
  return {
    auth: auth ? auth : null,
    dic,
    menu
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUnapprovedOrderCount:bindActionCreators(getUnapprovedOrderCount,dispatch),
    getParmForZB:bindActionCreators(getParmForZB,dispatch),
    change:bindActionCreators(change,dispatch),

  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BusinessWarn))