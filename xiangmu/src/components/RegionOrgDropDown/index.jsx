import React from 'react'
import { Card } from 'antd';
import { Layout, Menu, Icon, Row, Col, Dropdown, Button } from 'antd'
import './index.less'

export default class RegionOrgDropDown extends React.Component {
  constructor() {
    super()
  }


  render() {
    if (!this.props.children.length) {
      return this.props.children;
    }
    let block_content = <div></div>
    //过滤掉按钮条件为false的情况
    let childs = this.props.children.filter(a => a != false);
    {/* 下拉按钮 */ }
    let blocks = [];
    if (childs.length >= 1) {
      childs.map((item) => {
        blocks.push(<Menu.Item>{item}</Menu.Item>);
      })
      let menus = <Menu>{blocks}</Menu>
      block_content = < Dropdown overlay={menus}  className="dropdown-list">
        <span className="ant-dropdown-link" style={{ backgroundColor: 'transparent', lineHeight: 52 }}>
          {this.props.regionOrgName || '大区'} <Icon type="down" />
        </span>
      </Dropdown >
    }
    else {
      block_content = this.props.children
    }
    return <div>{block_content}</div>
  }
}
