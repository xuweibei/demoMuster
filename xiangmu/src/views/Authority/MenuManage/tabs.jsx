//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import MenuManage from './index.jsx';
class MenuManageTabs extends React.Component {


    constructor() {
        super();
        this.state = {
            dic_FuntionTypes: [{ funType: 1, funTypeName: '总部功能' }, { funType: 2, funTypeName: '大区功能' }, { funType: 3, funTypeName: '分部功能' }]
        };
    }
    componentWillMount() {

    }
    componentWillUnMount() {
    }


    //渲染，根据模式不同控制不同输出
    render() {

        return <Tabs defaultActiveKey={'tab0'} type="card">
            {
                this.state.dic_FuntionTypes.map((item, index) => {
                    return <TabPane tab={item.funTypeName} key={`tab${index}`}>
                        <div style={{ padding: '20px 0' }}>
                            <MenuManage funType={item.funType} {...this.state} />
                        </div>
                    </TabPane>
                })
            }
        </Tabs>
    }
}
//redux 组件 封装
export default MenuManageTabs;
