/**
 * （分部）预收款情况及业绩归属导出
 * suicaijiao
 */
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
import SelectArea from '@/components/BizSelect/SelectArea'
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import moment from 'moment';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney, formatMoment } from '@/utils';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';


//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getCourseStudentRefundManagerList, deleteCourseStudentRefundManager } from '@/actions/course';
import SelectItem from '@/components/BizSelect/SelectItem';

//操作按钮
import DropDownButton from '@/components/DropDownButton';

const searchFormItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
class BranchPrepaymentListExport extends React.Component {

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
        let startTimeDay = '01';
        
        this.state = {
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                confirmDateStart: startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            startValue: null,
            endValue: null,
            endOpen: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项: 审核状态
        this.loadBizDictionary(['zb_payee_type', 'student_change_type']);
    }

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

        }
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
            pagingSearch.financeStatus = 2;

            //调用下载
            downloadHandler(pagingSearch);
        });
    }
    onExtendClickAll=(downloadHandler)=>{
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
            pagingSearch.financeStatus = '';
            
            //调用下载
            downloadHandler(pagingSearch);
        });
    }

    render() {
        let block_content = <div></div>
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];

        extendButtons.push(<div style={{padding:'0 10px'}}><FileDownloader
            apiUrl={'/edu/branchPrepayment/exportList'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            clickCallback ={this.onExtendClick}
            title={'导出已确认'}
        ></FileDownloader></div>);

        extendButtons.push(<div style={{padding:'0 10px'}}><FileDownloader
            apiUrl={'/edu/branchPrepayment/exportList'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            clickCallback ={this.onExtendClickAll}
            title={'导出全部'}
        ></FileDownloader></div>);

        block_content = (
            <div>
                {/* 搜索表单 */}
                <ContentBox bottomButton={extendButtons}>
                    {!this.state.seachOptionsCollapsed &&
                        <Form className="search-form" >
                            <Row gutter={24}>
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
                                    <FormItem {...searchFormItemLayout} label="区域">
                                        {getFieldDecorator('status', {
                                            initialValue: ''
                                        })(
                                            getFieldDecorator('regionId', { initialValue: this.state.pagingSearch.benefitRegionId })(
                                                <SelectArea scope='my' hideAll={false} showCheckBox={false} />
                                            )
                                            )}
                                    </FormItem>
                                </Col>

                                <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="日期">
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

                            </Row>
                        </Form>
                    }
                </ContentBox>

            </div>
        );
        return block_content;
    }
}
//表单组件 封装
const WrappedManage = Form.create()(BranchPrepaymentListExport);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getCourseStudentRefundManagerList: bindActionCreators(getCourseStudentRefundManagerList, dispatch),
        deleteCourseStudentRefundManager: bindActionCreators(deleteCourseStudentRefundManager, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
