//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, DatePicker, Modal, InputNumber } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoney, formatMoment } from '@/utils';

//业务接口方法引入
import { ForecastInformationQueryList, updateFeePreReportProtectId } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ForecastMaintenancePersonView from '../ForecastMaintenancePersonView';
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';  
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';

class ForecastMaintenancePersonManage extends React.Component {

    constructor() {
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
            totalMoney:'',
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                feeType: '',
                leadFlag: '',
                createDateStart:'',
                createDateEnd:'',
                payDateStart:'',
                payDateEnd:'',
                recruitBatchName:'',
                branchId:'',
                universityName:'',
                mobile:'',
                realName:'',
                creater:''
            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            selectedRows: [],
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_YesNo']);
        // this.onSearch();
        
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title:'招生季',
            width:120,
            fixed:'left',
            dataIndex: 'recruitBatchName',
        },
        {
        title: '缴费/退费日期',
        width: 120, 
        dataIndex: 'payDate',
        render: (text, record, index) => {
            return timestampToTime(record.payDate);
        }
    },
    {
        title: '维护人员',
        width: 120,
        dataIndex: 'realName'
    },
     {
        title: '手机',
        width: 120,
        dataIndex: 'mobile',
    },
    {
        title: '学生情况',
        width: 100,
        dataIndex: 'isStudy', 
    },
    {
        title: '在读高校',
        dataIndex: 'universityName',
    },
    {
        title: '领航校区',
        width: 100,
        dataIndex: 'leadFlag',
    },
    {
        title: '费用类型',
        width: 100,
        dataIndex: 'feeType', 
    },
    {
        title: '订单金额（¥）',
        width: 120,
        dataIndex: 'orderMoney',
        render: (text, record, index) => {
            return formatMoney(record.orderMoney);
        }
    },
    {
        title: '费用金额（¥）',
        width: 120,
        dataIndex: 'money',
        render: (text, record, index) => {
            return formatMoney(record.money);
        }
    },
    {
        title: '录入日期',
        width: 120,
        dataIndex: 'createDate',
        render: (text, record, index) => {
            return timestampToTime(record.createDate);
        }
    },
    {
        title: '创建人',
        width: 120,
        fixed: 'right',
        dataIndex: 'creater',
    },
];

