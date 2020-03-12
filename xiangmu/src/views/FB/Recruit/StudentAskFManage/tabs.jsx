//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import ByStudent from './index.jsx';
import ByRecord from './byRecord.jsx';
class StudentAskFManage extends React.Component {


    constructor() {
        super();
        this.state = {
            onOff:true,
            num:0,
            re:0,
            dic_FuntionTypes: [{ funType: 1, funTypeName: '按学生查询' }, { funType: 2, funTypeName: '按明细查询' }]
        };
    }
    componentWillMount() {

    }
    componentWillUnMount() {
    }
    
    details(o,l,n){
        this.setState({onOff:o,re:l,num:n})
    }

    //渲染，根据模式不同控制不同输出
    render() {

        let {onOff,re,num} = this.state;
        if(onOff){
            return <Tabs defaultActiveKey={'tab0'} type="card">
            <TabPane tab={'按学生查询'} key={`tab0`}>
                <div style={{ padding: '20px 0' }}>
                    <ByStudent details={this.details.bind(this)} />
                </div>
            </TabPane>
            <TabPane tab={'按明细查询'} key={`tab1`}>
                <div style={{ padding: '20px 0' }}>
                    <ByRecord  details={this.details.bind(this)}  />
                </div>
            </TabPane>
        </Tabs>
        }else{
            if(num==0){
                return <ByStudent l = {re} details={this.details.bind(this)} />
            }else{
                return <ByRecord l = {re} details={this.details.bind(this)} />
            }
        }
    }
}
//redux 组件 封装
export default StudentAskFManage;
