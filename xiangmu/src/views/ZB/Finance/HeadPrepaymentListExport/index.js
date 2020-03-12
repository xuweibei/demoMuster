/*
订单业绩相关调整
*/

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Modal, DatePicker, InputNumber
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
import { loadDictionary } from '@/actions/dic';
import FileDownloader from '@/components/FileDownloader';
import {
    discountRuleQuery, discountRuleCreate, discountRuleUpdate,
    discountRuleExpiryDateBatchUpdate,
    discountRuleProductQuery, discountRuleNotProductQuery,
    discountRuleProductAdd, discountRuleProductDelete,
    discountRuleMutexQuery, discountRuleMutexSet
} from '@/actions/recruit';
//getStudentAskBenefitList
import { getStudentDistingushList } from '@/actions/enrolStudent';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectArea from '@/components/BizSelect/SelectArea';
import ContentBox from '@/components/ContentBox';
class HeadPrepaymentListExport extends React.Component {
    constructor() {
        super();
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.onSearch = onSearch.bind(this);

        let timeArr = timestampToTime(new Date().getTime()).split('-');
        let startTimeYear = timeArr[0];
        let startTimeMonth = timeArr[1];
        let startTimeDay = '01';

        this.state = {
            editMode: '',
            pagingSearch: {
                confirmDateStart: startTimeYear+'-'+startTimeMonth+'-'+startTimeDay
            },
            data: [],
            loading: false,
            startValue: null,
            endValue: null,
            endOpen: false,
        };
    }
    componentWillMount() {
        console.log("CoursePlanAudit componentWillMount");
        this.loadBizDictionary(['zb_payee_type', 'student_change_type']);

    }
    compoentDidMount() {
        console.log("CoursePlanAudit componentDidMount");
    }

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }
  
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }
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
    
    onExtendClick=(downloadHandler)=>{
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);
            let arrStart = values.confirmDateStart;
            if(Array.isArray(arrStart)){
                values.confirmDateStart = formatMoment(arrStart[0])
                values.confirmDateEnd = formatMoment(arrStart[1])
            }
            let pagingSearch = { ...this.state.pagingSearch, ...values };
            if(!Array.isArray(arrStart)){
                pagingSearch.confirmDateStart = pagingSearch.confirmDateStart && pagingSearch.confirmDateStart.length ? pagingSearch.confirmDateStart : formatMoment(pagingSearch.confirmDateStart);//日期控件处理
                pagingSearch.confirmDateEnd=formatMoment(pagingSearch.confirmDateEnd);
            }
            //调用下载
            downloadHandler(pagingSearch);
        });
    }
    
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        console.log(this.state.pagingSearch)
        switch (this.state.editMode) {
            default:
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false,    // Column configuration not to be checked
                    }),
                };
                let extendButtons = [];
                extendButtons.push(<FileDownloader
                    apiUrl={'/edu/headquartersPrepayment/exportList'}//api下载地址
                    method={'get'}//提交方式
                    options={this.state.pagingSearch}//提交参数
                    clickCallback ={this.onExtendClick}
                    title={'导出'}
                >
                </FileDownloader>);
                block_content = (
                    <div>
                        <ContentBox bottomButton={extendButtons}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form
                                    className="search-form"
                                >
                                    <Row justify="center" gutter={24} align="middle" type="flex">

                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'签约公司'} >
                                                {getFieldDecorator('zbPayeeType', { initialValue: '' })
                                                    (
                                                    <Select >
                                                        <Option value="">全部</Option>
                                                        {this.state.zb_payee_type.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>

                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="缴费日期">
                                                {getFieldDecorator('confirmDateStart', { initialValue:[moment(this.state.pagingSearch.confirmDateStart, dateFormat)]})(
                                                    <RangePicker
                                                    disabledDate={this.disabledStartDate}
                                                    format={dateFormat}
                                                    onChange={this.onStartChange}
                                                    onOpenChange={this.handleStartOpenChange}
                                                    style={{width:220}}  
                                                    />
                                                )}
                                            </FormItem>
                                </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'请选择分部'}
                                            >
                                                {getFieldDecorator('branchId', {
                                                    initialValue: ''
                                                })(
                                                    <SelectFBOrg scope='my' hideAll={false} onChange={(value) => {
                                                        this.setState({ branchId: value });
                                                        setTimeout(() => {
                                                            this.props.form.resetFields(['regionId']);
                                                        }, 500);
                                                    }} />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="请选择区域"
                                            >
                                                {getFieldDecorator('regionId', {
                                                    initialValue: '',
                                                })(
                                                    <SelectArea scope='all' branchId={this.state.branchId} hideAll={true} showCheckBox={false} />
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                    </div>

                )
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(HeadPrepaymentListExport);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
