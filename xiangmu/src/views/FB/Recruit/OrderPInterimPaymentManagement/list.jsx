//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { specialCourseUpd, specialCourseAdd, studyRuleDel } from '@/actions/base';
import { OrderPOSDetailsList } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import DropDownButton from '@/components/DropDownButton';
import OrderFastPayMatch from './view'

import Detail from './view'

const formItemLayout24 = {
    labelCol: { span: 12 },
    wrapperCol: { span: 6 }
};
class TeachingStudentList extends React.Component {
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
            posData:[],
            tranData:[],
            currentDataModel: props.currentDataModel,
            dataModel: {},
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
            },
            data: [],
            totalRecord: 0,
            loading: false,
        };
    }
    componentWillMount() {
        this._isMounted = true;
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'teach_center_type','zb_payee_type','confirm_status','order_type']);

        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
        // console.log(this.props)
        
    }
    componentWillUnmount() { 
    }
    onCancel = () => {
        this.props.viewCallback(true);
    }

    //table 输出列定义
    columns = [{
            title: '公司',
            fixed:'left',
            width:'120',
            dataIndex: 'zbPayeeType',
            render:(text,record)=>{
                return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
            }
        },
        {
            title: '支付流水号',
            dataIndex: 'otherPayNo',
        },
        {
            title: '支付费用',
            dataIndex: 'money',
        },
        {
            title: '支付日期',
            dataIndex: 'payDate',
            render: (text, record, index) => { 
                return this.timeShow(record.payDate)
            }
        },
        {
            title: 'POS机名称',
            dataIndex: 'posName',
        },
        {
            title: 'POS机编号',
            dataIndex: 'posCode',
        },
        {
            title: '财务确认',
            dataIndex: 'financeStatus',
            render:(text,record)=>{
                return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
            }
        },
        {
            title: '员工工号',
            dataIndex: 'userNumber',
        },
        {
            title: '确认人',
            dataIndex: 'financeUserName',
        },
        {
            title: '确认日期',
            fixed:'right',
            width:'120',
            dataIndex: 'confirmDate', 
            render: (text, record, index) => { 
                return this.timeShow(record.confirmDate)
            }
        }

    ];


    
    timeShow = (timestamp) => {
        if(!timestamp)return null
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); 
        return Y + M + D;
    }

    //table 输出列定义
    reportColumns = [{
        title: '公司',
        fixed:'left',
        width:'120',
        dataIndex: 'zbPayeeType', 
        render:(text,record)=>{
            return getDictionaryTitle(this.state.zb_payee_type,record.zbPayeeType)
        }
    },
    {
        title: '转账人',
        dataIndex: 'transferMan',
    },
    {
        title: '转账金额',
        dataIndex: 'money',
    },
    {
        title: '转账日期',
        dataIndex: 'payDate',
        render: (text, record, index) => { 
            return this.timeShow(record.payDate)
        }
    },
    {
        title: '转账上报日期',
        dataIndex: 'transferDate',
        render: (text, record, index) => { 
            return this.timeShow(record.transferDate)
        }
    },
    {
        title: '附件',
        dataIndex: 'filePath',
    },
    {
        title: '财务确认',
        dataIndex: 'financeStatus',
        render:(text,record)=>{
            return getDictionaryTitle(this.state.confirm_status,record.financeStatus)
        }
    }, 
    {
        title: '操作人',
        dataIndex: 'financeUserName',
    },
    {
        title: '操作日期',
        fixed:'right',
        width:'120',
        dataIndex: 'confirmDate',
        render: (text, record, index) => { 
            return this.timeShow(record.confirmDate)
        }
    }

];
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.orderId = this.state.currentDataModel.orderId;
        this.props.OrderPOSDetailsList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else { 
                    this.setState({ pagingSearch: condition,...data, tranData:data.data.transferTempPayfeeList,posData:data.data.posTempPayfeeList, loading: false }) 
            }
        })
    }
    //浏览视图
    onLookView = (op, item) => {
        
        this.setState({
            editMode: op,//编辑模式
            dataModel: item,//编辑对象
        });
    };

    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ dataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Delete":
                    break;
                case "Create":
                    this.props.specialCourseAdd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            // 进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Edit":
                    this.props.specialCourseUpd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })

                    break;
                case "SpecialItem":
                    if (!dataModel.cancel) {
                        this.props.addUserByAreaId(dataModel).payload.promise.then((response) => {
                            let data = response.payload.data;
                            if (data.state != 'success') {
                                message.error(data.message);
                            }
                            else {
                                //进入设置用户页
                                this.onLookView("EditUser", dataModel);
                            }
                        })
                    } else {

                        this.onLookView("EditUser", dataModel);
                    }
                    break;
                    default:
                    this.onSearch();
                    this.onLookView("Manage", null);
            }
        }
    }



    //渲染，根据模式不同控制不同输出
    render() { 
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "View":
                block_content = <Detail viewCallback={this.onViewCallback} {...this.state} />
                break;
           case 'Add':
                 block_content = <OrderFastPayMatch viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
 
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons,false,'l')}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="订单号">
                                            {this.state.data.orderSn}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="学生姓名">
                                            {this.state.data.studentName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="订单类型">
                                            {
                                                getDictionaryTitle(this.state.order_type,this.state.data.orderType)
                                               } 
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="订单公司">
                                            {
                                                getDictionaryTitle(this.state.zb_payee_type,this.state.data.zbPayfeeType) 
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="当期欠缴金额(¥)">
                                            {this.state.data.currentAmount}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout24}
                                            label="已缴定金(¥)">
                                            {this.state.data.paidTempAmount}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        }
                    </ContentBox>
                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                    {/* 数据表格 */}
                    <p style={{color:'red',fontSize:'18px',marginBottom:'6px'}}>POS机刷卡信息</p>
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.posData}//数据
                            bordered
                        />
                    </div>
                    <p style={{color:'red',fontSize:'18px',marginBottom:'6px'}}>转账上报信息</p>
                    <div className="search-result-list">
                        <Table columns={this.reportColumns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.tranData}//数据
                            bordered
                        />
                    </div>
                    <div>
                    <Row justify="center" align="middle" type="flex"> 
                        <Button onClick={()=>{this.onLookView('Add')}} icon="plus">增加POS订金</Button> 
                        <div className="split_button"></div>
                        <Button onClick={this.onCancel} icon="rollback">返回</Button>
                    </Row>
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedTeachingStudentList = Form.create()(TeachingStudentList);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        OrderPOSDetailsList: bindActionCreators(OrderPOSDetailsList, dispatch),
        studyRuleDel: bindActionCreators(studyRuleDel, dispatch),
        specialCourseUpd: bindActionCreators(specialCourseUpd, dispatch),
        specialCourseAdd: bindActionCreators(specialCourseAdd, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachingStudentList);
