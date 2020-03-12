import React from 'react'
import PropTypes from 'prop-types'
import { withRouter, matchPath } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Layout, Menu, Icon, Row, Col, Tooltip } from 'antd'
import { Link } from 'react-router-dom'
import { getAllMenu, updateNavPath, recordUserFunClick, switchMenuCollapse } from '@/actions/menu'
import { authHOC, getUserLastMenuInfo } from '@/utils/auth';
import { change,twoLevel } from '@/actions/dic';

const loginImage = require('../../assets/logo.png');
const defaultMenusExpansion = 9;//二级菜单数量小于8，则默认全部展开
const SubMenu = Menu.SubMenu

//是否加载mock菜单
const loadMockMenu = false;

import './index.less'

const defaultProps = {
  items: []
}

const propTypes = {
  items: PropTypes.array
}

const { Sider } = Layout;

const isActive = (path, history) => {
  return matchPath(path, {
    path: history.location.pathname,
    exact: true,
    strict: false
  })
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props)
   
    this.lastMenuInfo = getUserLastMenuInfo();
    this.state = {
      activeKey: this.lastMenuInfo.key.split('-')[0],
      secondActiveKey: this.lastMenuInfo.key.split('-')[0],
      showSubMenu: null,
      OpenSecondMenuKeys: [],
      onOff:true
    };
  }
  toggle = () => {
    this.props.switchMenuCollapse();
  }

  componentWillMount() {
    var that = this;
   
    if (loadMockMenu) {
      this.props.getAllMenu(this.props.depth).payload.promise.then((response) => {
        that.props.updateNavPath(that.lastMenuInfo.keyPath.sort((a, b) => { return (a.length > b.length) ? -1 : 1; }), that.lastMenuInfo.key);
      })
    }
    // this.props.change();
    // let url = window.location.href.split('/')[window.location.href.split('/').length-1];
    // // console.log(window.location.href=='http://localhost:5000/#/FB/Partner/ProductPriceList'+url)
    // if(window.location.href=='http://localhost:5000/#/FB/Partner/ProductPriceList'+url){
    //   console.log(3)
    // }
    // console.log(this.props.val)
  }
  shouldComponentUpdate(){
      //判断一下是否点击了首页的跳转
      if((this.props.zs.ll=='menu81' || this.props.zs.ll=='menu103' || this.props.zs.ll=='menu29' || this.props.zs.ll=='menu20' || this.props.zs.ll=='menu54' || this.props.zs.ll=='menu83')  && this.state.onOff){
        let a = this.props.items.filter((e)=>{
          if(e.key==this.props.zs.ll.slice(4)){
            return e
            }
          });
          this.onShowSecondMenu(a[0])
          this.setState({
            activeKey:this.props.zs.ll,
            secondActiveKey:this.props.zs.hh,
            onOff:false,
            showSubMenu:null,
          })
      }
      return true
  }
  firstMenuClickHandle = (item) => {
    // if (!item.item.props.url) {
    //   return;//非根功能则跳过
    // }
    let a = document.getElementsByClassName('.submenu_shadow_sider')
    this.props.change('123');
    this.setState({
      activeKey: item.key,//第一级
      secondActiveKey: '',//第二级
      onOff:true
    })
    let skey = "";
    // this.props.updateNavPath(item.keyPath, item.key)
    setTimeout(() => {
      this.props.recordUserFunClick({ key: item.key, keyPath: item.keyPath });
      window.scrollTo(0, 0);
    }, 500);
  }
  menuClickHandle = (item) => {
    this.props.change('123');
    this.setState({
      activeKey: item.key.split('-')[0],//第一级
      secondActiveKey: item.key//第二级
    })
    let skey = "";
    if ((item.key).indexOf('-') != -1 && (item.key).indexOf('menu') != -1) {
      skey = (item.key).substring(0, (item.key).lastIndexOf('-'))
      skey = skey.replace("menu", "sub");
    }
    this.setState({ selectedSub: skey });
    this.props.updateNavPath(item.keyPath, item.key)
    setTimeout(() => {
      this.props.recordUserFunClick({ key: item.key, keyPath: item.keyPath });
      window.scrollTo(0, 0);
    }, 500);
  }
  //一级菜单项构建
  _menuProcessFirst = (nodes, pkey) => {
    return Array.isArray(nodes) && nodes.map((item, i) => {
      return (
        <Menu.Item url={item.url} key={'menu' + item.key} className={'menu' + item.key} style={{ padding: 0 }}>
          {
            item.url ? <Link onClick={() => {
              this.onShowSecondMenu(item)
            }} to={item.url} ><span><icon className={`iconfont icon-${item.icon}`} /><span className="nav-text">{item.name}</span></span></Link> : <span onClick={() => {
              this.onShowSecondMenu(item)
            }}><icon className={`iconfont icon-${item.icon}`} /><span className="nav-text">{item.name}</span></span>
          }
        </Menu.Item>
      )
    });
  }
  //二级菜单项构建
  _menuProcess = (nodes, pkey) => {
    return Array.isArray(nodes) && nodes.map((item, i) => {
      let menu = this._menuProcess(item.child, item.key);
      if (menu.length > 0) {
        return (
          <SubMenu
            key={'sub' + item.key} className={[item.child.length === 1 ? 'dot ' : ' ']}
            title={<span><span className="nav-text">{item.name}</span></span>}
          >
            {menu}
          </SubMenu>
        )
      } else {
        let obj1 = <Link to={item.url} >{item.icon && <Icon type={item.icon} />}<span>{item.name}</span></Link> 
        return (
          <Menu.Item key={'menu' + item.key} className={'menu' + item.key} style={{ padding: 0 }}>
            {
              item.url ? obj1 : <span>{item.icon && <Icon type={item.icon} />}{item.name}</span>
            }
          </Menu.Item>
        )
      }
    });
  }

  onShowSecondMenu = (item) => {  
    if(item){
      if (this.state.showSubMenu != item.key && item.child) { 
        let defaultOpenSecondMenuKeys = [];
        if (item.child.length < defaultMenusExpansion) {
          item.child.map((a) => { defaultOpenSecondMenuKeys.push(`sub${a.key}`) });
        }
        this.props.twoLevel('open')
        this.setState({ OpenSecondMenuKeys: defaultOpenSecondMenuKeys }, () => {
          this.setState({ showSubMenu: item.key, currentSecondMenus: item.child });
        })
      }
      else { 
        this.props.twoLevel('close')
        this.setState({ showSubMenu: null, currentSecondMenus: [] })
      }
      return true;
    }else{ 
      this.props.twoLevel('close')
      this.setState({ showSubMenu: null, currentSecondMenus: [] })
    }
  }
  onHideSecondMenu = () => {
    this.setState({ showSubMenu: null, currentSecondMenus: [] })
  }
  render() { 
    const { items, updateNavPath, history } = this.props;
    let { activeKey, openKey, secondActiveKey } = this.state
    // console.log(activeKey)
    const firstMenu = this._menuProcessFirst(items);
    var mode = this.props.menuCollapsed ? 'vertical' : 'inline';
    return (
      <div className="dv_row_sider">
        <Sider
          key="Sider_FirstMenu"
          width={128}
          collapsedWidth={50}
          trigger={null}
          collapsible
          collapsed={this.props.menuCollapsed}
        //onCollapse={this.onCollapse}
        >
          <div className="ant-layout-logo" onClick={this.toggle}>
            <div className={this.props.menuCollapsed ? 'block_menu-unfold' : 'menu-fold'}></div>
          </div>
          
          {
            //侧边栏的主体
            this.props.items.length > 0 ?
          <Menu
            mode={mode}
            theme="dark"
            inlineIndent={15}
            selectedKeys={[activeKey]}
            //inlineCollapsed={this.props.menuCollapsed}
            // inlinecollapsed={this.props.menuCollapsed}
            onClick={this.firstMenuClickHandle}
          >
            {firstMenu}
          </Menu> 
          : ''}
        </Sider>

        <Sider
          width={250}
          collapsedWidth={0}
          // trigger={null}
          collapsible
          className='submenu_shadow_sider'
          style={{ backgroundColor: '#fff' }}
          //控制点击的时候侧边是否展开
          collapsed={this.state.showSubMenu == null}
          //inlineCollapsed={this.state.showSubMenu}
          // inlinecollapsed={this.state.showSubMenu}
          key="Sider_SecondMenu"
        >
          {this.state.showSubMenu != null &&
          <Menu key={this.state.showSubMenu}
            mode={'inline'}
            selectedKeys={[secondActiveKey]}
            onClick={this.menuClickHandle}
            defaultOpenKeys={this.state.OpenSecondMenuKeys}
          >
            {this._menuProcess(this.state.currentSecondMenus)}
          </Menu>
          }
          {this.state.showSubMenu != null && <div className='dv_toggle_arrow' onClick={this.onHideSecondMenu}></div>}
        </Sider>

      </div>
    )
  }
}

Sidebar.propTypes = propTypes;
Sidebar.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    items: state.menu.items,
    menuCollapsed: state.menu.menuCollapsed,
    zs:state.zs,
    twoLevel:state.twoLevel
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getAllMenu: bindActionCreators(getAllMenu, dispatch),
    updateNavPath: bindActionCreators(updateNavPath, dispatch),
    recordUserFunClick: bindActionCreators(recordUserFunClick, dispatch),
    switchMenuCollapse: bindActionCreators(switchMenuCollapse, dispatch),
    change: bindActionCreators(change, dispatch),
    twoLevel:bindActionCreators(twoLevel, dispatch)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar))
