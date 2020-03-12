import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Modal, Layout, Row, Col, Icon, Badge, Menu, Dropdown, Avatar, Popover, Button } from 'antd'
import './index.less'
import { Link, withRouter } from 'react-router-dom'
const { Header } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
import { switchOrgContext } from '../../actions/auth';
import { getAllMenu, updateNavPath } from '@/actions/menu';
import NavPath from '@/components/NavPath';
import { env } from '@/api/env.js';

import OrgDropDown from '@/components/OrgDropDown';
import RegionOrgDropDown from '@/components/RegionOrgDropDown';
import { getCookie, setCookie, delCookie } from '@/utils/index';

class commonHeader extends React.Component {
  constructor() {
    super();
    this.state = { 
      showChangePassword: false,
      showChangeUserInfo: false,
      branchOrgName: '',
      regionOrgName: '',
    };
  }
  componentWillMount() {

    delCookie('branchOrgName');
    delCookie('regionOrgName');
    const { currentUser } = this.props;
    this.setDropDownName(currentUser.userType);

  }

  handleLogOut = () => { 
    const { logout } = this.props
    logout().payload.promise.then(() => {
      env.loginHandler();
      this.props.updateNavPath(["menu001"], "menu001");
    });
  }

  handlecurrentUser = () => {
    this.setState({ showChangeUserInfo: true })
  }

  handlePassword = () => {
    this.setState({ showChangePassword: true })
  }

  getUserTypeTitle = (userType) => {
    switch (userType) {
      case 1:
        return '总部';
      case 2:
        return '大区';
      case 3:
        return '分部';
      default:
        return '未知';
    }
  }
  onSwitchUserOrg = (item) => {
    if(item) {
      const modal = Modal.info({
        title: `正在加载${this.getUserTypeTitle(item.usertype)}功能，请您稍等....`,
        content: '提示框将自动关闭',
      });
      this.props.history.replace('/');
      this.props.switchOrgContext(item.orgId).payload.promise.then((response) => {
        //切换机构后，注意以下操作
        //重置路径到首页
        this.props.updateNavPath(["menu001"], "menu001");
        window.localStorage.removeItem('lastMenuInfo');
        this.props.history.replace('/');
        //延时自动关闭提示框
        setTimeout(() => {
          delCookie('branchOrgName');
          delCookie('regionOrgName');
          modal.destroy();
        }, 2000);
      });
    }
  }
  setDropDownName = (item) => {
    if(item.usertype == 3){ //分部
      setCookie('branchOrgName', item.orgName);
      this.setState({ branchOrgName: item.orgName });
    }else if(item.usertype == 2){//大区
      setCookie('regionOrgName', item.orgName);
      this.setState({ regionOrgName: item.orgName });
    }
  }
  onSetTitle = (item) => {
    this.setDropDownName(item);
    this.onSwitchUserOrg(item);
  }

  render() {
    const { currentUser, navpath } = this.props

    let username = currentUser.user ? currentUser.user.realName : '';
    return (
      <Header className='block_header'>
        <Row type="flex" justify="left" align="middle" style={{height:'100%'}}>
          <Col span={3}>
            <div className="logo" />
          </Col>
          <Col span={21}>
            {currentUser && <div className="dv_header_right">
              <div className="text_tip" >
                {/* 最新菜单通知个人最新菜单通知个人最新菜单通知个人 */}
              </div>
              <div className="dv_menu_wrap">
                {currentUser.userTypeList.length > 0 && <Menu
                  theme="dark"
                  mode="horizontal"
                  onClick={(menuItem) => {
                    this.onSwitchUserOrg(menuItem.item.props.data);
                  }}
                  defaultSelectedKeys={['0']}
                  style={{ backgroundColor: 'transparent', height: 52, lineHeight: 52, marginRight: 50 }}
                >
                  {currentUser.userTypeList
                    .sort((a, b) => { return a.usertype > b.usertype ? 1 : 0; })
                    .map((item, index) => {
                      if(item.usertype == 3 || item.usertype == 2){
                        return ''
                      }
                      else if (item.userUsertypeId == currentUser.userType.userUsertypeId) {
                        return <Menu.Item disabled key={item.userUsertypeId}>{this.getUserTypeTitle(item.usertype)}</Menu.Item>
                      }
                      else {
                        return <Menu.Item key={item.userUsertypeId} data={item}>{this.getUserTypeTitle(item.usertype)}</Menu.Item>
                      }
                    })}
                    {/* 大区下拉菜单 */}
                    {
                      currentUser.userTypeList.filter(a => (a.usertype == 2)).length && <Menu.Item>
                        <RegionOrgDropDown regionOrgName={this.state.regionOrgName}>
                          {currentUser.userTypeList.filter(a => (a.usertype == 2)).map((item, index) => {
                            if (item.userUsertypeId == currentUser.userType.userUsertypeId) {
                              return <Button disabled className="item-btn-disabled" onClick={() => {
                                          this.onSetTitle(item);
                                      }}>{ item.orgName }</Button>
                            }else{
                              return <Button onClick={() => {
                                          this.onSetTitle(item);
                                      }}>{ item.orgName }</Button>
                            }
                              
                          })}
                        </RegionOrgDropDown>
                      </Menu.Item>
                    }
                    {/* 分部下拉菜单 */}
                    {
                      currentUser.userTypeList.filter(a => (a.usertype == 3)).length && <Menu.Item>
                        <OrgDropDown branchOrgName={this.state.branchOrgName}>
                          {currentUser.userTypeList.filter(a => (a.usertype == 3)).map((item, index) => {
                            if (item.userUsertypeId == currentUser.userType.userUsertypeId) {
                              return <Button disabled className="item-btn-disabled" onClick={() => {
                                          this.onSetTitle(item);
                                      }}>{ item.orgName }</Button>
                            }else{
                              return <Button onClick={() => {
                                          this.onSetTitle(item);
                                      }}>{ item.orgName }</Button>
                            }
                              
                          })}
                        </OrgDropDown>
                      </Menu.Item>
                    }
                </Menu>
                }
                <div>
                  {/* <Avatar src={userIcon} style={{marginRight:14,marginLeft:14,width:28,height:28}} /> */}
                  <span className="text_username">{username}</span>
                </div>
                <div className='dv_exit' onClick={this.handleLogOut}></div>
              </div>
            </div>
            }
          </Col>
        </Row>


      </Header >
    )
  }
}
commonHeader.propTypes = {
  navpath: PropTypes.array
};
const mapStateToProps = (state) => {
  const { menu } = state;
  return {
    navpath: menu.navpath
  };
};

function mapDispatchToProps(dispatch) {
  return {
    switchOrgContext: bindActionCreators(switchOrgContext, dispatch),
    updateNavPath: bindActionCreators(updateNavPath, dispatch),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(commonHeader))
