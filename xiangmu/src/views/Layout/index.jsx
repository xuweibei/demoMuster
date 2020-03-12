import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Layout, Affix, Row, Col } from 'antd';
import { Route, Redirect } from 'react-router-dom';

import { childRoutes } from '@/route'
import { authHOC } from '@/utils/auth'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

import { fetchProfile, logout } from '@/actions/auth';

import NavPath from '@/components/NavPath';

import './index.less';


import { env } from '@/api/env.js';
const { Content } = Layout;

class App extends React.Component {
  _timer = null;
  constructor(props) {
    super(props);
    this.state = {
      isLoadComplete: false
    };
  }

  componentWillMount() {
    const { actions, auth } = this.props;
    //刷新页面时，重新读取用户信息
    if (env.getToken() && !auth.currentUser) {
      actions.fetchProfile().payload.promise.then(res => {
        if (res.error) {
          env.loginHandler();
          return;
        }
      });
    }
    this._timer = setTimeout(() => {
      this.setState({ isLoadComplete: true });
    }, 1000);
  }
  componentWillReceiveProps() {
    if (!this.state.isLoadComplete) {
      if (this._timer) {
        clearTimeout(this._timer);
      }
      this._timer = setTimeout(() => {
        this.setState({ isLoadComplete: true });
      }, 500);
    }
  }
  render() {
    if (!this.props.auth.currentUser) {
      return <div></div>
    }
    const { auth, navpath, actions } = this.props;
    return (
      <Layout className="ant-layout-has-content" >
        <Header currentUser={auth.currentUser} logout={actions.logout} />
        <Layout className="ant-layout-has-sider layout-fixed">
          <Sidebar />
          <Layout className="ant-layout-has-content" >
            <Row><Col span={24}><NavPath data={navpath} allMenus={this.props.allMenus} /></Col></Row>
            <Content className="block_content_wrap">
              {this.state.isLoadComplete && <div style={{ minHeight: 360 }}>
                {childRoutes.map((route, index) => (
                  <Route key={index} path={route.path} component={authHOC(route.component)} exactly={route.exactly} />
                ))}
              </div>
              }
            </Content>
          </Layout>
        </Layout>
        {/* <Footer /> */}
      </Layout>
    );
  }
}

App.propTypes = {
  auth: PropTypes.object,
  navpath: PropTypes.array
};

const mapStateToProps = (state) => {
  const { auth, menu } = state;
  return {
    auth: auth ? auth : null,
    navpath: menu.navpath,
    allMenus: menu.items
  };
};

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators({ fetchProfile, logout }, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