columnsZB = [
    {
        title:'招生季',
        width:120,
        fixed:'left',
        dataIndex: 'recruitBatchName',
    },
    {
        title:'分部',
        width:120, 
        dataIndex: 'branchName',
    },
    {
    title: '缴费/退费日期',
    width: 120, 
    dataIndex: 'payDate',
    render: (text, record, index) => {
        return timestampToTime(record.payDate);
    }
},
{
    title: '维护人员',
    width: 120,
    dataIndex: 'realName'
},
 {
    title: '手机',
    width: 120,
    dataIndex: 'mobile',
},
{
    title: '学生情况',
    width: 100,
    dataIndex: 'isStudy', 
},
{
    title: '在读高校',
    dataIndex: 'universityName',
},
{
    title: '领航校区',
    width: 100,
    dataIndex: 'leadFlag',
},
{
    title: '费用类型',
    width: 100,
    dataIndex: 'feeType', 
},
{
    title: '订单金额（¥）',
    width: 120,
    dataIndex: 'orderMoney',
    render: (text, record, index) => {
        return formatMoney(record.orderMoney);
    }
},
{
    title: '费用金额（¥）',
    width: 120,
    dataIndex: 'money',
    render: (text, record, index) => {
        return formatMoney(record.money);
    }
},
{
    title: '录入日期',
    width: 120,
    dataIndex: 'createDate',
    render: (text, record, index) => {
        return timestampToTime(record.createDate);
    }
},
{
    title: '创建人',
    width: 120,
    fixed: 'right',
    dataIndex: 'creater',
},
];



    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;

        let createDateStart = condition.createDateStart;
        if(Array.isArray(createDateStart)){
            condition.createDateStart = formatMoment(createDateStart[0]);
            condition.createDateEnd = formatMoment(createDateStart[1]);
        }
        let payDateStart = condition.payDateStart;
        if(Array.isArray(payDateStart)){
            condition.payDateStart = formatMoment(payDateStart[0]);
            condition.payDateEnd = formatMoment(payDateStart[1]);
        }

        this.props.ForecastInformationQueryList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            console.log(data) 
            if (data.result === false) {
                this.setState({ loading: false });
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false,totalMoney:data.totalMoney }); 
            }
        })
    }

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {

        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit":
                case "BtchEdit":
                
                    this.props.updateFeePreReportProtectId(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.setState({ UserSelecteds: [], selectedRows: [] });
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;

            }
        }
    }
    onBtchEdit = () => {
        this.onLookView('BtchEdit', this.state.selectedRows )
    }

    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div> 
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "BtchEdit":
            case "View":
                block_content = <ForecastMaintenancePersonView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default: 
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<FileDownloader
                    apiUrl={'/edu/feePreReport/exportFeePreReportVos'}//api下载地址
                    method={'post'}//提交方式
                    options={this.state.pagingSearch}//提交参数
                    title={'导出'}
                    >
                </FileDownloader>);

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex"> 
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="招生季">
                                            {getFieldDecorator('recruitBatchName', {
                                            initialValue: this.state.pagingSearch.recruitBatchName
                                            })(
                                            <SelectRecruitBatch hideAll={false} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                                                this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value })
                                                //变更时自动加载数据
                                                this.onSearch();
                                            }} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        (this.props.currentUser.userType.usertype == 1 || this.props.currentUser.userType.usertype == 2) && <Col span={12}>
                                                                                <FormItem {...searchFormItemLayout} label={'分部'} >
                                                                                {getFieldDecorator('branchName', { initialValue: this.state.pagingSearch.branchName })(
                                                                                    <SelectFBOrg scope='my' hideAll={false} />
                                                                                )}
                                                                                </FormItem>
                                                                            </Col>
                                    }
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="领航校区"
                                        >
                                            {getFieldDecorator('leadFlag', { initialValue: this.state.pagingSearch.leadFlag })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_YesNo.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="费用类型">
                                        {getFieldDecorator('feeType', {initialValue: this.state.pagingSearch.feeType})(
                                            <Select>
                                                <Option value="">全部</Option>
                                                <Option value='1' key={0}>缴费</Option>
                                                <Option value='4' key={4}>退费</Option>
                                            </Select>
                                        )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'在读高校'} >
                                            {getFieldDecorator('universityName', { initialValue: this.state.pagingSearch.universityName })(
                                                <Input placeholder="请输入在读高校" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'维护人'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="请输入维护人" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'创建人'} >
                                            {getFieldDecorator('creater', { initialValue: this.state.pagingSearch.creater })(
                                                <Input placeholder="请输入创建人" />
                                            )}
                                        </FormItem>
                                    </Col> 

                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'手机号'} >
                                            {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                                                <Input placeholder="请输入手机号" />
                                            )}
                                        </FormItem>
                                    </Col> 
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="缴费/退费日期">
                                            {getFieldDecorator('payDateStart', { initialValue:this.state.pagingSearch.payDateStart?[moment(this.state.pagingSearch.payDateStart,dateFormat),moment(this.state.pagingSearch.payDateEnd,dateFormat)]:[]})(
                                                <RangePicker
                                                    style={{width:220}}  
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="录入日期">
                                            {getFieldDecorator('createDateStart', { initialValue:this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[]})(
                                                <RangePicker
                                                    style={{width:220}}  
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}></Col>
                                </Row>
                            </Form>
                        }
                    </ContentBox>
                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                    {/* 数据表格 */}
                    <strong style={{color:'red',fontSize:'20px',display:'block',marginBottom:'10px'}}>费用金额合计(￥)：{this.state.totalMoney}</strong>
                    <div className="search-result-list">
                        <Table columns={(this.props.currentUser.userType.usertype == 1 || this.props.currentUser.userType.usertype == 2)?this.columnsZB:this.columns} //列定义
                            loading={this.state.loading} 
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={(this.props.currentUser.userType.usertype == 1 || this.props.currentUser.userType.usertype == 2)?{ x: 1600 }:{ x: 1400 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex"> 
                                <Col span={24} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      
                                        pageSizeOptions = {['10','20','30','50','100','200']}
                                        onShowSizeChange={this.onShowSizeChange}
                                        onChange={this.onPageIndexChange}
                                        showTotal={(total) => { return `共${total}条数据`; }}
                                        total={this.state.totalRecord} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedForecastMaintenancePersonManage = Form.create()(ForecastMaintenancePersonManage);

const mapStateToProps = (state) => {
    //基本字典数据 
    let { currentUser } = state.auth;
    let { Dictionarys } = state.dic;
    return { Dictionarys,currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        ForecastInformationQueryList: bindActionCreators(ForecastInformationQueryList, dispatch),
        updateFeePreReportProtectId: bindActionCreators(updateFeePreReportProtectId, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedForecastMaintenancePersonManage);
