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
import StudentBasicInfor from './StudentBasicInfor';
import OrderDetail from './OrderDetail';
import Counselling from './Counselling';
import OrderPayInfor from './OrderPayInfor';      //缴费情况
import AuditContent from './AuditContent';
import Signature from './Signature';
import OrderRefundInfo from './OrderRefundInfo';  //退费情况
import OrderDeductInfo from './OrderDeductInfo';  //扣费情况
import BrochureReleaseDesk from './BrochureReleaseDesk' //资料领取
import TransferStatus from './TransferStatus' //转班情况

/*
studentId:string{传入学生Id}
orderId:string{传入订单Id}
tab:string 1,2,3,4{默认选择标签:0}
viewCallback:fun,
*/
class TabsOrderContents extends React.Component {

    constructor(props) {
        super(props)
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
            orderId: props.orderId,
            tab: `${props.tab || '1'}`,
            loading: false,
            isHideAudit: false,
            orderData:'',
            isPass: false
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
    //是否显示需审核页面
    onTabHideAudit = (isHideAudit,isPass) => {
        this.setState({ 
            isHideAudit: isHideAudit,
            isPass: isPass || false
        })
    }

    onIsPass = (isPass) => {
        this.setState({ 
            isPass: isPass || false
        })
    }

  ongetOrderData = (data) => {
      this.setState({ orderData: data })
  }

    onCancel = () => {
        this.props.viewCallback();
    }

    //渲染，根据模式不同控制不同输出
    render() { 
        let block_content = <Tabs defaultActiveKey={this.state.tab} onChange={this.onTabChange} type="card" tabBarExtraContent={(!this.props.isModal && <a onClick={this.onCancel} className='button_back'><Icon type="rollback" style={{ fontSize: 16, }} />返回</a>)}>
            <TabPane tab="学生基本信息" key="1"><div className='block_tabPane'><StudentBasicInfor studentId={this.state.studentId} /></div></TabPane>
            <TabPane tab="咨询情况" key="2"><div className='block_tabPane'><Counselling studentId={this.state.studentId} orderId={this.state.orderId} /></div></TabPane>
            <TabPane tab="订单信息" key="3"><div className='block_tabPane'><OrderDetail studentId={this.state.studentId} orderId={this.state.orderId} onTabHideAudit={this.onTabHideAudit} ongetOrderData={this.ongetOrderData}/></div></TabPane>
            {!this.state.isHideAudit ? <TabPane tab={this.state.isPass?'审核情况':'需审核内容'} key="4"><div className='block_tabPane'><AuditContent studentId={this.state.studentId} orderId={this.state.orderId} isAudit={this.props.isAudit} onIsPass={this.onIsPass} viewCallback={this.onCancel}/></div></TabPane>:''}
            <TabPane tab="合同" key="5"><div className='block_tabPane'><Signature orderData={this.state.orderData}  /></div></TabPane>
            <TabPane tab=" 缴费情况" key="7"><div className='block_tabPane'><OrderPayInfor studentId={this.state.studentId} orderId={this.state.orderId} /></div></TabPane>
            <TabPane tab=" 退费情况" key="8"><div className='block_tabPane'><OrderRefundInfo orderId={this.state.orderId} /></div></TabPane>
            <TabPane tab=" 扣费情况" key="9"><div className='block_tabPane'><OrderDeductInfo studentId={this.state.studentId} orderId={this.state.orderId} /></div></TabPane>
            <TabPane tab=" 资料领取" key="10"><div className='block_tabPane'><BrochureReleaseDesk studentId={this.state.studentId} orderId={this.state.orderId} /></div></TabPane>
            {this.state.orderData.existsStudentMove?<TabPane tab=" 转班情况" key="11"><div className='block_tabPane'><TransferStatus orderId={this.state.orderId} /></div></TabPane>:''}
        </Tabs>

        return block_content;
    }
}
//表单组件 封装
const WrappedTabsOrderContents = Form.create()(TabsOrderContents);

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
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTabsOrderContents);
