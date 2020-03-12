import React from 'react'

import { Layout } from 'antd'
import { env } from '@/api/env.js'
import './index.less'

const { Footer } = Layout;

export default class commonFooter extends React.Component {
  constructor () {
    super()
  }

  render () {
    let year=new Date().getFullYear();
    return (
      <Footer style={{ textAlign: 'center' }}>
        {env.copyright}
      </Footer>
    )
  }
}
