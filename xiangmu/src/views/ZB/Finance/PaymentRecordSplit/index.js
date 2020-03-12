//预收款财务确认
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
    Pagination, Divider, Modal, Card,
    Checkbox,
} from 'antd';
import { env } from '@/api/env';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';

//操作按钮
import DropDownButton from '@/components/DropDownButton';

//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, formatMoney } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout,searchFormItemLayout24
} from '@/utils/componentExt';
import moment from 'moment';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { queryPageBysplitByStudentPayfee, getBankAccountByZbPayeeType,getStudentPayfeeConfirmBatchConfirm, selectConfirmLastDay } from '@/actions/finance';

//业务数据视图（增、删、改、查)
import PaymentRecordSplitView from './view'
import PaymentRecordSplitEdit from './split'

class PaymentRecordSplit extends React.Component {

    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);

        let timeArr = timestampToTime(new Date().getTime()).split('-');
        let startTimeYear = timeArr[0];
        let startTimeMonth = timeArr[1];
        let startTimeDay = timeArr[2];
        this.state = {
            parentIdArr:[],
            isShowChooseProduct:false,
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            bank_list: [],
            pagingSearch: {
                confirmDate:startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
                branchId: '',
                currentPage: 1,
                pageSize: env.defaultPageSize,
                zbPayeeType:'',
                payeeType:'',
                bankAccountId:'',
                paymentWay:'',
                financeStatus:'',
                sonPaymentWay:''
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            startValue: null,
            endValue: null,
            endOpen: false,
            signStartValue: null,
            signEndValue: null,
            signEndOpen: false,
            startTimeDay: startTimeDay,
            lastDay: 0
        };
    }
    componentWillMount() {
        //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
        this.loadBizDictionary(['payee_type', 'zb_payee_type','confirm_status', 'payment_way']);
        //首次进入搜索，加载服务端字典项内容
        //拿到确认日期限制时间
        this.props.selectConfirmLastDay().payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {

                if(data.data){

                    this.setState({
                        lastDay: data.data
                    })
                    
                }
                
            }
            else {
                message.error(data.message);
            }
            
        })

        this.onSearch();
    }

    

    //table 输出列定义
    columns = [{
        title: '公司',
        dataIndex: 'zbPayeeType',
        fixed: 'left',
        width: 100,
        render: (text,record) => {
            return getDictionaryTitle(this.state.zb_payee_type, text)
        }
    },
    {
        title: '收费账户',
        dataIndex: 'bankAccountName',
    },
    {
        title: '收费方',
        width: 100,
        dataIndex: 'payeeType',
        render: (text) => { return getDictionaryTitle(this.state.payee_type, text) }
    },
    {
        title: '收费分部',
        dataIndex: 'branchName',
    },
    {
        title: '业绩分部',
        dataIndex: 'benefitBranchName',
    },
    {
        title: '缴费日期',
        width: 100,
        dataIndex: 'payDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '缴费金额（¥）',
        width: 100,
        dataIndex: 'money',
        render: (text) => { return <span>{formatMoney(text)}</span> }
    },
    {
        title: '缴费方式',
        width: 100,
        dataIndex: 'paymentWay',
        render: (text,record) => { 
            if(record.sonPaymentWay){
                return record.sonPaymentWayName
            }
            return getDictionaryTitle(this.state.payment_way, text)
         }
    },
    {
        title: '订单号',
        dataIndex: 'orderSnList',
        render: (text, record) => {
            return  record.orderSnList.map((item, index) => {
                var orderId = record.orderIdList[index];
                record.orderId = orderId;
                return <div style={{padding:'2px 0'}}>
                    <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record, orderId); }}>{item}</a>
                </div>
            })

        }
    },
    {
        title: '转账流水号',
        dataIndex: 'transferNo',
    },
    {
        title: '班型',
        dataIndex: 'classTypeNameList',
        render: (text, record, index) => {
            return record.classTypeNameList.map((item, index) => {
               return <div> {item} </div>
            })
            
        }
    },
    {
        title: '学员姓名',
        width: 100,
        dataIndex: 'studentName',
    },
    {
        title: '证件号',
        dataIndex: 'certificateNo',
    },
    {
        title: '手机号',
        width: 120,
        dataIndex: 'mobile',
    },
    {
        title: '转账人',
        width: 100,
        dataIndex: 'transferMan',
    },
    {
        title: '附件',
        width: 100,
        dataIndex: 'filePath',
        render: (text,record) => {
            if(record.filePath!=null && record.filePath != ''){
                return <FileDownloader
                    apiUrl={'/edu/file/getFile'}//api下载地址
                    method={'post'}//提交方式
                    options={{ filePath: record.filePath }}//提交参数
                    title={'下载'}
                >
                </FileDownloader>
            }else{
                return '';
            }
        }

    },
    {
        title: '确认状态',
        width: 100,
        dataIndex: 'financeStatus',
        render: (text) => { return getDictionaryTitle(this.state.confirm_status, text) }
    },
    {
        title: '确认人',
        width: 100,
        dataIndex: 'financeName',
    },
    {
        title: '确认日期',
        width: 100,
        dataIndex: 'confirmDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '操作',
        width: 120,//可预知的数据长度，请设定固定宽度
        fixed: 'right',
        key: 'action',
        render: (text, record) => {
            return <DropDownButton>
                    <Button onClick={() => {
                        this.onLookView('Edit', record)
                    }}>拆分</Button>
                    <Button onClick={() => {
                        this.onLookView('View', record)
                    }}>查看</Button>
            </DropDownButton>
        }
    }];
    //获取条件列表
    fetch(params) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let confirmDateStart = condition.confirmDateStart;
        if(Array.isArray(confirmDateStart)){
            condition.confirmDateStart = formatMoment(confirmDateStart[0])
            condition.confirmDateEnd = formatMoment(confirmDateStart[1])
        }
        this.props.queryPageBysplitByStudentPayfee(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
            
        })
    };

    onHideModal=()=> {
        this.setState({
          isShowChooseProduct: false
        })
    }

    disabledEndDate = (endValue) => {
      var startValue = '';
    //财务确认日期限制 时间（ 待确认 ）
    //   if(this.state.lastDay){
    //     if(this.state.startTimeDay > this.state.lastDay){
    //         startValue = new Date(2018,8,1);
    //      }else{
    //         startValue = new Date(2018,7,1);
    //      }
         
    //      if (!endValue || !startValue) {
    //          return false;
    //      }
    //      return endValue.valueOf() < startValue.valueOf();
    //   }
      
    }
    
    onStudentView = (record) => {
        // this.onLookView("Manage", record)
        this.setState({
            isShowChooseProduct:true
        })
    }
    disabledSignStartDate = (signStartValue) => {
        const signEndValue = this.state.signEndValue;
        if (!signStartValue || !signEndValue) {
            return false;
        }
        return signStartValue.valueOf() > signEndValue.valueOf();
    }
  
    disabledSignEndDate = (signEndValue) => {
        const signStartValue = this.state.signStartValue;
        if (!signEndValue || !signStartValue) {
            return false;
        }
        return signEndValue.valueOf() <= signStartValue.valueOf();
    }
    handleSignStartOpenChange = (open) => {
        if (!open) {
            this.setState({ signEndOpen: true });
        }
    }
  
    handleSignEndOpenChange = (open) => {
        this.setState({ signEndOpen: open });
    }
    
    onSignStartChange = (value) => {
        this.onChange('signStartValue', value);
    }
  
    onSignEndChange = (value) => {
        this.onChange('signEndValue', value);
    }

    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }
  
    // disabledEndDate = (endValue) => {
    //     const startValue = this.state.startValue;
    //     if (!endValue || !startValue) {
    //         return false;
    //     }
    //     return endValue.valueOf() <= startValue.valueOf();
    // }


    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }
  
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
  
    onStartChange = (value) => {
        this.onChange('startValue', value);
    }
  
    onEndChange = (value) => {
        this.onChange('endValue', value);
    }

    //缴费方式参数处理
    onChangeWay = (value, selectedOptions) => {

        this.state.pagingSearch.payment = value;

        let paymentWay,sonPaymentWay;
        if(selectedOptions.props.parentValue){
        paymentWay = selectedOptions.props.parentValue;
        sonPaymentWay = value;
        }else{
        paymentWay = value;
        sonPaymentWay = selectedOptions.props.parentValue;
        }

        this.state.pagingSearch.paymentWay = paymentWay;
        this.state.pagingSearch.sonPaymentWay = sonPaymentWay;
        
        this.setState({
            pagingSearch: this.state.pagingSearch
        });

    }
    
    //浏览视图
    onLookView = (op, item, orderId) => {
        if(op == 'ViewOrderDetail' && orderId){
            item.orderId = orderId;
        }
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }else{
            this.onSearch();
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
    }

    //公司选择
    onZbPayeeTypeChange(value) {
        //共管账户
        this.props.getBankAccountByZbPayeeType(value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var _list = [];
                data.data.map(item => {
                    _list.push({
                        value: item.bankAccountId,
                        title: item.bankAccountName
                    });
                })
                this.setState({
                    bank_list: _list
                });
                this.props.form.resetFields(['bankAccountId'])
            }
        });
    }

    render() { 
        let block_content = <div></div>
        switch (this.state.editMode) {
            case 'ViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.studentId}
                    orderId={this.state.currentDataModel.orderId}
                    tab={3}
                />
                break;
            case "View":
            case "Confirm":
                block_content = <PaymentRecordSplitView viewCallback={this.onViewCallback}
                    {...this.state}
                    disabledEndDate={this.disabledEndDate}
                />
                break;
            case "Edit":
                block_content = <PaymentRecordSplitEdit viewCallback={this.onViewCallback}
                    {...this.state}
                    disabledEndDate={this.disabledEndDate}
                />
                break;
            case "Manage":
            default:
                const { getFieldDecorator } = this.props.form;
                let extendButtons = [];
                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form" >
                                    <Row gutter={24}>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="公司">
                                                {getFieldDecorator('zbPayeeType', {
                                                    initialValue: this.state.pagingSearch.zbPayeeType,
                                                })(
                                                    <Select
                                                        onChange={(value) => this.onZbPayeeTypeChange(value)}
                                                    >
                                                        <Option value="">全部</Option>
                                                        {this.state.zb_payee_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="收费方">
                                                {getFieldDecorator('payeeType', {
                                                    initialValue: this.state.pagingSearch.payeeType,
                                                })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.payee_type.map((item, index) => {
                                                            return <Option value={item.value}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="收费账户">
                                                {getFieldDecorator('bankAccountId', {
                                                    initialValue: this.state.pagingSearch.bankAccountId,
                                                })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.bank_list.map((item, index) => {
                                                            return <Option value={item.value}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>


                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="收款分部">
                                                {getFieldDecorator('branchId', {
                                                    initialValue: this.state.pagingSearch.branchId,
                                                })(
                                                    <SelectFBOrg scope={'my'} hideAll={false} />
                                                    )}
                                            </FormItem>
                                        </Col>

                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="业绩分部">
                                                {getFieldDecorator('benefitBranchId', {
                                                    initialValue: this.state.pagingSearch.benefitBranchId,
                                                })(
                                                    <SelectFBOrg scope={'my'} hideAll={false} />
                                                    )}
                                            </FormItem>
                                        </Col> 
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="学生姓名">
                                                {getFieldDecorator('realName', {
                                                    initialValue: this.state.pagingSearch.realName,
                                                })(
                                                    <Input placeholder="学生姓名"/>
                                                    )}
                                            </FormItem>
                                        </Col>

                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="学员证件号">
                                                {getFieldDecorator('certificateNo', {
                                                    initialValue: this.state.pagingSearch.certificateNo,
                                                })(
                                                    <Input placeholder="学员证件号"/>
                                                    )}
                                            </FormItem>
                                        </Col>

                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="学员手机号">
                                                {getFieldDecorator('mobile', {
                                                    initialValue: this.state.pagingSearch.mobile,
                                                })(
                                                    <Input placeholder="学员手机号"/>
                                                    )}
                                            </FormItem>
                                        </Col>

                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="提交人">
                                                {getFieldDecorator('createUName', {
                                                    initialValue: this.state.pagingSearch.createUName,
                                                })(
                                                    <Input placeholder="提交人"/>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="订单号">
                                                {getFieldDecorator('orderSn', {
                                                    initialValue: this.state.pagingSearch.orderSn,
                                                })(
                                                    <Input placeholder="订单号"/>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="转账人">
                                                {getFieldDecorator('transferMan', {
                                                    initialValue: this.state.pagingSearch.transferMan,
                                                })(
                                                    <Input placeholder="转账人"/>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem {...searchFormItemLayout} label="财务确认人">
                                                {getFieldDecorator('financeUNameLike', {
                                                    initialValue: this.state.pagingSearch.financeUNameLike,
                                                })(
                                                    <Input placeholder="财务确认人"/>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="财务确认日期">
                                                {getFieldDecorator('confirmDateStart', { initialValue: this.state.pagingSearch.confirmDateStart?[moment(this.state.pagingSearch.confirmDateStart,dateFormat),moment(this.state.pagingSearch.confirmDateEnd,dateFormat)]:[] })(
                                                    <RangePicker style={{width:220}}/>
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                        
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.data_list}//数据
                                bordered
                                rowKey={record => record.studentPayfeeId}//主键
                                scroll={{ x: 2500 }}
                                rowClassName={record => record.zbPayeeTypeIsEquals==false?'highLight_column':''}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={24} className={'search-paging-control'}>
                                        <Pagination showSizeChanger
                                            current={this.state.pagingSearch.currentPage}
                                            defaultPageSize={this.state.pagingSearch.pageSize}
                                            pageSize={this.state.pagingSearch.pageSize}
                                            onShowSizeChange={this.onShowSizeChange}
                                            onChange={this.onPageIndexChange}
                                            showTotal={(total) => { return `共${total}条数据`; }}
                                            total={this.state.totalRecord} />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(PaymentRecordSplit);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        queryPageBysplitByStudentPayfee: bindActionCreators(queryPageBysplitByStudentPayfee, dispatch),
        getBankAccountByZbPayeeType: bindActionCreators(getBankAccountByZbPayeeType, dispatch),
        getStudentPayfeeConfirmBatchConfirm:bindActionCreators(getStudentPayfeeConfirmBatchConfirm,dispatch),
        selectConfirmLastDay:bindActionCreators(selectConfirmLastDay,dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
