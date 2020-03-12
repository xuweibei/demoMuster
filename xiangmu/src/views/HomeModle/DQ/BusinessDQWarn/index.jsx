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
import { getUnapprovedOrderCount } from '@/actions/admin';
import { change } from '@/actions/dic';

import ContentBox from '@/components/ContentBox';

class BusinessWarn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        more:false,
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
                let data1 = this.state.option;
                data1.examinationOrderCount = data.data.examinationOrderCount;//需要审批订单的数量
                data1.discountCount = data.data.discountCount;//需要审批优惠规则的数量
                this.setState({
                    data1
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
      this.props.change('menu103','menu103-110-121');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  //跳转到分部优惠规则初审
  TrialOfPartial (){
    let onOff = false;
    let one = this.props.menu.items.find(item=>item.name == '招生管理');
    if(one){ 
      let two = one.child.find(item=>item.name == '大区优惠管理');
      if(two){ 
        let three = two.child.find(item=>item.name == '分部优惠规则申请初审');
        if(three){ 
          onOff = true
        }
      }
    } 
    if(onOff){
      let {url} = this.state;
      this.refs.trial.setAttribute('href','/#/FB/Recruit/OrderAudit/'+url);
      this.props.change('menu103','menu103-109-118');
    }else{
      message.warning('您暂未开通该功能的权限')
    }
  }
  
  componentDidMount(){ 
    this.setHeight()
  }
  setHeight = ()=>{
    let remindList = document.querySelector('.main-list');     
    let laodHeight = remindList.clientHeight; 
    if(laodHeight>130){
      remindList.style.height = '130px'
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
          if(ownHeight <= 130) {
            ownHeight = 130;
              clearInterval(timer2);
          }
          remindList.style.height = ownHeight + 'px';
         },10);
         caret.style.top = '2px';
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
          <div className='kong'></div>
          <div className='diagram-main'>
                    <header className="diagram-header">
                        <span>业务提醒</span>  
                    </header>
              <ul  className='main-list'> 
                  <li>
                        <i className='point'></i>
                        <p className='ppp'>
                        您有 <span><a ref='audit' onClick={()=>this.orderAudit()}  href='javascript:;'>{ this.state.option.examinationOrderCount?this.state.option.examinationOrderCount:"0" }</a></span> 个订单需审批。
                        </p>
                  </li>
                  <li>
                        <i className='point'></i>
                        <p className='ppp'>
                         您有 <span><a ref='trial' onClick={()=>this.TrialOfPartial()} href='javascript:;'>{ this.state.option.discountCount?this.state.option.discountCount:"0" }</a></span> 分部优惠规则申需初审。个订单需审批。
                        </p>
                  </li>
              </ul>
          </div>
              {
                this.state.more?<div className='load'><span onClick={this.loadMore}>{this.state.loadName}<Icon className='caret' type={this.state.caretIcon} /></span> </div>:''
              }
              <div className='kong'></div>
        </Form>
      )
  
    return block_content
     
  }
}

function mapStateToProps(state) {
    // console.log(state)
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
    change:bindActionCreators(change,dispatch),

  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BusinessWarn))