import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { Breadcrumb } from 'antd'
import { connect } from 'react-redux'
import {change} from '@/actions/dic';
import { withRouter, matchPath } from 'react-router'

import './index.less'

const defaultProps = {
  data: []
}

const propTypes = {
  data: PropTypes.array
}

class NavPath extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      onOff:true
    }
  }
//   shouldComponentUpdate(){
//     //判断一下是否点击了学生电咨或面咨管理
//     if(this.props.zs.ll=='menu81' && this.state.onOff ){
//         this.setState({
//           activeKey:this.props.zs.ll,
//           onOff:false
//         })
//     }
//       return true
// }
  render() { 
    let { data, allMenus } = this.props;
    if (data.length == 0) {
      let localStorageItem = window.localStorage.getItem('lastMenuInfo');
      if (window.location.hash.toLocaleLowerCase().indexOf('/home/') != -1) {
        localStorageItem = null;
      }
      let lastMenuInfoStr = localStorageItem || "{key:'menu001'}";
      let lastMenuInfo = eval('(' + lastMenuInfoStr + ')');
      let keys = lastMenuInfo.key.replace('menu', '').split('-');
      if (keys.length == 3) {
        var first = allMenus.find(a => a.key == keys[0]);
        if (first) {
          var second = first.child.find(a => a.key == `${keys[0]}-${keys[1]}`);
          if (second) {
            var thrid = second.child.find(a => a.key == `${keys[0]}-${keys[1]}-${keys[2]}`);
            if (thrid) {
              data = [{ key: second.key, name: second.name }, { key: thrid.key, name: thrid.name }];
              console.log('刷新时补齐路径');
            }
          }
        }
      }
    }
    //判断如果是点击了学生电咨分配的时候面包屑的内容
    //分部
    if(this.props.zs.ll =='menu81' && this.props.zs.hh == 'menu81-84-134'){
          data = [{key:'81-84',name:'活动与咨询'},{key:'81-84-134',name:'学生电咨分配'}]
    }
    
    if(this.props.zs.ll =='menu81' && this.props.zs.hh == 'menu81-84-136'){
          data = [{key:'81-84',name:'活动与咨询'},{key:'81-84-134',name:'学生面咨分配'}]
    }
    if(this.props.zs.ll == 'menu81' && this.props.zs.hh=='menu81-87-152'){
          data = [{key:'81-87',name:'订单管理'},{key:'81-84-134',name:'订单查询'}]
    } 
    if(this.props.zs.ll == 'menu81' && this.props.zs.hh=='menu81-87-149'){
          data = [{key:'81-87',name:'订单管理'},{key:'81-87-149',name:'订单审批'}]
    }
    if(this.props.zs.ll == 'menu81' && this.props.zs.hh=='menu81-87-151'){
          data = [{key:'81-87',name:'订单管理'},{key:'81-87-151',name:'快捷支付订单匹配'}]
    }
    if(this.props.zs.ll == 'menu81' && this.props.zs.hh=='menu81-237-243'){
          data = [{key:'81-237',name:'呼叫中心协同'},{key:'81-237-243',name:'共享机会到访反馈'}]
    }
    if(this.props.zs.ll == 'menu81' && this.props.zs.hh=='menu81-237-241'){
          data = [{key:'81-237',name:'呼叫中心协同'},{key:'81-237-241',name:'外呼机会到访反馈'}]
    }
    //大区
    if(this.props.zs.ll == 'menu103' && this.props.zs.hh=='menu103-110-121'){
          data = [{key:'81-237',name:'订单管理'},{key:'103-110-121',name:'订单审核'}]
    }
    if(this.props.zs.ll == 'menu103' && this.props.zs.hh=='menu103-109-118'){
          data = [{key:'81-237',name:'订单管理'},{key:'103-109-118',name:'分部优惠规则申请初审'}]
    }
    //总部
    if(this.props.zs.ll == 'menu29' && this.props.zs.hh=='menu29-48-49'){
          data = [{key:'29-48',name:'订单管理'},{key:'103-109-118',name:'订单审批'}]
    }
    if(this.props.zs.ll == 'menu29' && this.props.zs.hh=='menu29-44-46'){
          data = [{key:'29-44',name:'优惠管理'},{key:'29-44-46',name:'分部优惠规则申请审批'}]
    }
    if(this.props.zs.ll == 'menu20' && this.props.zs.hh=='menu20-26-28'){
          data = [{key:'20-26',name:'大客户商品协议价格'},{key:'20-26-28',name:'商品协议价审核'}]
    }
    if(this.props.zs.ll == 'menu29' && this.props.zs.hh=='menu29-38-40'){
          data = [{key:'29-38',name:'商品标准价格'},{key:'29-38-40',name:'分部特殊价格初审'}]
    }
    if(this.props.zs.ll == 'menu29' && this.props.zs.hh=='menu29-38-41'){
          data = [{key:'29-38',name:'商品标准价格'},{key:'29-38-41',name:'分部特殊价格终审'}]
    }
    if(this.props.zs.ll == 'menu54' && this.props.zs.hh=='menu54-55-57'){
          data = [{key:'54-55',name:'面授开课计划及排课'},{key:'54-55-57',name:'开课计划审核'}]
    }
    if(this.props.zs.ll == 'menu54' && this.props.zs.hh=='menu54-211-281'){
          data = [{key:'54-211',name:'班级管理'},{key:'54-211-280',name:'考勤情况统计'}]
    }
    if(this.props.zs.ll == 'menu83' && this.props.zs.hh=='menu83-90-284'){
          data = [{key:'83-90',name:'班级管理'},{key:'83-90-284',name:'考勤情况统计'}]
    }
    if(this.props.zs.ll == 'menu81' && this.props.zs.hh=='menu81-84-135'){
          data = [{key:'81-84',name:'活动与咨询'},{key:'81-84-135',name:'电咨信息管理'}]
    }
    if(this.props.zs.ll == 'menu81' && this.props.zs.hh=='menu81-84-428'){
          data = [{key:'81-84',name:'活动与咨询'},{key:'81-84-428',name:'参加其他分部活动学员查询'}]
    }
    let firstMenu = null; 
    
    let bread = data.map((item) => {
      if (firstMenu == null) {
        firstMenu = allMenus.find(a => a.key == item.key.split('-')[0]);
      }
      return (
        <Breadcrumb.Item key={'bc-' + item.key}>{item.name}</Breadcrumb.Item>
      )
    })

    //<Breadcrumb.Item key='bc-0'>首页</Breadcrumb.Item>
    if(this.props.zs.ll =='menu81' && this.props.zs.hh == 'menu81-84-134'){
      firstMenu.name = '招生管理';
    }
    if(this.props.zs.ll == 'headquarters' || this.props.zs.ll == 'branch'){
      bread = []; 
    }

    if(this.props.location.pathname.indexOf('/home/') > -1){//首页去除面包屑
      return <Breadcrumb separator='>'></Breadcrumb>
    }
    
    return (
      <Breadcrumb separator='>'>
        {firstMenu && <Breadcrumb.Item key={'bc-' + firstMenu.key}>{firstMenu.name}</Breadcrumb.Item>}
        {bread}
      </Breadcrumb>
    )
  }
}

NavPath.propTypes = propTypes;
NavPath.defaultProps = defaultProps;

// export default NavPath

function mapStateToProps(state) {  
  return {
    items: state.menu.items,
    menuCollapsed: state.menu.menuCollapsed,
    zs:state.zs
  }
}

function mapDispatchToProps(dispatch) {
  return {
    change: bindActionCreators(change, dispatch)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavPath))