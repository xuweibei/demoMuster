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

import ContentBox from '@/components/ContentBox';

class BusinessFlowDiagram extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
       selectIndex: 0
    }
  
  }
  componentWillMount(){

    
  }

  onSelectChange = (value) => {
      this.setState({
        selectIndex: value
      })
  }
  
  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = '';
    
    block_content = (
        <Form>
        {/* <ContentBox titleName="" hideTopBorder={true}> */}
          <div className='kong'></div>
          <div className='diagram-main'>
              <header className="diagram-header">
                  <span>业务流程图</span>
                  <span className="diagram-select">
                  <Row gutter={24}>
                    <Col span={24}>
                        <FormItem label="">
                          {getFieldDecorator('selectIndex', {
                            initialValue: this.state.selectIndex || '0'
                          })(
                            <Select 
                                dropdownStyle={{
                                  color:'red !important' ,
                                  background:'bule'
                                }}
                                className='select' onChange={this.onSelectChange}>
                                <Option value='0' key='0' title="市场活动与咨询业务流程">市场活动与咨询业务流程</Option>
                                <Option value='1' key='1' title="优惠规则管理流程">优惠规则管理流程</Option>
                                <Option value='2' key='2' title="商品定价业务流程">商品定价业务流程</Option>
                                <Option className='select' value='3' key='3' title="订单业务流程">订单业务流程</Option>
                                <Option value='4' key='4' title="订单收费方式说明">订单收费方式说明</Option>
                                <Option value='5' key='5' title="开课计划及选课业务流程">开课计划及选课业务流程</Option>
                                <Option value='6' key='6' title="排课表业务流程">排课表业务流程</Option>
                                <Option value='7' key='7' title="分部外呼业务流程">分部外呼业务流程</Option>
                                <Option value='8' key='8' title="呼叫中心共享机会业务流程">呼叫中心共享机会业务流程</Option>
                            </Select>
                            )}
                        </FormItem>
                      </Col>
                    </Row>
                  </span>  
              </header>
              <Row gutter={24}>
                  <Col span={24}>
                    <div className="diagram-pic">
                        <img src={env.serverURL+'/flowDiagram/'+this.state.selectIndex+(this.state.selectIndex!=4?'.gif':'.png')} />
                    </div>
                  </Col>
              </Row>
          </div> 
          {/* </ContentBox> */}
        </Form>
      )
  
    return block_content
     
  }
}

//表单组件 封装
const WrappedManage = Form.create()(BusinessFlowDiagram);

function mapStateToProps(state) {
    // console.log(state)
  const { auth,dic } = state;
  return {
    auth: auth ? auth : null,
    dic
  };
}

function mapDispatchToProps(dispatch) {
  return {

  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedManage))