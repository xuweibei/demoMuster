import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, Row, Col, Icon, message } from 'antd'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { login } from '../../actions/auth'
import { env } from '@/api/env.js'
const FormItem = Form.Item

import './index.less'

const propTypes = {
  user: PropTypes.object,
};

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({
      loading: true
    });
    const data = this.props.form.getFieldsValue()
    this.props.login(data.user, data.password).payload.promise.then(res => {
      window.localStorage.setItem('loginInfo', JSON.stringify({ username: data.user, password: data.password }))
      this.setState({
        loading: false
      });
      if (res.error) {
        message.error(res.payload.data.message);
        return;
      }
      message.success('欢迎 ' + res.payload.data.data.user.realName);
      this.props.history.replace('/');
    }).catch(err => {
      this.setState({
        loading: false
      });
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form

    let loginInfoStr = window.localStorage.getItem('loginInfo');
    let formInfo = { username: '', password: '' };
    if (loginInfoStr != null) {
      formInfo = eval('(' + loginInfoStr + ')');
    }
    return (
      <Row className="login-row" type="flex" justify="space-around" align="middle">
        <Col span="6" className="login-wrap">
          <Form layout="horizontal" className="login-form">
            {<h2 className="logo_wrap">{/* <span className="logo"></span> */}<span className="logo_name">用户登录</span></h2>}
            <div className="input_wrap">
              <FormItem>
                {getFieldDecorator('user', { initialValue: formInfo.username })(
                  <Input  placeholder='邮箱／手机号' />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', { initialValue: formInfo.password })(
                  <Input type='password' placeholder='密码'/>
                )}
              </FormItem>
              <p>
                <Button className="btn-login" type='primary' size="large" loading={this.state.loading} onClick={this.handleSubmit.bind(this)}>登录</Button>
              </p>
            </div>
          </Form>
        </Col>
      </Row>

    )
  }
}

Login.propTypes = propTypes;

Login = Form.create()(Login);

function mapStateToProps(state) {
  return { user: state.auth };
}

function mapDispatchToProps(dispatch) {
  return {
    login: bindActionCreators(login, dispatch)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))
