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
import { studentNum, orderForACertainTime, getParmForBranchIndex, getUnapprovedOrderCount,ConsultantWithinThreeDays,DivisionalActivities,ConsultantWithinOneDays } from '@/actions/admin';
import { change,stateValue } from '@/actions/dic';

import ContentBox from '@/components/ContentBox';
import Invalid from './Invalid';

class BusinessWarn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        oneConsultant:0,
        Divisiona:0,
        Consultant:0,
        editMode:'',
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

    const {auth} = this.props;
    var currentUser = auth.currentUser;
    
        this.props.change('branch')
        //请求学员数量
        this.props.studentNum().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){ 
                let studentNum = this.state.option;
                studentNum.student = data.data.marketTimeoutCount;
                studentNum.noNewStudent = data.data.notConsultCount;
                studentNum.dayNum = data.data.dayNum;
                studentNum.isShow = data.data.isShow;
                this.setState({
                  studentNum
                })
           }
        })
        //请求订单数量
        this.props.orderForACertainTime().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){ 
                let orderNum = this.state.option;
                orderNum.weekOrder = data.data.weekCount;
                orderNum.monthOrder = data.data.monthCount;
                orderNum.season = data.data.quarterCount
                this.setState({
                  orderNum
                })
           }
        });

        //请求查询未审批订单数
        this.props.getUnapprovedOrderCount().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){
                let orderNum = this.state.option;
                orderNum.examinationOrderCount = data.data.examinationOrderCount;//需要审批订单的数量
                orderNum.discountCount = data.data.discountCount;//需要审批优惠规则的数量
                this.setState({
                  orderNum
                })
           }
        });

        //请求页面所需参数
        this.props.getParmForBranchIndex().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){
                this.setState({
                    indexData: data.data
                })
           }
        });

        //3日内需电咨人员
        this.props.ConsultantWithinThreeDays().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){
                this.setState({
                  Consultant: data.data
                })
           }
        });


        //1日内需电咨人员
        this.props.ConsultantWithinOneDays().payload.promise.then((response)=>{
            let data = response.payload.data; 
           if(data.state == 'success'){
                this.setState({
                  oneConsultant: data.data
                })
           }
        });
 
        //首页统计参加其它分部活动学生数量提醒
        this.props.DivisionalActivities().payload.promise.then((response)=>{
            let data = response.payload.data;
           if(data.state == 'success'){
                this.setState({
                  Divisiona: data.data
                })
           }
        });
        this.setState({
            url:window.location.href.split('/')[window.location.href.split('/').length-1]
        })
  }
  //点击跳转  学生电咨 页面
  telephoneConsultation(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '活动与咨询');
      if(two){ 
        let three = two.child.find(item=>item.name == '学生电咨分配');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
        let {url} = this.state;
        this.refs.phone.setAttribute('href','/#/FB/EnrolStudents/StudentAskBenefitManage/'+url);
        this.refs.phone2.setAttribute('href','/#/FB/EnrolStudents/StudentAskBenefitManage/'+url);
        this.props.change('menu81','menu81-84-134');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //点击跳转 学生面咨 页面
  faceConsultation(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '活动与咨询');
      if(two){ 
        let three = two.child.find(item=>item.name == '学生面咨分配');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
        let {url} = this.state;
        this.refs.face.setAttribute('href','/#/FB/EnrolStudents/StudentAskfaceManage/'+url);
        this.refs.face2.setAttribute('href','/#/FB/EnrolStudents/StudentAskfaceManage/'+url);
        this.props.change('menu81','menu81-84-136');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //订单查询
  orderConsultation(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '订单管理');
      if(two){ 
        let three = two.child.find(item=>item.name == '订单查询');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.order.setAttribute('href','/#/FB/Recruit/OrderQuery/'+url);
      this.refs.order2.setAttribute('href','/#/FB/Recruit/OrderQuery/'+url);
      this.props.change('menu81','menu81-87-152');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //3日内电咨信息管理
  Teleconsultation(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '活动与咨询');
      if(two){ 
        let three = two.child.find(item=>item.name == '电咨信息管理');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.Management.setAttribute('href','/#/FB/Recruit/StudentAskPManage/'+url); 
      this.props.stateValue('threeDay') 
      this.props.change('menu81','menu81-84-135');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //1日内电咨信息管理
  TeleconsultationOneDay(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '活动与咨询');
      if(two){ 
        let three = two.child.find(item=>item.name == '电咨信息管理');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state; 
      this.refs.ManagementOneDay.setAttribute('href','/#/FB/Recruit/StudentAskPManage/'+url);
      this.props.stateValue('oneDay') 
      this.props.change('menu81','menu81-84-135');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  
  //半月其他活动
  OtherActivities(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '活动与咨询');
      if(two){ 
        let three = two.child.find(item=>item.name == '参加其他分部活动学员查询');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.Activities.setAttribute('href','/#/FB/Recruit/InquiriesParticipantsOtherBranchActivities/'+url); 
      this.props.change('menu81','menu81-84-428');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
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
      this.props.change('menu81','menu81-87-149');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到快捷支付订单匹配
  quickPaymentOrderMatching(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '订单管理');
      if(two){ 
        let three = two.child.find(item=>item.name == '快捷支付订单匹配');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.quick.setAttribute('href','/#/FB/Recruit/OrderFastPayMatch/'+url);
      this.refs.quick2.setAttribute('href','/#/FB/Recruit/OrderFastPayMatch/'+url);
      this.props.change('menu81','menu81-87-151');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到共享机会到访反馈
  sharingOpportunityToVisitFeedback(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '呼叫中心协同');
      if(two){ 
        let three = two.child.find(item=>item.name == '共享机会到访反馈');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.share.setAttribute('href','/#/FB/Recruit/ShareOpportunityArrive/'+url);
      this.props.change('menu81','menu81-237-243');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到外呼机会到访反馈
  outGoingOpportunityToVisitFeedback(){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '呼叫中心协同');
      if(two){ 
        let three = two.child.find(item=>item.name == '外呼机会到访反馈');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.outGoing.setAttribute('href','/#/FB/Recruit/OutgoingOpportunityArrive/'+url);
      this.props.change('menu81','menu81-237-241');
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
      this.props.change('menu83','menu83-90-284');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  componentDidMount(){ 
      this.setHeight();
      this.Reminding(); 
  }
  Reminding =()=>{
     
    let that = this; 
    let remindList = document.querySelector('.main-list');  
    document.addEventListener("DOMSubtreeModified", function() { 
        if(that.props.level=='open' && that.state.loadName =='点击收起'){
          let oriHeight = remindList.childNodes.length*28 
          remindList.style.height = oriHeight+'px';
        }
        if(that.props.level=='close' && that.state.loadName =='点击收起'){
          remindList.style.height = '252px';
        } 
    }) 
   }
  setHeight = ()=>{
    let remindList = document.querySelector('.main-list');     
    let laodHeight = remindList.clientHeight;
    let minHeight = 4*28;
    //每行都不超行时的总高度
    let oriHeight = remindList.childNodes.length*28 
    if(laodHeight>minHeight){
        remindList.style.height = minHeight+'px';
        laodHeight = oriHeight
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
    let oriHeight = remindList.childNodes.length*28;
    //最大高度，数字2代表的是有几行文字超下来了
    let maxHeight = oriHeight+28*2; 
    let caret = document.querySelector('.caret'); 
    //原本的高度
    let ownHeight = remindList.clientHeight;  
    //变化的高度
    let changeHeight = this.state.reminding; 
    //最小高度，保留4行信息显示
    let minHeight = 4*28;
    clearInterval(timer);
    clearInterval(timer2);
    if(this.state.loadName =='加载更多'){ 
      if(this.props.level == 'open'){
        timer = setInterval(function(){
          ownHeight += 3;
          if(ownHeight >= maxHeight) {
              ownHeight = maxHeight;
              clearInterval(timer);
          }
          remindList.style.height = ownHeight + 'px';
        },10);
      }else{
        timer = setInterval(function(){
          ownHeight += 3;
          if(ownHeight >= changeHeight) {
              ownHeight = changeHeight;
              clearInterval(timer);
          }
          remindList.style.height = ownHeight + 'px';
        },10);
      }
      caret.style.top = '4px'
      this.setState({
        loadName:'点击收起',
        caretIcon:'caret-up'
      })
    }else{ 
      timer2 = setInterval(function(){
        ownHeight -= 5;
          if(ownHeight <= minHeight) {
            ownHeight = minHeight;
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
  //跳转失效学生
  invalidStudentThree = () => {
    this.props.changeExistence()
    this.setState({
      operationType:'Three',
      editMode:"View"
    })
  }
  invalidStudentFifteen = () => {
    this.props.changeExistence()
    this.setState({
      operationType:'Fifteen',
      editMode:"View"
    })
  }
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.props.changeExistence()
      this.setState({ editMode: 'Manage'})
    }
  }
  render() {  
    const { auth, navpath, actions } = this.props;
    var currentUser = auth.currentUser;
    // return <div><h1>首页</h1></div>
    let block_content = '';
    switch (this.state.editMode) {
      case 'View':
        block_content = <Invalid 
          viewCallback={this.onViewCallback}
          {...this.state}
        />;
      break
      case "Manage":
      default:
        block_content = (  
            <Form>
              <div className='diagram-main'>
                  <div className='empty'></div>
                        <header className="diagram-header">
                            <span>业务提醒</span>  
                        </header>
                  <ul className='main-list'> 
                      {/* <li>
                            <i className='point'></i>
                            <p>
                                分部存在<span style={{color:'red',cursor:'pointer',margin:'0 4px'}} onClick = {()=> this.invalidStudentThree()}>{this.state.option.student?this.state.option.student:0}</span>位学员<strong>3</strong>日后市场保护失效，随下次参加活动情况转为其他区域或分部。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                分部存在<span style={{color:'red',cursor:'pointer',margin:'0 4px'}} onClick = {()=> this.invalidStudentFifteen()}>{this.state.option.noNewStudent?this.state.option.noNewStudent:0}</span>位学员<strong>15</strong>日无电咨询或面咨信息，<span>{(this.state.option.isShow==1)?(this.state.option.dayNum+'天无任何咨询信息将自动转为总部公海，'):''}</span>请通过“
                                <span>
                                <a ref='phone' onClick = {()=> this.telephoneConsultation()} href='javascript:;'>学生电咨分配</a>
                                </span>”、“<span><a ref='face' onClick = {()=> this.faceConsultation()} href='javascript:;' >学生面咨分配</a></span>”查看。
                            </p>
                      </li> */}
                      <li>
                            <i className='point'></i>
                            <p>
                                今日<span><a ref='ManagementOneDay' onClick={()=>this.TeleconsultationOneDay()} href='javascript:;'>{this.state.oneConsultant}</a></span>位学员需要您电咨。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                三日内<span><a ref='Management' onClick={()=>this.Teleconsultation()} href='javascript:;'>{this.state.Consultant}</a></span>位学员需要您电咨。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                半月内<span><a ref='Activities' onClick={()=>this.OtherActivities()} href='javascript:;'>{this.state.Divisiona}</a></span>位学员参加了其他分部的活动。
                            </p>
                      </li>
                      {/* <li>
                            <i className='point'></i>
                            <p>
                                分部新订单情况：本周内<span sytle={{margin:'0 4px'}}>{this.state.option.weekOrder?this.state.option.weekOrder:0}</span>单，本月内<span>{this.state.option.monthOrder?this.state.option.monthOrder:0}</span>单，本招生季 <span>{this.state.option.season?this.state.option.season:0}</span> 单，请通过“<span><a ref='order' onClick={()=>this.orderConsultation()} href='javascript:;'>订单查询</a></span>”查看详情。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                您有 <span><a ref='audit' href='javascript:;' onClick = {()=>this.orderAudit()}>{ this.state.option.examinationOrderCount?this.state.option.examinationOrderCount:0 }</a></span> 个订单需审批。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                您有 <span><a ref='order2' href='javascript:;' onClick={()=>this.orderConsultation()}>{ this.state.indexData.unpayOrderCount?this.state.indexData.unpayOrderCount:0 }</a></span> 单需尽快完成当期缴费。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                您有 <span><a ref='phone2' onClick={()=>this.telephoneConsultation()} href='javascript:;'>{ this.state.indexData.dzStudentCount?this.state.indexData.dzStudentCount:0 }</a></span> 个学生未进行电咨分配，<span><a ref='face2' onClick={()=>this.faceConsultation()} href='javascript:;'>{ this.state.indexData.mzStudentCount?this.state.indexData.mzStudentCount:0 }</a></span> 个学生未进行面咨分配。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                存在 <span><a ref='quick' onClick={()=>this.quickPaymentOrderMatching()} href='javascript:;'>{ this.state.indexData.quickPayOrderCount?this.state.indexData.quickPayOrderCount:0 }</a></span> 笔快捷支付共计 <span><a ref='quick2' onClick={()=>this.quickPaymentOrderMatching()} href='javascript:;' >{ this.state.indexData.totalMoney?this.state.indexData.totalMoney:0 }元</a></span> 单未进行订单匹配，不能计算至分部预收款业绩，请尽快完成订单匹配，已通过“转账上报”方式的快捷支付信息请进行删除操作。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p>
                                呼叫中心提供的 <span><a ref='share' onClick={()=>this.sharingOpportunityToVisitFeedback()} href='javascript:;'>{ this.state.indexData.publicUnAnswerStudentCount?this.state.indexData.publicUnAnswerStudentCount:0 }</a></span> 个学生的共享机会未进行到访反馈。
                            </p>
                      </li>
                      <li>
                            <i className='point'></i>
                            <p> 
                                外呼任务存在 <span><a ref='outGoing' onClick={()=>this.outGoingOpportunityToVisitFeedback()} href='javascript:;'>{ this.state.indexData.taskUnAnswerCount?this.state.indexData.taskUnAnswerCount:0 }</a></span> 个机会未进行到访反馈，请尽快进行到访反馈。
                            </p>
                      </li> */}
                      <li>
                          <i className='point'></i>
                          <p> 
                             存在 <span>{ this.state.indexData.courseArrangeCount }</span> 课程班 <span style={{color:'red'}}>{ this.state.indexData.noAttendStudentCount?this.state.indexData.noAttendStudentCount:0 }</span> 个 学生考勤信息未导入，请尽快导入考勤，以便及时对学生面授扣费，可通过<a ref='Atten' onClick={()=>this.Attendance()} href='javascript:;'>“考勤情况统计”</a>功能查看。
                          </p>
                      </li> 
                  </ul>
                  {
                    this.state.more?<div className='load'><span onClick={this.loadMore}>{this.state.loadName}<Icon className='caret' type={this.state.caretIcon} /></span> </div>:''
                  }
                  <div className='empty'></div>
              </div>
            </Form>
          ) 
        }
  
    return block_content
     
  }
}

function mapStateToProps(state) {  
  const { auth,dic,menu } = state;  
  return {
    auth: auth ? auth : null,
    dic,
    level:state.twoLevel.sta,
    menu,
    stateValue:state.stateValue
  };
}

function mapDispatchToProps(dispatch) {
  return {
    studentNum:bindActionCreators(studentNum,dispatch),
    orderForACertainTime:bindActionCreators(orderForACertainTime,dispatch),
    getParmForBranchIndex:bindActionCreators(getParmForBranchIndex,dispatch),
    getUnapprovedOrderCount:bindActionCreators(getUnapprovedOrderCount,dispatch),
    change:bindActionCreators(change,dispatch),
    ConsultantWithinThreeDays:bindActionCreators(ConsultantWithinThreeDays,dispatch),
    ConsultantWithinOneDays:bindActionCreators(ConsultantWithinOneDays,dispatch),
    DivisionalActivities:bindActionCreators(DivisionalActivities,dispatch),
    stateValue:bindActionCreators(stateValue, dispatch)
    
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BusinessWarn))