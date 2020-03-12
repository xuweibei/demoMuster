import React from 'react'
import { Card } from 'antd';
import { Layout, Menu, Icon, Row, Col } from 'antd'
import './index.less'

export default class ContentBox extends React.Component {
  constructor() {
    super()
  }

  render() {

    return (
      <div className="dv_border_wrap">
        <div className="dv_border_top"></div>
        {!this.props.hideBottomBorder && <div className="dv_border_bottom"></div>}
        {this.props.children && <div className="dv_border_left"></div>}
        {this.props.children && <div className="dv_border_right"></div>}
        {this.props.titleName && <div className="dv_title_wrap"><div className="text_titlename">{this.props.titleName}</div></div>}
        {this.props.topButton && !this.props.titleName && <div className="dv_topButton_wrap">{this.props.topButton}</div>}
        <div className="dv_content_wrap">{this.props.children}</div>
        {this.props.bottomButton && <div className="dv_bottomButton_wrap">{this.props.bottomButton}</div>}

      </div>
    )
  }
}
