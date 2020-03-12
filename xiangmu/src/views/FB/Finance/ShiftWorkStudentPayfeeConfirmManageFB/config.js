/**
 * （总部）财务确认详细信息
 * 2018-5-31
 * suicaijiao
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, Cascader,DatePicker
} from 'antd';
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;

const dateFormat = 'YYYY-MM-DD';
import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, formatMoney, timestampToTime, convertTextToHtml,formatMoment } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { orgBranchList, allUniversityList, getUserList } from '@/actions/admin';
import { getStudentPayfeeInfoById, ShiftWorkStudentPayfeeConfirmBatchConfirm, updateConfirmStudentPayfee } from '@/actions/finance';
import FileDownloader from '@/components/FileDownloader';

//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

class StudentPayfeeConfirmConfirm extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        
        let timeArr = timestampToTime(new Date().getTime()).split('-');
        let startTimeYear = timeArr[0];
        let startTimeMonth = timeArr[1];
        let startTimeDay = timeArr[2];

        this.state = {
            confirmDate:startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
            endOpen:false,
            dataModel:
            { ...props.currentDataModel, stageList: [] }
        };
    }
    componentWillMount() {
        //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
        this.loadBizDictionary(['payee_type', 'zb_payee_type', 'confirm_status', 'payment_way', 'dic_YesNo','pay_way']);

        if (this.props.currentDataModel.studentPayfeeId) {
            this.props.getStudentPayfeeInfoById(this.props.currentDataModel.studentPayfeeId).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                    this.setState({
                        dataModel: data.data
                    })
                }
            });
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }

    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }
    
    onEndChange = (value) => {
        this.onChange('endValue', value);
    }
    
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
    
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            let confir = values.confirmDate
            if(!confir){
                message.warning('请选择确认日期!');
                return;
            }
            that.setState({ loading: true });
            if(this.props.editMode == 'Confirm'){
                this.props.ShiftWorkStudentPayfeeConfirmBatchConfirm({ studentPayfeeIds: this.props.currentDataModel.studentPayfeeId,confirmDate:formatMoment(confir) }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    that.setState({ loading: false });
                    if (data.state === 'success') {
                        message.success('确认成功！');
                        this.props.viewCallback(this.props.currentDataModel);
                    }
                });
            }else{
                this.props.updateConfirmStudentPayfee({ studentPayfeeId: this.props.currentDataModel.studentPayfeeId,confirmDate:formatMoment(confir) }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    that.setState({ loading: false });
                    if (data.state === 'success') {
                        message.success('修改成功！');
                        this.props.viewCallback(this.props.currentDataModel);
                    }
                });
            }
            
        })

    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}财务确认详细信息`;
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
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'Confirm') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>财务确认</Button>
                <span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else if(this.props.editMode == 'Edit') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>财务修改</Button>
                <span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    render() {
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let stageArry = [];
        if (this.state.editMode == 'ViewOrderDetail') {
            block_content = <OrderDetailView viewCallback={this.onViewCallback}
                studentId={this.state.currentDataModel.studentId}
                orderId={this.state.currentDataModel.orderId}
                tab={3}
            />
            return block_content;
        }
        switch (this.props.editMode) {
            case "View":
            case "Confirm":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="姓名">
                                    {this.state.dataModel.studentName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="证件号">
                                    {this.state.dataModel.certificateNo}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="订单号">
                                    {
                                        this.state.dataModel.orderSnList.map((item, index) => {
                                            var orderId = this.state.dataModel.orderIdList[index];
                                            var recode = {};
                                            recode.orderId = orderId;
                                            recode.studentId = this.state.dataModel.studentId
                                            return <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', recode); }}>{item} &nbsp;&nbsp;</a>
                                        })
                                    }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="手机号">
                                    {this.state.dataModel.mobile}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="班型">
                                    {this.state.dataModel.classTypeNames}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="订单类型">
                                    {this.state.dataModel.orderTypeNames}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="大客户">
                                    {this.state.dataModel.partnerNames}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="公司">
                                    {getDictionaryTitle(this.state.zb_payee_type, this.state.dataModel.zbPayeeType)}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="收费方">
                                    {getDictionaryTitle(this.state.payee_type, this.state.dataModel.payeeType)}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="收费账户">
                                    {this.state.dataModel.bankAccountName}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="业绩分部">
                                    {this.state.dataModel.benefitBranchName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="收费分部">
                                    {this.state.dataModel.branchName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="缴费金额（¥）">
                                    <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.money)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="缴费日期">
                                    {timestampToTime(this.state.dataModel.payDate)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="缴费方式">
                                    {getDictionaryTitle(this.state.payment_way, this.state.dataModel.paymentWay)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="提交人">
                                    {this.state.dataModel.createUName}
                                </FormItem>
                            </Col>
                            {
                                this.state.dataModel.paymentWay == 2 ?
                                <div>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="支付流水号">
                                            {this.state.dataModel.otherPayNo}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="POS 终端编号">
                                            {this.state.dataModel.posCode}
                                        </FormItem>
                                    </Col>
                                </div>
                                : ''
                            }

                            {
                                this.state.dataModel.paymentWay == 1 ?
                                <div>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="交易凭证号">
                                            {this.state.dataModel.changeTypeName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="类型">
                                            {getDictionaryTitle(this.state.pay_way, this.state.dataModel.payWay)}
                                        </FormItem>
                                    </Col>
                                </div>
                                : ''
                            }
                            
                            {
                                this.state.dataModel.paymentWay == 3 ?
                                <div>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="转账人">
                                            {this.state.dataModel.transferMan}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="附件">
                                            {
                                                (this.state.dataModel.filePath != null && this.state.dataModel.filePath != '') &&
                                                <FileDownloader
                                                    apiUrl={'/edu/file/getFile'}//api下载地址
                                                    method={'post'}//提交方式
                                                    options={{ filePath: this.state.dataModel.filePath }}//提交参数
                                                    title={'下载'}
                                                >
                                                </FileDownloader>
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem {...searchFormItemLayout24} label="转账备注">
                                            {this.state.dataModel.remark}
                                        </FormItem>
                                    </Col>
                                </div>
                                : ''
                            }
                            
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="财务确认情况">
                                    {getDictionaryTitle(this.state.confirm_status, this.state.dataModel.financeStatus)}
                                </FormItem>
                            </Col>
                            {this.props.editMode=='Confirm'&&
                                    <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="财务确认日期">
                                    {getFieldDecorator('confirmDate', {
                                            initialValue: dataBind(timestampToTime(this.state.confirmDate), true),
                                            rules: [{
                                            required: true, message: '请选择日期!',
                                            }],
                                        })(
                                            <DatePicker
                                            disabledDate={this.props.disabledEndDate}
                                            format={dateFormat}
                                            onChange={this.onEndChange}
                                            open={this.state.endOpen}
                                            onOpenChange={this.handleEndOpenChange}
                                            placeholder='确认日期'
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            }

                            {this.props.editMode=='Edit'&&
                                    <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="财务确认日期">
                                    {getFieldDecorator('confirmDate', {
                                            initialValue: dataBind(timestampToTime(this.state.dataModel.confirmDate), true),
                                            rules: [{
                                            required: true, message: '请选择日期!',
                                            }],
                                        })(
                                            <DatePicker
                                            disabledDate={this.props.disabledEndDate}
                                            format={dateFormat}
                                            onChange={this.onEndChange}
                                            open={this.state.endOpen}
                                            onOpenChange={this.handleEndOpenChange}
                                            placeholder='确认日期'
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            }
                            
                            {this.props.editMode=='View'&&
                                    <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="财务确认日期">
                                        {timestampToTime(this.state.dataModel.confirmDate)}
                                    </FormItem>
                                </Col>
                            }
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="财务确认人">
                                    {this.state.dataModel.financeName}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                );
                break;
        }

        return (
            <div>
                {!this.state.showList && <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                }
                {this.state.showList &&
                    <Row>
                        <Col span={24} className="center">
                            <Button onClick={() => {
                                this.setState({ showList: false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
                }
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(StudentPayfeeConfirmConfirm);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getStudentPayfeeInfoById: bindActionCreators(getStudentPayfeeInfoById, dispatch),
        ShiftWorkStudentPayfeeConfirmBatchConfirm: bindActionCreators(ShiftWorkStudentPayfeeConfirmBatchConfirm, dispatch),
        updateConfirmStudentPayfee: bindActionCreators(updateConfirmStudentPayfee, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
