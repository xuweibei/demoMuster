//标准组件环境 ＴＡＢ标签
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, Tabs } from 'antd';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import IntentionUniversity from '@/components/KeyCustomerInformation/IntentionUniversity'; 


/*
studentId:string{传入学生Id}
tab:string 1,2,3,4{默认选择标签:1}
viewCallback:fun,
*/
class TabsStudentContents extends React.Component {

    constructor(props) {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            studentId: props.studentId,
            tab: `${props.tab || '1'}`,
            loading: false,
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
    }

    componentWillUnMount() {
    }
    onTabChange = (tabKey) => {
        this.setState({ tab: tabKey })
    }

    onCancel = () => {
        this.props.viewCallback();
    }

    //渲染，根据模式不同控制不同输出
    render() {

        let block_content =
            <Tabs defaultActiveKey={this.state.tab} onChange={this.onTabChange} type="card" tabBarExtraContent={this.props.goBack?'':<a onClick={this.onCancel} className='button_back'><Icon type="rollback" style={{ fontSize: 16, }} />返回</a>}>
                <TabPane tab="意向高校" key="1"><div className='block_tabPane'><IntentionUniversity currentDataModel={this.props.currentDataModel} /></div></TabPane> 
            </Tabs>

        return block_content;
    }
}
//表单组件 封装
const WrappedTabsStudentContents = Form.create()(TabsStudentContents);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTabsStudentContents);
